import { Suspense } from 'react';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import ExperienceSection from '../sections/ExperienceSection';
import EducationSection from '../sections/EducationSection';
import SkillsSection from '../sections/SkillsSection';
import ServicesSection from '../sections/ServicesSection';
import ProjectsSection from '../sections/ProjectsSection';
import BlogSection from '../sections/BlogSection';
import ContactSection from '../sections/ContactSection';
import FaqSection from '../sections/FaqSection';
import MentionsSection from '../sections/MentionsSection';
import { FALLBACK_PROJECTS } from '../data/content';
import { getInitialData } from '../lib/initialData';
import { homeSeo } from '../lib/seo';
import { useSeo } from '../lib/useSeo';

export default function HomePage() {
  const { projects = FALLBACK_PROJECTS, lastUpdated } = getInitialData();
  useSeo(homeSeo({ projects, lastUpdated }));

  // Each section below the hero is its own Suspense boundary. The prerendered HTML is identical, but
  // React 18 hydrates boundaries as separate, interruptible tasks instead of one long main-thread
  // block, which keeps Total Blocking Time and INP down on phones.
  return (
    <>
      <HeroSection />
      {[AboutSection, ExperienceSection, EducationSection, SkillsSection, ServicesSection, ProjectsSection, BlogSection, MentionsSection, ContactSection, FaqSection].map(
        (Section, i) => (
          <Suspense key={i} fallback={null}>
            <Section />
          </Suspense>
        ),
      )}
    </>
  );
}
