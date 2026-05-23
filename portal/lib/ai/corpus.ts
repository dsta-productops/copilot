import { listEntries, isPublic } from "@/lib/content";

/**
 * Builds the corpus block that gets appended to the helper's system prompt.
 *
 * Strategy:
 * - Foundation pages, phases, tools, journeys: full body. Small files;
 *   meaningful when summarised.
 * - Prompts: frontmatter-only summary. The multi-line promptBody field
 *   is the template users paste into external LLMs — the helper doesn't
 *   need to read it to know a prompt exists for a given task.
 */
export async function getCorpus(): Promise<string> {
  const [pages, phases, tools, prompts, journeys] = await Promise.all([
    listEntries("pages"),
    listEntries("phases"),
    listEntries("tools"),
    listEntries("prompts"),
    listEntries("journeys"),
  ]);

  const parts: string[] = ["# Portal corpus", ""];

  // Foundation pages (pipeline, etc.)
  const publicPages = pages.filter((p) =>
    isPublic(p.frontmatter as { visibility?: string }),
  );
  if (publicPages.length > 0) {
    parts.push("## Foundation pages", "");
    for (const p of publicPages) {
      const fm = p.frontmatter as { title?: string };
      parts.push(`### /${p.slug}`);
      if (fm.title) parts.push(`Title: ${fm.title}`);
      parts.push("");
      parts.push(p.body.trim());
      parts.push("");
    }
  }

  // Flywheel phases
  const publicPhases = phases.filter((p) =>
    isPublic(p.frontmatter as { visibility?: string }),
  );
  if (publicPhases.length > 0) {
    parts.push("## Flywheel phases", "");
    for (const p of publicPhases) {
      const fm = p.frontmatter as {
        title?: string;
        lede?: string;
        artefactChecklist?: Array<{ label: string; description: string }>;
        pitfalls?: Array<{ label: string; description: string }>;
        stages?: Array<{
          name: string;
          intro: string;
          artefacts?: Array<{
            name: string;
            description: string;
            domain?: string;
            promptSlugs?: string[];
            toolSlugs?: string[];
          }>;
        }>;
      };
      parts.push(`### /flywheel/${p.slug}`);
      if (fm.title) parts.push(`Title: ${fm.title}`);
      if (fm.lede) parts.push(`Lede: ${fm.lede}`);
      parts.push("");
      if (fm.stages) {
        parts.push("Stages:");
        for (const s of fm.stages) {
          parts.push(`- ${s.name}: ${s.intro}`);
          if (s.artefacts) {
            for (const a of s.artefacts) {
              const refs: string[] = [];
              if (a.promptSlugs?.length)
                refs.push(`prompts: ${a.promptSlugs.join(", ")}`);
              if (a.toolSlugs?.length)
                refs.push(`tools: ${a.toolSlugs.join(", ")}`);
              const refStr = refs.length ? ` (${refs.join("; ")})` : "";
              const dom = a.domain ? ` [${a.domain}]` : "";
              parts.push(`  - ${a.name}${dom}: ${a.description}${refStr}`);
            }
          }
        }
        parts.push("");
      }
      if (fm.artefactChecklist) {
        parts.push("Exit-gate checklist:");
        for (const c of fm.artefactChecklist) {
          parts.push(`- ${c.label}: ${c.description}`);
        }
        parts.push("");
      }
      if (fm.pitfalls) {
        parts.push("Common pitfalls:");
        for (const c of fm.pitfalls) {
          parts.push(`- ${c.label}: ${c.description}`);
        }
        parts.push("");
      }
      parts.push(p.body.trim());
      parts.push("");
    }
  }

  // Tools
  const publicTools = tools.filter((t) =>
    isPublic(t.frontmatter as { visibility?: string }),
  );
  if (publicTools.length > 0) {
    parts.push("## Tools", "");
    for (const t of publicTools) {
      const fm = t.frontmatter as {
        name?: string;
        phase?: string;
        domain?: string;
        type?: string;
        availability?: Record<string, string>;
        accessLink?: string;
        prompts?: string[];
      };
      parts.push(`### /tools/${t.slug}`);
      parts.push(`Name: ${fm.name ?? t.slug}`);
      const tags: string[] = [];
      if (fm.phase) tags.push(`phase=${fm.phase}`);
      if (fm.domain) tags.push(`domain=${fm.domain}`);
      if (fm.type) tags.push(`type=${fm.type}`);
      if (tags.length) parts.push(tags.join(", "));
      if (fm.availability) {
        const envs = Object.entries(fm.availability)
          .map(([k, v]) => `${k}=${v}`)
          .join(", ");
        parts.push(`Availability: ${envs}`);
      }
      if (fm.accessLink) parts.push(`Access: ${fm.accessLink}`);
      if (fm.prompts?.length)
        parts.push(`Linked prompts: ${fm.prompts.join(", ")}`);
      parts.push("");
      parts.push(t.body.trim());
      parts.push("");
    }
  }

  // Prompts — frontmatter summary only
  const publicPrompts = prompts.filter((p) =>
    isPublic(p.frontmatter as { visibility?: string }),
  );
  if (publicPrompts.length > 0) {
    parts.push("## Prompts", "");
    for (const p of publicPrompts) {
      const fm = p.frontmatter as {
        title?: string;
        task?: string;
        phase?: string;
        domain?: string;
        tool?: string;
        expectedOutput?: string;
        outputDestination?: string;
        inputsFrom?: string[];
      };
      parts.push(`### /prompts/${p.slug}`);
      parts.push(`Title: ${fm.title ?? p.slug}`);
      if (fm.task) parts.push(`Task: ${fm.task}`);
      const tags: string[] = [];
      if (fm.phase) tags.push(`phase=${fm.phase}`);
      if (fm.domain) tags.push(`domain=${fm.domain}`);
      if (fm.tool) tags.push(`tool=${fm.tool}`);
      if (tags.length) parts.push(tags.join(", "));
      if (fm.expectedOutput) parts.push(`Output: ${fm.expectedOutput}`);
      if (fm.outputDestination)
        parts.push(`Where the output goes: ${fm.outputDestination}`);
      if (fm.inputsFrom?.length)
        parts.push(`Upstream prompts: ${fm.inputsFrom.join(", ")}`);
      parts.push("");
    }
  }

  // Journeys
  const publicJourneys = journeys.filter((j) =>
    isPublic(j.frontmatter as { visibility?: string }),
  );
  if (publicJourneys.length > 0) {
    parts.push("## Journeys", "");
    for (const j of publicJourneys) {
      const fm = j.frontmatter as {
        title?: string;
        scenario?: string;
        steps?: Array<{
          label: string;
          description: string;
          prompt?: string;
          tool?: string;
        }>;
      };
      parts.push(`### /journeys/${j.slug}`);
      parts.push(`Title: ${fm.title ?? j.slug}`);
      if (fm.scenario) parts.push(`Scenario: ${fm.scenario}`);
      if (fm.steps) {
        parts.push("Steps:");
        for (const s of fm.steps) {
          const refs: string[] = [];
          if (s.prompt) refs.push(`prompt: ${s.prompt}`);
          if (s.tool) refs.push(`tool: ${s.tool}`);
          const refStr = refs.length ? ` (${refs.join(", ")})` : "";
          parts.push(`- ${s.label}: ${s.description}${refStr}`);
        }
      }
      parts.push("");
      if (j.body.trim()) {
        parts.push(j.body.trim());
        parts.push("");
      }
    }
  }

  return parts.join("\n");
}
