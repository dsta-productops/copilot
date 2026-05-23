import { readEntry } from "@/lib/content";
import { Markdown } from "@/components/portal/markdown";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/portal/page-header";
import { Artefact } from "@/components/portal/artefact-grid";
import { DomainTabbedGrid } from "@/components/portal/domain-tabbed-grid";
import {
  EnterprisePageToc,
  PageTocItem,
} from "@/components/templates/enterprise/page-toc";
import { AvailabilityMap, isToolAvailable } from "@/lib/tools";
import { notFound } from "next/navigation";

const PHASE_SLUGS = ["research", "design", "test"] as const;

export function generateStaticParams() {
  return PHASE_SLUGS.map((phase) => ({ phase }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = await params;
  const entry = await readEntry<{ title: string }>("phases", phase);
  if (!entry) return {};
  return { title: `${entry.frontmatter.title} · ProductOps Co-pilot` };
}

interface ChecklistItem {
  label: string;
  description: string;
}

interface ArtefactRecord {
  name: string;
  description: string;
  domain: "shared" | "digital" | "engineering";
  promptSlugs?: string[];
  toolSlugs?: string[];
  annotation?: string;
}

interface StageRecord {
  name: string;
  intro: string;
  parallel?: boolean;
  artefacts: ArtefactRecord[];
}

interface PhaseFrontmatter {
  title: string;
  lede: string;
  artefactChecklist?: ChecklistItem[];
  pitfalls?: ChecklistItem[];
  stages?: StageRecord[];
}

interface NamedFrontmatter {
  name?: string;
  title?: string;
}

interface ToolFrontmatter extends NamedFrontmatter {
  availability?: AvailabilityMap;
}

async function resolveLabel(
  collection: "prompts",
  slug: string,
): Promise<string> {
  const entry = await readEntry<NamedFrontmatter>(collection, slug);
  if (!entry) return slug;
  return entry.frontmatter.name ?? entry.frontmatter.title ?? slug;
}

async function resolveTool(
  slug: string,
): Promise<{ label: string; isPlanned: boolean }> {
  const entry = await readEntry<ToolFrontmatter>("tools", slug);
  if (!entry) return { label: slug, isPlanned: false };
  const label =
    entry.frontmatter.name ?? entry.frontmatter.title ?? slug;
  return {
    label,
    isPlanned: !isToolAvailable(entry.frontmatter.availability),
  };
}

async function toArtefact(record: ArtefactRecord): Promise<Artefact> {
  const chips: Artefact["chips"] = [];

  for (const slug of record.promptSlugs ?? []) {
    const label = await resolveLabel("prompts", slug);
    chips.push({ label, href: `/prompts/${slug}`, kind: "prompt" });
  }

  for (const slug of record.toolSlugs ?? []) {
    const { label, isPlanned } = await resolveTool(slug);
    chips.push({
      label,
      href: `/tools/${slug}`,
      kind: "tool",
      isPlanned,
    });
  }

  return {
    name: record.name,
    description: record.description,
    domain: record.domain,
    chips,
    annotation: record.annotation,
  };
}

interface ResolvedStage {
  name: string;
  intro: string;
  parallel: boolean;
  artefacts: Artefact[];
}

async function toStage(stage: StageRecord): Promise<ResolvedStage> {
  return {
    name: stage.name,
    intro: stage.intro,
    parallel: stage.parallel ?? false,
    artefacts: await Promise.all(stage.artefacts.map(toArtefact)),
  };
}

const EXIT_GATE_ID = "exit-gate";
const PITFALLS_ID = "pitfalls";

export default async function PhasePage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = await params;
  const entry = await readEntry<PhaseFrontmatter>("phases", phase);
  if (!entry) notFound();

  const { title, lede, artefactChecklist, pitfalls, stages } = entry.frontmatter;

  const resolvedStages = stages
    ? await Promise.all(stages.map(toStage))
    : [];

  const isSingleStage = resolvedStages.length === 1;
  const stagesHeading = isSingleStage
    ? "What to produce"
    : "What to do, in sequence";
  const stagesLede = isSingleStage
    ? "The artefacts you can produce in this phase. Pick the ones that apply to your team."
    : "The phase, broken into stages. Read top-to-bottom; each card links to the prompt that does the work.";

  const hasChecklist =
    artefactChecklist !== undefined && artefactChecklist.length > 0;
  const hasPitfalls = pitfalls !== undefined && pitfalls.length > 0;

  const tocItems: PageTocItem[] = [
    ...(isSingleStage
      ? resolvedStages.length === 1
        ? [{ id: "stage-1", label: stagesHeading }]
        : []
      : resolvedStages.map((stage, i) => ({
          id: `stage-${i + 1}`,
          label: `${i + 1}. ${stage.name}`,
        }))),
    ...(hasChecklist
      ? [{ id: EXIT_GATE_ID, label: "Before you leave this phase" }]
      : []),
    ...(hasPitfalls
      ? [{ id: PITFALLS_ID, label: "Common pitfalls" }]
      : []),
  ];

  return (
    <Frame maxWidth="xl" padding="lg">
      <div className="py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-12">
        <Stack gap="12">
          <PageHeader eyebrow="Flywheel" title={title} lede={lede} />

          <Markdown>{entry.body}</Markdown>

          {resolvedStages.length > 0 && (
            <>
              <Separator />
              <section>
                <Stack gap="8">
                  <div>
                    <Heading as="h2" size="xl">
                      {stagesHeading}
                    </Heading>
                    <Text size="sm" variant="muted" className="mt-1">
                      {stagesLede}
                    </Text>
                  </div>
                  <Stack gap="8">
                    {resolvedStages.map((stage, i) => (
                      <Stack
                        key={stage.name}
                        gap="4"
                        id={`stage-${i + 1}`}
                        className="scroll-mt-20"
                      >
                        <div>
                          {!isSingleStage && (
                            <>
                              <Text
                                size="sm"
                                variant="muted"
                                weight="medium"
                                className="uppercase tracking-wide"
                              >
                                Stage {i + 1}
                              </Text>
                              <Heading as="h3" size="lg" className="mt-1">
                                {stage.name}
                              </Heading>
                            </>
                          )}
                          <Text variant="muted" className={isSingleStage ? "" : "mt-1"}>
                            {stage.intro}
                          </Text>
                        </div>
                        <DomainTabbedGrid
                          artefacts={stage.artefacts}
                          numbered={!stage.parallel}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </section>
            </>
          )}

          {hasChecklist && (
            <>
              <Separator />
              <section id={EXIT_GATE_ID} className="scroll-mt-20">
                <Stack gap="6">
                  <div>
                    <Heading as="h2" size="xl">
                      Before you leave this phase
                    </Heading>
                    <Text size="sm" variant="muted" className="mt-1">
                      The exit gate. Confirm each item is true before moving
                      on.
                    </Text>
                  </div>
                  <Stack gap="3">
                    {artefactChecklist!.map((item, i) => (
                      <Card key={i} className="p-4">
                        <Stack gap="1">
                          <Text weight="medium">{item.label}</Text>
                          <Text size="sm" variant="muted">
                            {item.description}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </section>
            </>
          )}

          {hasPitfalls && (
            <>
              <Separator />
              <section id={PITFALLS_ID} className="scroll-mt-20">
                <Stack gap="6">
                  <div>
                    <Heading as="h2" size="xl">
                      Common pitfalls
                    </Heading>
                    <Text size="sm" variant="muted" className="mt-1">
                      Recurring traps to watch for as you work through this phase.
                    </Text>
                  </div>
                  <Stack gap="3">
                    {pitfalls!.map((item, i) => (
                      <Card key={i} className="p-4">
                        <Stack gap="1">
                          <Text weight="medium">{item.label}</Text>
                          <Text size="sm" variant="muted">
                            {item.description}
                          </Text>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </section>
            </>
          )}

        </Stack>

        <EnterprisePageToc items={tocItems} />
      </div>
    </Frame>
  );
}
