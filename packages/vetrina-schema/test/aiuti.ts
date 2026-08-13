import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { valida } from "../src/valida.js";
import type { Problema } from "../src/errori.js";

/** Percorso dell'esempio di riferimento, che vive nei documenti e non nel pacchetto. */
export const PERCORSO_ESEMPIO = fileURLToPath(
  new URL("../../../docs/riferimenti/content.example.json", import.meta.url),
);

/** L'esempio, riletto da disco a ogni chiamata cosi' i casi negativi non si sporcano fra loro. */
export function esempio(): Record<string, unknown> {
  return JSON.parse(readFileSync(PERCORSO_ESEMPIO, "utf8")) as Record<string, unknown>;
}

/**
 * Applica una modifica all'esempio e valida il risultato.
 * Ogni caso negativo parte dall'esempio valido e rompe una cosa sola: cosi' l'errore
 * che si osserva e' quello della modifica, non un effetto collaterale.
 */
export function rompi(modifica: (doc: any) => void): Problema[] {
  const doc = esempio();
  modifica(doc);
  const esito = valida(doc);
  if (esito.valido) {
    throw new Error("il documento e' stato accettato, ma il caso doveva essere rifiutato");
  }
  return esito.problemi;
}

/**
 * Applica una modifica all'esempio e pretende che resti valido.
 * Serve ai casi in cui la decisione ha aperto una possibilita', non chiusa una.
 */
export function accetta(modifica: (doc: any) => void): void {
  const doc = esempio();
  modifica(doc);
  const esito = valida(doc);
  if (!esito.valido) {
    const dettaglio = esito.problemi.map((p) => `${p.percorso}: ${p.messaggio}`).join("\n");
    throw new Error(`il documento doveva essere accettato, invece:\n${dettaglio}`);
  }
}

/** Vero se almeno un problema riguarda quel percorso e il messaggio contiene il frammento. */
export function riporta(problemi: Problema[], percorso: string, frammento: string): boolean {
  return problemi.some(
    (p) => p.percorso === percorso && p.messaggio.toLowerCase().includes(frammento.toLowerCase()),
  );
}
