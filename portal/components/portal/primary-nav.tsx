import { NavLink } from "./nav-link";

export const primaryNavItems = [
  { href: "/pipeline", label: "Pipeline" },
  { href: "/flywheel", label: "Flywheel" },
  { href: "/tools", label: "Tools" },
  { href: "/journeys", label: "Journeys" },
  { href: "/prompts", label: "Prompts" },
];

export function PrimaryNav() {
  return (
    <>
      {primaryNavItems.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
    </>
  );
}
