import type { ReactNode } from "react";
import type { SxProps, Theme } from "@mui/material/styles";
import { ContentCard, contentCardTemplate } from "../ContentCard";

export type BulletedContentCardProps = {
  items: string[];
  sx?: SxProps<Theme>;
  title: ReactNode;
};

export function BulletedContentCard({ items, sx, title }: BulletedContentCardProps) {
  return (
    <ContentCard sx={sx}>
      <contentCardTemplate.title>{title}</contentCardTemplate.title>
      <contentCardTemplate.body>
        <ul>
          {items.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </contentCardTemplate.body>
    </ContentCard>
  );
}
