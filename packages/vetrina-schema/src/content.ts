import { z } from "zod";

import { azienda } from "./azienda.js";
import {
  COPPIE_FONT,
  MAJOR_SUPPORTATO,
  PALETTE,
  SEZIONI,
  TEMPLATE_VARIANTI,
  TONI,
} from "./costanti.js";
import { forms } from "./forms.js";
import { dataISO, stringaNonVuota, urlAsset, urlPubblico } from "./primitivi.js";
import { cta as ctaSchema, sezioni } from "./sezioni.js";

/**
 * La radice del `content.json`, piu' le validazioni incrociate.
 *
 * Le incrociate sono la ragione per cui lo schema e' in Zod e non in JSON Schema:
 * una CTA che punta a un form inesistente, o a una sezione che il cliente ha
 * disattivato, e' un pulsante che non fa niente su un sito appena consegnato —
 * il difetto piu' probabile della pipeline (L7).
 */

/**
 * Il template dichiara il major che sa leggere; un major diverso viene rifiutato
 * con un errore leggibile. I repo dei clienti non si migrano mai: sono congelati
 * alla consegna (D11, L23).
 */
export const schemaVersion = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, { error: 'formato `major.minor.patch`, per esempio "1.0.0"' })
  .refine((v) => Number(v.split(".")[0]) === MAJOR_SUPPORTATO, {
    error:
      `questo pacchetto legge lo schema major ${MAJOR_SUPPORTATO}. ` +
      "Un major diverso e' un cambio incompatibile: va usata la versione del pacchetto che lo dichiara",
  });

export const template = z
  .object({
    id: stringaNonVuota,
    variante: stringaNonVuota,
    categoria_attivita: stringaNonVuota,
  })
  .strict()
  .superRefine((t, ctx) => {
    const varianti = TEMPLATE_VARIANTI[t.id];
    if (!varianti) {
      ctx.addIssue({
        code: "custom",
        path: ["id"],
        message: `template sconosciuto. Template disponibili: ${Object.keys(TEMPLATE_VARIANTI).join(", ")}`,
      });
      return;
    }
    if (!varianti.includes(t.variante)) {
      ctx.addIssue({
        code: "custom",
        path: ["variante"],
        message: `variante non prevista per "${t.id}". Varianti disponibili: ${varianti.join(", ")}`,
      });
    }
  });

/** Combinazioni preapprovate, mai valori liberi: colori e font liberi sono fuori scope (§9). */
export const tema = z
  .object({
    palette: z.enum(PALETTE, { error: `deve essere una fra: ${PALETTE.join(", ")}` }),
    coppia_font: z.enum(COPPIE_FONT, { error: `deve essere una fra: ${COPPIE_FONT.join(", ")}` }),
    tono: z.enum(TONI, { error: `deve essere uno fra: ${TONI.join(", ")}` }),
  })
  .strict();

export const meta = z
  .object({
    title: z
      .string()
      .trim()
      .min(10, { error: "troppo corto per dire di cosa parla la pagina" })
      .max(60, { error: "oltre i 60 caratteri Google lo tronca nei risultati" }),
    description: z
      .string()
      .trim()
      .min(50, { error: "troppo corta: Google la scarta e ne inventa una" })
      .max(160, { error: "oltre i 160 caratteri Google la tronca nei risultati" }),
    og_image: urlAsset.nullable(),
    /** Il multilingua e' fuori scope (§9) e il target sono PMI italiane (V2). */
    lingua: z.literal("it-IT"),
  })
  .strict();

/**
 * Dove finiscono i contatti. Il vincolo non e' il destinatario, e' il contratto:
 * cambiare destinazione deve significare cambiare una stringa in un file di dati (regola 4, §8).
 */
export const ingestion = z
  .object({
    tenant_id: stringaNonVuota,
    endpoint: urlPubblico,
    /**
     * La versione dell'informativa effettivamente mostrata. E' l'unico dato non
     * recuperabile a posteriori, quindi la forma e' vincolata (§7.5, L11).
     */
    informativa_versione: z.string().regex(/^\d{4}-\d{2}-v\d+$/, {
      error: 'formato `AAAA-MM-vN`, per esempio "2026-08-v1"',
    }),
  })
  .strict();

const posizioneVideo = z.enum(["hero", "chi_siamo"]);

export const video = z.discriminatedUnion("attivo", [
  z
    .object({
      attivo: z.literal(false),
      url: z.null(),
      posizione: posizioneVideo,
      poster: z.null(),
    })
    .strict(),
  z
    .object({
      attivo: z.literal(true),
      url: urlPubblico,
      posizione: posizioneVideo,
      poster: urlAsset.nullable(),
    })
    .strict(),
]);

/**
 * Cosa resta nel repo del cliente. Senza `modello`: il metodo di produzione non e'
 * argomento di vendita, e non va presentato cosi' — ne' a lui, ne' a se' stessi (D12, L19, §12).
 * Lo `strict()` fa il resto: un `modello` di troppo e' un errore, non una svista.
 */
export const generazione = z
  .object({
    data: dataISO,
    input_hash: stringaNonVuota,
    revisione: z.int().min(1, { error: "la prima revisione e' la 1" }),
  })
  .strict();

const contentBase = z
  .object({
    schema_version: schemaVersion,
    template,
    tema,
    azienda,
    meta,
    ingestion,
    forms,
    sezioni,
    video,
    generazione,
  })
  .strict();

type ContentBase = z.infer<typeof contentBase>;
type Cta = z.infer<typeof ctaSchema>;
type Percorso = (string | number)[];

/** Tutte le sezioni hanno `attiva`; le non disattivabili ce l'hanno fissato a `true`. */
function eAttiva(sezioni: ContentBase["sezioni"], nome: (typeof SEZIONI)[number]): boolean {
  return sezioni[nome].attiva;
}

/** Le CTA esistenti nel documento, con il percorso a cui riferire l'errore. */
function raccogliCta(dati: ContentBase): Array<{ percorso: Percorso; cta: Cta }> {
  const trovate: Array<{ percorso: Percorso; cta: Cta }> = [];
  const { hero, cta_finale } = dati.sezioni;

  trovate.push({ percorso: ["sezioni", "hero", "cta_primaria"], cta: hero.cta_primaria });
  if (hero.cta_secondaria) {
    trovate.push({ percorso: ["sezioni", "hero", "cta_secondaria"], cta: hero.cta_secondaria });
  }
  if (cta_finale.attiva) {
    trovate.push({ percorso: ["sezioni", "cta_finale", "cta"], cta: cta_finale.cta });
  }
  return trovate;
}

/**
 * Gli slot immagine del documento. `decorativo` dice se `fonte: "stock"` e' ammesso:
 * lo e' solo su `hero.sfondo` e `cta_finale.sfondo` (D35). Su un piatto, un interno
 * o una persona una foto stock e' una bugia visiva che il cliente finale riconosce (§6.5).
 */
function raccogliImmagini(
  dati: ContentBase,
): Array<{ percorso: Percorso; fonte: string; decorativo: boolean }> {
  const trovate: Array<{ percorso: Percorso; fonte: string; decorativo: boolean }> = [];
  const { hero, chi_siamo, gallery, cta_finale } = dati.sezioni;

  if (hero.immagine) {
    trovate.push({ percorso: ["sezioni", "hero", "immagine"], fonte: hero.immagine.fonte, decorativo: false });
  }
  if (hero.sfondo) {
    trovate.push({ percorso: ["sezioni", "hero", "sfondo"], fonte: hero.sfondo.fonte, decorativo: true });
  }
  if (chi_siamo.attiva && chi_siamo.immagine) {
    trovate.push({
      percorso: ["sezioni", "chi_siamo", "immagine"],
      fonte: chi_siamo.immagine.fonte,
      decorativo: false,
    });
  }
  if (gallery.attiva) {
    for (const [i, img] of gallery.immagini.entries()) {
      trovate.push({ percorso: ["sezioni", "gallery", "immagini", i], fonte: img.fonte, decorativo: false });
    }
  }
  if (cta_finale.attiva && cta_finale.sfondo) {
    trovate.push({
      percorso: ["sezioni", "cta_finale", "sfondo"],
      fonte: cta_finale.sfondo.fonte,
      decorativo: true,
    });
  }
  return trovate;
}

function validazioniIncrociate(dati: ContentBase, ctx: z.RefinementCtx): void {
  const idForm = dati.forms.map((f) => f.id);
  const elencoForm = idForm.map((id) => `"${id}"`).join(", ");

  for (const { percorso, cta } of raccogliCta(dati)) {
    const azione = cta.azione;

    if (azione.tipo === "form" && !idForm.includes(azione.form_id)) {
      ctx.addIssue({
        code: "custom",
        path: [...percorso, "azione", "form_id"],
        message: `il form "${azione.form_id}" non esiste. Form dichiarati: ${elencoForm}`,
      });
    }

    if (azione.tipo === "ancora" && !eAttiva(dati.sezioni, azione.sezione)) {
      ctx.addIssue({
        code: "custom",
        path: [...percorso, "azione", "sezione"],
        message:
          `la sezione "${azione.sezione}" e' disattivata: il pulsante "${cta.testo}" ` +
          "non porterebbe da nessuna parte",
      });
    }

    if (azione.tipo === "tel" && dati.azienda.telefono === null) {
      ctx.addIssue({
        code: "custom",
        path: [...percorso, "azione"],
        message: "una CTA `tel` richiede `azienda.telefono`, che qui e' nullo",
      });
    }

    if (azione.tipo === "whatsapp" && dati.azienda.whatsapp === null) {
      ctx.addIssue({
        code: "custom",
        path: [...percorso, "azione"],
        message: "una CTA `whatsapp` richiede `azienda.whatsapp`, che qui e' nullo",
      });
    }
  }

  for (const { percorso, fonte, decorativo } of raccogliImmagini(dati)) {
    if (fonte === "stock" && !decorativo) {
      ctx.addIssue({
        code: "custom",
        path: [...percorso, "fonte"],
        message:
          "una foto stock non e' ammessa qui: lo stock vale solo sugli slot decorativi " +
          "(`hero.sfondo`, `cta_finale.sfondo`), mai su piatti, prodotti, persone o interni del locale",
      });
    }
  }

  if (!idForm.includes(dati.sezioni.mappa_contatti.form_id)) {
    ctx.addIssue({
      code: "custom",
      path: ["sezioni", "mappa_contatti", "form_id"],
      message: `il form "${dati.sezioni.mappa_contatti.form_id}" non esiste. Form dichiarati: ${elencoForm}`,
    });
  }

  /** Senza coordinate la mappa si renderebbe vuota (L14). */
  if (
    dati.sezioni.mappa_contatti.mostra_mappa &&
    (dati.azienda.indirizzo.lat === null || dati.azienda.indirizzo.lng === null)
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["sezioni", "mappa_contatti", "mostra_mappa"],
      message: "per mostrare la mappa servono `azienda.indirizzo.lat` e `lng`",
    });
  }

  if (dati.sezioni.footer.mostra_piva && dati.azienda.piva === null) {
    ctx.addIssue({
      code: "custom",
      path: ["sezioni", "footer", "mostra_piva"],
      message: "per mostrare la partita IVA serve `azienda.piva`, che qui e' nulla",
    });
  }
}

/** Lo schema completo del `content.json`. E' la fonte unica di verita' (regola 2). */
export const content = contentBase.superRefine(validazioniIncrociate);

export type Content = z.infer<typeof content>;
