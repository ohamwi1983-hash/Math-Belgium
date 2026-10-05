/**
 * Déclenche le téléchargement navigateur d'un `Blob` déjà construit (aucun backend impliqué —
 * contrainte explicite du prompt d'origine) : URL objet temporaire + clic synthétique sur un
 * `<a download>` détaché du DOM, révoquée juste après. Générique, sans rien connaître de docx —
 * réutilisable pour n'importe quel export futur (Word, mais aussi potentiellement PDF/CSV...).
 */
export function declencherTelechargement(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
