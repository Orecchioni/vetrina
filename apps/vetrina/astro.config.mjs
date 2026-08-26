import { defineConfig } from "astro/config";

// Statico come i template: nessun backend, il form punta a un endpoint Make
// come nei siti cliente (§6.1). Astro Actions dell'intake (§6.2) al Blocco 6.
//
// `base` da variabile d'ambiente: alla radice in locale e su Netlify (dominio
// proprio), sotto /vetrina/ su GitHub Pages (che serve i project site in
// sottocartella). Default "/" perche' la consegna reale e' sempre a radice.
export default defineConfig({
  output: "static",
  base: process.env.SITE_BASE || "/",
});
