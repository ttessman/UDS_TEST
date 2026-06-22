import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { CtaButton } from "../components/button/CtaButton";
import { BulletedContentCard } from "../components/card/resourceTypes/BulletedContentCard";
import { IconContentCard } from "../components/card/resourceTypes/IconContentCard";
import { StoryContentCard } from "../components/card/resourceTypes/StoryContentCard";
import { RocketGraphic } from "../components/graphics/RocketGraphic";
import { problemStoryGraphics, proofStoryGraphics, StoryGraphic } from "../components/graphics/StoryGraphic";
import { Icon } from "../components/icon/Icon";
import { HeroValueList } from "../components/list/HeroValueList";
import { sectionTemplate } from "../components/section/Section";
import { BannerSection, bannerSectionTemplate } from "../components/section/resourceTypes/BannerSection";
import { CardGridSection } from "../components/section/resourceTypes/CardGridSection";
import { FeatureGridSection } from "../components/section/resourceTypes/FeatureGridSection";
import { HeroSection, heroSectionTemplate } from "../components/section/resourceTypes/HeroSection";
import { ShowcaseSection } from "../components/section/resourceTypes/ShowcaseSection";
import { TimelineSection } from "../components/section/resourceTypes/TimelineSection";
import { MicrositeSidebar } from "../components/sidebar/resourceTypes/MicrositeSidebar";
import {
  architectureNodes,
  installedResources,
  learnNav,
  platformNodes,
  problemCards,
  proofCards,
  referenceNav,
  solutionSteps,
  valueProps
} from "./microsite/microsite.data";

const pageShellSx = {
  background: "var(--docs-page-bg)",
  color: "var(--docs-text-primary)",
  display: "grid",
  gridTemplateColumns: { xs: "1fr", lg: "230px minmax(0, 1fr)" },
  minHeight: "100vh"
};

const pageMainSx = {
  minWidth: 0
};

function LandingPage() {
  useEffect(() => {
    document.body.classList.add("sales-microsite-page");
    return () => document.body.classList.remove("sales-microsite-page");
  }, []);

  return (
    <Layout title="UDS-backed app catalog" description="A UDS-backed app catalog for deployable packages.">
      <Box sx={pageShellSx}>
        <MicrositeSidebar learnItems={learnNav} referenceItems={referenceNav} />
        <Box component="main" sx={pageMainSx}>
          <HeroSection>
            <heroSectionTemplate.left>
              <h1>
                A UDS-backed app catalog for <span>deployable packages</span>
              </h1>
              <p>
                Replace static app lists with live package metadata, install state, launch endpoints,
                and backend-mediated UDS actions.
              </p>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.75, mt: 3.75 }}>
                <CtaButton href="https://app.uds.dev/">Open Frontend</CtaButton>
                <CtaButton component={Link} to="/learn/architecture" variant="secondary">Read Architecture</CtaButton>
              </Box>
              <HeroValueList>
                {valueProps.map((item) => (
                  <span key={item.title}>
                    <Icon name={item.icon} />
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.text}</small>
                    </span>
                  </span>
                ))}
              </HeroValueList>
            </heroSectionTemplate.left>
            <heroSectionTemplate.right>
              <ShowcaseSection resources={installedResources} />
            </heroSectionTemplate.right>
          </HeroSection>
          <CardGridSection
            data={{ items: problemCards }}
            renderItem={(card) => (
              <StoryContentCard
                graphic={<StoryGraphic shapes={problemStoryGraphics[card.visual]} />}
                text={card.text}
                title={card.title}
              />
            )}
          >
            <sectionTemplate.header>
              <h2>The problem with static app lists</h2>
            </sectionTemplate.header>
          </CardGridSection>
          <FeatureGridSection
            data={{ items: solutionSteps }}
            renderItem={(step) => (
              <>
                <Icon name={step.icon} />
                <Box>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Box>
              </>
            )}
          >
            <sectionTemplate.header>
              <h2>Our solution: a UDS-backed platform</h2>
            </sectionTemplate.header>
          </FeatureGridSection>
          <CardGridSection
            data={{ items: proofCards }}
            renderItem={(card) => (
              <StoryContentCard
                graphic={<StoryGraphic shapes={proofStoryGraphics[card.kind]} />}
                text={card.text}
                title={card.title}
              />
            )}
            variant="compact"
          >
            <sectionTemplate.header>
              <h2>Proof: what it looks like</h2>
            </sectionTemplate.header>
          </CardGridSection>
          <TimelineSection
            data={{ items: platformNodes }}
            renderItem={(node) => (
              <BulletedContentCard items={node.items} title={node.title} />
            )}
            variant="banded"
          >
            <sectionTemplate.header>
              <h2>Platform model</h2>
            </sectionTemplate.header>
          </TimelineSection>
          <TimelineSection
            data={{ items: architectureNodes }}
            renderItem={(node) => (
              <IconContentCard icon={<Icon name={node.icon} />} text={node.text} title={node.title} />
            )}
          >
            <sectionTemplate.header>
              <h2>Architecture at a glance</h2>
            </sectionTemplate.header>
          </TimelineSection>
          <BannerSection
            actions={[
              { children: "Open the App Catalog", href: "https://app.uds.dev/" },
              { children: "Explore the Docs", component: Link, to: "/learn/quickstart", variant: "secondary" }
            ]}
          >
            <bannerSectionTemplate.graphic>
              <RocketGraphic />
            </bannerSectionTemplate.graphic>
            <bannerSectionTemplate.content>
              <div>
                <h2>More than a demo. A platform direction.</h2>
                <p>
                  This POC shows how UDS packages can become a first-class, Kubernetes-native app catalog
                  with real-time state, secure actions, and a better user experience.
                </p>
              </div>
            </bannerSectionTemplate.content>
          </BannerSection>
        </Box>
      </Box>
    </Layout>
  );
}

export default LandingPage;
