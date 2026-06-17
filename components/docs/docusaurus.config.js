import { themes as prismThemes } from "prism-react-renderer";

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
    experimental_router: "hash",
    v4: true,
    faster: {
      swcJsLoader: false,
      swcJsMinimizer: false,
      swcHtmlMinimizer: false,
      lightningCssMinimizer: false,
      mdxCrossCompilerCache: false,
      rspackBundler: false,
      rspackPersistentCache: false,
      ssgWorkerThreads: false,
      gitEagerVcs: false
    }
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
          sidebarPath: "./sidebars.js",
          routeBasePath: "/"
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css"
        }
      }
    ]
  ],
  themeConfig: {
    colorMode: {
      defaultMode: "light",
      respectPrefersColorScheme: false
    },
    navbar: {
      title: "UDS Local POC",
      items: [
        { type: "docSidebar", sidebarId: "docsSidebar", position: "left", label: "Docs" },
        { href: "https://app.uds.dev", label: "Frontend", position: "right" }
      ]
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Runbooks",
          items: [
            { label: "Local Development", to: "/local-development" },
            { label: "Container Runbook", to: "/container-runbook" },
            { label: "UDS Notes", to: "/uds-notes" }
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
