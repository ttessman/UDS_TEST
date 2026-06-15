import { useId, useMemo, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";
import { ShapeAccordion } from "../../accordion/resourceTypes/ShapeAccordion.js";
import { IconActionButton } from "../../button/resourceTypes/IconActionButton.js";
import { ResourceIcon } from "../../identity/ResourceIcon.js";
import { DefinitionList } from "../../list/resourceTypes/DefinitionList.js";
import { useContextMenu, type ContextMenuAction, type ContextMenuContent } from "../../menu/resourceTypes/ContextMenu.js";
import { CardFlip, cardFlipTemplate } from "../card.motion.js";
import { Card, cardTemplate } from "../Card.js";
import { CodeDialog } from "../../modal/resourceTypes/CodeDialog.js";
import { useModalSync } from "../../../store/modal.store.js";
import { resolveCodeBlock } from "./resourceCard.utils.js";
import {
  ResourceCardMediaBackground,
  ResourceCardMetaDisplay,
  ResourceCardVariant,
  type ResolvedCodeBlock,
  type ResourceCardDefinition,
  type ResourceCodeBlock,
  type ResourceRenderArgs
} from "./resourceCard.types.js";

export { ResourceCardMediaBackground, ResourceCardMetaDisplay, ResourceCardVariant };
export type { ResourceCardDefinition, ResourceCodeBlock, ResourceRenderArgs };

export function ResourceCard<T extends object, C = undefined>({
  context,
  definition,
  item,
  mediaBackground,
  mediaMetaDisplay,
  variant
}: {
  context: C;
  definition: ResourceCardDefinition<T, C>;
  item: T;
  mediaBackground?: ResourceCardMediaBackground;
  mediaMetaDisplay?: ResourceCardMetaDisplay;
  variant?: ResourceCardVariant;
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
  const onSelect = definition.onSelect ? () => definition.onSelect?.(args) : undefined;
  const primaryAction = definition.primaryAction?.(args);
  const shapeValue = definition.shape?.value(args);
  const statusPlacement = definition.statusPlacement ?? "header";
  const summary = definition.summary?.(args);
  const title = definition.title(args);
  const typeIndicator = definition.type?.(args);
  const displayIcon = icon ?? <GeneratedResourceIcon title={title} />;
  const cardVariant = variant ?? resolveResourceCardOption(definition.variant, args, ResourceCardVariant.Default);
  const cardMediaBackground = mediaBackground ?? resolveResourceCardOption(definition.mediaBackground, args, ResourceCardMediaBackground.Auto);
  const cardMediaMetaDisplay =
    mediaMetaDisplay ?? resolveResourceCardOption(definition.mediaMetaDisplay, args, ResourceCardMetaDisplay.IconOnly);
  const mediaSurfaceVariant = cardVariant === ResourceCardVariant.MediaFocus || cardVariant === ResourceCardVariant.AppLauncher;
  const meta = definition.meta?.({
    ...args,
    presentation:
      cardVariant === ResourceCardVariant.AppLauncher && cardMediaMetaDisplay === ResourceCardMetaDisplay.IconOnly
        ? "compactIconOnly"
        : "iconWithText"
  });
  const status = definition.status?.({
    ...args,
    presentation: mediaSurfaceVariant ? "media" : statusPlacement
  });
  const backIcon = mediaSurfaceVariant ? displayIcon : icon;
  const backIconStatus =
    mediaSurfaceVariant
      ? definition.status?.({ ...args, presentation: "icon" })
      : statusPlacement === "icon"
        ? status
        : null;
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
    status,
    typeIndicator
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
  const menuButton = (bordered: boolean) => menu.hasMenu ? (
    <IconActionButton
      bordered={bordered}
      icon="more"
      label="More package actions"
      onClick={menu.openContextMenu}
    />
  ) : null;
  const headerActions = (borderedMenuButton: boolean) => (
    <Stack direction="row" sx={{ alignItems: "center", flex: "0 0 auto", gap: 0.5, ml: "auto" }}>
      {primaryAction}
      {menuButton(borderedMenuButton)}
    </Stack>
  );
  const frontCardActions = (
    <Stack
      direction="row"
      sx={{
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.25,
        justifyContent: cardVariant === ResourceCardVariant.MediaFocus ? "space-between" : "flex-start",
        width: "100%"
      }}
    >
      {meta}
      {actions}
    </Stack>
  );
  const DefaultFrontCard = (
    <Card {...frontCardProps}>
      <cardTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between", minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
            {definition.label(args)}
          </Typography>
          <Stack direction="row" sx={{ alignItems: "center", flex: "0 0 auto", gap: 0.75, ml: "auto" }}>
            {typeIndicator}
            {headerActions(true)}
          </Stack>
        </Stack>
      </cardTemplate.header>

      <cardTemplate.content>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2, minWidth: 0 }}>
          <ResourceIcon icon={displayIcon} status={status} />
          <Typography
            component="h3"
            sx={{ color: "text.primary", fontSize: 19, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
          >
            {title}
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
  const MediaFrontCard = (
    <Card {...frontCardProps}>
      <cardTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "flex-end", minWidth: 0 }}>
          {headerActions(false)}
        </Stack>
      </cardTemplate.header>

      <cardTemplate.media>
        <Box
          sx={{
            ...getMediaBackgroundSx(cardMediaBackground),
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "center",
            minHeight: 122,
            position: "relative",
            width: "100%"
          }}
        >
          <Box sx={{ "& .MuiAvatar-root": { height: 64, width: 64, fontSize: 32 } }}>
            <ResourceIcon icon={displayIcon} status={status} />
          </Box>
          {typeIndicator ? (
            <Box sx={{ bottom: "var(--card-padding-y)", position: "absolute", right: "var(--card-padding-x)" }}>
              {typeIndicator}
            </Box>
          ) : null}
        </Box>
      </cardTemplate.media>

      <cardTemplate.content>
        <Stack sx={{ gap: 0.75, minWidth: 0 }}>
          <Typography
            component="h3"
            sx={{ color: "text.primary", fontSize: 19, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
          >
            {title}
          </Typography>
          {summary ? (
            <Typography sx={{ color: "text.secondary", fontSize: 14, lineHeight: 1.45, minHeight: 42 }}>{summary}</Typography>
          ) : null}
        </Stack>
      </cardTemplate.content>
      <cardTemplate.footer>{menu.contextMenu}</cardTemplate.footer>
      <cardTemplate.actions>{frontCardActions}</cardTemplate.actions>
    </Card>
  );
  const AppLauncherFrontCard = (
    <Card {...frontCardProps} content={{ spacing: "resource" as const, sx: { p: 0 } }}>
      <cardTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "flex-end", minWidth: 0 }}>
          {headerActions(false)}
        </Stack>
      </cardTemplate.header>

      <cardTemplate.media>
        <Box
          sx={{
            ...getMediaBackgroundSx(cardMediaBackground),
            alignItems: "center",
            display: "flex",
            flex: 1,
            justifyContent: "center",
            minHeight: definition.minHeight ?? 245,
            position: "relative",
            width: "100%"
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              gap: 1.25,
              maxWidth: "calc(100% - (var(--card-padding-x) * 4))",
              minWidth: 0
            }}
          >
            <Box sx={{ "& .MuiAvatar-root": { height: 88, width: 88, fontSize: 44 } }}>
              <ResourceIcon icon={displayIcon} status={status} />
            </Box>
            <Typography
              component="h3"
              title={typeof title === "string" ? title : undefined}
              sx={{
                color: "text.primary",
                fontSize: 14,
                fontWeight: 800,
                lineHeight: 1.15,
                maxWidth: "100%",
                overflow: "hidden",
                textAlign: "center",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
              }}
            >
              {title}
            </Typography>
          </Stack>
          {meta || actions ? (
            <Stack
              direction="row"
              sx={{
                alignItems: "center",
                bottom: "var(--card-padding-y)",
                flexWrap: "wrap",
                gap: 1.25,
                left: "var(--card-padding-x)",
                position: "absolute"
              }}
            >
              {meta}
              {actions}
            </Stack>
          ) : null}
          {typeIndicator ? (
            <Box sx={{ bottom: "var(--card-padding-y)", position: "absolute", right: "var(--card-padding-x)" }}>
              {typeIndicator}
            </Box>
          ) : null}
          {menu.contextMenu}
        </Box>
      </cardTemplate.media>
    </Card>
  );
  const frontCard =
    cardVariant === ResourceCardVariant.AppLauncher
      ? AppLauncherFrontCard
      : cardVariant === ResourceCardVariant.MediaFocus
        ? MediaFrontCard
        : DefaultFrontCard;
  
  const backCard = (
    <Card {...cardProps}>
      <cardTemplate.header>
        <Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5, justifyContent: "space-between", minWidth: 0 }}>
          <Typography color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 0, textTransform: "uppercase" }}>
            Details
          </Typography>
          {headerActions(true)}
        </Stack>
      </cardTemplate.header>

      <cardTemplate.content>
        <Stack direction="row" sx={{ alignItems: "center", gap: 2, minWidth: 0 }}>
          <ResourceIcon icon={backIcon} status={backIconStatus} />
          <Typography
            component="h3"
            sx={{ color: "text.primary", fontSize: 18, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}
          >
            {definition.title(args)}
          </Typography>
        </Stack>

        {summary ? (
          <Typography sx={{ color: "text.secondary", fontSize: 13, lineHeight: 1.35, overflowWrap: "anywhere" }}>
            {summary}
          </Typography>
        ) : null}

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
        <CodeDialog blocks={codeBlocks} modalId={codeModalId} title={title} />
      </cardFlipTemplate.footer>
    </CardFlip>
  );
}

function GeneratedResourceIcon({ title }: { title: ReactNode }) {
  return (
    <Avatar variant="rounded" sx={{ bgcolor: "var(--app-brand-bg)", flex: "0 0 auto", fontSize: 23, fontWeight: 800, height: 48, width: 48 }}>
      {getInitial(title)}
    </Avatar>
  );
}

function getInitial(title: ReactNode) {
  if (typeof title === "string" || typeof title === "number") {
    return String(title).trim().slice(0, 1).toUpperCase() || "?";
  }

  return "?";
}

function getMediaBackgroundSx(mediaBackground: ResourceCardMediaBackground) {
  if (mediaBackground === ResourceCardMediaBackground.Dark) {
    return {
      bgcolor: "#111827",
      backgroundImage: "linear-gradient(135deg, #111827 0%, #182231 100%)"
    };
  }

  if (mediaBackground === ResourceCardMediaBackground.Light) {
    return {
      bgcolor: "#f8fafc",
      backgroundImage: "linear-gradient(135deg, #ffffff 0%, #eef4fb 100%)"
    };
  }

  return {
    bgcolor: "var(--app-bg-paper-hover)",
    backgroundImage: "linear-gradient(135deg, color-mix(in srgb, var(--app-bg-paper-hover) 78%, white) 0%, var(--app-bg-paper-hover) 100%)"
  };
}

function resolveResourceCardOption<T extends object, C, V>(
  option: V | ((args: ResourceRenderArgs<T, C>) => V) | undefined,
  args: ResourceRenderArgs<T, C>,
  fallback: V
) {
  return typeof option === "function" ? (option as (args: ResourceRenderArgs<T, C>) => V)(args) : option ?? fallback;
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
  status,
  typeIndicator
}: {
  menuMeta: ReactNode;
  menuStatus: ReactNode;
  status: ReactNode;
  typeIndicator: ReactNode;
}) {
  return useMemo(
    () =>
      menuStatus || status || typeIndicator || menuMeta ? (
        <>
          {menuStatus ?? status ?? typeIndicator ? (
            <Box component="li" sx={{ listStyle: "none", px: 1.5, pb: 0.15 }}>
              {menuStatus ?? status ?? typeIndicator}
            </Box>
          ) : null}
          {menuMeta}
        </>
      ) : null,
    [menuMeta, menuStatus, status, typeIndicator]
  );
}

function isInteractiveTarget(target: EventTarget, card: HTMLElement): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  const interactive = target.closest("a,button,input,select,textarea,[role='button']");

  return Boolean(interactive && interactive !== card);
}
