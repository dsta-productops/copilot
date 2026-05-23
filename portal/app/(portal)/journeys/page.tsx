import { listEntries, isPublic } from "@/lib/content";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/portal/page-header";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Journeys · ProductOps Co-pilot",
};

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
  order?: number;
  steps?: JourneyStep[];
}

export default async function JourneysPage() {
  const journeys = await listEntries<JourneyFrontmatter>("journeys");
  const publicJourneys = journeys
    .filter((j) => isPublic(j.frontmatter))
    .sort(
      (a, b) =>
        (a.frontmatter.order ?? 100) - (b.frontmatter.order ?? 100),
    );

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <PageHeader
          eyebrow="Guided journeys"
          title="Scenario walkthroughs"
          lede="Step-by-step flows that compose tools and prompts end-to-end — for new projects, user research, hand-offs to DevSecOps, and onboarding."
        />

        <Stack gap="4">
          {publicJourneys.map((journey) => (
            <Link
              key={journey.slug}
              href={`/journeys/${journey.slug}`}
              className="group block"
            >
              <Card className="p-6 transition-colors hover:border-border-strong">
                <div className="flex items-start justify-between gap-4">
                  <Stack gap="2">
                    <Heading as="h2" size="xl">
                      {journey.frontmatter.title}
                    </Heading>
                    <Text size="sm" variant="muted">
                      {journey.frontmatter.scenario}
                    </Text>
                    {journey.frontmatter.steps && (
                      <Badge variant="subtle" className="w-fit">
                        {journey.frontmatter.steps.length} steps
                      </Badge>
                    )}
                  </Stack>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
                </div>
              </Card>
            </Link>
          ))}
        </Stack>

        {publicJourneys.length === 0 && (
          <Text variant="muted">No journeys authored yet.</Text>
        )}
      </Stack>
    </Frame>
  );
}
