import Link from "@docusaurus/Link";
import { CtaButton } from "../../button/CtaButton";
import { ColorModeToggleButton } from "../../button/resourceTypes/ColorModeToggleButton";
import { Icon } from "../../icon/Icon";
import { NavLinks } from "../../nav/NavLinks";
import { Sidebar, sidebarTemplate } from "../Sidebar";
import { CtaSection, ctaSectionTemplate } from "../../section/resourceTypes/CtaSection";
import type { NavItem } from "../../../pages/microsite/microsite.types";

export type MicrositeSidebarProps = {
  learnItems: NavItem[];
  referenceItems: NavItem[];
};

export function MicrositeSidebar({ learnItems, referenceItems }: MicrositeSidebarProps) {
  return (
    <Sidebar>
      <sidebarTemplate.brand>
        <CtaButton component={Link} icon={<Icon name="kube" />} to="/" variant="brand">
          UDS Local POC
        </CtaButton>
      </sidebarTemplate.brand>
      <sidebarTemplate.actions>
        <ColorModeToggleButton />
      </sidebarTemplate.actions>
      <sidebarTemplate.nav>
        <NavLinks
          groups={[
            { label: "Learn", items: learnItems },
            { label: "Reference", items: referenceItems }
          ]}
        />
      </sidebarTemplate.nav>
      <sidebarTemplate.cta>
        <CtaSection actions={[{ children: "Open Frontend", href: "https://app.uds.dev/" }]}>
          <ctaSectionTemplate.title>
            <strong>Ready to try it?</strong>
          </ctaSectionTemplate.title>
          <ctaSectionTemplate.body>
            <p>Launch the app catalog and explore live.</p>
          </ctaSectionTemplate.body>
        </CtaSection>
      </sidebarTemplate.cta>
    </Sidebar>
  );
}
