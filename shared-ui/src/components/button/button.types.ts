import type { ButtonProps, IconButtonProps } from "@mui/material";
import type { ReactNode } from "react";
import type { AppIconName } from "../icon/AppIcon.js";

export type ActionButtonVariant = ButtonProps["variant"];

export type SharedButtonProps = {
  disabled?: boolean;
  icon: AppIconName;
  iconPosition?: "start" | "end";
  label: string;
  tooltip?: string;
};

export type BaseActionButtonProps = SharedButtonProps &
  Omit<ButtonProps, "children" | "disabled" | "endIcon" | "startIcon">;

export type BaseIconButtonProps = SharedButtonProps & Omit<IconButtonProps, "children" | "disabled">;

export type CountActionButtonProps = {
  count: number | string;
  disabled?: boolean;
  icon?: AppIconName;
  label: string;
  onClick?: ButtonProps["onClick"];
  tooltip?: string;
} & Omit<ButtonProps, "children" | "disabled" | "endIcon" | "startIcon">;

export type BaseButtonProps = {
  children?: ReactNode;
  disabled?: boolean;
  icon?: AppIconName;
  iconPosition?: "start" | "end";
  label: string;
  mode: "action" | "icon";
  tooltip?: string;
} & (
  | {
      mode: "action";
      props?: Omit<ButtonProps, "children" | "disabled" | "endIcon" | "startIcon">;
    }
  | {
      mode: "icon";
      props?: Omit<IconButtonProps, "children" | "disabled">;
    }
);
