/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional path to a real RAVA reefer .glb (e.g. "/models/container.glb"). */
  readonly VITE_CONTAINER_GLB?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
