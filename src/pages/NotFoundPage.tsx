import NotFoundContent from '../components/NotFoundContent';
import { notFoundSeo } from '../lib/seo';
import { useSeo } from '../lib/useSeo';

export default function NotFoundPage() {
  useSeo(notFoundSeo());
  return <NotFoundContent />;
}
