import { z } from "zod";

import { FONTI_IMMAGINE } from "./costanti.js";

/**
 * Pezzi riusati da piu' sezioni. Stanno qui perche' una regola che vale
 * vale nel pacchetto, non nel punto in cui capita di servire (regola 2).
 */

export const stringaNonVuota = z.string().trim().min(1, { error: "non puo' essere vuoto" });

/**
 * Un asset e' un URL assoluto (lavorazione) oppure un percorso interno al repo (consegna).
 * Le due forme convivono dal primo giorno: alla pubblicazione gli asset migrano nel repo
 * e cambia solo la stringa, non il modo in cui la sezione rende l'immagine (L13).
 */
export const urlAsset = stringaNonVuota.refine(
  (v) => /^https?:\/\//.test(v) || v.startsWith("/") || v.startsWith("./"),
  { error: "deve essere un URL http(s) oppure un percorso interno al repo (che inizia con / o ./)" },
);

/** Nome del file, senza estensione e senza percorso. Serve al controllo dell'alt. */
function nomeFile(url: string): string {
  const senzaQuery = url.split(/[?#]/)[0] ?? "";
  const ultimo = senzaQuery.split("/").pop() ?? "";
  return ultimo.replace(/\.[^.]+$/, "");
}

/** Confronto lasco: ignora maiuscole e separatori, cosi' `hero-danino` non passa per `Hero Danino`. */
function normalizza(v: string): string {
  return v.toLowerCase().replace(/[\s._-]+/g, "");
}

/**
 * L'alt text pesa su accessibilita' e SEO, due dei tre punteggi del requisito ">= 90" (L28).
 * Il massimo e' la soglia oltre la quale gli screen reader troncano.
 */
export const testoAlt = z
  .string()
  .trim()
  .min(10, { error: "deve descrivere l'immagine: almeno 10 caratteri" })
  .max(125, { error: "oltre i 125 caratteri viene troncato dagli screen reader" });

/**
 * Oggetto immagine. `fonte` e' obbligatoria: la regola del §6.5 sullo stock smette di essere
 * una frase nel documento e diventa un errore di validazione (D3). Quali slot ammettono
 * `stock` lo decide una validazione incrociata sulla radice, non questo schema.
 */
export const immagine = z
  .object({
    url: urlAsset,
    alt: testoAlt,
    fonte: z.enum(FONTI_IMMAGINE, {
      error: `deve essere uno fra: ${FONTI_IMMAGINE.join(", ")}`,
    }),
  })
  .strict()
  .refine((img) => normalizza(img.alt) !== normalizza(nomeFile(img.url)), {
    error: "l'alt non puo' essere il nome del file: deve descrivere cosa si vede",
    path: ["alt"],
  });

/**
 * Prezzo come stringa con la virgola, mai float: evita di decidere la formattazione
 * a valle e gli arrotondamenti. `null` quando il prezzo non si espone (D4, L5).
 */
export const prezzo = z
  .string()
  .regex(/^\d{1,4},\d{2}$/, {
    error: 'formato italiano con due decimali, per esempio "13,00"',
  })
  .nullable();

/** Accanto al prezzo, o al posto suo: "a partire da", "s.q.". Corto per non rompere il layout (D4). */
export const prezzoNota = z
  .string()
  .trim()
  .min(1, { error: "se presente non puo' essere vuota" })
  .max(24, { error: "oltre i 24 caratteri non ci sta accanto al prezzo" })
  .nullable();

/** Orario nel formato 24 ore. La mezzanotte si scrive `00:00` (D9). */
export const oraDelGiorno = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
  error: 'formato 24 ore "HH:MM", per esempio "19:30"',
});

/** Date e timestamp: ISO 8601 con timezone esplicita, mai un istante ambiguo. */
export const dataISO = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/, {
  error: 'ISO 8601 con timezone esplicita, per esempio "2026-08-12T10:32:00+02:00"',
});

/** Email di contatto dell'azienda. */
export const email = z.email({ error: "non e' un indirizzo email valido" });

/** Numero di telefono in forma internazionale o nazionale, con spazi ammessi. */
export const telefono = z
  .string()
  .trim()
  .regex(/^\+?[\d\s./()-]{6,20}$/, {
    error: 'numero non valido, per esempio "+39 06 1234567"',
  });

/** URL pubblico (social, video). Piu' stretto di `urlAsset`: qui un percorso relativo non ha senso. */
export const urlPubblico = z.url({ error: "deve essere un URL http(s) completo" });
