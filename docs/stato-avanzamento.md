# Vetrina — stato di avanzamento

**Aggiornato:** 14 agosto 2026

## Dove siamo

**Blocco 3 — Primo template (ristorante): chiuso.** [`orecchioni/template-ristorante`](https://github.com/orecchioni/template-ristorante), repo autonomo come da D1. Sito one-page interamente guidato da `content.json`: nove sezioni in ordine fisso, una per componente. D16–D19 implementate; aggiunte D34 (dati strutturati `schema.org/Restaurant`) e L29 (sitemap, robots).

**Tutti e sette i criteri del blocco verificati con build vere (14/08):** un `content.json` diverso produce un sito visibilmente diverso; disattivando `gallery`, `testimonianze`, `chi_siamo`, `orari` e `cta_finale` restano le tre sezioni non disattivabili e il layout regge; `/privacy` e `/cookie` esistono senza link rotti; il build fallisce su `content.json` non valido e su `informativa_versione` inesistente, con errore leggibile in entrambi i casi; il check sui letterali passa in CI; nessuna richiesta a terze parti nell'output — non solo nessun cookie.

**Il check sui letterali (D19) aveva due bug, trovati provandolo invece di fidarsene:** scansionava anche i commenti (falsi positivi sulla documentazione) e — molto peggio — non copriva affatto il testo diretto fra tag HTML, cioè il modo più comune in cui un contenuto finirebbe hardcoded in Astro. Scoperto iniettando un titolo finto in `Footer.astro` e vedendo il check passare lo stesso. Corretto e riverificato con la stessa iniezione.

**Come `template-ristorante` consuma i pacchetti: vendorizzati, non da git.** Prima si era scelta una dipendenza git pinnata a un commit, verificata empiricamente nel container. Si è rotta sulla macchina dell'utente (Windows): pnpm 11 ha sostituito `onlyBuiltDependencies` con `allowBuilds`, e l'installazione annidata per compilare il pacchetto al volo si intrecciava con le dipendenze dell'intero progetto. Sostituita con copie in `vendor/` referenziate come dipendenze `file:` — zero rete, zero installazioni annidate, uguale ovunque. **Verificato sulla macchina dell'utente (14/08):** `pnpm install` pulito, `pnpm run dev` su, sito servito a `localhost:4321`. Il risync è documentato in `vendor/README.md`.

**La CI di `vetrina` non era mai passata prima del 14/08.** Falliva su ogni push dal Blocco 0, in undici secondi, prima ancora dell'install: `pnpm/action-setup@v4` richiede la versione dichiarata in `packageManager` e mancava. Non era mai stata guardata su GitHub — solo eseguita in locale — e i commit dicevano «CI aggiunta, gira su ogni push». Lo stesso bug esisteva in `template-ristorante`. Corretto in entrambi: run verdi su `d29736a` (vetrina) e `c25c640` (template). **Regola che ne consegue, ora in entrambi i `CLAUDE.md`: la CI si verifica sul remoto, non si dà per buona.**

**Cambio di scopo deciso (D44):** il Blocco 5a non apre più con un solo template. Apre con **circa dieci-dodici**, distribuiti su dieci etichette (`template.categoria_attivita`) — la maggior parte con un solo template, un paio con due design diversi. Motivo: la domanda filtro del §6.1 non è una domanda vera con una sola etichetta disponibile. Nessuna modifica allo schema: `template.id` e `template.categoria_attivita` erano già due campi distinti dal Blocco 0. Il vecchio Blocco 11 ("secondo template, meno di un quinto del tempo del primo") diventa **Blocco 3-bis**, eseguito subito dopo il primo template — non alla fine — per validare lo scheletro condiviso prima di replicarlo molte volte. Dettagli in `decisioni-aperte.md` (D44) e `processo-sviluppo.md` §4.

**Blocco 2 — Componente form condiviso: chiuso.** `packages/vetrina-form` contiene la logica di invio (unica, per regola 3), il componente `Form.astro`, il beacon di click. 25 test più `astro check`/`astro build` puliti su `apps/vetrina-form-demo`, l'app Astro minima usata solo per la prova richiesta dal blocco — non è l'app commerciale.

**Verificato per intero, incluso in un browser vero (13/08):** dalla demo Astro, un invio reale del form ha prodotto una riga nuova sullo stesso Google Sheet del Blocco 1, e il form si è svuotato — il segnale di successo. Chiude tutti e quattro i criteri del Blocco 2: importato in un progetto Astro vuoto spedisce al webhook (fatto), rete assente non perde i dati (verificato via test unitari su `invio.ts`), honeypot scarta in silenzio (verificato via test unitari), beacon sui link `tel:`/WhatsApp presente e testato a livello di riconoscimento canale — il click vero non è stato provato in questa sessione, ma usa la stessa `invia()` già verificata.

Bug trovati e corretti scrivendo il componente, non dai test: `campi_extra` andava perso se ricostruito dal DOM invece che passato come JSON dal server; un campo extra di tipo `textarea` produceva un `<input>` invalido; il tipo `ConfigForm` è stato esportato da `vetrina-schema` per evitare che `vetrina-form` dipendesse da `zod` solo per un tipo.

**Blocco 1 — Contratto di ingestion: scenario Make costruito e verificato in parte.** [`docs/riferimenti/contratto-ingestion.md`](riferimenti/contratto-ingestion.md) fissa la forma esatta del payload, cosa timbra il server (D13), l'anti-abuso con i numeri (D14: 5 richieste/10 min per IP, 10 KB), e il beacon senza IP (D15).

**Verificato con curl contro lo scenario Make reale (13/08):**
- submission conforme → riga completa nello Sheet + mail, con `ricevuto_il` e `ip` timbrati dal server (IP letto da `cf-connecting-ip`, l'header che Cloudflare imposta e il client non può falsificare — non da `x-real-ip`, che è solo il nodo Cloudflare immediato) → risposta `200 {"ok": true}`
- payload malformato (`{"tipo": "submission"}`, senza consenso) → risposta `400` con `errore`/`messaggio` leggibili, tramite un ramo di **fallback** sul Router: un campo del tutto assente non soddisfa un confronto "diverso da" in Make, quindi la validazione va costruita come "tutto ciò che non è esplicitamente valido", non enumerando i modi di essere invalido

**Non ancora costruito:**
- **rate limit** (D14) — richiede un Data Store e una logica a finestra temporale (10 minuti) che si è deciso di rimandare: la formula esatta (funzioni data di Make non verificate dal vivo) rischiava un altro giro lungo di correzioni. **Non blocca nulla ora**: l'endpoint non è ancora incorporato in nessun sito pubblico. Va chiuso prima del Blocco 4, come D14 prevedeva fin dall'inizio ("va chiuso prima del Blocco 4, che mette online un endpoint e lo lascia lì") — non è uno slittamento rispetto al piano, è il momento in cui era già previsto
- **ramo beacon** (`click_contatto`, D15) — il filtro sul Router esiste (`È un beacon di click`), ma non ha ancora moduli dietro: nessun contatore, nessuna risposta configurata
- risposta JSON del **413** (payload troppo grande) — non testata

Lo scenario Make (`Integration Webhooks`) è nell'account dell'utente, non in questo repo: il contratto scritto è la fonte di verità riproducibile, lo scenario ne è un'implementazione concreta.

**Blocco 0 — Schema e validatore: chiuso.** Il pacchetto `packages/vetrina-schema` contiene lo schema Zod completo, i tipi derivati, il validatore CLI e 51 test che girano in CI su Node 20 e 22.

Il criterio è verificato per intero: il validatore accetta `content.example.json` e rifiuta con errore leggibile tutti e nove i casi negativi richiesti. La prova che i test mordono è stata fatta togliendo una validazione dallo schema e verificando che il test corrispondente fallisse.

**Fase 0 — Accordo: chiusa.** D1–D12, D35, D36 decise; documenti allineati; `content.example.json` aggiornato.

**Deciso finora:** due repo invece di quattro (D1) · `leadhub` → `ingestion` (D2) · slot decorativi con stock ammesso (D3 → D35/D36) · `prezzo` nullable (D4) · `tag` enum (D5) · `cta.azione` unione discriminata (D6) · logo+favicon (D7) · `consenso_privacy` fisso (D8) · mezzanotte ammessa + 7 giorni (D9) · `variante` come preset (D10) · politica `schema_version` (D11) · `generazione.modello` fuori dal repo cliente (D12).

**Aggiunto dalla revisione esterna:** L33/D37 (il copione di consegna manuale, unica procedura dei primi mesi non specificata) · correzione di L15/D15 (il beacon di click e l'IP) · regola commerciale accanto a D36 (foto minime = eccezione, mai default né demo).

**Aperto dal Blocco 0:** D38–D43, i valori di dettaglio che scrivere lo schema ha costretto a fissare (numero di palette e font, valori di `tono`, limiti SEO, formato di `informativa_versione`). Sono enum e numeri, una riga ciascuno: si confermano al Blocco 3 e al Blocco 4, non prima.

## Blocchi

| Blocco | Stato | Nota |
|---|---|---|
| Fase 0 — Accordo | **chiusa** | 0.1 decisioni ✅ · 0.2 allineamento documenti ✅ · 0.3 esempio aggiornato ✅ · 0.4 CLAUDE.md ✅ (monorepo e template) |
| 0 — Schema e validatore | **chiuso** | `packages/vetrina-schema`: schema, tipi, CLI `vetrina-validate`, 51 test, CI su Node 20 e 22 |
| 1 — Contratto di ingestion | **verificato in parte** | Submission valida e payload malformato confermati contro Make vero. Restano rate limit e ramo beacon, da chiudere prima del Blocco 4 |
| 2 — Componente form | **chiuso** | `packages/vetrina-form`: logica, componente, beacon, 25 test, build Astro verificata, invio reale confermato in browser |
| 3 — Template ristorante | **chiuso** | `template-ristorante`: nove sezioni, D16–D19, due controlli prima del build, CI verde. Vendorizzazione verificata su Windows |
| 3-bis — Secondo template | **pronto a partire** | Checkpoint: meno di un quinto del tempo del primo, senza toccare scheletro, form e schema |
| 3-ter… — Restanti template | non iniziato | Solo se 3-bis passa |
| 4 — Demo pubblicata | non iniziato | Primo checkpoint reale |
| 5a — Vetrina commerciale | non iniziato | Da qui si contatta gente |
| 6 — Intake guidato | non iniziato | Non prima di aver parlato con clienti reali |
| 7 — Pagamento | non iniziato | |
| 8 — Pipeline fino a preview | non iniziato | |
| 9 — Generazione testi | non iniziato | |
| 10 — Pubblicazione | non iniziato | |
| ~~11 — Secondo template~~ | — | Anticipato a 3-bis (D44) |

## Presidio del tempo (§14.5)

Si attiva dal Blocco 4. La quota va fissata come numero in **D23** prima di arrivarci.

| Settimana | Ore sviluppo | Ore acquisizione | Contatti fatti |
|---|---|---|---|
| — | — | — | — |

## Registro delle sessioni

| Data | Blocco | Cosa è stato fatto |
|---|---|---|
| 2026-08-12 | Fase 0 | Analisi dei tre documenti di ideazione. 32 lacune identificate (`analisi-lacune.md`), 34 decisioni registrate (`decisioni-aperte.md`), processo e criteri di completamento definiti (`processo-sviluppo.md`), `CLAUDE.md` scritto. |
| 2026-08-12 | Fase 0.1 | Chiuse D1 (due repo), D2 (`ingestion`), D3 (slot decorativi). D3 apre D35 (quali slot) e D36 (hero senza foto propria). L32 rivisto: sopravvalutava il vincolo delle foto, la gallery è disattivabile e il vincolo vero è l'hero. |
| 2026-08-12 | Fase 0.1 cont. | Revisione esterna. Chiuse D4–D12, D35, D36 (raccomandazioni accettate). Corretta L15/D15: beacon e IP vanno su percorso senza conservazione IP. Aggiunta L33/D37 (copione di consegna manuale). Regola commerciale accanto a D36. Blocco 0 sbloccato. |
| 2026-08-12 | Fase 0.2 | Allineamento documento di progetto: §8 riscritto (Lead Hub → contratto di ingestion con webhook Make); §9 eccezione dichiarata per pagine legali; §10 ordine aggiornato con Blocchi 0-11 e split 5a/5b; §11 stack aggiornato; §14.4 e §15 aggiornati su P.IVA (non blocca 5a, blocca 5b). |
| 2026-08-13 | Blocco 0 | Monorepo pnpm inizializzato. `packages/vetrina-schema`: schema Zod completo (costanti, primitivi, orari, sezioni, azienda, forms, radice con le validazioni incrociate), tipi derivati, formattatore di errori in italiano, CLI `vetrina-validate` con codici di uscita. 51 test in quattro file: l'esempio di riferimento, i nove casi negativi, una decisione chiusa per volta, i codici di uscita della CLI. CI su Node 20 e 22 che gira tipi, test e il validatore sull'esempio. Aperte D38–D43 per i valori di dettaglio fissati per necessità. |
| 2026-08-13 | Blocco 1 | Chiuse D13, D14, D15. Scritto `docs/riferimenti/contratto-ingestion.md`. §8 del documento di progetto aggiornato per rimandarci. |
| 2026-08-13 | Blocco 1 cont. | Costruito lo scenario Make (`Integration Webhooks`) sull'account dell'utente, guidato passo passo: webhook custom, Router con filtri su `tipo`, timbratura di `ricevuto_il`/`ip` (scoperto che l'IP vero sta in `cf-connecting-ip`, non in `x-real-ip`, perché Make sta dietro Cloudflare), scrittura su Google Sheet, notifica email al titolare (non al cliente — corretto un errore di mappatura), risposta `{"ok": true}` con status 200. Aggiunto un ramo di fallback per le submission senza consenso privacy, che risponde 400 con errore leggibile — scoperto che un campo assente non soddisfa un confronto "diverso da" in Make, va trattato come fallback. Verificati con curl: submission conforme e payload malformato. Non costruiti: rate limit (formula a finestra temporale rimandata, non blocca nulla finché l'endpoint non è pubblico) e ramo beacon. |
| 2026-08-13 | Blocco 2 | `packages/vetrina-form`: `logica.ts` (costruzione payload, honeypot, provenienza UTM, validazione minima), `invio.ts` (fetch con `fetch` iniettabile per i test, nessun'eccezione mai lanciata), `beacon.ts` (click su `tel:`/WhatsApp), `Form.astro`. Aggiunto `ConfigForm` come tipo esportato da `vetrina-schema` per non far dipendere `vetrina-form` da zod solo per un tipo. 25 test; verificata la tenuta rompendo di proposito la gestione dell'errore di rete. Creata `apps/vetrina-form-demo`, un'app Astro minima (non l'app commerciale) che importa il componente: `astro check` e `astro build` puliti, ora anche in CI. Due bug trovati e corretti scrivendo il componente: `campi_extra` si perdeva se lo script client lo ricostruiva dal DOM invece di riceverlo come JSON dal server; un campo extra `textarea` produceva un `<input type="textarea">` invalido. |
| 2026-08-14 | Blocco 3 | Costruito `template-ristorante` (repo autonomo, D1): nove sezioni una per componente, `src/lib/` per tema, informativa versionata, dati strutturati e markdown minimo, `/privacy`, `/cookie`, `favicon.svg` generata dall'iniziale, `sitemap.xml`. Due controlli prima del build: validazione di `content.json` e `check-letterali.mjs` (D19), quest'ultimo corretto due volte dopo averlo provato — ignorava i commenti e, soprattutto, non vedeva il testo fra tag HTML. Tutti e sette i criteri del blocco verificati con build vere, casi negativi inclusi. Scritto il `CLAUDE.md` del template, che chiude la Fase 0.4. |
| 2026-08-14 | Blocco 3 cont. | Abbandonata la dipendenza git verso i pacchetti del monorepo dopo che si è rotta su Windows (pnpm 11 `allowBuilds`, installazione annidata intrecciata con le dipendenze del progetto): sostituita con vendorizzazione in `vendor/` via `file:`. Verificata sulla macchina dell'utente, non solo nel container. Scoperto che la CI di **entrambi** i repo falliva da sempre (`packageManager` mancante per `pnpm/action-setup@v4`) senza che nessuno l'avesse mai guardata su GitHub: corretta, entrambe verdi. Aggiunta la regola «la CI si verifica sul remoto» a entrambi i `CLAUDE.md`. |
| 2026-08-12 | Fase 0.3 | `content.example.json` aggiornato: `leadhub` → `ingestion` con endpoint webhook Make; `azienda.logo: null`; `consenso_privacy: true` in entrambi i form; CTA come unione discriminata (`tipo: form/ancora`); `fonte: "cliente"` su tutti gli oggetti immagine; `hero.sfondo: null` e `cta_finale.sfondo: null`; `prezzo_nota` aggiunto su ogni voce; un secondo con `prezzo: null, prezzo_nota: "s.q."`; `generazione.modello` rimosso; `testimonianze.voci` senza `fonte` esterna. Fase 0 chiusa. |
