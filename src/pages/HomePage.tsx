import { useEffect } from 'react';
import HeroSection from '../sections/HeroSection';
import AboutSection from '../sections/AboutSection';
import ExperienceSection from '../sections/ExperienceSection';
import EducationSection from '../sections/EducationSection';
import SkillsSection from '../sections/SkillsSection';
import ServicesSection from '../sections/ServicesSection';
import ProjectsSection from '../sections/ProjectsSection';
import BlogSection from '../sections/BlogSection';
import ContactSection from '../sections/ContactSection';
import FooterSection from '../sections/FooterSection';
import { SITE_TITLE, setPageMeta } from '../lib/pageMeta';

export default function HomePage() {
  useEffect(() => setPageMeta(SITE_TITLE), []);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ExperienceSection />
      <EducationSection />
      <SkillsSection />
      <ServicesSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
      <FooterSection overlap />
    </>
  );
}
