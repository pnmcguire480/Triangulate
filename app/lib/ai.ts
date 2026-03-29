// ============================================================
// AI Round Table — Multi-Provider Interface
// Convergence applied to the AI layer itself.
// "Our AIs have to agree with each other before you see a claim."
// ============================================================

export type AIProvider = "claude" | "gemini" | "deepseek" | "grok";
export type AIConfidence = "HIGH" | "MEDIUM" | "LOW";

export interface AIResponse {
  text: string;
  provider: AIProvider;
}

// Provider-specific wrappers
// Each returns a string response from the given system + user prompt

// Singleton Anthropic client — avoids re-instantiation on every call
let _anthropicClient: InstanceType<typeof import("@anthropic-ai/sdk").default> | null = null;

async function getAnthropicClient() {
  if (!_anthropicClient) {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not found in environment");
    _anthropicClient = new Anthropic({ apiKey });
  }
  return _anthropicClient;
}

async function askClaude(system: string, user: string, model?: string): Promise<string> {
  const client = await getAnthropicClient();

  try {
    const response = await client.messages.create({
      model: model || "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      temperature: 0.1,
      system,
      messages: [{ role: "user", content: user }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    const result = textBlock ? textBlock.text : "";
    if (!result) {
      console.warn("[ai] Claude returned empty response");
    }
    return result;
  } catch (err) {
    console.error("[ai] Claude API error:", err);
    throw err;
  }
}

async function askGemini(system: string, user: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: user }] }],
        generationConfig: { temperature: 0.1 },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown error");
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function askDeepSeek(system: string, user: string): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("DEEPSEEK_API_KEY not set");

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown error");
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function askGrok(system: string, user: string): Promise<string> {
  const apiKey = process.env.GROK_API_KEY || process.env.XAPI_KEY;
  if (!apiKey) throw new Error("GROK_API_KEY or XAPI_KEY not set");

  // xAI uses OpenAI-compatible API
  const response = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-3-mini-fast",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      max_tokens: 2048,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "unknown error");
    throw new Error(`Grok API error (${response.status}): ${errorText}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

// ============================================================
// Unified Interface
// ============================================================

const PROVIDER_MAP: Record<AIProvider, (system: string, user: string) => Promise<string>> = {
  claude: askClaude,
  gemini: askGemini,
  deepseek: askDeepSeek,
  grok: askGrok,
};

/**
 * Ask a single AI provider
 */
export async function askAI(
  provider: AIProvider,
  system: string,
  user: string
): Promise<AIResponse> {
  const fn = PROVIDER_MAP[provider];
  const text = await fn(system, user);
  return { text, provider };
}

/**
 * Ask the primary provider, with fallback if it fails
 */
export async function askAIWithFallback(
  primary: AIProvider,
  fallback: AIProvider,
  system: string,
  user: string
): Promise<AIResponse> {
  try {
    return await askAI(primary, system, user);
  } catch (err) {
    console.warn(`${primary} failed, falling back to ${fallback}:`, err);
    return await askAI(fallback, system, user);
  }
}

/**
 * AI Round Table — ask multiple providers the same question,
 * compare results. Returns the primary result + confidence level.
 */
export async function askRoundTable(
  providers: AIProvider[],
  system: string,
  user: string,
  compareFn: (responses: string[]) => AIConfidence
): Promise<{ text: string; confidence: AIConfidence; responses: AIResponse[] }> {
  const results = await Promise.allSettled(
    providers.map((p) => askAI(p, system, user))
  );

  const responses: AIResponse[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      responses.push(result.value);
    }
  }

  if (responses.length === 0) {
    throw new Error("All AI providers failed");
  }

  // Use first successful response as the primary text
  const text = responses[0].text;

  // Calculate confidence based on agreement
  const confidence = responses.length >= 2
    ? compareFn(responses.map((r) => r.text))
    : "MEDIUM"; // Only one provider responded

  return { text, confidence, responses };
}

// ============================================================
// Task-Specific Routing Config
// ============================================================

export type AITask = "clustering" | "claim_extraction" | "semantic_dedup" | "convergence" | "primary_doc" | "search";

interface TaskConfig {
  primary: AIProvider;
  verifyWith?: AIProvider;
  fallback: AIProvider;
}

// Which models handle which tasks.
// Round Table verification activates automatically when verifyWith key is available.
// Fallback providers activate when primary fails.
export const TASK_ROUTING: Record<AITask, TaskConfig> = {
  clustering: { primary: "claude", verifyWith: "deepseek", fallback: "claude" },
  claim_extraction: { primary: "claude", verifyWith: "gemini", fallback: "deepseek" },
  semantic_dedup: { primary: "claude", verifyWith: "gemini", fallback: "claude" },
  convergence: { primary: "claude", verifyWith: "gemini", fallback: "claude" },
  primary_doc: { primary: "claude", fallback: "claude" },
  search: { primary: "claude", verifyWith: "gemini", fallback: "deepseek" },
};

/**
 * Smart ask — routes to the right provider(s) based on task type.
 * Uses Round Table verification when a verifyWith provider is configured.
 */
export async function askForTask(
  task: AITask,
  system: string,
  user: string
): Promise<{ text: string; confidence: AIConfidence }> {
  const config = TASK_ROUTING[task];

  // Check if verify provider has API key configured
  const canVerify = config.verifyWith && hasProviderKey(config.verifyWith);

  if (canVerify && config.verifyWith) {
    // Round Table: ask primary + verifier, compare responses
    try {
      const result = await askRoundTable(
        [config.primary, config.verifyWith],
        system,
        user,
        compareResponses
      );
      return { text: result.text, confidence: result.confidence };
    } catch {
      // Fall through to single provider
    }
  }

  // Single provider with fallback
  const response = await askAIWithFallback(config.primary, config.fallback, system, user);
  return { text: response.text, confidence: "MEDIUM" };
}

/**
 * Compare AI responses using token overlap (Jaccard similarity on words).
 * HIGH = >50% overlap, MEDIUM = 20-50%, LOW = <20%
 */
function compareResponses(responses: string[]): AIConfidence {
  if (responses.length < 2) return "MEDIUM";

  const tokenize = (text: string) =>
    new Set(text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 2));

  const a = tokenize(responses[0]);
  const b = tokenize(responses[1]);

  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = a.size + b.size - intersection;
  const similarity = union > 0 ? intersection / union : 0;

  if (similarity > 0.5) return "HIGH";
  if (similarity > 0.2) return "MEDIUM";
  return "LOW";
}

function hasProviderKey(provider: AIProvider): boolean {
  switch (provider) {
    case "claude": return !!process.env.ANTHROPIC_API_KEY;
    case "gemini": return !!process.env.GEMINI_API_KEY;
    case "deepseek": return !!process.env.DEEPSEEK_API_KEY;
    case "grok": return !!(process.env.GROK_API_KEY || process.env.XAPI_KEY);
    default: return false;
  }
}
