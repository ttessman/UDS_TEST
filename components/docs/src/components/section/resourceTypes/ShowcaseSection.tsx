import Link from "@docusaurus/Link";
import { Box } from "@mui/material";
import { CtaButton } from "../../button/CtaButton";
import { Section, sectionTemplate } from "../Section";
import { AppTile } from "../../tile/AppTile";
import { TabList } from "../../tabs/TabList";
import type { InstalledResource } from "../../../pages/microsite/microsite.types";

type ShowcaseSectionProps = {
  resources: InstalledResource[];
};

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
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }
          }}
        >
          {resources.map((resource) => (
            <AppTile
              action={
                <CtaButton component="button" type="button" variant="compactGhost">
                  Launch
                </CtaButton>
              }
              iconTone={resource.tone}
              key={resource.name}
              meta={`${resource.version} · ${resource.host}`}
              status={{ label: "Installed", tone: "success" }}
              title={resource.name}
              variant="compact"
            />
          ))}
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
      </sectionTemplate.content>
    </Section>
  );
}
