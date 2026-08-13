import type { ConfigForm } from "../src/logica.js";

/** Una configurazione di form plausibile, per i test. Rispecchia `form_prenotazione` dell'esempio. */
export function configEsempio(sovrascrivi: Partial<ConfigForm> = {}): ConfigForm {
  return {
    id: "form_prenotazione",
    sorgente: "prenotazione_hero",
    campi_standard: ["nome", "email", "telefono"],
    campi_extra: [
      { chiave: "data_prenotazione", etichetta: "Data", tipo: "date", obbligatorio: true },
      { chiave: "num_persone", etichetta: "Numero di persone", tipo: "number", obbligatorio: true },
    ],
    consenso_privacy: true,
    consenso_marketing: true,
    ...sovrascrivi,
  };
}
