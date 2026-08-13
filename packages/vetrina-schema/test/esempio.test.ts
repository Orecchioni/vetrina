import { describe, expect, it } from "vitest";

import { valida } from "../src/valida.js";
import { esempio } from "./aiuti.js";

/**
 * Il primo criterio del Blocco 0: il validatore accetta `content.example.json`.
 *
 * L'esempio non e' un file di prova: e' il riferimento concreto dello schema.
 * Se i due divergono, il criterio "fatto quando" del Blocco 0 e' falsato (L4).
 */
describe("content.example.json", () => {
  it("passa il validatore", () => {
    const esito = valida(esempio());

    if (!esito.valido) {
      const dettaglio = esito.problemi.map((p) => `${p.percorso}: ${p.messaggio}`).join("\n");
      throw new Error(`l'esempio di riferimento non passa lo schema:\n${dettaglio}`);
    }

    expect(esito.valido).toBe(true);
  });

  it("non contiene `generazione.modello` (D12)", () => {
    const doc = esempio() as { generazione: Record<string, unknown> };
    expect(doc.generazione).not.toHaveProperty("modello");
  });

  it("usa la chiave `ingestion`, non `leadhub` (D2)", () => {
    const doc = esempio();
    expect(doc).toHaveProperty("ingestion");
    expect(doc).not.toHaveProperty("leadhub");
  });
});
