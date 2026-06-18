import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import type { SxProps, Theme } from "@mui/material/styles";
import { CtaButton } from "../../button/CtaButton";
import type { CtaButtonProps } from "../../button/CtaButton";
import { Section, sectionTemplate } from "../Section";

export type CtaSectionChildren = SlotChildren<Slot<"title"> | Slot<"body">>;

export const ctaSectionTemplate = createTemplate<CtaSectionChildren>();

export type CtaSectionProps = {
  actions?: Pick<CtaButtonProps, "children" | "component" | "href" | "to" | "variant">[];
  children: CtaSectionChildren;
  sx?: SxProps<Theme>;
};

export function CtaSection({ actions = [], children, sx }: CtaSectionProps) {
  const { hasSlot, slot } = useSlot(children);

  return (
    <Section
      context={{
        listSx: {
          display: "grid",
          gap: 1.125
        },
        sx: [
          {
            background: "linear-gradient(180deg, #ffffff, #f7faff)",
            border: "1px solid #dbe5f4",
            borderRadius: "8px",
            boxShadow: "0 12px 30px rgba(31, 55, 97, 0.08)",
            p: 1.75,
            "& strong": {
              color: "#111827",
              fontSize: 14
            },
            "& p": {
              color: "#56657a",
              fontSize: 13,
              lineHeight: 1.45,
              m: 0
            }
          },
          ...(Array.isArray(sx) ? sx : [sx])
        ]
      }}
    >
      <sectionTemplate.content>
        {hasSlot.title ? <slot.title /> : null}
        {hasSlot.body ? <slot.body /> : null}
        {actions.slice(0, 2).map((action, index) => (
          <CtaButton key={index} sx={{ fontSize: 13, minHeight: 38, minWidth: 0, width: "100%" }} {...action} />
        ))}
      </sectionTemplate.content>
    </Section>
  );
}
