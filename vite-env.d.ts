// Fix: Removed the '/// <reference types="vite/client" />' directive because the environment 
// is unable to locate the vite type definitions. The necessary ImportMeta types are 
// declared manually below to ensure compatibility.

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}

interface Window {
  aistudio?: {
    hasSelectedApiKey?: () => Promise<boolean>;
    openSelectKey?: () => Promise<void>;
  };
}
