import type { CommandState } from "@uds-poc/shared";
import { Box, Typography } from "@mui/material";
import { AccordionList, type AccordionListDefinition } from "../../components/list/resourceTypes/AccordionList.js";
import type { ListSectionDefinition } from "../../components/section/resourceTypes/ListSection.js";
import { trimOutput } from "../../lib/format.js";

const commandLogAccordion = {
  getKey: (log, index) => `${log.command}-${index}`,
  defaultExpanded: (log) => !log.ok,
  summary: (log) => (
    <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
      <span className={log.ok ? "dot ok" : "dot bad"} />
      <Typography sx={{ overflowWrap: "anywhere" }}>{log.command}</Typography>
    </Box>
  ),
  details: (log) => (
    <>
      <pre>{trimOutput(log.stdout) || trimOutput(log.stderr) || "(no output)"}</pre>
      {log.stderr ? <pre className="stderr">{trimOutput(log.stderr)}</pre> : null}
    </>
  )
} satisfies AccordionListDefinition<CommandState>;

export const commandLogsSection = {
  title: "Backend Command Output",
  renderList: ({ items, state }) => (
    <AccordionList items={items} definition={commandLogAccordion} context={undefined} state={state} />
  )
} satisfies ListSectionDefinition<CommandState>;
