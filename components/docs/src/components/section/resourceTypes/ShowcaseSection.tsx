import { Box } from "@mui/material";
import type { InstalledPackage } from "@uds-poc/shared";
import {
  ResourceCard,
  ResourceCardMediaBackground,
  ResourceCardVariant,
  type ResourceCardDefinition
} from "@uds-poc/shared-ui/components/card/resourceTypes/ResourceCard";
import type { DefinitionField } from "@uds-poc/shared-ui/components/list/resourceTypes/DefinitionList";
import { MetaList, type MetaListDefinition } from "@uds-poc/shared-ui/components/list/resourceTypes/MetaList";
import { ModalProvider } from "@uds-poc/shared-ui/store/modal.store";
import { CtaButton } from "../../button/CtaButton";
import { Chip } from "../../chip/Chip";
import { Section, sectionTemplate } from "../Section";
import { TabList } from "../../tabs/TabList";

type ShowcaseSectionProps = {
  resources: InstalledPackage[];
};

type ShowcaseContext = {
  onOpen: (url: string) => void;
};

export function ShowcaseSection({ resources }: ShowcaseSectionProps) {
  return (
    <Section
      context={{
        sx: {
          background: "var(--docs-showcase-bg)",
          border: "1px solid var(--docs-showcase-border)",
          borderRadius: "8px",
          boxShadow: "var(--docs-showcase-shadow)",
          p: { xs: 2.25, md: 3 },
          pb: { xs: 5.5, md: 5.25 },
          position: "relative",
          width: "100%"
        }
      }}
    >
      <sectionTemplate.content>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", mb: 2.25 }}>
          <Box component="strong" sx={{ color: "var(--docs-showcase-title)", fontSize: 18 }}>
            Installed Resources
          </Box>
          <Box
            aria-hidden="true"
            component="span"
            sx={{
              background: "var(--docs-showcase-orb)",
              borderRadius: "50%",
              boxShadow: "var(--docs-showcase-orb-shadow)",
              height: 8,
              width: 8
            }}
          />
        </Box>
        <TabList items={["All", "Apps", "Services", "Tools"].map((label) => ({ label }))} sx={{ mb: 2.25 }} />
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 230px))", xl: "repeat(2, minmax(0, 250px))" },
            justifyContent: "center"
          }}
        >
          <ModalProvider>
            {resources.map((resource) => (
              <ResourceCard
                context={{ onOpen: openExternalUrl }}
                definition={showcaseResourceDefinition}
                item={resource}
                key={resource.id}
                variant={ResourceCardVariant.Compact}
              />
            ))}
          </ModalProvider>
        </Box>
        <CtaButton
          href="/#/learn/product-model"
          sx={{
            display: "flex",
            fontWeight: 800,
            justifySelf: "center",
            mt: 3,
            textAlign: "center"
          }}
          to="/learn/product-model"
          variant="text"
        >
          View all resources
        </CtaButton>
        <Chip
          sx={{
            background: "var(--docs-showcase-chip-bg)",
            bottom: 14,
            border: "1px solid var(--docs-showcase-chip-border)",
            color: "var(--docs-showcase-chip-text)",
            position: "absolute",
            right: 18
          }}
        >
          Static Product Mockup
        </Chip>
      </sectionTemplate.content>
    </Section>
  );
}

const showcaseMetaDefinition = {
  density: "compact",
  fields: [
    {
      icon: "packageVersion",
      key: "version",
      label: "Version",
      value: ({ item }) => item.version
    },
    {
      icon: "open",
      key: "launchUrl",
      label: "Launch endpoint",
      value: ({ item }) => hostFromUrl(item.launchUrl)
    }
  ],
  omitEmptyValues: true
} satisfies MetaListDefinition<InstalledPackage, ShowcaseContext>;

const showcaseFields = [
  { key: "namespace", label: "Namespace", value: (pkg) => pkg.namespace },
  { key: "version", label: "Version", value: (pkg) => pkg.version },
  { key: "launchUrl", label: "Launch endpoint", value: (pkg) => hostFromUrl(pkg.launchUrl) },
  { key: "phase", label: "Phase", value: (pkg) => pkg.phase ?? pkg.status }
] satisfies Array<DefinitionField<InstalledPackage>>;

const showcaseResourceDefinition = {
  fields: showcaseFields,
  label: () => "Installed package",
  mediaBackground: ResourceCardMediaBackground.Auto,
  menuActions: ({ context, item }) => {
    const launchUrl = item.launchUrl;

    return launchUrl
      ? [
          {
            icon: "open",
            label: `Open ${titleForPackage(item.name)}`,
            onSelect: () => context.onOpen(launchUrl)
          }
        ]
      : [];
  },
  meta: ({ context, item, presentation }) => (
    <MetaList
      context={context}
      definition={showcaseMetaDefinition}
      item={item}
      presentation={presentation}
    />
  ),
  onSelect: ({ context, item }) => {
    if (item.launchUrl) {
      context.onOpen(item.launchUrl);
    }
  },
  title: ({ item }) => titleForPackage(item.name),
  variant: ResourceCardVariant.Compact
} satisfies ResourceCardDefinition<InstalledPackage, ShowcaseContext>;

function hostFromUrl(url: string | null) {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function titleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join("-");
}

function titleForPackage(value: string) {
  const titles: Record<string, string> = {
    "catalog-poc": "Catalog-POC",
    docs: "Docs",
    keycloak: "Keycloak",
    "uds-poc": "UDS-POC"
  };

  return titles[value] ?? titleCase(value);
}

function openExternalUrl(url: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
