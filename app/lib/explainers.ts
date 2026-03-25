// ============================================================
// Triangulate — Explainer Text Library (Chunk 7.7)
// "Why It Matters" contextual popovers for every metric
// ============================================================

interface ExplainerEntry {
  short: string;  // <100 chars, for tooltips
  long: string;   // 2-4 sentences, for expanded view
  benchmark?: string; // comparison context
}

/**
 * Convergence score band explainers.
 */
export function getConvergenceExplainer(score: number): ExplainerEntry {
  const percent = Math.round(score * 100);

  if (score >= 0.9) {
    return {
      short: 'Near-total agreement across the spectrum.',
      long: `At ${percent}%, this story has exceptional convergence. Sources from across the ideological spectrum and multiple regions confirm the same core facts. This level of agreement is rare and indicates strong factual consensus.`,
      benchmark: 'Only ~5% of stories reach this level.',
    };
  }
  if (score >= 0.7) {
    return {
      short: 'Strong cross-spectrum convergence.',
      long: `At ${percent}%, adversarial sources largely agree on the key facts. This means outlets that typically disagree are confirming the same claims independently. Strong convergence suggests high factual reliability.`,
      benchmark: 'Top 15% of stories by convergence.',
    };
  }
  if (score >= 0.4) {
    return {
      short: 'Moderate agreement with some disputed claims.',
      long: `At ${percent}%, sources partially agree. Some claims are confirmed across the spectrum, but others remain contested. This is common for developing stories where facts are still emerging.`,
      benchmark: 'Typical for most multi-source stories.',
    };
  }
  if (score >= 0.2) {
    return {
      short: 'Limited convergence — significant disagreement.',
      long: `At ${percent}%, sources mostly disagree on the key claims. This could indicate a politically charged topic, early-stage reporting, or fundamentally different interpretations of events.`,
      benchmark: 'Below average convergence.',
    };
  }
  return {
    short: 'Very low convergence — sources deeply divided.',
    long: `At ${percent}%, there is almost no agreement between sources. Claims are contested or only supported by ideologically aligned outlets. Treat individual claims with extra scrutiny.`,
    benchmark: 'Bottom 10% of stories by convergence.',
  };
}

/**
 * Trust signal explainers.
 */
export const TRUST_SIGNAL_EXPLAINERS: Record<string, ExplainerEntry> = {
  SINGLE_SOURCE: {
    short: 'Only one outlet is reporting this.',
    long: 'This story has been reported by a single source. Without independent confirmation, treat the claims with caution. Single-source stories often evolve as more outlets pick up coverage.',
  },
  CONTESTED: {
    short: 'Sources disagree on key facts.',
    long: 'Multiple outlets are covering this story, but they contradict each other on important claims. This is common for politically charged topics. Look at which specific claims are disputed and by whom.',
  },
  CONVERGED: {
    short: 'Adversarial sources confirm the same facts.',
    long: 'Sources from different ideological positions independently confirm the same factual claims. This is the strongest signal Triangulate provides — when enemies agree, the facts are likely solid.',
  },
  SOURCE_BACKED: {
    short: 'Primary documents are available.',
    long: 'This story includes links to primary source documents — court filings, legislation, official statements, or research papers. You can verify the claims directly by reading the source material.',
  },
  INSTITUTIONALLY_VALIDATED: {
    short: 'An institution has acted on this.',
    long: 'Beyond media reporting, an institution (court, legislature, regulatory body) has taken action related to this story. Institutional action provides an additional layer of factual grounding.',
  },
};

/**
 * GCI explainer.
 */
export function getGCIExplainer(score: number): ExplainerEntry {
  const percent = Math.round(score * 100);

  if (score >= 0.7) {
    return {
      short: `GCI ${percent}: High global news agreement today.`,
      long: `The Global Convergence Index is ${percent} today, meaning news sources worldwide are in unusual agreement. High GCI days often coincide with major breaking events where facts are clear and undisputed.`,
    };
  }
  if (score >= 0.4) {
    return {
      short: `GCI ${percent}: Moderate global agreement.`,
      long: `The GCI is ${percent} today — a typical level. Some stories show strong convergence while others remain contested. This reflects a normal news day with a mix of agreed-upon and disputed facts.`,
    };
  }
  return {
    short: `GCI ${percent}: Low global agreement today.`,
    long: `The GCI is ${percent} today, meaning sources worldwide are more divided than usual. This can indicate major political events, emerging crises, or breaking stories where facts are still being established.`,
  };
}

/**
 * Source count explainer.
 */
export function getSourceCountExplainer(count: number): ExplainerEntry {
  if (count >= 10) {
    return {
      short: `${count} outlets covering this story — very high attention.`,
      long: `This story is being covered by ${count} outlets across the spectrum. High source counts improve convergence reliability because more independent observers are confirming facts.`,
    };
  }
  if (count >= 5) {
    return {
      short: `${count} outlets — solid coverage breadth.`,
      long: `${count} outlets are covering this story. This provides good data for convergence analysis, especially if the sources span multiple bias tiers and regions.`,
    };
  }
  if (count >= 2) {
    return {
      short: `${count} outlets — limited coverage so far.`,
      long: `Only ${count} outlets are covering this story. Convergence scores with few sources should be interpreted cautiously. The story may still be developing.`,
    };
  }
  return {
    short: 'Single source — no convergence possible.',
    long: 'Only one outlet has reported on this. Convergence analysis requires multiple sources. Check back later as more outlets may pick up the story.',
  };
}
