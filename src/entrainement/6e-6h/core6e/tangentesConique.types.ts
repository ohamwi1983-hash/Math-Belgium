import type { Conique } from "../moteur6e/algebreConiques";
import type { Droite, Pt, Q } from "../moteur6e/algebreLieux";

/**
 * `6gen62` — Tangentes à une conique (6e ch. 10, § 5 ; audit, lots B et C). Valeurs EXACTES (pentes et
 * ordonnées en fractions, plus de « 1.667 », G21), parabole y² = 2px et tangente y·y_P = p(x + x_P)
 * (décision 1), hyperbole d'axe focal vertical JUSTE (G19). Ellipse ou hyperbole centrée écrite
 * σx·x²/X + σy·y²/Y = 1 : tangente y = mx + k ⟺ k² = σx·m²·X + σy·Y.
 */

/** A — tangente en un point P de la conique. */
export interface ExerciceTangenteA {
  famille: "A";
  conique: Conique;
  P: Pt;
  pente: Q;
  tangente: Droite;
}

/** Droite y = m x + k. */
export interface DroiteMK {
  m: Q;
  k: Q;
}

/** B — tangentes à une hyperbole parallèles à une droite donnée : deux ou aucune (VERDICT). */
export interface ExerciceTangenteB {
  famille: "B";
  verdict: 0 | 2;
  conique: Extract<Conique, { type: "hyperbole" }>;
  /** Droite donnée (direction). */
  d: DroiteMK;
  /** k² = valeur (négative : aucune tangente). */
  k2: Q;
  tangentes: DroiteMK[];
}

/** C — tangentes à une ellipse issues d'un point P : deux (P extérieur) ou aucune (P intérieur). */
export interface ExerciceTangenteC {
  famille: "C";
  verdict: 0 | 2;
  conique: Extract<Conique, { type: "ellipse" }>;
  P: Pt;
  /** Équation en m : coefficients exacts. */
  eqM: [Q, Q, Q];
  tangentes: DroiteMK[];
}

/** D — conique de forme donnée passant par P et tangente à d : dénominateurs α (sous x²) et β (sous y²). */
export interface ExerciceTangenteD {
  famille: "D";
  conique: Extract<Conique, { type: "ellipse" | "hyperbole" }>;
  P: Pt;
  d: DroiteMK;
  alpha: Q;
  beta: Q;
}

/** E — point de la conique le plus proche d'une droite qui ne la coupe pas. */
export interface ExerciceTangenteE {
  famille: "E";
  conique: Extract<Conique, { type: "ellipse" | "hyperbole" }>;
  d: DroiteMK;
  /** Points de contact des deux tangentes parallèles à d. */
  points: [Pt, Pt];
  /** Indice (0 ou 1) du point le plus proche de d. */
  proche: 0 | 1;
}

export type ExerciceTangentesConique = ExerciceTangenteA | ExerciceTangenteB | ExerciceTangenteC | ExerciceTangenteD | ExerciceTangenteE;
