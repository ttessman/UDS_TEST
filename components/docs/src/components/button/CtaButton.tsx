import type { ButtonHTMLAttributes, ElementType, ReactNode } from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export type CtaButtonVariant = "primary" | "secondary" | "text" | "brand" | "nav" | "compactGhost" | "chrome";

export type CtaButtonProps = {
  "aria-controls"?: string;
  "aria-expanded"?: boolean;
  children: ReactNode;
  component?: ElementType;
  href?: string;
  icon?: ReactNode;
  iconSx?: SxProps<Theme>;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  selected?: boolean;
  sx?: SxProps<Theme>;
  to?: string;
  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  variant?: CtaButtonVariant;
};

const baseSx: SxProps<Theme> = {
  alignItems: "center",
  borderRadius: "8px",
  display: "inline-flex",
  fontWeight: 750,
  gap: 1,
  justifyContent: "center",
  letterSpacing: 0,
  minHeight: 44,
  minWidth: 168,
  px: 2.5,
  textDecoration: "none",
  transition: "background 160ms ease, border-color 160ms ease, transform 160ms ease",
  "&:hover": {
    textDecoration: "none",
    transform: "translateY(-1px)"
  }
};

const variantSx = {
  brand: {
    background: "transparent",
    color: "var(--docs-text-primary)",
    fontSize: 18,
    fontWeight: 850,
    minHeight: "auto",
    minWidth: 0,
    px: 0
  },
  compactGhost: {
    background: "rgba(255, 255, 255, 0.12)",
    border: 0,
    color: "#ffffff",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 750,
    minHeight: 34,
    minWidth: 0,
    px: 1.75,
    "&:hover": {
      background: "rgba(255, 255, 255, 0.18)",
      textDecoration: "none",
      transform: "none"
    }
  },
  chrome: {
    background: "var(--docs-control-bg)",
    border: "1px solid var(--docs-control-border)",
    color: "var(--docs-control-text)",
    cursor: "pointer",
    font: "inherit",
    fontWeight: 800,
    minHeight: 42,
    minWidth: 0,
    px: 2,
    "&:hover": {
      background: "var(--docs-control-bg-hover)",
      textDecoration: "none",
      transform: "none"
    }
  },
  nav: {
    background: "transparent",
    color: "var(--docs-nav-text)",
    display: "flex",
    fontSize: 14,
    fontWeight: 700,
    justifyContent: "flex-start",
    minHeight: 36,
    minWidth: 0,
    px: 1.25,
    py: 1,
    width: "100%",
    "&:hover": {
      background: "var(--docs-nav-hover-bg)",
      color: "var(--docs-nav-active-text)",
      textDecoration: "none",
      transform: "none"
    }
  },
  primary: {
    background: "linear-gradient(135deg, #2563eb, #5b7cfa)",
    boxShadow: "0 18px 36px rgba(37, 99, 235, 0.28)",
    color: "#ffffff"
  },
  secondary: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.22)",
    color: "#ffffff"
  },
  text: {
    background: "transparent",
    boxShadow: "none",
    color: "#dbeafe",
    minHeight: "auto",
    minWidth: 0,
    px: 0
  }
} satisfies Record<CtaButtonVariant, SxProps<Theme>>;

export function CtaButton({
  "aria-controls": ariaControls,
  "aria-expanded": ariaExpanded,
  children,
  component = "a",
  href,
  icon,
  iconSx,
  onClick,
  selected = false,
  sx,
  to,
  type,
  variant = "primary"
}: CtaButtonProps) {
  return (
    <Box
      component={component}
      aria-controls={ariaControls}
      aria-expanded={ariaExpanded}
      href={href}
      onClick={onClick}
      sx={[
        baseSx,
        variantSx[variant],
        selected && variant === "nav"
          ? {
              background: "var(--docs-nav-active-bg)",
              color: "var(--docs-nav-active-text)"
            }
          : undefined,
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      to={to}
      type={type}
    >
      {icon ? (
        <Box
          sx={[
            {
              alignItems: "center",
              background: "linear-gradient(135deg, #2563eb, #7c3aed)",
              borderRadius: "8px",
              color: "#ffffff",
              display: "inline-flex",
              height: 34,
              justifyContent: "center",
              width: 34,
              "& .icon": {
                background: "transparent",
                boxShadow: "none",
                color: "#ffffff"
              }
            },
            ...(Array.isArray(iconSx) ? iconSx : [iconSx])
          ]}
        >
          {icon}
        </Box>
      ) : null}
      {children}
    </Box>
  );
}
