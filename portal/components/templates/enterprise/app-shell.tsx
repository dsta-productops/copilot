import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

/**
 * EnterpriseAppShell — candidate PRIZM Enterprise template.
 *
 * Layout primitive for Enterprise-zone applications. A sticky top bar with
 * brand / nav / actions slots, and a content area below. Composable: pass any
 * ReactNode into the slots. The shell itself is a server component; interactive
 * slot contents may be client components.
 *
 * Design principles applied:
 *  - Whitespace as structure — generous horizontal padding, 56px (h-14) top bar.
 *    Content never feels cramped against the viewport edges.
 *  - Calm over loud — no chrome ornamentation, neutral surfaces, accent reserved
 *    for active nav state and primary actions only.
 *  - Light mode first — bg-bg / text-fg semantic tokens; tokens flip cleanly
 *    if dark mode is enabled later. No design effort sunk into a mode that
 *    Enterprise users rarely use.
 *  - Approachability for new users — primary nav visible from any page; ⌘K
 *    affordance (passed via actions) lives in the same place every time.
 */

export interface EnterpriseAppShellProps extends ComponentPropsWithoutRef<"div"> {
  topBar?: ReactNode;
  children: ReactNode;
}

export function EnterpriseAppShell({
  topBar,
  className,
  children,
  ...props
}: EnterpriseAppShellProps) {
  return (
    <div
      className={cn("flex min-h-screen flex-col bg-bg text-fg", className)}
      {...props}
    >
      {topBar}
      <main className="flex-1">{children}</main>
    </div>
  );
}

export interface EnterpriseAppShellTopBarProps
  extends ComponentPropsWithoutRef<"header"> {
  brand?: ReactNode;
  nav?: ReactNode;
  mobileNav?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
}

export function EnterpriseAppShellTopBar({
  brand,
  nav,
  mobileNav,
  actions,
  sticky = true,
  className,
  ...props
}: EnterpriseAppShellTopBarProps) {
  return (
    <header
      className={cn(
        "z-40 border-b border-border bg-bg/95 backdrop-blur supports-[backdrop-filter]:bg-bg/75",
        sticky && "sticky top-0",
        className,
      )}
      {...props}
    >
      <div className="mx-auto flex h-14 max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          {brand}
          {nav && (
            <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
              {nav}
            </nav>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {mobileNav && <div className="md:hidden">{mobileNav}</div>}
        </div>
      </div>
    </header>
  );
}
