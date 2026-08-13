import type { PayloadBeacon, PayloadSubmission } from "./logica.js";

/**
 * L'invio vero e proprio verso l'endpoint di ingestion.
 *
 * `fetchImpl` è iniettabile apposta: nei test si passa un fetch finto, senza
 * bisogno di una rete vera o di un endpoint Make reale. Nel browser il chiamante
 * passa `window.fetch` (o lo lascia implicito, vedi `Form.astro`).
 */

export type RisultatoInvio =
  | { ok: true }
  | { ok: false; errore: string; messaggio: string };

interface CorpoErrore {
  ok: false;
  errore?: string;
  messaggio?: string;
}

function eCorpoErrore(v: unknown): v is CorpoErrore {
  return typeof v === "object" && v !== null && "ok" in v;
}

/**
 * Spedisce un payload (submission o beacon) all'endpoint.
 *
 * Non lancia mai: un fallimento — rete assente, timeout, risposta 4xx/5xx —
 * torna come `{ ok: false, ... }` leggibile, mai un'eccezione che il chiamante
 * deve ricordarsi di intercettare (regola 7).
 */
export async function invia(
  endpoint: string,
  payload: PayloadSubmission | PayloadBeacon,
  fetchImpl: typeof fetch = fetch,
): Promise<RisultatoInvio> {
  let risposta: Response;
  try {
    risposta = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      errore: "rete_assente",
      messaggio: "Non riesco a raggiungere il server. Controlla la connessione e riprova — i dati che hai inserito restano qui.",
    };
  }

  let corpo: unknown = null;
  try {
    corpo = await risposta.json();
  } catch {
    // Corpo assente o non JSON: si procede solo con lo status HTTP.
  }

  if (risposta.ok) return { ok: true };

  if (eCorpoErrore(corpo)) {
    return {
      ok: false,
      errore: corpo.errore ?? "sconosciuto",
      messaggio: corpo.messaggio ?? "Il server ha rifiutato la richiesta.",
    };
  }

  return {
    ok: false,
    errore: "risposta_inattesa",
    messaggio: `Il server ha risposto con un errore (${risposta.status}). Riprova fra qualche minuto.`,
  };
}
