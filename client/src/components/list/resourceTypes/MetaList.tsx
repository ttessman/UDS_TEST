import { useMemo, type ReactNode } from "react";
import { MetaItem, type MetaItemDefinition, type ResolvedMetaItem } from "../items/MetaItem.js";
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
  item
}: {
  context: C;
  definition: MetaListDefinition<T, C>;
  item: T;
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
          context={context}
        />
      )),
    [context, definition.density, definition.emptyValue, fields, item]
  );

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
