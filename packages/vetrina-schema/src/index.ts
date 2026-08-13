/**
 * `@vetrina/schema` — lo schema del `content.json`, i tipi derivati e il validatore.
 *
 * E' la fonte unica di verita': se una regola vale, vale qui. Ridichiarare un tipo
 * o una validazione altrove significa avere due schemi che divergono (regola 2).
 */

export {
  CAMPI_STANDARD,
  COPPIE_FONT,
  FONTI_IMMAGINE,
  GIORNI,
  LIMITI,
  MAJOR_SUPPORTATO,
  PALETTE,
  SEZIONI,
  SEZIONI_DISATTIVABILI,
  SLOT_DECORATIVI,
  TAG,
  TEMPLATE_VARIANTI,
  TIPI_CAMPO_EXTRA,
  TONI,
} from "./costanti.js";

export { content, type Content } from "./content.js";

export { formattaErrore, problemiDi, type Problema } from "./errori.js";

export { valida, validaOLancia, validaTesto, type Esito } from "./valida.js";

export { azienda, indirizzo, logo, social } from "./azienda.js";
export { campoExtra, form, forms } from "./forms.js";
export { fascia, giorno, settimana } from "./orari.js";
export {
  azione,
  chiSiamo,
  cta,
  ctaFinale,
  footer,
  gallery,
  gruppo,
  hero,
  mappaContatti,
  servizi,
  sezioni,
  testimonianza,
  testimonianze,
  voce,
} from "./sezioni.js";
export {
  generazione,
  ingestion,
  meta,
  schemaVersion,
  tema,
  template,
  video,
} from "./content.js";
export {
  dataISO,
  email,
  immagine,
  oraDelGiorno,
  prezzo,
  prezzoNota,
  stringaNonVuota,
  telefono,
  testoAlt,
  urlAsset,
  urlPubblico,
} from "./primitivi.js";
