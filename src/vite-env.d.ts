/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_METALS_API_TOKEN: string
  readonly VITE_METALS_API_USER_ID: string
  readonly VITE_PRIVY_APP_ID: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
