import { describe, expect, it } from "vitest";

import { invia } from "../src/invio.js";
import type { PayloadBeacon } from "../src/logica.js";

const payloadDiProva: PayloadBeacon = {
  tipo: "click_contatto",
  tenant_id: "tnt_8f2a91c4",
  sezione: "hero",
  canale: "tel",
};

function fetchFinto(risposta: { status: number; corpo?: unknown }): typeof fetch {
  return (async () =>
    new Response(risposta.corpo === undefined ? null : JSON.stringify(risposta.corpo), {
      status: risposta.status,
    })) as typeof fetch;
}

function fetchCheFallisce(): typeof fetch {
  return (async () => {
    throw new TypeError("Failed to fetch");
  }) as typeof fetch;
}

/**
 * `invia` non deve mai lanciare, e il fallimento di rete deve dire chiaramente
 * che i dati inseriti non sono persi — è il secondo criterio "fatto quando" del Blocco 2.
 */
describe("invia", () => {
  it("torna ok:true su una risposta 200", async () => {
    const risultato = await invia(
      "https://hook.eu1.make.com/xxx",
      payloadDiProva,
      fetchFinto({ status: 200, corpo: { ok: true } }),
    );

    expect(risultato).toEqual({ ok: true });
  });

  it("torna ok:true anche se il corpo della risposta 200 e' vuoto", async () => {
    const risultato = await invia("https://hook.eu1.make.com/xxx", payloadDiProva, fetchFinto({ status: 200 }));

    expect(risultato).toEqual({ ok: true });
  });

  it("con la rete assente, non lancia e dice che i dati restano", async () => {
    const risultato = await invia("https://hook.eu1.make.com/xxx", payloadDiProva, fetchCheFallisce());

    expect(risultato.ok).toBe(false);
    if (!risultato.ok) {
      expect(risultato.errore).toBe("rete_assente");
      expect(risultato.messaggio.toLowerCase()).toContain("i dati");
    }
  });

  it("su un 400 con corpo del contratto, riporta errore e messaggio del server", async () => {
    const risultato = await invia(
      "https://hook.eu1.make.com/xxx",
      payloadDiProva,
      fetchFinto({
        status: 400,
        corpo: { ok: false, errore: "consenso_privacy_assente", messaggio: "manca il consenso privacy" },
      }),
    );

    expect(risultato).toEqual({
      ok: false,
      errore: "consenso_privacy_assente",
      messaggio: "manca il consenso privacy",
    });
  });

  it("su un 429 senza corpo leggibile, produce comunque un messaggio", async () => {
    const risultato = await invia("https://hook.eu1.make.com/xxx", payloadDiProva, fetchFinto({ status: 429 }));

    expect(risultato.ok).toBe(false);
    if (!risultato.ok) {
      expect(risultato.messaggio.length).toBeGreaterThan(0);
      expect(risultato.messaggio).toContain("429");
    }
  });

  it("manda il payload come JSON con il content-type corretto", async () => {
    let corpoInviato: string | undefined;
    let headerInviato: string | null | undefined;

    const fetchSpia: typeof fetch = (async (_url, init) => {
      corpoInviato = init?.body as string;
      const headers = init?.headers as Record<string, string>;
      headerInviato = headers["Content-Type"];
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    await invia("https://hook.eu1.make.com/xxx", payloadDiProva, fetchSpia);

    expect(headerInviato).toBe("application/json");
    expect(JSON.parse(corpoInviato ?? "{}")).toEqual(payloadDiProva);
  });
});
