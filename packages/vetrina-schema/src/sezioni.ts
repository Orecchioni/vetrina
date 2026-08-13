import { z } from "zod";

import { LIMITI, SEZIONI, TAG } from "./costanti.js";
import { settimana } from "./orari.js";
import { immagine, prezzo, prezzoNota, stringaNonVuota, urlAsset } from "./primitivi.js";

/**
 * Le nove sezioni del §4, in ordine fisso.
 *
 * Le cinque disattivabili sono unioni discriminate su `attiva`: una sezione spenta
 * e' `{ "attiva": false }` e basta. Cosi' i minimi (sei immagini in gallery, tre voci
 * per gruppo) valgono solo quando la sezione e' accesa, che e' la lettura corretta
 * del §4 — sotto soglia la sezione appare vuota, ma una sezione spenta non appare (L32).
 *
 * Le quattro non disattivabili hanno `attiva` fissato a `true`: l'invariante e' visibile
 * nello schema invece di essere una riga in una tabella.
 */

/** Dove puo' portare un pulsante (D6, L7). Una stringa che a volte e' un id e a volte un'ancora non e' validabile. */
export const azione = z.discriminatedUnion("tipo", [
  z.object({ tipo: z.literal("form"), form_id: stringaNonVuota }).strict(),
  z.object({ tipo: z.literal("ancora"), sezione: z.enum(SEZIONI) }).strict(),
  z.object({ tipo: z.literal("tel") }).strict(),
  z.object({ tipo: z.literal("whatsapp") }).strict(),
]);

export const cta = z
  .object({
    testo: stringaNonVuota.max(30, { error: "un pulsante oltre i 30 caratteri va a capo" }),
    azione,
  })
  .strict();

/** 1 — hero. Non disattivabile: e' l'unica sezione sempre presente con uno slot immagine. */
export const hero = z
  .object({
    attiva: z.literal(true),
    titolo: stringaNonVuota,
    sottotitolo: stringaNonVuota.nullable(),
    immagine: immagine.nullable(),
    /** Slot decorativo: e' qui che `fonte: "stock"` e' ammesso (D35). */
    sfondo: immagine.nullable(),
    cta_primaria: cta,
    cta_secondaria: cta.nullable(),
  })
  .strict()
  .refine((s) => s.immagine !== null || s.sfondo !== null, {
    error:
      "l'hero ha bisogno di almeno un'immagine: la foto del cliente in `immagine`, " +
      "o in mancanza uno sfondo in `sfondo`",
    path: ["immagine"],
  });

/** 2 — chi_siamo. Disattivabile. */
export const chiSiamo = z.discriminatedUnion("attiva", [
  z.object({ attiva: z.literal(false) }).strict(),
  z
    .object({
      attiva: z.literal(true),
      titolo: stringaNonVuota,
      testo: stringaNonVuota.min(80, {
        error: "sotto gli 80 caratteri la sezione appare vuota",
      }),
      immagine: immagine.nullable(),
    })
    .strict(),
]);

/** Una voce di listino. `prezzo` e `prezzo_nota` possono essere entrambi nulli (D4). */
export const voce = z
  .object({
    nome: stringaNonVuota,
    descrizione: stringaNonVuota.nullable(),
    prezzo,
    prezzo_nota: prezzoNota,
    tag: z
      .array(z.enum(TAG, { error: `deve essere uno fra: ${TAG.join(", ")}` }))
      .max(TAG.length)
      .refine((t) => new Set(t).size === t.length, { error: "contiene tag ripetuti" }),
  })
  .strict();

export const gruppo = z
  .object({
    nome: stringaNonVuota,
    voci: z
      .array(voce)
      .min(LIMITI.vociPerGruppo.min, {
        error: `un gruppo ha almeno ${LIMITI.vociPerGruppo.min} voci, altrimenti sembra incompleto`,
      })
      .max(LIMITI.vociPerGruppo.max, {
        error: `un gruppo ha al massimo ${LIMITI.vociPerGruppo.max} voci`,
      }),
  })
  .strict();

/**
 * 3 — servizi. Non disattivabile. `gruppi -> voci` e' la struttura che unifica i verticali:
 * un ristorante ha sei gruppi, uno studio dentistico ne ha uno. Stesso schema (§4).
 */
export const servizi = z
  .object({
    attiva: z.literal(true),
    titolo: stringaNonVuota,
    sottotitolo: stringaNonVuota.nullable(),
    gruppi: z
      .array(gruppo)
      .min(LIMITI.gruppi.min, { error: `serve almeno ${LIMITI.gruppi.min} gruppo` })
      .max(LIMITI.gruppi.max, { error: `al massimo ${LIMITI.gruppi.max} gruppi` }),
  })
  .strict();

/** 4 — gallery. Disattivabile: il minimo di sei immagini vale solo da accesa. */
export const gallery = z.discriminatedUnion("attiva", [
  z.object({ attiva: z.literal(false) }).strict(),
  z
    .object({
      attiva: z.literal(true),
      titolo: stringaNonVuota,
      immagini: z
        .array(immagine)
        .min(LIMITI.immaginiGallery.min, {
          error:
            `sotto le ${LIMITI.immaginiGallery.min} immagini la gallery appare vuota: ` +
            "meglio disattivarla con `\"attiva\": false`",
        })
        .max(LIMITI.immaginiGallery.max, {
          error: `al massimo ${LIMITI.immaginiGallery.max} immagini`,
        }),
    })
    .strict(),
]);

/**
 * Una testimonianza. Senza campo `fonte`: le recensioni le fornisce il cliente,
 * non si reimportano da Google o TripAdvisor (L25).
 */
export const testimonianza = z
  .object({
    autore: stringaNonVuota,
    testo: stringaNonVuota,
    valutazione: z.int().min(1).max(5),
  })
  .strict();

/** 5 — testimonianze. Disattivabile. */
export const testimonianze = z.discriminatedUnion("attiva", [
  z.object({ attiva: z.literal(false) }).strict(),
  z
    .object({
      attiva: z.literal(true),
      titolo: stringaNonVuota,
      voci: z
        .array(testimonianza)
        .min(LIMITI.testimonianze.min)
        .max(LIMITI.testimonianze.max, {
          error: `al massimo ${LIMITI.testimonianze.max} testimonianze`,
        }),
    })
    .strict(),
]);

/** 6 — orari. Disattivabile. */
export const orari = z.discriminatedUnion("attiva", [
  z.object({ attiva: z.literal(false) }).strict(),
  z
    .object({
      attiva: z.literal(true),
      titolo: stringaNonVuota,
      settimana,
      nota: stringaNonVuota.nullable(),
    })
    .strict(),
]);

/** 7 — mappa_contatti. Non disattivabile. */
export const mappaContatti = z
  .object({
    attiva: z.literal(true),
    titolo: stringaNonVuota,
    mostra_mappa: z.boolean(),
    form_id: stringaNonVuota,
  })
  .strict();

/** 8 — cta_finale. Disattivabile. Il secondo slot decorativo sta qui (D35). */
export const ctaFinale = z.discriminatedUnion("attiva", [
  z.object({ attiva: z.literal(false) }).strict(),
  z
    .object({
      attiva: z.literal(true),
      titolo: stringaNonVuota,
      testo: stringaNonVuota,
      sfondo: immagine.nullable(),
      cta,
    })
    .strict(),
]);

/** 9 — footer. Non disattivabile. */
export const footer = z
  .object({
    attiva: z.literal(true),
    mostra_social: z.boolean(),
    mostra_piva: z.boolean(),
    link_legali: z
      .array(
        z
          .object({
            testo: stringaNonVuota,
            url: urlAsset,
          })
          .strict(),
      )
      .min(1, { error: "il footer deve linkare almeno la privacy policy" }),
  })
  .strict();

/** L'oggetto `sezioni`, con le nove chiavi obbligatorie e nessun'altra. */
export const sezioni = z
  .object({
    hero,
    chi_siamo: chiSiamo,
    servizi,
    gallery,
    testimonianze,
    orari,
    mappa_contatti: mappaContatti,
    cta_finale: ctaFinale,
    footer,
  })
  .strict();
