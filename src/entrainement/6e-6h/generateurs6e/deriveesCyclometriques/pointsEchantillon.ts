/**
 * Couche A (6e) — recherche de points d'échantillonnage valides pour `6gen4`. Plutôt que de
 * dériver, famille par famille, une fenêtre de domaine fermée analytiquement (fastidieux et
 * source d'erreur pour 7 familles aux structures très différentes — affine/puissance/racine/
 * réciproque/quadratique/etc.), une recherche BORNÉE sur une grille candidate large : chaque
 * famille fournit un simple prédicat `estValide(x)` (l'argument de l'arcfonction reste dans
 * `(-MARGE_ARCFONCTION;MARGE_ARCFONCTION)`, tout dénominateur reste loin de 0) et cette fonction
 * retient les candidats qui le satisfont. Si trop peu de points valides existent pour un tirage de
 * coefficients donné (fenêtre de domaine vide ou trop étroite), l'appelant reroll ses coefficients
 * — même principe "for tentative in range(N)" déjà établi ailleurs sur la plateforme.
 *
 * Ces points sont ensuite STOCKÉS sur l'exercice (`pointsEchantillonnage`) et réutilisés tels
 * quels par `src/moteur6e/verificationDeriveesCyclometriques.ts` pour la vérification par
 * équivalence numérique — jamais recalculés côté moteur (`src/moteur6e/` n'importe jamais
 * `src/generateurs6e/`).
 */

/**
 * Grille candidate large et FINE près de 0 (jamais 0 lui-même, dénominateur potentiel dans
 * plusieurs familles) — pas 0,02 sur `(0;1)` (nécessaire pour couvrir une fenêtre de domaine
 * étroite, ex. famille A "racine" avec un grand coefficient), pas 0,1 au-delà (suffisant, aucune
 * famille n'a besoin d'une fenêtre étroite loin de l'origine) — symétrique.
 */
function construireCandidatsX(): number[] {
  const fins: number[] = [];
  for (let i = 1; i <= 99; i++) fins.push(i * 0.02); // 0,02 à 1,98
  const larges: number[] = [];
  for (let i = 21; i <= 60; i++) larges.push(i * 0.1); // 2,1 à 6,0
  const positifs = [...fins, ...larges];
  return [...positifs.map((x) => -x), ...positifs];
}

const CANDIDATS_X: number[] = construireCandidatsX();

export const MINIMUM_POINTS_VALIDES = 6;
export const QUANTITE_POINTS_RETENUS = 8;

/**
 * Filtre `CANDIDATS_X` via `estValide`, retourne les `QUANTITE_POINTS_RETENUS` premiers si au
 * moins `MINIMUM_POINTS_VALIDES` sont trouvés, sinon `null` (l'appelant doit reroll).
 */
export function chercherPointsValides(estValide: (x: number) => boolean): number[] | null {
  const valides = CANDIDATS_X.filter(estValide);
  if (valides.length < MINIMUM_POINTS_VALIDES) return null;
  return valides.slice(0, QUANTITE_POINTS_RETENUS);
}
