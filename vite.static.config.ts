// Build config for STATIC deployments.
//
// `vite.config.ts` (the default) targets managed hosting and builds a Cloudflare
// Worker bundle. `vite.selfhosted.config.ts` builds a Node server. This one
// produces the input for a plain-files deployment — the shape evarotech.ca is
// hosted in today (IIS serving a folder):
//
//   npm run build:static
//     1. builds a Node server (below)
//     2. scripts/export-static.mjs renders every route through it and writes
//        plain HTML files to ./static-export  <- the folder you publish
//
// Why capture instead of using the plugin's built-in prerender: that path boots
// its own preview server, which resolves the SSR entry from Vite's env out-dir
// (`dist/server/server.js`). Nitro consumes the SSR build and emits
// `.output/server/index.mjs` instead, so the preview server can never load and
// every route fails with ERR_MODULE_NOT_FOUND. Rendering through the built
// server gives the same HTML with none of that internal wiring.
//
// The contact form has no static equivalent — a file cannot send mail — so this
// build also points it at a small same-origin handler
// (deploy/iis-static/contact.ashx), which ships alongside the export.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Same SSR error wrapper the other configs use (src/server.ts).
  tanstackStart: {
    server: { entry: "server" },
  },
  // Point the contact form at the IIS-side handler at build time, so the
  // managed and Node builds keep using the server function and stay untouched.
  vite: {
    define: {
      "import.meta.env.VITE_CONTACT_ENDPOINT": JSON.stringify("/contact.ashx"),
    },
  },
  nitro: {
    preset: "node-server",
  },
});
