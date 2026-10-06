import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the hash target after navigation (e.g. /blog -> /#about), otherwise to the top. */
export default function ScrollManager() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    const frame = requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, hash, key]);

  return null;
}
