#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { argv, exit, stderr, stdout } from "node:process";

import { validaTesto } from "./valida.js";

/**
 * `vetrina-validate <file.json> [altri.json]`
 *
 * Esce con 0 se tutti i file passano, con 1 al primo che non passa.
 * Il codice di uscita e' cio' che rende il validatore utilizzabile in CI e
 * nel build del template, dove un `content.json` rotto deve fermare tutto.
 */

const USO = "Uso: vetrina-validate <file.json> [altri.json...]";

function valutaFile(percorso: string): boolean {
  let testo: string;
  try {
    testo = readFileSync(percorso, "utf8");
  } catch {
    stderr.write(`✗ ${percorso}\n    file non leggibile\n\n`);
    return false;
  }

  const esito = validaTesto(testo);
  if (esito.valido) {
    stdout.write(`✓ ${percorso}\n`);
    return true;
  }

  const conta = esito.problemi.length === 1 ? "1 problema" : `${esito.problemi.length} problemi`;
  stderr.write(`✗ ${percorso} — ${conta}\n\n`);
  for (const p of esito.problemi) {
    stderr.write(`  ${p.percorso}\n    ${p.messaggio}\n\n`);
  }
  return false;
}

const file = argv.slice(2);

if (file.length === 0) {
  stderr.write(`${USO}\n`);
  exit(2);
}

const tuttiValidi = file.map(valutaFile).every(Boolean);
exit(tuttiValidi ? 0 : 1);
