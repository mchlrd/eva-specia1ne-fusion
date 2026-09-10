// Build config for SELF-HOSTED deployments (Windows Server + IIS).
//
// `vite.config.ts` (the default) targets the managed hosting setup, which builds
// a Cloudflare Worker bundle. That output cannot run on a Windows box, so this
// config switches Nitro to the Node server preset and produces a plain Node app:
//
//   npm run build:selfhosted      ->  .output/server/index.mjs + .output/public
//
// IIS then reverse-proxies to the Node process (see deploy/iis/web.config).
// Everything else (TanStack Start plugin, React, Tailwind, @ alias) comes from
// the same wrapper the default config uses, so the two builds stay in step.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Same SSR error wrapper the default config uses (src/server.ts).
  tanstackStart: {
    server: { entry: "server" },
  },
  // "node-server" = a long-running Node process instead of a worker bundle.
  nitro: {
    preset: "node-server",
  },
});
