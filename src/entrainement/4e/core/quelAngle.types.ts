/**
 * Couche core — "Quel angle ?" (chapitre 3, générateur en position 18, remplace "Loi des cosinus"
 * — voir `promptcreationgenerateur18quelangle.md` + `promptextensiongenerateur18costan.md`, qui
 * étend la variante sin d'origine aux variantes cos/tan). Étant donné `sin α = k` (ou `cos α = k`,
 * `tan α = k`) où `k` est une valeur remarquable exacte, retrouver toutes les valeurs de `α` sur
 * `[0°,360°[`. Réutilise directement `AngleRemarquable` de `valeursRemarquables.types.ts`
 * (générateur 15) pour l'angle de référence — même couplage assumé que le reste du projet — et
 * `Quadrant` de `cercleTrigonometrique.types.ts` (générateur 14) pour la géométrie des aides.
 */
import type { AngleRemarquable } from "./valeursRemarquables.types";

export type FonctionTrig = "sin" | "cos" | "tan";

/**
 * `angleReference` (`réf`, tel que `|fonction(réf)| = |k|`) et `signeK` déterminent entièrement `k`
 * — jamais stocké comme un flottant à part, toujours recomposé à l'affichage depuis ces deux champs
 * exacts (`ui/formatQuelAngle.ts`, réutilise les tables LaTeX exactes de `valeursRemarquables`).
 * `réf=0` est EXCLU pour `sin`/`tan` et `réf=90` est EXCLU pour `cos`/`tan` (voir
 * `generateurs/quelAngle/index.ts`) : ces valeurs donneraient `k=0`, un cas dégénéré où "le signe de
 * k" ne détermine plus aucun quadrant (toute la chaîne de raisonnement pédagogique de cet exercice
 * repose sur le signe de `k`) — jamais généré, contrairement à `valeursRemarquables` qui couvre les
 * 5 angles remarquables sans restriction.
 *
 * `solutions` est déjà dédupliquée et triée croissant à la génération : 1 seule valeur quand
 * `réf=90` (sin, `k=±1`) ou `réf=0` (cos, `k=±1`) — les deux candidats bruts coïncident alors
 * exactement, aucun cas spécial n'est nécessaire dans le code de construction, la déduplication
 * suffit — toujours 2 valeurs distinctes sinon (jamais 0, `|k|` est toujours `≤1` par construction).
 * Pour `tan`, `réf` ne vaut jamais 0 ni 90 : toujours exactement 2 solutions, jamais de collapse
 * possible (les deux candidats sont toujours espacés d'exactement 180°, jamais confondus).
 */
export interface ExerciceQuelAngle {
  fonction: FonctionTrig;
  angleReference: AngleRemarquable;
  signeK: 1 | -1;
  solutions: number[];
}

/** Réponse "add-as-needed" (pattern déjà en place, ex. `EtapeZerosCaracteristiques.tsx`) : `aucune`
 * est structurellement sélectionnable mais n'est, en pratique, jamais la bonne réponse — `|k|>1`
 * (le seul cas à 0 solution) n'est jamais généré. */
export interface ReponseQuelAngle {
  aucune: boolean;
  valeurs: number[];
}

export type GenerateurExerciceQuelAngle = () => ExerciceQuelAngle;
