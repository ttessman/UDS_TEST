import type { ReactNode } from "react";
import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { CtaButton } from "../../button/CtaButton";
import type { CtaButtonProps } from "../../button/CtaButton";
import { Section, sectionTemplate } from "../Section";

export type BannerSectionChildren = SlotChildren<Slot<"graphic"> | Slot<"content">>;

export const bannerSectionTemplate = createTemplate<BannerSectionChildren>();

export type BannerSectionAction = Pick<CtaButtonProps, "children" | "component" | "href" | "to" | "variant">;

export type BannerSectionProps = {
  actions?: BannerSectionAction[];
  children: BannerSectionChildren;
  sx?: SxProps<Theme>;
};

export function BannerSection({ actions = [], children, sx }: BannerSectionProps) {
  const { hasSlot, slot } = useSlot(children);

  return (
    <Section
      context={{
        listSx: {
          alignItems: "center",
          display: "grid",
          gap: 3.5,
          gridTemplateColumns: "180px minmax(0, 1fr) 220px",
          "@media (max-width: 960px)": {
            gridTemplateColumns: "1fr"
          }
        },
        sx: [
          {
            background:
              "radial-gradient(circle at 14% 50%, rgba(124, 58, 237, 0.48), transparent 25%), linear-gradient(135deg, #071024, #111b35 54%, #0b1224)",
            borderRadius: "8px",
            boxShadow: "0 28px 65px rgba(15, 23, 42, 0.18)",
            color: "#ffffff",
            maxWidth: 1080,
            mx: "auto",
            my: "48px",
            p: "30px 36px",
            "& h2": {
              color: "#ffffff",
              m: "0 0 10px"
            },
            "& p": {
              color: "#cbd5e1",
              fontSize: 14,
              lineHeight: 1.55,
              m: 0
            },
            "@media (max-width: 960px)": {
              mx: "18px"
            }
          },
          ...(Array.isArray(sx) ? sx : [sx])
        ]
      }}
    >
      <sectionTemplate.content>
        {hasSlot.graphic ? <slot.graphic /> : null}
        {hasSlot.content ? <slot.content /> : null}
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {actions.slice(0, 2).map((action, index) => (
            <CtaButton key={index} {...action} />
          ))}
        </Box>
      </sectionTemplate.content>
    </Section>
  );
}
