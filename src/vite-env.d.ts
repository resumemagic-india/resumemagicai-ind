
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_STRIPE_BASIC_PLAN_LINK: string;
  readonly VITE_STRIPE_PLUS_PLAN_LINK: string;
  readonly VITE_STRIPE_PMC_ID: string;
  readonly VITE_STRIPE_PMD_ID: string;
  // Add more environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
