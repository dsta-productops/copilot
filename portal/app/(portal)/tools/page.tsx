import { listEntries, isPublic } from "@/lib/content";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/portal/page-header";
import { DomainTabs } from "@/components/portal/domain-tabs";
import { AvailabilityMap, isToolAvailable } from "@/lib/tools";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Tools · ProductOps Co-pilot",
};

interface ToolFrontmatter {
  name: string;
  phase: string;
  additionalPhases?: string[];
  domain: string;
  type: string;
  availability?: AvailabilityMap;
  visibility: string;
}

const PHASE_ORDER = ["research", "design", "test", "cross-phase"] as const;
const PHASE_LABELS: Record<string, string> = {
  research: "Research",
  design: "Design",
  test: "Test",
  "cross-phase": "Cross-phase",
};
const DOMAIN_LABELS: Record<string, string> = {
  shared: "Shared",
  digital: "Digital",
  engineering: "Engineering",
};
const TYPE_LABELS: Record<string, string> = {
  bespoke: "Bespoke",
  cots: "COTS",
};

interface ToolEntry {
  slug: string;
  frontmatter: ToolFrontmatter;
}

function ToolGrid({ tools }: { tools: ToolEntry[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {tools.map((tool) => (
        <Link
          key={tool.slug}
          href={`/tools/${tool.slug}`}
          className="group block"
        >
          <Card className="h-full p-5 transition-colors hover:border-border-strong">
            <Stack gap="3">
              <div className="flex items-start justify-between gap-3">
                <Heading as="h3" size="lg">
                  {tool.frontmatter.name}
                </Heading>
                {!isToolAvailable(tool.frontmatter.availability) && (
                  <Badge variant="warning" className="shrink-0">
                    Planned
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {tool.frontmatter.domain !== "shared" && (
                  <Badge variant="subtle">
                    {DOMAIN_LABELS[tool.frontmatter.domain] ??
                      tool.frontmatter.domain}
                  </Badge>
                )}
                <Badge variant="outline">
                  {TYPE_LABELS[tool.frontmatter.type] ??
                    tool.frontmatter.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-accent">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Stack>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function ToolsPage() {
  const tools = await listEntries<ToolFrontmatter>("tools");
  const publicTools = tools.filter((t) => isPublic(t.frontmatter));

  const grouped = PHASE_ORDER.reduce(
    (acc, phase) => {
      acc[phase] = publicTools.filter(
        (t) =>
          t.frontmatter.phase === phase ||
          (t.frontmatter.additionalPhases ?? []).includes(phase),
      );
      return acc;
    },
    {} as Record<string, typeof publicTools>,
  );

  const activePhases = PHASE_ORDER.filter((p) => grouped[p].length > 0);

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="12" className="py-8">
        <PageHeader
          eyebrow="Operations"
          title="Tool catalogue"
          lede="Every tool in the pipeline — what it does, when to reach for it, how to access it, and ready-to-paste prompts for the AI-enabled ones."
        />

        {activePhases.map((phase, i) => {
          const phaseTools = grouped[phase];
          const shared = phaseTools.filter((t) => t.frontmatter.domain === "shared");
          const digital = phaseTools.filter((t) => t.frontmatter.domain === "digital");
          const engineering = phaseTools.filter((t) => t.frontmatter.domain === "engineering");
          const tabbed = digital.length > 0 && engineering.length > 0;

          return (
            <section key={phase}>
              <Stack gap="6">
                <div className="flex items-center gap-3">
                  <Heading as="h2" size="xl">
                    {PHASE_LABELS[phase]}
                  </Heading>
                  <Badge variant="subtle">{phaseTools.length}</Badge>
                </div>

                {tabbed ? (
                  <DomainTabs
                    shared={shared.length > 0 ? <ToolGrid tools={shared} /> : undefined}
                    digital={<ToolGrid tools={digital} />}
                    engineering={<ToolGrid tools={engineering} />}
                  />
                ) : (
                  <ToolGrid tools={phaseTools} />
                )}
              </Stack>

              {i < activePhases.length - 1 && <Separator className="mt-6" />}
            </section>
          );
        })}

        {publicTools.length === 0 && (
          <Text variant="muted">No tools authored yet.</Text>
        )}
      </Stack>
    </Frame>
  );
}
