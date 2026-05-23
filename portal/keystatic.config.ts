import { collection, config, fields } from "@keystatic/core";

const PHASE_OPTIONS = [
  { label: "Research", value: "research" },
  { label: "Design", value: "design" },
  { label: "Test", value: "test" },
  { label: "Cross-phase", value: "cross-phase" },
] as const;

const DOMAIN_OPTIONS = [
  { label: "Shared (digital + engineering)", value: "shared" },
  { label: "Digital", value: "digital" },
  { label: "Engineering", value: "engineering" },
] as const;

const VISIBILITY_OPTIONS = [
  { label: "Public (safe for the internet prototype)", value: "public" },
  { label: "Internal (airgap deployment only)", value: "internal" },
] as const;

const AVAILABILITY_OPTIONS = [
  { label: "Available", value: "available" },
  { label: "Early access (pilot)", value: "early-access" },
  { label: "Planned", value: "planned" },
  { label: "Unspecified", value: "unspecified" },
] as const;

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "ProductOps Co-pilot" },
    navigation: {
      Content: ["pages", "phaseNarratives"],
      Pipeline: ["tools", "prompts"],
      Journeys: ["journeys"],
      Knowledge: ["caseStudies"],
    },
  },
  collections: {
    pages: collection({
      label: "Pages",
      slugField: "slug",
      path: "content/pages/*",
      format: { contentField: "body" },
      schema: {
        slug: fields.slug({
          name: { label: "Slug", validation: { length: { min: 1 } } },
        }),
        title: fields.text({ label: "Title", validation: { length: { min: 1 } } }),
        eyebrow: fields.text({ label: "Eyebrow", description: "Small caps label above the title (optional)" }),
        lede: fields.text({
          label: "Lede",
          multiline: true,
          description: "One-paragraph intro, shown under the title.",
        }),
        visibility: fields.select({
          label: "Visibility",
          options: VISIBILITY_OPTIONS,
          defaultValue: "public",
        }),
        body: fields.mdx({ label: "Body" }),
      },
    }),

    phaseNarratives: collection({
      label: "Phase narratives",
      slugField: "phase",
      path: "content/phases/*",
      format: { contentField: "body" },
      schema: {
        phase: fields.slug({
          name: { label: "Phase", validation: { length: { min: 1 } } },
        }),
        title: fields.text({ label: "Display title" }),
        lede: fields.text({ label: "Lede", multiline: true }),
        artefactChecklist: fields.array(
          fields.object({
            label: fields.text({ label: "Item label" }),
            description: fields.text({ label: "Description", multiline: true }),
          }),
          {
            label: "Artefact checklist",
            itemLabel: (item) => item.fields.label.value,
          },
        ),
        artefacts: fields.array(
          fields.object({
            name: fields.text({ label: "Artefact name" }),
            description: fields.text({ label: "One-line description", multiline: true }),
            domain: fields.select({
              label: "Domain",
              options: DOMAIN_OPTIONS,
              defaultValue: "shared",
            }),
            promptSlugs: fields.array(
              fields.relationship({ label: "Prompt", collection: "prompts" }),
              { label: "AI prompts", itemLabel: (item) => item.value ?? "—" },
            ),
            toolSlugs: fields.array(
              fields.relationship({ label: "Tool", collection: "tools" }),
              { label: "Tools", itemLabel: (item) => item.value ?? "—" },
            ),
            annotation: fields.text({
              label: "Annotation (optional)",
              description:
                "Short note shown in italics, e.g. 'Team-authored — no AI shortcut'",
            }),
          }),
          {
            label: "Artefacts",
            itemLabel: (item) => item.fields.name.value,
          },
        ),
        body: fields.mdx({ label: "Body" }),
      },
    }),

    tools: collection({
      label: "Tools",
      slugField: "slug",
      path: "content/tools/*",
      format: { contentField: "description" },
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        name: fields.text({ label: "Name", validation: { length: { min: 1 } } }),
        phase: fields.select({
          label: "Phase",
          options: PHASE_OPTIONS,
          defaultValue: "research",
        }),
        domain: fields.select({
          label: "Domain",
          options: DOMAIN_OPTIONS,
          defaultValue: "shared",
        }),
        type: fields.select({
          label: "Build type",
          options: [
            { label: "Bespoke", value: "bespoke" },
            { label: "COTS", value: "cots" },
          ],
          defaultValue: "cots",
        }),
        availability: fields.object(
          {
            internet: fields.select({
              label: "Internet",
              options: AVAILABILITY_OPTIONS,
              defaultValue: "unspecified",
            }),
            ace: fields.select({
              label: "ACE",
              options: AVAILABILITY_OPTIONS,
              defaultValue: "unspecified",
            }),
            mcc: fields.select({
              label: "MCC",
              options: AVAILABILITY_OPTIONS,
              defaultValue: "unspecified",
            }),
            anzC: fields.select({
              label: "ANZ C",
              options: AVAILABILITY_OPTIONS,
              defaultValue: "unspecified",
            }),
            anzS: fields.select({
              label: "ANZ S",
              options: AVAILABILITY_OPTIONS,
              defaultValue: "unspecified",
            }),
          },
          {
            label: "Availability by environment",
            description:
              "Per-environment status. Leave all fields as 'unspecified' if no environment commitment has been made yet — the renderer will show 'Planned — environments TBD'.",
          },
        ),
        accessLink: fields.url({
          label: "Access link",
          description: "External URL where teams can reach the tool (optional)",
        }),
        visibility: fields.select({
          label: "Visibility",
          options: VISIBILITY_OPTIONS,
          defaultValue: "public",
        }),
        prompts: fields.array(
          fields.relationship({ label: "Prompt", collection: "prompts" }),
          { label: "Linked prompts", itemLabel: (item) => item.value ?? "—" },
        ),
        promptsHeading: fields.text({
          label: "Prompts section heading (optional)",
          description:
            "Override the default 'Prompts for {tool name}' heading. Use for tools with bespoke prompt sections (e.g. CLARA).",
        }),
        promptsLede: fields.text({
          label: "Prompts section lede (optional)",
          description:
            "Override the default lede above the prompt tiles. Use for tools with bespoke prompt sections.",
          multiline: true,
        }),
        description: fields.mdx({ label: "Description" }),
      },
    }),

    prompts: collection({
      label: "Prompts",
      slugField: "slug",
      path: "content/prompts/*",
      format: { contentField: "body" },
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        title: fields.text({ label: "Title", validation: { length: { min: 1 } } }),
        phase: fields.select({
          label: "Phase",
          options: PHASE_OPTIONS,
          defaultValue: "research",
        }),
        domain: fields.select({
          label: "Domain",
          options: DOMAIN_OPTIONS,
          defaultValue: "shared",
        }),
        tool: fields.relationship({
          label: "Tool",
          collection: "tools",
          description: "The tool this prompt is designed for (optional)",
        }),
        task: fields.text({
          label: "Task",
          description: "Short verb-phrase describing what the prompt does (e.g. 'Synthesise interview notes')",
        }),
        expectedOutput: fields.text({
          label: "Expected output",
          multiline: true,
          description: "One-line description of what the LLM should produce",
        }),
        inputsFrom: fields.array(
          fields.relationship({ label: "Upstream prompt", collection: "prompts" }),
          {
            label: "Upstream prompts (chain)",
            description:
              "Prompts whose outputs naturally feed into this prompt's inputs. Tokens in the body should match.",
            itemLabel: (item) => item.value ?? "—",
          },
        ),
        confluenceContext: fields.object(
          {
            inputs: fields.array(
              fields.object({
                what: fields.text({ label: "What input" }),
                description: fields.text({
                  label: "Search hint",
                  multiline: true,
                  description:
                    "Natural-language description an MCP-equipped LLM can use to find this input in Confluence. Include common alternative names / tags / folder patterns.",
                }),
              }),
              {
                label: "Inputs to gather from Confluence",
                itemLabel: (item) => item.fields.what.value || "—",
              },
            ),
            outputPathTemplate: fields.text({
              label: "Output path template",
              description:
                "Canonical Confluence path the prompt's output should be filed at. Use {{programme}} as the programme token.",
            }),
            outputLabels: fields.array(fields.text({ label: "Label" }), {
              label: "Labels to apply",
              itemLabel: (item) => item.value || "—",
            }),
          },
          {
            label: "Confluence context (MCP-integrated mode)",
            description:
              "Optional. Lets the portal render input/output paths as a sidebar and lets MCP-equipped LLMs file outputs automatically. Leave fields empty for copy-paste-only prompts.",
          },
        ),
        visibility: fields.select({
          label: "Visibility",
          options: VISIBILITY_OPTIONS,
          defaultValue: "public",
        }),
        promptBody: fields.text({
          label: "Prompt body (paste-pattern prompts)",
          multiline: true,
          description:
            "The full prompt text users paste into an LLM. Use {{TOKEN}} placeholders for inputs. Leave blank for CLARA-invocation prompts that use copyBlock instead.",
        }),
        inputs: fields.array(
          fields.object({
            token: fields.text({
              label: "Token name (without braces)",
              description: "e.g. 'PRD' for {{PRD}}",
            }),
            description: fields.text({
              label: "Description",
              multiline: true,
              description: "What this input is. Markdown links supported.",
            }),
            optional: fields.checkbox({
              label: "Optional",
              defaultValue: false,
            }),
            examples: fields.array(fields.text({ label: "Example" }), {
              label: "Example values",
              itemLabel: (item) => item.value || "—",
            }),
          }),
          {
            label: "Inputs (paste-pattern prompts)",
            itemLabel: (item) => item.fields.token.value || "—",
            description:
              "Token-by-token list of inputs the user fills into the prompt body. Used by paste-pattern prompts; leave empty for CLARA-invocation prompts.",
          },
        ),
        outputDestination: fields.text({
          label: "Output destination",
          multiline: true,
          description:
            "Where the LLM output should go (repo, design tool, DASH, etc.). Used for paste-pattern prompts whose output doesn't file to Confluence.",
        }),
        body: fields.mdx({
          label: "Body / tips",
          description: "Tips, gotchas, and any other explanatory prose.",
        }),
      },
    }),

    journeys: collection({
      label: "Journeys",
      slugField: "slug",
      path: "content/journeys/*",
      format: { contentField: "intro" },
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        title: fields.text({ label: "Title", validation: { length: { min: 1 } } }),
        scenario: fields.text({
          label: "Scenario",
          description: "Who is this for and when? (e.g. 'A new project lead in their first week')",
        }),
        order: fields.integer({
          label: "Order",
          description: "Display order on the journeys index. Lower numbers appear first.",
          defaultValue: 100,
        }),
        visibility: fields.select({
          label: "Visibility",
          options: VISIBILITY_OPTIONS,
          defaultValue: "public",
        }),
        steps: fields.array(
          fields.object({
            label: fields.text({ label: "Step label" }),
            description: fields.text({ label: "Description", multiline: true }),
            prompt: fields.relationship({ label: "Prompt", collection: "prompts" }),
            tool: fields.relationship({ label: "Tool", collection: "tools" }),
          }),
          {
            label: "Steps",
            itemLabel: (item) => item.fields.label.value || "Untitled step",
          },
        ),
        intro: fields.mdx({ label: "Intro" }),
      },
    }),

    caseStudies: collection({
      label: "Case studies",
      slugField: "slug",
      path: "content/case-studies/*",
      format: { contentField: "body" },
      schema: {
        slug: fields.slug({ name: { label: "Slug" } }),
        title: fields.text({ label: "Title", validation: { length: { min: 1 } } }),
        phase: fields.select({
          label: "Phase",
          options: PHASE_OPTIONS,
          defaultValue: "cross-phase",
        }),
        visibility: fields.select({
          label: "Visibility",
          options: VISIBILITY_OPTIONS,
          defaultValue: "internal",
          description: "Default: internal — case studies typically contain programme-specific detail.",
        }),
        body: fields.mdx({ label: "Body" }),
      },
    }),
  },
});
