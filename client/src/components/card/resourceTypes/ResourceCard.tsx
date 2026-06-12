import { useId, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ShapeAccordion } from "../../accordion/resourceTypes/ShapeAccordion.js";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { IconWithStatus } from "../../identity/IconWithStatus.js";
import { DefinitionList } from "../../list/resourceTypes/DefinitionList.js";
import { useContextMenu, type ContextMenuAction, type ContextMenuContent } from "../../menu/resourceTypes/ContextMenu.js";
import { CardFlip, cardFlipTemplate } from "../card.motion.js";
import { Card, cardTemplate } from "../Card.js";
import { CodeDialog } from "../../modal/resourceTypes/CodeDialog.js";
import { useModalSync } from "../../../store/modal.store.js";
import { resolveCodeBlock } from "./resourceCard.utils.js";
import type { ResolvedCodeBlock, ResourceCardDefinition, ResourceCodeBlock, ResourceRenderArgs } from "./resourceCard.types.js";

export type { ResourceCardDefinition, ResourceCodeBlock, ResourceRenderArgs };

export function ResourceCard<T extends object, C = undefined>({
  context,
  definition,
  item
}: {
  context: C;
  definition: ResourceCardDefinition<T, C>;
  item: T;
}) {
  const [flipped, setFlipped] = useState(false);
  const codeModalId = useId();
  const codeModal = useModalSync(codeModalId);
  const args = { item, context };
  const actions = definition.actions?.(args);
  const commandPreview = definition.commandPreview?.(args);
  const details = definition.details?.(args);
  const icon = definition.icon?.(args);
  const menuMeta = definition.meta?.({ ...args, presentation: "menu" });
  const menuStatus = definition.menuStatus?.(args);
  const meta = definition.meta?.({ ...args, presentation: "iconOnly" });
  const onSelect = definition.onSelect ? () => definition.onSelect?.(args) : undefined;
  const primaryAction = definition.primaryAction?.(args);
  const shapeValue = definition.shape?.value(args);
  const status = definition.status?.(args);
  const statusPlacement = definition.statusPlacement ?? "header";
  const summary = definition.summary?.(args);
  const codeBlocks = useMemo<ResolvedCodeBlock[]>(() => {
    const explicitBlocks =
      definition.codeBlocks
        ?.map((block) => resolveCodeBlock(block, args))
        .filter((block): block is ResolvedCodeBlock => block != null) ?? [];

    if (!commandPreview) {
      return explicitBlocks;
    }

    return [{ content: commandPreview, language: "bash", title: "Install command" }, ...explicitBlocks];
  }, [commandPreview, definition.codeBlocks, item, context]);
  const hasBackContent = Boolean(definition.fields || details || definition.shape);
  const hasCode = codeBlocks.length > 0;
  const resourceMenuItems = useMemo<ContextMenuAction[]>(
    () => definition.menuActions?.(args) ?? [],
    [definition.menuActions, item, context]
  );
  const menuItems = useMemo<ContextMenuAction[]>(
    () => [
      ...resourceMenuItems,
      ...(hasCode ? [{ icon: "code" as const, label: "Show Code", onSelect: codeModal.openModal }] : []),
      ...(flipped
        ? [{ icon: "returnToSummary" as const, label: "Back to Summary", onSelect: () => setFlipped(false) }]
        : hasBackContent
          ? [{ icon: "info" as const, label: "Package Details", onSelect: () => setFlipped(true) }]
          : [])
    ],
    [codeModal.openModal, flipped, hasBackContent, hasCode, resourceMenuItems]
  );
  const menuStateContent = useResourceCardMenuState({
    menuMeta,
    menuStatus,
    status: statusPlacement === "header" ? status : null
  });
  const menuContent = useResourceCardMenuContent(menuItems, menuStateContent);
  const menu = useContextMenu(menuContent);

  const handleCardClick = (event: MouseEvent<HTMLElement>) => {
    if (!onSelect || isInteractiveTarget(event.target, event.currentTarget)) {
      return;
    }

    onSelect();
  };
  const handleCardKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!onSelect || isInteractiveTarget(event.target, event.currentTarget)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };
  const cardProps = {
    content: { spacing: "resource" as const },
    definition: { aspectRatio: definition.aspectRatio, minHeight: definition.minHeight }
  };
  const frontCardProps = {
    ...cardProps,
    onClick: onSelect ? handleCardClick : undefined,
    onKeyDown: onSelect ? handleCardKeyDown : undefined
  };
  const menuButton = menu.hasMenu ? (
    <IconActionButton
      icon="more"
      label="More package actions"
      onClick={menu.openContextMenu}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "50%",
        height: 28,
        width: 28,
        "&:hover": { borderColor: "text.secondary" },
        "& svg": { fontSize: 18 }
      }}
    />
  ) : null;
  const headerActions = (
    <Stack direction="row" sx={{ alignItems: "center", flex: "0 0 auto", gap: 0.5, ml: "auto" }}>
      {primaryAction}
      {menuButton}
    </Stack>
  );
  const frontCardActions = (
    <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.25 }}>
      {meta}
      {actions}
    </Stack>
  );

  const frontCard = (
    <Card {...frontCardProps}>
      <cardTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between", minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
            {definition.label(args)}
          </Typography>
          {headerActions}
        </Stack>
      </cardTemplate.header>

      <cardTemplate.content>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2, minWidth: 0 }}>
          <IconWithStatus icon={icon} status={statusPlacement === "icon" ? status : null} />
          <Typography
            component="h3"
            sx={{ color: "text.primary", fontSize: 19, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
          >
            {definition.title(args)}
          </Typography>
        </Stack>

        {summary ? (
          <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.45, minHeight: 42 }}>{summary}</Typography>
        ) : null}
      </cardTemplate.content>
      <cardTemplate.footer>{menu.contextMenu}</cardTemplate.footer>
      <cardTemplate.actions>{frontCardActions}</cardTemplate.actions>
    </Card>
  );
  
  const backCard = (
    <Card {...cardProps}>
      <cardTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between", minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
            Details
          </Typography>
          {headerActions}
        </Stack>
      </cardTemplate.header>

      <cardTemplate.content>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2, minWidth: 0 }}>
          <IconWithStatus icon={icon} status={statusPlacement === "icon" ? status : null} />
          <Typography
            component="h3"
            sx={{ color: "text.primary", fontSize: 18, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
          >
            {definition.title(args)}
          </Typography>
        </Stack>

        <Stack sx={{ flex: 1, gap: 1.5, minHeight: 0, overflow: "auto", pr: 0.5 }}>
          {definition.fields ? (
            <DefinitionList item={args.item} definition={{ density: "compact", fields: definition.fields, omitEmptyValues: true }} />
          ) : null}
          {details}
          {definition.shape ? <ShapeAccordion title={definition.shape.title} value={shapeValue} /> : null}
        </Stack>
      </cardTemplate.content>
      <cardTemplate.footer>{menu.contextMenu}</cardTemplate.footer>
    </Card>
  );

  return (
    <CardFlip flipped={flipped} minHeight={definition.minHeight}>
      <cardFlipTemplate.front>
        {frontCard}
      </cardFlipTemplate.front>

      <cardFlipTemplate.back>
        {backCard}
      </cardFlipTemplate.back>

      <cardFlipTemplate.footer>
        <CodeDialog blocks={codeBlocks} modalId={codeModalId} title={definition.title(args)} />
      </cardFlipTemplate.footer>
    </CardFlip>
  );
}

function useResourceCardMenuContent(actions: ContextMenuAction[], stateContent: ReactNode): ContextMenuContent {
  return useMemo(
    () => ({
      actions,
      actionsLabel: "Package actions",
      state: stateContent ? { content: stateContent, label: "Package state" } : undefined
    }),
    [actions, stateContent]
  );
}

function useResourceCardMenuState({
  menuMeta,
  menuStatus,
  status
}: {
  menuMeta: ReactNode;
  menuStatus: ReactNode;
  status: ReactNode;
}) {
  return useMemo(
    () =>
      menuStatus || status || menuMeta ? (
        <>
          {menuStatus ?? status ? (
            <Box component="li" sx={{ listStyle: "none", px: 1.5, pb: 0.15 }}>
              {menuStatus ?? status}
            </Box>
          ) : null}
          {menuMeta}
        </>
      ) : null,
    [menuMeta, menuStatus, status]
  );
}

function isInteractiveTarget(target: EventTarget, card: HTMLElement): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactive = target.closest("a,button,input,select,textarea,[role='button']");

  return Boolean(interactive && interactive !== card);
}
