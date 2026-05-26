import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Filesystem-backed content reader.
 *
 * Reads MDX files from `content/<collection>/<slug>.mdx`, parses YAML
 * frontmatter, and returns the markdown body for server components.
 */

export type Collection =
  | "pages"
  | "phases"
  | "tools"
  | "prompts"
  | "journeys"
  | "case-studies";

export interface ContentEntry<TFrontmatter = Record<string, unknown>> {
  slug: string;
  frontmatter: TFrontmatter;
  body: string;
}

const CONTENT_ROOT = path.join(process.cwd(), "content");

export async function readEntry<TFrontmatter = Record<string, unknown>>(
  collection: Collection,
  slug: string,
): Promise<ContentEntry<TFrontmatter> | null> {
  const filePath = path.join(CONTENT_ROOT, collection, `${slug}.mdx`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return {
      slug,
      frontmatter: data as TFrontmatter,
      body: content,
    };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function listEntries<TFrontmatter = Record<string, unknown>>(
  collection: Collection,
): Promise<ContentEntry<TFrontmatter>[]> {
  const dir = path.join(CONTENT_ROOT, collection);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }

  const entries = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => readEntry<TFrontmatter>(collection, f.replace(/\.mdx$/, ""))),
  );
  return entries.filter((e): e is ContentEntry<TFrontmatter> => e !== null);
}

/**
 * `visibility: "public" | "internal"`. The internet-facing prototype filters
 * out internal records; the airgap build can render both.
 */
export function isPublic(frontmatter: { visibility?: string }) {
  return frontmatter.visibility !== "internal";
}
