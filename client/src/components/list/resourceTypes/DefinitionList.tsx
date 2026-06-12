import { useMemo, type ReactNode } from "react";
import { DefinitionItem } from "../items/DefinitionItem.js";
import { List, listTemplate } from "../List.js";
import { isEmptyRenderValue } from "../list.utils.js";

export type DefinitionField<T> = {
  key: keyof T | string;
  label: string;
  value: (item: T) => ReactNode;
};

export type DefinitionListDefinition<T> = {
  density?: "comfortable" | "compact";
  emptyValue?: ReactNode;
  fields: Array<DefinitionField<T>>;
  omitEmptyValues?: boolean;
};

export function DefinitionList<T extends object>({
  definition,
  item
}: {
  definition: DefinitionListDefinition<T>;
  item: T;
}) {
  const fields = definition.fields
    .map((field) => ({ ...field, resolvedValue: field.value(item) }))
    .filter((field) => !definition.omitEmptyValues || !isEmptyRenderValue(field.resolvedValue));
  const definitionRows = useMemo(
    () =>
      fields.map((field) => (
        <DefinitionItem
          key={String(field.key)}
          density={definition.density ?? "comfortable"}
          label={field.label}
          value={field.resolvedValue ?? definition.emptyValue ?? "unknown"}
        />
      )),
    [definition.density, definition.emptyValue, fields]
  );

  return (
    <List
      layout={{ gap: definition.density === "compact" ? 0.75 : 1 }}
      state={{ isEmpty: fields.length === 0 }}
      sx={{ gridAutoRows: "auto", width: "100%" }}
    >
      <listTemplate.content>
        <>{definitionRows}</>
      </listTemplate.content>
    </List>
  );
}
