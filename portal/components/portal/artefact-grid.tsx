import { Card } from "@/components/ui/card";
import { Stack } from "@/components/ui/stack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export interface ArtefactChip {
  label: string;
  href: string;
  kind: "prompt" | "tool";
  isPlanned?: boolean;
}

export interface Artefact {
  name: string;
  description: string;
  domain: "shared" | "digital" | "engineering";
  chips: ArtefactChip[];
  annotation?: string;
}

const DOMAIN_LABEL: Record<Artefact["domain"], string> = {
  shared: "Shared",
  digital: "Digital",
  engineering: "Engineering",
};

export function ArtefactGrid({
  artefacts,
  numbered = false,
}: {
  artefacts: Artefact[];
  numbered?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {artefacts.map((a, i) => (
        <Card key={a.name} className="p-4">
          <Stack gap="2">
            <div className="flex items-start justify-between gap-3">
              <Heading as="h3" size="md">
                {numbered ? `${i + 1}. ${a.name}` : a.name}
              </Heading>
              {a.domain !== "shared" && (
                <Badge variant="outline" className="shrink-0">
                  {DOMAIN_LABEL[a.domain]}
                </Badge>
              )}
            </div>
            <Text size="sm" variant="muted">
              {a.description}
            </Text>
            {a.annotation && (
              <Text size="sm" variant="muted" className="italic">
                {a.annotation}
              </Text>
            )}
            {a.chips.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {a.chips.map((chip) => {
                  const isPrimary = chip.kind === "prompt";
                  const primaryClasses =
                    "border-accent bg-accent text-accent-fg hover:bg-accent-strong hover:border-accent-strong";
                  const subtleClasses =
                    "border-border bg-bg-subtle text-fg hover:border-border-strong hover:bg-bg-muted";
                  const arrowClasses = isPrimary
                    ? "text-accent-fg transition-transform group-hover:translate-x-0.5"
                    : "text-fg-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg";
                  const plannedClasses = isPrimary
                    ? "text-accent-fg/80"
                    : "text-fg-muted";
                  return (
                    <Link
                      key={chip.href}
                      href={chip.href}
                      className={`group inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${
                        isPrimary ? primaryClasses : subtleClasses
                      }`}
                    >
                      {isPrimary ? `Run: ${chip.label}` : chip.label}
                      {chip.isPlanned && (
                        <span className={plannedClasses}>· planned</span>
                      )}
                      <span aria-hidden className={arrowClasses}>
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </Stack>
        </Card>
      ))}
    </div>
  );
}
