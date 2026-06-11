import type { ReactNode } from "react";
import { Chip, Stack, Tooltip, Typography } from "@mui/material";
import { AppIcon, type AppIconName } from "../../icon/AppIcon.js";
import { normalizeRenderValues, renderValuesAsText } from "../list.utils.js";

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
  item
}: {
  context: C;
  density: "compact" | "comfortable";
  emptyValue?: ReactNode;
  field: ResolvedMetaItem<T, C>;
  item: T;
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
