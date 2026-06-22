import { Box } from "@mui/material";
import type { ProblemStoryGraphicKind, ProofStoryGraphicKind } from "../../pages/microsite/microsite.types";

export type StoryGraphicShape = {
  sx: object;
};

const baseShapeSx = {
  background: "var(--docs-graphic-line)",
  borderRadius: "8px",
  boxShadow: "0 8px 18px rgba(2, 6, 23, 0.12)",
  display: "block",
  position: "absolute"
};

export const problemStoryGraphics = {
  list: [
    { sx: { height: 10, left: 22, top: 24, width: 92 } },
    { sx: { height: 10, left: 22, top: 45, width: 78 } },
    { sx: { height: 10, left: 22, top: 66, width: 104 } },
    { sx: { height: 44, right: 28, top: 28, width: 92 } }
  ],
  state: [
    { sx: { height: 12, left: 28, top: 26, width: 104 } },
    { sx: { background: "var(--docs-graphic-danger)", height: 16, right: 32, top: 28, width: 58 } },
    { sx: { background: "var(--docs-graphic-warning)", height: 16, right: 32, top: 54, width: 58 } },
    { sx: { height: 12, left: 28, top: 62, width: 84 } }
  ],
  users: [
    { sx: { borderRadius: "50%", height: 34, left: 44, top: 22, width: 34 } },
    { sx: { height: 38, left: 28, top: 62, width: 66 } },
    { sx: { borderRadius: "50%", height: 34, right: 44, top: 22, width: 34 } },
    { sx: { height: 38, right: 28, top: 62, width: 66 } },
    { sx: { background: "var(--docs-graphic-block)", height: 3, left: 104, top: 52, width: 62 } }
  ]
} satisfies Record<ProblemStoryGraphicKind, StoryGraphicShape[]>;

export const proofStoryGraphics = {
  flow: [
    { sx: { background: "var(--docs-graphic-muted-line)", height: 13, left: 20, top: 22, width: 118 } },
    { sx: { background: "var(--docs-graphic-success)", height: 9, right: 22, top: 24, width: 22 } },
    { sx: { background: "var(--docs-graphic-soft)", height: 13, left: 20, top: 49, width: 96 } },
    { sx: { background: "var(--docs-graphic-accent)", height: 9, right: 22, top: 51, width: 22 } },
    { sx: { background: "var(--docs-graphic-soft)", height: 13, left: 20, top: 76, width: 112 } }
  ],
  installed: [
    { sx: { background: "var(--docs-graphic-soft)", height: 12, left: 20, top: 20, width: 132 } },
    { sx: { background: "var(--docs-graphic-success)", height: 12, right: 20, top: 43, width: 54 } },
    { sx: { background: "var(--docs-graphic-success)", height: 12, right: 20, top: 66, width: 54 } },
    { sx: { background: "var(--docs-graphic-danger)", height: 12, left: 20, top: 66, width: 76 } }
  ],
  launch: [
    { sx: { background: "var(--docs-graphic-muted-line)", height: 48, left: 24, top: 28, width: 76 } },
    { sx: { background: "var(--docs-graphic-accent)", height: 28, right: 24, top: 38, width: 70 } }
  ],
  metadata: [
    { sx: { background: "var(--docs-graphic-muted-line)", height: 44, left: 20, top: 20, width: 54 } },
    { sx: { height: 10, left: 88, top: 24, width: 76 } },
    { sx: { height: 10, left: 88, top: 44, width: 54 } },
    { sx: { background: "var(--docs-graphic-accent)", height: 18, left: 20, top: 78, width: 46 } },
    { sx: { background: "var(--docs-graphic-soft)", height: 18, left: 74, top: 78, width: 42 } }
  ],
  store: [
    { sx: { background: "var(--docs-graphic-soft)", height: 12, left: 18, top: 18, width: 132 } },
    { sx: { background: "var(--docs-graphic-muted-line)", height: 10, left: 18, top: 43, width: 78 } },
    { sx: { background: "var(--docs-graphic-muted-line)", height: 10, left: 18, top: 64, width: 94 } },
    { sx: { background: "var(--docs-graphic-success)", height: 10, right: 18, top: 43, width: 45 } }
  ]
} satisfies Record<ProofStoryGraphicKind, StoryGraphicShape[]>;

export function StoryGraphic({ shapes }: { shapes: StoryGraphicShape[] }) {
  return (
    <Box
      aria-hidden="true"
      data-story-graphic
      sx={{
        background: "var(--docs-graphic-bg)",
        border: "1px solid var(--docs-border)",
        borderRadius: "8px",
        height: 118,
        mb: 2,
        overflow: "hidden",
        position: "relative"
      }}
    >
      {shapes.map((shape, index) => (
        <Box component="span" key={index} sx={{ ...baseShapeSx, ...shape.sx }} />
      ))}
    </Box>
  );
}
