import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { Route, Routes, useLocation } from 'react-router-dom';
import ScrollManager from './components/ScrollManager';
import SiteHeader from './components/SiteHeader';
import FooterSection from './sections/FooterSection';
import HomePage from './pages/HomePage';
import BlogIndexPage from './pages/BlogIndexPage';
import NotFoundPage from './pages/NotFoundPage';

// Article pages pull in the Markdown renderer, so they load on demand. Prerendered article HTML stays
// on screen while this chunk loads: React hydrates the Suspense boundary once it arrives.
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

export default function App() {
  const { pathname } = useLocation();

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#top"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-white focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#0C0C0C]"
      >
        Skip to content
      </a>
      <ScrollManager />
      <SiteHeader />
      <main id="top" tabIndex={-1} className="outline-none" style={{ background: '#0C0C0C', overflowX: 'clip' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/blog" element={<BlogIndexPage />} />
          <Route
            path="/blog/:slug"
            element={
              <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
                <BlogPostPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      {/* On the home page the footer tucks over the last section's rounded bottom. */}
      <FooterSection overlap={pathname === '/'} />
    </MotionConfig>
  );
}
