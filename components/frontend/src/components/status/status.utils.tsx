import { AppIcon } from "../icon/AppIcon.js";
import type { StatusIndicatorTone } from "./status.types.js";

export function statusIcon(state: StatusIndicatorTone, fontSize: "inherit" | "small") {
  switch (state) {
    case "success":
      return <AppIcon fontSize={fontSize} name="statusSuccess" />;
    case "error":
      return <AppIcon fontSize={fontSize} name="statusError" />;
    case "warning":
      return <AppIcon fontSize={fontSize} name="statusWarning" />;
    case "info":
      return <AppIcon fontSize={fontSize} name="statusInfo" />;
    case "neutral":
      return <AppIcon fontSize={fontSize} name="statusUnknown" />;
  }
}

export function getStatusColors(tone: StatusIndicatorTone) {
  return statusColors[tone];
}

export const statusColors = {
  error: {
    bg: "var(--app-status-error-bg)",
    border: "var(--app-status-error-border)",
    main: "var(--app-status-error-main)",
    text: "var(--app-status-error-text)"
  },
  info: {
    bg: "var(--app-status-info-bg)",
    border: "var(--app-status-info-border)",
    main: "var(--app-status-info-main)",
    text: "var(--app-status-info-text)"
  },
  neutral: {
    bg: "var(--app-status-neutral-bg)",
    border: "var(--app-status-neutral-border)",
    main: "var(--app-status-neutral-main)",
    text: "var(--app-status-neutral-text)"
  },
  success: {
    bg: "var(--app-status-success-bg)",
    border: "var(--app-status-success-border)",
    main: "var(--app-status-success-main)",
    text: "var(--app-status-success-text)"
  },
  warning: {
    bg: "var(--app-status-warning-bg)",
    border: "var(--app-status-warning-border)",
    main: "var(--app-status-warning-main)",
    text: "var(--app-status-warning-text)"
  }
} satisfies Record<StatusIndicatorTone, { bg: string; border: string; main: string; text: string }>;
