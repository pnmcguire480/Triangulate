// ============================================================
// Claim Extraction & Deduplication v2
// Now uses contentSnippet for richer extraction
// Skips AI dedup for small claim sets
// Conditional primary doc detection
// ============================================================

import { askForTask } from './ai';

interface ArticleForClaims {
  id: string;
  title: string;
  sourceId: string;
  contentSnippet?: string | null;
}

interface ExtractedClaim {
  claimText: string;
  claimType: 'FACTUAL' | 'EVALUATIVE';
  quote: string;
  articleId: string;
}

interface DeduplicatedClaim {
  claimText: string;
  claimType: 'FACTUAL' | 'EVALUATIVE';
  sources: {
    articleId: string;
    quote: string;
    supports: boolean;
  }[];
}

interface DetectedDoc {
  docType: 'COURT_FILING' | 'LEGISLATION' | 'OFFICIAL_STATEMENT' | 'GOVERNMENT_DATA' | 'TRANSCRIPT' | 'RESEARCH' | 'OTHER';
  url: string;
  title: string;
}

// Keywords that suggest primary docs are referenced
const PRIMARY_DOC_KEYWORDS = /\b(court|ruling|judge|lawsuit|filing|legislation|bill|act|law|executive order|indictment|verdict|report|study|data|testimony|transcript|hearing|investigation|audit|census|survey)\b/i;

// Extract 3-12 factual claims from a batch of articles in a story
export async function extractClaims(
  articles: ArticleForClaims[]
): Promise<ExtractedClaim[]> {
  // Build article context: title + snippet for richer extraction
  const articleList = articles
    .map((a, i) => {
      const snippet = a.contentSnippet
        ? `\n   Excerpt: ${a.contentSnippet.slice(0, 300)}`
        : '';
      return `[${i}] "${a.title}"${snippet}`;
    })
    .join('\n\n');

  const hasSnippets = articles.some((a) => a.contentSnippet);

  const system = `You are a factual claim extractor for a news convergence engine. Extract specific, verifiable factual claims from news articles. Each claim should be a single atomic fact — not an opinion, not a prediction, not editorial framing.

Rules:
- Extract 3-12 claims TOTAL from this set of articles (not per article)
- Only extract claims EXPLICITLY STATED in the text. Do not infer facts not present.
- FACTUAL claims are verifiable statements of fact (dates, numbers, actions, events)
- EVALUATIVE claims are judgments, characterizations, or interpretations
- The "quote" field should contain the phrase from the article that supports the claim
- ${hasSnippets ? 'Use BOTH headlines and excerpts to find claims. Excerpts often contain specific facts (numbers, names, dates) not in the headline.' : 'Extract claims from headlines only.'}
- Return valid JSON only, no explanation, no markdown fences`;

  const user = `Extract factual claims from these articles about the same news event. For each claim, identify which article(s) support it.

${articleList}

Return JSON array:
[{"claimText": "...", "claimType": "FACTUAL"|"EVALUATIVE", "quote": "phrase from article", "articleIndex": 0}]`;

  const { text: raw, confidence: _confidence } = await askForTask('claim_extraction', system, user);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    const parsed = JSON.parse(match[0]) as {
      claimText: string;
      claimType: 'FACTUAL' | 'EVALUATIVE';
      quote: string;
      articleIndex: number;
    }[];

    // Grounding check: verify claims have token overlap with source content
    const grounded = parsed
      .filter((c) => c.claimText && articles[c.articleIndex])
      .filter((c) => {
        const article = articles[c.articleIndex];
        const sourceText = `${article.title} ${article.contentSnippet || ''}`.toLowerCase();
        const claimWords = c.claimText.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        if (claimWords.length === 0) return false;
        const overlap = claimWords.filter((w: string) => sourceText.includes(w)).length;
        const overlapRatio = overlap / claimWords.length;
        // Lower threshold since we now have richer source text
        if (overlapRatio < 0.15) {
          console.warn(`[claims] Discarding ungrounded claim: "${c.claimText.slice(0, 60)}" (${Math.round(overlapRatio * 100)}% overlap)`);
          return false;
        }
        return true;
      })
      .map((c) => ({
        claimText: c.claimText,
        claimType: c.claimType === 'EVALUATIVE' ? 'EVALUATIVE' : 'FACTUAL',
        quote: c.quote || '',
        articleId: articles[c.articleIndex].id,
      }));

    return grounded as ExtractedClaim[];
  } catch {
    console.error('Failed to parse claim extraction response');
    return [];
  }
}

// Deduplicate claims that say the same thing across different articles
export async function deduplicateClaims(
  claims: ExtractedClaim[]
): Promise<DeduplicatedClaim[]> {
  if (claims.length === 0) return [];
  if (claims.length === 1) {
    return [{
      claimText: claims[0].claimText,
      claimType: claims[0].claimType,
      sources: [{ articleId: claims[0].articleId, quote: claims[0].quote, supports: true }],
    }];
  }

  // For small claim sets (<=3), use simple string similarity instead of AI
  if (claims.length <= 3) {
    return fastDedup(claims);
  }

  const claimList = claims
    .map((c, i) => `[${i}] "${c.claimText}"`)
    .join('\n');

  const system = `You are a semantic deduplication engine. Group claims that assert the same fact, even if worded differently. Also identify if any claim contradicts another (supports: false). Return valid JSON only.`;

  const user = `Group these claims by semantic equivalence. Claims that say the same thing (even differently worded) go in the same group. Pick the clearest wording as the canonical claim text.

${claimList}

Return JSON array of groups:
[{"claimText": "canonical wording", "claimType": "FACTUAL"|"EVALUATIVE", "members": [{"index": 0, "supports": true}, {"index": 3, "supports": true}]}]`;

  const { text: raw } = await askForTask('semantic_dedup', system, user);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) {
    return fastDedup(claims);
  }

  try {
    const groups = JSON.parse(match[0]) as {
      claimText: string;
      claimType: 'FACTUAL' | 'EVALUATIVE';
      members: { index: number; supports: boolean }[];
    }[];

    return groups.map((g) => ({
      claimText: g.claimText,
      claimType: g.claimType === 'EVALUATIVE' ? 'EVALUATIVE' : 'FACTUAL',
      sources: g.members
        .filter((m) => claims[m.index])
        .map((m) => ({
          articleId: claims[m.index].articleId,
          quote: claims[m.index].quote,
          supports: m.supports !== false,
        })),
    }));
  } catch {
    console.error('Failed to parse deduplication response');
    return fastDedup(claims);
  }
}

// Fast string-similarity dedup for small claim sets (no AI call needed)
function fastDedup(claims: ExtractedClaim[]): DeduplicatedClaim[] {
  const groups: DeduplicatedClaim[] = [];
  const used = new Set<number>();

  for (let i = 0; i < claims.length; i++) {
    if (used.has(i)) continue;

    const group: DeduplicatedClaim = {
      claimText: claims[i].claimText,
      claimType: claims[i].claimType,
      sources: [{ articleId: claims[i].articleId, quote: claims[i].quote, supports: true }],
    };

    // Check remaining claims for similarity
    const wordsA = new Set(claims[i].claimText.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    for (let j = i + 1; j < claims.length; j++) {
      if (used.has(j)) continue;
      const wordsB = new Set(claims[j].claimText.toLowerCase().split(/\s+/).filter((w) => w.length > 3));

      let intersection = 0;
      for (const w of wordsA) {
        if (wordsB.has(w)) intersection++;
      }
      const union = wordsA.size + wordsB.size - intersection;
      const similarity = union > 0 ? intersection / union : 0;

      if (similarity > 0.5) {
        group.sources.push({
          articleId: claims[j].articleId,
          quote: claims[j].quote,
          supports: true,
        });
        used.add(j);
      }
    }

    groups.push(group);
    used.add(i);
  }

  return groups;
}

// Detect references to primary source documents — only when headlines suggest it
export async function detectPrimaryDocs(
  articles: ArticleForClaims[]
): Promise<DetectedDoc[]> {
  // Conditional detection: only call AI when headlines contain relevant keywords
  const hasDocKeywords = articles.some((a) => PRIMARY_DOC_KEYWORDS.test(a.title));
  if (!hasDocKeywords) return [];

  const titleList = articles.map((a) => `- "${a.title}"`).join('\n');

  const system = `You are a primary source detector. Identify when news headlines reference official documents, court filings, legislation, government data, transcripts, or research papers. Only return documents that are clearly referenced — do not guess or infer. Return valid JSON only. If no primary documents are referenced, return an empty array [].`;

  const user = `Do any of these headlines reference primary source documents?

${titleList}

Return JSON array (empty if none):
[{"docType": "COURT_FILING"|"LEGISLATION"|"OFFICIAL_STATEMENT"|"GOVERNMENT_DATA"|"TRANSCRIPT"|"RESEARCH"|"OTHER", "title": "document name", "url": ""}]

Note: URL will usually be empty since we only have headlines. That's fine.`;

  const { text: raw } = await askForTask('primary_doc', system, user);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    const docs = JSON.parse(match[0]) as DetectedDoc[];
    return docs.filter((d) => d.title && d.docType);
  } catch {
    return [];
  }
}

// Classify story topic from article titles
export async function classifyTopic(
  articles: ArticleForClaims[]
): Promise<string | null> {
  const titles = articles.map((a) => a.title).join(' | ');

  const system = `Classify this news story into exactly ONE topic. Return ONLY the topic word, nothing else.
Topics: POLITICS, ECONOMY, WORLD, TECHNOLOGY, SCIENCE, HEALTH, ENVIRONMENT, LEGAL, OTHER`;

  const user = titles;

  try {
    const { text } = await askForTask('claim_extraction', system, user);
    const topic = text.trim().toUpperCase().replace(/[^A-Z]/g, '');
    const validTopics = ['POLITICS', 'ECONOMY', 'WORLD', 'TECHNOLOGY', 'SCIENCE', 'HEALTH', 'ENVIRONMENT', 'LEGAL', 'OTHER'];
    return validTopics.includes(topic) ? topic : null;
  } catch {
    return null;
  }
}
