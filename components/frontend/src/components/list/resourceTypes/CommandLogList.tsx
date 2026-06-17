import { useMemo } from "react";
import type { CommandState } from "@uds-poc/shared";
import { List, listTemplate } from "../List.js";
import type { ListState } from "../list.types.js";
import { CommandLogCard } from "../../card/resourceTypes/CommandLogCard.js";
import type { CommandLogListDefinition, CommandLogSummary } from "./commandLog.types.js";

export type { CommandLogListDefinition, CommandLogSummary };

export function CommandLogList({
  definition,
  items,
  state
}: {
  definition: CommandLogListDefinition;
  items: CommandState[];
  state: ListState;
}) {
  const commandLogCards = useMemo(
    () =>
      items.map((log, index) => (
        <CommandLogCard key={definition.getKey(log, index)} definition={definition} log={log} />
      )),
    [definition, items]
  );

  return (
    <List
      layout={{
        alignItems: "start",
        gap: 1.25,
        gridAutoRows: "auto",
        gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }
      }}
      state={{
        emptyMessage: definition.emptyMessage,
        isEmpty: items.length === 0,
        loadingMessage: definition.loadingMessage,
        status: state
      }}
      sx={{ mt: 1.5 }}
    >
      <listTemplate.content>
        <>{commandLogCards}</>
      </listTemplate.content>
    </List>
  );
}
