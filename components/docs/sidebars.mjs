const sidebars = {
  docsSidebar: [
    {
      type: "category",
      label: "Learn",
      collapsed: false,
      items: [
        { type: "doc", id: "intro", label: "POC Overview" },
        "quickstart",
        "product-model",
        "user-journeys",
        "architecture",
        "components",
        "kubernetes-runbook",
        "commands"
      ]
    },
    {
      type: "category",
      label: "Reference",
      collapsed: false,
      items: [
        { type: "doc", id: "uds-notes", label: "macOS UDS Workaround" },
        "frontend-architecture",
        "project-requirements",
        "history-notes"
      ]
    }
  ]
};

export default sidebars;
