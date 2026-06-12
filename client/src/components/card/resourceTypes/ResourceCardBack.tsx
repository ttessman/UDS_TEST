import type { ReactNode } from "react";
import { CardContent, Stack, Typography } from "@mui/material";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { DefinitionList } from "../../list/resourceTypes/DefinitionList.js";
import { Card, cardTemplate } from "../Card.js";
import { IconWithStatus } from "../../identity/IconWithStatus.js";
import { ShapeAccordion } from "./ShapeAccordion.js";
import type { ResourceCardDefinition, ResourceRenderArgs } from "./resourceCard.types.js";

export function ResourceCardBack<T extends object, C>({
  args,
  definition,
  details,
  hasCode,
  icon,
  onBack,
  onShowCode,
  shapeValue,
  status,
  statusPlacement
}: {
  args: ResourceRenderArgs<T, C>;
  definition: ResourceCardDefinition<T, C>;
  details: ReactNode;
  hasCode: boolean;
  icon: ReactNode;
  onBack: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onShowCode: () => void;
  shapeValue: unknown;
  status: ReactNode;
  statusPlacement: "header" | "icon";
}) {
  return (
    <Card definition={{ aspectRatio: definition.aspectRatio, minHeight: definition.minHeight }}>
      <cardTemplate.content>
        <CardContent sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.75, overflow: "hidden", p: 3 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Typography color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
              Details
            </Typography>
            {statusPlacement === "header" ? status : null}
          </Stack>

          <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between" }}>
            <Stack direction="row" sx={{ alignItems: "center", flex: "1 1 210px", gap: 2, minWidth: 0 }}>
              <IconWithStatus icon={icon} status={statusPlacement === "icon" ? status : null} />
              <Typography
                component="h3"
                sx={{ color: "text.primary", fontSize: 18, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
              >
                {definition.title(args)}
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ flex: "0 0 auto", gap: 0.5, ml: "auto" }}>
              {hasCode ? <IconActionButton icon="code" label="Show code and output" onClick={onShowCode} /> : null}
              <IconActionButton aria-pressed icon="returnToSummary" label="Back to package summary" onClick={onBack} />
            </Stack>
          </Stack>

          <Stack sx={{ flex: 1, gap: 1.5, minHeight: 0, overflow: "auto", pr: 0.5 }}>
            {definition.fields ? (
              <DefinitionList item={args.item} definition={{ density: "compact", fields: definition.fields, omitEmptyValues: true }} />
            ) : null}
            {details}
            {definition.shape ? <ShapeAccordion title={definition.shape.title} value={shapeValue} /> : null}
          </Stack>
        </CardContent>
      </cardTemplate.content>
    </Card>
  );
}
