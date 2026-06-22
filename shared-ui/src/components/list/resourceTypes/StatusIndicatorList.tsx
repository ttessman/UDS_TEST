import { useId, useMemo } from "react";
import { StatusDetailsDialog } from "../../modal/resourceTypes/StatusDetailsDialog.js";
import { useModalSync } from "../../../store/modal.store.js";
import { StatusIndicatorButton } from "../../button/resourceTypes/StatusIndicatorButton.js";
import type {
  StatusIndicatorDefinition,
  StatusIndicatorListDefinition,
  StatusIndicatorRenderArgs,
  StatusIndicatorTone
} from "../../status/status.types.js";
import { List, listTemplate } from "../List.js";

export type {
  StatusIndicatorDefinition,
  StatusIndicatorListDefinition,
  StatusIndicatorRenderArgs,
  StatusIndicatorTone
};

export function StatusIndicatorList<T, C = undefined>({
  context,
  definition,
  item
}: {
  context: C;
  definition: StatusIndicatorListDefinition<T, C>;
  item: T;
}) {
  const detailsModalId = useId();
  const detailsModal = useModalSync(detailsModalId);
  const args = { context, item };
  const statusButtons = useMemo(
    () =>
      definition.items.map((status) => (
        <StatusIndicatorButton
          key={status.key}
          label={status.label}
          onClick={detailsModal.openModal}
          state={status.state(args)}
          tooltip={status.tooltip(args)}
          value={status.value(args)}
        />
      )),
    [args, definition.items, detailsModal.openModal]
  );

  return (
    <>
      <List
        layout={{
          gap: 1,
          justifyItems: "start"
        }}
        sx={{
          display: "flex",
          flexWrap: "wrap"
        }}
        state={{ isEmpty: definition.items.length === 0 }}
      >
        <listTemplate.content>
          <>{statusButtons}</>
        </listTemplate.content>
      </List>
      <StatusDetailsDialog
        args={args}
        definition={definition}
        modalId={detailsModalId}
      />
    </>
  );
}
