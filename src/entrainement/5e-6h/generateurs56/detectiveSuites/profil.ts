// Copie 5e (6h) de `5e-4h/generateurs5e/detectiveSuites/profil.ts` (56gen10 ← 5gen49, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDetectiveSuites } from "./core/detectiveSuites.types";

/**
 * Profil d'instance de 5gen49 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré », et fiche validée par l'utilisateur).
 *
 * - La VARIANTE fixe l'exercice support (arithmétique, géométrique, pourcentage, convergence).
 * - La LIGNE FAUSSE et le TYPE D'ERREUR sont les verdicts des étapes a) et b) : tirés au hasard
 *   dans chaque série (équiprobables dans la variante, `index.ts`), JAMAIS dans `forme` — sinon la
 *   série B aurait la même erreur à la même ligne que la série A (réponse recopiable). Différence
 *   assumée avec 6gen88, où la variante était le type d'erreur.
 * - `forme` = la variante seule (même support, même nombre de lignes de copie, même démarche ;
 *   sous-cas « somme infinie » / « limite » de la convergence non figé, car le support limite
 *   entraîne toujours l'erreur « puissance » : le figer trahirait le verdict). Probabilité 1 dans
 *   sa variante : 20 000 essais suffisent largement.
 * - Aucun cas particulier : chaque copie demande la même démarche (trouver, nommer, corriger).
 * - `calcul` : seulement pour la variante « pourcentage », où le mode (exact : q = 1,5 ; 1,25 ;
 *   1,2 ; 0,75 ; 0,8 — calculatrice : pourcentage quelconque, arrondi à l'unité) est tiré à pile
 *   ou face INDÉPENDAMMENT du type d'erreur (leçon de 5gen47 : la contrainte de calculatrice ne
 *   doit pas trahir le verdict). Les autres variantes sont toujours exactes : pas de `calcul`.
 */
export function profilDetectiveSuites(e: ExerciceDetectiveSuites): ProfilInstance {
  if (e.variante === "pourcentage") return { casParticulier: null, forme: e.variante, calcul: e.mode === "exact" ? "exacte" : "calculatrice" };
  return { casParticulier: null, forme: e.variante };
}
