// ============================================================
// Known Entities Dictionary — The Triangulate Knowledge Base
// Hand-curated. No AI. Grows over time.
// ============================================================

// World leaders & heads of state
const LEADERS = new Set([
  "trump", "biden", "harris", "vance", "obama",
  "putin", "zelensky", "zelenskyy",
  "xi", "jinping",
  "macron", "scholz", "starmer", "sunak",
  "netanyahu", "khamenei",
  "modi", "kishida", "ishiba",
  "trudeau", "albanese",
  "erdogan", "mbs", "bin salman",
  "lula", "milei", "amlo",
]);

// US politicians & officials
const US_POLITICIANS = new Set([
  "pelosi", "mcconnell", "schumer", "johnson", "jeffries",
  "desantis", "newsom", "abbott", "haley", "ramaswamy",
  "garland", "wray", "powell", "yellen",
  "hegseth", "rubio", "waltz", "bondi", "musk",
  "buttigieg", "warren", "sanders", "aoc", "ocasio-cortez",
  "cruz", "hawley", "cotton", "tuberville",
  "pence", "pompeo", "bannon", "flynn",
  "gabbard", "kirk", "shapiro", "carlson",
  "schiff", "nadler", "jordan", "gaetz",
]);

// Countries
const COUNTRIES = new Set([
  "united states", "america", "china", "russia", "ukraine",
  "iran", "iraq", "israel", "palestine", "gaza", "lebanon",
  "syria", "yemen", "saudi arabia", "uae", "qatar", "bahrain", "oman", "kuwait",
  "turkey", "egypt", "jordan", "libya",
  "united kingdom", "britain", "england", "scotland", "france", "germany",
  "italy", "spain", "poland", "netherlands", "belgium", "sweden", "norway",
  "japan", "south korea", "north korea", "taiwan", "india", "pakistan",
  "australia", "new zealand", "canada", "mexico", "brazil", "argentina",
  "south africa", "nigeria", "kenya", "ethiopia",
  "afghanistan", "myanmar", "thailand", "vietnam", "philippines", "indonesia",
  "cuba", "venezuela", "colombia",
]);

// Major cities
const CITIES = new Set([
  "washington", "new york", "los angeles", "chicago", "houston", "miami",
  "london", "paris", "berlin", "moscow", "kyiv", "kiev",
  "beijing", "shanghai", "tokyo", "seoul", "taipei",
  "tehran", "baghdad", "jerusalem", "tel aviv", "riyadh", "dubai", "doha",
  "delhi", "mumbai", "islamabad", "kabul",
  "sydney", "melbourne", "toronto", "ottawa",
  "brussels", "geneva", "the hague", "strasbourg",
  "cairo", "ankara", "istanbul",
]);

// Organizations & institutions
const ORGANIZATIONS = new Set([
  "nato", "united nations", "european union",
  "imf", "world bank", "wto", "who", "iaea",
  "pentagon", "white house", "congress", "senate", "house",
  "supreme court", "doj", "fbi", "cia", "nsa", "dhs", "dod", "epa", "fcc", "sec", "fed",
  "state department", "treasury",
  "kremlin", "idf", "irgc", "hamas", "hezbollah", "houthis",
  "opec", "brics",
  "republican", "democrat", "gop",
  "google", "apple", "microsoft", "meta", "amazon", "nvidia", "tesla", "openai", "anthropic",
  "reuters", "associated press",
]);

// Military / conflict terms (helps cluster war coverage)
const CONFLICT_TERMS = new Set([
  "airstrike", "airstrikes", "missile", "missiles", "drone", "drones",
  "ceasefire", "truce", "invasion", "offensive", "counteroffensive",
  "sanctions", "embargo", "blockade",
  "casualties", "killed", "wounded", "displaced", "refugees",
  "nuclear", "uranium", "enrichment",
  "strait of hormuz", "kharg island", "red sea", "black sea",
  "nato expansion", "article 5",
]);

// Economic terms (helps cluster economy stories)
const ECONOMIC_TERMS = new Set([
  "inflation", "recession", "gdp", "unemployment",
  "interest rate", "rate cut", "rate hike",
  "stock market", "dow jones", "s&p 500", "nasdaq",
  "tariff", "tariffs", "trade war", "trade deal",
  "debt ceiling", "deficit", "stimulus",
  "cryptocurrency", "bitcoin", "ethereum",
  "oil price", "crude oil", "opec",
]);

// Legal terms (helps cluster legal/court stories)
const LEGAL_TERMS = new Set([
  "indictment", "indicted", "arraignment", "arraigned",
  "verdict", "convicted", "acquitted", "sentencing", "sentenced",
  "lawsuit", "filed suit", "class action",
  "subpoena", "subpoenaed", "testimony", "testified",
  "executive order", "legislation", "bill signed",
  "supreme court ruling", "appeals court",
  "impeachment", "impeached",
]);

// ============================================================
// Entity Extraction
// ============================================================

export interface Entity {
  text: string;
  type: "person" | "place" | "org" | "number" | "term" | "quote";
  normalized: string; // lowercase, trimmed for matching
}

// Compile all known entities into one lookup map for O(1) matching
const KNOWN_ENTITIES = new Map<string, Entity["type"]>();
for (const name of LEADERS) KNOWN_ENTITIES.set(name, "person");
for (const name of US_POLITICIANS) KNOWN_ENTITIES.set(name, "person");
for (const name of COUNTRIES) KNOWN_ENTITIES.set(name, "place");
for (const name of CITIES) KNOWN_ENTITIES.set(name, "place");
for (const name of ORGANIZATIONS) KNOWN_ENTITIES.set(name, "org");
for (const name of CONFLICT_TERMS) KNOWN_ENTITIES.set(name, "term");
for (const name of ECONOMIC_TERMS) KNOWN_ENTITIES.set(name, "term");
for (const name of LEGAL_TERMS) KNOWN_ENTITIES.set(name, "term");

// Words to skip when extracting proper nouns
const COMMON_TITLE_WORDS = new Set([
  "the", "a", "an", "in", "on", "at", "to", "for", "of", "with", "by",
  "from", "is", "are", "was", "were", "has", "have", "had", "been",
  "will", "would", "could", "should", "may", "might", "can",
  "says", "said", "new", "after", "before", "over", "about",
  "how", "why", "what", "who", "when", "where", "which",
  "more", "most", "just", "also", "but", "and", "or", "not", "no",
  "up", "out", "its", "his", "her", "their", "our", "your",
  "first", "last", "next", "us", "uk", "eu",
  "news", "report", "reports", "update", "updates", "live",
  "breaking", "exclusive", "opinion", "editorial", "analysis",
  "watch", "video", "podcast", "photos", "pictures",
]);

/**
 * Extract entities from a headline — no AI, just pattern matching + dictionary
 */
export function extractEntities(title: string): Entity[] {
  const entities: Entity[] = [];
  const seen = new Set<string>();
  const lower = title.toLowerCase();

  // 1. Match known entities (multi-word phrases first)
  for (const [phrase, type] of KNOWN_ENTITIES) {
    if (phrase.includes(" ")) {
      // Multi-word: check if phrase exists in lowercase title
      if (lower.includes(phrase) && !seen.has(phrase)) {
        entities.push({ text: phrase, type, normalized: phrase });
        seen.add(phrase);
      }
    }
  }

  // 2. Match single-word known entities
  const words = lower.replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/);
  for (const word of words) {
    if (word.length < 2 || seen.has(word) || COMMON_TITLE_WORDS.has(word)) continue;
    const type = KNOWN_ENTITIES.get(word);
    if (type) {
      entities.push({ text: word, type, normalized: word });
      seen.add(word);
    }
  }

  // 3. Extract proper nouns (capitalized words not at sentence start, not in common words)
  const properNounRe = /(?:^|[.!?]\s+)\w+|\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g;
  let match;
  while ((match = properNounRe.exec(title)) !== null) {
    const name = match[1];
    if (!name) continue;
    const norm = name.toLowerCase();
    if (norm.length < 3 || seen.has(norm) || COMMON_TITLE_WORDS.has(norm)) continue;
    if (!KNOWN_ENTITIES.has(norm)) {
      // Unknown proper noun — still valuable (could be a person, place, or org we don't know yet)
      entities.push({ text: name, type: "person", normalized: norm });
      seen.add(norm);
    }
  }

  // 4. Extract numbers (dollar amounts, percentages, specific counts)
  const numberRe = /\$[\d,.]+\s*(?:billion|million|trillion|[BMT])?|\d+(?:\.\d+)?%|\d{1,3}(?:,\d{3})+|\b\d+\s+(?:killed|dead|wounded|injured|arrested|charged)\b/gi;
  while ((match = numberRe.exec(title)) !== null) {
    const num = match[0].toLowerCase().trim();
    if (!seen.has(num)) {
      entities.push({ text: match[0], type: "number", normalized: num });
      seen.add(num);
    }
  }

  // 5. Extract quoted phrases
  const quoteRe = /[""']([^""']{3,50})[""']/g;
  while ((match = quoteRe.exec(title)) !== null) {
    const quote = match[1].toLowerCase().trim();
    if (!seen.has(quote)) {
      entities.push({ text: match[1], type: "quote", normalized: quote });
      seen.add(quote);
    }
  }

  return entities;
}

