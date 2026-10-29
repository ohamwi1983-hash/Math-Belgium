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
 *
 * Trois familles de cas (audit du chapitre 5 : 22 exercices distincts seulement, et « Pas de
 * solution » jamais la bonne réponse) :
 * - cas courant, `|k|` remarquable non nul : 2 solutions (1 seule quand `k = ±1` pour sin/cos, les
 *   deux candidats coïncidant alors sur un axe) ;
 * - `k = 0` (`réf = 0` pour sin/tan, `réf = 90` pour cos, toujours `signeK = 1`) : 2 solutions sur
 *   un axe ;
 * - `|k| > 1` (sin/cos uniquement, `angleReference = null`) : AUCUNE solution, `solutions = []`.
 *
 * `solutions` est déjà dédupliquée et triée croissant à la génération.
 */
export interface ExerciceQuelAngle {
  fonction: FonctionTrig;
  /** `null` ⟺ `|k| > 1` (sin/cos uniquement) : aucune solution, `k` est alors décrit par
   * `magnitudeHorsDomaineLatex`. */
  angleReference: AngleRemarquable | null;
  /** LaTeX de `|k|` quand `|k| > 1` (ex. `\\frac{3}{2}`, `\\sqrt{2}`), sinon `null`. */
  magnitudeHorsDomaineLatex: string | null;
  signeK: 1 | -1;
  solutions: number[];
}

/** Réponse "add-as-needed" (pattern déjà en place, ex. `EtapeZerosCaracteristiques.tsx`) : `aucune`
 * est la bonne réponse quand `|k| > 1` (`solutions = []`). */
export interface ReponseQuelAngle {
  aucune: boolean;
  valeurs: number[];
}

export type GenerateurExerciceQuelAngle = () => ExerciceQuelAngle;
