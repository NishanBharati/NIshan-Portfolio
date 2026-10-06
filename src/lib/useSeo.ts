import { useEffect } from 'react';
import { applySeo, type Seo } from './seo';

/** Keeps <head> in sync on client-side navigation. Prerendered pages already ship the same tags. */
export function useSeo(seo: Seo | null) {
  const key = seo ? `${seo.title}|${seo.description}|${seo.path ?? ''}|${seo.noindex ? 1 : 0}|${seo.jsonLd?.length ?? 0}` : '';
  useEffect(() => {
    if (seo) applySeo(seo);
    // `key` captures everything that changes the rendered head.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
