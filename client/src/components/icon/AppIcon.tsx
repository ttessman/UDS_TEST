import {
  AccessTimeOutlined,
  CheckCircleOutlined,
  Close,
  CodeOutlined,
  ContentCopy,
  DarkMode,
  DeleteOutlined,
  ErrorOutlineOutlined,
  ExpandMore,
  HelpOutlineOutlined,
  InfoOutlined,
  Inventory2Outlined,
  LightMode,
  LocalOfferOutlined,
  MoreVert,
  OpenInNew,
  RefreshOutlined,
  RemoveCircleOutlined,
  ReplyRounded,
  RocketLaunch,
  Search,
  Terminal,
  UploadFileOutlined,
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
  more: MoreVert,
  open: OpenInNew,
  packageTags: LocalOfferOutlined,
  packageUpdated: AccessTimeOutlined,
  packageVersion: Inventory2Outlined,
  returnToSummary: ReplyRounded,
  refresh: RefreshOutlined,
  undeploy: RemoveCircleOutlined,
  unpublish: DeleteOutlined,
  publish: UploadFileOutlined,
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
