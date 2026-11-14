/**
 * Impression d'un chapitre depuis la page (Ctrl+P équivalent) — partagée par le bouton du
 * formulaire et par l'icône « Imprimer » du sommaire (`LectureAids`).
 * - `imprimerChapitre` : tout le chapitre, avec la mise en page d'impression de `index.css`.
 * - `imprimerFormulaireSeul` : le formulaire de fin de chapitre seul — classe
 *   `print-formulaire-only` posée sur `body` le temps de l'impression (retirée à `afterprint`),
 *   voir les règles `@media print` correspondantes dans `index.css`.
 */
export function imprimerChapitre(): void {
  window.print()
}

export function imprimerFormulaireSeul(): void {
  document.body.classList.add('print-formulaire-only')
  const nettoyer = () => {
    document.body.classList.remove('print-formulaire-only')
    window.removeEventListener('afterprint', nettoyer)
  }
  window.addEventListener('afterprint', nettoyer)
  window.print()
}
