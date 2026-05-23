import { cn } from "@/lib/utils";
import {
  AvailabilityMap,
  ENVIRONMENTS,
  hasAnyEnvironmentInfo,
} from "@/lib/tools";

const STATUS_LABEL: Record<string, string> = {
  available: "Available",
  "early-access": "Early access",
  planned: "Planned",
  unspecified: "—",
};

const STATUS_STYLES: Record<string, string> = {
  available: "border-transparent bg-bg-muted text-fg",
  "early-access": "border-accent bg-bg-muted text-fg",
  planned: "border-border bg-bg-subtle text-fg-muted",
  unspecified: "border-dashed border-border bg-transparent text-fg-muted/60",
};

export function EnvironmentMatrix({
  availability,
  className,
}: {
  availability?: AvailabilityMap;
  className?: string;
}) {
  if (!hasAnyEnvironmentInfo(availability)) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-border bg-bg-subtle px-4 py-3 text-sm text-fg-muted",
          className,
        )}
      >
        <span className="font-medium text-fg">Planned</span> — target
        environments to be confirmed.
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-5 gap-2", className)}>
      {ENVIRONMENTS.map((env) => {
        const status = availability?.[env.id] ?? "unspecified";
        return (
          <div
            key={env.id}
            className={cn(
              "flex flex-col items-start gap-1 rounded-md border px-2.5 py-2",
              STATUS_STYLES[status],
            )}
          >
            <span className="text-xs font-medium text-fg">{env.label}</span>
            <span className="text-xs">{STATUS_LABEL[status]}</span>
          </div>
        );
      })}
    </div>
  );
}
