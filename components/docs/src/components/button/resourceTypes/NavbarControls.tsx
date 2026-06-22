import { IconButtonCluster } from "@uds-poc/shared-ui/components/button/resourceTypes/IconButtonCluster";
import { ColorModeToggleButton } from "./ColorModeToggleButton";
import { OpenCatalogButton } from "./OpenCatalogButton";

export type NavbarControlsProps = {
  href?: string;
  label?: string;
};

export function NavbarControls({
  href = "https://app.uds.dev",
  label = "Open Catalog"
}: NavbarControlsProps) {
  return (
    <IconButtonCluster
      sx={{
        background: "var(--docs-control-cluster-bg)",
        borderColor: "var(--docs-control-border)",
        boxShadow: "var(--docs-control-shadow)",
        ml: { md: 1 }
      }}
    >
      <OpenCatalogButton href={href} label={label} />
      <ColorModeToggleButton />
    </IconButtonCluster>
  );
}
