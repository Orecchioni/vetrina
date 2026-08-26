/**
 * Il catalogo: le categorie della domanda filtro del §6.1 ("Che tipo di
 * attività hai?") e i template che le coprono. È il registro che tiene il
 * sito commerciale in sincrono con i template reali: un verticale nuovo è
 * una riga qui, non una pagina riscritta.
 *
 * Perché un dato e non pagine separate: la domanda filtro di D44 esiste solo
 * se ci sono più categorie fra cui scegliere. Elencare le categorie a mano in
 * un componente vorrebbe dire tenerne allineate due (l'elenco e le pagine).
 * Qui la lista è una sola e le pagine si generano da essa.
 *
 * `slug` di categoria = `template.categoria_attivita` dei content.json, così
 * l'etichetta del filtro e quella dichiarata dal template non divergono.
 */

export interface Template {
  /** = `template.id` del content.json. */
  id: string;
  nome: string;
  descrizione: string;
  /**
   * Lo `slug` in `demo.ts` se esiste un'anteprima navigabile compilata dentro
   * la vetrina, `null` se il template non è ancora pronto (la card mostra
   * "demo in arrivo" invece di linkare il vuoto).
   *
   * Non è un URL esterno: la demo vive sotto `/demo/<slug>/` sul dominio della
   * vetrina, perché i repo template sono sorgenti trasferibili, non siti
   * pubblicati (vedi `demo.ts`).
   */
  demo: string | null;
}

export interface Categoria {
  /** = `template.categoria_attivita`. Anche l'URL della pagina categoria. */
  slug: string;
  etichetta: string;
  /** Come il titolare descriverebbe la propria attività, per la ricerca. */
  sinonimi: string[];
  template: Template[];
}

/**
 * Dieci categorie (D44). Due hanno un template reale e verificato; le altre
 * sono dichiarate ma senza template — la domanda filtro ha comunque bisogno di
 * tutte per essere una domanda vera, e "presto disponibile" è un'informazione
 * onesta, non un buco. Man mano che i verticali si costruiscono, `template` si
 * riempie.
 */
export const CATALOGO: Categoria[] = [
  {
    slug: "ristorazione",
    etichetta: "Ristorante, pizzeria, trattoria",
    sinonimi: ["ristorante", "pizzeria", "trattoria", "osteria", "bar", "cucina"],
    template: [
      {
        id: "ristorante",
        nome: "Trattoria",
        descrizione: "Menù per portate, galleria del locale, prenotazione e orari. Pensato per chi lavora sul tavolo e sul passaparola.",
        demo: "ristorante",
      },
    ],
  },
  {
    slug: "studio-professionale",
    etichetta: "Studio professionale",
    sinonimi: ["avvocato", "commercialista", "consulente", "notaio", "studio legale"],
    template: [
      {
        id: "studio-professionale",
        nome: "Studio",
        descrizione: "Aree di pratica, orari su appuntamento, richiesta di consulenza. Sobrio, senza galleria né prezzi esposti.",
        demo: "studio-professionale",
      },
    ],
  },
  {
    slug: "parrucchiere-estetica",
    etichetta: "Parrucchiere, barbiere, estetista",
    sinonimi: ["parrucchiere", "barbiere", "estetista", "centro estetico", "nail", "beauty"],
    template: [],
  },
  {
    slug: "studio-dentistico",
    etichetta: "Studio dentistico, poliambulatorio",
    sinonimi: ["dentista", "odontoiatra", "poliambulatorio", "fisioterapista", "medico"],
    template: [],
  },
  {
    slug: "benessere-sport",
    etichetta: "Palestra, centro benessere",
    sinonimi: ["palestra", "personal trainer", "yoga", "spa", "piscina", "centro benessere"],
    template: [],
  },
  {
    slug: "autoveicoli",
    etichetta: "Officina, autonoleggio, gommista",
    sinonimi: ["officina", "meccanico", "gommista", "carrozzeria", "autonoleggio"],
    template: [],
  },
  {
    slug: "casa-cantiere",
    etichetta: "Idraulico, elettricista, impresa edile",
    sinonimi: ["idraulico", "elettricista", "muratore", "imbianchino", "impresa edile", "artigiano"],
    template: [],
  },
  {
    slug: "negozio",
    etichetta: "Negozio, bottega",
    sinonimi: ["negozio", "bottega", "boutique", "alimentari", "ferramenta"],
    template: [],
  },
  {
    slug: "ospitalita",
    etichetta: "B&B, affittacamere, agriturismo",
    sinonimi: ["b&b", "affittacamere", "agriturismo", "casa vacanze", "hotel"],
    template: [],
  },
  {
    slug: "eventi-servizi",
    etichetta: "Fotografo, wedding, servizi su misura",
    sinonimi: ["fotografo", "wedding planner", "catering", "animazione", "servizi"],
    template: [],
  },
];

/** Quante categorie hanno già almeno un template pronto. */
export function categorieDisponibili(): number {
  return CATALOGO.filter((c) => c.template.length > 0).length;
}

export function categoriaPerSlug(slug: string): Categoria | undefined {
  return CATALOGO.find((c) => c.slug === slug);
}
