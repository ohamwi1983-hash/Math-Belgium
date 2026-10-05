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

export function diagnostiquerDeviation(exercice: ExerciceApplicationPhysique, valeur: number): StatutVerification {
  return diagnostiquerCalculArrondi(valeur, exercice.triangle.C);
}

export function verifierDeviation(exercice: ExerciceApplicationPhysique, valeur: number): boolean {
  return diagnostiquerDeviation(exercice, valeur) === "correct";
}

export function verifierInterpretation(exercice: ExerciceApplicationPhysique, direction: string): boolean {
  return direction === exercice.directionCorrecte;
}
