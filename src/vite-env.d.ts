/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** True when public/Nishan-Bharati-CV.pdf exists at build time (defined in vite.config.ts). */
declare const __CV_AVAILABLE__: boolean;
