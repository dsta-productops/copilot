import type React from "react";
import { Prose } from "@/components/ui/prose";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders markdown (the body of an MDX content file) inside PRIZM's Prose
 * styling. For first-cut content this is plain markdown — no custom React
 * components embedded yet. Add component overrides via the `components` prop
 * on ReactMarkdown when we start embedding interactive blocks.
 */
// Strip HTML comments before rendering. react-markdown skips raw HTML for
// safety, but it escapes comments as visible text rather than dropping them —
// so `<!-- managed by CLARA sync -->` leaks through as literal characters.
function stripHtmlComments(md: string): string {
  return md.replace(/<!--[\s\S]*?-->/g, "");
}

export function Markdown({ children }: { children: string }) {
  return (
    <Prose>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {stripHtmlComments(children)}
      </ReactMarkdown>
    </Prose>
  );
}

/**
 * Inline markdown — renders without the Prose wrapper or block-level margins.
 * Use for short snippets embedded inside structured layouts (input descriptions,
 * example bullets, etc.) where the surrounding component already supplies spacing.
 */
const inlineComponents = {
  p: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
};

export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={inlineComponents}>
      {stripHtmlComments(children)}
    </ReactMarkdown>
  );
}
