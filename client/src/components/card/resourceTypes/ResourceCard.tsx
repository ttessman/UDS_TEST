import type { ReactNode } from "react";
import { Box, CardContent, Chip, Stack, Typography } from "@mui/material";
import { describeShape } from "../../../lib/shape.js";
import { Card } from "../Card.js";
import { AccordionList } from "../../list/resourceTypes/AccordionList.js";
import { DefinitionList, type DefinitionField } from "../../list/resourceTypes/DefinitionList.js";

type ResourceRenderArgs<T extends object, C> = {
  item: T;
  context: C;
};

export type ResourceCardDefinition<T extends object, C = undefined> = {
  actions?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  commandPreview?: (args: ResourceRenderArgs<T, C>) => string | null | undefined;
  details?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  fields?: Array<DefinitionField<T>>;
  icon?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  label: (args: ResourceRenderArgs<T, C>) => string;
  meta?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  minHeight?: number;
  shape?: {
    title: string;
    value: (args: ResourceRenderArgs<T, C>) => unknown;
  };
  status?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  summary?: (args: ResourceRenderArgs<T, C>) => ReactNode;
  title: (args: ResourceRenderArgs<T, C>) => ReactNode;
};

export function ResourceCard<T extends object, C = undefined>({
  context,
  definition,
  item
}: {
  context: C;
  definition: ResourceCardDefinition<T, C>;
  item: T;
}) {
  const args = { item, context };
  const actions = definition.actions?.(args);
  const commandPreview = definition.commandPreview?.(args);
  const details = definition.details?.(args);
  const icon = definition.icon?.(args);
  const meta = definition.meta?.(args);
  const shapeValue = definition.shape?.value(args);
  const status = definition.status?.(args);
  const summary = definition.summary?.(args);

  return (
    <Card actions={actions} commandPreview={commandPreview} definition={{ minHeight: definition.minHeight }}>
      <CardContent sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 3, p: 3.75 }}>
        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Typography color="text.secondary" sx={{ fontSize: 14, letterSpacing: 0, textTransform: "uppercase" }}>
            {definition.label(args)}
          </Typography>
          {status}
        </Stack>

        <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
          {icon}
          <Typography component="h3" sx={{ color: "#f8fafc", fontSize: 25, fontWeight: 800, lineHeight: 1.2 }}>
            {definition.title(args)}
          </Typography>
        </Stack>

        {summary ? <Typography sx={{ color: "#dbe3ef", fontSize: 17, lineHeight: 1.45, minHeight: 50 }}>{summary}</Typography> : null}

        {meta ? (
          <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 2, mt: "auto" }}>
            {meta}
          </Stack>
        ) : null}
      </CardContent>

      {definition.fields || details || definition.shape ? (
        <CardContent sx={{ px: 3.75, py: 0 }}>
          <Stack sx={{ gap: 2 }}>
            {definition.fields ? <DefinitionList item={item} definition={{ fields: definition.fields }} /> : null}
            {details}
            {definition.shape ? <ShapeAccordion title={definition.shape.title} value={shapeValue} /> : null}
          </Stack>
        </CardContent>
      ) : null}
    </Card>
  );
}

function ShapeAccordion({ title, value }: { title: string; value: unknown }) {
  const shape = describeShape(value);

  if (value == null || shape.length === 0) {
    return null;
  }

  return (
    <AccordionList
      items={[shape.slice(0, 80)]}
      context={undefined}
      definition={{
        getKey: () => title,
        summary: () => <Typography sx={{ fontWeight: 700 }}>{title}</Typography>,
        details: (nodes) => (
          <Box sx={{ display: "grid", gap: 0.75 }}>
            {nodes.map((node) => (
              <Box key={`${node.path}-${node.type}`} sx={{ alignItems: "center", display: "flex", gap: 1 }}>
                <Typography component="code" sx={{ flex: 1, overflowWrap: "anywhere" }}>
                  {node.path}
                </Typography>
                <Chip label={node.type} size="small" variant="outlined" />
              </Box>
            ))}
          </Box>
        )
      }}
    />
  );
}
