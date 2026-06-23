import { IconActionButton } from "@uds-poc/shared-ui/components/button/resourceTypes/IconActionButton";

export type OpenCatalogButtonProps = {
  href?: string;
  label?: string;
};

export function OpenCatalogButton({
  href = "https://app.uds.dev",
  label = "Open Catalog"
}: OpenCatalogButtonProps) {
  return (
    <IconActionButton
      bordered
      component="a"
      href={href}
      icon="open"
      label={label}
      rel="noreferrer"
      sx={{
        background: "var(--docs-control-bg)",
        borderColor: "var(--docs-control-border)",
        color: "var(--docs-control-text)",
        height: "var(--docs-control-size)",
        minHeight: "var(--docs-control-size)",
        width: "var(--docs-control-size)",
        "&:hover": {
          background: "var(--docs-control-bg-hover)",
          borderColor: "var(--docs-control-border-hover)"
        }
      }}
      target="_blank"
      tooltip={label}
    />
  );
}
