# `@vetrina/schema`

Lo schema del `content.json`, i tipi TypeScript derivati e il validatore CLI.

È la **fonte unica di verità**: se una regola vale, vale qui. Ridichiarare un tipo o una validazione altrove significa avere due schemi che divergono (regola 2 di `CLAUDE.md`).

## Uso

```ts
import { valida, validaOLancia, content, type Content } from "@vetrina/schema";

// L'esito è un dato, non un'eccezione
const esito = valida(JSON.parse(testo));
if (!esito.valido) {
  for (const p of esito.problemi) console.error(`${p.percorso}: ${p.messaggio}`);
}

// Oppure: ferma il build se il content.json non passa
const dati: Content = validaOLancia(JSON.parse(testo));
```

Da riga di comando:

```sh
vetrina-validate content.json
```

Esce con `0` se tutti i file passano, `1` al primo che non passa, `2` se manca l'argomento. Il codice di uscita è ciò che rende il validatore utilizzabile in CI e nel build del template.

## Cosa verifica, oltre alla forma

I vincoli di forma (tipi, enum, minimi, massimi) sono la parte facile. Quelli che giustificano Zod invece di un JSON Schema sono le **validazioni incrociate**, perché prevengono il difetto più probabile della pipeline: un pulsante che non fa niente su un sito appena consegnato.

| Controllo | Decisione |
|---|---|
| Una CTA `form` punta a un `forms[].id` esistente | D6 |
| Una CTA `ancora` punta a una sezione **attiva** | D6 |
| Una CTA `tel` / `whatsapp` ha il numero corrispondente in `azienda` | D6 |
| `fonte: "stock"` solo su `hero.sfondo` e `cta_finale.sfondo` | D3, D35 |
| L'hero ha almeno una fra `immagine` e `sfondo` | D36 |
| `mappa_contatti.form_id` esiste; `mostra_mappa` richiede lat/lng | L14 |
| `footer.mostra_piva` richiede `azienda.piva` | — |
| La settimana ha 7 giorni nell'ordine fisso, fasce ordinate e non sovrapposte | D9, L21 |
| Le fasce che scavalcano la mezzanotte sono ammesse | D9 |
| `consenso_privacy` è il letterale `true`, mai configurabile | D8 |
| Un form ha almeno `email` o `telefono` fra i campi standard | L27 |
| Il major di `schema_version` corrisponde a quello supportato | D11 |
| Nessuna chiave non prevista — `generazione.modello` compreso | D12 |

## Nota sulle due passate

Le validazioni incrociate girano solo se la struttura di base è valida: è il comportamento di Zod, e significa che un documento con un campo obbligatorio mancante *e* una CTA rotta mostra prima il campo, poi la CTA alla passata successiva. Farle girare su dati parziali sarebbe un meccanismo, e il meccanismo costa un blocco.

## Sviluppo

```sh
pnpm install
pnpm test         # compila e lancia i test
pnpm typecheck
pnpm build
```

I test sono in `test/`: `esempio` verifica che `docs/riferimenti/content.example.json` passi, `casi-negativi` i nove casi del criterio del Blocco 0, `decisioni` una decisione chiusa per volta, `cli` i codici di uscita.
