# Vetrina — stato di avanzamento

**Aggiornato:** 12 agosto 2026

## Dove siamo

**Fase 0 — Accordo**, passo 0.1 **chiuso**: tutte le decisioni che toccano lo schema (D1–D12, D35, D36) sono decise. Il gate del Blocco 0 è passato.

Restano da fare 0.2 (allineare i due documenti) e 0.3 (aggiornare `content.example.json`), che sono allineamento e non decisione: si fanno nella stessa sessione in cui si scrive lo schema. Nessuna decisione blocca più il Blocco 0.

**Deciso finora:** due repo invece di quattro (D1) · `leadhub` → `ingestion` (D2) · slot decorativi con stock ammesso (D3 → D35/D36) · `prezzo` nullable (D4) · `tag` enum (D5) · `cta.azione` unione discriminata (D6) · logo+favicon (D7) · `consenso_privacy` fisso (D8) · mezzanotte ammessa + 7 giorni (D9) · `variante` come preset (D10) · politica `schema_version` (D11) · `generazione.modello` fuori dal repo cliente (D12).

**Aggiunto dalla revisione esterna:** L33/D37 (il copione di consegna manuale, unica procedura dei primi mesi non specificata) · correzione di L15/D15 (il beacon di click e l'IP) · regola commerciale accanto a D36 (foto minime = eccezione, mai default né demo).

## Blocchi

| Blocco | Stato | Nota |
|---|---|---|
| Fase 0 — Accordo | **chiusa** | 0.1 decisioni ✅ · 0.2 allineamento documenti ✅ · 0.3 esempio aggiornato ✅ · 0.4 CLAUDE.md monorepo fatto (template da fare al Blocco 3) |
| 0 — Schema e validatore | **pronto a partire** | Fase 0 chiusa. Il `content.example.json` aggiornato è il primo input. |
| 1 — Contratto di ingestion | non iniziato | Bloccato da D13–D15 |
| 2 — Componente form | non iniziato | |
| 3 — Template ristorante | non iniziato | |
| 4 — Demo pubblicata | non iniziato | Primo checkpoint reale |
| 5a — Vetrina commerciale | non iniziato | Da qui si contatta gente |
| 6 — Intake guidato | non iniziato | Non prima di aver parlato con clienti reali |
| 7 — Pagamento | non iniziato | |
| 8 — Pipeline fino a preview | non iniziato | |
| 9 — Generazione testi | non iniziato | |
| 10 — Pubblicazione | non iniziato | |
| 11 — Secondo template | non iniziato | |

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
| 2026-08-12 | Fase 0.3 | `content.example.json` aggiornato: `leadhub` → `ingestion` con endpoint webhook Make; `azienda.logo: null`; `consenso_privacy: true` in entrambi i form; CTA come unione discriminata (`tipo: form/ancora`); `fonte: "cliente"` su tutti gli oggetti immagine; `hero.sfondo: null` e `cta_finale.sfondo: null`; `prezzo_nota` aggiunto su ogni voce; un secondo con `prezzo: null, prezzo_nota: "s.q."`; `generazione.modello` rimosso; `testimonianze.voci` senza `fonte` esterna. Fase 0 chiusa. |
