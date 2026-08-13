# Vetrina

Siti one-page standardizzati per categorie di PMI italiane, con personalizzazione guidata e pipeline di generazione automatizzata.

**Stato:** Blocco 0 e Blocco 2 chiusi. Blocco 1 verificato per la parte principale (submission valida, payload malformato); rate limit e beacon lato server rimandati a prima del Blocco 4. Il prossimo è il Blocco 3, il template ristorante.

## Pacchetti

| | |
|---|---|
| [`packages/vetrina-schema`](packages/vetrina-schema) | Schema Zod del `content.json`, tipi derivati, CLI `vetrina-validate`. Fonte unica di verità |
| [`packages/vetrina-form`](packages/vetrina-form) | Componente form condiviso: campi, honeypot, consensi, invio, beacon di click |
| `apps/vetrina-form-demo` | Progetto Astro minimo per verificare `vetrina-form` — non è l'app commerciale (quella è al Blocco 5) |

```sh
pnpm install
pnpm -r test
```

## Dove guardare

| | |
|---|---|
| Cosa si costruisce e cosa no | [`docs/vetrina-documento-progetto.md`](docs/vetrina-documento-progetto.md) |
| Come si lavora e in che ordine | [`docs/processo-sviluppo.md`](docs/processo-sviluppo.md) |
| Lacune del disegno, `L1`…`L33` | [`docs/analisi-lacune.md`](docs/analisi-lacune.md) |
| Decisioni aperte, `D1`…`D43` | [`docs/decisioni-aperte.md`](docs/decisioni-aperte.md) |
| Dove siamo adesso | [`docs/stato-avanzamento.md`](docs/stato-avanzamento.md) |
| Regole per ogni sessione | [`CLAUDE.md`](CLAUDE.md) |
| Riferimento dello schema | [`docs/riferimenti/content.example.json`](docs/riferimenti/content.example.json) |
| Piano originale (storico) | [`docs/vetrina-piano-sviluppo.md`](docs/vetrina-piano-sviluppo.md) |

## In una riga

Il prodotto non è il sito: è il sistema che lo consegna. I due obiettivi, in ordine, sono generare contatti nel segmento PMI corretto e imparare l'integrazione che in futuro si venderà. Il fatturato è terziario.
