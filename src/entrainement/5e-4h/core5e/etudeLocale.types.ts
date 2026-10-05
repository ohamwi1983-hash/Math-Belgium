/**
 * Couche core (5e) — contrat pour 5gen29 ("Étude locale (extremums et points critiques)"), 6e
 * générateur du chapitre "Dérivées et applications". f(x) est toujours une fonction réelle
 * authentique (nécessaire aux écrans "valeur de f en..."), f'(x) ET f''(x) sont TOUJOURS FOURNIS à
 * l'élève (jamais dérivés par lui — c'est la compétence de 5gen27), 3 familles
 * STRUCTURELLEMENT DISJOINTES pondérées ~40% "polynomiale" / ~30% "rationnelleSansCE" / ~30%
 * "rationnelleAvecCE". Type pur, aucune logique (la construction "à l'envers" et les formules
 * fermées vivent en Couche A, `generateurs5e/etudeLocale/index.ts`).
 */
import type { FractionExacte } from "./limites.types";

/**
 * Racine (de f' ou de f'') — soit une valeur EXACTE (rationnelle, éventuellement entière), soit
 * une racine IRRATIONNELLE représentée par `centre ± √radicande`. `signe` distingue laquelle des 2
 * racines conjuguées cet objet représente — écart DÉLIBÉRÉ par rapport à la forme
 * `{exact:false;centre;radicande}` suggérée sans signe : sans lui, les 2 racines irrationnelles
 * distinctes (toujours construites PAR PAIRE dans ce générateur) seraient représentées par 2 objets
 * structurellement identiques, indiscernables autrement que par leur position dans un tableau —
 * fragile pour le tri/l'affichage/la vérification, qui doivent chacun rester indépendants (jamais
 * re-dériver "lequel est-ce" d'un ordre implicite). `signe` rend chaque racine AUTO-PORTANTE,
 * conforme à la règle "jamais re-dérivé à la vérification" de la tâche.
 */
export type RacineEtudeLocale = { exact: true; valeur: FractionExacte } | { exact: false; centre: number; radicande: number; signe: 1 | -1 };

export type NatureRacinesEtudeLocale = "simple" | "double" | "irrationnelle";
export type NiveauEtudeLocale = "base" | "avance";
export type TypeFonctionEtudeLocale = "polynomiale" | "rationnelleSansCE" | "rationnelleAvecCE";

/** Classification d'une racine de f'(x)=0 — le piège central du générateur : une racine DOUBLE
 * touche zéro sans que f' change de signe, donc "ni_lun_ni_lautre", JAMAIS un extremum. */
export type ClassificationExtremum = "max" | "min" | "ni_lun_ni_lautre";

/** Classification d'une racine de f''(x)=0 — même logique un niveau au-dessus : un vrai point
 * d'inflexion exige un changement de signe réel de f'' à cet endroit, jamais supposé automatique. */
export type ClassificationInflexion = "pi" | "pas_de_pi";

interface ExerciceEtudeLocaleCommun {
  niveau: NiveauEtudeLocale;
  /** Racines de f'(x)=0, triées CROISSANT sur la droite réelle — longueur 1 (rationnelle, ou
   * polynomiale "double") ou 2 (polynomiale "simple"/"irrationnelle"). Vérité terrain, jamais
   * recalculée en résolvant f'(x)=0 une seconde fois côté vérification. */
  racinesFPrime: RacineEtudeLocale[];
  /** Même longueur/ordre que `racinesFPrime` — classification calculée UNE FOIS à la génération
   * (analyse du changement de signe réel de f' autour de chaque racine), jamais re-dérivée en
   * relisant le tableau de signes rempli par l'élève. */
  classificationFPrime: ClassificationExtremum[];
  /** Racines de f''(x)=0 — toujours vide si `niveau==="base"` (écrans 5-7 sautés). */
  racinesFSeconde: RacineEtudeLocale[];
  /** Même longueur/ordre que `racinesFSeconde`. */
  classificationFSeconde: ClassificationInflexion[];
  /** Valeurs interdites du domaine (CE) — uniquement non vide pour `rationnelleAvecCE`. */
  exclusionsCE: number[];
}

/** f(x) = a·x³+b·x²+c·x+d, construit "à l'envers" à partir des racines CHOISIES de f'(x)=0 (même
 * technique que 5gen28 variante B, `construireHorizontaleAvecRacines`). */
export interface ExerciceEtudeLocalePolynomiale extends ExerciceEtudeLocaleCommun {
  type: "polynomiale";
  natureRacines: NatureRacinesEtudeLocale;
  a: number;
  b: number;
  c: number;
  d: number;
}

/** f(x) = c / ((x-e)²+k) — N(x)=c CONSTANT (ce qui rend f'/f'' fermées et simples, voir la Couche
 * A). `k>0` ⟹ D(x) jamais nul ⟹ domaine=ℝ ⟹ "rationnelleSansCE" ; `k<0` (`k=-m²`) ⟹ 2 exclusions
 * réelles `e±m` ⟹ "rationnelleAvecCE" (toujours `niveau==="base"` pour cette sous-famille — voir
 * Couche A : `k≤0` ⟹ f''(x)=0 n'a structurellement AUCUNE solution réelle). */
export interface ExerciceEtudeLocaleRationnelle extends ExerciceEtudeLocaleCommun {
  type: "rationnelleSansCE" | "rationnelleAvecCE";
  c: number;
  e: number;
  k: number;
}

export type ExerciceEtudeLocale = ExerciceEtudeLocalePolynomiale | ExerciceEtudeLocaleRationnelle;
export type GenerateurExerciceEtudeLocale = () => ExerciceEtudeLocale;

// ============================================================================
// Tableau de signes étendu (écrans "tableauFPrime"/"tableauFSeconde") — types partagés entre
// Couche B (construction de l'attendu, `moteur5e/verificationEtudeLocale.ts`) et Couche
// présentation (builder interactif + recap, `components5e/`). Aucune logique ici.
// ============================================================================

export type ValeurSigneTableau = "+" | "-" | "0" | "∄";
export type ValeurVariationZone = "↗" | "↘";
export type ValeurConcaviteZone = "∪" | "∩";

/** Cellule de la ligne 2 (variations de f OU concavité de f) — union des 2 vocabulaires possibles
 * selon le tableau (f' : zone ↗/↘ + point max/min/ni_lun_ni_lautre ; f'' : zone ∪/∩ +
 * point pi/pas_de_pi), jamais mélangés au sein d'un même tableau — le composant consommateur sait
 * toujours lequel des 2 vocabulaires est pertinent via son `mode`. */
export type ValeurLigne2Tableau = ValeurVariationZone | ClassificationExtremum | ValeurConcaviteZone | ClassificationInflexion;

export type TypeColonneTableauEtudeLocale = "zone" | "racine" | "exclusion";

export interface ColonneTableauEtudeLocale {
  type: TypeColonneTableauEtudeLocale;
  /** Index dans `racinesFPrime`/`racinesFSeconde` (type==="racine") ou `exclusionsCE`
   * (type==="exclusion") ; -1 pour une zone (aucun marqueur associé). */
  index: number;
}
