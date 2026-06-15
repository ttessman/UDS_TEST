import type { ReactNode } from "react";
import type { DialogProps, SxProps, Theme } from "@mui/material";
import type { AppIconName } from "../icon/AppIcon.js";
import type { ActionButtonVariant } from "../button/button.types.js";

export type ModalAction = {
  disabled?: boolean;
  icon: AppIconName;
  label: string;
  onClick: () => void;
  sx?: SxProps<Theme>;
  variant?: ActionButtonVariant;
};

export type ModalDefinition = {
  actions?: ModalAction[];
  contentSx?: SxProps<Theme>;
  dividers?: boolean;
  maxWidth?: DialogProps["maxWidth"];
  title: ReactNode;
};
