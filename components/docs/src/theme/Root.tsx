import type { ReactNode } from "react";
import { DocsThemeProvider } from "../components/theme/DocsThemeProvider";
import "@uds-poc/shared-ui/styles.css";

export default function Root({ children }: { children: ReactNode }) {
  return <DocsThemeProvider>{children}</DocsThemeProvider>;
}
