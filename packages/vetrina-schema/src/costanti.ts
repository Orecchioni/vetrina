/**
 * Valori chiusi dello schema. Vivono qui perche' sono citati da piu' moduli
 * (schema, messaggi d'errore, validazioni incrociate) e devono restare uno solo.
 */

/** Major di `schema_version` che questo pacchetto sa validare (D11). */
export const MAJOR_SUPPORTATO = 1;

/** Ordine fisso della settimana. `orari.settimana` deve contenerli tutti, in quest'ordine (D9, L21). */
export const GIORNI = [
  "lunedi",
  "martedi",
  "mercoledi",
  "giovedi",
  "venerdi",
  "sabato",
  "domenica",
] as const;

/** Ordine fisso delle sezioni (§4). Non esiste riordinamento. */
export const SEZIONI = [
  "hero",
  "chi_siamo",
  "servizi",
  "gallery",
  "testimonianze",
  "orari",
  "mappa_contatti",
  "cta_finale",
  "footer",
] as const;

/** Sezioni che il §4 dichiara disattivabili. Le altre hanno `attiva` fissato a `true`. */
export const SEZIONI_DISATTIVABILI = [
  "chi_siamo",
  "gallery",
  "testimonianze",
  "orari",
  "cta_finale",
] as const;

/** Combinazioni preapprovate. Il cliente sceglie una combinazione, mai un valore esadecimale (§6.2). */
export const PALETTE = ["palette_1", "palette_2", "palette_3", "palette_4"] as const;
export const COPPIE_FONT = ["font_1", "font_2", "font_3"] as const;
export const TONI = ["familiare", "professionale", "contemporaneo"] as const;

/**
 * Varianti ammesse per ciascun template (D10). Una variante e' un preset di
 * lessico e sezioni attive di default, non un secondo template mascherato:
 * in v1 c'e' un solo valore per `template.id` e l'astrazione non si costruisce
 * finche' non ci sono due varianti reali da distinguere. Estenderlo e' una riga.
 */
export const TEMPLATE_VARIANTI: Record<string, readonly string[]> = {
  ristorante: ["trattoria"],
};

/** Set chiuso dei tag di voce (D5). Cresce con un minor di schema, senza rompere nulla. */
export const TAG = [
  "vegetariano",
  "vegano",
  "senza_glutine",
  "piccante",
  "stagionale",
  "surgelato",
] as const;

/** Provenienza di un'immagine (D3). `stock` e' ammesso solo sugli slot decorativi. */
export const FONTI_IMMAGINE = ["cliente", "stock", "generata"] as const;

/**
 * Gli unici slot dove `fonte: "stock"` e' ammesso (D35).
 * Sono campi dentro sezioni esistenti: nessuna sezione nuova, l'ordine del §4 resta intatto.
 */
export const SLOT_DECORATIVI = ["sezioni.hero.sfondo", "sezioni.cta_finale.sfondo"] as const;

/** Campi standard di un form. Almeno uno fra `email` e `telefono` e' obbligatorio (L27). */
export const CAMPI_STANDARD = ["nome", "email", "telefono", "messaggio"] as const;

/** Tipi ammessi per un campo extra. */
export const TIPI_CAMPO_EXTRA = [
  "text",
  "textarea",
  "date",
  "time",
  "number",
  "tel",
  "email",
] as const;

/** Massimi e minimi del §4. I minimi contano piu' dei massimi. */
export const LIMITI = {
  gruppi: { min: 1, max: 6 },
  vociPerGruppo: { min: 3, max: 12 },
  immaginiGallery: { min: 6, max: 20 },
  testimonianze: { min: 0, max: 6 },
  campiExtraPerForm: { max: 5 },
} as const;
