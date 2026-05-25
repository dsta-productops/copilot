import { readEntry, listEntries, isPublic } from "@/lib/content";
import { Markdown, InlineMarkdown } from "@/components/portal/markdown";
import { CopyButton } from "@/components/portal/copy-button";
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

interface PromptInput {
  token: string;
  description: string;
  optional?: boolean;
  examples?: string[];
}

type PromptTool = "clara" | "claude-code" | "any-llm";

interface PromptFrontmatter {
  title: string;
  phase: string;
  domain?: string;
  tool?: PromptTool;
  task: string;
  expectedOutput?: string;
  inputsFrom?: string[];
  copyBlock?: string;
  promptBody?: string;
  inputs?: PromptInput[];
  outputDestination?: string;
  visibility: string;
}

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

const TOOL_LABELS: Record<PromptTool, string> = {
  clara: "CLARA",
  "claude-code": "Claude Code",
  "any-llm": "Any LLM",
};

function resolveTool(fm: PromptFrontmatter): PromptTool {
  if (fm.tool) return fm.tool;
  if (fm.copyBlock) return "clara";
  return "any-llm";
}

export async function generateStaticParams() {
  const prompts = await listEntries<PromptFrontmatter>("prompts");
  return prompts
    .filter((p) => isPublic(p.frontmatter))
    .map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readEntry<PromptFrontmatter>("prompts", slug);
  if (!entry) return {};
  return {
    title: `${entry.frontmatter.title} · Prompts · ProductOps Co-pilot`,
  };
}

export default async function PromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readEntry<PromptFrontmatter>("prompts", slug);
  if (!entry || !isPublic(entry.frontmatter)) notFound();

  const {
    title,
    phase,
    domain,
    task,
    expectedOutput,
    inputsFrom,
    copyBlock,
    promptBody,
    inputs,
    outputDestination,
  } = entry.frontmatter;
  const tool = resolveTool(entry.frontmatter);

  // Resolve upstream prompts (this prompt's inputsFrom)
  const upstreamEntries = await Promise.all(
    (inputsFrom ?? []).map((s) => readEntry<PromptFrontmatter>("prompts", s)),
  );
  const upstreamPrompts = upstreamEntries.filter(
    (p): p is NonNullable<typeof p> => p !== null && isPublic(p.frontmatter),
  );

  // Compute downstream prompts (other prompts whose inputsFrom includes this slug)
  const allPrompts = await listEntries<PromptFrontmatter>("prompts");
  const downstreamPrompts = allPrompts.filter(
    (p) =>
      isPublic(p.frontmatter) &&
      (p.frontmatter.inputsFrom ?? []).includes(slug),
  );

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <div>
          <PageHeader eyebrow="Prompts" title={title} lede={task} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="subtle">{PHASE_LABELS[phase] ?? phase}</Badge>
            {domain && domain !== "shared" && (
              <Badge variant="subtle">
                {DOMAIN_LABELS[domain] ?? domain}
              </Badge>
            )}
            <Badge variant="outline">{TOOL_LABELS[tool]}</Badge>
          </div>
        </div>

        {expectedOutput && (
          <Text size="sm" variant="muted">
            <span className="font-medium text-fg">Output:</span>{" "}
            {expectedOutput}
          </Text>
        )}

        {tool === "clara" && copyBlock && (
          <Card className="p-5">
            <Stack gap="3">
              <Stack gap="1">
                <Text size="sm" variant="muted" weight="medium" className="uppercase tracking-wide">
                  Paste into a CLARA-enabled chat
                </Text>
                <Text size="sm" variant="muted">
                  CLARA will confirm the route, ask for anything she still needs in one batched question, and show you the draft before filing.
                </Text>
              </Stack>
              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-bg-subtle px-4 py-3">
                <code className="font-mono text-sm text-fg">{copyBlock}</code>
                <CopyButton text={copyBlock} label="Copy" />
              </div>
            </Stack>
          </Card>
        )}

        {tool === "claude-code" && promptBody && (
          <Card className="p-5">
            <Stack gap="3">
              <div className="flex items-start justify-between gap-4">
                <Stack gap="1" className="min-w-0">
                  <Text size="sm" variant="muted" weight="medium" className="uppercase tracking-wide">
                    Run with Claude Code
                  </Text>
                  <Text size="sm" variant="muted">
                    Open this prompt inside a Claude Code workspace with access to your prototype repo.
                  </Text>
                </Stack>
                <div className="shrink-0">
                  <CopyButton text={promptBody} label="Copy prompt" />
                </div>
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-bg-subtle p-4 font-mono text-sm text-fg">
                {promptBody}
              </pre>
            </Stack>
          </Card>
        )}

        {tool === "any-llm" && promptBody && (
          <Card className="p-5">
            <Stack gap="3">
              <div className="flex items-start justify-between gap-4">
                <Stack gap="1" className="min-w-0">
                  <Text size="sm" variant="muted" weight="medium" className="uppercase tracking-wide">
                    Paste into any LLM
                  </Text>
                  <Text size="sm" variant="muted">
                    Fill in the inputs below where you see <code className="font-mono text-xs">{"{{TOKEN}}"}</code> placeholders, then paste the full prompt into Claude, ChatGPT, Gemini, or a local model.
                  </Text>
                </Stack>
                <div className="shrink-0">
                  <CopyButton text={promptBody} label="Copy prompt" />
                </div>
              </div>
              <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-bg-subtle p-4 font-mono text-sm text-fg">
                {promptBody}
              </pre>
            </Stack>
          </Card>
        )}

        {outputDestination && (
          <Stack gap="1">
            <Text size="sm" variant="muted" weight="medium" className="uppercase tracking-wide">
              Where the output goes
            </Text>
            <Text size="sm">{outputDestination}</Text>
          </Stack>
        )}

        {inputs && inputs.length > 0 && (
          <section>
            <Stack gap="4">
              <Heading as="h2" size="xl">
                Inputs you&apos;ll fill in
              </Heading>
              <Stack gap="3">
                {inputs.map((input) => (
                  <Card key={input.token} className="p-4">
                    <Stack gap="2">
                      <div className="flex items-baseline gap-2">
                        <code className="font-mono text-sm font-medium text-fg">
                          {"{{"}{input.token}{"}}"}
                        </code>
                        {input.optional && (
                          <Badge variant="outline" className="text-xs">
                            optional
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-fg-muted">
                        <InlineMarkdown>{input.description}</InlineMarkdown>
                      </div>
                      {input.examples && input.examples.length > 0 && (
                        <ul className="ml-4 list-disc space-y-1 text-sm text-fg-muted">
                          {input.examples.map((ex, i) => (
                            <li key={i}>
                              <InlineMarkdown>{ex}</InlineMarkdown>
                            </li>
                          ))}
                        </ul>
                      )}
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </section>
        )}

        <Markdown>{entry.body}</Markdown>

        {(upstreamPrompts.length > 0 || downstreamPrompts.length > 0) && (
          <>
            <Separator />
            <section>
              <Stack gap="6">
                <Heading as="h2" size="xl">
                  Where this fits in the chain
                </Heading>

                {upstreamPrompts.length > 0 && (
                  <Stack gap="3">
                    <Heading as="h3" size="md">
                      Use after
                    </Heading>
                    <Text size="sm" variant="muted">
                      These prompts produce outputs you can paste as inputs
                      here.
                    </Text>
                    <Stack gap="2">
                      {upstreamPrompts.map((prompt) => (
                        <Link
                          key={prompt.slug}
                          href={`/prompts/${prompt.slug}`}
                          className="group block"
                        >
                          <Card className="p-4 transition-colors hover:border-border-strong">
                            <div className="flex items-start justify-between gap-3">
                              <Stack gap="1">
                                <Heading as="h4" size="md">
                                  {prompt.frontmatter.title}
                                </Heading>
                                {prompt.frontmatter.task && (
                                  <Text size="sm" variant="muted">
                                    {prompt.frontmatter.task}
                                  </Text>
                                )}
                              </Stack>
                              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </Stack>
                  </Stack>
                )}

                {downstreamPrompts.length > 0 && (
                  <Stack gap="3">
                    <Heading as="h3" size="md">
                      Feeds into
                    </Heading>
                    <Text size="sm" variant="muted">
                      The output of this prompt is consumed by these downstream
                      prompts.
                    </Text>
                    <Stack gap="2">
                      {downstreamPrompts.map((prompt) => (
                        <Link
                          key={prompt.slug}
                          href={`/prompts/${prompt.slug}`}
                          className="group block"
                        >
                          <Card className="p-4 transition-colors hover:border-border-strong">
                            <div className="flex items-start justify-between gap-3">
                              <Stack gap="1">
                                <Heading as="h4" size="md">
                                  {prompt.frontmatter.title}
                                </Heading>
                                {prompt.frontmatter.task && (
                                  <Text size="sm" variant="muted">
                                    {prompt.frontmatter.task}
                                  </Text>
                                )}
                              </Stack>
                              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </Stack>
                  </Stack>
                )}
              </Stack>
            </section>
          </>
        )}

      </Stack>
    </Frame>
  );
}
