# Vetrina — documento di progetto

**Stato:** fine fase di ideazione, pronto per lo sviluppo
**Data:** 12 agosto 2026
**Scopo:** fissare cosa si costruisce, cosa non si costruisce, e in che ordine. Non è documentazione tecnica: è il vincolo di progetto da rileggere ogni volta che emerge la tentazione di allargare.

---

## 1. Cos'è

Un sito vetrina che vende siti one-page standardizzati per categorie di PMI italiane, con un processo di personalizzazione guidato e una pipeline di generazione automatizzata.

Il cliente sceglie una categoria di attività, seleziona un template, viene guidato nel caricamento dei contenuti sezione per sezione, e riceve un sito pubblicato.

**Posizione nel percorso:** è il progetto zero. Ha due obiettivi dichiarati, in quest'ordine:

1. **Generare contatti** nel segmento PMI corretto, per l'upsell futuro di middleware, CRM e consulenza
2. **Apprendimento operativo** dell'integrazione che in futuro verrà venduta ai clienti

Il fatturato è un obiettivo terziario. Le decisioni si prendono in questo ordine di priorità.

**Cosa non è, in modo vincolante:**

- **Non è un site builder.** Il cliente non modifica il sito. Riceve un prodotto finito.
- **Non è un marketplace di temi.** Non si vendono file ad altri sviluppatori.
- **Non vende integrazione.** Middleware, CRM e automazioni non sono nell'offerta. Non si vendono competenze in fase di affinamento.
- **Non è un'agenzia.** Scopo chiuso, prezzo esposto, revisioni contate.

**La regola che lo governa:** i siti nascono *predisposti* all'integrazione, non *integrati*. La predisposizione costa zero oggi e rende l'upgrade un'accensione invece che una ricostruzione.

---

## 2. Coerenza col documento fondativo

| Vincolo | Come è rispettato |
|---|---|
| **V1 — one man company** | Generazione automatizzata, scopo chiuso, revisioni contate, nessuna modifica post-consegna inclusa |
| **V2 — solo clienti italiani** | Target: PMI italiane, contenuti e interfaccia in italiano |
| **V4 — un solo cantiere attivo** | È il cantiere attivo. Lead Hub ne è il backend, non un secondo progetto |
| **Livello 1** | Genera i primi contatti del nucleo consulenziale |
| **Livello 3.1** | I template e il sistema di consegna sono l'asset riusabile, non il prodotto venduto |
| **§3 domanda-filtro** | Si costruisce per servire i clienti e per imparare ciò che si venderà: entrambi i lati giusti della linea |

**Tensione dichiarata:** imparare spinge a costruire, generare contatti spinge a vendere. Se non è governata, si costruisce per mesi senza parlare con nessuno. Va presidiata esplicitamente nel §10.

---

## 3. Principi architetturali

Tre principi non negoziabili.

1. **I template sono data-driven.** Nessun contenuto nel codice. Ogni template legge tutto da `content.json` con schema fisso. Un solo template con testi hardcoded elimina l'automazione e la retrofittatura non è viabile.

2. **Scheletro di sezioni condiviso.** I template non sono siti diversi: sono configurazioni dello stesso oggetto. Cambiano lessico, blocchi attivi e stile — non la struttura. Un template nuovo è una configurazione, non un progetto.

3. **Il componente form è unico e condiviso.** Un solo pacchetto Astro importato da tutti i template, con la logica di invio verso Lead Hub. Il template decide quali campi mostrare, mai come si inviano. Cinque template non devono diventare cinque integrazioni da mantenere.

---

## 4. Modello dati — `content.json`

Struttura di primo livello:

```
schema_version      versione dello schema, per le migrazioni future
template            id, variante, categoria_attivita
tema                palette, coppia_font, tono
azienda             nome, claim, contatti, indirizzo con lat/lng, social, piva
meta                title, description, og_image, lingua
leadhub             tenant_id, endpoint, informativa_versione
forms[]             id, sorgente, campi_standard, campi_extra[], consenso_marketing
sezioni{}           vedi tabella
video               attivo, url, posizione, poster
generazione         data, modello, input_hash, revisione
```

### Sezioni — ordine fisso, disattivabili

| # | Sezione | Contenuto | Disattivabile |
|---|---|---|---|
| 1 | `hero` | titolo, sottotitolo, immagine, 2 CTA | no |
| 2 | `chi_siamo` | titolo, testo, immagine | sì |
| 3 | `servizi` | titolo, `gruppi[]` → `voci[]` con nome, descrizione, prezzo, tag | no |
| 4 | `gallery` | titolo, `immagini[]` | sì |
| 5 | `testimonianze` | titolo, `voci[]` con autore, testo, valutazione, fonte | sì |
| 6 | `orari` | `settimana[]` con giorno, chiuso, fasce[], nota | sì |
| 7 | `mappa_contatti` | titolo, mostra_mappa, form_id | no |
| 8 | `cta_finale` | titolo, testo, cta | sì |
| 9 | `footer` | social, piva, link legali | no |

L'ordine è fisso. Non esiste riordinamento: è la richiesta che trasforma il prodotto in un builder.

La struttura `servizi → gruppi → voci` è ciò che unifica i verticali. Un ristorante ha 6 gruppi (antipasti, primi…), uno studio dentistico ne ha 1. Stesso schema.

### Minimi e massimi

| Blocco | Min | Max |
|---|---|---|
| Gruppi in `servizi` | 1 | 6 |
| Voci per gruppo | 3 | 12 |
| Immagini gallery | 6 | 20 |
| Testimonianze | 0 | 6 |

I minimi contano più dei massimi: sotto soglia la sezione appare vuota e il sito sembra fatto male — colpa percepita del fornitore, non del cliente. L'intake blocca l'invio sotto il minimo.

### Campi extra dei form

`campi_extra` è JSONB su `contacts` in Lead Hub, con vincoli:

- **Whitelist dichiarata nel `content.json`.** L'Edge Function accetta solo le chiavi previste per quel form e scarta il resto.
- **Solo visualizzazione.** Mai filtro, ordinamento, aggregazione o indice.
- **Etichette nel template, non nel dato.**
- **Massimo 5 campi per form.**
- **`events.payload` resta la fonte di verità.** `campi_extra` è una copia per la inbox.

Chi definisce lo schema è il template, non il cliente. È questo che separa il prodotto dal database generico.

---

## 5. Flusso di generazione

```
Vetrina (Astro/Netlify)
   │  selezione categoria → selezione template
   ▼
Intake guidato
   │  contenuti, media, tema, tono
   ▼
Make
   ├─ 1. crea tenant su Lead Hub → tenant_id (attivo: false)
   ├─ 2. API Claude: struttura testi, genera meta SEO e alt text
   ├─ 3. upload asset su Cloudinary
   ├─ 4. compone content.json conforme allo schema
   ├─ 5. API GitHub: crea repo da template, committa content.json
   └─ 6. Netlify: build → URL di preview
   ▼
Revisione umana ──── obbligatoria in v1
   ▼
Pubblicazione
   ├─ asset scaricati dallo storage nel repo
   ├─ tenant Lead Hub → attivo: true
   └─ consegna al cliente
```

**La pubblicazione resta manuale in v1.** Il rischio non è tecnico: è che esca online un sito brutto con il tuo nome sopra. Il passaggio umano si toglie dopo ~30 consegne, quando sono noti i casi che si rompono.

**Gli asset migrano nel repo alla pubblicazione.** Storage durante la lavorazione, repo alla consegna. Il cliente resta proprietario di un sito completo che non dipende da un servizio che paghi tu. Coerente con l'assenza di lock-in del Lead Hub.

---

## 6. Requisiti funzionali

### 6.1 Vetrina

- Home con proposta di valore e prezzo esposto
- Domanda filtro: *"Che tipo di attività hai?"* → selezione di template adatti
- Pagina template con demo navigabile reale, non screenshot
- Pagina prezzi con cosa è incluso e cosa no
- Form di contatto (collegato a Lead Hub, tenant proprio)

### 6.2 Intake guidato

Il pezzo di valore reale del prodotto. Nessuno risolve il fatto che il cliente non sa cosa deve consegnare.

**Implementazione: Astro Actions.** Validazione server-side su ogni step — coerente con il principio di predisposizione — e persistenza della sessione senza costruire un'API a mano.

- Multi-step, uno step per sezione, con anteprima della zona che si sta compilando
- Etichette contestuali per categoria (*"foto del locale"* invece di *"foto dello studio"*)
- **Crop nel browser** con rapporto d'aspetto imposto dal template. Il crop non si fa a valle.
- Validazione su minimi, formati, dimensioni — a ogni step, mai tutta alla fine
- Scelta tema: 3-4 palette e 2-3 coppie di font preapprovate, mostrate come anteprima. Il cliente sceglie una combinazione, mai un valore esadecimale.
- Scelta tono: 2-3 per categoria, con esempio di testo mostrato accanto

**Sessione e ripresa**

- Email richiesta al **primo** step, non all'ultimo: genera il link di ripresa e costituisce comunque un lead acquisito anche se l'intake non viene completato
- `session_id` persistente, link di ripresa inviato via email
- Salvataggio progressivo a ogni step completato

**Storage durante l'intake: Supabase Storage**, bucket `intake` sul progetto già esistente del Lead Hub. Costo marginale zero — il progetto Pro è già pagato e lo storage rientra nella quota inclusa. RLS per `session_id`. Job `pg_cron` che cancella dopo 7 giorni tutto ciò che non è stato completato.

Cloudinary interviene solo a valle, sulle immagini finali della preview — mai sul grezzo dell'intake, che altrimenti brucia il free tier con le sessioni abbandonate.

### 6.3 Pagamento

**30% all'ordine, prima dell'intake. 70% alla pubblicazione.**

L'acconto anticipato non è una scelta commerciale ma di prodotto: l'intake richiede ~40 minuti di lavoro al cliente e senza denaro versato il tasso di abbandono rende la pipeline inutilizzabile.

Il saldo si incassa **prima** della pubblicazione, non dopo: si consegna un sito online, e a pubblicazione avvenuta la leva è persa.

La rassicurazione "vedo prima di pagare" è coperta dalle demo pubbliche navigabili e dalle demo su cliente reale (§14.1), non dall'esposizione del lavoro.

### 6.4 Generazione testi

Il cliente fornisce **materiale grezzo** — anche disordinato, incollato dal vecchio sito o da Google Business — più 3-4 risposte secche (da quando siete aperti, cosa vi distingue, chi è il cliente tipo). Claude struttura e ottimizza in chiave SEO.

Vincolo: **nessun fatto inventato.** Anni di attività, specialità, premi e numeri provengono solo dall'input. L'ottimizzazione è di forma e struttura, non di sostanza.

Meta title, description e alt text sono generati.

### 6.5 Cliente senza contenuti adeguati

È il modo più probabile in cui il processo si blocca. Va previsto, non improvvisato.

**Immagini stock ammesse solo su:** sfondi, texture, sezioni di atmosfera, elementi decorativi.

**Mai su:** prodotti, piatti, persone, interni del locale, staff. Una foto stock di un piatto è una bugia visiva che il cliente finale riconosce, e il danno di credibilità ricade sul sito consegnato.

**Procedura:**

- L'intake propone lo stock solo dove ammesso, mostra l'immagine e richiede conferma esplicita
- La scelta viene registrata nel `content.json` (`fonte: "stock"` sull'immagine), per evitare la contestazione a consegna avvenuta
- Se mancano le foto del locale o dei prodotti, l'unica strada è l'**add-on servizio fotografico** con fotografo esterno, quotato a parte

L'add-on fotografico è anche un canale: chi fotografa ristoranti conosce ristoratori. Vedi §14.

### 6.6 Revisione e consegna

- Preview su URL temporaneo
- Numero di revisioni definito e scritto nel preventivo
- Pubblicazione su dominio del cliente

---

## 7. Requisiti non funzionali

### Predisposizione all'integrazione — non negoziabile

Ogni sito generato, anche senza automazioni vendute:

1. **Form strutturato**, campi tipizzati e separati, mai un unico campo messaggio
2. **Invio a endpoint Lead Hub**, mai a mailto o form nativo Netlify
3. **Ogni submission conservata**, con storico
4. **Tracciamento provenienza**: pagina di origine e parametri UTM in campi nascosti
5. **Consensi separati** privacy/marketing, con timestamp, IP e versione dell'informativa

Il punto 5 è l'unico non recuperabile a posteriori. Contatti raccolti senza consenso marketing valido non sono utilizzabili, e l'upsell previsto non esiste.

### Qualità dell'output

- Lighthouse ≥ 90 su performance, accessibilità e SEO su ogni template
- Immagini servite in formati moderni con dimensioni corrette
- Mobile-first
- Nessun sito esce senza revisione umana in v1

### Continuità

- Il repo del cliente contiene tutto il necessario a ricostruire il sito
- Rigenerazione possibile modificando `content.json` e rifacendo il build

---

## 8. Contratto di ingestion

Lead Hub non esiste ancora. Il destinatario attuale è un webhook Make che riceve il payload, scrive una riga su Google Sheet e manda una notifica email. Quando Lead Hub esisterà, cambia l'URL nel `content.json` — nessuna modifica al codice.

**Il vincolo non è il destinatario: è il contratto.** Il payload ha una forma fissa, definita per intero in [`docs/riferimenti/contratto-ingestion.md`](riferimenti/contratto-ingestion.md) (Blocco 1, D13–D15), e quella forma vale indipendentemente da dove finisce. Questo è ciò che rende il cambio di destinatario un'operazione di configurazione e non di riscrittura.

In sintesi, il contratto fissa:

- Campi standard: nome, email, telefono, messaggio — almeno uno fra email e telefono
- `campi_extra`: solo le chiavi in whitelist per quel form, massimo 5, scartato il resto
- Consensi: privacy e marketing separati, booleani inviati dal client; **timestamp e IP timbrati dal server**, mai dal client
- Provenienza: `sorgente` dichiarata dal form, pagina di origine, parametri UTM
- Il testo dell'informativa vive nel template con un numero di versione. Se cambia, cambia la versione — non si sovrascrive.
- Anti-abuso: 5 richieste ogni 10 minuti per IP, payload massimo 10 KB, isolamento per tenant strutturale (ogni sito ha il proprio endpoint)
- Il beacon di click su `tel:`/WhatsApp non timbra né conserva l'IP: è un contatore aggregato, non una submission

La chiave nel `content.json` è `ingestion` (non `leadhub`): `tenant_id`, `endpoint`, `informativa_versione`.

---

## 9. Fuori scope — esplicito e vincolante

Non nel backlog. Non "più avanti". Fuori.

**Eccezione dichiarata:** le pagine `/privacy` e `/cookie` sono adempimenti legali obbligatori, non contenuto. Sono incluse nel prodotto e non violano il vincolo seguente.

- Siti multipagina
- Modifica del sito da parte del cliente
- Riordinamento delle sezioni
- Colori e font liberi (solo combinazioni preapprovate)
- E-commerce, prenotazione con disponibilità reale, pagamenti
- Multilingua
- Blog e CMS
- Vendita dei template come file ad altri sviluppatori
- Middleware, CRM e automazioni nell'offerta commerciale
- Pubblicazione completamente automatica senza revisione
- Area riservata cliente sulla vetrina

**Regola di ingaggio:** "sarebbe utile" non è un criterio. Il criterio è: completa un ciclo già aperto nel disegno, oppure risolve un bisogno espresso da un cliente reale.

---

## 10. Ordine di costruzione

L'ordine effettivo è nel `processo-sviluppo.md`. Qui la versione aggiornata rispetto alla stesura originale.

| # | Passo | Fatto quando |
|---|---|---|
| 0 | Schema `content.json` + validatore | Un JSON malformato viene rifiutato con errore leggibile; il validatore gira in CI |
| 1 | Contratto di ingestion + webhook Make | Un POST conforme produce una riga nello Sheet e una mail |
| 2 | Componente form condiviso | Un POST dal componente arriva al webhook con consensi e UTM corretti |
| 3 | Template ristorante, data-driven | Il sito si costruisce interamente da `content.json`, zero contenuto nel codice |
| 4 | Demo pubblicata ← **primo checkpoint reale** | La demo è online, Lighthouse ≥ 90, il form genera un lead reale |
| 5a | Vetrina commerciale senza incasso | Prezzo esposto, demo navigabile, form funzionante — **non richiede P.IVA** |
| 5b | Vetrina con checkout | Richiede P.IVA e provider di pagamento. In sospeso finché la P.IVA non è aperta. |
| 6 | Intake guidato | Un utente esterno completa l'intake senza spiegazioni e produce un JSON valido |
| 7 | Pagamento | L'acconto sblocca l'intake; il saldo sblocca la pubblicazione. Dipende da 5b. |
| 8 | Pipeline Make fino a preview | Un intake completo produce un URL di preview senza intervento manuale |
| 9 | Generazione testi via API Claude | I testi prodotti sono usabili senza riscrittura nell'80% dei casi |
| 10 | Migrazione asset e pubblicazione | Un sito pubblicato non dipende più dallo storage esterno |
| 11 | Secondo template | Costruito riusando lo schema, in meno di un quinto del tempo del primo |

**Il passo 4 è il primo punto di verifica reale.** Da lì esiste qualcosa da mostrare, e da lì in poi va tenuta attiva una quota di tempo sull'acquisizione.

**Sul 5a vs 5b:** la vetrina senza incasso (5a) si costruisce subito dopo la demo. Il checkout (5b) si aggiunge quando la P.IVA è aperta. I primi clienti si gestiscono a mano nel frattempo — l'intake per loro è una checklist via email, non un sistema automatizzato.

**Nota di realismo:** con ~10 ore/settimana i passi 0-4 sono questione di settimane. I passi 0-4 più 5a costituiscono già un asset utile e vendibile: un template data-driven, una demo online, una vetrina con prezzo esposto e un modo di consegnare a mano.

---

## 11. Stack

| Strato | Scelta | Motivo |
|---|---|---|
| Template e vetrina | Astro | Performance, output statico, stack già in uso |
| Deploy | Netlify | Build da GitHub, deploy preview nativi |
| Versionamento | GitHub | Repo per cliente creato via API da template repo |
| Automazione | Make | Motore della pipeline, coerente col percorso Solution Partner |
| Generazione testi | API Claude | Chiamata da dentro Make, output JSON |
| Storage intake | Supabase Storage | Bucket dedicato, costo marginale zero. Pulizia via pg_cron a 7 giorni |
| Storage asset finali | Cloudinary | Crop, formati moderni, resize. Temporaneo: gli asset migrano nel repo alla pubblicazione |
| Raccolta contatti | Webhook Make → Google Sheet | Destinazione attuale. Quando esisterà Lead Hub, cambia solo l'URL in `content.json` |

---

## 12. Economia

**Costi fissi:** dominio, Cloudinary free tier iniziale, Netlify free, API Claude a consumo (pochi centesimi per sito). Sotto i $20/mese finché i volumi sono bassi.

**Nota strutturale:** Astro su Netlify ha margine infrastrutturale nullo. Il ricorrente non nasce qui — nasce a valle, sul Lead Hub e sulle automazioni. Questo prodotto serve a **generare i contatti giusti**, non a produrre MRR.

**Conseguenza sul prezzo:** non si compete al ribasso. Un cliente acquisito a prezzo basso è un contatto che non comprerà mai il middleware, quindi fallisce l'obiettivo primario del progetto. Il prezzo è uno strumento di filtro.

### Listino

| Fase | Prezzo | Note |
|---|---|---|
| Primi 1-2 clienti | 350€ o gratuito | In cambio di testimonianza scritta e permesso d'uso come caso studio. Non è sconto: è acquisto di materiale di vendita. |
| Prezzo di lancio | **690€** | Dichiarato come tale — "primi cinque clienti" |
| Prezzo a regime | **990€** | |
| Pavimento assoluto | 500€ | Sotto questa soglia il cliente non è nel segmento di upsell |

**Incluso:** template a scelta, personalizzazione guidata, ottimizzazione testi e SEO on-page, 2 revisioni, pubblicazione, consegna in 7 giorni lavorativi dalla ricezione completa dei contenuti.

**Non incluso, quotato a parte:** servizio fotografico, dominio, revisioni oltre la seconda, modifiche post-consegna, contenuti aggiuntivi.

**Perché il prezzo iniziale è basso:** non perché il prodotto valga poco, ma perché mancano portfolio, recensioni e P.IVA. Il prezzo di lancio compra credibilità non ancora accumulata. Termini di paragone reali: agenzia locale 1.500-3.000€ in due mesi, freelance marketplace 300€ con WordPress lento, Wix 20€/mese ma il sito se lo deve fare il cliente — che è la ragione per cui non ce l'ha ancora.

**Nota di posizionamento:** il metodo di produzione non è argomento di vendita. Il cliente compra un sito veloce, con le sue foto e un form che porta richieste. Non compra "un one-page fatto con l'AI", e non va presentato così — né a lui, né a sé stessi, perché quel pensiero finisce nel prezzo.

---

## 13. Regola di abbandono (§8 adattata)

Diversamente dal Lead Hub, qui la chiusura è una decisione unilaterale possibile: i siti consegnati restano nel repo del cliente e continuano a funzionare senza di te.

**Soglia da definire a freddo prima del lancio:** numero di siti venduti entro una data di verifica.

Sotto soglia → si smette di vendere, si tengono i clienti esistenti, e si valuta se il problema era il prodotto o il canale. La distinzione va fatta con i dati di traffico della vetrina, non a intuito.

**Anche in caso di chiusura commerciale, il sistema di consegna resta.** Lo schema, il componente form, la pipeline e i template sono l'asset di Livello 3.1: servono comunque a consegnare progetti fatti a mano. Questa è la ragione per cui il rischio del progetto è basso.

---

## 14. Canale di acquisizione

È il secondo obiettivo dichiarato del progetto. Se resta vuoto, il progetto produce apprendimento e zero contatti.

### 14.1 Canale primario — demo su cliente reale

Un sito demo di un'attività inventata non convince nessuno. Un sito demo costruito sul **ristorante reale che si vuole come cliente** — con le sue foto da Google Business e Instagram, il suo menù, il suo nome — è l'outbound più forte disponibile. Il messaggio non è "posso farti un sito", è "ho rifatto il tuo sito, guardalo qui".

Costo con la pipeline automatizzata: ~20 minuti per demo. Senza automazione sarebbe insostenibile.

**È l'unico canale in cui il vantaggio tecnico si traduce direttamente in vantaggio commerciale.** Questo è anche il motivo per cui la pipeline va costruita prima di iniziare a vendere, e non viceversa.

Vincolo: la demo va costruita solo su attività il cui sito attuale è oggettivamente carente, e va sempre presentata come proposta, mai come fatto compiuto.

### 14.2 Partnership con chi già serve quel cliente

Commercialisti, fotografi food, consulenti, fornitori di registratori di cassa e software gestionali. Un solo partner attivo vale più di cento email a freddo. Lento da attivare, ma è l'unico canale che porta clienti senza consumare ore.

L'add-on fotografico del §6.5 è il punto d'ingresso naturale: chi fotografa ristoranti conosce ristoratori.

### 14.3 SEO locale sulla vetrina

Query tipo "sito per ristoranti Roma". Matura in 6-12 mesi e non produce nulla nei primi mesi — motivo per cui va acceso subito, non dopo.

### 14.4 Canali esclusi per ora

- **LinkedIn** — il pubblico è fatto di colleghi marketing, non di titolari di ristoranti. Canale sbagliato per questo target.
- **Meta Ads** — richiede P.IVA, budget e una landing che converte. Non prima del Blocco 5b (vetrina con checkout), che dipende dall'apertura della P.IVA.

### 14.5 Presidio del tempo

L'acquisizione va protetta con una quota oraria fissata in anticipo, a partire dal passo 4. Senza un numero deciso prima, diventa zero — perché costruire è più comodo che contattare.

---

## 15. Decisioni ancora aperte

- **P.IVA** — in valutazione. Non blocca il Blocco 5a (vetrina senza incasso): si può raccogliere richieste e contattare clienti senza. Blocca il Blocco 5b (checkout) e tutto ciò che dipende dall'incasso. I primi clienti si gestiscono a mano finché non è aperta.
- **Verticale definitivo** — il ristorante è il riferimento per disegnare lo scheletro, non necessariamente il verticale su cui si costruisce la clientela. Si decide dopo i primi contatti reali.
- **Provider di pagamento** — Stripe o alternativa, condizionato all'apertura della P.IVA
- **Quota oraria dedicata all'acquisizione** (§14.5) — da fissare prima del passo 4
- **Data di verifica e soglia numerica per §13**
- **Nome del prodotto**
