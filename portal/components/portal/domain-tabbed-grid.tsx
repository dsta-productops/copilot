"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArtefactGrid, Artefact } from "@/components/portal/artefact-grid";
import { Stack } from "@/components/ui/stack";

export function DomainTabbedGrid({
  artefacts,
  numbered = false,
}: {
  artefacts: Artefact[];
  numbered?: boolean;
}) {
  const shared = artefacts.filter((a) => a.domain === "shared");
  const digital = artefacts.filter((a) => a.domain === "digital");
  const engineering = artefacts.filter((a) => a.domain === "engineering");

  const hasDigital = digital.length > 0;
  const hasEngineering = engineering.length > 0;

  // If no domain split, fall back to flat grid
  if (!hasDigital || !hasEngineering) {
    return <ArtefactGrid artefacts={artefacts} numbered={numbered} />;
  }

  return (
    <Stack gap="4">
      {shared.length > 0 && (
        <ArtefactGrid artefacts={shared} numbered={numbered} />
      )}
      <Tabs defaultValue="digital">
        <TabsList>
          <TabsTrigger value="digital">Digital teams</TabsTrigger>
          <TabsTrigger value="engineering">Engineering teams</TabsTrigger>
        </TabsList>
        <TabsContent value="digital">
          <ArtefactGrid artefacts={digital} numbered={false} />
        </TabsContent>
        <TabsContent value="engineering">
          <ArtefactGrid artefacts={engineering} numbered={false} />
        </TabsContent>
      </Tabs>
    </Stack>
  );
}
