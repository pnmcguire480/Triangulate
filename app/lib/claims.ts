// ============================================================
// Claim Extraction & Deduplication
// Chunk 5: Core product logic
// ============================================================

import { askForTask } from './ai';

interface ArticleForClaims {
  id: string;
  title: string;
  sourceId: string;
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

// Extract 3-8 factual claims from a batch of article titles in a story
export async function extractClaims(
  articles: ArticleForClaims[]
): Promise<ExtractedClaim[]> {
  const articleList = articles
    .map((a, i) => `[${i}] "${a.title}"`)
    .join('\n');

  const system = `You are a factual claim extractor for a news convergence engine. Extract specific, verifiable factual claims from news headlines. Each claim should be a single atomic fact — not an opinion, not a prediction, not editorial framing.

Rules:
- Extract 3-12 claims TOTAL from this set of headlines (not per article)
- Only extract claims EXPLICITLY STATED in the headlines. Do not infer facts not present in the text.
- FACTUAL claims are verifiable statements of fact (dates, numbers, actions, events)
- EVALUATIVE claims are judgments, characterizations, or interpretations
- The "quote" field should contain the phrase from the headline that supports the claim
- Return valid JSON only, no explanation, no markdown fences`;

  const user = `Extract factual claims from these article headlines about the same news event. For each claim, identify which article(s) support it.

${articleList}

Return JSON array:
[{"claimText": "...", "claimType": "FACTUAL"|"EVALUATIVE", "quote": "phrase from headline", "articleIndex": 0}]`;

  const { text: raw } = await askForTask('claim_extraction', system, user);
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return [];

  try {
    const parsed = JSON.parse(match[0]) as {
      claimText: string;
      claimType: 'FACTUAL' | 'EVALUATIVE';
      quote: string;
      articleIndex: number;
    }[];

    // Grounding check: verify claims have token overlap with source headlines
    const grounded = parsed
      .filter((c) => c.claimText && articles[c.articleIndex])
      .filter((c) => {
        const headline = articles[c.articleIndex].title.toLowerCase();
        const claimWords = c.claimText.toLowerCase().split(/\s+/).filter((w: string) => w.length > 3);
        if (claimWords.length === 0) return false;
        const overlap = claimWords.filter((w: string) => headline.includes(w)).length;
        const overlapRatio = overlap / claimWords.length;
        if (overlapRatio < 0.2) {
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
    // Fallback: treat each claim as unique
    return claims.map((c) => ({
      claimText: c.claimText,
      claimType: c.claimType,
      sources: [{ articleId: c.articleId, quote: c.quote, supports: true }],
    }));
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
    return claims.map((c) => ({
      claimText: c.claimText,
      claimType: c.claimType,
      sources: [{ articleId: c.articleId, quote: c.quote, supports: true }],
    }));
  }
}

// Detect references to primary source documents in article titles
export async function detectPrimaryDocs(
  articles: ArticleForClaims[]
): Promise<DetectedDoc[]> {
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
