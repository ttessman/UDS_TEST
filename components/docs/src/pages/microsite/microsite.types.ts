import type { IconName } from "../../components/icon/Icon";

export type NavItem = {
  href: string;
  label: string;
};

export type ProblemStoryGraphicKind = "list" | "state" | "users";

export type ProblemCard = {
  title: string;
  text: string;
  visual: ProblemStoryGraphicKind;
};

export type SolutionStep = {
  title: string;
  text: string;
  icon: IconName;
};

export type ProofStoryGraphicKind = "store" | "installed" | "launch" | "flow" | "metadata";

export type ProofCard = {
  title: string;
  text: string;
  kind: ProofStoryGraphicKind;
};

export type PlatformColor = "blue" | "green" | "purple" | "navy";

export type PlatformNode = {
  title: string;
  color: PlatformColor;
  items: string[];
};

export type ArchitectureNode = {
  title: string;
  text: string;
  icon: IconName;
};
