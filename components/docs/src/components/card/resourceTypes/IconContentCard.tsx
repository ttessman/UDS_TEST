import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { ContentCard, contentCardTemplate } from "../ContentCard";

export type IconContentCardProps = {
  icon: ReactNode;
  sx?: SxProps<Theme>;
  text: ReactNode;
  title: ReactNode;
};

export function IconContentCard({ icon, sx, text, title }: IconContentCardProps) {
  return (
    <ContentCard sx={sx}>
      <contentCardTemplate.media>{icon}</contentCardTemplate.media>
      <contentCardTemplate.title>{title}</contentCardTemplate.title>
      <contentCardTemplate.body><p>{text}</p></contentCardTemplate.body>
    </ContentCard>
  );
}
