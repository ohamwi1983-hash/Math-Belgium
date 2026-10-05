/**
 * Couche core (5e) — contrat pour 5gen28 ("Tangentes"), 4e générateur du chapitre "Dérivées et
 * applications", à la suite de 5gen27. 3 variantes STRUCTURELLEMENT DISJOINTES (union discriminée
 * par `variante`), UNE seule tirée par exercice — "pointDonne" et "horizontale" à fréquence
 * comparable (~45% chacune), "doubleTangence" rare (~10%, bonus). Type pur, aucune logique.
 */

// ============================================================================
// Variante A — "pointDonne" : équation de la tangente en un point donné, f'(x) FOURNI (jamais
// dérivé par l'élève — c'est la compétence de 5gen27, pas de celui-ci). 2 sous-familles tirées à
// fréquence comparable.
// ============================================================================

/** Sous-famille "polynomiale" — f(x) = coeffs[0] + coeffs[1]·x + ... (degré 2 ou 3, coefficient de
 * tête `coeffs[coeffs.length-1]` toujours non nul). f(a) et f'(a) toujours des entiers exacts. */
export interface ExerciceTangentePointDonnePolynomiale {
  variante: "pointDonne";
  sousFamille: "polynomiale";
  /** Coefficients ASCENDANTS [constante, x, x², ...], longueur 3 (degré 2) ou 4 (degré 3). */
  coeffs: number[];
  a: number;
}

/** Sous-famille "radicale" — f(x) = coeff·√(m·x+p), m≠0. `a` toujours choisi tel que m·a+p soit un
 * entier strictement positif ET ≥2 (marge de domaine, jamais un cas limite) — f(a)/f'(a) peuvent
 * être IRRATIONNELS (ex. 2√5), explicitement acceptés par la vérification numérique tolérante. */
export interface ExerciceTangentePointDonneRadicale {
  variante: "pointDonne";
  sousFamille: "radicale";
  /** Coefficient multiplicatif, jamais nul. */
  coeff: number;
  m: number;
  p: number;
  a: number;
}

export type ExerciceTangentePointDonne = ExerciceTangentePointDonnePolynomiale | ExerciceTangentePointDonneRadicale;

// ============================================================================
// Variante B — "horizontale" : tangente(s) horizontale(s) d'un cubique, construit "à l'envers" à
// partir de 1 ou 2 racines de f'(x)=0 choisies EN PREMIER (jamais résolu puis vérifié) — voir
// `generateurs5e/tangentes/index.ts` pour la preuve arithmétique complète (b toujours entier).
// f(x)=a·x³+b·x²+c·x+d, f'(x)=3a·x²+2b·x+c. f'(x) FOURNI (jamais dérivé par l'élève).
// ============================================================================

export interface ExerciceTangenteHorizontale {
  variante: "horizontale";
  a: number;
  b: number;
  c: number;
  d: number;
  /** Racine(s) EXACTE(S) de f'(x)=0, vérité terrain — longueur 1 (racine double) ou 2 (racines
   * distinctes), JAMAIS recalculées en résolvant f'(x)=0 une seconde fois côté vérification. */
  racines: number[];
}

// ============================================================================
// Variante C — "doubleTangence" (RARE, bonus) : droite y=m·x+c deux fois tangente au quartique
// f(x)=k·(x-p)²·(x-q)²+m·x+c — construction EXACTE, jamais une recherche. Seul `coeffs` (le
// quartique DÉVELOPPÉ) et `p` sont visibles de l'élève ; `q` reste une vérité terrain INTERNE,
// jamais affichée (découverte par l'élève en résolvant f(x)=tangente(x)). f'(x) N'EST PAS fourni
// ici (contrairement à A/B) — l'élève dérive lui-même le quartique déjà développé, dérivation
// polynomiale simple (aucune règle du produit/de la chaîne nécessaire).
// ============================================================================

export interface ExerciceTangenteDoubleTangence {
  variante: "doubleTangence";
  /** Coefficients ASCENDANTS [e0,e1,e2,e3,e4] du quartique développé, e4≠0. */
  coeffs: number[];
  /** Point donné à l'élève — la tangence en ce point est admise, à recalculer. */
  p: number;
  /** Vérité terrain INTERNE — jamais affichée à l'élève, jamais recalculée en resolvant
   * f(x)=tangente(x) une seconde fois côté vérification. */
  q: number;
}

export type ExerciceTangente = ExerciceTangentePointDonne | ExerciceTangenteHorizontale | ExerciceTangenteDoubleTangence;

export type GenerateurExerciceTangente = () => ExerciceTangente;
