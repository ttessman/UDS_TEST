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
  mb: { xs: "48px", lg: "76px" },
  maxWidth: 1080,
  mx: "auto",
  pb: { xs: "22px", lg: "34px" },
  pt: "46px",
  px: { xs: "18px", sm: "32px" }
};

const bandedSectionSx = {
  background: "var(--docs-band-bg)",
  mb: { xs: "48px", lg: "68px" },
  mt: { xs: "34px", lg: "48px" },
  mx: "auto",
  p: { xs: "34px 18px", sm: "38px 42px" },
  width: "100%"
};

const listSx = {
  "--timeline-connector-space": "42px",
  alignItems: "stretch",
  display: "grid",
  gap: { xs: "20px", md: "22px", lg: "var(--timeline-connector-space)" },
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
  "& .icon + h3": {
    mt: "12px"
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
  blue: "var(--docs-timeline-border-blue)",
  green: "var(--docs-timeline-border-green)",
  navy: "var(--docs-timeline-border-navy)",
  purple: "var(--docs-timeline-border-purple)"
};

const connectorSx = {
  alignItems: "center",
  color: "var(--docs-muted)",
  display: { xs: "none", lg: "flex" },
  fontSize: 14,
  fontWeight: 800,
  justifyContent: "center",
  letterSpacing: 0,
  lineHeight: 1,
  position: "absolute",
  pointerEvents: "none",
  right: "calc(var(--timeline-connector-space) * -1)",
  textAlign: "center",
  top: "50%",
  transform: "translateY(-50%)",
  width: "var(--timeline-connector-space)",
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
          ...(item.color
            ? { borderColor: borderByTone[item.color] }
            : {
                background: "var(--docs-timeline-card-background)",
                border: "1px solid transparent"
              }),
          minHeight: variant === "banded" ? 154 : cardSx.minHeight
        }),
        listSx: variant === "banded" ? { ...listSx, maxWidth: 1160, mx: "auto" } : listSx,
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
