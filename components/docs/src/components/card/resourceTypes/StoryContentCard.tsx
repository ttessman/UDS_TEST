import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { ContentCard, contentCardTemplate } from "../ContentCard";

export type StoryContentCardProps = {
  graphic: ReactNode;
  sx?: SxProps<Theme>;
  text: ReactNode;
  title: ReactNode;
};

export function StoryContentCard({ graphic, sx, text, title }: StoryContentCardProps) {
  return (
    <ContentCard sx={sx}>
      <contentCardTemplate.media>{graphic}</contentCardTemplate.media>
      <contentCardTemplate.title>{title}</contentCardTemplate.title>
      <contentCardTemplate.body><p>{text}</p></contentCardTemplate.body>
    </ContentCard>
  );
}
