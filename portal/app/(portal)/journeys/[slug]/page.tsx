import { readEntry, listEntries, isPublic } from "@/lib/content";
import { Markdown } from "@/components/portal/markdown";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/portal/page-header";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

interface JourneyStep {
  label: string;
  description: string;
  prompt?: string;
  tool?: string;
}

interface JourneyFrontmatter {
  title: string;
  scenario: string;
  visibility: string;
  steps?: JourneyStep[];
}

interface PromptFrontmatter {
  title: string;
  task: string;
  visibility: string;
}

interface ToolFrontmatter {
  name: string;
  visibility: string;
}

export async function generateStaticParams() {
  const journeys = await listEntries<JourneyFrontmatter>("journeys");
  return journeys
    .filter((j) => isPublic(j.frontmatter))
    .map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readEntry<JourneyFrontmatter>("journeys", slug);
  if (!entry) return {};
  return {
    title: `${entry.frontmatter.title} · Journeys · ProductOps Co-pilot`,
  };
}

export default async function JourneyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readEntry<JourneyFrontmatter>("journeys", slug);
  if (!entry || !isPublic(entry.frontmatter)) notFound();

  const { title, scenario, steps } = entry.frontmatter;

  // Resolve linked prompts and tools for each step
  const resolvedSteps = await Promise.all(
    (steps ?? []).map(async (step) => {
      const [prompt, tool] = await Promise.all([
        step.prompt
          ? readEntry<PromptFrontmatter>("prompts", step.prompt)
          : null,
        step.tool ? readEntry<ToolFrontmatter>("tools", step.tool) : null,
      ]);
      return {
        ...step,
        resolvedPrompt:
          prompt && isPublic(prompt.frontmatter) ? prompt : null,
        resolvedTool: tool && isPublic(tool.frontmatter) ? tool : null,
      };
    }),
  );

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <div>
          <PageHeader eyebrow="Guided journey" title={title} lede={scenario} />
          {steps && (
            <div className="mt-4">
              <Badge variant="subtle">{steps.length} steps</Badge>
            </div>
          )}
        </div>

        {entry.body && (
          <>
            <Markdown>{entry.body}</Markdown>
            <Separator />
          </>
        )}

        {resolvedSteps.length > 0 && (
          <section>
            <Stack gap="6">
              <Heading as="h2" size="xl">
                Steps
              </Heading>
              <Stack gap="4">
                {resolvedSteps.map((step, i) => (
                  <Card key={i} className="p-6">
                    <Stack gap="4">
                      <div className="flex items-start gap-4">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bg-muted text-sm font-semibold text-fg-muted">
                          {i + 1}
                        </span>
                        <Stack gap="1">
                          <Heading as="h3" size="lg">
                            {step.label}
                          </Heading>
                          <Text size="sm" variant="muted">
                            {step.description}
                          </Text>
                        </Stack>
                      </div>

                      {(step.resolvedPrompt || step.resolvedTool) && (
                        <div className="ml-11 flex flex-wrap gap-3">
                          {step.resolvedPrompt && (
                            <Link
                              href={`/prompts/${step.resolvedPrompt.slug}`}
                              className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                            >
                              {step.resolvedPrompt.frontmatter.title}
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          )}
                          {step.resolvedTool && (
                            <Link
                              href={`/tools/${step.resolvedTool.slug}`}
                              className="group inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                            >
                              {step.resolvedTool.frontmatter.name}
                              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          )}
                        </div>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </section>
        )}
      </Stack>
    </Frame>
  );
}
