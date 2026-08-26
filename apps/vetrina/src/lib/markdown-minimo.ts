/**
 * Le informative sono scritte in un markdown minimo (## titoli, **grassetto**,
 * paragrafi separati da riga vuota). Non serve una libreria per questo: sono
 * tre regole, e il testo che le usa vive in un unico file sotto controllo.
 *
 * Copia identica di quella dei template (non condivisa via pacchetto: è
 * un'utility di tre righe, non fa parte dello schema o del form).
 */
export function markdownMinimoAHtml(testo: string): string {
  const blocchi = testo.trim().split(/\n\n+/);

  return blocchi
    .map((blocco) => {
      if (blocco.startsWith("## ")) {
        return `<h2>${inline(blocco.slice(3))}</h2>`;
      }
      return `<p>${inline(blocco)}</p>`;
    })
    .join("\n");
}

function inline(testo: string): string {
  return testo
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, " ");
}
