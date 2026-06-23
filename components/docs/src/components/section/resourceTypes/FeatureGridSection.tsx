import type { ReactNode } from "react";
import { Section, type SectionData, type SectionProps } from "../Section";

type FeatureGridSectionProps<T> = {
  children: ReactNode;
  data: SectionData<T>;
  renderItem: NonNullable<SectionProps<T>["renderItem"]>;
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
  background: "var(--docs-band-bg)",
  mb: { xs: "42px", lg: "60px" },
  mt: { xs: "32px", lg: "44px" },
  mx: "auto",
  p: { xs: "34px 18px", sm: "38px 42px" },
  width: "100%"
};

const listSx = {
  display: "grid",
  gap: "20px",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
  maxWidth: 1160,
  mx: "auto"
};

const itemSx = {
  alignItems: "start",
  display: "grid",
  gap: "12px",
  gridTemplateColumns: "42px minmax(0, 1fr)",
  "& .icon": {
    height: 40,
    width: 40
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
  }
};

export function FeatureGridSection<T>({ children, data, renderItem }: FeatureGridSectionProps<T>) {
  return (
    <Section
      context={{
        headerSx,
        itemSx,
        listSx,
        sx: sectionSx
      }}
      data={data}
      renderItem={renderItem}
    >
      {children}
    </Section>
  );
}
