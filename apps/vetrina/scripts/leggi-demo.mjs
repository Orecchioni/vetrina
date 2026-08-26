#!/usr/bin/env node
/**
 * Legge slug/repo/ramo da src/dati/demo.ts senza dipendere da un parser TS:
 * il file è dati, non logica, e il formato è stabile. Usato dal workflow di
 * deploy per sapere quali repo template clonare e compilare come anteprime.
 *
 * File a parte, non un one-liner dentro il workflow: un `node -e '...'`
 * annidato in un blocco bash annidato in YAML ha già causato un bug di
 * quoting reale (un apice singolo dentro la regex chiudeva in anticipo la
 * stringa di bash). Qui si testa allo stesso modo in cui gira in CI.
 */
import { readFileSync } from "node:fs";

const src = readFileSync(new URL("../src/dati/demo.ts", import.meta.url), "utf8");
const blocchi = src.match(/\{\s*slug:[\s\S]*?\}/g) ?? [];

const righe = blocchi.map((b) => {
  const campo = (chiave) => (b.match(new RegExp(chiave + ':\\s*"([^"]+)"')) ?? [])[1];
  return [campo("slug"), campo("repo"), campo("ramo")].join(" ");
});

if (righe.length === 0) {
  throw new Error("nessuna demo trovata in demo.ts");
}

console.log(righe.join("\n"));
