import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { App } from "./App.js";
import { ColorModeProvider } from "./store/colorMode.store.js";
import { ModalProvider } from "./store/modal.store.js";
import "./styles.css";

const initialStoredMode = window.localStorage.getItem("uds-poc-color-mode");
const initialColorMode: PaletteMode = initialStoredMode === "light" || initialStoredMode === "dark" ? initialStoredMode : "dark";
document.documentElement.dataset.colorMode = initialColorMode;
document.body.dataset.colorMode = initialColorMode;

function createAppTheme(mode: PaletteMode) {
  const dark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: dark ? "#8fb7ff" : "#1d4ed8"
      },
      success: {
        main: dark ? "#39d98a" : "#047857"
      },
      background: {
        default: dark ? "#030712" : "#f8fafc",
        paper: dark ? "#111827" : "#ffffff"
      },
      divider: dark ? "#334155" : "#cbd5e1",
      text: {
        primary: dark ? "#f8fafc" : "#0f172a",
        secondary: dark ? "#b6c2d2" : "#475569"
      }
    },
    shape: {
      borderRadius: 8
    },
    typography: {
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none"
          }
        }
      }
    }
  });
}

function AppRoot() {
  const [mode, setMode] = useState<PaletteMode>(initialColorMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  useEffect(() => {
    window.localStorage.setItem("uds-poc-color-mode", mode);
    document.documentElement.dataset.colorMode = mode;
    document.body.dataset.colorMode = mode;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ColorModeProvider value={{ mode, toggleMode: () => setMode((current) => (current === "dark" ? "light" : "dark")) }}>
        <ModalProvider>
          <App />
        </ModalProvider>
      </ColorModeProvider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>
);
