import type { ReactNode } from "react";
import type { KeyboardEvent, MouseEvent } from "react";
import { CardContent, Stack, Typography } from "@mui/material";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { Card, cardTemplate } from "../Card.js";
import { IconWithStatus } from "../../identity/IconWithStatus.js";
import type { ResourceCardDefinition, ResourceRenderArgs } from "./resourceCard.types.js";

export function ResourceCardFront<T extends object, C>({
  actions,
  args,
  definition,
  hasBackContent,
  hasCode,
  icon,
  meta,
  onSelect,
  onShowCode,
  onShowDetails,
  status,
  statusPlacement,
  summary
}: {
  actions: ReactNode;
  args: ResourceRenderArgs<T, C>;
  definition: ResourceCardDefinition<T, C>;
  hasBackContent: boolean;
  hasCode: boolean;
  icon: ReactNode;
  meta: ReactNode;
  onSelect?: () => void;
  onShowCode: () => void;
  onShowDetails: (event: React.MouseEvent<HTMLButtonElement>) => void;
  status: ReactNode;
  statusPlacement: "header" | "icon";
  summary: ReactNode;
}) {
  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (!onSelect || isInteractiveTarget(event.target)) {
      return;
    }

    onSelect();
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onSelect || isInteractiveTarget(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    <Card
      definition={{ aspectRatio: definition.aspectRatio, minHeight: definition.minHeight }}
      onClick={onSelect ? handleCardClick : undefined}
      onKeyDown={onSelect ? handleCardKeyDown : undefined}
    >
      <cardTemplate.content>
        <CardContent sx={{ display: "flex", flex: 1, flexDirection: "column", gap: 1.75, p: 3 }}>
          <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1.5 }}>
            <Typography color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
              {definition.label(args)}
            </Typography>
            {statusPlacement === "header" ? status : null}
          </Stack>

          <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between" }}>
            <Stack direction="row" sx={{ alignItems: "center", flex: "1 1 210px", gap: 2, minWidth: 0 }}>
              <IconWithStatus icon={icon} status={statusPlacement === "icon" ? status : null} />
              <Typography
                component="h3"
                sx={{ color: "text.primary", fontSize: 19, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
              >
                {definition.title(args)}
              </Typography>
            </Stack>

            <Stack direction="row" sx={{ alignItems: "center", flex: "0 0 auto", gap: 0.5, ml: "auto" }}>
              {hasCode ? <IconActionButton icon="code" label="Show code and output" onClick={onShowCode} /> : null}
              {hasBackContent ? <IconActionButton aria-pressed={false} icon="info" label="Show package details" onClick={onShowDetails} /> : null}
            </Stack>
          </Stack>

          {summary ? (
            <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.45, minHeight: 42 }}>{summary}</Typography>
          ) : null}

          {meta ? (
            <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.25, mt: "auto" }}>
              {meta}
            </Stack>
          ) : null}
        </CardContent>
      </cardTemplate.content>
      <cardTemplate.actions>{actions}</cardTemplate.actions>
    </Card>
  );
}

function isInteractiveTarget(target: EventTarget): boolean {
  return target instanceof Element && Boolean(target.closest("a,button,input,select,textarea,[role='button']"));
}
