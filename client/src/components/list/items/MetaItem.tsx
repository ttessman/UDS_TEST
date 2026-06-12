import type { ReactNode } from "react";
import { Box, Chip, Stack, Tooltip, Typography } from "@mui/material";
import { AppIcon, type AppIconName } from "../../icon/AppIcon.js";
import { normalizeRenderValues, renderValuesAsText } from "../list.utils.js";

export type MetaItemPresentation = "compactIconOnly" | "iconOnly" | "iconWithText" | "inline" | "menu";

export type MetaItemDefinition<T, C = undefined> = {
  icon?: AppIconName;
  key: keyof T | string;
  label?: string;
  tooltip?: (args: { context: C; item: T; value: ReactNode }) => ReactNode;
  type?: "text" | "chip";
  value: (args: { context: C; item: T }) => ReactNode | Array<ReactNode | null | undefined> | null | undefined;
};

export type ResolvedMetaItem<T, C> = MetaItemDefinition<T, C> & {
  resolvedValue: ReactNode | ReactNode[];
};

export function MetaItem<T extends object, C>({
  context,
  density,
  emptyValue,
  field,
  item,
  presentation = "inline"
}: {
  context: C;
  density: "compact" | "comfortable";
  emptyValue?: ReactNode;
  field: ResolvedMetaItem<T, C>;
  item: T;
  presentation?: MetaItemPresentation;
}) {
  const values = normalizeRenderValues(field.resolvedValue, emptyValue);
  const compact = density === "compact";

  if (values.length === 0) {
    return null;
  }

  const content =
    field.type === "chip" ? (
      <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
        {values.map((value, index) => (
          <Chip key={`${String(field.key)}-${index}`} label={value} size="small" variant="outlined" />
        ))}
      </Stack>
    ) : (
      <Typography sx={{ color: "var(--app-text-secondary)", fontSize: compact ? 12 : 14, fontWeight: 700 }}>
        {values}
      </Typography>
    );

  const tooltip = field.tooltip?.({ context, item, value: renderValuesAsText(values) });

  if (presentation === "compactIconOnly") {
    if (!field.icon) {
      return null;
    }
    const compactValue = renderValuesAsText(values);
    const compactTooltip = tooltip ?? (field.label ? `${field.label}: ${compactValue}` : compactValue) ?? "";

    return (
      <Tooltip title={compactTooltip}>
        <Stack
          aria-label={String(compactTooltip ?? field.label ?? field.key)}
          direction="row"
          sx={{ alignItems: "center", color: "var(--app-text-secondary)", flex: "0 0 auto", minWidth: 0 }}
        >
          <AppIcon fontSize="small" name={field.icon} />
        </Stack>
      </Tooltip>
    );
  }

  if (presentation === "iconOnly" || presentation === "iconWithText") {
    if (!field.icon) {
      return null;
    }
    const compactValue = renderValuesAsText(values);

    return (
      <Tooltip title={tooltip ?? (field.label ? `${field.label}: ${compactValue}` : compactValue) ?? ""}>
        <Stack
          aria-label={String(tooltip ?? field.label ?? field.key)}
          direction="row"
          sx={{ alignItems: "center", color: "var(--app-text-secondary)", flex: "0 0 auto", gap: 0.5, minWidth: 0 }}
        >
          <AppIcon fontSize="small" name={field.icon} />
          <Typography sx={{ color: "var(--app-text-secondary)", fontSize: compact ? 12 : 14, fontWeight: 800, lineHeight: 1 }}>
            {compactValue}
          </Typography>
        </Stack>
      </Tooltip>
    );
  }

  if (presentation === "menu") {
    return (
      <Tooltip title={tooltip ?? ""}>
        <Box component="li" sx={{ listStyle: "none", px: 1.5, py: 0.22 }}>
          <Stack direction="row" sx={{ alignItems: "baseline", gap: 0.6, minWidth: 0 }}>
            <Typography sx={{ color: "var(--app-text-primary)", flex: "0 0 auto", fontSize: 13, fontWeight: 800, lineHeight: 1.12 }}>
              {field.label ?? String(field.key)}
            </Typography>
            {field.type === "chip" ? (
              content
            ) : (
              <Typography sx={{ color: "var(--app-text-secondary)", fontSize: 13, fontWeight: 700, lineHeight: 1.12, minWidth: 0, overflowWrap: "anywhere" }}>
                {values}
              </Typography>
            )}
          </Stack>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip ?? ""}>
      <Stack direction="row" sx={{ alignItems: "center", color: "var(--app-text-secondary)", gap: 0.65 }}>
        {field.icon ? <AppIcon fontSize="small" name={field.icon} /> : null}
        {field.label ? (
          <Typography sx={{ color: "var(--app-text-primary)", fontSize: compact ? 12 : 13, fontWeight: 800 }}>
            {field.label}
          </Typography>
        ) : null}
        {content}
      </Stack>
    </Tooltip>
  );
}
