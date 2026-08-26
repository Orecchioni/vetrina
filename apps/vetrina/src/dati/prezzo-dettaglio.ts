/**
 * Cosa è incluso nel prezzo e cosa no (§6.1: "Pagina prezzi con cosa è incluso
 * e cosa no"). Elenco esplicito perché il non-incluso è ciò che evita la
 * contestazione a consegna avvenuta — le stesse ragioni per cui `fonte: "stock"`
 * e i consensi si registrano invece di darli per scontati.
 *
 * È dato, non testo nei componenti: la pagina prezzi lo scorre, e cambiare cosa
 * si offre non deve voler dire riscrivere una pagina.
 */

export const INCLUSO: string[] = [
  "Sito one-page completo, costruito sui tuoi contenuti",
  "Dominio e pubblicazione online per il primo anno",
  "Modulo di contatto che ti recapita le richieste via email",
  "Ottimizzazione per la ricerca su Google (SEO locale)",
  "Versione perfetta su telefono, tablet e computer",
  "Pagine privacy e cookie a norma, senza banner invasivi",
];

export const NON_INCLUSO: string[] = [
  "Servizio fotografico (disponibile come add-on con fotografo)",
  "Scrittura dei contenuti da zero: partiamo dal tuo materiale",
  "Gestione dei social network",
  "E-commerce o prenotazioni con pagamento online",
];

/**
 * Come funziona il pagamento (§6.3). Al Blocco 5a è solo esposto, non incassato
 * (D21): qui si descrive, l'incasso arriva al Blocco 7.
 */
export const PAGAMENTO = [
  "30% all'ordine, prima di iniziare",
  "70% alla pubblicazione, prima che il sito vada online",
];
