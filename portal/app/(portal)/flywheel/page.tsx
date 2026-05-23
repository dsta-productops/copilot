import { Card } from "@/components/ui/card";
import { Frame } from "@/components/ui/frame";
import { Heading } from "@/components/ui/heading";
import { Stack } from "@/components/ui/stack";
import { Text } from "@/components/ui/text";
import { PageHeader } from "@/components/portal/page-header";
import { DomainTabs } from "@/components/portal/domain-tabs";
import Link from "next/link";
import { ArrowRight, Compass, PenTool, FlaskConical } from "lucide-react";

const phases = [
  {
    href: "/flywheel/research",
    icon: Compass,
    title: "Research",
    blurb:
      "Understand users, operators, and needs. Define the right problem and what success looks like before solutioning.",
  },
  {
    href: "/flywheel/design",
    icon: PenTool,
    title: "Design",
    blurb:
      "Translate validated needs into testable artefacts — interactive prototypes, virtual prototypes, capability storyboards.",
  },
  {
    href: "/flywheel/test",
    icon: FlaskConical,
    title: "Test",
    blurb:
      "Run the artefact against real users or operators, capture the feedback in DASH 2.0, feed the next Design iteration.",
  },
];

export const metadata = {
  title: "Flywheel · ProductOps Co-pilot",
};

export default function FlywheelPage() {
  return (
    <Frame maxWidth="lg" padding="lg">
      <Stack gap="8" className="py-8">
        <PageHeader
          eyebrow="Foundation"
          title="The product flywheel"
          lede="Three phases — Research, Design, Test. Research is the outer loop, done thoroughly at the start; Design ↔ Test is the inner loop, iterating at high cadence. Pick a phase to dive in."
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {phases.map(({ href, icon: Icon, title, blurb }) => (
            <Link key={href} href={href} className="group block">
              <Card className="h-full p-6 transition-colors hover:border-border-strong">
                <Stack gap="3">
                  <Icon className="h-6 w-6 text-accent" />
                  <Heading as="h2" size="lg">
                    {title}
                  </Heading>
                  <Text size="sm" variant="muted">
                    {blurb}
                  </Text>
                  <div className="flex items-center gap-1 text-sm font-medium text-accent">
                    Enter phase
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Stack>
              </Card>
            </Link>
          ))}
        </div>

        <Stack gap="4" className="pt-8">
          <Stack gap="2">
            <Heading as="h2" size="2xl">
              Grounded in the 4Ds
            </Heading>
            <Text variant="muted">
              The flywheel adapts the 4Ds of design innovation — Discover, Define, Develop, Deliver — into a tighter loop suited to defence programmes. Discover and Define collapse into Research (problem space). Develop becomes the Design ↔ Test inner loop (solution space). Deliver becomes the close-out at the end of each interval, where decisions are made and the next loop is seeded.
            </Text>
          </Stack>

          <div className="grid gap-3 sm:grid-cols-4">
            {fourDs.map(({ d, name, mapsTo, blurb }) => (
              <div
                key={d}
                className="rounded-md border border-border bg-surface-subtle p-4"
              >
                <Text size="xs" variant="muted" className="uppercase tracking-wide">
                  {d}
                </Text>
                <Text size="sm" className="font-semibold mt-1">
                  {name}
                </Text>
                <Text size="xs" variant="muted" className="mt-2 uppercase tracking-wide">
                  Maps to
                </Text>
                <Text size="sm" className="mt-1">
                  {mapsTo}
                </Text>
                <Text size="sm" variant="muted" className="mt-2">
                  {blurb}
                </Text>
              </div>
            ))}
          </div>
        </Stack>

        <Stack gap="4" className="pt-8">
          <Stack gap="2">
            <Heading as="h2" size="2xl">
              Cadence cheatsheet
            </Heading>
            <Text variant="muted">
              How the flywheel maps onto a typical 4-month block of eight 2-week sprints — a planning interval for digital programmes, or design innovation for engineering programmes. The spine is the same — Research up front, rapid loops in the middle, close-out at the end — only the content of each block changes. 4 months is typical; the actual length varies by programme, and the proportions matter more than the absolute numbers.
            </Text>
          </Stack>

          <DomainTabs
            digital={<CadenceCard cadence={cadences.digital} />}
            engineering={<CadenceCard cadence={cadences.engineering} />}
          />
        </Stack>

      </Stack>
    </Frame>
  );
}

function DualTrackDiagram() {
  const pis = ["PI N-1", "PI N", "PI N+1", "PI N+2"];
  const productOps = ["design W", "design X", "design Y", "design Z"];
  // Each DevSecOps PI does two things: build the previously-validated capability,
  // and run upstream tech assessment on the one currently being designed.
  const devSecOps = [
    { build: null, assess: "assess W" },
    { build: "build W", assess: "assess X" },
    { build: "build X", assess: "assess Y" },
    { build: "build Y", assess: "assess Z" },
  ];
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[520px] grid-cols-[auto_repeat(4,minmax(0,1fr))] items-start gap-2 text-sm">
        <div />
        {pis.map((pi) => (
          <div
            key={pi}
            className="text-center text-xs uppercase tracking-wide text-fg-muted"
          >
            {pi}
          </div>
        ))}

        <div className="flex items-center pr-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          ProductOps
        </div>
        {productOps.map((cell, i) => (
          <div
            key={i}
            className="relative rounded-md border border-accent/40 bg-accent/5 px-3 py-1.5 text-center text-fg"
          >
            {cell}
            {devSecOps[i + 1]?.build ? (
              <span
                aria-hidden="true"
                className="absolute -bottom-2 -right-1 text-base leading-none text-accent"
              >
                ↘
              </span>
            ) : null}
          </div>
        ))}

        <div className="flex items-center pr-2 text-xs font-semibold uppercase tracking-wide text-fg-muted">
          DevSecOps
        </div>
        {devSecOps.map(({ build, assess }, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="rounded-md border border-dashed border-accent/40 bg-accent/[0.03] px-3 py-1.5 text-center text-xs text-fg-muted">
              {assess}
              <span aria-hidden="true" className="ml-1 text-accent">↑</span>
            </div>
            {build ? (
              <div className="rounded-md border border-border bg-surface-subtle px-3 py-1.5 text-center text-fg">
                {build}
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-border/60 px-3 py-1.5 text-center text-xs text-fg-muted">
                —
              </div>
            )}
          </div>
        ))}
      </div>
      <Text size="xs" variant="muted" className="mt-3">
        <span className="text-accent">↘</span> handover at sprint 8 close-out · <span className="text-accent">↑</span> upstream technical assessment in parallel with the current ProductOps design loop
      </Text>
    </div>
  );
}

const fourDs = [
  {
    d: "D1",
    name: "Discover",
    mapsTo: "Research",
    blurb:
      "Field and exercise observations, interviews, environmental scans. Surface the real problem rather than the assumed one.",
  },
  {
    d: "D2",
    name: "Define",
    mapsTo: "Research",
    blurb:
      "Frame the problem, scope, and success criteria. Set the hypotheses the rest of the loop will test.",
  },
  {
    d: "D3",
    name: "Develop",
    mapsTo: "Design ↔ Test",
    blurb:
      "Prototype, put it in front of operators, learn, adjust. The high-cadence inner loop of the flywheel.",
  },
  {
    d: "D4",
    name: "Deliver",
    mapsTo: "Close-out",
    blurb:
      "Ship, hand over, or decide to stop. Capture what was learned and seed the next loop.",
  },
];

type CadenceRow = {
  when: string;
  what: string;
  detail: string;
};

type CadenceAside = {
  summary: string;
  paragraphs: string[];
  bullets?: string[];
  implication?: string;
};

type Cadence = {
  kind: string;
  title: string;
  subtitle: string;
  rows: CadenceRow[];
  footnote?: string;
  aside?: CadenceAside;
};

function CadenceCard({ cadence }: { cadence: Cadence }) {
  const { kind, title, subtitle, rows, footnote, aside } = cadence;
  return (
    <Card className="p-6">
      <Stack gap="4">
        <Stack gap="1">
          <Text size="xs" variant="muted" className="uppercase tracking-wide">
            {kind}
          </Text>
          <Heading as="h3" size="lg">
            {title}
          </Heading>
          <Text size="sm" variant="muted">
            {subtitle}
          </Text>
        </Stack>
        <div className="grid gap-3 sm:grid-cols-3">
          {rows.map(({ when, what, detail }) => (
            <div
              key={when}
              className="rounded-md border border-border bg-surface-subtle p-4"
            >
              <Text size="xs" variant="muted" className="uppercase tracking-wide">
                {when}
              </Text>
              <Text size="sm" className="font-semibold mt-1">
                {what}
              </Text>
              <Text size="sm" variant="muted" className="mt-1">
                {detail}
              </Text>
            </div>
          ))}
        </div>
        {aside ? (
          <details className="group rounded-md border border-border bg-surface-subtle p-4">
            <summary className="cursor-pointer list-none text-sm font-medium text-accent marker:hidden flex items-center gap-1">
              <span>{aside.summary}</span>
              <span className="transition-transform group-open:rotate-90" aria-hidden="true">›</span>
            </summary>
            <Stack gap="3" className="mt-3">
              <DualTrackDiagram />
              {aside.paragraphs.map((p) => (
                <Text key={p} size="sm" variant="muted">
                  {p}
                </Text>
              ))}
              {aside.bullets ? (
                <ul className="list-disc pl-5 space-y-1">
                  {aside.bullets.map((b) => (
                    <li key={b}>
                      <Text size="sm" variant="muted">
                        {b}
                      </Text>
                    </li>
                  ))}
                </ul>
              ) : null}
              {aside.implication ? (
                <Text size="sm" className="font-medium">
                  {aside.implication}
                </Text>
              ) : null}
            </Stack>
          </details>
        ) : null}
        {footnote ? (
          <Text size="sm" variant="muted">
            {footnote}
          </Text>
        ) : null}
      </Stack>
    </Card>
  );
}

const cadences: Record<"digital" | "engineering", Cadence> = {
  digital: {
    kind: "Digital programme",
    title: "Planning Interval (PI)",
    subtitle: "4 months · 8 sprints of 2 weeks",
    rows: [
      {
        when: "Sprints 1–2",
        what: "Research",
        detail:
          "Field and exercise observations, problem framing, opportunity mapping. Hypotheses and access already lined up from the previous PI's close-out.",
      },
      {
        when: "Sprints 3–7",
        what: "Rapid prototyping + user feedback",
        detail:
          "Tight Design ↔ Test loops each sprint — prototype, put it in front of operators, learn, adjust. The bulk of the flywheel spin happens here.",
      },
      {
        when: "Sprint 8",
        what: "Close-out + prep for next PI",
        detail:
          "Ship / kill / pivot decisions, retro and write-up, seed hypotheses for the next PI, line up Research access.",
      },
    ],
    footnote:
      "For a team just starting out with no prior PI, sprint 1 absorbs some kick-off work (hypotheses, access).",
    aside: {
      summary: "How this aligns with the DevSecOps PI",
      paragraphs: [
        "Because ProductOps produces working reference code in every Design ↔ Test iteration, DevSecOps does not have to wait for the PI close-out to engage. They run upstream technical assessment — feasibility, integration, security, tech debt — in parallel with the current ProductOps design loop. Risk is reduced continuously, not only at handover.",
        "The two PIs run as a dual-track model where ProductOps is always one PI ahead of DevSecOps. ProductOps designs and validates capability X in PI N while DevSecOps builds the previously-validated capability W and assesses X in the background. At sprint 8 close-out, validated X hands over to DevSecOps PI N+1, where the assessment work has already de-risked the build.",
      ],
      bullets: [
        "PI N (ProductOps): research, prototype, validate capability X — emit reference code each iteration.",
        "PI N (DevSecOps): build capability W (validated in PI N-1) and run upstream technical assessment on X.",
        "Sprint 8 close-out: validated X with draft requirements hands over to DevSecOps PI N+1.",
      ],
      implication:
        "Note: what ProductOps hands to DevSecOps is reference code that bootstraps development, not static designs. Working prototypes from the Design ↔ Test loop become the starting point for the build PI, alongside validated requirements.",
    },
  },
  engineering: {
    kind: "Engineering programme",
    title: "Design Innovation",
    subtitle: "4 months · 8 sprints of 2 weeks",
    rows: [
      {
        when: "Sprints 1–2",
        what: "Research",
        detail:
          "Concept of use, operator workflows, scenarios, current pain points. Engage units and exercises early.",
      },
      {
        when: "Sprints 3–7",
        what: "Rapid conceptualisation + operator feedback",
        detail:
          "Concept sketches, mock-ups, tabletop walkthroughs with operators. Refine the concept of use each sprint.",
      },
      {
        when: "Sprint 8",
        what: "Concept document + draft requirements",
        detail:
          "Consolidate the concept of use, draft requirements, hand off to the acquisition / build track.",
      },
    ],
    footnote:
      "Engineering programmes continue into an acquisition / build phase after design innovation. That phase is procurement- and process-heavy and not flywheel-shaped, so it is out of scope for this cheatsheet.",
  },
};
