#!/usr/bin/env node
// Sync CLARA's per-artefact MDX into the portal's content/prompts/.
//
// CLARA lives at /Users/alvinloh/Claude/CLARA/ as a sibling project and owns
// the Research+Confluence prompts. Override the source path with the
// CLARA_DIST_PATH environment variable for non-default checkouts.
//
// One-way sync: CLARA → portal. Files in CLARA's dist are copied verbatim.
// Files in portal that carry `source: clara` but no longer exist in CLARA's
// dist are deleted as stale. Portal-native prompts (no `source: clara`
// frontmatter) are never touched — that's how Design/Test standalone prompts
// like prototype-from-prd, capability-storyboard-scripter, and
// test-plan-generator stay in the portal independently of CLARA.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const PORTAL_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CLARA_DIST = process.env.CLARA_DIST_PATH
  ? path.resolve(process.env.CLARA_DIST_PATH)
  : path.resolve(PORTAL_ROOT, '..', '..', 'CLARA', 'dist', 'portal');
const PORTAL_PROMPTS = path.join(PORTAL_ROOT, 'content', 'prompts');

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listMdx(dir) {
  if (!(await exists(dir))) return [];
  return (await fs.readdir(dir)).filter((f) => f.endsWith('.mdx'));
}

async function readFrontmatter(file) {
  const src = await fs.readFile(file, 'utf8');
  return matter(src).data;
}

async function main() {
  if (!(await exists(CLARA_DIST))) {
    console.error(`CLARA dist not found at ${CLARA_DIST}`);
    console.error(`Set CLARA_DIST_PATH to override, or run \`pnpm build\` in the CLARA repo.`);
    process.exit(1);
  }

  await fs.mkdir(PORTAL_PROMPTS, { recursive: true });

  const claraFiles = await listMdx(CLARA_DIST);
  const claraSlugs = new Set(claraFiles.map((f) => f.replace(/\.mdx$/, '')));

  let copied = 0;
  let stamps = new Set();
  for (const f of claraFiles) {
    const srcPath = path.join(CLARA_DIST, f);
    const destPath = path.join(PORTAL_PROMPTS, f);
    const data = await readFrontmatter(srcPath);
    if (data.source !== 'clara') {
      console.warn(`  warn   ${f} in CLARA dist is missing \`source: clara\` — skipping`);
      continue;
    }
    if (data.claraSourceSha) stamps.add(String(data.claraSourceSha));
    await fs.copyFile(srcPath, destPath);
    copied++;
    console.log(`  sync   ${f}`);
  }

  const portalFiles = await listMdx(PORTAL_PROMPTS);
  let removed = 0;
  for (const f of portalFiles) {
    const slug = f.replace(/\.mdx$/, '');
    if (claraSlugs.has(slug)) continue;
    const data = await readFrontmatter(path.join(PORTAL_PROMPTS, f));
    if (data.source === 'clara') {
      await fs.unlink(path.join(PORTAL_PROMPTS, f));
      removed++;
      console.log(`  prune  ${f} (no longer in CLARA dist)`);
    }
  }

  const shaList = [...stamps];
  const shaSummary =
    shaList.length === 1
      ? shaList[0]
      : shaList.length === 0
        ? '(none stamped)'
        : `mixed (${shaList.length} distinct SHAs — CLARA dist looks inconsistent)`;

  console.log('');
  console.log(`Synced ${copied} prompt(s) from CLARA. Pruned ${removed} stale. Source SHA: ${shaSummary}`);
  console.log(`CLARA dist: ${CLARA_DIST}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
