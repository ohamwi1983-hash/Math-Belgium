/**
 * Couche core — "Équations/inéquations du second degré en contexte" (position 57), REFONTE
 * TOTALE : générateur entièrement autonome, SANS AUCUNE dépendance vers gen55 ("Problèmes
 * d'optimisation") ou `core/optimisation.types.ts` — contrairement à la version précédente, qui
 * embarquait `base: ExerciceOptimisation` et réutilisait 4 écrans/4 fonctions de vérification de
 * gen55 pour les familles "modelisation", plus 2 écrans additionnels pour une famille à système
 * à 2 inconnues ("achatGroupe"). Les 2 axes orthogonaux `voieSysteme`/`base.variante` ont disparu
 * avec eux : CHAQUE famille se résume désormais à une seule fonction quadratique `f(x)=ax²+bx+c`
 * DIRECTEMENT communiquée dans l'énoncé (narrativement justifiée, jamais issue d'un système à 2
 * équations), sur un domaine borné, lui aussi directement déductible du contexte.
 *
 * Toutes les 7 familles supportent les 2 variantes (`equation`/`inequation`), tirées aléatoirement
 * — aucune exception de type "cette famille n'existe qu'en équation" (contrairement à l'ancienne
 * famille "achatGroupe", retirée avec son système).
 *
 * Séquence UNIQUE à 4 écrans, pour toutes les familles : `poserEquationInequation → resoudre →
 * validation → interpretation` (terminale) — voir `moteur/typesEquationInequationSecondDegre.ts`.
 */

export type VarianteEquationInequationSecondDegre = "equation" | "inequation";

export type FamilleEquationInequationSecondDegre =
  | "jetEau"
  | "rendementEngrais"
  | "consommationCarburant"
  | "publiciteAudience"
  | "coutEntretienMachine"
  | "populationPoissons"
  | "sautEnLongueur";

export interface IntervalleBorne {
  inf: number;
  sup: number;
}

/** `f(x) = a·x² + b·x + c` — coefficients développés, jamais la forme sommet (celle-ci ne sert
 * qu'à la CONSTRUCTION, voir `generateurs/equationInequationSecondDegre/vertexForm.ts`). Type
 * local minimal, délibérément dupliqué depuis `core/optimisation.types.ts::CoefficientsQuadratiques`
 * (structure triviale à 3 champs, trop petite pour justifier un couplage inter-générateurs — même
 * principe que `generateurs/.../aleatoire.ts`, "dupliqué, pas partagé"). */
export interface CoefficientsQuadratiques {
  a: number;
  b: number;
  c: number;
}

export type GenreGrandeur = "masculin" | "feminin";

/** Toutes les données narratives, directement lisibles dans l'énoncé — plus aucun champ hérité de
 * gen55 (`sommet`/`optimal`/`identificationXY`/`contrainte`...), aucun n'étant utilisé par les 4
 * écrans de ce générateur. `questionFinale` reste `null` ici (toujours une chaîne vide au niveau
 * de ce type) : la VRAIE question finale est `ExerciceEquationInequationCommun.questionFinale`
 * ci-dessous, affichée séparément et en permanence (`components/QuestionFinale.tsx`) — les écrans
 * réutilisés affichent néanmoins ce champ (toujours `null`) via leur propre bloc `QuestionFinale`
 * interne, convention héritée telle quelle de l'ancienne version. */
export interface ContexteEquationInequationSecondDegre {
  phraseEnonce: string;
  labelVariable: string;
  nomVariable: string;
  nomGrandeur: string;
  genreGrandeur: GenreGrandeur;
  uniteVariable: string;
  uniteGrandeur: string;
  uniteGrandeurFautive: string;
  questionFinale: null;
}

export interface BaseEquationInequationSecondDegre {
  contexte: ContexteEquationInequationSecondDegre;
  fonction: CoefficientsQuadratiques;
  domaine: IntervalleBorne;
}

export interface OptionInterpretationEquationInequation {
  texte: string;
  correcte: boolean;
}

interface ExerciceEquationInequationCommun {
  famille: FamilleEquationInequationSecondDegre;
  base: BaseEquationInequationSecondDegre;
  /** Seuil introduit à l'écran "poserEquationInequation". */
  k: number;
  optionsInterpretation: OptionInterpretationEquationInequation[];
  /** Question finale de l'exercice (ex. "Pour quelle valeur de x le bénéfice vaut-il exactement
   * 450 € ?"), affichée PERSISTANTE sur les 4 écrans — toujours une chaîne réelle. */
  questionFinale: string;
}

/** `variante: "equation"` — `racinesCandidates` a TOUJOURS exactement 2 éléments triés croissant
 * (discriminant strictement positif par construction, jamais 0 ni 1 — voir `racines.ts`) ;
 * `racinesValides` = le sous-ensemble (0, 1 ou 2) qui tombe dans `base.domaine`. */
export interface ExerciceEquationSecondDegre extends ExerciceEquationInequationCommun {
  variante: "equation";
  racinesCandidates: [number, number];
  racinesValides: number[];
}

/** `variante: "inequation"` — `sens` fixé PAR FAMILLE (cohérent avec l'orientation de la parabole,
 * jamais tiré aléatoirement) : `"gt"` pour une parabole concave (f(x)>k = intervalle borné entre
 * les racines), `"lt"` pour une parabole convexe (f(x)<k = intervalle borné entre les racines).
 * `intervalleBrut` = solution de l'inéquation sur R (toujours un intervalle BORNÉ par
 * construction) ; `intervalleValide` = intersection avec `base.domaine`, TOUJOURS non vide par
 * construction (voir `racines.ts`). */
export interface ExerciceInequationSecondDegre extends ExerciceEquationInequationCommun {
  variante: "inequation";
  sens: "gt" | "lt";
  intervalleBrut: IntervalleBorne;
  intervalleValide: IntervalleBorne;
}

export type ExerciceEquationInequationSecondDegre = ExerciceEquationSecondDegre | ExerciceInequationSecondDegre;

export type GenerateurExerciceEquationInequationSecondDegre = () => ExerciceEquationInequationSecondDegre;
