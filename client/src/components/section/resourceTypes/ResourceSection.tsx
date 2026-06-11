import { useMemo, type ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import { List, listTemplate } from "../../list/List.js";
import { ListItem } from "../../list/items/ListItem.js";
import type { ListLayout, ListState } from "../../list/list.types.js";
import { RefreshCountButton } from "../../button/resourceTypes/RefreshCountButton.js";
import { ResourceCard, type ResourceCardDefinition } from "../../card/resourceTypes/ResourceCard.js";
import { SearchField } from "../../form/resourceTypes/SearchField.js";
import { Section, sectionTemplate } from "../Section.js";

export type ResourceSectionContent<T extends object, C = undefined> = {
  emptyMessage: string;
  layout?: ListLayout;
  loadingMessage?: string;
  refreshLabel?: (count: number) => string;
  refreshTooltip?: (args: { busy: boolean; count: number }) => string;
  resource: ResourceCardDefinition<T, C>;
  searchLabel?: string;
  searchPlaceholder?: string;
  subtitle?: (items: T[]) => ReactNode;
  title: ReactNode;
};

export type ResourceSectionSearchState = {
  enabled: boolean;
  onChange: (value: string) => void;
  value: string;
};

export type ResourceSectionRefreshContext = {
  disabled?: boolean;
  onClick: () => void;
};

export type ResourceSectionContext<T extends object, C = undefined> = {
  getItemContext: (item: T) => C;
  refresh?: ResourceSectionRefreshContext;
  search?: ResourceSectionSearchState;
  status?: ListState;
};

export function ResourceSection<T extends object, C = undefined>({
  context,
  content,
  data
}: {
  context: ResourceSectionContext<T, C>;
  content: ResourceSectionContent<T, C>;
  data: T[];
}) {
  const listStatus = context.status ?? "ready";
  const refreshBusy = Boolean(context.refresh?.disabled);
  const resourceCards = useMemo(
    () =>
      data.map((item, index) => (
        <ListItem key={getResourceItemKey(item, index)} maxWidth={content.layout?.itemMaxWidth}>
          <ResourceCard item={item} definition={content.resource} context={context.getItemContext(item)} />
        </ListItem>
      )),
    [context, content, data]
  );

  return (
    <Section>
      <sectionTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
          <Typography component="h2" sx={{ fontSize: 28, fontWeight: 800 }}>
            {content.title}
          </Typography>
          {context.refresh ? (
            <RefreshCountButton
              count={data.length}
              disabled={context.refresh.disabled}
              label={content.refreshLabel?.(data.length) ?? `${data.length} ${String(content.title).toLowerCase()}`}
              onClick={context.refresh.onClick}
              tooltip={content.refreshTooltip?.({ busy: refreshBusy, count: data.length }) ?? "Refresh"}
            />
          ) : null}
        </Stack>
      </sectionTemplate.header>
      <sectionTemplate.actions>
        <>
          {context.search?.enabled ? (
            <SearchField
              iconPosition="end"
              label={content.searchLabel ?? `Search ${String(content.title)}`}
              onChange={context.search.onChange}
              placeholder={content.searchPlaceholder ?? "Search"}
              sx={{ flex: "1 1 220px", maxWidth: 280, minWidth: 0 }}
              value={context.search.value}
            />
          ) : null}
        </>
      </sectionTemplate.actions>
      <sectionTemplate.subtitle>
        <>
          {content.subtitle?.(data)}
        </>
      </sectionTemplate.subtitle>
      <sectionTemplate.content>
        <List
          layout={content.layout}
          state={{
            emptyMessage: content.emptyMessage,
            isEmpty: data.length === 0,
            loadingMessage: content.loadingMessage,
            status: listStatus
          }}
        >
          <listTemplate.content>
            <>{resourceCards}</>
          </listTemplate.content>
        </List>
      </sectionTemplate.content>
    </Section>
  );
}

function getResourceItemKey(item: object, index: number) {
  const maybeRecord = item as Record<string, unknown>;
  const key = maybeRecord.id ?? maybeRecord.uid ?? maybeRecord.name ?? maybeRecord.packageName;

  return key == null ? String(index) : String(key);
}
