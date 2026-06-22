import type { ReactNode } from "react";
import { Section, type SectionData, type SectionProps } from "../Section";

type CardGridSectionVariant = "standard" | "compact";

type CardGridSectionProps<T> = {
  children: ReactNode;
  data: SectionData<T>;
  renderItem: NonNullable<SectionProps<T>["renderItem"]>;
  variant?: CardGridSectionVariant;
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

const sectionSx = {
  maxWidth: 1080,
  mx: "auto",
  pt: "46px",
  px: { xs: "18px", sm: "32px" }
};

const cardSx = {
  background: "var(--docs-card-bg)",
  border: "1px solid var(--docs-border)",
  borderRadius: "8px",
  boxShadow: "var(--docs-card-shadow)",
  p: "22px",
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
  }
};

const compactCardSx = {
  ...cardSx,
  p: "14px"
};

const listSxByVariant = {
  compact: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(5, minmax(0, 1fr))" }
  },
  standard: {
    display: "grid",
    gap: "20px",
    gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }
  }
};

export function CardGridSection<T>({ children, data, renderItem, variant = "standard" }: CardGridSectionProps<T>) {
  return (
    <Section
      context={{
        headerSx,
        itemSx: variant === "compact" ? compactCardSx : cardSx,
        listSx: listSxByVariant[variant],
        sx: sectionSx
      }}
      data={data}
      renderItem={renderItem}
    >
      {children}
    </Section>
  );
}
