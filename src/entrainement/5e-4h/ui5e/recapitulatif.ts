/**
 * Forme partagée d'une ligne du récapitulatif "Ce qu'on sait déjà" pour le chantier 5e-4h — même
 * convention que son équivalent 4e (`src/entrainement/4e/ui/recapitulatif.ts`), dupliquée ici plutôt
 * que mutualisée entre chantiers (cohérent avec l'indépendance des 3 chantiers, voir CLAUDE.md et la
 * duplication déjà existante de `Katex.tsx` par chantier).
 */
export interface EntreeRecapitulatif {
  libelle: string;
  valeur: string;
  /** true si `valeur` doit être rendue via KaTeX, false si texte brut */
  estLatex: boolean;
  /**
   * true si cette étape a été "révélée" (tentatives épuisées sans bonne réponse), false si
   * réussie par l'élève — pilote UNIQUEMENT l'icône (✓/✗) affichée par `RecapitulatifPanel` devant
   * la ligne, jamais `valeur` elle-même : `valeur` reste toujours la valeur CONFIRMÉE de cette
   * étape.
   */
  revele: boolean;
  /** Version "bloc fitter" de `valeur` (tableau de fragments KaTeX) — voir l'équivalent 4e pour le
   * détail ; absent par défaut. */
  valeurs?: string[];
}
