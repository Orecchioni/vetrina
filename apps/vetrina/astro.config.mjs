import { defineConfig } from "astro/config";

// Il sito e' statico come i template: nessun backend, il form punta a un
// endpoint Make esattamente come nei siti cliente (§6.1, tenant proprio).
// Astro Actions dell'intake guidato (§6.2) arriveranno al Blocco 6, non ora.
export default defineConfig({
  output: "static",
});
