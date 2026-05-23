import Link from "next/link";

export function Brand() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2 text-fg transition-colors"
    >
      <BrandMark />
      <span className="text-sm font-semibold tracking-tight">
        DSTA ProductOps Co-pilot
      </span>
    </Link>
  );
}

function BrandMark() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="text-accent"
    >
      <circle
        cx="10"
        cy="10"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2" fill="currentColor" />
    </svg>
  );
}
