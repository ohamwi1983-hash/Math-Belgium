import type { RationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";

export type { RationnelPi };

export type FonctionTrig = "sin" | "cos" | "tan";

export type RegimeEquationTrig = "exact" | "decimal";

/** Coefficient a de l'argument (ax+b) — un rationnel plat, JAMAIS lié à π (contrairement à b). */
export interface CoefficientRationnel {
  numerateur: number;
  denominateur: number;
}

/**
 * Une valeur pouvant être une fraction EXACTE de π (régime "exact", ex. b=-π/4, une constante ou une
 * période de branche) ou un nombre décimal brut (régime "decimal") — `decimal` est TOUJOURS
 * renseigné (valeur numérique réelle, exacte ou approchée), `exact` ne l'est qu'en régime "exact".
 * Voir CLAUDE.md section 5gen10 : par construction, dans un même exercice, soit TOUTES les valeurs
 * de ce type ont `exact !== null`, soit AUCUNE ne l'a — jamais un mélange (ce qui produirait une
 * réponse "mixte" π-plus-constante ni propre ni pédagogiquement honnête).
 */
export interface ValeurPiOuDecimale {
  exact: RationnelPi | null;
  decimal: number;
}

/** La valeur cible k (jamais elle-même un multiple de π — c'est une valeur du cosinus/sinus/tangente,
 * potentiellement irrationnelle comme √3/2, jamais représentée via `RationnelPi`). */
export interface ValeurCible {
  valeur: number;
  latex: string;
}

/** Une branche de solutions pour l'argument u=ax+b (écran 1) : u = constante + périodeen·n, n∈Z. */
export interface BrancheAngle {
  constante: ValeurPiOuDecimale;
  periode: ValeurPiOuDecimale;
}

/** Une branche de solutions pour x (écran 2), dérivée de `BrancheAngle` en divisant par a — même
 * forme, mêmes champs, type distinct pour ne jamais confondre "branche en u" et "branche en x". */
export interface BrancheX {
  constante: ValeurPiOuDecimale;
  periode: ValeurPiOuDecimale;
}

export interface ExerciceEquationTrig {
  fonction: FonctionTrig;
  a: CoefficientRationnel;
  b: ValeurPiOuDecimale;
  k: ValeurCible;
  regime: RegimeEquationTrig;
  /** cos/sin uniquement, |k|>1 — jamais vrai pour tan. Écrans 2/3 sautés si vrai. */
  aucuneSolution: boolean;
  /** cos/sin uniquement, k=±1 — branche UNIQUE (au lieu de deux) ; jamais vrai pour tan (qui n'a
   * pas de restriction de domaine, donc pas de cas spécial de ce type). */
  casSpecial: boolean;
  /** 0 (aucuneSolution), 1 (casSpecial ou tan), ou 2 (cas général cos/sin) branches. */
  branchesU: BrancheAngle[];
  /** Même longueur que `branchesU`, dérivées en divisant par `a` — vide si `aucuneSolution`. */
  branchesX: BrancheX[];
  /** Solutions distinctes dans [0;2π[, radians, triées croissant — vide si `aucuneSolution`. */
  solutions: number[];
}

export type GenerateurExerciceEquationTrig = () => ExerciceEquationTrig;

// ============================================================================
// Extension — 4 familles de techniques + écran 0 "reconnaissance" (voir CLAUDE.md
// section 5gen10, "Extension — 4 familles"). `ExerciceEquationTrig` ci-dessus (famille
// "directe") reste INCHANGÉ — réutilisé tel quel comme brique par les familles 2/3, jamais
// redéveloppé.
// ============================================================================

/** Les 4 techniques — identiques au discriminant `famille` de `ExerciceEquationTrigonometrique`
 * ci-dessous, exposées ici comme type nommé pour l'écran 0 (reconnaissance). */
export type FamilleEquationTrigonometrique = "directe" | "produit" | "pythagoricienne" | "egalite";

// ===== Famille 2 — Produit de facteurs =====

export type SousCasProduitFacteurs = "factoree" | "nonFactoree";

export interface ExerciceProduitFacteurs {
  famille: "produit";
  sousCas: SousCasProduitFacteurs;
  /** Toujours `trig(x)=0` — le facteur "trivial" commun aux 2 exemples de la spec (tan x=0, cos x=0). */
  facteur1: ExerciceEquationTrig;
  facteur2: ExerciceEquationTrig;
  /** Union triée/dédupliquée (tolérance) des solutions des 2 facteurs, dans [0;2π[. */
  solutionsUnion: number[];
}

// ===== Famille 3 — Substitution pythagoricienne =====

export interface RacinePythagoricienne {
  t: number;
  /** `true` ssi |t|>1 — aucune solution trigonométrique réelle, l'élève doit explicitement REJETER
   * cette racine plutôt que tenter de la résoudre. */
  invalide: boolean;
  /** Résolution complète de trig(x)=t, TOUJOURS a=1/b=0 (spec explicite) — `null` ssi `invalide`. */
  resolution: ExerciceEquationTrig | null;
}

export interface ExercicePythagoricienne {
  famille: "pythagoricienne";
  /** La fonction VISÉE par la substitution — cos ou sin uniquement (l'identité sin²+cos²=1 ne
   * s'applique naturellement qu'à ces deux-là, jamais tan). */
  fonctionCible: "cos" | "sin";
  /** Coefficients α·T²+β·T+γ=0 du polynôme cible, T=fonctionCible(x). */
  alpha: number;
  beta: number;
  gamma: number;
  racine1: RacinePythagoricienne;
  racine2: RacinePythagoricienne;
  /** Union des solutions des racines VALIDES, dans [0;2π[ — vide si les 2 racines sont invalides. */
  solutionsUnion: number[];
}

// ===== Famille 4 — Égalité de deux expressions trigonométriques =====

/** 3 identités canoniques à UN SEUL pas de conversion (simplification assumée par rapport à la
 * spec, qui envisage des chaînes à plusieurs pas — voir CLAUDE.md section 5gen10). */
export type IdentiteEgalite = "cosVersCos" | "sinVersSin" | "tanVersTan";

export interface ExerciceEgaliteExpressions {
  famille: "egalite";
  identite: IdentiteEgalite;
  a1: CoefficientRationnel;
  b1: ValeurPiOuDecimale;
  a2: CoefficientRationnel;
  b2: ValeurPiOuDecimale;
  /** Les 2 branches finales en x, DÉJÀ isolées — écrans "appliquer l'identité"/"isoler x" de la
   * spec FUSIONNÉS en un seul (voir CLAUDE.md, simplification assumée). */
  branches: BrancheX[];
  solutions: number[];
}

export type ExerciceEquationTrigonometrique =
  | { famille: "directe"; exercice: ExerciceEquationTrig }
  | ExerciceProduitFacteurs
  | ExercicePythagoricienne
  | ExerciceEgaliteExpressions;

export type GenerateurExerciceEquationTrigonometrique = () => ExerciceEquationTrigonometrique;
