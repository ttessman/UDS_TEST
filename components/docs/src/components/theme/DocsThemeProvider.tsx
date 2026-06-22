import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Box, GlobalStyles } from "@mui/material";
import type { PaletteMode } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { ColorModeProvider } from "@uds-poc/shared-ui/store/colorMode.store";

const storageKey = "uds-poc-color-mode";
const docusaurusStorageKey = "theme";

export type DocsThemeProviderProps = {
  children: ReactNode;
};

export function DocsThemeProvider({ children }: DocsThemeProviderProps) {
  const [mode, setMode] = useState<PaletteMode>(getInitialMode);
  const theme = useMemo(() => createDocsTheme(mode), [mode]);

  useEffect(() => {
    const syncFromDocumentTheme = () => {
      const themeMode = document.documentElement.getAttribute("data-theme");

      if (themeMode === "dark" || themeMode === "light") {
        setMode((current) => (current === themeMode ? current : themeMode));
      }
    };

    const observer = new MutationObserver(syncFromDocumentTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
      attributes: true
    });

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== docusaurusStorageKey) {
        return;
      }

      if (event.newValue === "dark" || event.newValue === "light") {
        setMode((current) => (current === event.newValue ? current : event.newValue));
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, mode);
    document.documentElement.dataset.colorMode = mode;
    document.body.dataset.colorMode = mode;
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <ColorModeProvider value={{ mode, toggleMode: () => setMode((current) => (current === "dark" ? "light" : "dark")) }}>
        <GlobalStyles styles={getDocsGlobalStyles(mode)} />
        <Box sx={getDocsThemeVars(mode)}>
          {children}
        </Box>
      </ColorModeProvider>
    </ThemeProvider>
  );
}

function getInitialMode(): PaletteMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const documentMode = document.documentElement.getAttribute("data-theme");
  if (documentMode === "dark" || documentMode === "light") {
    return documentMode;
  }

  const stored = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(docusaurusStorageKey);
  return stored === "dark" ? "dark" : "light";
}

function createDocsTheme(mode: PaletteMode) {
  const dark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: dark ? "#8fb7ff" : "#1d4ed8"
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
    }
  });
}

function getDocsThemeVars(mode: PaletteMode) {
  const dark = mode === "dark";

  return {
    "--docs-band-bg": dark
      ? "linear-gradient(90deg, rgba(15, 23, 42, 0.92), rgba(13, 34, 45, 0.92) 52%, rgba(15, 23, 42, 0.92))"
      : "linear-gradient(90deg, #f8fbff, #eef6ff 50%, #f8fbff)",
    "--docs-border": dark ? "rgba(148, 163, 184, 0.28)" : "#d8e2f1",
    "--docs-card-bg": dark ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.92)",
    "--docs-card-shadow": dark ? "0 16px 38px rgba(0, 0, 0, 0.22)" : "0 16px 38px rgba(30, 49, 78, 0.08)",
    "--docs-code-bg": dark ? "rgba(15, 23, 42, 0.92)" : "#f8fafc",
    "--docs-code-border": dark ? "rgba(148, 163, 184, 0.3)" : "#cbd5e1",
    "--docs-control-bg": dark ? "rgba(37, 99, 235, 0.18)" : "#eef4ff",
    "--docs-control-bg-hover": dark ? "rgba(37, 99, 235, 0.28)" : "#e2edff",
    "--docs-control-border": dark ? "rgba(147, 197, 253, 0.34)" : "#d7e3f8",
    "--docs-control-border-hover": dark ? "rgba(147, 197, 253, 0.48)" : "#c7d8f3",
    "--docs-control-cluster-bg": dark ? "rgba(3, 7, 18, 0.72)" : "rgba(255, 255, 255, 0.76)",
    "--docs-control-shadow": dark ? "0 16px 38px rgba(0, 0, 0, 0.22)" : "0 18px 42px rgba(30, 49, 78, 0.11)",
    "--docs-control-text": dark ? "#bfdbfe" : "#2058d8",
    "--docs-graphic-accent": dark ? "rgba(96, 165, 250, 0.62)" : "#bfdbfe",
    "--docs-graphic-bg": dark
      ? "linear-gradient(180deg, rgba(8, 13, 28, 0.98), rgba(15, 23, 42, 0.96))"
      : "linear-gradient(180deg, #f8fbff, #eef5ff)",
    "--docs-graphic-block": dark ? "rgba(148, 163, 184, 0.58)" : "#ffffff",
    "--docs-graphic-danger": dark ? "rgba(248, 113, 113, 0.48)" : "#fee2e2",
    "--docs-graphic-line": dark ? "rgba(226, 232, 240, 0.62)" : "#273043",
    "--docs-graphic-muted-line": dark ? "rgba(96, 165, 250, 0.28)" : "#dbeafe",
    "--docs-graphic-soft": dark ? "rgba(30, 41, 59, 0.82)" : "#eef2ff",
    "--docs-graphic-success": dark ? "rgba(74, 222, 128, 0.46)" : "#bbf7d0",
    "--docs-graphic-warning": dark ? "rgba(251, 191, 36, 0.48)" : "#fef3c7",
    "--docs-muted": dark ? "#a8b5c8" : "#56657a",
    "--docs-nav-active-bg": dark ? "rgba(37, 99, 235, 0.24)" : "#eef4ff",
    "--docs-nav-active-text": dark ? "#bfdbfe" : "#2058d8",
    "--docs-nav-hover-bg": dark ? "rgba(37, 99, 235, 0.16)" : "#eef4ff",
    "--docs-nav-label": dark ? "#94a3b8" : "#69758a",
    "--docs-nav-text": dark ? "#d7e2f4" : "#243047",
    "--docs-page-bg": dark
      ? "radial-gradient(circle at 70% 8%, rgba(74, 129, 255, 0.18), transparent 30%), linear-gradient(180deg, #030712 0%, #07111f 42%, #050816 100%)"
      : "radial-gradient(circle at 65% 8%, rgba(74, 129, 255, 0.12), transparent 30%), linear-gradient(180deg, #ffffff 0%, #f7faff 42%, #ffffff 100%)",
    "--docs-page-solid": dark ? "#030712" : "#ffffff",
    "--docs-scrim": dark ? "rgba(2, 6, 23, 0.62)" : "rgba(15, 23, 42, 0.28)",
    "--docs-sidebar-bg": dark ? "rgba(8, 13, 28, 0.96)" : "rgba(255, 255, 255, 0.96)",
    "--docs-sidebar-border": dark ? "rgba(148, 163, 184, 0.22)" : "#e3e9f4",
    "--docs-sidebar-shadow": dark ? "16px 0 45px rgba(0, 0, 0, 0.28)" : "16px 0 45px rgba(22, 34, 56, 0.07)",
    "--docs-text-primary": dark ? "#f8fafc" : "#111827",
    "--docs-text-secondary": dark ? "#b6c2d2" : "#475569",
    "--docs-topbar-bg": dark ? "rgba(8, 13, 28, 0.98)" : "rgba(255, 255, 255, 0.96)",
    color: "var(--docs-text-primary)",
    minHeight: "100vh"
  };
}

function getDocsGlobalStyles(mode: PaletteMode) {
  const dark = mode === "dark";
  const vars = getDocsThemeVars(mode);

  return {
    ":root": {
      ...vars,
      "--ifm-background-color": "var(--docs-page-solid)",
      "--ifm-background-surface-color": "var(--docs-card-bg)",
      "--ifm-code-background": "var(--docs-code-bg)",
      "--ifm-color-content": "var(--docs-text-primary)",
      "--ifm-color-content-secondary": "var(--docs-text-secondary)",
      "--ifm-font-color-base": "var(--docs-text-primary)",
      "--ifm-heading-color": "var(--docs-text-primary)",
      "--ifm-link-color": dark ? "#93c5fd" : "#2058d8",
      "--ifm-menu-color": "var(--docs-nav-text)",
      "--ifm-navbar-background-color": "var(--docs-topbar-bg)",
      "--ifm-toc-border-color": "var(--docs-border)",
      "--text-color": "var(--docs-text-primary)"
    },
    "html, body, #__docusaurus": {
      background: "var(--docs-page-solid)",
      color: "var(--docs-text-primary)",
      minHeight: "100%"
    },
    body: {
      "--text-color": "var(--docs-text-primary)",
      background: "var(--docs-page-solid)",
      color: "var(--docs-text-primary)"
    },
    ".main-wrapper": {
      background: "var(--docs-page-bg)",
      color: "var(--docs-text-primary)",
      minHeight: "100vh"
    },
    ".docs-wrapper, [class*='docsWrapper'], [class*='docRoot'], [class*='docMainContainer'], [class*='docItemContainer']": {
      background: "var(--docs-page-bg)",
      color: "var(--docs-text-primary)"
    },
    section: {
      marginTop: 0
    },
    ".navbar": {
      background: "var(--docs-topbar-bg)",
      borderBottom: "1px solid var(--docs-sidebar-border)",
      boxShadow: "none",
      color: "var(--docs-text-primary)"
    },
    ".navbar__brand, .navbar__title, .navbar__link, .navbar__item": {
      color: "var(--docs-nav-text)"
    },
    ".navbar__link--active, .navbar__link:hover": {
      color: "var(--docs-nav-active-text)"
    },
    ".navbar-open-catalog-icon": {
      alignItems: "center",
      background: "var(--docs-control-bg)",
      border: "1px solid var(--docs-control-border)",
      borderRadius: "999px",
      color: "transparent",
      display: "inline-flex",
      height: "42px",
      justifyContent: "center",
      minWidth: "42px",
      overflow: "hidden",
      p: 0,
      textDecoration: "none",
      textIndent: "110%",
      whiteSpace: "nowrap",
      width: "42px"
    },
    ".navbar-open-catalog-icon:hover": {
      background: "var(--docs-control-bg-hover)",
      borderColor: "var(--docs-control-border-hover)",
      color: "transparent",
      textDecoration: "none"
    },
    ".navbar-open-catalog-icon::before": {
      background: "var(--docs-control-text)",
      content: '""',
      display: "block",
      height: "22px",
      maskImage:
        'url("data:image/svg+xml,%3Csvg viewBox=%270 0 24 24%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath fill=%27black%27 d=%27M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z%27/%3E%3C/svg%3E")',
      maskRepeat: "no-repeat",
      maskSize: "contain",
      width: "22px"
    },
    ".theme-doc-sidebar-container": {
      background: "var(--docs-sidebar-bg)",
      borderRight: "1px solid var(--docs-sidebar-border)"
    },
    ".menu__link": {
      color: "var(--docs-nav-text)"
    },
    ".menu__link--active, .menu__link:hover": {
      background: "var(--docs-nav-active-bg)",
      color: "var(--docs-nav-active-text)"
    },
    ".theme-doc-markdown, .markdown": {
      color: "var(--docs-text-primary)"
    },
    ".theme-doc-markdown h1, .theme-doc-markdown h2, .theme-doc-markdown h3, .theme-doc-markdown h4, .markdown h1, .markdown h2, .markdown h3, .markdown h4": {
      color: "var(--docs-text-primary)"
    },
    ".theme-doc-markdown p, .theme-doc-markdown li, .markdown p, .markdown li": {
      color: "var(--docs-text-secondary)"
    },
    ".theme-doc-markdown code, .markdown code": {
      background: "var(--docs-code-bg)",
      border: "1px solid var(--docs-code-border)",
      color: "var(--docs-text-primary)"
    },
    ".theme-doc-markdown table, .markdown table": {
      background: "var(--docs-card-bg)",
      border: "1px solid var(--docs-border)",
      borderCollapse: "collapse",
      boxShadow: "var(--docs-card-shadow)",
      color: "var(--docs-text-primary)"
    },
    ".theme-doc-markdown thead tr, .markdown thead tr": {
      background: dark ? "rgba(15, 23, 42, 0.96)" : "#f8fafc"
    },
    ".theme-doc-markdown tbody tr:nth-of-type(2n), .markdown tbody tr:nth-of-type(2n)": {
      background: dark ? "rgba(15, 23, 42, 0.58)" : "rgba(248, 250, 252, 0.8)"
    },
    ".theme-doc-markdown th, .theme-doc-markdown td, .markdown th, .markdown td": {
      borderColor: "var(--docs-border)"
    },
    ".table-of-contents, .table-of-contents__link": {
      color: "var(--docs-text-secondary)"
    },
    ".table-of-contents__link--active, .table-of-contents__link:hover": {
      color: "var(--docs-nav-active-text)"
    },
    ".breadcrumbs__link": {
      color: "var(--docs-text-secondary)"
    },
    ".breadcrumbs__item--active .breadcrumbs__link": {
      color: "var(--docs-nav-active-text)"
    },
    ".footer": {
      background: dark ? "#0f172a" : "#334155",
      borderTop: "1px solid var(--docs-border)",
      color: "#e2e8f0"
    },
    ".footer__title": {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: 850
    },
    ".footer__link-item, .footer__copyright": {
      color: "#d7e2f4"
    },
    ".footer__link-item:hover": {
      color: "#ffffff",
      textDecoration: "none"
    },
    "body.sales-microsite-page .main-wrapper": {
      background: "var(--docs-page-bg)",
      minHeight: "100vh"
    },
    "body.sales-microsite-page section": {
      marginTop: 0
    },
    "body.sales-microsite-page main": {
      marginTop: 0
    }
  };
}
