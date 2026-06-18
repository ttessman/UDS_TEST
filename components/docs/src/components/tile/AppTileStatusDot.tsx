import type { ReactNode } from "react";
import { Box } from "@mui/material";

export type AppTileStatus = {
  label: string;
  tone?: "success" | "warning" | "neutral";
};

const statusSx = {
  neutral: {
    background: "rgba(148, 163, 184, 0.2)",
    color: "#dbeafe"
  },
  success: {
    background: "rgba(34, 197, 94, 0.18)",
    color: "#bbf7d0"
  },
  warning: {
    background: "rgba(245, 158, 11, 0.18)",
    color: "#fde68a"
  }
} satisfies Record<NonNullable<AppTileStatus["tone"]>, object>;

export function AppTileStatusDot({ status }: { status: AppTileStatus | ReactNode }) {
  if (!isStatusObject(status)) {
    return <>{status}</>;
  }

  return (
    <Box
      aria-label={status.label}
      component="span"
      sx={{
        aspectRatio: "1",
        border: "3px solid rgba(71, 85, 105, 0.74)",
        borderRadius: "50%",
        boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.18)",
        height: 20,
        position: "absolute",
        right: "calc(50% - 42px)",
        top: "calc(50% - 22px)",
        width: 20,
        ...(statusSx[status.tone ?? "success"])
      }}
      title={status.label}
    />
  );
}

function isStatusObject(status: AppTileStatus | ReactNode): status is AppTileStatus {
  return Boolean(status && typeof status === "object" && "label" in status);
}
