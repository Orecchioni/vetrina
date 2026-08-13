import { describe, expect, it } from "vitest";

import { rompi, riporta } from "./aiuti.js";

/**
 * I nove casi negativi del Blocco 0.
 *
 * Il piano originale ne chiedeva quattro, perche' lo schema era piu' semplice di
 * quanto l'analisi lo abbia reso. Le validazioni incrociate — CTA verso un form,
 * CTA verso una sezione attiva — sono quelle che giustificano Zod invece di un
 * JSON Schema, quindi vanno provate (processo-sviluppo.md §4).
 *
 * Ogni caso verifica due cose: che il documento sia rifiutato, e che l'errore dica
 * dove sta il problema. Un rifiuto con un messaggio illeggibile non soddisfa la
 * regola 7 e quindi non chiude il caso.
 */
describe("casi negativi", () => {
  it("1 — campo obbligatorio mancante", () => {
    const problemi = rompi((doc) => {
      delete doc.azienda.nome;
    });

    expect(riporta(problemi, "azienda.nome", "obbligatorio")).toBe(true);
  });

  it("2 — massimo sforato", () => {
    const problemi = rompi((doc) => {
      const prima = doc.sezioni.gallery.immagini[0];
      while (doc.sezioni.gallery.immagini.length <= 20) {
        doc.sezioni.gallery.immagini.push({ ...prima, alt: `Immagine numero ${doc.sezioni.gallery.immagini.length}` });
      }
    });

    expect(riporta(problemi, "sezioni.gallery.immagini", "al massimo 20")).toBe(true);
  });

  it("3 — minimo non raggiunto", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.gallery.immagini = doc.sezioni.gallery.immagini.slice(0, 5);
    });

    expect(riporta(problemi, "sezioni.gallery.immagini", "sotto le 6 immagini")).toBe(true);
  });

  it("4 — palette inesistente", () => {
    const problemi = rompi((doc) => {
      doc.tema.palette = "palette_99";
    });

    expect(riporta(problemi, "tema.palette", "deve essere una fra")).toBe(true);
  });

  it("5 — CTA verso un form che non esiste", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.cta_primaria.azione = { tipo: "form", form_id: "form_inesistente" };
    });

    expect(
      riporta(problemi, "sezioni.hero.cta_primaria.azione.form_id", 'il form "form_inesistente" non esiste'),
    ).toBe(true);
  });

  it("6 — CTA verso una sezione disattivata", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.cta_secondaria.azione = { tipo: "ancora", sezione: "gallery" };
      doc.sezioni.gallery = { attiva: false };
    });

    expect(riporta(problemi, "sezioni.hero.cta_secondaria.azione.sezione", "disattivata")).toBe(true);
  });

  it("7 — settimana con sei giorni", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.orari.settimana.pop();
    });

    expect(riporta(problemi, "sezioni.orari.settimana", "esattamente 7 giorni")).toBe(true);
  });

  it('8 — `fonte: "stock"` su uno slot non decorativo', () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.immagine.fonte = "stock";
    });

    expect(riporta(problemi, "sezioni.hero.immagine.fonte", "non e' ammessa qui")).toBe(true);
  });

  it("9 — major di `schema_version` non supportato", () => {
    const problemi = rompi((doc) => {
      doc.schema_version = "2.0.0";
    });

    expect(riporta(problemi, "schema_version", "major")).toBe(true);
  });
});
