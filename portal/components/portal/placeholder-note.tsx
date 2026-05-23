import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { Construction } from "lucide-react";
import type { ReactNode } from "react";

interface PlaceholderNoteProps {
  children: ReactNode;
}

/**
 * Inline notice that the content for this page is placeholder. Used during
 * the scaffold phase to make it obvious which pages still need authoring.
 * Remove the import once the page has real content.
 */
export function PlaceholderNote({ children }: PlaceholderNoteProps) {
  return (
    <Card className="flex items-start gap-3 border-dashed bg-bg-subtle p-4">
      <Construction
        className="mt-0.5 h-4 w-4 shrink-0 text-fg-subtle"
        aria-hidden="true"
      />
      <Text size="sm" variant="muted">
        {children}
      </Text>
    </Card>
  );
}
