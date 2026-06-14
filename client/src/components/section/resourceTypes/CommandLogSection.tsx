import type { CommandState } from "@uds-poc/shared";
import { CommandLogList as CommandLogRenderer, type CommandLogListDefinition } from "../../list/resourceTypes/CommandLogList.js";
import type { ListState } from "../../list/list.types.js";
import { Section, sectionTemplate } from "../Section.js";
import { summarizeCommand } from "./commandLogSection.utils.js";

const commandLogListDefinition = {
  emptyMessage: "No backend command output has been captured yet.",
  getKey: (log, index) => `${log.command}-${index}`,
  loadingMessage: "Loading backend command output...",
  summarize: summarizeCommand
} satisfies CommandLogListDefinition;

export function CommandLogList({ items, state }: { items: CommandState[]; state: ListState }) {
  return <CommandLogRenderer items={items} definition={commandLogListDefinition} state={state} />;
}

export function CommandLogSection({ items, state }: { items: CommandState[]; state: ListState }) {
  return (
    <Section>
      <sectionTemplate.title>Backend Checks</sectionTemplate.title>
      <sectionTemplate.subtitle>
        Commands run by the local API to inspect UDS tooling, cluster reachability, registry metadata, and installed packages.
      </sectionTemplate.subtitle>
      <sectionTemplate.content>
        <CommandLogList items={items} state={state} />
      </sectionTemplate.content>
    </Section>
  );
}
