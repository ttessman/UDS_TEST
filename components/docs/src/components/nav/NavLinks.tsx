import Link from "@docusaurus/Link";
import { Box } from "@mui/material";
import { CtaButton } from "../button/CtaButton";
import type { NavItem } from "../../pages/microsite/microsite.types";
import { NavLabel } from "./NavLabel";

export type NavGroup = {
  items: NavItem[];
  label?: string;
};

export type NavLinksProps = {
  groups: NavGroup[];
  home?: NavItem;
};

export function NavLinks({ groups, home = { href: "/", label: "Home" } }: NavLinksProps) {
  return (
    <Box aria-label="Docs sections" component="nav" sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <CtaButton component={Link} selected to={home.href} variant="nav">
        {home.label}
      </CtaButton>
      {groups.map((group) => (
        <Box component="section" key={group.label ?? group.items.map((item) => item.href).join("|")}>
          {group.label ? <NavLabel>{group.label}</NavLabel> : null}
          {group.items.map((item) => (
            <CtaButton component={Link} key={item.href} to={item.href} variant="nav">
              {item.label}
            </CtaButton>
          ))}
        </Box>
      ))}
    </Box>
  );
}
