import Link from "@docusaurus/Link";
import { Box } from "@mui/material";
import type { InstalledPackage } from "@uds-poc/shared";
import {
  ResourceCard,
  ResourceCardMediaBackground,
  ResourceCardVariant,
  type ResourceCardDefinition
} from "@uds-poc/shared-ui/components/card/resourceTypes/ResourceCard";
import { MetaList, type MetaListDefinition } from "@uds-poc/shared-ui/components/list/resourceTypes/MetaList";
import { ModalProvider } from "@uds-poc/shared-ui/store/modal.store";
import { CtaButton } from "../../button/CtaButton";
import { Chip } from "../../chip/Chip";
import { Section, sectionTemplate } from "../Section";
import { TabList } from "../../tabs/TabList";

type ShowcaseSectionProps = {
  resources: InstalledPackage[];
};

type ShowcaseContext = Record<string, never>;

export function ShowcaseSection({ resources }: ShowcaseSectionProps) {
  return (
    <Section
      context={{
        sx: {
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderRadius: "8px",
          boxShadow: "0 28px 80px rgba(8, 13, 32, 0.34)",
          p: { xs: 2.25, md: 3 },
          pb: { xs: 5.5, md: 5.25 },
          position: "relative",
          width: "100%"
        }
      }}
    >
      <sectionTemplate.content>
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", mb: 2.25 }}>
          <Box component="strong" sx={{ color: "#ffffff", fontSize: 18 }}>
            Installed Resources
          </Box>
          <Box
            aria-hidden="true"
            component="span"
            sx={{
              background: "#8b5cf6",
              borderRadius: "50%",
              boxShadow: "0 0 28px rgba(139, 92, 246, 0.75)",
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
                context={{}}
                definition={showcaseResourceDefinition}
                item={resource}
                key={resource.id}
                variant={ResourceCardVariant.Compact}
              />
            ))}
          </ModalProvider>
        </Box>
        <CtaButton
          component={Link}
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
            background: "rgba(219, 234, 254, 0.08)",
            bottom: 14,
            border: "1px solid rgba(219, 234, 254, 0.14)",
            color: "rgba(219, 234, 254, 0.68)",
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

const showcaseResourceDefinition = {
  label: () => "Installed package",
  mediaBackground: ResourceCardMediaBackground.Auto,
  menu: { enabled: false },
  meta: ({ context, item, presentation }) =>
    presentation === "overlayIconOnly" ? (
      <MetaList
        context={context}
        definition={showcaseMetaDefinition}
        item={item}
        presentation={presentation}
      />
    ) : null,
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
