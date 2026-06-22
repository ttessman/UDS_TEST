import { Grow } from "@mui/material";

export const modalMotion = {
  backdropTransitionDuration: { enter: 100, exit: 80 },
  paperSx: {
    transformOrigin: "center top"
  },
  transitionComponent: Grow,
  transitionTimeout: { appear: 150, enter: 150, exit: 100 }
} as const;
