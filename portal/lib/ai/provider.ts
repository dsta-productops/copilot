import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Provider-agnostic AI client.
 *
 * Configured via env vars so the same code runs against:
 *  - Internet phase: Groq (free, fast, OpenAI-compatible)
 *  - Airgap phase: on-prem LLM (vLLM / Ollama / TGI / LiteLLM gateway)
 *
 * Set in .env.local:
 *   LLM_BASE_URL=https://api.groq.com/openai/v1
 *   LLM_API_KEY=gsk_...
 *   LLM_MODEL=llama-3.3-70b-versatile
 *
 * Defaults target Groq. To swap providers, change LLM_BASE_URL and LLM_MODEL.
 */

const baseURL = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1";
const apiKey = process.env.LLM_API_KEY || "";
const modelId = process.env.LLM_MODEL || "llama-3.3-70b-versatile";

export const llmProvider = createOpenAICompatible({
  name: "productops-copilot-llm",
  baseURL,
  apiKey,
});

export const llmModel = llmProvider.chatModel(modelId);

export function isLLMConfigured() {
  return Boolean(apiKey || baseURL.startsWith("http://"));
}
