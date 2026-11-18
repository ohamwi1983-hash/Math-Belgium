/**
 * Impression d'un chapitre depuis la page (Ctrl+P équivalent) — partagée par le bouton du
 * formulaire et par l'icône « Imprimer » du sommaire (`OutilsChapitre`).
 * - `imprimerChapitre` : tout le chapitre, avec la mise en page d'impression de `index.css`
 *   (police Andika, paragraphes justifiés).
 * - `imprimerChapitreAmenage` : tout le chapitre, mise en page aménagée — classe `print-amenage`
 *   posée sur `body` le temps de l'impression (Atkinson Hyperlegible 14 pt, non justifié…).
 * - `imprimerFormulaireSeul` : le formulaire de fin de chapitre seul — classe
 *   `print-formulaire-only` posée sur `body` le temps de l'impression.
 * Les classes sont retirées à `afterprint` ; voir les règles `@media print` de `index.css`.
 */

/** Polices utilisées seulement à l'impression : le navigateur ne télécharge un fichier de police
 * que lorsqu'un élément l'utilise, et `window.print()` met la page en page immédiatement — sans ce
 * chargement préalable, la toute première impression pourrait sortir dans la police de secours. */
const POLICES_IMPRESSION = [
  '400 16px "Andika"',
  '700 16px "Andika"',
  'italic 400 16px "Andika"',
  '400 16px "Atkinson Hyperlegible"',
  '700 16px "Atkinson Hyperlegible"',
]

async function chargerPolicesImpression(): Promise<void> {
  if (!('fonts' in document)) return
  try {
    await Promise.all(POLICES_IMPRESSION.map((p) => document.fonts.load(p, 'Aa1')))
  } catch {
    // Police indisponible (hors ligne…) : l'impression part quand même avec la police de secours.
  }
}

/** À appeler dès l'affichage d'un chapitre : précharge les polices d'impression en tâche de fond,
 * pour qu'un Ctrl+P direct (sans passer par le bouton) les trouve déjà prêtes. */
export function prechargerPolicesImpression(): void {
  const lancer = () => void chargerPolicesImpression()
  const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(lancer)
  else window.setTimeout(lancer, 1500)
}

function imprimerAvecClasse(classe: string | null): void {
  void chargerPolicesImpression().then(() => {
    if (classe) {
      document.body.classList.add(classe)
      const nettoyer = () => {
        document.body.classList.remove(classe)
        window.removeEventListener('afterprint', nettoyer)
      }
      window.addEventListener('afterprint', nettoyer)
    }
    window.print()
  })
}

export function imprimerChapitre(): void {
  imprimerAvecClasse(null)
}

export function imprimerChapitreAmenage(): void {
  imprimerAvecClasse('print-amenage')
}

export function imprimerFormulaireSeul(): void {
  imprimerAvecClasse('print-formulaire-only')
}
