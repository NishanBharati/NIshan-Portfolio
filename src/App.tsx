import { lazy, Suspense } from 'react';
import { MotionConfig } from 'framer-motion';
import { Route, Routes } from 'react-router-dom';
import ScrollManager from './components/ScrollManager';
import SiteHeader from './components/SiteHeader';
import HomePage from './pages/HomePage';
import BlogIndexPage from './pages/BlogIndexPage';
import NotFoundPage from './pages/NotFoundPage';

// Article pages pull in the Markdown renderer, so they load on demand.
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollManager />
      <SiteHeader />
      <main id="top" style={{ background: '#0C0C0C', overflowX: 'clip' }}>
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
    </MotionConfig>
  );
}
