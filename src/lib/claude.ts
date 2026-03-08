import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function askClaude(
  systemPrompt: string,
  userPrompt: string,
  model: string = "claude-sonnet-4-20250514",
  maxTokens: number = 4096
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

// Cheaper model for high-volume tasks like claim extraction
export async function askClaudeHaiku(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  return askClaude(systemPrompt, userPrompt, "claude-haiku-3-5-20241022", 2048);
}

export default client;
