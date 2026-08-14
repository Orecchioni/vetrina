# CLAUDE.md — Vetrina

Regole valide su ogni sessione, in ogni repo del progetto. Vanno riportate nel `CLAUDE.md` di ciascun repo, insieme a quelle specifiche di quel repo.

## Documenti

- `docs/vetrina-documento-progetto.md` — il vincolo di progetto. Si rilegge quando emerge la tentazione di allargare.
- `docs/processo-sviluppo.md` — ordine dei blocchi e criteri di completamento **effettivi**. Prevale sul piano originale dove divergono.
- `docs/analisi-lacune.md` — lacune con identificatori `L1`…`L33`. Si citano per riferimento.
- `docs/decisioni-aperte.md` — decisioni `D1`…`D43` con stato. Si aggiorna quando se ne chiude una.
- `docs/stato-avanzamento.md` — dove siamo. Si aggiorna a ogni sessione.
- `docs/riferimenti/content.example.json` — il riferimento concreto dello schema.
- `docs/riferimenti/contratto-ingestion.md` — la forma esatta del payload verso l'endpoint (Blocco 1).

## Struttura dei repo (D1, decisa 2026-08-12)

Due repo, non quattro.

| Repo | Contenuto |
|---|---|
| `vetrina` (questo) | Monorepo pnpm: `packages/vetrina-schema`, `packages/vetrina-form`, `apps/vetrina` (sito commerciale e intake) |
| `template-ristorante` | Repo autonomo, **GitHub template repository** (va spuntata l'opzione nelle impostazioni, altrimenti l'API non può clonarlo). Consuma i pacchetti pubblicati |

Il vincolo del piano resta soddisfatto: il repo del cliente è una copia di `template-ristorante`, autonomo e ricostruibile senza il monorepo.

## Regole non negoziabili

1. **Nessun contenuto nel codice.** I template leggono tutto da `content.json`. Nessun titolo, testo, prezzo, orario o URL immagine in un componente. Se serve un valore per far girare qualcosa, sta nel JSON di esempio, non nel sorgente.

2. **Lo schema è uno solo.** Definito in Zod nel pacchetto `vetrina-schema` e importato dagli altri. Mai ridichiarare tipi o validazioni altrove: se una regola vale, vale nel pacchetto.

3. **Il componente form è uno solo.** Nessun template implementa la propria logica di invio. Il template decide quali campi mostrare e come appaiono; mai come si spediscono.

4. **L'endpoint di destinazione è configurazione, non codice.** Sta nel `content.json`. Cambiare destinazione deve significare cambiare una stringa in un file di dati.

5. **Validazione server-side sempre.** La validazione client è ergonomia, non sicurezza. Ogni dato che entra viene rivalidato lato server contro lo schema.

6. **Mobile-first.** Ogni interfaccia si progetta sul telefono e poi si allarga.

7. **Errori visibili e leggibili.** Un JSON malformato, un upload fallito o un POST rifiutato producono un messaggio che dice cosa è andato storto e dove. Mai fallimenti silenziosi.

8. **I consensi sono l'unica cosa non recuperabile.** Il client invia i booleani e la versione dell'informativa mostrata; il server timbra timestamp e IP. Non si inverte per comodità.

## Come si lavora

- **Un blocco alla volta, in ordine.** Non anticipare blocchi successivi. Non implementare cose non richieste dal blocco corrente, nemmeno se sembrano ovvie: `§9` del documento di progetto elenca ciò che è fuori scope, e «sarebbe utile» non è un criterio.
- **Un blocco è chiuso con una prova concreta**, incluso il caso negativo. Vedi `processo-sviluppo.md` §2.
- **La CI si verifica sul remoto, non si dà per buona.** È fallita su ogni push dal Blocco 0 al Blocco 3 senza che nessuno la guardasse su GitHub, mentre i commit dichiaravano il contrario. Una CI che non è stata vista passare non è una prova.
- **Se una decisione del documento di progetto si rivela sbagliata, fermarsi e segnalarlo** invece di aggirarla nel codice.
- **In dubbio fra aggiungere un campo o costruire un meccanismo: aggiungere il campo.** Il campo costa una riga, il meccanismo costa un blocco.
- **Commit** che nomina il blocco: `blocco-0: …`.

## Convenzioni

- Lingua dei contenuti, dei documenti e dell'interfaccia: **italiano**. Nomi di codice, chiavi JSON e identificatori: italiano, coerenti con `content.example.json`.
- Node 20+, pnpm.
- Date e timestamp: ISO 8601 con timezone esplicita.
- Prezzi: stringa con virgola decimale (`"13,00"`), mai float.
