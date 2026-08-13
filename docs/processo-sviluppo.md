# Vetrina — processo di sviluppo

**Data:** 12 agosto 2026
**Scopo:** definire come si lavora, in che ordine, e come si riconosce che un blocco è chiuso. Sostituisce l'ordinamento del §10 del documento di progetto e quello del piano di sviluppo dove i due divergono (vedi `analisi-lacune.md` L2).

---

## 1. Come si lavora, per sessione

Il piano di sviluppo dice «un blocco alla volta». In pratica un blocco è più grande di una sessione, quindi la regola operativa è più fine.

**Ogni sessione:**

1. **Apre** dichiarando il blocco e il pezzo del blocco su cui si lavora.
2. **Legge** `CLAUDE.md` del repo in cui si opera e il criterio "fatto quando" del blocco corrente. Nient'altro va riletto per intero: i documenti servono come riferimento, non come rito.
3. **Lavora** solo su quel pezzo. Se emerge qualcosa che appartiene a un blocco successivo, non si implementa: si scrive in `decisioni-aperte.md` o si annota nel blocco che la ospiterà.
4. **Chiude** con un commit che nomina il blocco (`blocco-0: …`) e con lo stato aggiornato in `stato-avanzamento.md`.

**Se emerge che una decisione del documento di progetto è sbagliata:** fermarsi e segnalarlo, non aggirarla nel codice. È già una regola del piano, e vale in modo particolare per lo schema, dove aggirare significa consolidare.

**Cosa non fa una sessione:** anticipare blocchi, aggiungere funzionalità «utili», o migliorare cose che funzionano. §9 del documento di progetto è vincolante, e «sarebbe utile» non è un criterio.

---

## 2. Che cosa vale come "fatto"

Un blocco è chiuso quando esiste una **prova concreta**, non l'impressione che funzioni. Per ogni blocco la prova ha quattro parti, e mancarne una significa che il blocco è aperto:

| | Parte | Cosa vuol dire |
|---|---|---|
| 1 | **Il criterio del blocco è verificato** | Con il comando, l'URL o lo screenshot che lo dimostra, non con un ragionamento |
| 2 | **Il caso negativo è verificato** | Un blocco che funziona solo con l'input giusto non è finito. Serve la prova che l'input sbagliato viene rifiutato in modo leggibile |
| 3 | **È in CI, se è automatizzabile** | Un controllo che gira solo sulla macchina di chi l'ha scritto smette di girare |
| 4 | **La documentazione è aggiornata** | Lo stato di avanzamento sempre; le decisioni chiuse quando ce ne sono |

La parte 2 è quella che salta per prima sotto pressione, ed è quella che il documento di progetto chiede in modo più insistente: la regola 7 del piano («errori visibili e leggibili, mai fallimenti silenziosi») è verificabile solo provando a rompere le cose.

---

## 3. Fase 0 — Accordo (prima di scrivere codice)

Non è nel piano originale, e serve perché l'analisi ha trovato dodici decisioni che toccano lo schema. Scriverle dopo significa riscriverlo.

| Passo | Cosa | Fatto quando | Stato |
|---|---|---|---|
| 0.1 | Chiudere le decisioni che toccano lo schema (D1–D12, D35, D36) in `decisioni-aperte.md` | Ogni voce ha una risposta e una data | ✅ 2026-08-12 |
| 0.2 | Allineare il documento di progetto: §8 su Lead Hub (L1), §9 sulle pagine legali (L11), §6.5/§4 sugli slot decorativi (L3/D35), §10 sull'ordine (L2) | I due documenti non si contraddicono più su nessun punto | da fare |
| 0.3 | Aggiornare `content.example.json` con le decisioni prese | È il riferimento contro cui il Blocco 0 verifica sé stesso, quindi va aggiornato prima | da fare |
| 0.4 | `CLAUDE.md` per ogni repo | Regole non negoziabili più quelle specifiche del repo | parziale (monorepo fatto) |

**Fase 0 chiusa quando:** 0.1–0.4 sono tutti fatti — cioè nessuna decisione schema resta aperta, i due documenti concordano, e `content.example.json` passa mentalmente lo schema deciso. Solo allora si apre il Blocco 0. Questa riga è la regola di chiusura che mancava: senza, la Fase 0 è l'unica fase del progetto senza un «fatto quando», in un progetto che ha un §13 apposta per non costruire a vuoto.

**Il gate è 0.1, ed è passato.** 0.2 e 0.3 sono lavoro di allineamento, non di decisione: si possono fare nella stessa sessione in cui si scrive lo schema (0.3 diventa di fatto il primo input del Blocco 0). Non c'è più nessuna decisione a bloccare.

**Costo stimato:** una sessione, la maggior parte della quale era decidere, non scrivere. Fatto.

---

## 4. Ordine di costruzione

L'ordine è quello del piano di sviluppo, con l'aggiunta della Fase 0, la divisione del Blocco 5 (L2) e le lacune assegnate al blocco in cui si risolvono. Le colonne "lacune" indicano cosa va incorporato in quel blocco: non sono lavoro aggiuntivo, sono la specifica corretta di quel blocco.

### Fase A — Fondamenta

| Blocco | Cosa | Lacune da incorporare |
|---|---|---|
| **0** | Schema Zod, tipi, validatore CLI, CI | L1 L3 L4 L5 L6 L7 L8 L10 L19 L21 L22 L23 L27 L28 |
| **1** | Contratto di ingestion + webhook Make | L9 L12 |
| **2** | Componente form condiviso | L15 |

**Blocco 0 — fatto quando:** il validatore accetta `content.example.json` aggiornato, e rifiuta con errore leggibile: un campo obbligatorio mancante, un massimo sforato, un minimo non raggiunto, una palette inesistente, una CTA che punta a un form che non esiste, una CTA che punta a una sezione disattivata, una settimana con sei giorni, un `fonte: "stock"`, un major di `schema_version` non supportato. I test coprono tutti i casi e girano in CI su ogni push.

*Nota sul perché i casi negativi sono nove e non quattro:* il piano ne chiedeva quattro perché lo schema era più semplice di quanto l'analisi lo abbia reso. Le validazioni incrociate (CTA → form, CTA → sezione attiva) sono quelle che giustificano Zod invece di un JSON Schema, quindi vanno provate.

**Blocco 1 — fatto quando:** un POST da curl con payload conforme produce una riga completa nello Sheet e una mail; un POST malformato riceve un errore leggibile; un POST oltre il rate limit viene rifiutato; timestamp e IP nella riga sono quelli timbrati dal server e non quelli inviati dal client.

**Blocco 2 — fatto quando:** importato in un progetto Astro vuoto, il componente spedisce al webhook; con la rete staccata mostra un errore e **non perde i dati già inseriti**; un bot che compila l'honeypot viene scartato; un tap su telefono produce un `click_contatto`.

### Fase B — Il primo prodotto

| Blocco | Cosa | Lacune da incorporare |
|---|---|---|
| **3** | Template ristorante | L11 L13 L14 L21 L24 L29 L31 |
| **4** | Demo pubblicata ← **primo checkpoint reale** | L13 L30 |
| **5a** | Vetrina commerciale senza incasso | L16 |
| **5a-bis** | Copione di consegna manuale (non-codice) | L33 D37 |

**Blocco 3 — fatto quando:** cambiando solo il `content.json` esce un sito visibilmente diverso; disattivando `gallery`, `testimonianze`, `chi_siamo`, `orari` e `cta_finale` il layout resta coerente; le pagine `/privacy` e `/cookie` esistono e nessun link del footer è rotto; il build fallisce se il `content.json` non passa il validatore; il build fallisce se `informativa_versione` non esiste nel pacchetto; il check in CI sui letterali passa; nessun cookie di terze parti viene impostato.

**Blocco 4 — fatto quando:** è online con asset locali (lo stesso percorso della consegna), Lighthouse ≥ 90 su performance/accessibilità/SEO — mobile, throttling di default, su tutte le route generate — il form genera una riga reale nello Sheet, e si apre dal telefono senza vergognarsi di mostrarla.

**Da qui in poi vale il presidio del tempo del §14.5, con il numero di ore fissato in D23 prima di arrivare qui.**

**Blocco 5a — fatto quando:** è online, il form funziona, l'analytics registra le visite e Search Console è verificata.

**Da questo punto si inizia a contattare.** L'intake per i primi clienti si fa a mano via email: è lento e va benissimo, perché i primi clienti servono a dire cosa automatizzare. La Fase C prima di aver parlato con qualcuno è il modo in cui il secondo obiettivo del progetto fallisce in silenzio.

**Ma «a mano via email» non vuol dire «senza copione».** L33 mostra che questa è l'unica procedura che si userà davvero nei primi mesi e l'unica non specificata. Prima del primo contatto va scritto il copione di consegna manuale (D37): cosa chiedere sezione per sezione con i minimi dello schema, le domande secche del §6.4, la regola foto/sfondo di L32, il punto di consegna dei consensi, e come si compila e valida il `content.json` a mano. Non è un blocco di sviluppo — è una checklist e due email-tipo — ed è già il materiale di partenza per l'intake del Blocco 6.

### Fase C — Automazione

Non si apre prima di aver parlato con clienti reali. L'ordine interno può cambiare in base a cosa quei clienti dicono: è l'unica fase in cui l'ordine è una previsione e non una decisione.

| Blocco | Cosa | Lacune |
|---|---|---|
| **6** | Intake guidato | L20 |
| **7** | Pagamento | dipende da D20, D30 |
| **8** | Pipeline fino a preview | L18 |
| **9** | Generazione testi | — |

### Fase D — Consolidamento

| Blocco | Cosa | Lacune |
|---|---|---|
| **10** | Pubblicazione e migrazione asset | L13 L18 |
| **11** | Secondo template | L5 L22 |

**Blocco 11 — fatto quando:** è costruito in meno di un quinto del tempo del primo. Se non è così, lo scheletro condiviso non funziona come previsto: fermarsi e rivederlo prima di costruirne altri. Questo criterio è anche la verifica a posteriori di L5 e L22.

---

## 5. Le due tensioni da presidiare, e come

Il documento di progetto ne dichiara una, l'analisi ne ha trovata una seconda. Entrambe si manifestano come deriva lenta, non come errore: per questo servono contatori e non buone intenzioni.

**Tensione 1 — costruire invece di vendere** (§2, §10, §14.5). Presidio: a partire dal Blocco 4, la quota oraria di D23 è un numero fissato prima, e le ore di acquisizione si contano nello stato di avanzamento accanto a quelle di sviluppo. Un numero non registrato diventa zero senza che nessuno lo decida.

**Tensione 2 — allargare lo scopo per completezza tecnica.** Ogni lacuna di questo elenco è una tentazione legittima di aggiungere: gli slot decorativi di L3, le varianti di L22, la propagazione dei difetti di L17. Presidio: le raccomandazioni dell'analisi sono scritte quasi sempre come *«tieni il campo, non costruire il meccanismo»*. Il campo costa una riga, il meccanismo costa un blocco. Quando si è in dubbio, si aggiunge il campo.

---

## 6. File di lavoro e loro ruolo

| File | Ruolo | Chi lo cambia |
|---|---|---|
| `vetrina-documento-progetto.md` | Il vincolo. Si rilegge quando emerge la tentazione di allargare | Solo per decisioni consapevoli, con nota della modifica |
| `vetrina-piano-sviluppo.md` | Il piano originale. Resta come riferimento storico | Non si cambia più: è sostituito da questo documento dove divergono |
| `processo-sviluppo.md` | Questo file. L'ordine e i criteri effettivi | Quando un criterio si rivela sbagliato |
| `analisi-lacune.md` | Le lacune con identificatori stabili `L1`…`L32` | Si aggiunge, non si riscrive |
| `decisioni-aperte.md` | Il registro. Ogni decisione ha uno stato | A ogni decisione presa |
| `stato-avanzamento.md` | Dove siamo, blocco per blocco | A ogni sessione |
| `riferimenti/content.example.json` | Il riferimento concreto dello schema | Quando lo schema cambia, nello stesso commit |
| `CLAUDE.md` | Le regole che valgono su ogni sessione | Raramente |
