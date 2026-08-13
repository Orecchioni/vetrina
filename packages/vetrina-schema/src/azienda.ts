import { z } from "zod";

import { email, stringaNonVuota, telefono, urlAsset, urlPubblico } from "./primitivi.js";

/**
 * Chi e' il cliente. `telefono`, `whatsapp` e `piva` sono annullabili perche'
 * non tutte le attivita' li espongono: quando servono davvero — una CTA che
 * chiama, un footer che mostra la partita IVA — lo impone una validazione
 * incrociata sulla radice, dove il contesto c'e'.
 */

/** Il logo non ha `fonte`: e' del cliente per definizione. Assente, il template compone il nome (D7). */
export const logo = z
  .object({
    url: urlAsset,
    alt: stringaNonVuota,
  })
  .strict();

export const indirizzo = z
  .object({
    via: stringaNonVuota,
    cap: z.string().regex(/^\d{5}$/, { error: "il CAP italiano ha cinque cifre" }),
    citta: stringaNonVuota,
    provincia: z.string().regex(/^[A-Z]{2}$/, { error: 'sigla di due lettere maiuscole, per esempio "RM"' }),
    lat: z.number().min(-90).max(90).nullable(),
    lng: z.number().min(-180).max(180).nullable(),
  })
  .strict();

export const social = z
  .object({
    instagram: urlPubblico.nullable(),
    facebook: urlPubblico.nullable(),
    tripadvisor: urlPubblico.nullable(),
  })
  .strict();

export const azienda = z
  .object({
    nome: stringaNonVuota,
    claim: stringaNonVuota.nullable(),
    logo: logo.nullable(),
    email,
    telefono: telefono.nullable(),
    whatsapp: telefono.nullable(),
    indirizzo,
    social,
    piva: z
      .string()
      .regex(/^\d{11}$/, { error: "la partita IVA italiana ha undici cifre" })
      .nullable(),
  })
  .strict();
