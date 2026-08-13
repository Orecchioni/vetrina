import { describe, expect, it } from "vitest";

import {
  costruisciPayloadBeacon,
  costruisciPayloadSubmission,
  honeypotCompilato,
  leggiProvenienza,
  validazioneMinima,
} from "../src/logica.js";
import { configEsempio } from "./aiuti.js";

describe("leggiProvenienza", () => {
  it("legge pagina e utm da un URL completo", () => {
    const p = leggiProvenienza("https://trattoriadanino.it/?utm_source=instagram&utm_medium=bio");

    expect(p.pagina).toBe("https://trattoriadanino.it/");
    expect(p.utm_source).toBe("instagram");
    expect(p.utm_medium).toBe("bio");
    expect(p.utm_campaign).toBeNull();
  });

  it("restituisce null per gli utm assenti, non stringa vuota", () => {
    const p = leggiProvenienza("https://trattoriadanino.it/");

    expect(p.utm_source).toBeNull();
    expect(p.utm_medium).toBeNull();
    expect(p.utm_campaign).toBeNull();
  });
});

describe("honeypotCompilato", () => {
  it("è falso quando il campo è vuoto, nullo o assente", () => {
    expect(honeypotCompilato("")).toBe(false);
    expect(honeypotCompilato(null)).toBe(false);
    expect(honeypotCompilato(undefined)).toBe(false);
  });

  it("è falso per solo spazi bianchi", () => {
    expect(honeypotCompilato("   ")).toBe(false);
  });

  it("è vero quando un bot lo ha compilato", () => {
    expect(honeypotCompilato("http://spam.example")).toBe(true);
  });
});

describe("costruisciPayloadSubmission", () => {
  const base = {
    config: configEsempio(),
    tenantId: "tnt_8f2a91c4",
    consensoPrivacy: true,
    consensoMarketing: false,
    informativaVersione: "2026-08-v1",
    provenienza: { pagina: "https://trattoriadanino.it/", utm_source: null, utm_medium: null, utm_campaign: null },
  };

  it("smista i campi standard ed extra secondo la configurazione", () => {
    const payload = costruisciPayloadSubmission({
      ...base,
      valori: {
        nome: "Marco Rossi",
        email: "marco@esempio.it",
        telefono: "+39 333 1234567",
        data_prenotazione: "2026-09-01",
        num_persone: "4",
      },
    });

    expect(payload.campi).toEqual({
      nome: "Marco Rossi",
      email: "marco@esempio.it",
      telefono: "+39 333 1234567",
    });
    expect(payload.campi_extra).toEqual({ data_prenotazione: "2026-09-01", num_persone: "4" });
  });

  it("scarta le chiavi non previste dalla configurazione", () => {
    const payload = costruisciPayloadSubmission({
      ...base,
      valori: {
        nome: "Marco Rossi",
        email: "marco@esempio.it",
        campo_a_sorpresa: "non dovrebbe passare",
      },
    });

    expect(payload.campi).not.toHaveProperty("campo_a_sorpresa");
    expect(payload.campi_extra).not.toHaveProperty("campo_a_sorpresa");
  });

  it("omette i campi vuoti invece di mandarli come stringa vuota", () => {
    const payload = costruisciPayloadSubmission({
      ...base,
      valori: { nome: "Marco Rossi", email: "", telefono: "  " },
    });

    expect(payload.campi).toEqual({ nome: "Marco Rossi" });
  });

  it("riporta id, sorgente e tenant esattamente come nella configurazione", () => {
    const payload = costruisciPayloadSubmission({ ...base, valori: { nome: "Marco Rossi" } });

    expect(payload.tipo).toBe("submission");
    expect(payload.form_id).toBe("form_prenotazione");
    expect(payload.sorgente).toBe("prenotazione_hero");
    expect(payload.tenant_id).toBe("tnt_8f2a91c4");
  });

  it("riporta i consensi e la versione dell'informativa cosi' come passati", () => {
    const payload = costruisciPayloadSubmission({ ...base, valori: {} });

    expect(payload.consensi).toEqual({
      privacy: true,
      marketing: false,
      informativa_versione: "2026-08-v1",
    });
  });
});

describe("costruisciPayloadBeacon", () => {
  it("costruisce il payload del click senza alcun dato personale", () => {
    const payload = costruisciPayloadBeacon({ tenantId: "tnt_8f2a91c4", sezione: "hero", canale: "tel" });

    expect(payload).toEqual({
      tipo: "click_contatto",
      tenant_id: "tnt_8f2a91c4",
      sezione: "hero",
      canale: "tel",
    });
  });
});

describe("validazioneMinima", () => {
  it("segnala l'assenza di un contatto quando mancano sia email sia telefono", () => {
    const problemi = validazioneMinima({
      config: configEsempio(),
      valori: { nome: "Marco Rossi" },
      consensoPrivacy: true,
    });

    expect(problemi.some((p) => p.includes("ricontattarti"))).toBe(true);
  });

  it("passa con la sola email, anche senza telefono", () => {
    const problemi = validazioneMinima({
      config: configEsempio(),
      valori: { email: "marco@esempio.it" },
      consensoPrivacy: true,
    });

    expect(problemi.some((p) => p.includes("ricontattarti"))).toBe(false);
  });

  it("segnala il consenso privacy mancante", () => {
    const problemi = validazioneMinima({
      config: configEsempio(),
      valori: { email: "marco@esempio.it" },
      consensoPrivacy: false,
    });

    expect(problemi.some((p) => p.includes("informativa"))).toBe(true);
  });

  it("non segnala nulla quando la richiesta e' completa", () => {
    const problemi = validazioneMinima({
      config: configEsempio(),
      valori: { email: "marco@esempio.it" },
      consensoPrivacy: true,
    });

    expect(problemi).toEqual([]);
  });
});
