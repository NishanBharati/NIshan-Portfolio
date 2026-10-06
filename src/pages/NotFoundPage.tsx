import { useEffect } from 'react';
import NotFoundContent from '../components/NotFoundContent';
import FooterSection from '../sections/FooterSection';
import { SITE_TITLE, setPageMeta } from '../lib/pageMeta';

export default function NotFoundPage() {
  useEffect(() => setPageMeta(`Page not found · ${SITE_TITLE}`, null, { noindex: true }), []);

  return (
    <>
      <NotFoundContent />
      <FooterSection />
    </>
  );
}
