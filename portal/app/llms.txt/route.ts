import { corpusGroupedBySection } from "@/lib/corpus";

/**
 * /llms.txt — index for LLM crawlers. Follows the convention used by
 * Anthropic and others (https://llmstxt.org) — markdown file at the root
 * listing the key pages of the site, grouped by section, each with a
 * one-line description.
 *
 * Goal: any LLM or agent can prime itself on the structure of this portal
 * by fetching this single file.
 */
export async function GET() {
  const groups = corpusGroupedBySection();
  const sections = Object.entries(groups);

  const body = `# DSTA ProductOps Co-pilot

> The wayfinder for DSTA's ProductOps pipeline. Explains the pipeline,
> catalogues tools and templates, and surfaces AI-ready prompts for every
> phase of the product flywheel.

This file is the canonical entry point for LLM agents. For the full corpus
in a single document, see /llms-full.txt.

${sections
  .map(
    ([section, entries]) => `## ${section}

${entries.map((e) => `- [${e.title}](${e.url}): ${e.description}`).join("\n")}`,
  )
  .join("\n\n")}
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
