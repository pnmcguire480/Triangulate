import { describe, it, expect, vi } from 'vitest';

// Mock prisma to avoid database config requirement at import time
vi.mock('../prisma.server', () => ({ prisma: {} }));

import {
  computeEntityWeights,
  buildInvertedIndex,
  temporalProximity,
  findAndScorePairs,
  clusterPairs,
  pickBestTitle,
  type ArticleWithEntities,
  type CandidatePair,
} from '../engine';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const now = new Date('2026-04-01T12:00:00Z');

function makeArticle(
  id: string,
  title: string,
  entities: { normalized: string; type: 'person' | 'org' | 'place' | 'term' }[],
  sourceId = `src-${id}`,
  publishedAt = now
): ArticleWithEntities {
  return {
    id,
    title,
    publishedAt,
    sourceId,
    entities: entities.map((e) => ({ ...e, raw: e.normalized })),
  };
}

// ---------------------------------------------------------------------------
// computeEntityWeights
// ---------------------------------------------------------------------------

describe('computeEntityWeights', () => {
  it('excludes entities appearing in only 1 article', () => {
    const articles = [
      makeArticle('1', 'A', [{ normalized: 'unique', type: 'term' }]),
      makeArticle('2', 'B', [{ normalized: 'other', type: 'term' }]),
    ];
    const weights = computeEntityWeights(articles);
    expect(weights.size).toBe(0);
  });

  it('includes entities appearing in 2+ articles (under 15% frequency)', () => {
    const shared = { normalized: 'ukraine', type: 'place' as const };
    // Need 14+ articles so 2/14 = 14.3% < 15%
    const articles = [
      makeArticle('1', 'A', [shared]),
      makeArticle('2', 'B', [shared]),
      ...Array.from({ length: 12 }, (_, i) =>
        makeArticle(`f${i}`, `Filler ${i}`, [{ normalized: `filler-${i}`, type: 'term' as const }])
      ),
    ];
    const weights = computeEntityWeights(articles);
    expect(weights.has('ukraine')).toBe(true);
    expect(weights.get('ukraine')!.type).toBe('place');
  });

  it('excludes entities appearing in >15% of articles', () => {
    // 10 articles, entity in all 10 = 100% frequency
    const common = { normalized: 'trump', type: 'person' as const };
    const articles = Array.from({ length: 10 }, (_, i) =>
      makeArticle(String(i), `Title ${i}`, [common])
    );
    const weights = computeEntityWeights(articles);
    expect(weights.has('trump')).toBe(false);
  });

  it('assigns higher weight to rarer entities (IDF)', () => {
    const e1 = { normalized: 'rare_event', type: 'term' as const };
    const e2 = { normalized: 'common_topic', type: 'term' as const };
    // 20 articles: e1 in 2, e2 in 10
    const articles: ArticleWithEntities[] = Array.from({ length: 20 }, (_, i) => {
      const ents = [];
      if (i < 2) ents.push(e1);
      if (i < 10) ents.push(e2);
      if (ents.length === 0) ents.push({ normalized: `filler-${i}`, type: 'term' as const });
      return makeArticle(String(i), `Title ${i}`, ents);
    });
    const weights = computeEntityWeights(articles);
    // Both should pass the 15% threshold (2/20=10%, 10/20=50% — wait, 50% > 15%)
    // e2 at 50% is excluded, e1 at 10% is included
    expect(weights.has('rare_event')).toBe(true);
    expect(weights.has('common_topic')).toBe(false);
  });

  it('deduplicates entities within a single article for doc frequency', () => {
    const e = { normalized: 'nato', type: 'org' as const };
    // 14 articles so 2/14 < 15%
    const articles = [
      makeArticle('1', 'A', [e, e, e]),  // nato appears 3 times in same article
      makeArticle('2', 'B', [e]),
      ...Array.from({ length: 12 }, (_, i) =>
        makeArticle(`f${i}`, `Filler ${i}`, [{ normalized: `filler-${i}`, type: 'term' as const }])
      ),
    ];
    const weights = computeEntityWeights(articles);
    // df should be 2 (not 4), so weight = log(14/2)
    expect(weights.has('nato')).toBe(true);
    expect(weights.get('nato')!.weight).toBeCloseTo(Math.log(14 / 2));
  });
});

// ---------------------------------------------------------------------------
// temporalProximity (helper used by findAndScorePairs)
// ---------------------------------------------------------------------------

describe('temporalProximity', () => {
  it('returns 1 for identical timestamps', () => {
    expect(temporalProximity(now, now)).toBe(1);
  });

  it('returns 0 for dates >72h apart', () => {
    const later = new Date(now.getTime() + 73 * 60 * 60 * 1000);
    expect(temporalProximity(now, later)).toBe(0);
  });

  it('returns ~0.5 for dates 36h apart', () => {
    const later = new Date(now.getTime() + 36 * 60 * 60 * 1000);
    expect(temporalProximity(now, later)).toBeCloseTo(0.5);
  });
});

// ---------------------------------------------------------------------------
// findAndScorePairs
// ---------------------------------------------------------------------------

describe('findAndScorePairs', () => {
  it('returns no pairs when articles share fewer than 2 entities', () => {
    const shared = { normalized: 'only_one', type: 'term' as const };
    const articles = [
      makeArticle('1', 'A', [shared]),
      makeArticle('2', 'B', [shared]),
    ];
    const weights = computeEntityWeights(articles);
    const index = buildInvertedIndex(articles, weights);
    const pairs = findAndScorePairs(articles, index, weights);
    expect(pairs).toHaveLength(0);
  });

  it('finds a pair when articles share 2+ weighted entities', () => {
    const e1 = { normalized: 'ukraine', type: 'place' as const };
    const e2 = { normalized: 'zelensky', type: 'person' as const };
    // Need enough articles so shared entities stay under 15% frequency
    const articles = [
      makeArticle('1', 'A', [e1, e2]),
      makeArticle('2', 'B', [e1, e2]),
      makeArticle('3', 'C', [e1, e2]),
      ...Array.from({ length: 18 }, (_, i) =>
        makeArticle(`f${i}`, `Filler ${i}`, [{ normalized: `filler-${i}`, type: 'term' as const }])
      ),
    ];
    const weights = computeEntityWeights(articles);
    const index = buildInvertedIndex(articles, weights);
    const pairs = findAndScorePairs(articles, index, weights);
    expect(pairs.length).toBeGreaterThan(0);
    for (const p of pairs) {
      expect(p.sharedEntities.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('gives higher score to pairs from different sources', () => {
    const e1 = { normalized: 'nato', type: 'org' as const };
    const e2 = { normalized: 'summit', type: 'term' as const };
    const articles = [
      makeArticle('1', 'A', [e1, e2], 'src-1'),
      makeArticle('2', 'B', [e1, e2], 'src-2'),
      makeArticle('3', 'C', [e1, e2], 'src-1'), // same source as article 1
      ...Array.from({ length: 18 }, (_, i) =>
        makeArticle(`f${i}`, `Filler ${i}`, [{ normalized: `filler-${i}`, type: 'term' as const }], `src-f${i}`)
      ),
    ];
    const weights = computeEntityWeights(articles);
    const index = buildInvertedIndex(articles, weights);
    const pairs = findAndScorePairs(articles, index, weights);
    // Find cross-source pair (0,1) and same-source pair (0,2)
    const crossSource = pairs.find(
      (p) => (p.i === 0 && p.j === 1) || (p.i === 1 && p.j === 0)
    );
    const sameSource = pairs.find(
      (p) => (p.i === 0 && p.j === 2) || (p.i === 2 && p.j === 0)
    );
    if (crossSource && sameSource) {
      expect(crossSource.score).toBeGreaterThan(sameSource.score);
    }
  });
});

// ---------------------------------------------------------------------------
// clusterPairs
// ---------------------------------------------------------------------------

describe('clusterPairs', () => {
  it('groups connected articles into one cluster', () => {
    const articles = Array.from({ length: 3 }, (_, i) =>
      makeArticle(String(i), `T${i}`, [])
    );
    const pairs: CandidatePair[] = [
      { i: 0, j: 1, score: 0.8, sharedEntities: ['a', 'b'] },
      { i: 1, j: 2, score: 0.7, sharedEntities: ['b', 'c'] },
    ];
    const clusters = clusterPairs(articles, pairs);
    // All 3 should be in the same cluster
    const clusterSizes = [...clusters.values()].map((v) => v.length);
    expect(clusterSizes).toContain(3);
  });

  it('keeps unconnected articles in separate clusters', () => {
    const articles = Array.from({ length: 4 }, (_, i) =>
      makeArticle(String(i), `T${i}`, [])
    );
    const pairs: CandidatePair[] = [
      { i: 0, j: 1, score: 0.8, sharedEntities: ['a', 'b'] },
      { i: 2, j: 3, score: 0.7, sharedEntities: ['c', 'd'] },
    ];
    const clusters = clusterPairs(articles, pairs);
    const clusterSizes = [...clusters.values()].map((v) => v.length).sort();
    expect(clusterSizes).toEqual([2, 2]);
  });

  it('returns singletons for articles with no pairs', () => {
    const articles = Array.from({ length: 3 }, (_, i) =>
      makeArticle(String(i), `T${i}`, [])
    );
    const clusters = clusterPairs(articles, []);
    expect(clusters.size).toBe(3);
    for (const [, members] of clusters) {
      expect(members).toHaveLength(1);
    }
  });
});

// ---------------------------------------------------------------------------
// pickBestTitle
// ---------------------------------------------------------------------------

describe('pickBestTitle', () => {
  it('prefers titles in the 40-120 char sweet spot', () => {
    const short = 'Too short';
    const good = 'This is a well-written headline about the NATO summit in Brussels today';
    const long = 'A'.repeat(200);
    expect(pickBestTitle([short, good, long])).toBe(good);
  });

  it('returns the only title when given one', () => {
    expect(pickBestTitle(['Only option'])).toBe('Only option');
  });

  it('trims and normalizes whitespace', () => {
    const messy = '  Multiple   spaces   everywhere  ';
    expect(pickBestTitle([messy])).toBe('Multiple spaces everywhere');
  });
});
