import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  Close,
  CodeOutlined,
  ContentCopy,
  DarkMode,
  ErrorOutlineOutlined,
  ExpandMore,
  HelpOutlineOutlined,
  InfoOutlined,
  LightMode,
  LocalOfferOutlined,
  OpenInNew,
  RefreshOutlined,
  ReplyRounded,
  RocketLaunch,
  Search,
  Terminal,
  WarningAmber
} from "@mui/icons-material";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType } from "react";

const icons = {
  code: CodeOutlined,
  close: Close,
  copy: ContentCopy,
  darkMode: DarkMode,
  expand: ExpandMore,
  info: InfoOutlined,
  install: RocketLaunch,
  lightMode: LightMode,
  open: OpenInNew,
  packageTags: LocalOfferOutlined,
  packageUpdated: AccessTimeOutlined,
  returnToSummary: ReplyRounded,
  refresh: RefreshOutlined,
  terminal: Terminal,
  search: Search,
  statusError: ErrorOutlineOutlined,
  statusInfo: InfoOutlined,
  statusSuccess: CheckCircleOutlined,
  statusUnknown: HelpOutlineOutlined,
  statusWarning: WarningAmber
} satisfies Record<string, ComponentType<SvgIconProps>>;

export type AppIconName = keyof typeof icons;

export function AppIcon({ name, ...props }: SvgIconProps & { name: AppIconName }) {
  const Icon = icons[name];

  return <Icon {...props} />;
}
