"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Stack } from "@/components/ui/stack";
import type { ReactNode } from "react";

// Thin client wrapper around Tabs for the standard Digital / Engineering split.
// Rendered children are passed in as slots from the parent server component;
// the tabs themselves are the only client-required piece. An optional `shared`
// slot renders above the tabs without a toggle.
export function DomainTabs({
  shared,
  digital,
  engineering,
  defaultValue = "digital",
}: {
  shared?: ReactNode;
  digital: ReactNode;
  engineering: ReactNode;
  defaultValue?: "digital" | "engineering";
}) {
  return (
    <Stack gap="4">
      {shared}
      <Tabs defaultValue={defaultValue}>
        <TabsList>
          <TabsTrigger value="digital">Digital teams</TabsTrigger>
          <TabsTrigger value="engineering">Engineering teams</TabsTrigger>
        </TabsList>
        <TabsContent value="digital">{digital}</TabsContent>
        <TabsContent value="engineering">{engineering}</TabsContent>
      </Tabs>
    </Stack>
  );
}
