"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

/**
 * EnterprisePageToc — candidate PRIZM Enterprise template.
 *
 * Right-rail table of contents for long content pages. Renders a vertical
 * list of section labels and highlights the active section as the reader
 * scrolls. Hidden below `lg` — narrower viewports have a single scrollable
 * column where a TOC adds clutter without aiding navigation.
 *
 * Slot/props-based: pass `items` of `{ id, label }`. The hosting page is
 * responsible for emitting matching `id` attributes on its section headings
 * and applying `scroll-mt-*` so anchor jumps clear any sticky chrome.
 *
 * Design principles applied:
 *  - Whitespace as structure — sticky right rail with fixed narrow width
 *    sits in the gutter created by a wider Frame; no chrome around the list.
 *  - Calm over loud — neutral text; accent reserved for the active item only.
 *    Underline / colour shift handles hover, no surface flood.
 *  - Light mode first — semantic tokens throughout; flips cleanly when dark
 *    mode is enabled later.
 *  - Approachability — labels mirror the on-page section headings verbatim,
 *    so the TOC reads as a recap, not a separate navigation grammar.
 */

export interface PageTocItem {
  id: string;
  label: string;
}

export interface EnterprisePageTocProps {
  items: PageTocItem[];
  className?: string;
  heading?: string;
}

export function EnterprisePageToc({
  items,
  className,
  heading = "On this page",
}: EnterprisePageTocProps) {
  const [activeId, setActiveId] = useState<string | undefined>(items[0]?.id);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <aside
      className={cn("sticky top-20 hidden self-start lg:block", className)}
      aria-label={heading}
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-fg-muted">
        {heading}
      </p>
      <ol className="space-y-1 border-l border-border">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={cn(
                "-ml-px block border-l py-1 pl-3 text-sm leading-snug transition-colors",
                activeId === item.id
                  ? "border-accent font-medium text-fg"
                  : "border-transparent text-fg-muted hover:text-fg",
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
