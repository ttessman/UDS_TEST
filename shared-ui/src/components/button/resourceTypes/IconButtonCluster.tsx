import type { ReactNode } from "react";
import { Stack } from "@mui/material";
import type { StackProps } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type IconButtonClusterProps = Omit<StackProps, "children" | "sx"> & {
  animate?: unknown;
  children: ReactNode;
  initial?: unknown;
  sx?: SxProps<Theme>;
  transition?: unknown;
  variants?: unknown;
};

export function IconButtonCluster({ children, sx, ...props }: IconButtonClusterProps) {
  const stackProps = props as StackProps;

  return (
    <Stack
      direction="row"
      {...stackProps}
      sx={[
        {
          alignItems: "center",
          bgcolor: "var(--app-bg-default, var(--docs-control-cluster-bg))",
          border: "1px solid",
          borderColor: "var(--app-border, var(--docs-control-border))",
          borderRadius: 999,
          boxShadow: "var(--app-shadow-nav, var(--docs-control-shadow))",
          gap: 0.5,
          p: 0.5
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {children}
    </Stack>
  );
}
