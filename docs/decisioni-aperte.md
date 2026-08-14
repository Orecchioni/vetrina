# Vetrina — decisioni aperte

**Aggiornato:** 12 agosto 2026

Registro unico delle decisioni non ancora prese. Include le sei già dichiarate in §15 del documento di progetto e quelle emerse dall'analisi delle lacune.

**Regola d'uso:** una decisione si chiude scrivendo qui la risposta con la data, e aggiornando il documento di progetto se ne cambia una parte. Se durante lo sviluppo emerge che una decisione presa è sbagliata, si aggiunge qui invece di aggirarla nel codice (regola del piano di sviluppo).

**Stati:** `aperta` · `decisa` · `rinviata` (con il blocco entro cui va ripresa)

---

## Bloccano il Blocco 0 (schema) — ✅ tutte chiuse il 2026-08-12

Queste vanno chiuse prima di scrivere lo schema, perché lo schema è la cosa più costosa da cambiare dopo la prima consegna. **D1–D12, D35, D36 sono chiuse: il Blocco 0 è sbloccato.** Le raccomandazioni sono state accettate come scritte; l'unica con margine di aggiustamento è D5 (set dei `tag`), che è un enum e cresce con un minor senza rompere nulla.

| # | Decisione | Rif. | Raccomandazione | Stato |
|---|---|---|---|---|
| D1 | Struttura dei repo: quattro separati come da piano, o due (monorepo di sviluppo + repo template autonomo) | — | **Due repo** — monorepo pnpm con `vetrina-schema` + `vetrina-form` + `vetrina`, e `template-ristorante` come repo autonomo e *GitHub template repository*. Il vincolo del piano resta soddisfatto: il cliente riceve una copia del repo template, non del monorepo. | **decisa 2026-08-12** |
| D2 | Rinominare `leadhub` → `ingestion` nel `content.json` | L1 | **Sì, ora.** `tenant_id`, `endpoint`, `informativa_versione` restano identici. Va aggiornato §8 del documento di progetto. | **decisa 2026-08-12** |
| D3 | Immagini stock: nessuna in v1, oppure aggiungere slot decorativi | L3 | **Aggiungere slot decorativi**, dove lo stock è ammesso. Il campo `fonte` entra nello schema con un `refine` che ammette `stock` solo su quegli slot e lo rifiuta su tutti gli altri. Vedi D35 per quali slot. §6.5 resta valido come scritto. | **decisa 2026-08-12** |
| D4 | `prezzo` nullable con `prezzo_nota` | L5 | **Sì.** `prezzo: string \| null` con regex sul formato italiano quando presente; `prezzo_nota: string \| null` (max ~24 caratteri). Il template non rende nulla quando entrambi sono assenti e il layout resta corretto. | **decisa 2026-08-12** |
| D5 | `tag` come enum chiuso, set iniziale | L6 | **Enum chiuso**, set iniziale `vegetariano`, `vegano`, `senza_glutine`, `piccante`, `stagionale`, `surgelato`, con etichette e icone nel template. ⚠️ *L'unica decisione di questo gruppo con una componente di contenuto: il set è specifico del verticale. Chiuso col default; si allarga con un minor di schema quando serve, senza rompere nulla.* | **decisa 2026-08-12** |
| D6 | `cta.azione` come unione discriminata `form`/`ancora`/`tel`/`whatsapp` | L7 | **Sì.** Validazioni incrociate nel Blocco 0: `form_id` deve esistere in `forms[]`; `sezione` deve puntare a una sezione **attiva**; `whatsapp` richiede `azienda.whatsapp` presente, `tel` richiede `azienda.telefono`. | **decisa 2026-08-12** |
| D7 | Aggiungere `azienda.logo` e la favicon | L8 | **Sì**, logo opzionale (con `alt`), favicon derivata. Il template gestisce l'assenza componendo il nome con la coppia di font. | **decisa 2026-08-12** |
| D8 | `consenso_privacy` come letterale fisso nello schema | L10 | **Sì**, letterale `true`. Invariante reso visibile, non configurazione. | **decisa 2026-08-12** |
| D9 | Fasce orarie che scavalcano la mezzanotte: ammesse o vietate | L21 | **Ammesse.** Più i vincoli di L21: sette giorni esatti in ordine fisso, fasce ordinate e non sovrapposte. | **decisa 2026-08-12** |
| D10 | Semantica di `variante` | L22 | **Preset di *(lessico + sezioni attive di default)*.** In v1 un solo valore per `template.id`. Il campo si tiene, l'astrazione non si costruisce finché non ci sono due varianti reali. | **decisa 2026-08-12** |
| D11 | Politica di compatibilità di `schema_version` | L23 | **Sì**: il template dichiara il major supportato, il validatore rifiuta un major diverso con errore leggibile, i repo cliente non si migrano mai. | **decisa 2026-08-12** |
| D12 | Togliere `generazione.modello` dal `content.json` consegnato | L19 | **Sì**: nel repo cliente restano `data`, `revisione`, `input_hash`. Il modello resta nel log della pipeline. | **decisa 2026-08-12** |
| D35 | Quali sono esattamente gli slot decorativi introdotti da D3 | D3, L3 | **Due slot immagine, nessuna sezione nuova**, per non toccare l'ordine fisso del §4: `hero.sfondo` e `cta_finale.sfondo`, entrambi opzionali, entrambi con `stock` ammesso. `tema.texture` rimandato: campo a costo basso ma lavoro di CSS per palette, inutile finché non lo chiede un cliente. | **decisa 2026-08-12** |
| D36 | Se `hero.sfondo` da solo basta a rendere l'hero, cioè se un cliente senza foto proprie può completare l'intake | D3, L32 | **Sì come capacità** (`refine`: almeno uno fra `hero.immagine` e `hero.sfondo`), **no come default**. La regola commerciale accanto — eccezione da concedere, mai opzione da offrire, mai per una demo — vive in L32 e nel copione di consegna (D37), non nello schema. | **decisa 2026-08-12** |

## Prese nel Blocco 0 per scrivere lo schema — da confermare

Scrivere lo schema ha richiesto di fissare valori che nessuna decisione precedente nominava. Sono tutti **enum o numeri**, cioè una riga in `costanti.ts` o in un `min`/`max`: cambiarli prima della prima consegna non costa niente. Sono raccolti qui invece che dispersi nel codice perché un valore inventato che nessuno ha guardato è il modo in cui una decisione si prende da sola.

| # | Cosa è stato fissato | Valore | Da confermare quando |
|---|---|---|---|
| D38 | Numero di palette e coppie di font | 4 palette (`palette_1`…`palette_4`), 3 coppie (`font_1`…`font_3`) | Blocco 3: §6.2 dice «3-4 palette e 2-3 coppie», il numero esatto lo decide chi le disegna |
| D39 | Valori di `tema.tono` | `familiare`, `professionale`, `contemporaneo` | Blocco 3. §6.2 dice «2-3 per categoria»: se il tono è per categoria e non globale, questo enum va ripensato |
| D40 | Limiti di `meta.title` e `meta.description` | title 10-60, description 50-160 caratteri | Blocco 4, contro il punteggio SEO reale di Lighthouse |
| D41 | Formato di `informativa_versione` | `AAAA-MM-vN`, dedotto dall'esempio | Blocco 1, insieme al contratto di ingestion |
| D42 | `meta.lingua` è il letterale `it-IT` | letterale, non enum | Regge finché il multilingua resta fuori scope (§9). Se cade quel vincolo, cade questo |
| D43 | Massimo di fasce orarie per giorno | 4 | Quando un cliente reale ne chiede una quinta |

Non sono in questo elenco, perché discendono da decisioni già prese e non da una scelta libera: `azienda.telefono` e `whatsapp` annullabili (servono a rendere verificabili le CTA `tel`/`whatsapp` di D6), `azienda.piva` annullabile (D20 è aperta e la P.IVA non c'è), la tabella `TEMPLATE_VARIANTI` (è D10 resa eseguibile).

## Bloccano il Blocco 1 (contratto di ingestion) — ✅ tutte chiuse il 2026-08-13

| # | Decisione | Rif. | Raccomandazione | Stato |
|---|---|---|---|---|
| D13 | Chi timbra `timestamp` e `ip` dei consensi | L9 | **Il server.** Il client invia i booleani e la versione dell'informativa mostrata. Era già normativa nella regola 8 di `CLAUDE.md`: qui si formalizza nel contratto, non si decide da capo. | **decisa 2026-08-13** |
| D14 | Anti-abuso sull'endpoint pubblico: rate limit, dimensione massima, endpoint per tenant | L12 | **Tutti e tre.** Rate limit **5 richieste ogni 10 minuti per IP**; payload massimo **10 KB**; **endpoint per tenant** è già soddisfatto strutturalmente — ogni `content.json` porta il proprio `ingestion.endpoint`, quindi un abuso su un sito non tocca gli altri per costruzione, non per configurazione aggiuntiva. Numero **deciso**, implementazione del rate limit **rimandata**: richiede un Data Store e una logica a finestra temporale sullo scenario Make, non ancora costruita — non blocca nulla finché l'endpoint non è incorporato in un sito pubblico (Blocco 4). | **decisa 2026-08-13 · da implementare prima del Blocco 4** |
| D15 | Beacon di click su `tel:` e WhatsApp, e come tratta l'IP | L15 | Sì, `tipo: "click_contatto"`. **Correzione:** il beacon non timbra né conserva l'IP — è un contatore aggregato per sezione, non una riga con provenienza. Così resta vero che non serve consenso, senza dover ampliare l'informativa per un contatore. | **decisa 2026-08-13** |

## Bloccano il Blocco 3 (template) — ✅ tutte chiuse il 2026-08-13

| # | Decisione | Rif. | Raccomandazione | Stato |
|---|---|---|---|---|
| D16 | Asset: il template accetta URL remoti e percorsi locali dal primo giorno | L13 | **Sì**, e la demo del Blocco 4 usa asset locali per misurare il profilo consegnato. | **decisa 2026-08-13** |
| D17 | Mappa statica invece dell'iframe | L14 | **Statica.** Nessun cookie di terze parti in tutto il sito, quindi nessun banner da progettare. | **decisa 2026-08-13** |
| D18 | Pagine `/privacy` e `/cookie` come eccezione dichiarata a §9, testo versionato nel pacchetto | L11 | **Sì**, con build che fallisce se `informativa_versione` non esiste nel pacchetto. | **decisa 2026-08-13** |
| D19 | Check in CI contro i letterali di contenuto nel sorgente | L24 | **Sì.** Mezz'ora per rendere vincolo la regola numero uno. | **decisa 2026-08-13** |

## Emerse dal Blocco 3-bis (secondo template)

| # | Decisione | Rif. | Raccomandazione | Stato |
|---|---|---|---|---|
| D45 | `azienda.social` conteneva `tripadvisor` come chiave fissa e nessun `linkedin` | D44, regola «campo, non meccanismo» | **Aggiunto `linkedin`.** Il buco è emerso al primo verticale non-ristorante: per uno studio legale LinkedIn è l'unico social che conta, Instagram e TripAdvisor quasi mai. Aggiunto `linkedin: urlPubblico.nullable()` in `azienda.ts`, propagato a `content.example.json`, al `content.json` di `template-ristorante` (`null`) e al `Footer.astro` di **entrambi** i template — il campo nello schema senza il rendering nel componente è una mezza modifica, e infatti il primo build lo ha mostrato: LinkedIn valorizzato e footer vuoto. **Non** si è costruito un meccanismo di social generici (lista di `{rete, url}`): con quattro reti note il costo di un campo è una riga, quello di un meccanismo è un blocco. Si rivedrà se un verticale futuro chiede una quinta rete. | **decisa 2026-08-14** |

**Non è stato necessario toccare lo schema per:** `voce.tag` (D5, enum di attributi alimentari) — resta vuoto nei verticali non alimentari, lo schema non impone di popolarlo; `template.id`/`categoria_attivita` — già distinti (D44); le nove sezioni e il componente form — invariati. `TEMPLATE_VARIANTI` si estende di una riga per template, come previsto da D10: non è una modifica di struttura, è il registro che fa il suo lavoro.

## Bloccano il Blocco 5 (vetrina commerciale)

| # | Decisione | Rif. | Raccomandazione | Stato |
|---|---|---|---|---|
| D20 | **P.IVA** — dichiarata bloccante in §15 | §15, L2 | Con il nuovo ordine serve al Blocco 5, non al 9. Vedi D21: si può iniziare a contattare senza. | aperta |
| D21 | Blocco 5 senza incasso (prezzo esposto + richiesta) o con checkout | L2 | Senza incasso. Tiene vivo il secondo obiettivo del progetto mentre la decisione fiscale matura, invece di farlo dipendere da essa. | aperta |
| D22 | Analytics senza cookie + Search Console | L16 | Sì, nel Blocco 5. Senza, la §13 non è applicabile alla data di verifica. | aperta |
| D23 | Quota oraria dedicata all'acquisizione | §14.5 | Da fissare come numero prima del Blocco 4, non dopo. §14.5 dice perché: senza un numero deciso prima, diventa zero. | aperta |
| D24 | Fotografo esterno individuato | L32, §14.2 | Prima del Blocco 5. È insieme un add-on e il miglior canale di partnership disponibile. | aperta |
| D25 | Nomina a responsabile del trattamento nel contratto + responsabili reali nell'informativa | L26 | Prima della prima consegna. Si lega a D20. | aperta |
| D26 | Riga di contratto sulla provenienza delle testimonianze | L25 | Prima della prima consegna. | aperta |
| D27 | **Nome del prodotto** | §15 | Serve al Blocco 5 (dominio, vetrina). | aperta |
| D37 | Copione di consegna manuale per i primi clienti | L33 | Artefatto non-codice (checklist + email-tipo) dovuto **dopo il Blocco 5a e prima del primo contatto**. È l'unica procedura che si userà davvero nei primi mesi, e scriverla ora è già materiale per l'intake del Blocco 6. | aperta |
| D44 | Numero di template pronti prima di aprire il Blocco 5a, e come si organizzano per etichetta | §6.1, §10 nota di realismo | **Circa dieci-dodici**, non uno. Divergenza esplicita dalla nota di realismo del §10, che assumeva il lancio con un solo template. **Due campi distinti, già nello schema, nessuna modifica necessaria:** `template.categoria_attivita` è l'**etichetta** che la domanda filtro del §6.1 usa per proporre template adatti (dieci etichette al lancio: ristorante, studio dentistico, parrucchiere...); `template.id` è lo **skeleton specifico**. Più `template.id` possono condividere la stessa `categoria_attivita` — è già così che funziona `variante` (D10) a un livello più fine, qui si applica a livello di template intero: la maggior parte delle etichette ha un solo template al lancio, un paio ne hanno due (design visivi diversi), altri arriveranno dopo. Motivo tecnico oltre a quello commerciale: con una sola etichetta disponibile la domanda filtro non sarebbe una domanda — è una formalità senza scelta. Il meccanismo del sito commerciale ha bisogno di più etichette per avere senso. Ogni template one-page è lavoro da un pomeriggio (esperienza diretta dell'utente), quindi il costo non è quello che la nota di realismo temeva (mesi di sviluppo senza vendere). **Presidio tenuto:** il Blocco 3-bis ("costruito in meno di un quinto del tempo del primo, altrimenti fermarsi") si esegue sul **secondo** template, subito dopo il primo — non alla fine dei dieci-dodici. Non per aprire le vendite prima, ma perché se lo scheletro condiviso non regge su un verticale diverso dal ristorante, conviene scoprirlo al secondo pomeriggio e non al decimo. | **decisa 2026-08-13** |

## Rinviabili, con scadenza

| # | Decisione | Rif. | Entro | Stato |
|---|---|---|---|---|
| D28 | Hosting e DNS del sito consegnato: tuo account o del cliente | L18 | Blocco 8 | rinviata |
| D29 | Upload dell'intake diretto a Supabase con URL firmato | L20 | Blocco 6 | rinviata |
| D30 | Provider di pagamento | §15 | Blocco 7 | rinviata |
| D31 | Verticale definitivo | §15 | Dopo i primi contatti reali | rinviata |
| D32 | Data di verifica e soglia numerica per la regola di abbandono | §13, §15 | Prima del Blocco 5 | rinviata |
| D33 | Propagazione dei difetti ai siti già consegnati: accettare o script | L17 | Dopo ~10 consegne | rinviata |
| D34 | Dati strutturati `schema.org` | L21 | Blocco 3 | rinviata |
