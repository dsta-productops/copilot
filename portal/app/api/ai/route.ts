import { llmModel, isLLMConfigured } from "@/lib/ai/provider";
import { buildSystemPrompt } from "@/lib/ai/system-prompt";
import { convertToModelMessages, streamText, type UIMessage } from "ai";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!isLLMConfigured()) {
    return new Response(
      JSON.stringify({
        error:
          "LLM is not configured. Set LLM_API_KEY (and optionally LLM_BASE_URL / LLM_MODEL) in .env.local.",
      }),
      { status: 503, headers: { "content-type": "application/json" } },
    );
  }

  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: llmModel,
    system: await buildSystemPrompt(),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
