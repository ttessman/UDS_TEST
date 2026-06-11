import type { ReactNode } from "react";
import { Box } from "@mui/material";
import { motion, useReducedMotion, type Variants } from "motion/react";

export const cardMotionTimings = {
  hover: { duration: 0.14, ease: [0.2, 0, 0, 1] },
  flip: { duration: 0.28, ease: [0, 0, 0.2, 1], type: "tween" }
} as const;

export const cardFlipVariants = {
  front: {
    rotateY: 0,
    scale: 1
  },
  back: {
    rotateY: 180,
    scale: 1
  },
  hover: {
    scale: 1.004,
    y: -1
  }
} satisfies Variants;

export function CardFlipRoot({ children, minHeight }: { children: ReactNode; minHeight?: number }) {
  return (
    <Box
      sx={{
        height: "100%",
        minHeight: minHeight ?? 230,
        perspective: "1200px"
      }}
    >
      {children}
    </Box>
  );
}

export function CardFlipStage({ children, flipped }: { children: ReactNode; flipped: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <Box
      component={motion.div}
      animate={flipped ? "back" : "front"}
      variants={reduceMotion ? undefined : cardFlipVariants}
      whileHover={reduceMotion ? undefined : "hover"}
      sx={{
        height: "100%",
        minHeight: "inherit",
        position: "relative",
        transformStyle: "preserve-3d"
      }}
      transition={cardMotionTimings.flip}
    >
      {children}
    </Box>
  );
}

export function CardFlipFace({
  children,
  flipped = false,
  visible
}: {
  children: ReactNode;
  flipped?: boolean;
  visible: boolean;
}) {
  return (
    <Box
      aria-hidden={!visible}
      sx={{
        backfaceVisibility: "hidden",
        height: "100%",
        inset: 0,
        pointerEvents: visible ? "auto" : "none",
        position: flipped ? "absolute" : "relative",
        transform: flipped ? "rotateY(180deg)" : "none"
      }}
    >
      {children}
    </Box>
  );
}
