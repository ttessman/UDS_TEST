import { IconActionButton } from "@uds-poc/shared-ui/components/button/resourceTypes/IconActionButton";
import { useColorMode } from "@docusaurus/theme-common";

export function ColorModeToggleButton() {
  const { colorMode, setColorMode } = useColorMode();
  const nextMode = colorMode === "dark" ? "light" : "dark";

  return (
    <IconActionButton
      bordered
      icon={colorMode === "dark" ? "lightMode" : "darkMode"}
      label={`Switch to ${nextMode} mode`}
      onClick={() => setColorMode(nextMode)}
      sx={{
        background: "var(--docs-control-bg)",
        borderColor: "var(--docs-control-border)",
        color: "var(--docs-control-text)",
        "&:hover": {
          background: "var(--docs-control-bg-hover)",
          borderColor: "var(--docs-control-border-hover)"
        }
      }}
    />
  );
}
