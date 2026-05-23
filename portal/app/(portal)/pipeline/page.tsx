import { readEntry } from "@/lib/content";
import { Markdown } from "@/components/portal/markdown";
import { Frame } from "@/components/ui/frame";
import { Stack } from "@/components/ui/stack";
import { PageHeader } from "@/components/portal/page-header";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Pipeline · ProductOps Co-pilot",
};

interface PageFrontmatter {
  title: string;
  eyebrow?: string;
  lede?: string;
}

export default async function PipelinePage() {
  const entry = await readEntry<PageFrontmatter>("pages", "pipeline");
  if (!entry) notFound();

  const { title, eyebrow, lede } = entry.frontmatter;

  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <PageHeader eyebrow={eyebrow ?? "Foundation"} title={title} lede={lede} />
        <Markdown>{entry.body}</Markdown>
      </Stack>
    </Frame>
  );
}
