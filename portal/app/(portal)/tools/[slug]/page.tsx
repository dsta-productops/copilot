import { readEntry, listEntries, isPublic } from "@/lib/content";
import { Markdown } from "@/components/portal/markdown";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/portal/page-header";
import { EnvironmentMatrix } from "@/components/portal/environment-matrix";
import { AvailabilityMap, isToolAvailable } from "@/lib/tools";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

interface ToolFrontmatter {
  name: string;
  lede?: string;
  phase: string;
  domain: string;
  type: string;
  availability?: AvailabilityMap;
  accessLink?: string;
  learnMoreLink?: string;
  copyBlock?: string;
  visibility: string;
  prompts?: string[];
  promptsHeading?: string;
  promptsLede?: string;
}

interface PromptFrontmatter {
  title: string;
  task: string;
  domain?: "shared" | "digital" | "engineering";
  copyBlock?: string;
  visibility: string;
}

const PROMPTS_SLOT_MARKER = "<!-- PROMPTS SLOT -->";

const PROMPT_DOMAIN_LABELS: Record<string, string> = {
  shared: "Shared",
  digital: "Digital",
  engineering: "Engineering",
};

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

export async function generateStaticParams() {
  const tools = await listEntries<ToolFrontmatter>("tools");
  return tools
    .filter((t) => isPublic(t.frontmatter))
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readEntry<ToolFrontmatter>("tools", slug);
  if (!entry) return {};
  return { title: `${entry.frontmatter.name} · Tools · ProductOps Co-pilot` };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = await readEntry<ToolFrontmatter>("tools", slug);
  if (!entry || !isPublic(entry.frontmatter)) notFound();

  const {
    name,
    lede,
    phase,
    domain,
    type,
    availability,
    accessLink,
    learnMoreLink,
    prompts: promptSlugs,
    promptsHeading,
    promptsLede,
  } = entry.frontmatter;

  const available = isToolAvailable(availability);

  // Resolve linked prompts
  const linkedPrompts = await Promise.all(
    (promptSlugs ?? []).map((s) => readEntry<PromptFrontmatter>("prompts", s)),
  );
  const PROMPT_DOMAIN_ORDER: Record<string, number> = {
    shared: 0,
    digital: 1,
    engineering: 2,
  };
  const resolvedPrompts = linkedPrompts
    .filter(
      (p): p is NonNullable<typeof p> => p !== null && isPublic(p.frontmatter),
    )
    .sort((a, b) => {
      const da = PROMPT_DOMAIN_ORDER[a.frontmatter.domain ?? ""] ?? 99;
      const db = PROMPT_DOMAIN_ORDER[b.frontmatter.domain ?? ""] ?? 99;
      return da - db;
    });

  // Split body around the prompts marker. If present, render prompts mid-page
  // between bodyTop and bodyBottom; otherwise fall back to rendering them
  // after the full body.
  const [bodyTop, bodyBottom] = entry.body.includes(PROMPTS_SLOT_MARKER)
    ? entry.body.split(PROMPTS_SLOT_MARKER, 2).map((s) => s.trim())
    : [entry.body, ""];

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <div>
          <PageHeader eyebrow="Tools" title={name} lede={lede} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="subtle">
              {PHASE_LABELS[phase] ?? phase}
            </Badge>
            <Badge variant="subtle">
              {DOMAIN_LABELS[domain] ?? domain}
            </Badge>
            <Badge variant="outline">
              {TYPE_LABELS[type] ?? type}
            </Badge>
          </div>
        </div>


        {!available && (
          <Alert variant="warning">
            <AlertTitle>Planned — not yet generally available</AlertTitle>
            <AlertDescription>
              This tool isn&apos;t live yet across any environment.
            </AlertDescription>
          </Alert>
        )}

        <section>
          <Stack gap="3">
            <Heading as="h2" size="md">
              Availability by environment
            </Heading>
            <EnvironmentMatrix availability={availability} />
          </Stack>
        </section>

        {accessLink && available && (
          <a
            href={accessLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
          >
            Access this tool
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        {learnMoreLink && (
          <a
            href={learnMoreLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover"
          >
            Find out more
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <Markdown>{bodyTop}</Markdown>

        {resolvedPrompts.length > 0 && (
          <section>
            <Stack gap="4">
              <div>
                <Heading as="h2" size="2xl">
                  {promptsHeading ?? `Prompts for ${name}`}
                </Heading>
                <Text size="sm" variant="muted" className="mt-1">
                  {promptsLede ??
                    `Pick a task. Open any tile for the prompt you paste into ${name}.`}
                </Text>
              </div>
              <div className="-mx-4 overflow-x-auto px-4 pb-2">
                <div className="flex gap-3">
                  {resolvedPrompts.map((prompt) => (
                    <Link
                      key={prompt.slug}
                      href={`/prompts/${prompt.slug}`}
                      className="group block w-[240px] shrink-0"
                    >
                      <Card className="h-full p-4 transition-colors hover:border-border-strong">
                        <Stack gap="3" className="h-full">
                          {prompt.frontmatter.domain && (
                            <Badge variant="subtle" className="self-start">
                              {PROMPT_DOMAIN_LABELS[prompt.frontmatter.domain] ??
                                prompt.frontmatter.domain}
                            </Badge>
                          )}
                          <code className="font-mono text-xs leading-snug text-fg">
                            {prompt.frontmatter.copyBlock ?? prompt.frontmatter.title}
                          </code>
                          <div className="mt-auto flex items-center text-xs text-accent">
                            Open
                            <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Stack>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </Stack>
          </section>
        )}

        {bodyBottom && <Markdown>{bodyBottom}</Markdown>}
      </Stack>
    </Frame>
  );
}
