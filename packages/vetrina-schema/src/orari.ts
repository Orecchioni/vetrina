import { z } from "zod";

import { GIORNI } from "./costanti.js";
import { oraDelGiorno } from "./primitivi.js";

/**
 * Gli orari sono la sezione con piu' modi di essere sbagliata in silenzio (L21):
 * la mezzanotte scavalcata, la settimana incompleta, le fasce sovrapposte.
 * Tutti e tre si controllano qui.
 */

export const fascia = z
  .object({
    da: oraDelGiorno,
    a: oraDelGiorno,
  })
  .strict();

export type Fascia = z.infer<typeof fascia>;

function minuti(hhmm: string): number {
  const [h, m] = hhmm.split(":");
  return Number(h) * 60 + Number(m);
}

/**
 * Una fascia diventa un intervallo in minuti dall'inizio del giorno.
 * Se la fine non e' dopo l'inizio, la fascia scavalca la mezzanotte e la fine
 * si porta al giorno dopo: `19:30 -> 01:00` e' una pizzeria, non un errore (D9).
 */
export function intervallo(f: Fascia): { inizio: number; fine: number } {
  const inizio = minuti(f.da);
  const fine = minuti(f.a);
  return { inizio, fine: fine <= inizio ? fine + 1440 : fine };
}

/** Fasce ordinate, non sovrapposte, e complessivamente dentro le 24 ore. */
function controllaFasce(fasce: Fascia[], ctx: z.RefinementCtx): void {
  const intervalli = fasce.map(intervallo);

  for (const [i, f] of fasce.entries()) {
    if (f.da === f.a) {
      ctx.addIssue({
        code: "custom",
        path: [i],
        message: `la fascia ${f.da}-${f.a} dura 24 ore: per il giorno intero usa 00:00-23:59`,
      });
    }
  }

  for (let i = 1; i < intervalli.length; i += 1) {
    const precedente = intervalli[i - 1]!;
    const corrente = intervalli[i]!;
    if (corrente.inizio < precedente.fine) {
      ctx.addIssue({
        code: "custom",
        path: [i],
        message:
          `la fascia ${fasce[i]!.da}-${fasce[i]!.a} si sovrappone a ` +
          `${fasce[i - 1]!.da}-${fasce[i - 1]!.a} o la precede: le fasce vanno in ordine e separate`,
      });
    }
  }

  const primo = intervalli[0];
  const ultimo = intervalli[intervalli.length - 1];
  if (primo && ultimo && ultimo.fine > primo.inizio + 1440) {
    ctx.addIssue({
      code: "custom",
      path: [intervalli.length - 1],
      message: "le fasce del giorno coprono piu' di 24 ore",
    });
  }
}

/**
 * Un giorno e' chiuso oppure aperto. Se e' chiuso non ha fasce; se e' aperto ne ha almeno una.
 * L'unione discriminata rende impossibile il giorno "aperto senza orari", che si renderebbe vuoto.
 */
export const giorno = z.discriminatedUnion("chiuso", [
  z
    .object({
      giorno: z.enum(GIORNI),
      chiuso: z.literal(true),
      fasce: z.tuple([], { error: "un giorno chiuso non ha fasce orarie" }),
    })
    .strict(),
  z
    .object({
      giorno: z.enum(GIORNI),
      chiuso: z.literal(false),
      fasce: z
        .array(fascia)
        .min(1, { error: "un giorno aperto ha almeno una fascia oraria" })
        .max(4, { error: "piu' di quattro fasce in un giorno non si leggono" })
        .superRefine(controllaFasce),
    })
    .strict(),
]);

/**
 * Sette giorni esatti, nell'ordine fisso di `GIORNI`. Senza questo vincolo un
 * `content.json` con `martedi` due volte e senza `domenica` passerebbe (L21).
 */
export const settimana = z
  .array(giorno)
  .length(GIORNI.length, {
    error: `la settimana ha esattamente ${GIORNI.length} giorni`,
  })
  .superRefine((giorni, ctx) => {
    for (const [i, atteso] of GIORNI.entries()) {
      const trovato = giorni[i];
      if (trovato && trovato.giorno !== atteso) {
        ctx.addIssue({
          code: "custom",
          path: [i, "giorno"],
          message: `qui va "${atteso}": i giorni stanno nell'ordine fisso della settimana`,
        });
      }
    }
  });
