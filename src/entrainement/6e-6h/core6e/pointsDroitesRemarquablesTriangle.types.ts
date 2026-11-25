import type { Droite, Pt } from "../moteur6e/algebreLieux";

/**
 * `6gen54` — Constructions analytiques dans le triangle (6e ch. 9, § 1 ; audit du chapitre, lots B
 * et C ; décision 1 : renommé d'après ce qu'il fait). Coordonnées EXACTES (`Pt`, rationnels) ;
 * droites en forme implicite ax + by + c = 0 à coefficients entiers premiers entre eux.
 */

export type FamillePointsDroitesRemarquablesTriangle = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

/** A — sommets depuis les milieux A′, B′, C′ des côtés. */
export interface ExercicePDRT_A {
  famille: "A";
  A: Pt;
  B: Pt;
  C: Pt;
  Ap: Pt;
  Bp: Pt;
  Cp: Pt;
}

/** B — pied I de la bissectrice issue de B (triangle jamais isocèle en B). */
export interface ExercicePDRT_B {
  famille: "B";
  A: Pt;
  B: Pt;
  C: Pt;
  AB: number;
  BC: number;
  I: Pt;
}

/** C — point C(t) = P₀ + t·u d'une droite d tel que l'aire de ABC vaille k (deux solutions). */
export interface ExercicePDRT_C {
  famille: "C";
  A: Pt;
  B: Pt;
  P0: Pt;
  u: { x: number; y: number };
  d: Droite;
  k: number;
  /** det(AB, AC(t)) = K + M·t. */
  K: number;
  M: number;
  t: [number, number];
  C: [Pt, Pt];
}

/** D — côtés depuis un sommet A et les médianes issues de B et de C. */
export interface ExercicePDRT_D {
  famille: "D";
  A: Pt;
  B: Pt;
  C: Pt;
  medianeB: Droite;
  medianeC: Droite;
  AB: Droite;
  BC: Droite;
  CA: Droite;
}

/** E — droites par P équidistantes de A et de B. Verdict tiré AVANT les points. */
export type PositionPE = "hors" | "surAB" | "milieu";
export interface ExercicePDRT_E {
  famille: "E";
  position: PositionPE;
  P: Pt;
  A: Pt;
  B: Pt;
  /** Droites solutions (vide si une infinité). */
  droites: Droite[];
}

/** F — symétrique Q de P par rapport à (AB). */
export interface ExercicePDRT_F {
  famille: "F";
  A: Pt;
  B: Pt;
  P: Pt;
  droiteAB: Droite;
  perpendiculaire: Droite;
  H: Pt;
  Q: Pt;
}

/** G — sommets d'un carré (deux sous-types ; tout étiquetage valide accepté). */
export interface ExercicePDRT_G_SommetDiagonale {
  famille: "G";
  sousType: "sommetDiagonale";
  A: Pt;
  B: Pt;
  C: Pt;
  D: Pt;
  O: Pt;
  droiteBD: Droite;
}
export interface ExercicePDRT_G_CentreCote {
  famille: "G";
  sousType: "centreCote";
  A: Pt;
  B: Pt;
  C: Pt;
  D: Pt;
  P: Pt;
  M: Pt;
  droiteAB: Droite;
}
export type ExercicePDRT_G = ExercicePDRT_G_SommetDiagonale | ExercicePDRT_G_CentreCote;

/** H — rayon réfléchi (miroir ou bande de billard). */
export interface ExercicePDRT_H {
  famille: "H";
  contexte: "miroir" | "billard";
  P: Pt;
  M: Pt;
  d: Droite;
  Pp: Pt;
  rayonReflechi: Droite;
  rayonIncident: Droite;
}

export type ExercicePointsDroitesRemarquablesTriangle = ExercicePDRT_A | ExercicePDRT_B | ExercicePDRT_C | ExercicePDRT_D | ExercicePDRT_E | ExercicePDRT_F | ExercicePDRT_G | ExercicePDRT_H;
