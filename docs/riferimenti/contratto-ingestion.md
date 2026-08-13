# Contratto di ingestion

**Blocco:** 1
**Decisioni:** D13, D14, D15
**Stato:** contratto definito. La messa online dello scenario Make è un passo manuale, fuori da questo documento.

Il vincolo non è il destinatario: è la forma del payload. Cambiare destinazione — da webhook Make a un futuro Lead Hub — deve significare cambiare `ingestion.endpoint` nel `content.json`, mai il payload (regola 4).

---

## 1. Richiesta

`POST` verso l'URL in `ingestion.endpoint` del `content.json` del sito che invia.

```
Content-Type: application/json
Content-Length: <= 10240
```

Un payload oltre **10 KB** o con più di 5 `campi_extra` viene rifiutato prima di essere elaborato (D14).

### Corpo — submission di un form

```json
{
  "tipo": "submission",
  "tenant_id": "tnt_8f2a91c4",
  "form_id": "form_prenotazione",
  "sorgente": "prenotazione_hero",
  "campi": {
    "nome": "Marco Rossi",
    "email": "marco@esempio.it",
    "telefono": "+39 333 1234567"
  },
  "campi_extra": {
    "data_prenotazione": "2026-09-01",
    "orario": "20:00",
    "num_persone": "4"
  },
  "consensi": {
    "privacy": true,
    "marketing": false,
    "informativa_versione": "2026-08-v1"
  },
  "provenienza": {
    "pagina": "https://trattoriadanino.it/",
    "utm_source": "instagram",
    "utm_medium": "bio",
    "utm_campaign": null
  }
}
```

Vincoli sul corpo:

- `tenant_id` deve coincidere con quello del `content.json` che invia — ogni tenant ha il proprio `ingestion.endpoint`, quindi in pratica identifica la richiesta più che instradarla (D14).
- `form_id` deve esistere fra i `forms[]` del sito. Il server non ha il `content.json` sotto mano in v1: la whitelist dei `campi_extra` la applica il client (`vetrina-form`, Blocco 2), il server scarta silenziosamente ciò che non riconosce come `campi_extra` invece di rifiutare l'intera richiesta — un campo di troppo non deve perdere un lead.
- `campi` contiene solo chiavi fra quelle di `CAMPI_STANDARD` (`nome`, `email`, `telefono`, `messaggio`). Va rifiutata la richiesta priva sia di `email` sia di `telefono` — coerente con L27, già imposto sullo schema dei form.
- `campi_extra`: oggetto piatto, valori stringa, whitelist dichiarata dal `content.json` — **massimo 5 chiavi** (regola già nello schema, §4).
- `consensi.privacy` deve essere `true`. Una richiesta con `false` o assente è rifiutata: è l'unico dato non recuperabile (regola 8).
- `consensi.informativa_versione` è quella mostrata al momento dell'invio, non quella corrente del pacchetto — il client la legge da `ingestion.informativa_versione` e la rispedisce indietro.
- `provenienza.pagina` è l'URL della pagina che ha originato l'invio. I campi `utm_*` sono nullable.

### Corpo — beacon di click (D15)

```json
{
  "tipo": "click_contatto",
  "tenant_id": "tnt_8f2a91c4",
  "sezione": "hero",
  "canale": "tel"
}
```

`canale` è `tel` oppure `whatsapp`. Non contiene nome, contatto, o qualunque campo che identifichi la persona: è un contatore aggregato per sezione e canale, non una submission (L15, D15 corretta).

---

## 2. Cosa timbra il server, mai il client (D13)

| Campo | Chi lo produce |
|---|---|
| `ricevuto_il` | Il server, ISO 8601 con timezone, al momento della ricezione |
| `ip` | Il server, dall'indirizzo della connessione TCP |

Un payload che include `ricevuto_il` o `ip` nel corpo li **ignora**: non li sovrascrive, il server non li legge da lì. Il client non ha modo di falsificarli perché il server non li accetta in input.

**Eccezione — il beacon (`tipo: "click_contatto"`) non timbra `ip`.** È la correzione di D15: quell'endpoint scrive un contatore aggregato (`sezione` + `canale` + data), mai una riga con provenienza. Se in futuro serve tracciare la provenienza dei click, quella è una submission vera con consenso, non un beacon.

---

## 3. Risposta

### Successo — `200`

```json
{ "ok": true }
```

### Payload malformato o JSON non valido — `400`

```json
{
  "ok": false,
  "errore": "campo_mancante",
  "messaggio": "manca `consensi.privacy`, che deve valere true"
}
```

Codici di `errore` previsti: `json_malformato`, `campo_mancante`, `campo_non_valido`, `nessun_contatto` (né email né telefono), `consenso_privacy_assente`, `tenant_sconosciuto`.

### Rate limit superato — `429`

```json
{
  "ok": false,
  "errore": "troppe_richieste",
  "messaggio": "massimo 5 richieste ogni 10 minuti per indirizzo IP",
  "riprova_fra_secondi": 340
}
```

### Payload oltre la dimensione massima — `413`

```json
{ "ok": false, "errore": "payload_troppo_grande", "messaggio": "massimo 10 KB" }
```

Ogni risposta di errore ha `ok: false` e un `messaggio` leggibile — è quello che `vetrina-form` (Blocco 2) mostra all'utente, coerente con la regola 7.

---

## 4. Anti-abuso (D14)

| Regola | Valore |
|---|---|
| Rate limit | 5 richieste ogni 10 minuti, per indirizzo IP |
| Dimensione massima del payload | 10 KB |
| Campi extra massimi | 5 (già nello schema `content.json`, §4) |
| Isolamento per tenant | Strutturale: ogni sito ha il proprio `ingestion.endpoint`. Un abuso su un sito non consuma la quota degli altri e si revoca cambiando una stringa in un `content.json`, senza toccare il resto |

Il rate limit e la dimensione massima si configurano nello scenario Make (o nell'eventuale proxy davanti ad esso) — non sono parte dello schema `content.json`, perché riguardano il trasporto, non il dato.

---

## 5. Destinazione attuale — webhook Make

Il webhook riceve la richiesta, e per `tipo: "submission"`:

1. verifica i vincoli del §1 e risponde con l'errore corrispondente se non passano;
2. timbra `ricevuto_il` e `ip`;
3. scrive una riga sul Google Sheet del tenant, con tutti i campi del payload più i due timbrati;
4. invia una mail di notifica all'indirizzo del tenant.

Per `tipo: "click_contatto"`: incrementa un contatore (foglio o cella dedicata) chiave `tenant_id + sezione + canale + data`, senza scrivere una riga né inviare mail.

Quando esisterà Lead Hub, cambia `ingestion.endpoint` nel `content.json` — questo contratto non cambia (§8 del documento di progetto).

---

## 6. "Fatto quando" — come si verifica (processo-sviluppo.md)

Non riproducibile da questa sessione: verificare il contratto richiede un endpoint vero (l'account Make dell'utente), quindi i comandi seguenti li esegue chi ha accesso a quell'account, dopo aver costruito lo scenario secondo questo documento.

```sh
# 1. submission conforme -> riga nello Sheet + mail
curl -i -X POST "$ENDPOINT" -H "Content-Type: application/json" -d '{
  "tipo": "submission", "tenant_id": "tnt_test", "form_id": "form_contatti",
  "sorgente": "test_manuale",
  "campi": { "nome": "Prova", "email": "prova@esempio.it" },
  "campi_extra": {},
  "consensi": { "privacy": true, "marketing": false, "informativa_versione": "2026-08-v1" },
  "provenienza": { "pagina": "https://esempio.it/", "utm_source": null, "utm_medium": null, "utm_campaign": null }
}'
# atteso: 200 { "ok": true }, e una riga nuova nello Sheet con ricevuto_il e ip valorizzati dal server

# 2. payload malformato -> errore leggibile
curl -i -X POST "$ENDPOINT" -H "Content-Type: application/json" -d '{ "tipo": "submission" }'
# atteso: 400 con "errore" e "messaggio" leggibili

# 3. oltre il rate limit -> rifiuto
for i in $(seq 1 6); do curl -s -o /dev/null -w "%{http_code}\n" -X POST "$ENDPOINT" -H "Content-Type: application/json" -d '{ "tipo": "submission", "tenant_id": "tnt_test", "form_id": "form_contatti", "sorgente": "test", "campi": { "email": "x@x.it" }, "campi_extra": {}, "consensi": { "privacy": true, "marketing": false, "informativa_versione": "2026-08-v1" }, "provenienza": { "pagina": "https://esempio.it/", "utm_source": null, "utm_medium": null, "utm_campaign": null } }'; done
# atteso: le prime 5 rispondono 200, la sesta risponde 429
```
