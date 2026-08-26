/**
 * I template che la vetrina compila dentro di sé come anteprime.
 *
 * **I repo template non sono siti pubblicati.** Sono artefatti trasferibili:
 * codice che diventa un sito solo quando viene consegnato a un cliente, sul
 * dominio del cliente (D1). L'unico sito pubblicato è la vetrina.
 *
 * Per mostrarli come demo navigabili (§6.1: "demo navigabile reale, non
 * screenshot") la CI della vetrina clona ogni repo, lo compila con
 * `SITE_BASE=/vetrina/demo/<slug>/` e ne mette l'output sotto quel percorso.
 * Risultato: una sola origine (il dominio della vetrina), nessuna dipendenza
 * da un sito esterno, e i repo template restano sorgenti autonomi.
 *
 * Questa lista è letta sia dalle pagine (per costruire gli iframe) sia dal
 * workflow di deploy (per sapere cosa clonare): aggiungere un verticale è
 * una riga qui, non due posti da tenere allineati.
 */

export interface Demo {
  /** = `template.id` del content.json, e cartella sotto /demo/. */
  slug: string;
  /** Repo sorgente da clonare in fase di build. */
  repo: string;
  /** Ramo da clonare. */
  ramo: string;
}

export const DEMO: Demo[] = [
  {
    slug: "ristorante",
    repo: "Orecchioni/template-ristorante",
    ramo: "main",
  },
  {
    slug: "studio-professionale",
    repo: "Orecchioni/template-studio-professionale",
    ramo: "main",
  },
];

/** Il percorso della demo dentro la vetrina, rispettando il base path. */
export function percorsoDemo(base: string, slug: string): string {
  return `${base}demo/${slug}/`;
}
