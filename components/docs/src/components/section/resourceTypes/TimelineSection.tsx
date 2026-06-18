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
    color: "#111827",
    fontSize: 28,
    lineHeight: 1.2,
    m: "0 0 22px",
    textAlign: "center"
  }
};

const standardSectionSx = {
  maxWidth: 1080,
  mx: "auto",
  pt: "46px",
  px: { xs: "18px", sm: "32px" }
};

const bandedSectionSx = {
  background: "linear-gradient(90deg, #f8fbff, #f3fff9 52%, #f8fbff)",
  maxWidth: 1160,
  mt: "22px",
  mx: "auto",
  p: { xs: "32px 18px", sm: "32px 42px" }
};

const listSx = {
  alignItems: "stretch",
  display: "grid",
  gap: "20px",
  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }
};

const cardSx = {
  background: "rgba(255, 255, 255, 0.92)",
  border: "1px solid #d8e2f1",
  borderRadius: "8px",
  boxShadow: "0 16px 38px rgba(30, 49, 78, 0.08)",
  minHeight: 144,
  p: "18px",
  position: "relative",
  "& .icon": {
    borderRadius: "8px",
    height: 42,
    width: 42
  },
  "& h3": {
    color: "#111827",
    fontSize: 16,
    m: "0 0 8px"
  },
  "& p": {
    color: "#56657a",
    fontSize: 14,
    lineHeight: 1.55,
    m: 0
  },
  "& ul": {
    color: "#334155",
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
  color: "#64748b",
  display: { xs: "none", lg: "block" },
  fontSize: 14,
  fontWeight: 800,
  letterSpacing: 0,
  position: "absolute",
  right: "-28px",
  top: "50%",
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
        <Box aria-hidden="true" component="span" sx={connectorSx}>
          {"->"}
        </Box>
      )}
      renderItem={renderItem}
    >
      {children}
    </Section>
  );
}
