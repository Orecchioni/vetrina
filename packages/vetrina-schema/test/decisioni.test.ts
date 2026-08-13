import { describe, expect, it } from "vitest";

import { accetta, riporta, rompi } from "./aiuti.js";

/**
 * Le decisioni chiuse nella Fase 0, verificate una per una.
 *
 * Una decisione che vive solo in `decisioni-aperte.md` e' una frase; qui diventa
 * un vincolo. Il numero fra parentesi rimanda al registro, cosi' quando una
 * decisione cambia si sa quale test cambia con lei.
 */

describe("D4 — prezzo annullabile con nota", () => {
  it("accetta una voce senza prezzo ma con nota", () => {
    accetta((doc) => {
      doc.sezioni.servizi.gruppi[0].voci[0].prezzo = null;
      doc.sezioni.servizi.gruppi[0].voci[0].prezzo_nota = "a partire da 8,00";
    });
  });

  it("accetta una voce senza prezzo e senza nota", () => {
    accetta((doc) => {
      doc.sezioni.servizi.gruppi[0].voci[0].prezzo = null;
      doc.sezioni.servizi.gruppi[0].voci[0].prezzo_nota = null;
    });
  });

  it("rifiuta il punto decimale al posto della virgola", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.servizi.gruppi[0].voci[0].prezzo = "13.00";
    });

    expect(riporta(problemi, "sezioni.servizi.gruppi[0].voci[0].prezzo", "formato italiano")).toBe(true);
  });
});

describe("D5 — i tag sono un set chiuso", () => {
  it("rifiuta un tag fuori dall'elenco", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.servizi.gruppi[0].voci[0].tag = ["senza_lattosio"];
    });

    expect(riporta(problemi, "sezioni.servizi.gruppi[0].voci[0].tag[0]", "deve essere uno fra")).toBe(true);
  });

  it("rifiuta lo stesso tag due volte", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.servizi.gruppi[0].voci[0].tag = ["vegetariano", "vegetariano"];
    });

    expect(riporta(problemi, "sezioni.servizi.gruppi[0].voci[0].tag", "ripetuti")).toBe(true);
  });
});

describe("D6 — le CTA sono un'unione discriminata", () => {
  it("rifiuta una CTA `tel` se manca il telefono", () => {
    const problemi = rompi((doc) => {
      doc.azienda.telefono = null;
      doc.sezioni.hero.cta_secondaria.azione = { tipo: "tel" };
    });

    expect(riporta(problemi, "sezioni.hero.cta_secondaria.azione", "azienda.telefono")).toBe(true);
  });

  it("rifiuta una CTA `whatsapp` se manca il numero", () => {
    const problemi = rompi((doc) => {
      doc.azienda.whatsapp = null;
      doc.sezioni.hero.cta_secondaria.azione = { tipo: "whatsapp" };
    });

    expect(riporta(problemi, "sezioni.hero.cta_secondaria.azione", "azienda.whatsapp")).toBe(true);
  });

  it("rifiuta la vecchia forma a stringa", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.cta_primaria.azione = "form_prenotazione";
    });

    expect(problemi.some((p) => p.percorso.startsWith("sezioni.hero.cta_primaria.azione"))).toBe(true);
  });
});

describe("D8 — il consenso privacy e' un invariante", () => {
  it("rifiuta un form che lo dichiara falso", () => {
    const problemi = rompi((doc) => {
      doc.forms[0].consenso_privacy = false;
    });

    expect(riporta(problemi, "forms[0].consenso_privacy", "sempre obbligatorio")).toBe(true);
  });

  it("rifiuta un form che lo omette", () => {
    const problemi = rompi((doc) => {
      delete doc.forms[0].consenso_privacy;
    });

    expect(riporta(problemi, "forms[0].consenso_privacy", "obbligatorio")).toBe(true);
  });
});

describe("D9 — orari, mezzanotte e settimana", () => {
  it("accetta una fascia che scavalca la mezzanotte", () => {
    accetta((doc) => {
      doc.sezioni.orari.settimana[5].fasce = [{ da: "19:30", a: "01:00" }];
    });
  });

  it("rifiuta due fasce sovrapposte", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.orari.settimana[1].fasce = [
        { da: "12:30", a: "15:00" },
        { da: "14:00", a: "23:00" },
      ];
    });

    expect(riporta(problemi, "sezioni.orari.settimana[1].fasce[1]", "sovrappone")).toBe(true);
  });

  it("rifiuta i giorni fuori ordine", () => {
    const problemi = rompi((doc) => {
      const settimana = doc.sezioni.orari.settimana;
      [settimana[1], settimana[2]] = [settimana[2], settimana[1]];
    });

    expect(riporta(problemi, "sezioni.orari.settimana[1].giorno", "ordine fisso")).toBe(true);
  });

  it("rifiuta un giorno aperto senza fasce", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.orari.settimana[1].fasce = [];
    });

    expect(riporta(problemi, "sezioni.orari.settimana[1].fasce", "almeno una fascia")).toBe(true);
  });

  it("rifiuta un giorno chiuso con fasce", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.orari.settimana[0].fasce = [{ da: "12:30", a: "15:00" }];
    });

    expect(problemi.some((p) => p.percorso.startsWith("sezioni.orari.settimana[0].fasce"))).toBe(true);
  });
});

describe("D11 — compatibilita' di schema_version", () => {
  it("accetta un minor diverso", () => {
    accetta((doc) => {
      doc.schema_version = "1.4.2";
    });
  });

  it("rifiuta una versione che non e' semver", () => {
    const problemi = rompi((doc) => {
      doc.schema_version = "1.0";
    });

    expect(riporta(problemi, "schema_version", "major.minor.patch")).toBe(true);
  });
});

describe("D12 — il modello non entra nel repo del cliente", () => {
  it("rifiuta `generazione.modello`", () => {
    const problemi = rompi((doc) => {
      doc.generazione.modello = "un-modello-qualsiasi";
    });

    expect(riporta(problemi, "generazione", "modello")).toBe(true);
  });
});

describe("D35 / D36 — slot decorativi e hero senza foto propria", () => {
  it('accetta `fonte: "stock"` su `hero.sfondo`', () => {
    accetta((doc) => {
      doc.sezioni.hero.sfondo = {
        url: "https://res.cloudinary.com/.../sfondo-generico.jpg",
        alt: "Trama di legno chiaro come sfondo della sezione",
        fonte: "stock",
      };
    });
  });

  it('accetta `fonte: "stock"` su `cta_finale.sfondo`', () => {
    accetta((doc) => {
      doc.sezioni.cta_finale.sfondo = {
        url: "https://res.cloudinary.com/.../sfondo-cta.jpg",
        alt: "Trama di carta ruvida come sfondo della chiamata all'azione",
        fonte: "stock",
      };
    });
  });

  it("accetta un hero con il solo sfondo, senza foto propria", () => {
    accetta((doc) => {
      doc.sezioni.hero.immagine = null;
      doc.sezioni.hero.sfondo = {
        url: "https://res.cloudinary.com/.../sfondo-generico.jpg",
        alt: "Trama di legno chiaro come sfondo della sezione",
        fonte: "stock",
      };
    });
  });

  it("rifiuta un hero senza immagine e senza sfondo", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.immagine = null;
      doc.sezioni.hero.sfondo = null;
    });

    expect(riporta(problemi, "sezioni.hero.immagine", "almeno un'immagine")).toBe(true);
  });
});

describe("L27 — un lead deve essere contattabile", () => {
  it("rifiuta un form senza email ne' telefono", () => {
    const problemi = rompi((doc) => {
      doc.forms[1].campi_standard = ["nome", "messaggio"];
    });

    expect(riporta(problemi, "forms[1].campi_standard", "richiamare")).toBe(true);
  });
});

describe("L28 — l'alt descrive, non ripete il nome del file", () => {
  it("rifiuta un alt uguale al nome del file", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.immagine.url = "https://res.cloudinary.com/x/hero-danino.jpg";
      doc.sezioni.hero.immagine.alt = "Hero Danino";
    });

    expect(riporta(problemi, "sezioni.hero.immagine.alt", "nome del file")).toBe(true);
  });

  it("rifiuta un alt vuoto", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.immagine.alt = "";
    });

    expect(problemi.some((p) => p.percorso === "sezioni.hero.immagine.alt")).toBe(true);
  });
});

describe("L14 — la mappa ha bisogno delle coordinate", () => {
  it("rifiuta `mostra_mappa` senza lat/lng", () => {
    const problemi = rompi((doc) => {
      doc.azienda.indirizzo.lat = null;
    });

    expect(riporta(problemi, "sezioni.mappa_contatti.mostra_mappa", "lat")).toBe(true);
  });
});

describe("L32 — le sezioni disattivabili si spengono davvero", () => {
  it("accetta una gallery spenta, senza immagini", () => {
    accetta((doc) => {
      doc.sezioni.gallery = { attiva: false };
    });
  });

  it("accetta un sito con tutte le sezioni facoltative spente", () => {
    accetta((doc) => {
      doc.sezioni.chi_siamo = { attiva: false };
      doc.sezioni.gallery = { attiva: false };
      doc.sezioni.testimonianze = { attiva: false };
      doc.sezioni.orari = { attiva: false };
      doc.sezioni.cta_finale = { attiva: false };
      doc.sezioni.hero.cta_secondaria = null;
    });
  });

  it("rifiuta lo spegnimento di una sezione che non si spegne", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.servizi.attiva = false;
    });

    expect(problemi.some((p) => p.percorso === "sezioni.servizi.attiva")).toBe(true);
  });
});

describe("coerenza del documento", () => {
  it("rifiuta due form con lo stesso id", () => {
    const problemi = rompi((doc) => {
      doc.forms[1].id = doc.forms[0].id;
    });

    expect(riporta(problemi, "forms", "stesso `id`")).toBe(true);
  });

  it("rifiuta la mappa che punta a un form inesistente", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.mappa_contatti.form_id = "form_che_non_ce";
    });

    expect(riporta(problemi, "sezioni.mappa_contatti.form_id", "non esiste")).toBe(true);
  });

  it("rifiuta il footer che mostra una partita IVA assente", () => {
    const problemi = rompi((doc) => {
      doc.azienda.piva = null;
    });

    expect(riporta(problemi, "sezioni.footer.mostra_piva", "azienda.piva")).toBe(true);
  });

  it("rifiuta una chiave non prevista", () => {
    const problemi = rompi((doc) => {
      doc.sezioni.hero.parallasse = true;
    });

    expect(riporta(problemi, "sezioni.hero", "parallasse")).toBe(true);
  });
});
