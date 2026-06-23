import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { Section, type SectionData, type SectionProps } from "../Section";

type TimelineSectionVariant = "standard" | "banded";
type TimelineItemTone = "blue" | "green" | "navy" | "purple";

type TimelineSectionProps<T extends { color?: TimelineItemTone }> = {
  children: ReactNode;
  data: SectionData<T>;
  renderItem: NonNullable<SectionProps<T>["renderItem"]>;
  variant?: TimelineSectionVariant;
};

const headerSx = {
  "& h2": {
    color: "var(--docs-text-primary)",
    fontSize: 28,
    lineHeight: 1.2,
    m: "0 0 22px",
    textAlign: "center"
  }
};

const standardSectionSx = {
  mb: { xs: "34px", lg: "56px" },
  maxWidth: 1080,
  mx: "auto",
  pb: { xs: "18px", lg: "28px" },
  pt: "46px",
  px: { xs: "18px", sm: "32px" }
};

const bandedSectionSx = {
  background: "var(--docs-band-bg)",
  maxWidth: 1160,
  mt: "22px",
  mx: "auto",
  p: { xs: "32px 18px", sm: "32px 42px" }
};

const listSx = {
  "--timeline-connector-offset": "18px",
  "--timeline-gap": "20px",
  alignItems: "stretch",
  display: "grid",
  gap: "var(--timeline-gap)",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }
};

const cardSx = {
  "--timeline-card-padding-x": "18px",
  background: "var(--docs-card-bg)",
  border: "1px solid var(--docs-border)",
  borderRadius: "8px",
  boxShadow: "var(--docs-card-shadow)",
  minHeight: 144,
  p: "var(--timeline-card-padding-x)",
  position: "relative",
  "& .icon": {
    borderRadius: "8px",
    height: 42,
    width: 42
  },
  "& h3": {
    color: "var(--docs-text-primary)",
    fontSize: 16,
    m: "0 0 8px"
  },
  "& p": {
    color: "var(--docs-muted)",
    fontSize: 14,
    lineHeight: 1.55,
    m: 0
  },
  "& ul": {
    color: "var(--docs-text-secondary)",
    fontSize: 13,
    lineHeight: 1.75,
    m: 0,
    pl: "18px"
  }
};

const borderByTone: Record<TimelineItemTone, string> = {
  blue: "#d8e2f1",
  green: "#bbf7d0",
  navy: "#c7d2fe",
  purple: "#ddd6fe"
};

const connectorSx = {
  color: "var(--docs-muted)",
  display: { xs: "none", lg: "block" },
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: 0,
  lineHeight: 1,
  position: "absolute",
  pointerEvents: "none",
  right: "calc(var(--timeline-connector-offset) * -1)",
  textAlign: "center",
  top: "50%",
  transform: "translateY(-50%)",
  width: "var(--timeline-connector-offset)",
  zIndex: 2
};

export function TimelineSection<T extends { color?: TimelineItemTone }>({
  children,
  data,
  renderItem,
  variant = "standard"
}: TimelineSectionProps<T>) {
  return (
    <Section
      context={{
        headerSx,
        itemSx: (item) => ({
          ...cardSx,
          borderColor: item.color ? borderByTone[item.color] : cardSx.border,
          minHeight: variant === "banded" ? 154 : cardSx.minHeight
        }),
        listSx,
        sx: variant === "banded" ? bandedSectionSx : standardSectionSx,
        variant: "timeline"
      }}
      data={data}
      renderConnector={() => (
        <Box aria-hidden="true" component="span" data-timeline-connector sx={connectorSx}>
          {"->"}
        </Box>
      )}
      renderItem={renderItem}
    >
      {children}
    </Section>
  );
}
