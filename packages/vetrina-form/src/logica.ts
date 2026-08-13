import type { ConfigForm } from "@vetrina/schema";

/**
 * Logica pura del componente form: costruzione del payload, lettura della
 * provenienza, controllo dell'honeypot. Separata da `Form.astro` perché va
 * testata senza bisogno di un browser o del compilatore Astro.
 *
 * La forma esatta del payload è quella di `docs/riferimenti/contratto-ingestion.md`.
 * Non ridichiararla altrove (regola 2): se il contratto cambia, cambia qui.
 */

export type { ConfigForm };

export interface Provenienza {
  pagina: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface PayloadSubmission {
  tipo: "submission";
  tenant_id: string;
  form_id: string;
  sorgente: string;
  campi: Record<string, string>;
  campi_extra: Record<string, string>;
  consensi: {
    privacy: boolean;
    marketing: boolean;
    informativa_versione: string;
  };
  provenienza: Provenienza;
}

export type Canale = "tel" | "whatsapp";

export interface PayloadBeacon {
  tipo: "click_contatto";
  tenant_id: string;
  sezione: string;
  canale: Canale;
}

/** Legge `utm_*` e la pagina corrente da un URL. Pura: prende l'URL, non lo va a cercare da sé. */
export function leggiProvenienza(url: string | URL): Provenienza {
  const u = typeof url === "string" ? new URL(url) : url;
  const parametro = (nome: string): string | null => u.searchParams.get(nome);

  return {
    pagina: `${u.origin}${u.pathname}`,
    utm_source: parametro("utm_source"),
    utm_medium: parametro("utm_medium"),
    utm_campaign: parametro("utm_campaign"),
  };
}

/**
 * Vero se il campo honeypot ha un valore. Un umano non lo vede (nascosto via CSS)
 * e lo lascia vuoto; un bot che compila tutti i campi ciecamente lo riempie.
 * È un filtro, non una difesa: la validazione che conta è quella server-side (regola 5).
 */
export function honeypotCompilato(valore: string | null | undefined): boolean {
  return typeof valore === "string" && valore.trim().length > 0;
}

/**
 * Costruisce il payload di una submission dai valori raccolti nel form.
 *
 * `valori` contiene sia i campi standard sia quelli extra, indistintamente:
 * questa funzione li smista secondo `config.campi_standard` / `config.campi_extra`,
 * scartando qualunque chiave non prevista — la whitelist del contratto (§1) si
 * applica qui, lato client, perché il server in v1 non ha il `content.json` sotto mano.
 */
export function costruisciPayloadSubmission(opzioni: {
  config: ConfigForm;
  tenantId: string;
  valori: Record<string, string>;
  consensoPrivacy: boolean;
  consensoMarketing: boolean;
  informativaVersione: string;
  provenienza: Provenienza;
}): PayloadSubmission {
  const { config, tenantId, valori, consensoPrivacy, consensoMarketing, informativaVersione, provenienza } =
    opzioni;

  const campi: Record<string, string> = {};
  for (const chiave of config.campi_standard) {
    const v = valori[chiave];
    if (v !== undefined && v.trim() !== "") campi[chiave] = v;
  }

  const campiExtra: Record<string, string> = {};
  for (const extra of config.campi_extra) {
    const v = valori[extra.chiave];
    if (v !== undefined && v.trim() !== "") campiExtra[extra.chiave] = v;
  }

  return {
    tipo: "submission",
    tenant_id: tenantId,
    form_id: config.id,
    sorgente: config.sorgente,
    campi,
    campi_extra: campiExtra,
    consensi: {
      privacy: consensoPrivacy,
      marketing: consensoMarketing,
      informativa_versione: informativaVersione,
    },
    provenienza,
  };
}

/** Costruisce il payload del beacon di click su `tel:` o WhatsApp (D15). Nessun dato personale. */
export function costruisciPayloadBeacon(opzioni: {
  tenantId: string;
  sezione: string;
  canale: Canale;
}): PayloadBeacon {
  return {
    tipo: "click_contatto",
    tenant_id: opzioni.tenantId,
    sezione: opzioni.sezione,
    canale: opzioni.canale,
  };
}

/**
 * Controllo minimo lato client prima di spedire: è ergonomia (dire subito
 * all'utente cosa manca), non sicurezza — il server rivalida tutto (regola 5).
 */
export function validazioneMinima(opzioni: {
  config: ConfigForm;
  valori: Record<string, string>;
  consensoPrivacy: boolean;
}): string[] {
  const problemi: string[] = [];

  const haContatto = config_ha_contatto(opzioni.config, opzioni.valori);
  if (!haContatto) problemi.push("Serve almeno un modo per ricontattarti: email o telefono.");

  if (!opzioni.consensoPrivacy) problemi.push("Devi accettare l'informativa sulla privacy per procedere.");

  return problemi;
}

function config_ha_contatto(config: ConfigForm, valori: Record<string, string>): boolean {
  const haEmail = config.campi_standard.includes("email") && (valori.email ?? "").trim() !== "";
  const haTelefono = config.campi_standard.includes("telefono") && (valori.telefono ?? "").trim() !== "";
  return haEmail || haTelefono;
}
