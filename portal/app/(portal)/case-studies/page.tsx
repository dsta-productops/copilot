import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/portal/page-header";
import { PlaceholderNote } from "@/components/portal/placeholder-note";

export const metadata = {
  title: "Case studies · ProductOps Co-pilot",
};

export default function CaseStudiesPage() {
  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <PageHeader
          eyebrow="Knowledge"
          title="Case studies"
          lede="Programmes' first-hand accounts of running the flywheel — what worked, what didn't, what the team would do differently."
        />
        <PlaceholderNote>
          Case studies are deferred to a later deep-dive. The route scaffold
          is in place so the IA is complete and links won't 404.
        </PlaceholderNote>
      </Stack>
    </Frame>
  );
}
