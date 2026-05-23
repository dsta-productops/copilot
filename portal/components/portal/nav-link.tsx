"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentPropsWithoutRef } from "react";

interface NavLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  href: string;
  exact?: boolean;
}

export function NavLink({
  href,
  exact = false,
  className,
  children,
  ...props
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-bg-muted text-fg"
          : "text-fg-muted hover:bg-bg-muted/60 hover:text-fg",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
