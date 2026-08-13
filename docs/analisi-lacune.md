# Vetrina — analisi delle lacune

**Data:** 12 agosto 2026
**Input analizzati:** `vetrina-documento-progetto.md`, `vetrina-piano-sviluppo.md`, `riferimenti/content.example.json`
**Scopo:** elencare le lacune, le contraddizioni e le conseguenze non registrate, con l'indicazione di dove ciascuna va risolta. Non è una critica del disegno: il disegno è coerente e il piano è più solido della media. È l'elenco delle cose che, se non decise ora, si pagano dopo.

Ogni voce ha un identificatore stabile (`L1`…`L32`) da usare come riferimento nelle sessioni di sviluppo.

**Come si legge la severità:**

- **Bloccante** — tocca lo schema `content.json` o l'ordine dei blocchi. Va sciolta *prima* del Blocco 0, perché cambiare lo schema dopo la prima consegna significa un bump di `schema_version` e un intervento su ogni repo cliente già consegnato.
- **Importante** — non blocca il Blocco 0, ma va decisa prima del blocco indicato, altrimenti quel blocco diventa una riscrittura.
- **Minore** — da tenere presente, costo di correzione basso in qualunque momento.

---

## Sommario

| # | Lacuna | Severità | Si risolve in |
|---|---|---|---|
| L1 | I due documenti non concordano sull'esistenza di Lead Hub | Bloccante | Doc + Blocco 0 · **chiusa D2** |
| L2 | I due documenti non concordano sull'ordine; la P.IVA diventa bloccante 5 blocchi prima | Bloccante | Doc + decisione |
| L3 | La politica sulle immagini stock è auto-contraddittoria | Bloccante | Doc + Blocco 0 · **chiusa D3** |
| L4 | `fonte` non è presente negli oggetti immagine dell'esempio | Bloccante | Blocco 0 |
| L5 | `prezzo` obbligatorio non unifica i verticali | Bloccante | Blocco 0 |
| L6 | `tag` a stringa libera | Bloccante | Blocco 0 |
| L7 | `cta.azione` è un'unione polimorfa non dichiarata | Bloccante | Blocco 0 |
| L8 | Manca il logo, manca la favicon | Bloccante | Blocco 0 |
| L9 | Non è detto chi timbra timestamp e IP dei consensi | Bloccante | Blocco 1 |
| L10 | Il consenso privacy non è nello schema | Bloccante | Blocco 0 |
| L11 | Le pagine legali contraddicono "no multipagina" | Bloccante | Doc + Blocco 3 |
| L12 | L'endpoint è pubblico per costruzione, senza anti-abuso | Importante | Blocco 1 |
| L13 | Gli asset hanno due modi di vita, affrontati troppo tardi | Importante | Blocco 3 |
| L14 | La mappa incorporata rompe performance e consensi insieme | Importante | Blocco 3 |
| L15 | Telefono e WhatsApp sono lead invisibili (beacon: correzione IP) | Importante | Blocco 2 · IP in D15 |
| L16 | Nessun blocco installa analytics, ma la §13 lo richiede | Importante | Blocco 5 |
| L17 | Un difetto trovato dopo la consegna non si propaga | Importante | Da accettare e scrivere |
| L18 | Non è deciso di chi è l'hosting del sito consegnato | Importante | Prima del Blocco 8 |
| L19 | `generazione.modello` nel repo cliente contraddice il posizionamento | Importante | Blocco 0 |
| L20 | Astro Actions non regge gli upload dell'intake | Importante | Blocco 6 |
| L21 | Gli orari non gestiscono la mezzanotte né producono dati strutturati | Importante | Blocco 0 + 3 |
| L22 | `variante` non ha semantica definita | Importante | Blocco 0 |
| L23 | Manca la regola di compatibilità di `schema_version` | Importante | Blocco 0 |
| L24 | "Nessuna stringa nel sorgente" è verificato a occhio | Importante | Blocco 3 |
| L25 | Testimonianze copiate da Google/TripAdvisor | Importante | Contratto |
| L26 | Raccogliendo contatti per i clienti sei responsabile del trattamento | Importante | Prima della 1ª consegna |
| L27 | Nessun vincolo garantisce che il lead sia contattabile | Minore | Blocco 0 |
| L28 | `alt` senza vincoli di qualità | Minore | Blocco 0 |
| L29 | sitemap.xml e robots.txt non nominati | Minore | Blocco 3 |
| L30 | "Lighthouse ≥ 90" non è definito operativamente | Minore | Blocco 4 |
| L31 | `og_image` è un URL esterno e migra come gli altri asset | Minore | Blocco 3 |
| L32 | Quante foto vere servono per completare l'intake (rivisto) | Minore | Blocco 6 |
| L33 | La consegna manuale dei primi clienti non è specificata | Importante | Copione, dopo Blocco 5a (D37) |

---

# Bloccanti

## L1 — I due documenti non concordano sull'esistenza di Lead Hub

Il documento di progetto tratta Lead Hub come un backend esistente e cablato: §2 lo dichiara «il backend, non un secondo progetto», §8 gli dedica una sezione intera, §11 lo mette nello stack, e `content.example.json` ha un endpoint Supabase reale.

Il piano di sviluppo, Blocco 1, dice l'opposto: «Il Lead Hub non esiste ancora e potrebbe non esistere mai», e mette al suo posto un webhook Make che scrive su Google Sheet.

La scelta del piano è quella giusta — definire il contratto adesso e rinviare il destinatario è esattamente il disaccoppiamento che serve. Ma la conseguenza è rimasta nello schema: **la chiave si chiama `leadhub`.**

Un nome di chiave nel `content.json` non è un dettaglio estetico. È committato nel repo di ogni cliente. Rinominarlo dopo la prima consegna significa un bump di `schema_version`, un migratore, e un intervento su repo che per disegno sono congelati.

**Raccomandazione:** rinominare la chiave in `ingestion`, mantenendo `tenant_id`, `endpoint`, `informativa_versione`. Oggi costa una riga. Aggiornare §8 del documento di progetto perché dica ciò che il piano ha già capito: *il contratto è il vincolo, il destinatario è configurazione.*

## L2 — I due documenti non concordano sull'ordine, e questo sposta la P.IVA

| Passo | Documento di progetto §10 | Piano di sviluppo |
|---|---|---|
| Schema | 1 | Blocco 0 |
| Contratto ingestion | — | Blocco 1 |
| Componente form | 2 | Blocco 2 |
| Template ristorante | 3 | Blocco 3 |
| Demo pubblicata | 4 | Blocco 4 |
| **Vetrina commerciale** | **9** | **Blocco 5** |
| Intake guidato | 5 | Blocco 6 |
| Pagamento | 5b | Blocco 7 |
| Pipeline Make | 6 | Blocco 8 |
| Generazione testi | 7 | Blocco 9 |
| Pubblicazione | 8 | Blocco 10 |
| Secondo template | 10 | Blocco 11 |

Il piano ha spostato la vetrina commerciale dalla nona alla quinta posizione. È la decisione corretta, e il documento di progetto la argomenta da solo: §10 avverte che «da lì in poi va tenuta attiva una quota di tempo sull'acquisizione», §14.5 vuole il presidio del tempo a partire dal passo 4, §14.1 dice che la pipeline va costruita prima di vendere ma non che vada costruita *tutta*.

La conseguenza però non è registrata da nessuna parte. §15 dichiara la P.IVA bloccante e dice che «va sciolta prima del passo 9». Con il nuovo ordine, il passo 9 è diventato il Blocco 5: **la decisione più pesante e ancora aperta del progetto arriva cinque blocchi prima di quanto il documento assuma**, subito dopo il primo checkpoint reale.

**Raccomandazione:** dividere il Blocco 5 in due esiti possibili, e decidere quale si costruisce:

- **5a — vetrina senza incasso.** Prezzo esposto, demo navigabile, domanda filtro, form di richiesta. Non richiede P.IVA: si può contattare, qualificare e raccogliere richieste. La P.IVA serve alla prima fattura, non al primo contatto.
- **5b — vetrina con checkout.** Richiede P.IVA e provider di pagamento, cioè due decisioni aperte del §15.

Costruire 5a e rinviare l'incasso mantiene il secondo obiettivo del progetto vivo mentre la decisione fiscale matura, invece di farlo dipendere da essa.

## L3 — La politica sulle immagini stock è auto-contraddittoria

§6.5 ammette lo stock «solo su: sfondi, texture, sezioni di atmosfera, elementi decorativi» e lo vieta «mai su: prodotti, piatti, persone, interni del locale, staff».

Ma lo schema §4 non prevede alcuno slot per sfondi, texture o elementi decorativi. Gli slot immagine che esistono sono quattro, e nell'esempio contengono esattamente ciò che è vietato:

| Slot | Contenuto nell'esempio | Ammesso? |
|---|---|---|
| `hero.immagine` | «Sala interna della Trattoria da Nino» | interni del locale → **mai** |
| `chi_siamo.immagine` | «Nino e i figli davanti all'ingresso» | persone → **mai** |
| `gallery.immagini` | sala, carbonara, dehors, cucina, bancone | locale e piatti → **mai** |
| `meta.og_image` | derivata dalle precedenti | **mai** |

**Per la regola stessa del documento, in v1 non esiste uno slot in cui lo stock sia ammissibile.** Quindi la procedura del §6.5 — l'intake propone lo stock, mostra l'immagine, chiede conferma esplicita, registra `fonte: "stock"` — descrive un percorso che non può mai attivarsi. È codice morto specificato con cura.

Le uscite sono due: aggiungere slot decorativi allo scheletro (allarga il prodotto), oppure prendere atto che in v1 lo stock non esiste.

**Deciso il 2026-08-12 (D3): si aggiungono slot decorativi.** La ragione è più forte di quella con cui avevo raccomandato il contrario: uno slot di sfondo dove lo stock è ammesso è ciò che permette a un cliente **senza foto proprie** di completare comunque l'intake, invece di fermarsi in attesa di un fotografo. Trasforma il caso di §6.5 — «il cliente non ha contenuti adeguati», dichiarato «il modo più probabile in cui il processo si blocca» — da blocco della pipeline a percorso degradato ma percorribile. Tenere lo stock fuori dalla v1 avrebbe reso quel §6.5 impossibile da servire.

Come si implementa, senza allargare il prodotto:

- il campo `fonte` entra sull'oggetto immagine — `cliente | stock | generata` — con un `refine` che ammette `stock` **solo** sugli slot decorativi e lo rifiuta su tutti gli altri. La regola del §6.5 smette di essere una frase nel documento e diventa un errore di validazione.
- **nessuna sezione nuova.** Gli slot decorativi sono campi dentro sezioni esistenti (`hero.sfondo`, `cta_finale.sfondo`), così l'ordine fisso del §4 e la tabella delle nove sezioni restano intatti. Aggiungere una sezione "atmosfera" sarebbe il primo passo verso il builder che §9 vieta.
- vedi **D35** per l'elenco esatto degli slot e **D36** per il caso dell'hero senza foto propria.

§6.5 resta valido come scritto, e va letto insieme a **L32**, che questa decisione ridimensiona.

## L4 — `fonte` non è presente negli oggetti immagine dell'esempio

Conseguenza diretta di L3. Gli oggetti immagine di `content.example.json` hanno solo `url` e `alt`. Se `fonte` diventa obbligatorio, l'esempio va aggiornato nello stesso commit — ed è il file contro cui il Blocco 0 verifica il proprio criterio di completamento («il validatore accetta `content.example.json`»). Se i due divergono, il primo criterio "fatto quando" del progetto è falsato.

## L5 — `prezzo` obbligatorio non unifica i verticali

§4 rivendica che `servizi → gruppi → voci` «è ciò che unifica i verticali: un ristorante ha 6 gruppi, uno studio dentistico ne ha 1. Stesso schema.» La rivendicazione regge sui gruppi, non sui prezzi.

Uno studio dentistico spesso non espone prezzi. Un ristorante ha voci a «s.q.», «secondo pescato», o a fascia. Se `prezzo` è una stringa obbligatoria, il secondo template — Blocco 11, il cui criterio è «un quinto del tempo del primo» — inciampa sul modello dati, che è il posto peggiore dove inciampare.

**Raccomandazione:**

- `prezzo: string | null`, con regex sul formato italiano quando presente (`^\d{1,4},\d{2}$`)
- `prezzo_nota: string | null`, max ~24 caratteri, per «a partire da», «s.q.»
- il template non rende nulla quando entrambi sono assenti, e il layout deve restare corretto in quel caso

La scelta di rappresentare il prezzo come stringa con la virgola, invece che come numero, è giusta e va mantenuta: evita di dover decidere la formattazione a valle e i problemi di arrotondamento dei float.

## L6 — `tag` a stringa libera

Nell'esempio: `"tag": ["vegetariano", "stagionale"]`. Nessun vincolo dichiarato.

Se resta libero, il template non può renderlo (non sa quali icone o etichette esistono), il validatore non può controllarlo, e si viola la regola del §4 «etichette nel template, non nel dato»: perché `"vegetariano"` è già mezza etichetta.

**Raccomandazione:** enum chiuso, con le etichette e le icone nel template. Un set iniziale ragionevole: `vegetariano`, `vegano`, `senza_glutine`, `piccante`, `stagionale`, `surgelato` — l'ultimo è un obbligo informativo nella ristorazione, quindi vale averlo dal primo giorno.

## L7 — `cta.azione` è un'unione polimorfa non dichiarata

Nell'esempio, due CTA nello stesso oggetto hanno due tipi diversi di `azione`:

```json
"cta_primaria":   { "testo": "Prenota un tavolo", "azione": "form_prenotazione" }
"cta_secondaria": { "testo": "Guarda il menù",    "azione": "#servizi" }
```

Una è l'id di un form, l'altra è un'ancora. Servono anche il telefono e WhatsApp, che nell'esempio esistono come dati di `azienda` ma non come azioni possibili. Nulla di questo è dichiarato in §4, e una stringa che a volte è un id e a volte un selettore CSS non è validabile.

**Raccomandazione:** unione discriminata.

```
{ tipo: "form",     form_id: string }
{ tipo: "ancora",   sezione: <enum delle sezioni> }
{ tipo: "tel" }
{ tipo: "whatsapp" }
```

Con due validazioni incrociate: `form_id` deve esistere in `forms[]`; `sezione` deve puntare a una sezione **attiva**. Sono esattamente i controlli che giustificano Zod invece di un JSON Schema, e prevengono il difetto più probabile della pipeline: una CTA che punta a una sezione disattivata dal cliente, cioè un pulsante che non fa niente su un sito appena consegnato.

## L8 — Manca il logo, manca la favicon

Non sono in §4 e non sono nell'esempio. Sono due omissioni diverse:

- **Logo**: la maggioranza delle PMI ne ha uno, e un sito che non lo mostra sembra un template. Serve `azienda.logo` opzionale (con `alt`), e il template deve gestire in modo dignitoso il caso assente — di norma componendo il nome con la coppia di font scelta.
- **Favicon**: il costo è quasi nullo e l'assenza si nota nella barra del browser e fra i preferiti. Va generata dal logo, o dall'iniziale sulla palette scelta quando il logo manca.

## L9 — Non è detto chi timbra timestamp e IP dei consensi

§7 elenca cinque requisiti di predisposizione e dichiara che il quinto — consensi separati con timestamp, IP e versione dell'informativa — «è l'unico non recuperabile a posteriori».

Non dice dove nascono timestamp e IP. La cosa conta: se li invia il browser, il timestamp è falsificabile e l'IP non è conoscibile in modo affidabile lato client. Un consenso con dati di prova generati dal client non è la prova che serve.

**Raccomandazione:** stabilirlo nel contratto del Blocco 1, in modo esplicito.

- il **client** invia: i booleani dei consensi e la `informativa_versione` che ha effettivamente mostrato
- il **server** timbra: `ricevuto_il` (ISO 8601 con timezone) e `ip`

Va scritto nel Blocco 1, non scoperto nel Blocco 2 — perché il Blocco 2 ha come criterio «spedisce correttamente al webhook», e un payload sbagliato può spedire correttamente per mesi.

## L10 — Il consenso privacy non è nello schema

`forms[]` ha `consenso_marketing: true` ma nessun `consenso_privacy`. Presumibilmente è sempre obbligatorio, e per questo non è stato reso configurabile. Ma su un requisito dichiarato non recuperabile, «presumibilmente» è troppo poco: significa che nulla, nello schema, impedisce a un template di ometterlo.

**Raccomandazione:** metterlo nello schema come letterale fisso `consenso_privacy: true`. Non è configurazione, è un invariante reso visibile — e il componente form può leggerlo invece di dipendere da una convenzione.

## L11 — Le pagine legali contraddicono "no multipagina"

Il footer dell'esempio linka `/privacy` e `/cookie`. §9 mette «siti multipagina» fuori scope, in modo vincolante.

Non è un conflitto sostanziale — le pagine legali sono adempimenti, non contenuto, e nessuno le considererebbe un secondo livello di navigazione. È un conflitto che va risolto per iscritto, perché al momento **nessun blocco le prevede e nessun "fatto quando" le nomina**. Il risultato pratico: la demo del Blocco 4 esce con due link rotti nel footer, che è precisamente il tipo di difetto che il §5 vuole evitare («che esca online un sito brutto con il tuo nome sopra»).

C'è di più. Quel testo non è generico: deve nominare il titolare del trattamento (il cliente), le finalità, e i responsabili reali — Make, Google, l'hosting. §8 dice che «il testo dell'informativa vive nel template con un numero di versione», e questo va tenuto insieme al fatto che `informativa_versione` sta nel `content.json`. Sono due posti per la stessa cosa, e possono divergere: un `content.json` che dichiara `2026-08-v1` mentre il pacchetto ne spedisce la v2 produce un consenso registrato contro una versione che non è quella mostrata.

**Raccomandazione:**

- dichiarare in §9 l'eccezione: `/privacy` e `/cookie` sono pagine legali, ammesse, non contenuto
- il testo versionato vive nel pacchetto (`vetrina-form`), con i dati del titolare interpolati da `azienda`
- **il build fallisce se `informativa_versione` dichiarata nel `content.json` non esiste nel pacchetto.** Questo trasforma la divergenza da rischio silenzioso a errore di compilazione
- assegnare le due pagine al Blocco 3, e nominarle nel suo criterio di completamento

---

# Importanti

## L12 — L'endpoint è pubblico per costruzione, senza anti-abuso

`ingestion.endpoint` sta nel `content.json`, viene compilato nel sito e finisce nel JavaScript servito al browser. **È pubblico qualunque sia la visibilità del repo del cliente.** Non è un difetto: un form che spedisce da browser non può avere un segreto. È un fatto da cui derivano delle conseguenze.

Con un webhook Make come destinatario e nessun limite, chiunque legga il sorgente della pagina può spedire richieste a volontà: righe spazzatura nel Google Sheet, notifiche email a ripetizione, e consumo delle operazioni Make del piano. Il piano prevede un honeypot nel Blocco 2, che ferma i bot ingenui e nessuno che abbia guardato la pagina.

**Raccomandazione:** il contratto del Blocco 1 deve definire, come parte del contratto e non come aggiunta successiva:

- rate limit per IP, con una risposta di rifiuto leggibile
- dimensione massima del payload e numero massimo di campi
- **un endpoint per tenant**, così che un abuso su un sito sia isolabile e revocabile senza toccare gli altri

L'ultimo punto è quello che conta di più, e coincide con il ruolo che `tenant_id` avrà quando esisterà Lead Hub: vale costruirlo con quella forma subito. Va deciso prima del Blocco 4, perché il Blocco 4 mette online un endpoint pubblico e lo lascia lì.

## L13 — Gli asset hanno due modi di vita, e il piano li affronta troppo tardi

§5 stabilisce che durante la lavorazione le immagini stanno su Cloudinary e alla pubblicazione migrano nel repo del cliente. La ragione è buona ed è quella del no-lock-in: «il cliente resta proprietario di un sito completo che non dipende da un servizio che paghi tu».

Ma sono due percorsi tecnici diversi. Astro ottimizza gli asset locali a build time — formati moderni, dimensioni corrette, dimensioni intrinseche note, nessun layout shift. Gli asset remoti richiedono configurazione esplicita dei domini e non danno le stesse garanzie senza lavoro aggiuntivo.

Il piano affronta la migrazione al Blocco 10. Due conseguenze:

1. Se il Blocco 3 implementa solo il caso remoto, il Blocco 10 non è una migrazione: è una riscrittura del modo in cui ogni sezione rende le immagini.
2. Il «Lighthouse ≥ 90» del Blocco 4 misura il profilo *remoto*, che non è il profilo consegnato. Il numero verificato al primo checkpoint reale non descrive il prodotto.

**Raccomandazione:** il template accetta entrambe le forme dal primo giorno — URL assoluto o percorso relativo al repo — e **la demo del Blocco 4 usa asset locali**, cioè lo stesso percorso della consegna. Così il Blocco 10 resta quello che il piano voleva che fosse (spostare file e cambiare stringhe) e il criterio del Blocco 4 misura la cosa giusta.

## L14 — La mappa incorporata rompe performance e consensi insieme

`mappa_contatti.mostra_mappa: true` suggerisce un iframe. Un iframe di Google Maps costa due cose contemporaneamente:

- **performance**: è il singolo elemento che rende difficile il «Lighthouse ≥ 90 su mobile» richiesto come requisito non funzionale
- **consensi**: introduce cookie di terze parti, quindi un banner e una catena di consenso preventivo che nessun blocco prevede e che, se fatta bene, è lavoro vero

La seconda è la più insidiosa, perché un cookie banner non è una feature: è un pezzo di prodotto che appare in ogni sito consegnato, e va progettato o non va introdotta la causa.

**Raccomandazione:** mappa statica — immagine con il punto, più link «apri in Maps» — generata da `lat`/`lng`. `mostra_mappa` resta nello schema, cambia solo come è resa. Con un `refine`: `mostra_mappa: true` richiede `lat` e `lng` presenti, altrimenti la sezione si renderebbe vuota. Nessun cookie di terze parti in tutto il sito significa nessun banner, che è un vantaggio di prodotto e non solo una semplificazione tecnica.

## L15 — Telefono e WhatsApp sono lead invisibili

§7.3 vuole «ogni submission conservata, con storico». Un tap su `tel:` o su `wa.me` non produce niente: nessuna riga, nessun consenso, nessuna provenienza.

Non si toglierebbero — su mobile, per un ristorante, chiamare converte più di qualunque form. Ma vanno contati, perché sono la parte del traffico che il §13 dovrebbe usare per decidere se il problema era il prodotto o il canale, e in questo momento è invisibile.

**Raccomandazione:** un beacon di click verso l'endpoint, con `tipo: "click_contatto"` e la sorgente della sezione. Costa poche righe nel componente condiviso ed è esattamente il principio del §1: predisposto, non integrato.

*Correzione (2026-08-12).* La prima stesura diceva che il beacon «non ha bisogno di consenso perché non raccoglie dati personali». È sbagliato: il beacon va allo **stesso endpoint** che, per D13/L9, timbra l'IP lato server — e l'IP è un dato personale. Non conta cosa manda il client; conta cosa registra il server. Quindi delle due l'una:

- il beacon va su un **percorso o una modalità che non timbra e non conserva l'IP** — è un contatore di click aggregato, l'IP non gli serve — e allora la frase «nessun dato personale» torna vera;
- oppure l'IP resta, e il beacon **rientra nell'informativa** come gli altri trattamenti.

Va sciolto in **D15**, prima del Blocco 1, perché è il contratto che decide cosa l'endpoint timbra. La prima opzione è la più pulita e la più coerente con lo scopo del beacon.

## L16 — Nessun blocco installa analytics, ma la §13 lo richiede

§13 stabilisce che la distinzione fra «era il prodotto» ed «era il canale» «va fatta con i dati di traffico della vetrina, non a intuito». §14.3 punta sulla SEO locale come canale che matura in 6-12 mesi e per questo «va acceso subito».

Nessun blocco del piano installa alcuna misurazione. Il risultato è che la regola di abbandono — il meccanismo che dovrebbe proteggere dal continuare a costruire a vuoto — al momento della verifica non avrà i dati per essere applicata. E la SEO locale accesa senza Search Console non è misurabile per definizione.

**Raccomandazione:** nel Blocco 5, insieme al deploy della vetrina: analytics privacy-friendly senza cookie (così L14 resta vera e nessun banner serve) e Search Console verificata. È mezz'ora di lavoro che rende applicabile una decisione già scritta.

## L17 — Un difetto trovato dopo la consegna non si propaga

Ogni cliente riceve una copia del template al momento della consegna. Un difetto di accessibilità scoperto dopo venti consegne sono venti repo da toccare a mano.

Non è un errore del disegno: è il prezzo del no-lock-in, e §12 esclude esplicitamente le modifiche post-consegna dall'incluso. È una conseguenza che nessuno dei due documenti nomina, e che va nominata perché cambia il modo in cui si valuta un difetto trovato al cliente numero cinque.

**Raccomandazione:** accettarla e scriverla. E registrare in ogni repo consegnato la versione del template usata — `generazione` è già il posto giusto — così che il giorno in cui serve si possa almeno sapere *chi* è affetto da *cosa*, invece di aprire venti repo per scoprirlo.

## L18 — Non è deciso di chi è l'hosting del sito consegnato

§13 fonda la valutazione del rischio su un'affermazione precisa: i siti consegnati «restano nel repo del cliente e continuano a funzionare senza di te». È vera per il repo. Non è automatica per il deploy e per il DNS.

- Se i siti stanno sul tuo account Netlify, il free tier condivide banda e minuti di build fra tutti i clienti, tu sei un punto di fallimento, e l'affermazione del §13 è falsa.
- Se stanno sul loro account, serve accesso al loro account in fase di consegna, e il Blocco 8 deve saperlo perché è lui che fa il deploy.

Vale anche per il dominio, che §12 mette fra le cose «non incluse, quotate a parte»: chi lo registra e chi tiene il DNS è la stessa domanda.

**Raccomandazione:** decidere prima del Blocco 8, e scriverlo nel documento di progetto accanto al §13, perché è un presupposto della sua conclusione, non un dettaglio operativo.

## L19 — `generazione.modello` nel repo cliente contraddice il posizionamento

§12 è esplicito: «il metodo di produzione non è argomento di vendita… il cliente non compra "un one-page fatto con l'AI", e non va presentato così — né a lui, né a sé stessi, perché quel pensiero finisce nel prezzo».

Poi il `content.json` consegnato nel repo del cliente contiene `"modello": "claude-sonnet-4-6"`.

**Raccomandazione:** nel repo del cliente restano `data`, `revisione` e `input_hash`. Il modello resta nel log della pipeline, dove serve a te e non parla al cliente.

## L20 — Astro Actions non regge gli upload dell'intake

Il Blocco 6 prevede Astro Actions per l'intake e crop nel browser. Le function di Netlify hanno un limite di dimensione del body nell'ordine dei pochi MB: le foto ritagliate da un telefono moderno possono superarlo, e comunque far passare i byte attraverso l'Action è lo schema sbagliato — occupa la function per la durata dell'upload e paga il transito due volte.

**Raccomandazione:** l'upload va dal browser direttamente a Supabase Storage con un URL firmato, generato lato server per quella `session_id`. L'Action gestisce metadati e validazione, non byte. Questo semplifica anche la RLS prevista dal piano: un URL firmato con scadenza è più semplice e più robusto di una policy su chiave anonima, e non richiede di esporre credenziali a un browser anonimo.

Da sapere prima di disegnare il Blocco 6, non durante.

## L21 — Gli orari non gestiscono la mezzanotte né producono dati strutturati

Tre lacune nello stesso blocco:

- **Mezzanotte.** Una pizzeria aperta `19:30 → 01:00` rompe qualunque validazione che pretenda `a > da`. Va deciso ora: si ammette la fascia che scavalca la mezzanotte (e la validazione lo sa) o la si vieta (e il template non serve a una pizzeria).
- **Struttura di `settimana[]`.** Nulla vincola l'array a essere esattamente sette giorni, in ordine, senza duplicati. Un `content.json` con `martedi` due volte e senza `domenica` oggi passerebbe.
- **Dati strutturati.** Gli orari sono il caso in cui `schema.org/LocalBusiness` con `OpeningHoursSpecification` produce un beneficio SEO reale e visibile nei risultati di ricerca. Il canale del §14.3 è la SEO locale, e nessun blocco nomina i dati strutturati. Vale anche per indirizzo, telefono e coordinate, che sono già tutti nello schema.

**Raccomandazione:** vincoli nel Blocco 0 (sette giorni esatti in ordine fisso, fasce ordinate e non sovrapposte, mezzanotte ammessa esplicitamente), `schema.org` nel Blocco 3.

## L22 — `variante` non ha semantica definita

`template.variante: "trattoria"` non è spiegato in nessun punto del §4. Se la variante cambia il layout, viola il principio 2 dello §3 (scheletro condiviso). Se cambia lessico e sezioni attive di default, è coerente — ma va scritto, perché è la differenza fra un preset e un secondo template mascherato.

**Raccomandazione:** definirla come preset di *(lessico + sezioni attive di default)*, e in v1 accettare un solo valore per `template.id`. Il campo si tiene — aggiungerlo dopo costa un bump di schema — ma non si paga l'astrazione finché non ci sono due varianti reali da distinguere.

## L23 — Manca la regola di compatibilità di `schema_version`

Il campo c'è, la politica no. Senza politica, il campo è decorativo.

**Raccomandazione:** tre regole brevi.

- il template dichiara quale major supporta, e il validatore rifiuta un major diverso con un errore leggibile
- i repo dei clienti non si migrano mai: sono congelati alla consegna (vedi L17)
- un cambio incompatibile è un major, e un major nuovo si introduce solo quando c'è una ragione che non sia estetica

## L24 — "Nessuna stringa nel sorgente" è verificato a occhio

È la regola numero uno del piano, ed è l'unica il cui criterio di verifica dipende da un'ispezione manuale: «nessuna stringa di contenuto compare in un file sorgente». Al terzo template quell'ispezione non si farà più, e la prima violazione entra silenziosamente — che è precisamente lo scenario che il §3 descrive come fatale: «un solo template con testi hardcoded elimina l'automazione, e la retrofittatura non è viabile».

**Raccomandazione:** un check in CI che fallisce se un file sorgente del template contiene un letterale di testo sopra una lunghezza soglia fuori da una allowlist. È mezz'ora di lavoro e trasforma la regola più importante del progetto da promessa a vincolo.

## L25 — Testimonianze copiate da Google/TripAdvisor

`"fonte": "Google"` nell'esempio suggerisce di reimportare recensioni dalle piattaforme, i cui termini d'uso in genere non prevedono la ripubblicazione su un sito terzo.

Non è un blocco tecnico ed è un rischio del cliente più che tuo. Diventa tuo se sei tu a metterle. **Raccomandazione:** una riga nel contratto — le testimonianze le fornisce il cliente, che garantisce di poterlo fare — e l'intake che le chiede come testo fornito, non come importazione.

## L26 — Raccogliendo contatti per i clienti sei responsabile del trattamento

I form dei siti consegnati mandano dati personali a un endpoint che gestisci tu, e quei dati transitano in Make e finiscono in un Google Sheet. Nel rapporto col cliente questo fa di te un responsabile del trattamento.

Due conseguenze concrete:

- serve una nomina a responsabile nel contratto di consegna
- l'informativa del sito cliente deve nominare i responsabili reali, cioè i servizi che stai usando davvero

La seconda si lega direttamente al punto dichiarato non recuperabile del §7.5: un'informativa che non nomina i responsabili è un'informativa da rifare, e rifarla dopo venti consegne significa venti siti da toccare e consensi raccolti contro un testo sbagliato. **Costa un allegato oggi.** Si lega alla decisione P.IVA e va risolto prima della prima consegna reale.

---

# Minori

## L27 — Nessun vincolo garantisce che il lead sia contattabile

`campi_standard` è una lista, e nulla impone che contenga almeno un canale di risposta. Un form con solo `nome` e `messaggio` produce lead inutili, e l'obiettivo primario del progetto è generare contatti. **Raccomandazione:** `refine` — almeno uno fra `email` e `telefono` deve essere presente in ogni form.

## L28 — `alt` senza vincoli di qualità

L'alt text è generato (§6.4) e pesa su accessibilità e SEO, due dei tre punteggi del requisito «≥ 90». Nello schema costa nulla imporre: non vuoto, lunghezza minima sensata, diverso dal nome del file.

## L29 — sitemap.xml e robots.txt non nominati

Contano per il punteggio SEO e per l'indicizzazione, che è il canale del §14.3. Sono configurazione, non lavoro: vanno nel Blocco 3 e nel suo criterio.

## L30 — "Lighthouse ≥ 90" non è definito operativamente

Mobile o desktop? Con quale throttling? Su quali pagine — solo la home, o anche `/privacy`? Sull'URL deployato o in locale? Sono numeri diversi, e senza una definizione il criterio del Blocco 4 è verificabile in qualunque modo convenga.

**Raccomandazione:** fissare la definizione nel Blocco 4 (mobile, throttling di default, sull'URL pubblico, su tutte le route generate) e tenerla manuale finché la superficie è piccola. Automatizzarla in CI è utile dal secondo template, non prima.

## L31 — `og_image` è un URL esterno e migra come gli altri asset

Rientra in L13. Va aggiunto: le dimensioni sono fisse (1200×630) e il rapporto d'aspetto va imposto nell'intake come per le altre immagini, altrimenti l'anteprima su WhatsApp — che per questo target è il canale di condivisione reale — esce tagliata.

## L32 — Quante foto vere servono davvero per completare l'intake

*Rivisto il 2026-08-12. La prima stesura diceva che un cliente senza sei foto del locale non può completare l'intake, e sopravvalutava il vincolo: la gallery è disattivabile (§4), quindi il minimo di 6 non è vincolante — si applica solo se la sezione è attiva.*

Il conto corretto degli slot che chiedono una foto vera:

| Slot | Disattivabile | Stock ammesso |
|---|---|---|
| `hero.immagine` | **no** | no (ma vedi `hero.sfondo`, D3/D36) |
| `chi_siamo.immagine` | sì | no |
| `gallery.immagini` (min 6) | sì | no |
| `meta.og_image` | derivabile dall'hero | no |

Il vincolo vero non è la gallery: **è l'hero, che è l'unica sezione non disattivabile con uno slot immagine.** Con D3 e D36 anche quello si sblocca, perché `hero.sfondo` ammette lo stock e basta da solo a rendere la sezione.

Quindi il pavimento reale per completare l'intake è: **zero foto proprie**, accettando un sito con hero su sfondo, senza gallery e senza `chi_siamo`. Che è un sito povero ma non un sito fatto male — la differenza che la motivazione del §4 vuole difendere («sotto soglia la sezione appare vuota e il sito sembra fatto male»).

Restano due conseguenze utili, più deboli di come le avevo scritte ma non nulle:

- l'intake deve **chiedere la foto prima di proporre lo sfondo**, altrimenti il percorso degradato diventa quello di default e tutti i siti si somigliano
- l'add-on fotografico resta la via per uscire dal sito povero, e il fotografo conviene averlo individuato prima del Blocco 5 — non perché serva a sbloccare la pipeline, ma perché §14.2 lo indica come il miglior canale di partnership disponibile. Chi fotografa ristoranti conosce ristoratori: la ricerca è un investimento su due fronti, non un costo (D24)

**Regola commerciale accanto a D36 (2026-08-12).** Che lo schema *permetta* il sito a zero foto proprie non vuol dire che lo si *offra*. Un hero su sfondo stock, senza gallery e senza `chi_siamo`, è tecnicamente valido ma è esattamente il sito che §5 vuole tenere offline («che esca online un sito brutto con il tuo nome sopra»). E c'è un vincolo più duro: il canale primario del §14.1 sono le **demo su cliente reale**, che funzionano solo se sono belle — una demo costruita col percorso degradato non convince nessuno, quindi lì il percorso non è nemmeno disponibile. Perciò D36 si tiene come *capacità* dello schema, ma con una regola d'uso: **il percorso a foto minime è un'eccezione da concedere a un cliente che paga e non ha altro, mai un'opzione da proporre, e mai un modo di costruire una demo.** Questa regola vive nell'intake (Blocco 6) e nel copione di consegna manuale (L33), non nello schema.

## L33 — La procedura che userai davvero nei primi mesi non è specificata da nessuna parte

*Trovata da una revisione esterna dell'analisi, il 2026-08-12. È il buco che le altre 32 lacune non vedono, perché tutte guardano al sistema automatizzato e questa guarda al periodo in cui l'automazione non c'è ancora.*

Fra il Blocco 5a («da qui si inizia a contattare») e il Blocco 6 (l'intake guidato) c'è una finestra che il piano nomina in una riga sola: «l'intake per i primi clienti si fa a mano via email». Quella riga descrive **l'unica procedura che si userà davvero nei primi mesi** — i primi clienti arrivano prima che l'automazione esista, per costruzione (§14.1: la pipeline si costruisce prima di vendere, ma i primi si consegnano a mano). Ed è l'unica procedura del progetto per cui non esiste:

- nessun blocco che la contenga
- nessun «fatto quando» che la chiuda
- nessun documento di **cosa chiedere al cliente**, in che ordine, con quali minimi, e come si trasforma quel materiale in un `content.json` valido a mano

È il punto in cui i due obiettivi del progetto si incontrano davvero: è consegnando a mano i primi clienti che si impara cosa l'automazione dovrà fare (secondo obiettivo), ed è lì che si generano i primi contatti veri (primo). Lasciarla implicita significa improvvisarla al primo cliente pagante, che è il momento peggiore.

**Raccomandazione:** un artefatto piccolo e non-codice — un **copione di consegna manuale** — dovuto insieme al Blocco 5a, non dopo. Non è un blocco di sviluppo: è una checklist e un paio di email-tipo. Deve contenere almeno:

- la lista di cosa chiedere, sezione per sezione, con i minimi dello schema (è la stessa lista che l'intake del Blocco 6 automatizzerà — scriverla ora è materiale per quel blocco, non lavoro buttato)
- le 3-4 domande secche del §6.4 (da quando siete aperti, cosa vi distingue, chi è il cliente tipo)
- la regola su foto e sfondo di L32/D36, applicata a mano
- il punto di consegna dei consensi e dell'informativa, perché è l'unica cosa non recuperabile (§7.5) e a mano è ancora più facile sbagliarla
- come si compila il `content.json` a mano e lo si valida col validatore del Blocco 0 prima del build

È **D37**. Va scritto prima di contattare il primo cliente, cioè appena dopo il Blocco 5a.

---

## Cosa il disegno fa già bene, e va protetto

Vale registrarlo, perché in fase di sviluppo la tentazione è di erodere le decisioni giuste per comodità locale.

- **Il contratto prima del destinatario** (Blocco 1). Definire il payload mentre il backend non esiste è la decisione tecnicamente più matura dei due documenti.
- **`servizi → gruppi → voci`.** Con L5 sistemato, unifica davvero i verticali con una struttura sola.
- **Il prezzo come stringa con la virgola.** Evita la formattazione a valle e i float. Controintuitivo e corretto.
- **`schema_version` dal primo giorno**, quando ancora non serve. Con L23 diventa utile.
- **L'ordine delle sezioni fisso.** È la singola decisione che impedisce al prodotto di diventare un builder, e sarà la prima che un cliente chiederà di rompere.
- **L'email chiesta al primo step dell'intake.** Trasforma un abbandono in un lead: è la scelta di prodotto più redditizia dei due documenti.
- **Un `content.json` di esempio scritto con contenuti plausibili** invece che con segnaposto. È ciò che ha reso possibile trovare metà delle lacune di questo elenco.
