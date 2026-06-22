import { themes as prismThemes } from "prism-react-renderer";
import slotTransform from "@beqa/unplugin-transform-react-slots";
import path from "node:path";

const baseUrl = process.env.UDS_DOCS_BASE_URL || "/";
const siteUrl = process.env.UDS_DOCS_URL || "https://docs.uds.dev";

const config = {
  title: "UDS Local POC",
  tagline: "Local package discovery, install state, and UDS notes",
  url: siteUrl,
  baseUrl,
  trailingSlash: false,
  organizationName: "uds-poc",
  projectName: "uds-core-local-poc",
  future: {
    experimental_router: "hash"
  },
  onBrokenLinks: "warn",
  markdown: {
    format: "detect",
    hooks: {
      onBrokenMarkdownImages: "warn",
      onBrokenMarkdownLinks: "warn"
    }
  },
  i18n: {
    defaultLocale: "en",
    locales: ["en"]
  },
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.mjs",
          routeBasePath: "learn"
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css"
        }
      }
    ]
  ],
  plugins: [
    function reactSlotsPlugin() {
      return {
        name: "react-slots-transform",
        configureWebpack() {
          return {
            resolve: {
              alias: {
                "@uds-poc/shared-ui": path.resolve(process.cwd(), "../../shared-ui/src"),
                "react-transition-group/TransitionGroupContext$": "react-transition-group/esm/TransitionGroupContext.js"
              },
              extensionAlias: {
                ".js": [".tsx", ".ts", ".js"]
              }
            },
            plugins: [
              slotTransform.webpack({
                include: [/\.[jt]sx$/]
              })
            ]
          };
        }
      };
    }
  ],
  themeConfig: {
    colorMode: {
      disableSwitch: true,
      defaultMode: "light",
      respectPrefersColorScheme: false
    },
    navbar: {
      title: "UDS Local POC",
      items: [
        { to: "/", label: "Home", position: "left" },
        { to: "/learn/quickstart", label: "Quickstart", position: "left" },
        { to: "/learn/architecture", label: "Architecture", position: "left" },
        {
          href: "https://app.uds.dev",
          label: "Open Catalog",
          position: "right",
          type: "custom-navbarControls"
        }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Start",
          items: [
            { label: "Open App Catalog", href: "https://app.uds.dev" },
            { label: "Quickstart", to: "/learn/quickstart" },
            { label: "Commands", to: "/learn/commands" }
          ]
        },
        {
          title: "Understand",
          items: [
            { label: "Product Model", to: "/learn/product-model" },
            { label: "User Journeys", to: "/learn/user-journeys" },
            { label: "Architecture", to: "/learn/architecture" }
          ]
        },
        {
          title: "Operate",
          items: [
            { label: "Kubernetes Runbook", to: "/learn/kubernetes-runbook" },
            { label: "macOS UDS Workaround", to: "/learn/uds-notes" }
          ]
        }
      ],
      copyright: `Copyright ${new Date().getFullYear()} UDS Local POC`
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula
    }
  }
};

export default config;
