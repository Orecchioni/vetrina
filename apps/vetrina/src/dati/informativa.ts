/**
 * L'informativa privacy del sito commerciale stesso: qui Vetrina è il
 * titolare del trattamento (chi raccolgono i dati di chi scrive nel form di
 * contatto), non un cliente. Testo distinto da quello dei template — nei
 * template il titolare è l'attività del cliente.
 *
 * Niente tabella di versioni come nei template (`src/lib/informativa.ts`
 * lì): questo è un sito bespoke con un solo controllore e una sola versione
 * attiva, non dieci `content.json` di clienti diversi da tenere allineati.
 * Se la versione dichiarata in `CONTATTO.informativa_versione` (config.ts)
 * cambia, questo testo va aggiornato insieme — un solo posto, non un registro.
 */

export const INFORMATIVA_VERSIONE = "2026-08-v1";
export const INFORMATIVA_AGGIORNATA_IL = "agosto 2026";

export function informativaTesto(nomeProdotto: string, emailContatto: string): string {
  return `
## Titolare del trattamento

${nomeProdotto}. Contatti: ${emailContatto}.

## Cosa raccogliamo

Quando compili il modulo di contatto su questo sito raccogliamo i dati che inserisci
(nome, contatti, il messaggio), oltre a data e ora dell'invio, l'indirizzo IP da cui
è stata inviata la richiesta, e la pagina di provenienza.

## Perché li raccogliamo

Per rispondere alla tua richiesta e, se hai dato il consenso separato, per comunicazioni
promozionali. Il consenso al trattamento per rispondere alla richiesta è necessario per
fornire il servizio richiesto; quello per le comunicazioni promozionali è facoltativo e
revocabile in ogni momento.

## Con chi li condividiamo

I dati transitano attraverso i seguenti responsabili del trattamento, che li trattano
solo per conto nostro e secondo le nostre istruzioni: **Make** (automazione della
ricezione), **Google** (archiviazione in un foglio di calcolo e invio della notifica
via email). Non vendiamo né condividiamo i tuoi dati con soggetti terzi per finalità
diverse da queste.

## Per quanto tempo li conserviamo

I dati restano archiviati finché non richiedi la cancellazione, o comunque non oltre i
termini previsti dalla normativa applicabile.

## I tuoi diritti

Puoi chiedere in ogni momento accesso, rettifica, cancellazione dei tuoi dati, o
revocare un consenso dato, scrivendo a ${emailContatto}. Hai inoltre diritto di
proporre reclamo al Garante per la protezione dei dati personali.
`.trim();
}
