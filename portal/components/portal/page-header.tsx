import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Stack } from "@/components/ui/stack";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  className?: string;
}

export function PageHeader({ eyebrow, title, lede, className }: PageHeaderProps) {
  return (
    <Stack gap="3" className={cn("max-w-3xl", className)}>
      {eyebrow && (
        <Text
          size="sm"
          variant="muted"
          weight="medium"
          className="uppercase tracking-wide"
        >
          {eyebrow}
        </Text>
      )}
      <Heading as="h1" size="4xl">
        {title}
      </Heading>
      {lede && (
        <Text size="lg" variant="muted">
          {lede}
        </Text>
      )}
    </Stack>
  );
}
