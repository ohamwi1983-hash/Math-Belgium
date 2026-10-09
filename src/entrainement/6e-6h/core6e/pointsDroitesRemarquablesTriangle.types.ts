/**
 * Couche core (6e) — contrat pour `6gen54` ("Points et droites remarquables du triangle"),
 * générateur D'OUVERTURE du chapitre "Lieux géométriques". 8 familles (A à H), tirage ÉQUIPROBABLE
 * de la famille — voir `generateurs6e/pointsDroitesRemarquablesTriangle/index.ts`.
 *
 * **Représentation d'une droite — décision de conception (voir `docs/historique-6e.md` pour le
 * détail complet)** : forme implicite `ax+by+c=0` UNIQUEMENT, jamais `y=mx+p` (nécessiterait un
 * cas particulier pour toute droite verticale — fréquent ici : médianes, diagonales, côtés d'un
 * carré tirés dans toutes les directions) ni une forme paramétrique (moins directe pour tester
 * perpendicularité/parallélisme ou résoudre une intersection par un simple système 2×2). La forme
 * implicite traite tous les cas UNIFORMÉMENT (`generateurs6e/pointsDroitesRemarquablesTriangle/
 * geometrie.ts`) et se prête nativement à une vérification par PROPORTIONNALITÉ des 3 coefficients
 * (toute droite admet une infinité d'équations implicites, toutes multiples l'une de l'autre —
 * `moteur6e/verificationPointsDroitesRemarquablesTriangle.ts`, `statutTripletProportionnel`).
 *
 * **Convention transversale à ce contrat** (identique à `6gen43`) : chaque variante porte déjà,
 * PRÉ-CALCULÉES par la Couche A (jamais recalculées côté Couche B), toutes les valeurs correctes
 * attendues à chaque écran. La Couche B se contente de les comparer à la saisie élève.
 */

export interface Point {
  x: number;
  y: number;
}

/** Droite sous forme implicite `ax+by+c=0` — voir en-tête de fichier pour la justification. */
export interface Droite {
  a: number;
  b: number;
  c: number;
}

/** Fraction exacte (irréductible dès la construction, voir `generateurs6e/
 * pointsDroitesRemarquablesTriangle/fraction.ts`) — utilisée partout où une coordonnée n'est pas
 * structurellement garantie entière (familles B et C), pour respecter "jamais de décimal pour une
 * valeur générée" (CLAUDE.md) : affichage en `\frac{}{}`, jamais en décimal arrondi. */
export interface Fraction {
  num: number;
  den: number;
}

// ============================================================================
// Famille A — Sommets depuis les milieux des côtés (2 écrans).
// ============================================================================

export interface ExercicePDRT_A {
  famille: "A";
  A: Point;
  B: Point;
  C: Point;
  /** Milieux donnés (A'=mil[BC], B'=mil[CA], C'=mil[AB]) — toujours entiers par construction
   * (A, B, C tirés à coordonnées paires, voir `familleA.ts`). */
  Ap: Point;
  Bp: Point;
  Cp: Point;
}

// ============================================================================
// Famille B — Point d'une bissectrice sur le côté opposé (3 écrans).
// ============================================================================

export interface ExercicePDRT_B {
  famille: "B";
  A: Point;
  B: Point;
  C: Point;
  /** Longueurs ENTIÈRES exactes (vecteurs de longueur pythagoricienne — voir `familleB.ts`). */
  AB: number;
  BC: number;
  /** Point cherché, en fraction exacte (dénominateur AB+BC, pas toujours 1). */
  IFrac: { x: Fraction; y: Fraction };
  I: Point;
}

// ============================================================================
// Famille C — Point à aire imposée sur une droite (3 écrans).
// ============================================================================

export interface ExercicePDRT_C {
  famille: "C";
  A: Point;
  B: Point;
  /** Paramétrage de d : un point de d et son vecteur directeur — `C(t) = P0 + t·dir`. */
  P0: Point;
  dir: { x: number; y: number };
  d: Droite;
  /** Aire cible (entier positif). */
  k: number;
  /** Aire(t) = ½|K + M·t| — K, M toujours entiers. */
  K: number;
  M: number;
  /** Toujours exactement 2 solutions par construction (voir `familleC.ts`, `d` jamais parallèle à
   * (AB)) — en fraction exacte ET en nombre (fraction pour l'affichage, nombre pour la tolérance). */
  solutionsTFrac: Fraction[];
  solutionsT: number[];
  solutionsCFrac: { x: Fraction; y: Fraction }[];
  solutionsC: Point[];
}

// ============================================================================
// Famille D — Côtés depuis un sommet et 2 médianes (4 écrans).
// ============================================================================

export interface ExercicePDRT_D {
  famille: "D";
  A: Point;
  B: Point;
  C: Point;
  /** B'=mil[AC] (médiane issue de B), C'=mil[AB] (médiane issue de C). */
  Bp: Point;
  Cp: Point;
  droiteBBp: Droite;
  droiteCCp: Droite;
  /** Système déterminant B : B∈BB' (=droiteBBp) ; milieu[AB]∈CC'. */
  eqPourB_1: Droite;
  eqPourB_2: Droite;
  /** Système déterminant C : C∈CC' (=droiteCCp) ; milieu[AC]∈BB'. */
  eqPourC_1: Droite;
  eqPourC_2: Droite;
  droiteAB: Droite;
  droiteAC: Droite;
  droiteBC: Droite;
}

// ============================================================================
// Famille E — Droite équidistante de deux points (2 écrans).
// ============================================================================

export type IdConstructionE = "parallele" | "perpendiculaire" | "milieu" | "passeParAB";

export interface ExercicePDRT_E {
  famille: "E";
  P: Point;
  A: Point;
  B: Point;
  droiteParallele: Droite;
  droiteMilieu: Droite;
}

// ============================================================================
// Famille F — Symétrique d'un point par rapport à une droite (3 écrans).
// ============================================================================

export interface ExercicePDRT_F {
  famille: "F";
  P: Point;
  A: Point;
  B: Point;
  droiteAB: Droite;
  perpendiculaire: Droite;
  /** H (pied de la perpendiculaire) n'est PAS structurellement entier — dénominateur a²+b² de la
   * normale de (AB), rarement 1 — voir `familleF.ts`/`docs/historique-6e.md`. Fraction exacte pour
   * l'affichage, `H`/`Q` (nombres) pour la vérification à tolérance. */
  HFrac: { x: Fraction; y: Fraction };
  H: Point;
  QFrac: { x: Fraction; y: Fraction };
  Q: Point;
}

// ============================================================================
// Famille G — Sommets d'un carré (3 écrans, 2 sous-types).
// ============================================================================

export interface ExercicePDRT_G_SommetDiagonale {
  famille: "G";
  sousType: "sommetDiagonale";
  A: Point;
  B: Point;
  C: Point;
  D: Point;
  O: Point;
  droiteBD: Droite;
  perpendiculaire: Droite;
}

export interface ExercicePDRT_G_CentreCote {
  famille: "G";
  sousType: "centreCote";
  A: Point;
  B: Point;
  C: Point;
  D: Point;
  P: Point;
  M: Point;
  droiteAB: Droite;
  perpendiculaire: Droite;
}

export type ExercicePDRT_G = ExercicePDRT_G_SommetDiagonale | ExercicePDRT_G_CentreCote;

// ============================================================================
// Famille H — Rayon réfléchi (2 écrans) — réutilise la famille F.
// ============================================================================

export interface ExercicePDRT_H {
  famille: "H";
  /** 2 points définissant la droite miroir d. */
  Ad: Point;
  Bd: Point;
  droiteD: Droite;
  P: Point;
  /** Point d'incidence, sur d. */
  M: Point;
  /** Symétrique de P par rapport à d — calculé via `familleF.calculerSymetriqueParRapportADroite`
   * (réutilisation intégrale, jamais recalculé) ; `PpFrac` = exactement `QFrac` de ce calcul. */
  PpFrac: { x: Fraction; y: Fraction };
  Pp: Point;
  rayonReflechi: Droite;
}

// ============================================================================
// Union globale.
// ============================================================================

export type ExercicePointsDroitesRemarquablesTriangle =
  | ExercicePDRT_A
  | ExercicePDRT_B
  | ExercicePDRT_C
  | ExercicePDRT_D
  | ExercicePDRT_E
  | ExercicePDRT_F
  | ExercicePDRT_G
  | ExercicePDRT_H;

export type FamillePointsDroitesRemarquablesTriangle = ExercicePointsDroitesRemarquablesTriangle["famille"];
