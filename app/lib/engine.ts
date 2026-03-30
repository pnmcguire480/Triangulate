// ============================================================
// The Triangulate Engine — Entity-Graph Convergence
// No AI. Pure math. O(n) clustering.
//
// Inspired by: search engine inverted indexes, GPS triangulation,
// epidemiological graph clustering.
//
// "Trust isn't found in a single source. It emerges from the
//  geometry of convergence across adversarial ones."
// ============================================================

import { prisma } from "./prisma";
import { extractEntities, type Entity } from "./entities";

const LOOKBACK_HOURS = 72;
const MIN_SHARED_ENTITIES = 2;    // articles must share 2+ weighted entities to be candidates
const PAIR_SCORE_THRESHOLD = 0.35; // minimum score for a candidate pair to be "same story"
const TEMPORAL_DECAY_HOURS = 72;   // articles older than this have 0 temporal proximity
const MAX_CLUSTER_SIZE = 25;       // safety cap — no cluster should have more than 25 articles

// ============================================================
// Step 1-2: Entity extraction + TF-IDF weighting
// ============================================================

interface ArticleWithEntities {
  id: string;
  title: string;
  publishedAt: Date;
  sourceId: string;
  entities: Entity[];
}

interface EntityWeight {
  entity: string;
  weight: number; // log(N / df) — higher = more specific
  type: Entity["type"];
}

function computeEntityWeights(
  articles: ArticleWithEntities[]
): Map<string, EntityWeight> {
  const docFreq = new Map<string, number>(); // entity → number of articles it appears in
  const entityTypes = new Map<string, Entity["type"]>();

  for (const article of articles) {
    const seen = new Set<string>();
    for (const e of article.entities) {
      if (!seen.has(e.normalized)) {
        docFreq.set(e.normalized, (docFreq.get(e.normalized) || 0) + 1);
        entityTypes.set(e.normalized, e.type);
        seen.add(e.normalized);
      }
    }
  }

  const N = articles.length;
  const weights = new Map<string, EntityWeight>();

  for (const [entity, df] of docFreq) {
    // Entities in only 1 article can't help clustering
    if (df < 2) continue;

    // Entities appearing in >15% of articles are too common to be useful for clustering
    // (e.g., "Trump" in 200/2500 articles, "Iran" in 300/2500)
    const frequency = df / N;
    if (frequency > 0.15) continue;

    const weight = Math.log(N / df);
    weights.set(entity, {
      entity,
      weight,
      type: entityTypes.get(entity) || "term",
    });
  }

  return weights;
}

// ============================================================
// Step 3: Inverted Index
// ============================================================

function buildInvertedIndex(
  articles: ArticleWithEntities[],
  weights: Map<string, EntityWeight>
): Map<string, Set<number>> {
  // entity → set of article indexes
  const index = new Map<string, Set<number>>();

  for (let i = 0; i < articles.length; i++) {
    for (const e of articles[i].entities) {
      // Only index entities that appear in 2+ articles (have a weight)
      if (!weights.has(e.normalized)) continue;

      if (!index.has(e.normalized)) {
        index.set(e.normalized, new Set());
      }
      index.get(e.normalized)!.add(i);
    }
  }

  return index;
}

// ============================================================
// Step 4-5: Candidate pairs + scoring
// ============================================================

function temporalProximity(a: Date, b: Date): number {
  const diffHours = Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);
  if (diffHours > TEMPORAL_DECAY_HOURS) return 0;
  return 1 - (diffHours / TEMPORAL_DECAY_HOURS);
}

interface CandidatePair {
  i: number;
  j: number;
  score: number;
  sharedEntities: string[];
}

function findAndScorePairs(
  articles: ArticleWithEntities[],
  index: Map<string, Set<number>>,
  weights: Map<string, EntityWeight>
): CandidatePair[] {
  // For each article, find others that share high-weight entities
  const pairScores = new Map<string, { score: number; entities: string[] }>();

  for (let i = 0; i < articles.length; i++) {
    const myEntities = new Set(articles[i].entities.map((e) => e.normalized));
    const candidateCounts = new Map<number, string[]>(); // articleIndex → shared entities

    for (const entityName of myEntities) {
      const w = weights.get(entityName);
      if (!w) continue;

      const articlesWithEntity = index.get(entityName);
      if (!articlesWithEntity) continue;

      for (const j of articlesWithEntity) {
        if (j <= i) continue; // avoid duplicates (only check i < j)
        if (!candidateCounts.has(j)) candidateCounts.set(j, []);
        candidateCounts.get(j)!.push(entityName);
      }
    }

    // Score candidates that share enough entities
    for (const [j, sharedEntities] of candidateCounts) {
      if (sharedEntities.length < MIN_SHARED_ENTITIES) continue;

      const pairKey = `${i}:${j}`;

      // Weighted entity overlap
      let entityScore = 0;
      let maxPossible = 0;
      for (const e of sharedEntities) {
        entityScore += weights.get(e)?.weight || 0;
      }
      for (const e of myEntities) {
        maxPossible += weights.get(e)?.weight || 0;
      }
      const normalizedEntityScore = maxPossible > 0 ? entityScore / maxPossible : 0;

      // Temporal proximity
      const tempScore = temporalProximity(
        articles[i].publishedAt,
        articles[j].publishedAt
      );

      // Source diversity bonus: different sources = more interesting
      const diverseSource = articles[i].sourceId !== articles[j].sourceId ? 1.0 : 0.3;

      // Combined score
      const score =
        normalizedEntityScore * 0.5 +
        tempScore * 0.25 +
        diverseSource * 0.25;

      if (score >= PAIR_SCORE_THRESHOLD) {
        pairScores.set(pairKey, { score, entities: sharedEntities });
      }
    }
  }

  return Array.from(pairScores.entries()).map(([key, val]) => {
    const [i, j] = key.split(":").map(Number);
    return { i, j, score: val.score, sharedEntities: val.entities };
  });
}

// ============================================================
// Step 6: Union-Find Clustering
// ============================================================

class UnionFind {
  parent: number[];
  rank: number[];

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  // Track cluster sizes for cap enforcement
  size: number[];

  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
    this.size = new Array(n).fill(1);
  }

  getSize(x: number): number {
    return this.size[this.find(x)];
  }

  union(x: number, y: number): boolean {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return true;

    // Enforce cluster size cap
    if (this.size[px] + this.size[py] > MAX_CLUSTER_SIZE) return false;

    // union by rank
    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
      this.size[py] += this.size[px];
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
      this.size[px] += this.size[py];
    } else {
      this.parent[py] = px;
      this.size[px] += this.size[py];
      this.rank[px]++;
    }
    return true;
  }
}

function clusterPairs(
  articles: ArticleWithEntities[],
  pairs: CandidatePair[]
): Map<number, number[]> {
  const uf = new UnionFind(articles.length);

  for (const pair of pairs) {
    uf.union(pair.i, pair.j);
  }

  // Group articles by their root
  const clusters = new Map<number, number[]>();
  for (let i = 0; i < articles.length; i++) {
    const root = uf.find(i);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root)!.push(i);
  }

  return clusters;
}

// ============================================================
// Step 7: Story Significance Ranking
// ============================================================

export interface RankedStory {
  articles: { id: string; title: string }[];
  bestTitle: string;
  significance: number;
  articleCount: number;
  entitySignature: string[]; // top entities for this cluster
  isMultiSource: boolean;
}

function pickBestTitle(titles: string[]): string {
  // Prefer mid-length, clean titles (40-120 chars)
  return [...titles]
    .map((t) => t.replace(/\s+/g, " ").trim())
    .sort((a, b) => {
      const scoreA = a.length >= 40 && a.length <= 120 ? 0 : Math.abs(80 - a.length);
      const scoreB = b.length >= 40 && b.length <= 120 ? 0 : Math.abs(80 - b.length);
      return scoreA - scoreB;
    })[0];
}

function rankClusters(
  clusters: Map<number, number[]>,
  articles: ArticleWithEntities[],
  weights: Map<string, EntityWeight>
): RankedStory[] {
  const stories: RankedStory[] = [];

  for (const [, indices] of clusters) {
    const clusterArticles = indices.map((i) => articles[i]);
    const articleCount = clusterArticles.length;
    const isMultiSource = articleCount >= 2;

    // Collect top entities for this cluster
    const entityCounts = new Map<string, number>();
    for (const a of clusterArticles) {
      for (const e of a.entities) {
        const w = weights.get(e.normalized);
        if (w) {
          entityCounts.set(e.normalized, (entityCounts.get(e.normalized) || 0) + w.weight);
        }
      }
    }
    const topEntities = [...entityCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([e]) => e);

    // Source diversity: unique sourceIds
    const uniqueSources = new Set(clusterArticles.map((a) => a.sourceId));

    // Significance formula
    const significance =
      Math.sqrt(articleCount) *           // diminishing returns on count
      (uniqueSources.size / articleCount) * // source diversity ratio
      (isMultiSource ? 2.0 : 0.5);         // multi-source boost

    stories.push({
      articles: clusterArticles.map((a) => ({ id: a.id, title: a.title })),
      bestTitle: pickBestTitle(clusterArticles.map((a) => a.title)),
      significance,
      articleCount,
      entitySignature: topEntities,
      isMultiSource,
    });
  }

  // Sort by significance (highest first)
  stories.sort((a, b) => b.significance - a.significance);
  return stories;
}

// ============================================================
// Main Entry Point: Run the full engine
// ============================================================

export async function runEngine(): Promise<{
  storiesCreated: number;
  articlesAssigned: number;
  multiSourceStories: number;
  entitiesExtracted: number;
  pairsFound: number;
  signalsFixed: number;
}> {
  const since = new Date(Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000);

  const rawArticles = await prisma.article.findMany({
    where: { storyId: null, publishedAt: { gte: since } },
    select: { id: true, title: true, publishedAt: true, sourceId: true },
  });

  if (rawArticles.length === 0) {
    return { storiesCreated: 0, articlesAssigned: 0, multiSourceStories: 0, entitiesExtracted: 0, pairsFound: 0, signalsFixed: 0 };
  }

  console.log(`[engine] Processing ${rawArticles.length} unclustered articles...`);

  // Step 1: Extract entities
  const articles: ArticleWithEntities[] = rawArticles.map((a) => ({
    ...a,
    entities: extractEntities(a.title),
  }));

  const totalEntities = articles.reduce((sum, a) => sum + a.entities.length, 0);
  console.log(`[engine] Extracted ${totalEntities} entities (avg ${(totalEntities / articles.length).toFixed(1)}/article)`);

  // Step 2: Compute weights
  const weights = computeEntityWeights(articles);
  console.log(`[engine] ${weights.size} weighted entities (appearing in 2+ articles)`);

  // Step 3: Build inverted index
  const index = buildInvertedIndex(articles, weights);

  // Step 4-5: Find and score candidate pairs
  const pairs = findAndScorePairs(articles, index, weights);
  console.log(`[engine] Found ${pairs.length} candidate pairs`);

  // Step 6: Cluster via Union-Find
  const clusters = clusterPairs(articles, pairs);

  // Step 7: Rank
  const ranked = rankClusters(clusters, articles, weights);
  const multiSource = ranked.filter((s) => s.isMultiSource);

  console.log(`[engine] ${ranked.length} stories (${multiSource.length} multi-source)`);
  for (const s of multiSource.slice(0, 10)) {
    console.log(`  [${s.articleCount} articles] ${s.bestTitle.slice(0, 80)}`);
    console.log(`    entities: ${s.entitySignature.join(", ")}`);
  }

  // Persist to database
  let storiesCreated = 0;
  let articlesAssigned = 0;

  for (const story of ranked) {
    try {
      const dbStory = await prisma.story.create({
        data: {
          generatedTitle: story.bestTitle,
          ...(!story.isMultiSource && { trustSignal: "SINGLE_SOURCE" }),
        },
      });

      await prisma.article.updateMany({
        where: { id: { in: story.articles.map((a) => a.id) } },
        data: { storyId: dbStory.id },
      });

      storiesCreated++;
      articlesAssigned += story.articles.length;
    } catch (err) {
      console.error("[engine] Failed to persist story:", err);
    }
  }

  // Integrity check: fix any story with SINGLE_SOURCE but 2+ articles
  const mismatched = await prisma.story.findMany({
    where: { trustSignal: "SINGLE_SOURCE" },
    include: { _count: { select: { articles: true } } },
  });
  const fixed = mismatched.filter((s) => s._count.articles >= 2);
  if (fixed.length > 0) {
    await prisma.story.updateMany({
      where: { id: { in: fixed.map((s) => s.id) } },
      data: { trustSignal: "CONTESTED", lastAnalyzedAt: null },
    });
    console.log(`[engine] Fixed ${fixed.length} stories with wrong trust signal`);
  }

  return {
    storiesCreated,
    articlesAssigned,
    multiSourceStories: multiSource.length,
    entitiesExtracted: totalEntities,
    pairsFound: pairs.length,
    signalsFixed: fixed.length,
  };
}
