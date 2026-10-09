import type { NatureConique, Point } from "./identificationConiques.types";

/**
 * Couche core (6e) — contrat pour `6gen59` ("Équation d'une conique depuis ses caractéristiques"),
 * DEUXIÈME générateur du chapitre "Les coniques" (voir `docs/historique-6e.md`, fondation posée par
 * `6gen58`). Travaille dans le sens INVERSE de `6gen58` : au lieu de classifier une équation donnée,
 * on CONSTRUIT l'équation à partir de caractéristiques données (sommets, foyers, excentricité,
 * asymptotes...). Réutilise directement `NatureConique`/`Point` de
 * `core6e/identificationConiques.types.ts` (jamais un type parallèle redéfini) — voir
 * `generateurs6e/identificationConiques/classification.ts` pour `natureVersId`/`LIBELLE_NATURE`,
 * réutilisés tels quels par `ui6e/formatEquationConiqueCaracteristiques.ts` pour les boutons de
 * choix de nature.
 *
 * Toutes les coniques de CE générateur sont CENTRÉES À L'ORIGINE (familles A, C, D) ou de sommet
 * `(h,k)` explicite (famille B, parabole) — jamais de terme linéaire croisé à compléter (ce n'est
 * pas le sujet ici, contrairement à `6gen58` famille B/C) : le contrat de chaque famille porte
 * directement les caractéristiques ENTIÈRES (magnitudes toujours positives, signes de position
 * séparés) plutôt qu'une équation développée.
 */

export type AxeCaracteristique = "horizontal" | "vertical";

/** Fraction exacte réduite (jamais un décimal affiché, CLAUDE.md) — utilisée pour l'excentricité, la
 * distance entre les directrices (famille C) et le rapport de pente d'asymptote (famille D), toutes
 * des quantités potentiellement non entières mais toujours RATIONNELLES exactes par construction. */
export interface FractionExacte {
  num: number;
  den: number;
}

// ============================================================================
// Famille A — ellipse/hyperbole centrée à l'origine, sommet(s)/foyer(s) donnés. 3 sous-types.
// ============================================================================

/** Sous-type "même axe" : sommet S et foyer F sur le MÊME axe (le seul cas simple : celui qui porte
 * S et F est nécessairement l'axe focal). Écran 1 → `a`,`c` (extraction). Écran 2 → `natureCible`
 * (choix, restreint à ellipse/hyperbole depuis la comparaison a/c) + `bCarre`. Écran 3 → équation
 * finale (texte libre). */
export interface ExerciceFamilleA_MemeAxe {
  famille: "A";
  sousType: "memeAxe";
  axe: AxeCaracteristique;
  natureCible: "ellipse" | "hyperbole";
  /** `|S|` — toujours un entier strictement positif. */
  a: number;
  /** `|F|` — toujours un entier strictement positif. */
  c: number;
  signeS: 1 | -1;
  signeF: 1 | -1;
  /** `a²-c²` (ellipse, `a>c`) ou `c²-a²` (hyperbole, `c>a`) — toujours un entier exact positif. */
  bCarre: number;
  nature: NatureConique;
}

/** Sous-type "axes perpendiculaires" (ellipse UNIQUEMENT) : sommet S sur un axe, foyer F sur l'axe
 * PERPENDICULAIRE — PIÈGE CENTRAL (mission) : le foyer détermine seul l'axe principal, donc S est
 * en réalité le sommet SECONDAIRE (`b=|S|`), jamais le sommet principal par réflexe. Écran 1 →
 * `axePrincipal` (choix, doit valoir l'axe de F) + `b` (`=|S|`). Écran 2 → `c` (`=|F|`) + `aCarre`
 * (`=b²+c²`), à partir de `b` CONFIRMÉ de l'écran 1. Écran 3 → équation finale. */
export interface ExerciceFamilleA_AxesPerpendiculaires {
  famille: "A";
  sousType: "axesPerpendiculaires";
  /** Axe qui porte le FOYER — l'axe principal réel (celui qui portera `a`). */
  axePrincipal: AxeCaracteristique;
  /** `|S|` — le sommet donné, sur l'axe SECONDAIRE (piège central). */
  b: number;
  signeS: 1 | -1;
  /** `|F|`. */
  c: number;
  signeF: 1 | -1;
  bCarre: number;
  aCarre: number;
  nature: NatureConique;
}

/** Sous-type "2 sommets" (ellipse) : deux sommets S (sur l'axe des x), S' (sur l'axe des y) donnés
 * DIRECTEMENT — aucun piège de principal/secondaire ici (aucun foyer en jeu), juste une lecture
 * directe. Écran 1 → `sommetX`,`sommetY` (extraction). Écran 2 → équation finale directement. */
export interface ExerciceFamilleA_DeuxSommets {
  famille: "A";
  sousType: "deuxSommets";
  /** `|S|`, sommet sur l'axe des x. */
  sommetX: number;
  /** `|S'|`, sommet sur l'axe des y. Toujours différent de `sommetX` (sinon cercle). */
  sommetY: number;
  signeSommetX: 1 | -1;
  signeSommetY: 1 | -1;
  nature: NatureConique;
}

export type ExerciceFamilleA = ExerciceFamilleA_MemeAxe | ExerciceFamilleA_AxesPerpendiculaires | ExerciceFamilleA_DeuxSommets;

// ============================================================================
// Famille B — parabole depuis sommet + (foyer OU point de passage). 1 seul type d'exercice,
// combinant librement axe/sommet centré ou non/donnée foyer ou point.
// ============================================================================

/** Écran 1 → `axe` (choix, forme générale adaptée — reconnaissance visuelle du gabarit, jamais un
 * champ texte contenant le symbole libre `p` non résolu : voir en-tête
 * `ui6e/formatEquationConiqueCaracteristiques.ts`). Écran 2 → `p` (signé). Écran 3 → équation
 * finale. PIÈGE CENTRAL (mission) : le signe de `p` (et donc le sens d'ouverture) doit être déduit
 * de la position RÉELLE du foyer/point, jamais supposé positif par défaut. */
export interface ExerciceFamilleB {
  famille: "B";
  axe: AxeCaracteristique;
  h: number;
  k: number;
  donneeType: "foyer" | "point";
  /** Présent ssi `donneeType==="foyer"`. */
  foyer?: Point;
  /** Présent ssi `donneeType==="point"` — un point de passage RÉEL de la parabole (cohérent avec
   * `p`, construit à l'envers depuis `p` pour garantir l'exactitude — voir `familleB.ts`). */
  point?: Point;
  /** Distance signée sommet→foyer dans la direction de l'axe — détermine le sens d'ouverture. */
  p: number;
}

// ============================================================================
// Famille C — conique centrée depuis 2 données parmi {2c, e, distance entre les directrices, 2a}.
// ============================================================================

export type DonneeConiqueC = "deuxC" | "excentricite" | "distanceDirectrices" | "deuxA";

/** Écran 1 → `donnee1`,`donnee2` (choix, une relation par donnée fournie — PAS de recopie
 * commutative : `donnee1` correspond à la 1ʳᵉ donnée affichée dans `blocDonnees`, `donnee2` à la
 * 2ᵉ). Écran 2 → `a`,`c` (combinaison des 2 relations CONFIRMÉES). Écran 3 → `natureCible` (choix,
 * e<1 ellipse / e>1 hyperbole — PIÈGE CENTRAL mission) + `bCarre`. Écran 4 → équation finale. */
export interface ExerciceFamilleC {
  famille: "C";
  natureCible: "ellipse" | "hyperbole";
  /** Axe portant les foyers — DOIT être annoncé explicitement dans l'énoncé (`blocDonnees`) : rien
   * dans les 2 données numériques (2c/e/d/2a, toutes des scalaires) ne permet de le déduire. */
  axeTransverse: AxeCaracteristique;
  /** `|FF'|/2` — toujours un entier strictement positif. */
  a: number;
  c: number;
  donnee1: DonneeConiqueC;
  donnee2: DonneeConiqueC;
  valeurDonnee1: FractionExacte;
  valeurDonnee2: FractionExacte;
  /** `a²-c²` (ellipse) ou `c²-a²` (hyperbole) — toujours un entier exact positif. */
  bCarre: number;
  nature: NatureConique;
}

// ============================================================================
// Famille D — hyperbole depuis une asymptote + un autre élément (sommet, foyer, ou distance
// focale). 3 sous-types.
// ============================================================================

/** Écran 1 → `axeTransverse` (choix — inférable depuis la position du sommet/foyer donné, sauf
 * sous-type `distanceFocale` où il est annoncé explicitement dans l'énoncé, aucun point n'étant
 * fourni) + `pente` (rapport `b/a` si horizontal, `a/b` si vertical — PIÈGE CENTRAL mission, jamais
 * l'inverse). Écran 2 → sous-type `sommet` : `b` seul (`a` déjà connu directement) ; sous-types
 * `foyer`/`distanceFocale` : `a` ET `b` (système `{rapport, c²=a²+b²}` à résoudre). Écran 3 →
 * équation finale. */
export interface ExerciceFamilleD {
  famille: "D";
  sousType: "sommet" | "foyer" | "distanceFocale";
  axeTransverse: AxeCaracteristique;
  a: number;
  b: number;
  /** Toujours calculé (`√(a²+b²)`) — utilisé pour construire l'énoncé des sous-types
   * `foyer`/`distanceFocale` ; jamais affiché pour le sous-type `sommet` (non entier possible). */
  c: number;
  /** Rapport `b/a` (axe horizontal) ou `a/b` (axe vertical) — TOUJOURS une fraction réduite exacte
   * de 2 entiers (voir `familleD.ts`, triplet pythagoricien pour les sous-types `foyer`/
   * `distanceFocale`). */
  pente: FractionExacte;
  signe: 1 | -1;
  /** Présent ssi `sousType==="sommet"`. */
  sommet?: Point;
  /** Présent ssi `sousType==="foyer"`. */
  foyer?: Point;
  /** Présent ssi `sousType==="distanceFocale"` — `2c`. */
  distanceFocale?: number;
  nature: NatureConique;
}

export type ExerciceEquationConiqueCaracteristiques = ExerciceFamilleA | ExerciceFamilleB | ExerciceFamilleC | ExerciceFamilleD;
export type FamilleEquationConiqueCaracteristiques = ExerciceEquationConiqueCaracteristiques["famille"];
