/**
 * Couche core — « Viser une cible : trajectoires rectilignes » (gen89, 4e, chapitre 6 « Calcul
 * vectoriel », section « colinearite », processus 3 TRANSFÉRER, exercice EN CONTEXTE).
 *
 * Un objet part du point A en ligne droite, dans la direction ET le sens d'un vecteur u⃗ ; une
 * cible est immobile en C. Modèle : objet et cible sont des points, la trajectoire est la
 * demi-droite d'origine A dirigée par u⃗. La cible est touchée si, et seulement si, AC⃗ = k·u⃗
 * avec k > 0 (critère de colinéarité du cours, puis SENS).
 *
 * - Sens direct : u⃗ est donné ; trois issues (verdicts équilibrés) — la cible est touchée,
 *   la trajectoire passe à côté (de très près : l'œil ne suffit pas), ou la cible est sur la bonne
 *   droite mais derrière A (k < 0 : le piège central).
 * - Sens inverse : une composante de u⃗ est un paramètre m ; on cherche m pour toucher la cible.
 *   Deux issues : m convient (k > 0), ou la seule valeur de m qui rend u⃗ colinéaire à AC⃗ donne
 *   k < 0 — aucune valeur ne convient avec la composante imposée.
 */
import type { Composantes, Point } from "./vecteur.types";

export type SituationViserCible = "billard" | "laser" | "foot" | "curling";

export type SensViserCible = "directe" | "inverse";

/** Issue du sens direct. */
export type VerdictDirect = "touche" | "cote" | "derriere";

/** Issue du sens inverse. */
export type VerdictInverse = "possible" | "impossible";

/** Vecteurs proposés à l'écran 1 (« quel vecteur comparer à u⃗ ? »). */
export type OptionVecteur = "AC" | "CA" | "OC";

export interface ExerciceViserCible {
  sens: SensViserCible;
  situation: SituationViserCible;
  A: Point;
  C: Point;
  /** Direction du lancer. Sens inverse : la composante `inconnue` vaut la SOLUTION m (cachée). */
  u: Composantes;
  /** Sens inverse : la composante de u⃗ à déterminer (paramètre m) ; `null` en sens direct. */
  inconnue: "x" | "y" | null;
  /** Ordre d'affichage des vecteurs de l'écran 1 (tiré au hasard). */
  ordreVecteurs: OptionVecteur[];
}
