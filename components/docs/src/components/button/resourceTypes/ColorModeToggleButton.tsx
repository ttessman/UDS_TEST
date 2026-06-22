import { IconActionButton } from "@uds-poc/shared-ui/components/button/resourceTypes/IconActionButton";
import { useColorMode } from "@uds-poc/shared-ui/store/colorMode.store";

export function ColorModeToggleButton() {
  const { mode, toggleMode } = useColorMode();
  const nextMode = mode === "dark" ? "light" : "dark";

  return (
    <IconActionButton
      bordered
      icon={mode === "dark" ? "lightMode" : "darkMode"}
      label={`Switch to ${nextMode} mode`}
      onClick={toggleMode}
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
