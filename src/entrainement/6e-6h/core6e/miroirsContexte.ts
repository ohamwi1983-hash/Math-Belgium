import type { Conique, D, Pt } from "../ui6e/outilsConiquesLotH2";
import { normaliserDroite, tangenteDedoublee } from "../ui6e/outilsConiquesLotH2";

/**
 * Couche core — `6gen140` « Miroirs en contexte » (6e ch. 10, § 6, processus 3 TRANSFÉRER). Une situation
 * concrète, la conique à reconnaître, son équation dans un repère adapté, puis deux grandeurs du contexte.
 * Situations (variantes) :
 * - `antenne` : diamètre D et profondeur h d'une antenne satellite → parabole y² = 2px (sommet au fond,
 *   axe Ox) avec p = D²/(8h), récepteur au foyer à OF = p/2 = D²/(16h), longueur FP du support jusqu'au
 *   bord P(h ; D/2) : FP = h + p/2 (distance à la directrice) ;
 * - `phare` : lampe au foyer à f du fond, diamètre D du réflecteur → y² = 4fx, profondeur h = D²/(16f),
 *   FP = h + f ;
 * - `lithotriteur` : générateur au foyer F′, calcul rénal à l'autre foyer F ; distance 2c entre eux et
 *   distance a − c du fond du réflecteur au générateur → ellipse x²/a² + y²/b² = 1, rayon b de l'ouverture
 *   (réflecteur coupé au plan du petit axe), longueur 2a de chaque trajet F′ → paroi → F ;
 * - `cassegrain` : miroir secondaire hyperbolique de foyers F (foyer du miroir principal) et F′ (foyer
 *   effectif, derrière le miroir principal) ; FF′ = 2c et distance c − a du sommet S du secondaire à F →
 *   hyperbole x²/a² − y²/b² = 1, SF′ = a + c, différence PF′ − PF = 2a pour tout point P du miroir ;
 * - `ftfp` : réflecteur parabolique y² = 2px, rayon parallèle à l'axe arrivant en P : tangente en P
 *   (dédoublée), point T où elle coupe l'axe (T(−x_P ; 0)), FT = FP = x_P + p/2 (triangle FPT isocèle en
 *   F, d'où les angles égaux), rayon réfléchi = droite (PF).
 */

export type VarianteMC = "antenne" | "phare" | "lithotriteur" | "cassegrain" | "ftfp";
export type PhaseMC = "conique" | "equation" | "grandeur" | "distance" | "tangente" | "pointT" | "distances" | "reflechi";
export type NatureMC = "parabole" | "ellipse" | "hyperbole" | "cercle";

export const PHASES_CONTEXTE: PhaseMC[] = ["conique", "equation", "grandeur", "distance"];
export const PHASES_FTFP: PhaseMC[] = ["tangente", "pointT", "distances", "reflechi"];

export interface ExerciceMC {
  variante: VarianteMC;
  /** Antenne, phare : diamètre et profondeur (cm). */
  D: number;
  h: number;
  /** Phare : distance focale (cm). */
  f: number;
  /** Ellipse, hyperbole : demi-axes et demi-distance focale (cm). */
  a: number;
  b: number;
  c: number;
  /** ftfp : paramètre p et point P de la parabole. */
  p: number;
  P: Pt;
}

export const phases = (e: ExerciceMC): PhaseMC[] => (e.variante === "ftfp" ? PHASES_FTFP : PHASES_CONTEXTE);

export function nature(e: ExerciceMC): NatureMC {
  return e.variante === "lithotriteur" ? "ellipse" : e.variante === "cassegrain" ? "hyperbole" : "parabole";
}

/** Conique dans le repère de l'énoncé. */
export function conique(e: ExerciceMC): Conique {
  switch (e.variante) {
    case "antenne":
      return { type: "parabole", p: (e.D * e.D) / (8 * e.h) };
    case "phare":
      return { type: "parabole", p: 2 * e.f };
    case "ftfp":
      return { type: "parabole", p: e.p };
    case "lithotriteur":
      return { type: "ellipse", a: e.a, b: e.b };
    case "cassegrain":
      return { type: "hyperbole", a: e.a, b: e.b };
  }
}

/** Grandeur de l'écran 3 (cm) : distance du récepteur au fond, profondeur, rayon d'ouverture, SF′. */
export function grandeur(e: ExerciceMC): number {
  switch (e.variante) {
    case "antenne":
      return (e.D * e.D) / (16 * e.h);
    case "phare":
      return (e.D * e.D) / (16 * e.f);
    case "lithotriteur":
      return e.b;
    case "cassegrain":
      return e.a + e.c;
    case "ftfp":
      return e.P.x + e.p / 2;
  }
}

/** Grandeur de l'écran 4 (cm) : FP du bord, trajet 2a, différence 2a. */
export function distance(e: ExerciceMC): number {
  switch (e.variante) {
    case "antenne":
      return e.h + (e.D * e.D) / (16 * e.h);
    case "phare":
      return (e.D * e.D) / (16 * e.f) + e.f;
    default:
      return 2 * e.a;
  }
}

/** ftfp : foyer, tangente en P, point T, rayon réfléchi (PF). */
export const foyerFtfp = (e: ExerciceMC): Pt => ({ x: e.p / 2, y: 0 });
export const tangenteFtfp = (e: ExerciceMC): D => tangenteDedoublee(conique(e), e.P);
export const pointT = (e: ExerciceMC): Pt => ({ x: -e.P.x, y: 0 });
export function reflechi(e: ExerciceMC): D {
  const F = foyerFtfp(e);
  return normaliserDroite({ a: e.P.y - F.y, b: F.x - e.P.x, c: -(e.P.y - F.y) * F.x - (F.x - e.P.x) * F.y });
}
/** Bord P de l'antenne ou du phare (repère : sommet au fond, axe Ox). */
export const bord = (e: ExerciceMC): Pt => ({ x: e.variante === "antenne" ? e.h : (e.D * e.D) / (16 * e.f), y: e.D / 2 });
