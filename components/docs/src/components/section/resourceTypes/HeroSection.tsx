import { createTemplate, useSlot } from "@beqa/react-slots";
import type { Slot, SlotChildren } from "@beqa/react-slots";
import { Box } from "@mui/material";
import { Section, sectionTemplate } from "../Section";

export type HeroSectionChildren = SlotChildren<Slot<"left"> | Slot<"right">>;

export const heroSectionTemplate = createTemplate<HeroSectionChildren>();

export function HeroSection({ children }: { children: HeroSectionChildren }) {
  const { slot } = useSlot(children);

  return (
    <Section
      context={{
        sx: {
          background:
            "radial-gradient(circle at 78% 25%, rgba(128, 90, 213, 0.52), transparent 32%), radial-gradient(circle at 42% 16%, rgba(37, 99, 235, 0.34), transparent 28%), linear-gradient(135deg, #070d1d 0%, #0d1830 48%, #23113f 100%)",
          color: "#ffffff",
          minHeight: 500,
          overflow: "hidden",
          p: { xs: "48px 22px 34px", md: "58px 64px 42px" },
          position: "relative"
        }
      }}
    >
      <sectionTemplate.header>
        <Box
          sx={{
            backgroundImage:
              "linear-gradient(rgba(93, 148, 255, 0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(93, 148, 255, 0.16) 1px, transparent 1px)",
            backgroundSize: "54px 54px",
            inset: 0,
            maskImage: "radial-gradient(circle at 62% 30%, #000 0%, transparent 62%)",
            opacity: 0.45,
            position: "absolute"
          }}
        />
      </sectionTemplate.header>
      <sectionTemplate.content>
        <Box
          sx={{
            alignItems: "center",
            display: "grid",
            gap: { xs: 5, lg: 8 },
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(320px, 0.95fr) minmax(340px, 1fr)"
            },
            maxWidth: 1180,
            mx: "auto",
            position: "relative",
            zIndex: 1
          }}
        >
          <Box
            sx={{
              "& h1": {
                color: "#ffffff",
                fontSize: { xs: 46, md: 56 },
                letterSpacing: 0,
                lineHeight: 1.04,
                m: 0,
                maxWidth: 620
              },
              "& h1 span": {
                background: "linear-gradient(100deg, #60a5fa, #c084fc, #f0abfc)",
                backgroundClip: "text",
                color: "transparent",
                display: "inline-block"
              },
              "& p": {
                color: "#d9e4f7",
                fontSize: { xs: 18, md: 19 },
                lineHeight: 1.6,
                m: "24px 0 0",
                maxWidth: 520
              }
            }}
          >
            <slot.left />
          </Box>
          <slot.right />
        </Box>
      </sectionTemplate.content>
    </Section>
  );
}
