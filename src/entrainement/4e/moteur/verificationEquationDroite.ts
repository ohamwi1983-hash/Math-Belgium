/**
 * Couche B — vérification propre à "Équation d'une droite". Dispatch fin sur les primitives
 * partagées de `verificationDroite.ts` (moteur→moteur, toujours autorisé) — jamais de logique de
 * comparaison réécrite ici.
 */
import type { ExerciceEquationDroite } from "../core/equationDroite.types";
import type { Composantes, Point } from "../core/vecteur.types";
import type { StatutVerification } from "./statutVerification";
import {
  combinerStatuts,
  diagnostiquerEquationDroiteLibre,
  diagnostiquerPointVecteurParametrique,
  diagnostiquerRepresentationParametriqueTexte,
  statutNumerique,
  statutTripletProportionnel,
} from "./verificationDroite";

// ============================================================================
// Écran 1 — extraction commune (point + vecteur directeur).
// ============================================================================

export interface ReponseExtraction {
  x0: number;
  y0: number;
  a: number;
  b: number;
}

export function diagnostiquerExtraction(exercice: ExerciceEquationDroite, reponse: ReponseExtraction): StatutVerification {
  const point: Point = { x: reponse.x0, y: reponse.y0 };
  const vecteur: Composantes = { x: reponse.a, y: reponse.b };
  return diagnostiquerPointVecteurParametrique(point, vecteur, exercice.referenceImplicite, exercice.vecteur);
}

export function verifierExtraction(exercice: ExerciceEquationDroite, reponse: ReponseExtraction): boolean {
  return diagnostiquerExtraction(exercice, reponse) === "correct";
}

// ============================================================================
// Écran 2 — possibilité de la forme cible.
// ============================================================================

export function verifierPossibilite(exercice: ExerciceEquationDroite, reponse: "possible" | "impossible"): boolean {
  return (reponse === "possible") === exercice.possible;
}

// ============================================================================
// Écran fusionné "possibilité + équation" — formes explicite_y/explicite_x uniquement
// (`promptgen42modificationsv2.md`, partie A) : remplace l'ancien couple "possibilite" +
// "coefficients" séparés par un seul écran. Le champ texte libre est vérifié par
// `diagnostiquerEquationDroiteLibre` (module frère, déjà réutilisé par "Lecture graphique —
// équation d'une droite"/"Relations entre droites"/"Distance point-droite et droite-droite") — il
// accepte N'IMPORTE QUELLE forme valide, donc le même critère sert indifféremment que l'élève ait
// répondu "possible" (équation attendue dans la forme testée) ou "impossible" (équation attendue
// sous forme implicite de secours) : les deux décrivent en réalité la MÊME droite de référence
// (`referenceImplicite`), jamais deux critères distincts.
// ============================================================================

export interface ReponsePossibiliteCoefficients {
  choix: "possible" | "impossible";
  texte: string;
}

export function diagnostiquerPossibiliteCoefficients(exercice: ExerciceEquationDroite, reponse: ReponsePossibiliteCoefficients): StatutVerification {
  const statutTexte = diagnostiquerEquationDroiteLibre(reponse.texte, exercice.referenceImplicite);
  if (statutTexte === "parse_error") return "parse_error";
  const choixCorrect = (reponse.choix === "possible") === exercice.possible;
  return choixCorrect && statutTexte === "correct" ? "correct" : "not_equivalent";
}

export function verifierPossibiliteCoefficients(exercice: ExerciceEquationDroite, reponse: ReponsePossibiliteCoefficients): boolean {
  return diagnostiquerPossibiliteCoefficients(exercice, reponse) === "correct";
}

// ============================================================================
// Écran 3 — coefficients de la forme cible.
// ============================================================================

/** Saisie en 2 champs de texte libre (`promptgen42modifications.md`, point 2) — plus une
 * comparaison numérique de 4 valeurs par proportionnalité, `x0`/`y0`/`a`/`b` sont désormais
 * EXTRAITS de chaque expression par `diagnostiquerRepresentationParametriqueTexte`, jamais saisis
 * directement. */
export interface ReponseParametrique {
  texteX: string;
  texteY: string;
}
export interface ReponseImplicite {
  a: number;
  b: number;
  c: number;
}
export interface ReponseExpliciteY {
  m: number;
  p: number;
}
export interface ReponseExpliciteX {
  n: number;
  q: number;
}

export function diagnostiquerParametrique(exercice: ExerciceEquationDroite, reponse: ReponseParametrique): StatutVerification {
  return diagnostiquerRepresentationParametriqueTexte(reponse.texteX, reponse.texteY, exercice.referenceImplicite, exercice.vecteur);
}

export function diagnostiquerImplicite(exercice: ExerciceEquationDroite, reponse: ReponseImplicite): StatutVerification {
  return statutTripletProportionnel(reponse, exercice.referenceImplicite);
}

export function diagnostiquerExpliciteY(exercice: ExerciceEquationDroite, reponse: ReponseExpliciteY): StatutVerification {
  if (exercice.refExpliciteY === null) return "parse_error";
  return combinerStatuts(statutNumerique(reponse.m, exercice.refExpliciteY.m), statutNumerique(reponse.p, exercice.refExpliciteY.p));
}

export function diagnostiquerExpliciteX(exercice: ExerciceEquationDroite, reponse: ReponseExpliciteX): StatutVerification {
  if (exercice.refExpliciteX === null) return "parse_error";
  return combinerStatuts(statutNumerique(reponse.n, exercice.refExpliciteX.n), statutNumerique(reponse.q, exercice.refExpliciteX.q));
}
