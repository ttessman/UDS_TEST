import { useId, useMemo, useState } from "react";
import { CardFlipFace, CardFlipRoot, CardFlipStage } from "../card.motion.js";
import { CodeDialog } from "../../modal/resourceTypes/CodeDialog.js";
import { useModalSync } from "../../../store/modal.store.js";
import { ResourceCardBack } from "./ResourceCardBack.js";
import { ResourceCardFront } from "./ResourceCardFront.js";
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
  const meta = definition.meta?.(args);
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

  return (
    <>
      <CardFlipRoot minHeight={definition.minHeight}>
        <CardFlipStage flipped={flipped}>
          <CardFlipFace visible={!flipped}>
            <ResourceCardFront
              actions={actions}
              args={args}
              definition={definition}
              hasBackContent={hasBackContent}
              hasCode={hasCode}
              icon={icon}
              meta={meta}
              onShowCode={codeModal.openModal}
              onShowDetails={(event) => {
                event.currentTarget.blur();
                setFlipped(true);
              }}
              status={status}
              statusPlacement={statusPlacement}
              summary={summary}
            />
          </CardFlipFace>

          <CardFlipFace visible={flipped} flipped>
            <ResourceCardBack
              args={args}
              definition={definition}
              details={details}
              hasCode={hasCode}
              icon={icon}
              onBack={(event) => {
                event.currentTarget.blur();
                setFlipped(false);
              }}
              onShowCode={codeModal.openModal}
              shapeValue={shapeValue}
              status={status}
              statusPlacement={statusPlacement}
            />
          </CardFlipFace>
        </CardFlipStage>
      </CardFlipRoot>

      <CodeDialog blocks={codeBlocks} modalId={codeModalId} title={definition.title(args)} />
    </>
  );
}
