import { z } from "zod";

import { CAMPI_STANDARD, LIMITI, TIPI_CAMPO_EXTRA } from "./costanti.js";
import { stringaNonVuota } from "./primitivi.js";

/**
 * La configurazione dei form. Il template decide quali campi mostrare;
 * mai come si spediscono (regola 3). Chi definisce lo schema e' il template,
 * non il cliente: e' questo che separa il prodotto da un database generico (§4).
 */

export const campoExtra = z
  .object({
    chiave: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/, {
        error: "minuscolo, senza spazi, come `data_prenotazione`",
      }),
    etichetta: stringaNonVuota,
    tipo: z.enum(TIPI_CAMPO_EXTRA, {
      error: `deve essere uno fra: ${TIPI_CAMPO_EXTRA.join(", ")}`,
    }),
    obbligatorio: z.boolean(),
  })
  .strict();

export const form = z
  .object({
    id: z
      .string()
      .regex(/^[a-z][a-z0-9_]*$/, { error: "minuscolo, senza spazi, come `form_prenotazione`" }),
    /** Ogni form dichiara la propria provenienza: e' cio' che rende leggibile il lead a valle (§8). */
    sorgente: stringaNonVuota,
    campi_standard: z
      .array(z.enum(CAMPI_STANDARD, { error: `deve essere uno fra: ${CAMPI_STANDARD.join(", ")}` }))
      .min(1, { error: "un form senza campi non raccoglie niente" })
      .refine((c) => new Set(c).size === c.length, { error: "contiene campi ripetuti" })
      /**
       * Un lead senza un canale di risposta e' un lead inutile, e l'obiettivo
       * primario del progetto e' generare contatti (L27).
       */
      .refine((c) => c.includes("email") || c.includes("telefono"), {
        error: "serve almeno un modo per richiamare: `email` oppure `telefono`",
      }),
    campi_extra: z
      .array(campoExtra)
      .max(LIMITI.campiExtraPerForm.max, {
        error: `al massimo ${LIMITI.campiExtraPerForm.max} campi extra per form`,
      })
      .refine((campi) => new Set(campi.map((c) => c.chiave)).size === campi.length, {
        error: "due campi extra hanno la stessa chiave",
      }),
    /**
     * Non e' configurazione: e' un invariante reso visibile (D8, L10).
     * Nulla, nello schema, deve permettere a un template di ometterlo.
     */
    consenso_privacy: z.literal(true, {
      error: "il consenso privacy e' sempre obbligatorio: deve valere `true`",
    }),
    consenso_marketing: z.boolean(),
  })
  .strict();

export const forms = z
  .array(form)
  .min(1, { error: "serve almeno un form: e' il modo in cui il sito genera contatti" })
  .refine((f) => new Set(f.map((x) => x.id)).size === f.length, {
    error: "due form hanno lo stesso `id`",
  });
