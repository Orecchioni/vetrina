import { z } from "zod";

import { content, type Content } from "./content.js";
import { formattaErrore, problemiDi, type Problema } from "./errori.js";

/**
 * L'entrata pubblica del pacchetto: si valida un valore gia' parsato, oppure
 * il testo grezzo di un file. Il secondo caso esiste perche' un JSON malformato
 * e' un errore come gli altri e deve dire dove sta, non esplodere (regola 7).
 */

export type Esito =
  | { valido: true; dati: Content }
  | { valido: false; problemi: Problema[]; errore: z.ZodError | null };

/** Valida un valore contro lo schema. Non lancia: l'esito e' un dato. */
export function valida(valore: unknown): Esito {
  const esito = content.safeParse(valore);
  if (esito.success) return { valido: true, dati: esito.data };
  return { valido: false, problemi: problemiDi(esito.error), errore: esito.error };
}

/** Valida il testo di un `content.json`, riportando anche il JSON malformato. */
export function validaTesto(testo: string): Esito {
  let valore: unknown;
  try {
    valore = JSON.parse(testo);
  } catch (e) {
    const dettaglio = e instanceof Error ? e.message : String(e);
    return {
      valido: false,
      errore: null,
      problemi: [{ percorso: "(file)", messaggio: `JSON malformato: ${dettaglio}` }],
    };
  }
  return valida(valore);
}

/** Valida e lancia se non e' valido. Comodo dove un `content.json` rotto deve fermare il build. */
export function validaOLancia(valore: unknown, intestazione = "content.json non valido"): Content {
  const esito = content.safeParse(valore);
  if (esito.success) return esito.data;
  throw new Error(formattaErrore(esito.error, intestazione));
}
