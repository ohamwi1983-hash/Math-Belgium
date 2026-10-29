/**
 * Couche B — vérification pour "Applications physiques (résultante de vecteurs)" (chapitre
 * "Calcul vectoriel", huitième générateur). Aucune logique de calcul propre à ce générateur pour
 * les étapes numériques — mais une tolérance de vérification propre (`diagnostiquerCalculArrondi`,
 * "convention arrondie", voir plus bas), volontairement DISTINCTE de
 * `diagnostiquerCalculNumeriqueTriangle` (`verificationTriangle.ts`, chapitre 3), qui reste
 * inchangée pour ses quatre autres consommateurs (loi des sinus/des cosinus/aire/triangle
 * quelconque).
 */
import type { ExerciceApplicationPhysique, VarianteApplicationPhysique } from "../core/applicationPhysique.types";
import type { StatutVerification } from "./statutVerification";

export function verifierModelisation(exercice: ExerciceApplicationPhysique, choix: VarianteApplicationPhysique): boolean {
  return choix === exercice.variante;
}

const TOLERANCE_ARRONDI = 0.5;

/**
 * "Convention arrondie" (`promptgen29modificationscompletes.md`, points 4.2/5.2) — la consigne
 * demande une réponse arrondie à l'unité, mais la vérification accepte indifféremment une réponse
 * arrondie ou plus précise (ex. 2 décimales), tant qu'elle reste à ±0,5 de la vraie valeur —
 * l'écart maximal introduit par un arrondi à l'unité, jamais un rejet strict d'une précision
 * supérieure à celle demandée. Tolérance ABSOLUE fixe (contrairement à
 * `diagnostiquerCalculNumeriqueTriangle`, relative + plancher) — propre à ce générateur, pas
 * partagée.
 */
export function diagnostiquerCalculArrondi(valeur: number, attendu: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return Math.abs(valeur - attendu) <= TOLERANCE_ARRONDI ? "correct" : "not_equivalent";
}

export function diagnostiquerNorme(exercice: ExerciceApplicationPhysique, valeur: number): StatutVerification {
  return diagnostiquerCalculArrondi(valeur, exercice.triangle.a);
}

export function verifierNorme(exercice: ExerciceApplicationPhysique, valeur: number): boolean {
  return diagnostiquerNorme(exercice, valeur) === "correct";
}

/** Précisions auxquelles l'élève a pu arrondir la norme avant de la réutiliser : l'unité (ce que
 * la consigne de l'écran « norme » autorise), le dixième, le centième. */
const DECIMALES_NORME_REUTILISEE = [0, 1, 2];

function arrondir(valeur: number, decimales: number): number {
  const facteur = 10 ** decimales;
  return Math.round(valeur * facteur) / facteur;
}

/**
 * Déviations acceptées (audit chapitre 6, point 3) — la valeur exacte `triangle.C`, plus celle que
 * trouve un élève qui suit la consigne : il arrondit la norme (à l'unité, au dixième ou au
 * centième), puis la réinjecte dans la loi des sinus du cours,
 * `sin(déviation) / ‖v₂‖ = sin θ / ‖v_R‖`. Avec une norme arrondie à l'unité, l'écart dépassait
 * ±0,5° pour environ un quart des exercices « forces » (petites normes), et l'élève était refusé
 * alors qu'il avait tout bien fait. Même branche que `triangle.C` (aiguë ou obtuse) : le traitement
 * d'une déviation supérieure à 90° n'est pas modifié ici.
 */
export function deviationsAcceptables(exercice: ExerciceApplicationPhysique): number[] {
  const deviation = exercice.triangle.C;
  const sinTheta = Math.sin((exercice.angleEntreVecteurs * Math.PI) / 180);
  const valeurs = [deviation];
  for (const decimales of DECIMALES_NORME_REUTILISEE) {
    const sinDeviation = (exercice.v2 * sinTheta) / arrondir(exercice.triangle.a, decimales);
    if (sinDeviation > 1) continue;
    const aigu = (Math.asin(sinDeviation) * 180) / Math.PI;
    valeurs.push(deviation < 90 ? aigu : 180 - aigu);
  }
  return valeurs;
}

/** ±1° autour de chaque déviation acceptée : couvre en plus un sinus arrondi en cours de calcul
 * (ex. « ≈ 0,371 », comme l'exemple du cours) suivi de l'arrondi final à l'unité — deux arrondis
 * successifs qui, à ±0,5°, refusaient encore environ 4 % des élèves qui suivaient la consigne. Les
 * erreurs plausibles qui tomberaient dans cette fenêtre sont écartées dès le tirage
 * (`generateurs/applicationPhysique/index.ts::erreursPlausiblesDeviation`). */
export const TOLERANCE_DEVIATION = 1;

export function diagnostiquerDeviation(exercice: ExerciceApplicationPhysique, valeur: number): StatutVerification {
  if (!Number.isFinite(valeur)) return "parse_error";
  return deviationsAcceptables(exercice).some((attendu) => Math.abs(valeur - attendu) <= TOLERANCE_DEVIATION)
    ? "correct"
    : "not_equivalent";
}

export function verifierDeviation(exercice: ExerciceApplicationPhysique, valeur: number): boolean {
  return diagnostiquerDeviation(exercice, valeur) === "correct";
}

export function verifierInterpretation(exercice: ExerciceApplicationPhysique, direction: string): boolean {
  return direction === exercice.directionCorrecte;
}
