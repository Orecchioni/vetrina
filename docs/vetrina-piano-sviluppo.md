# Vetrina — piano di sviluppo

**Documento operativo per Claude Code.**
Va letto insieme a `vetrina-documento-progetto.md` (il vincolo di progetto) e a `content.example.json` (il riferimento concreto dello schema).

Data: 12 agosto 2026

---

## Come usare questo documento

Si lavora **un blocco alla volta**, in ordine. Un blocco non si considera chiuso finché il suo criterio "fatto quando" non è verificato con una prova concreta — non con l'impressione che funzioni.

Non anticipare blocchi successivi. Non implementare funzionalità non richieste dal blocco corrente, nemmeno se sembrano ovvie o utili: il documento di progetto ha un §9 di cose esplicitamente fuori scope, e "sarebbe utile" non è un criterio.

Se durante un blocco emerge che una decisione presa nel documento di progetto è sbagliata, **fermarsi e segnalarlo** invece di aggirarla nel codice.

---

## Regole non negoziabili

Valgono su ogni blocco, sempre.

1. **Nessun contenuto nel codice.** I template leggono tutto da `content.json`. Nessun titolo, testo, prezzo, orario o URL immagine scritto in un componente. Se serve un valore per far girare qualcosa, sta nel JSON di esempio, non nel sorgente.

2. **Lo schema è uno solo.** Definito in Zod nel pacchetto `vetrina-schema` e importato da tutti gli altri repo. Mai ridichiarare tipi o validazioni altrove: se una regola vale, vale nel pacchetto.

3. **Il componente form è uno solo.** Nessun template implementa la propria logica di invio. Il template decide quali campi mostrare e come appaiono; mai come si spediscono.

4. **L'endpoint di destinazione è configurazione, non codice.** Sta nel `content.json`. Cambiare destinazione deve significare cambiare una stringa in un file di dati.

5. **Validazione server-side sempre.** La validazione client è ergonomia, non sicurezza. Ogni dato che entra viene rivalidato lato server contro lo schema.

6. **Mobile-first.** Ogni interfaccia va progettata sul telefono e poi allargata.

7. **Errori visibili e leggibili.** Un JSON malformato, un upload fallito o un POST rifiutato devono produrre un messaggio che dice cosa è andato storto e dove. Mai fallimenti silenziosi.

---

## Struttura dei repo

Quattro repo separati. Non un monorepo: il repo del cliente deve essere autonomo e ricostruibile senza il resto.

| Repo | Cos'è |
|---|---|
| `vetrina-schema` | Pacchetto npm. Schema Zod del `content.json`, tipi TypeScript derivati, validatore CLI. Fonte unica di verità. |
| `vetrina-form` | Pacchetto npm. Componente form Astro condiviso e logica di invio. |
| `template-ristorante` | **GitHub template repository** (va spuntata l'opzione nelle impostazioni, altrimenti l'API non può clonarlo). Il primo template. |
| `vetrina` | Sito commerciale e intake guidato. |

Ogni repo ha il proprio `CLAUDE.md` che riporta le regole non negoziabili qui sopra più quelle specifiche del repo.

**Setup richiesto:** Node 20+, pnpm, account GitHub con personal access token per le API repo, Netlify collegato a GitHub, account Make.

---

# FASE A — Fondamenta

## Blocco 0 — Schema e validatore

**Repo:** `vetrina-schema`

Schema Zod completo del `content.json`, seguendo §4 del documento di progetto. Include: `schema_version`, `template`, `tema`, `azienda`, `meta`, `leadhub`, `forms[]`, `sezioni{}`, `video`, `generazione`.

Vincoli da implementare nello schema, non a valle:

- Sezioni a ordine fisso, con flag `attiva` dove il documento le indica disattivabili
- Minimi e massimi sui blocchi ripetibili (gruppi 1-6, voci per gruppo 3-12, immagini gallery 6-20, testimonianze 0-6)
- `campi_extra`: massimo 5 per form, chiavi come whitelist dichiarata
- `tema.palette` e `tema.coppia_font`: enum di valori preapprovati, mai stringhe libere
- Date in ISO 8601 con timezone esplicita

Espone: lo schema, i tipi TypeScript derivati, e un validatore CLI (`validate <file.json>`).

**Fatto quando:** il validatore accetta `content.example.json`, rifiuta con errore leggibile un JSON a cui manca un campo obbligatorio, uno che sfora un massimo, uno sotto un minimo e uno con una palette inesistente. I test coprono tutti e quattro i casi e girano in CI su ogni push.

---

## Blocco 1 — Contratto di ingestion

**Dove:** documento nel repo `vetrina-form` + scenario Make

Il Lead Hub non esiste ancora e potrebbe non esistere mai. Il disaccoppiamento si fa **definendo il contratto adesso**, non rimandando la decisione.

Definire per iscritto la forma esatta del payload in uscita dal form:

- Campi standard: nome, email, telefono, messaggio
- `campi_extra`: oggetto con solo le chiavi in whitelist per quel form
- Consensi: privacy e marketing separati, ciascuno con valore booleano, timestamp ISO 8601 e versione dell'informativa
- Provenienza: `sorgente` (dichiarata dal form), pagina di origine, parametri UTM
- Risposta attesa dall'endpoint: forma del successo e forma dell'errore

**Destinazione in questa fase: un webhook Make** che riceve, scrive una riga su Google Sheet e manda una notifica email. Costa zero ed è già middleware vero.

Quando il Lead Hub esisterà, cambia l'URL nel `content.json`. Nessuna modifica al codice.

**Fatto quando:** un POST da curl con payload conforme produce una riga completa nello Sheet e una mail; un POST malformato riceve una risposta di errore leggibile.

---

## Blocco 2 — Componente form condiviso

**Repo:** `vetrina-form`

Pacchetto npm con il componente Astro usato da tutti i template.

Contiene: campi tipizzati generati dalla configurazione del form, honeypot, validazione client, checkbox consensi separate con testo e versione dell'informativa, campi nascosti per sorgente e UTM, POST verso l'endpoint letto dal `content.json`, gestione della risposta e feedback all'utente.

Il template passa solo la configurazione del form. Nessuna logica di invio è sovrascrivibile.

**Fatto quando:** importato in un progetto Astro vuoto, il componente spedisce correttamente al webhook; con la rete staccata mostra un errore e **non perde i dati già inseriti**; un bot che compila l'honeypot viene scartato.

---

# FASE B — Il primo prodotto

## Blocco 3 — Template ristorante

**Repo:** `template-ristorante`

Sito Astro one-page, tutte le sezioni del §4, costruito interamente da `content.json`.

- Palette e coppie di font implementate come varianti selezionabili da `tema`, non come CSS fisso
- Ogni sezione disattivabile senza rompere il layout
- Il form arriva da `vetrina-form`, lo schema da `vetrina-schema`
- Immagini con rapporti d'aspetto dichiarati dal template, servite in formati moderni
- Il build fallisce se il `content.json` non passa il validatore

**Fatto quando:** cambiando solo il `content.json` esce un sito visibilmente diverso; disattivando `gallery`, `testimonianze` e `chi_siamo` il layout resta coerente; nessuna stringa di contenuto compare in un file sorgente.

---

## Blocco 4 — Demo pubblicata ← **primo checkpoint reale**

**Repo:** `template-ristorante` → Netlify

Deploy della demo con contenuti realistici (un ristorante plausibile, non lorem ipsum), dominio o sottodominio pubblico.

**Fatto quando:** è online, Lighthouse ≥ 90 su performance, accessibilità e SEO, il form genera una riga reale nello Sheet, e si apre dal telefono senza vergognarsi di mostrarla.

Da qui esiste qualcosa da far vedere.

---

## Blocco 5 — Vetrina commerciale

**Repo:** `vetrina`

Sito Astro: home con proposta di valore e prezzo esposto, domanda filtro "che tipo di attività hai?", pagina template con demo navigabile reale, pagina prezzi con incluso e non incluso, form di contatto collegato al webhook.

**Fatto quando:** è online e il form funziona.

**Da questo punto in poi si inizia a contattare gente.** L'intake per i primi clienti si fa a mano via email — è lento e va benissimo, perché i primi clienti servono a dire cosa automatizzare. Costruire la Fase C prima di aver parlato con qualcuno è il modo in cui il secondo obiettivo del progetto fallisce in silenzio.

---

# FASE C — Automazione

## Blocco 6 — Intake guidato

**Repo:** `vetrina`

Astro Actions, multi-step, uno step per sezione.

- Validazione server-side a ogni step, mai tutta alla fine
- Etichette contestuali per categoria
- Crop nel browser con rapporto d'aspetto imposto dal template
- Scelta tema e tono come anteprime, mai valori liberi
- Email richiesta al primo step: genera il link di ripresa ed è comunque un contatto acquisito
- `session_id` persistente, salvataggio progressivo, link di ripresa via email
- Storage su Supabase Storage, bucket `intake`, RLS per `session_id`, pulizia `pg_cron` a 7 giorni

**Fatto quando:** una persona esterna lo completa senza spiegazioni e produce un JSON che passa il validatore del Blocco 0; interrompendo a metà e riaprendo il link ritrova tutto.

---

## Blocco 7 — Pagamento

**Repo:** `vetrina`

Acconto 30% all'ordine, prima dell'intake. Saldo 70% prima della pubblicazione.

**Fatto quando:** senza acconto registrato l'intake non parte; senza saldo la pubblicazione non parte.

---

## Blocco 8 — Pipeline fino a preview

**Dove:** Make

Scenario: intake completo → compone `content.json` conforme → API GitHub crea il repo da `template-ristorante` → committa `content.json` e asset → Netlify builda → URL di preview → notifica.

Error handling su ogni step con notifica in caso di fallimento.

**Fatto quando:** un intake completo produce un URL di preview funzionante senza alcun intervento manuale, e un fallimento a metà pipeline produce una notifica che dice quale step è saltato.

---

## Blocco 9 — Generazione testi

**Dove:** Make → API Claude

Chiamata dentro la pipeline: riceve il materiale grezzo e le risposte del cliente, restituisce JSON con testi strutturati, meta title, description e alt text.

**Vincolo assoluto: nessun fatto inventato.** Anni di attività, specialità, premi e numeri provengono solo dall'input. L'ottimizzazione è di forma e struttura, non di sostanza.

**Fatto quando:** su 5 intake reali o simulati, i testi sono usabili senza riscrittura in almeno 4 casi.

---

# FASE D — Consolidamento

## Blocco 10 — Pubblicazione

Migrazione degli asset dallo storage esterno dentro il repo del cliente, deploy sul dominio del cliente.

**Fatto quando:** spegnendo l'account Cloudinary il sito pubblicato continua a funzionare.

La revisione umana prima della pubblicazione resta obbligatoria in v1. Non automatizzarla.

---

## Blocco 11 — Secondo template

Un secondo verticale, costruito riusando schema, componente form e scheletro di sezioni.

**Fatto quando:** è costruito in meno di un quinto del tempo del primo. Se non è così, lo scheletro condiviso non funziona come previsto: fermarsi e rivederlo prima di costruirne altri.

---

## Nota di realismo

Con ~10 ore/settimana: Fase A e B sono questione di settimane, Fase C di mesi.

Le Fasi A e B costituiscono già un asset utile e vendibile anche se il resto slitta: un template data-driven, una demo online e una vetrina con prezzo esposto permettono di vendere consegnando a mano.
