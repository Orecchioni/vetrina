import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { esempio, PERCORSO_ESEMPIO } from "./aiuti.js";

/**
 * Il validatore e' una CLI perche' deve poter fermare un build e girare in CI.
 * Quello che conta li' e' il codice di uscita: un rifiuto che esce con 0
 * e' un fallimento silenzioso, cioe' la cosa che la regola 7 vieta.
 */

const CLI = fileURLToPath(new URL("../dist/cli.js", import.meta.url));

interface Risultato {
  codice: number;
  output: string;
}

function esegui(...argomenti: string[]): Risultato {
  try {
    const output = execFileSync("node", [CLI, ...argomenti], { encoding: "utf8", stdio: "pipe" });
    return { codice: 0, output };
  } catch (e) {
    const errore = e as { status?: number; stdout?: string; stderr?: string };
    return { codice: errore.status ?? -1, output: `${errore.stdout ?? ""}${errore.stderr ?? ""}` };
  }
}

function fileTemporaneo(contenuto: string): string {
  const percorso = join(mkdtempSync(join(tmpdir(), "vetrina-")), "content.json");
  writeFileSync(percorso, contenuto, "utf8");
  return percorso;
}

describe("vetrina-validate", () => {
  it("esce con 0 sull'esempio di riferimento", () => {
    const { codice, output } = esegui(PERCORSO_ESEMPIO);

    expect(codice).toBe(0);
    expect(output).toContain("✓");
  });

  it("esce con 1 e dice dove, su un documento non valido", () => {
    const doc = esempio() as any;
    doc.tema.palette = "palette_99";
    const { codice, output } = esegui(fileTemporaneo(JSON.stringify(doc)));

    expect(codice).toBe(1);
    expect(output).toContain("tema.palette");
    expect(output).toContain("palette_1");
  });

  it("esce con 1 e nomina il JSON malformato", () => {
    const { codice, output } = esegui(fileTemporaneo("{ non e' json }"));

    expect(codice).toBe(1);
    expect(output).toContain("JSON malformato");
  });

  it("esce con 1 su un file che non esiste", () => {
    const { codice, output } = esegui(join(tmpdir(), "questo-file-non-esiste.json"));

    expect(codice).toBe(1);
    expect(output).toContain("non leggibile");
  });

  it("esce con 2 senza argomenti, spiegando l'uso", () => {
    const { codice, output } = esegui();

    expect(codice).toBe(2);
    expect(output).toContain("Uso: vetrina-validate");
  });

  it("basta un file non valido fra tanti per uscire con 1", () => {
    const valido = PERCORSO_ESEMPIO;
    const doc = esempio() as any;
    delete doc.azienda.nome;
    const { codice } = esegui(valido, fileTemporaneo(JSON.stringify(doc)));

    expect(codice).toBe(1);
  });
});
