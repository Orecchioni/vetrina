/**
 * Le poche stringhe di livello sito che non sono contenuto di pagina ma
 * configurazione: il nome del prodotto, il prezzo esposto, l'endpoint del form.
 * Stanno in un posto solo perche' sono decisioni ancora aperte, non testo — e
 * una decisione che cambia non deve mandare a cercare in dieci componenti.
 */

/**
 * D27 (nome del prodotto) e' aperta: "Vetrina" e' il nome di lavoro del
 * progetto, usato qui come segnaposto. Quando D27 si chiude si cambia questa
 * riga e ogni pagina, il titolo del browser e il footer seguono.
 */
export const NOME_PRODOTTO = "Vetrina";

/**
 * Prezzo esposto (§6.1). Blocco 5a e' "senza incasso" (D21): il prezzo si
 * mostra, non si incassa qui — nessun checkout, il pagamento arriva al
 * Blocco 7. Il numero e' una decisione commerciale non ancora presa: segnaposto
 * visibile, da sostituire prima di mettere il sito online.
 */
export const PREZZO = {
  cifra: "590",
  valuta: "€",
  nota: "una tantum, sito incluso per il primo anno",
  segnaposto: true,
};

/**
 * L'endpoint del form di contatto del sito (§6.1, "tenant proprio"): il sito
 * commerciale e' esso stesso un cliente della propria pipeline di ingestion.
 * Segnaposto finche' non si crea lo scenario Make dedicato, come per i template.
 */
export const CONTATTO = {
  tenant_id: "tnt_vetrina_sito",
  endpoint: "https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxx",
  informativa_versione: "2026-08-v1",
};
