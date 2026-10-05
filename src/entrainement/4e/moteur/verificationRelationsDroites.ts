/**
 * Couche B — vérification de "Relations entre droites (parallèle/perpendiculaire)". Thin dispatch
 * sur les primitives partagées de `verificationDroite.ts` (module FRÈRE), jamais une seconde
 * logique de comparaison réécrite — même principe que les 3 générateurs "droite" précédents.
 *
 * Écran 1 (extraction) et écran 2 (construction) comparent toujours contre `exercice.vecteurReference`,
 * jamais un couple exact imposé (proportionnalité/orthogonalité, scale-invariant). Écran 3
 * (équation) compare toujours contre `exercice.referenceImpliciteSortie`/`exercice.vecteurCherche`
 * — la vérité canonique calculée une fois pour toutes à la génération, jamais recalculée depuis la
 * saisie de l'élève à l'écran 2 (garanti valable par transitivité : tout vecteur accepté à l'écran 2
 * est colinéaire à `vecteurReference`, donc aussi à `vecteurCherche`, qui vaut lui-même
 * `vecteurReference` ou son perpendiculaire).
 */
import type { ExerciceRelationsDroites } from "../core/relationsDroites.types";
import { diagnostiquerEquationDroiteLibre, diagnostiquerPointVecteurParametrique, statutVecteurColineaire, statutVecteurOrthogonal } from "./verificationDroite";
import type { StatutVerification } from "./statutVerification";

export interface ReponseVecteur {
  x: number;
  y: number;
}

export function diagnostiquerExtraction(exercice: ExerciceRelationsDroites, reponse: ReponseVecteur): StatutVerification {
  return statutVecteurColineaire({ x: reponse.x, y: reponse.y }, exercice.vecteurReference);
}

export function verifierExtraction(exercice: ExerciceRelationsDroites, reponse: ReponseVecteur): boolean {
  return diagnostiquerExtraction(exercice, reponse) === "correct";
}

export function diagnostiquerConstruction(exercice: ExerciceRelationsDroites, reponse: ReponseVecteur): StatutVerification {
  const vecteur = { x: reponse.x, y: reponse.y };
  return exercice.critere === "parallele" ? statutVecteurColineaire(vecteur, exercice.vecteurReference) : statutVecteurOrthogonal(vecteur, exercice.vecteurReference);
}

export function verifierConstruction(exercice: ExerciceRelationsDroites, reponse: ReponseVecteur): boolean {
  return diagnostiquerConstruction(exercice, reponse) === "correct";
}

export function diagnostiquerEquationCartesienne(exercice: ExerciceRelationsDroites, texte: string): StatutVerification {
  return diagnostiquerEquationDroiteLibre(texte, exercice.referenceImpliciteSortie);
}

export function verifierEquationCartesienne(exercice: ExerciceRelationsDroites, texte: string): boolean {
  return diagnostiquerEquationCartesienne(exercice, texte) === "correct";
}

export interface ReponseParametrique {
  x0: number;
  y0: number;
  a: number;
  b: number;
}

export function diagnostiquerEquationParametrique(exercice: ExerciceRelationsDroites, reponse: ReponseParametrique): StatutVerification {
  return diagnostiquerPointVecteurParametrique({ x: reponse.x0, y: reponse.y0 }, { x: reponse.a, y: reponse.b }, exercice.referenceImpliciteSortie, exercice.vecteurCherche);
}

export function verifierEquationParametrique(exercice: ExerciceRelationsDroites, reponse: ReponseParametrique): boolean {
  return diagnostiquerEquationParametrique(exercice, reponse) === "correct";
}
