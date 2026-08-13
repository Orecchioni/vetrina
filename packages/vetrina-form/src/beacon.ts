import { costruisciPayloadBeacon, type Canale } from "./logica.js";
import { invia } from "./invio.js";

/**
 * Il lead invisibile di L15: un tap su `tel:` o su un link WhatsApp non produceva
 * niente. Questo modulo lo conta — un beacon, non una submission, senza dati personali.
 */

/** Riconosce il canale da un href. `null` se non è né telefono né WhatsApp. */
export function rilevaCanale(href: string): Canale | null {
  if (href.startsWith("tel:")) return "tel";
  if (href.includes("wa.me/") || href.includes("whatsapp.com/")) return "whatsapp";
  return null;
}

/**
 * Aggancia il beacon a tutti i link di telefono/WhatsApp dentro `radice`.
 * Non blocca mai la navigazione: `tel:` e WhatsApp devono aprirsi comunque
 * anche se il beacon fallisce — è un contatore, non un requisito per la funzione.
 */
export function agganciaBeacon(
  radice: ParentNode,
  opzioni: { endpoint: string; tenantId: string; sezione: string },
): void {
  const link = radice.querySelectorAll<HTMLAnchorElement>('a[href^="tel:"], a[href*="wa.me/"], a[href*="whatsapp.com/"]');

  for (const a of link) {
    const canale = rilevaCanale(a.getAttribute("href") ?? "");
    if (!canale) continue;

    a.addEventListener("click", () => {
      const payload = costruisciPayloadBeacon({ tenantId: opzioni.tenantId, sezione: opzioni.sezione, canale });
      void invia(opzioni.endpoint, payload);
    });
  }
}
