/**
 * Couche A — petites fonctions d'arrondi PURES pour "Inégalité de Bienaymé-Tchebychev" (chapitre 5).
 * Contrairement à la première version de ce générateur (pools de valeurs "propres" garantissant une
 * décimale finie), cette refonte n'a plus besoin d'aucun pool : chaque champ "Attendu" du contrat
 * (Couche A) est directement la valeur ARRONDIE selon la règle propre à ce champ — la vérification
 * (Couche B) compare alors la saisie de l'élève à cette valeur déjà arrondie, à une tolérance
 * flottante minime (bruit de virgule flottante résiduel, jamais une vraie marge d'arrondi — voir
 * `verificationBienaymeTchebychev.ts`).
 *
 * Chaque fonction ajoute/retranche un epsilon minime avant d'arrondir — protection contre le bruit
 * de virgule flottante (ex. `41.999999999999996` doit arrondir à `42`, jamais rester bloqué juste
 * en dessous d'un seuil entier par accumulation d'imprécision), jamais une vraie marge de tolérance
 * mathématique.
 */

const EPSILON = 1e-9;

/** Arrondi standard (le plus proche), à 2 décimales — utilisé pour `k`, jamais pour un champ final
 * "garanti" (pourcentage/intervalle/nombre d'individus), qui suit sa propre règle protectrice. */
export function arrondi2(valeur: number): number {
  return Math.round((valeur + EPSILON) * 100) / 100;
}

/** Arrondi standard (le plus proche), à l'unité — utilisé pour σ/x̄ (variantes 5 à 8), qui n'ont
 * aucun piège d'arrondi particulier ("arrondi mathématique standard"). */
export function arrondiUnite(valeur: number): number {
  return Math.round(valeur + EPSILON);
}

/** Arrondi VERS LE BAS, à l'unité — jamais promettre plus que ce que l'inégalité garantit
 * (pourcentage minimal final, nombre minimal d'individus). */
export function arrondiVersLeBas(valeur: number): number {
  return Math.floor(valeur + EPSILON);
}

/** Arrondi VERS LE HAUT, à l'unité — jamais promettre un intervalle plus étroit que ce que
 * l'inégalité garantit (borne supérieure d'un intervalle final). */
export function arrondiVersLeHaut(valeur: number): number {
  return Math.ceil(valeur - EPSILON);
}
