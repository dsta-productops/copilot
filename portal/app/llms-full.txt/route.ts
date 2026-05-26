import { corpus } from "@/lib/corpus";

/**
 * /llms-full.txt — the full portal corpus in a single text file.
 *
 * For v1 (no real content yet), this returns the same structural index as
 * /llms.txt plus a note that content is being authored. Once MDX bodies
 * are filled in under `content/`, extend this to stitch in the actual
 * page bodies inline.
 */
export async function GET() {
  const intro = `# DSTA ProductOps Co-pilot — full corpus

> The complete, single-file corpus of the ProductOps Co-pilot portal.
> Intended for LLM agents to ingest as priming context.

## Status

Real content is being authored in content/ as MDX files. Until that
work lands, this file contains only the IA index. Page bodies will
appear inline once authoring is in progress.

---

`;

  const pages = corpus
    .map(
      (e) => `## ${e.title}

URL: ${e.url}
${e.description}

(Content placeholder — author the MDX file under content/.)

---`,
    )
    .join("\n\n");

  return new Response(intro + pages, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
