import { listEntries, isPublic } from "@/lib/content";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/portal/page-header";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Prompts · ProductOps Co-pilot",
};

interface PromptFrontmatter {
  title: string;
  phase: string;
  task: string;
  expectedOutput?: string;
  visibility: string;
}

const PHASE_ORDER = ["research", "design", "test", "cross-phase"] as const;
const PHASE_LABELS: Record<string, string> = {
  research: "Research",
  design: "Design",
  test: "Test",
  "cross-phase": "Cross-phase",
};

export default async function PromptsPage() {
  const prompts = await listEntries<PromptFrontmatter>("prompts");
  const publicPrompts = prompts.filter((p) => isPublic(p.frontmatter));

  const grouped = PHASE_ORDER.reduce(
    (acc, phase) => {
      acc[phase] = publicPrompts.filter((p) => p.frontmatter.phase === phase);
      return acc;
    },
    {} as Record<string, typeof publicPrompts>,
  );

  const activePhases = PHASE_ORDER.filter((p) => grouped[p].length > 0);

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="12" className="py-8">
        <PageHeader
          eyebrow="Operations"
          title="Prompt library"
          lede="Copy-and-paste prompts for every phase of the pipeline. Each prompt is designed to be pasted straight into an LLM — no context-building required."
        />

        {activePhases.map((phase, i) => (
          <section key={phase}>
            <Stack gap="6">
              <div className="flex items-center gap-3">
                <Heading as="h2" size="xl">
                  {PHASE_LABELS[phase]}
                </Heading>
                <Badge variant="subtle">{grouped[phase].length}</Badge>
              </div>

              <Stack gap="3">
                {grouped[phase].map((prompt) => (
                  <Link
                    key={prompt.slug}
                    href={`/prompts/${prompt.slug}`}
                    className="group block"
                  >
                    <Card className="p-5 transition-colors hover:border-border-strong">
                      <div className="flex items-start justify-between gap-4">
                        <Stack gap="1">
                          <Heading as="h3" size="lg">
                            {prompt.frontmatter.title}
                          </Heading>
                          {prompt.frontmatter.task && (
                            <Text size="sm" variant="muted">
                              {prompt.frontmatter.task}
                            </Text>
                          )}
                        </Stack>
                        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </Stack>
            </Stack>

            {i < activePhases.length - 1 && <Separator className="mt-6" />}
          </section>
        ))}

        {publicPrompts.length === 0 && (
          <Text variant="muted">No prompts authored yet.</Text>
        )}
      </Stack>
    </Frame>
  );
}
