import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
// Self-hosted Kanit, Latin subset, only the weights the site uses (font-display: swap).
import '@fontsource/kanit/latin-300.css';
import '@fontsource/kanit/latin-400.css';
import '@fontsource/kanit/latin-500.css';
import '@fontsource/kanit/latin-600.css';
import '@fontsource/kanit/latin-900.css';
import './index.css';

const container = document.getElementById('root')!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// Prerendered pages (see scripts/prerender.mjs) ship full HTML: hydrate it. The SPA fallback shell
// (_spa.html, used for brand-new blog posts until the next build) has an empty root: render it.
if (container.firstElementChild) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
