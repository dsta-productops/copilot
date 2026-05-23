/**
 * Portal corpus — the source of truth for what the LLM helper knows about,
 * and what /llms.txt advertises to external LLM agents.
 *
 * Static index. Per-item detail routes are now live (/tools/[slug],
 * /prompts/[slug], /journeys/[slug]).
 * Extend to dynamically read content/ when building llms-full.txt bodies.
 */

export interface CorpusEntry {
  url: string;
  title: string;
  description: string;
  section: string;
}

export const corpus: CorpusEntry[] = [
  {
    url: "/",
    title: "Landing",
    description:
      "Entry point. Explains what the portal is and links to the four content bundles.",
    section: "Overview",
  },
  {
    url: "/pipeline",
    title: "Pipeline overview",
    description:
      "What ProductOps is, how it sits alongside DevSecOps and MLOps, and the design principles that shape every flywheel iteration.",
    section: "Foundation",
  },
  {
    url: "/flywheel",
    title: "The product flywheel",
    description:
      "Three iterative phases — Research, Design, Test — that run continuously.",
    section: "Foundation",
  },
  {
    url: "/flywheel/research",
    title: "Research phase",
    description:
      "Understand users, operators, and needs. Define the right problem before solutioning.",
    section: "Foundation",
  },
  {
    url: "/flywheel/design",
    title: "Design phase",
    description:
      "Translate validated needs into testable artefacts — prototypes, virtual prototypes, reference designs.",
    section: "Foundation",
  },
  {
    url: "/flywheel/test",
    title: "Test phase",
    description:
      "Measure what was delivered against what was intended. Close the loop with evidence.",
    section: "Foundation",
  },
  {
    url: "/tools",
    title: "Tool catalogue",
    description:
      "Every tool in the pipeline with access details, how-to, and ready-to-paste prompts for the AI-enabled ones.",
    section: "Operations",
  },
  {
    url: "/case-studies",
    title: "Case studies",
    description: "First-hand accounts from programmes running the flywheel.",
    section: "Knowledge",
  },
  {
    url: "/journeys",
    title: "Guided journeys",
    description:
      "Scenario walkthroughs composing tools and prompts end-to-end.",
    section: "Guided journeys",
  },
  {
    url: "/prompts",
    title: "Prompt library",
    description:
      "All prompts in the portal, filterable by phase, tool, and task.",
    section: "Prompts",
  },
];

export function corpusGroupedBySection(): Record<string, CorpusEntry[]> {
  return corpus.reduce(
    (acc, entry) => {
      acc[entry.section] = acc[entry.section] || [];
      acc[entry.section].push(entry);
      return acc;
    },
    {} as Record<string, CorpusEntry[]>,
  );
}
