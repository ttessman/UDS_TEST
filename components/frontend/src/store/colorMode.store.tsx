import { createContext, useContext } from "react";
import type { PaletteMode } from "@mui/material";

export type ColorModeContextValue = {
  mode: PaletteMode;
  toggleMode: () => void;
};

const ColorModeContext = createContext<ColorModeContextValue | null>(null);

export const ColorModeProvider = ColorModeContext.Provider;

export function useColorMode() {
  const context = useContext(ColorModeContext);

  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }

  return context;
}
