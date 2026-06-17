import type { CommandState } from "@uds-poc/shared";
import type { StatusIndicatorTone } from "../../status/status.types.js";

export type CommandLogSummary = {
  description: string;
  fields: Array<[string, string]>;
  message: string | null;
  title: string;
  tone: StatusIndicatorTone;
};

export type CommandLogListDefinition = {
  emptyMessage: string;
  getKey: (log: CommandState, index: number) => string;
  loadingMessage: string;
  summarize: (log: CommandState) => CommandLogSummary;
};
