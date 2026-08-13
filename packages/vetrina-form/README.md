# `@vetrina/form`

Il componente form condiviso. Nessun template implementa la propria logica di invio (regola 3 di `CLAUDE.md`): il template passa una configurazione, il componente sa come si spedisce.

## Uso

```astro
---
import Form from "@vetrina/form";
import type { ConfigForm } from "@vetrina/schema";

const config: ConfigForm = { /* da content.json, forms[] */ };
---

<Form
  config={config}
  tenantId={content.ingestion.tenant_id}
  endpoint={content.ingestion.endpoint}
  informativaVersione={content.ingestion.informativa_versione}
  informativaUrl="/privacy"
/>
```

Il beacon di click su `tel:`/WhatsApp (L15, D15) si aggancia a parte, dove i link esistono già:

```astro
<script>
  import { agganciaBeacon } from "@vetrina/form/beacon";
  agganciaBeacon(document, { endpoint, tenantId, sezione: "hero" });
</script>
```

## Cosa fa il componente

- Rende i campi standard (`nome`/`email`/`telefono`/`messaggio`) e quelli extra dichiarati in `config.campi_extra`
- Honeypot invisibile: un bot che lo compila viene scartato in silenzio, senza errore né successo
- Due checkbox di consenso separate; `consenso_privacy` è obbligatorio, l'HTML lo impone
- Costruisce il payload esatto di [`docs/riferimenti/contratto-ingestion.md`](../../docs/riferimenti/contratto-ingestion.md) e lo spedisce via `fetch`
- Su un fallimento di rete o una risposta di errore, **non svuota il form**: i dati restati nei campi, un messaggio leggibile spiega cosa è successo
- Su successo, resetta il form ed emette l'evento `vetrina-form:successo` (bubbles), per chi vuole reagirci (conferma visiva, redirect...)

## Struttura interna

| File | Cosa contiene | Perché separato |
|---|---|---|
| `src/logica.ts` | Costruzione dei payload, lettura di `utm_*`, controllo dell'honeypot, validazione minima | Pura, testabile senza browser né Astro |
| `src/invio.ts` | La chiamata `fetch` vera, con gestione dell'errore | `fetch` è iniettabile, i test non toccano la rete |
| `src/beacon.ts` | Il click su `tel:`/WhatsApp | Non fa parte del form, ma usa la stessa `invia()` |
| `src/Form.astro` | Markup + wiring lato client | L'unico file che tocca il DOM |

## Sviluppo

```sh
pnpm install
pnpm --filter @vetrina/form test         # 25 test su logica, invio, beacon
pnpm --filter @vetrina/form typecheck
```

La prova che il componente funziona davvero dentro un progetto Astro è `apps/vetrina-form-demo` — un'app Astro minima, non l'app commerciale (quella arriva al Blocco 5):

```sh
pnpm --filter @vetrina/form-demo dev      # per provarlo in un browser vero
pnpm --filter @vetrina/form-demo build    # quello che gira anche in CI
```

**Quello che la build non verifica da sola:** che il POST arrivi davvero al webhook. Va provato in un browser, contro un endpoint reale — la stessa infrastruttura Make costruita e verificata nel Blocco 1.
