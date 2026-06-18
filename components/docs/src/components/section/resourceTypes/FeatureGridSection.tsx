import type { ReactNode } from "react";
import { Section, type SectionData, type SectionProps } from "../Section";

type FeatureGridSectionProps<T> = {
  children: ReactNode;
  data: SectionData<T>;
  renderItem: NonNullable<SectionProps<T>["renderItem"]>;
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

const sectionSx = {
  background: "linear-gradient(90deg, #f8fbff, #eef6ff 50%, #f8fbff)",
  maxWidth: 1160,
  mt: "26px",
  mx: "auto",
  p: { xs: "30px 18px", sm: "30px 42px" }
};

const listSx = {
  display: "grid",
  gap: "20px",
  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }
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
    color: "#111827",
    fontSize: 16,
    m: "0 0 8px"
  },
  "& p": {
    color: "#56657a",
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
