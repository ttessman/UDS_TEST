import { Box } from "@mui/material";
import type { ProblemStoryGraphicKind, ProofStoryGraphicKind } from "../../pages/microsite/microsite.types";

export type StoryGraphicShape = {
  sx: object;
};

const baseShapeSx = {
  background: "#ffffff",
  borderRadius: "8px",
  boxShadow: "0 8px 18px rgba(32, 55, 91, 0.08)",
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
    { sx: { background: "#fee2e2", height: 16, right: 32, top: 28, width: 58 } },
    { sx: { background: "#fef3c7", height: 16, right: 32, top: 54, width: 58 } },
    { sx: { height: 12, left: 28, top: 62, width: 84 } }
  ],
  users: [
    { sx: { borderRadius: "50%", height: 34, left: 44, top: 22, width: 34 } },
    { sx: { height: 38, left: 28, top: 62, width: 66 } },
    { sx: { borderRadius: "50%", height: 34, right: 44, top: 22, width: 34 } },
    { sx: { height: 38, right: 28, top: 62, width: 66 } },
    { sx: { background: "#94a3b8", height: 3, left: 104, top: 52, width: 62 } }
  ]
} satisfies Record<ProblemStoryGraphicKind, StoryGraphicShape[]>;

export const proofStoryGraphics = {
  flow: [
    { sx: { background: "#dbeafe", height: 13, left: 20, top: 22, width: 118 } },
    { sx: { background: "#bbf7d0", height: 9, right: 22, top: 24, width: 22 } },
    { sx: { background: "#eef2ff", height: 13, left: 20, top: 49, width: 96 } },
    { sx: { background: "#bfdbfe", height: 9, right: 22, top: 51, width: 22 } },
    { sx: { background: "#eef2ff", height: 13, left: 20, top: 76, width: 112 } }
  ],
  installed: [
    { sx: { background: "#eff6ff", height: 12, left: 20, top: 20, width: 132 } },
    { sx: { background: "#bbf7d0", height: 12, right: 20, top: 43, width: 54 } },
    { sx: { background: "#bbf7d0", height: 12, right: 20, top: 66, width: 54 } },
    { sx: { background: "#fee2e2", height: 12, left: 20, top: 66, width: 76 } }
  ],
  launch: [
    { sx: { background: "#dbeafe", height: 48, left: 24, top: 28, width: 76 } },
    { sx: { background: "#2563eb", height: 28, right: 24, top: 38, width: 70 } }
  ],
  metadata: [
    { sx: { background: "#dbeafe", height: 44, left: 20, top: 20, width: 54 } },
    { sx: { height: 10, left: 88, top: 24, width: 76 } },
    { sx: { height: 10, left: 88, top: 44, width: 54 } },
    { sx: { background: "#e0f2fe", height: 18, left: 20, top: 78, width: 46 } },
    { sx: { background: "#f1f5f9", height: 18, left: 74, top: 78, width: 42 } }
  ],
  store: [
    { sx: { background: "#eff6ff", height: 12, left: 18, top: 18, width: 132 } },
    { sx: { background: "#dbeafe", height: 10, left: 18, top: 43, width: 78 } },
    { sx: { background: "#dbeafe", height: 10, left: 18, top: 64, width: 94 } },
    { sx: { background: "#bbf7d0", height: 10, right: 18, top: 43, width: 45 } }
  ]
} satisfies Record<ProofStoryGraphicKind, StoryGraphicShape[]>;

export function StoryGraphic({ shapes }: { shapes: StoryGraphicShape[] }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        background: "linear-gradient(180deg, #f8fbff, #eef5ff)",
        border: "1px solid #e0e8f5",
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
