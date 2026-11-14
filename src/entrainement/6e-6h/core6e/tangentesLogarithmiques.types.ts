/**
 * Couche A (6e) — types de `6gen87` « Tangentes aux courbes logarithmiques » (chapitre 3, section
 * `derivee`, processus 2 appliquer). Trois variantes :
 *
 * - `point` : tangente au point d'abscisse x₀ — f′(x), puis f(x₀) et f′(x₀), puis y = mx + p ;
 * - `parallele` : tangente(s) parallèle(s) à une droite d : y = mx + h — f′(x), puis les solutions
 *   de f′(x) = m DANS LE DOMAINE (une ou deux, tirées à 50/50 avant la famille : le nombre de
 *   solutions est un verdict, jamais un cas particulier), puis une équation par solution ;
 * - `origine` : tangente passant par un point P(0 ; p) extérieur à la courbe — tangente au point
 *   d'abscisse a (en fonction de a), puis la valeur de a, puis l'équation.
 *
 * Toutes les valeurs sont exactes (fractions, ln, e, √e) : `Comb` est une combinaison linéaire à
 * coefficients rationnels d'« atomes » (1, ln(2), e, 1/e², 1/ln(3)…), qui porte à la fois sa valeur
 * numérique et son écriture LaTeX. Les fonctions (`fn`, `dfn`) servent aux figures et aux
 * vérifications par échantillonnage.
 */

export type VarianteTangentesLog = "point" | "parallele" | "origine";

export type FamilleTangenteLog = "lnAffine" | "logBase" | "xlnx" | "lnSurX" | "lnQuad" | "polyLn" | "lnInverse" | "lnSimple";

/** Aide ou ligne de justification : phrase (finie par « : » quand une formule suit) + formule. */
export interface TexteAvecLatex {
  texte: string;
  latex?: string;
}

/** Atome d'une combinaison exacte : `num` → coefficient × latex ; `den` → coefficient ÷ latex. */
export interface AtomeExact {
  id: string;
  latex: string;
  /** Valeur de l'atome tel qu'il entre dans la somme (1/e pour l'atome `den` « e »). */
  valeur: number;
  position: "num" | "den";
}

export interface TermeExact {
  n: number;
  d: number;
  atome: AtomeExact;
}

/** Combinaison linéaire exacte (liste vide = 0). */
export type Comb = TermeExact[];

export interface FonctionTangente {
  famille: FamilleTangenteLog;
  /** f(x) en LaTeX. */
  fLatex: string;
  /** f évaluée en une écriture LaTeX `v` (« a », « 2 », « e^{2} »…), non simplifiée. */
  fDe: (v: string) => string;
  /** f′(x) simplifiée, en LaTeX. */
  dfLatex: string;
  dfDe: (v: string) => string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
  domaineLatex: string;
  /** Bornes du domaine (pour les figures), `null` = infini. */
  borneGauche: number | null;
  borneDroite: number | null;
  /** Points du domaine où comparer la dérivée saisie à la référence. */
  pointsTest: number[];
  /** Aides de l'écran « dérivée » (règle, puis détail sans la réponse). */
  regle: TexteAvecLatex;
  detail: TexteAvecLatex;
  /** Dérivée obtenue en oubliant le facteur u′ de la règle de la chaîne (message ciblé). */
  oubliChaine?: (x: number) => number;
}

/** Point de contact et tangente : y = m x + p. */
export interface ContactTangente {
  x0: Comb;
  fx0: Comb;
  dfx0: Comb;
  m: Comb;
  p: Comb;
}

interface ExerciceTangenteBase {
  fonction: FonctionTangente;
  contacts: ContactTangente[];
}

export interface ExerciceTangentePoint extends ExerciceTangenteBase {
  variante: "point";
}

export interface ExerciceTangenteParallele extends ExerciceTangenteBase {
  variante: "parallele";
  /** Pente de d (rationnelle). */
  m: Comb;
  /** Ordonnée à l'origine de d (entier, jamais celle d'une tangente). */
  h: number;
  /** Chaîne d'équivalences f′(x) = m ⟺ … ⟺ équation du second degré (LaTeX). */
  chaineEquation: string;
  /** Équation du second degré obtenue (LaTeX, « x^{2}-3x+2=0 »). */
  equationSecondDegre: string;
  /** Racines de l'équation du second degré (distinctes), y compris celles hors domaine. */
  racines: number[];
  /** Racines rejetées (hors du domaine). */
  rejetees: number[];
  /** Racine double (Δ = 0). */
  double: boolean;
}

export interface ExerciceTangenteOrigine extends ExerciceTangenteBase {
  variante: "origine";
  /** Ordonnée de P(0 ; p) (exacte). */
  pP: Comb;
  /** Équation de la tangente au point d'abscisse a, en fonction de a (LaTeX, « y=… »). */
  equationEnA: string;
  /** P vérifie l'équation : x remplacé par 0, y par p (LaTeX). */
  substitution: string;
  /** Équation simplifiée en a, donnée par l'aide 2 (il reste à la résoudre). */
  simplifiee: string;
  /** Chaîne de résolution complète du corrigé (LaTeX, de la substitution à a = …). */
  resolution: string;
  /** f(a) et f′(a) en fonction de a (LaTeX). */
  faLatex: string;
  dfaLatex: string;
  /** Aide 2 de l'écran « valeur de a » : texte de la phrase. */
  texteSimplifiee: string;
}

export type ExerciceTangentesLog = ExerciceTangentePoint | ExerciceTangenteParallele | ExerciceTangenteOrigine;
