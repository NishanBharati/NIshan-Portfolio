import type { Post, PostSummary } from './posts';
import type { ShowcaseProject } from './projects';

/**
 * Data the build-time prerenderer fetched for a page. It is serialised into the page as
 * <script type="application/json" id="__INITIAL_DATA__"> (JSON, not executable, so it stays CSP-safe)
 * and read back on the client so hydration renders exactly what the server rendered.
 */
export type InitialData = {
  projects?: ShowcaseProject[];
  /** Every published post (summary fields), newest first. */
  posts?: PostSummary[];
  /** The full article on /blog/:slug pages. */
  post?: Post;
  /** ISO date (YYYY-MM-DD) of the build that produced this page. */
  lastUpdated?: string;
};

export const INITIAL_DATA_ELEMENT_ID = '__INITIAL_DATA__';

let serverData: InitialData = {};
let clientData: InitialData | undefined;

/** Called by the prerenderer before rendering each route. */
export function setServerInitialData(data: InitialData) {
  serverData = data;
}

export function getInitialData(): InitialData {
  if (typeof document === 'undefined') return serverData;
  if (clientData === undefined) {
    try {
      const raw = document.getElementById(INITIAL_DATA_ELEMENT_ID)?.textContent;
      clientData = raw ? (JSON.parse(raw) as InitialData) : {};
    } catch {
      clientData = {};
    }
  }
  return clientData;
}
