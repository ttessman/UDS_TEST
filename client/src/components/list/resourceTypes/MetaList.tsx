import { useMemo, type ReactNode } from "react";
import { Stack } from "@mui/material";
import { MetaItem, type MetaItemDefinition, type MetaItemPresentation, type ResolvedMetaItem } from "../items/MetaItem.js";
import { List, listTemplate } from "../List.js";
import { isEmptyRenderValue } from "../list.utils.js";

export type { MetaItemDefinition, ResolvedMetaItem };

export type MetaListDefinition<T, C = undefined> = {
  density?: "compact" | "comfortable";
  emptyValue?: ReactNode;
  fields: Array<MetaItemDefinition<T, C>>;
  omitEmptyValues?: boolean;
};

export function MetaList<T extends object, C = undefined>({
  context,
  definition,
  item,
  presentation = "inline"
}: {
  context: C;
  definition: MetaListDefinition<T, C>;
  item: T;
  presentation?: MetaItemPresentation;
}) {
  const fields = definition.fields
    .map((field) => ({ ...field, resolvedValue: field.value({ context, item }) }))
    .filter((field) => !definition.omitEmptyValues || !isEmptyRenderValue(field.resolvedValue));
  const metaItems = useMemo(
    () =>
      fields.map((field) => (
        <MetaItem
          key={String(field.key)}
          density={definition.density ?? "comfortable"}
          emptyValue={definition.emptyValue}
          field={field}
          item={item}
          presentation={presentation}
          context={context}
        />
      )),
    [context, definition.density, definition.emptyValue, fields, item, presentation]
  );

  if (presentation === "overlayIconOnly") {
    return (
      <Stack
        direction="row"
        sx={{
          alignItems: "center",
          bgcolor: "var(--app-overlay-chip-bg)",
          border: "1px solid var(--app-overlay-chip-border)",
          borderRadius: "999px",
          color: "var(--app-overlay-chip-text)",
          flexWrap: "wrap",
          gap: 0.75,
          minWidth: 0,
          px: 0.85,
          py: 0.45,
          "& *": {
            color: "inherit !important"
          },
          "& .MuiSvgIcon-root": {
            fontSize: 17
          }
        }}
      >
        {metaItems}
      </Stack>
    );
  }

  if (presentation === "compactIconOnly" || presentation === "iconOnly" || presentation === "iconWithText") {
    return (
      <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.25, minWidth: 0 }}>
        {metaItems}
      </Stack>
    );
  }

  if (presentation === "menu") {
    return <>{metaItems}</>;
  }

  return (
    <List
      layout={{ gap: definition.density === "compact" ? 0.5 : 0.75 }}
      state={{ isEmpty: fields.length === 0 }}
    >
      <listTemplate.content>
        <>{metaItems}</>
      </listTemplate.content>
    </List>
  );
}
