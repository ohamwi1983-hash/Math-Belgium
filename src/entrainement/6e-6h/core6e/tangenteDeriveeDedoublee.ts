import type { Conique, D, Pt } from "../ui6e/outilsConiquesLotH2";
import { normaliserDroite, tangenteDedoublee } from "../ui6e/outilsConiquesLotH2";

/**
 * Couche core — `6gen138` « Tangente par la dérivée et forme dédoublée » (6e ch. 10, § 5, processus 2
 * APPLIQUER). Les deux méthodes du cours, pour les trois coniques réduites (ellipse x²/a² + y²/b² = 1,
 * hyperbole x²/a² − y²/b² = 1, parabole y² = 2px) :
 * - en P (y_P ≠ 0), par la DÉRIVÉE : choisir la fonction dont le graphique contient P (choix fermé, la
 *   branche est un verdict tiré à parts égales AVANT les nombres : y_P > 0 ou y_P < 0), sa dérivée en x_P
 *   (pente), puis l'équation y − y_P = f′(x_P)(x − x_P) ;
 * - en Q, par la FORME DÉDOUBLÉE (x² → x·x_Q, y² → y·y_Q, x → (x + x_Q)/2). Une fois sur deux, Q est un
 *   SOMMET de l'axe focal (tangente verticale, là où la dérivée n'existe pas).
 */

export type VarianteTD = "ellipse" | "hyperbole" | "parabole";
export type PhaseTD = "branche" | "pente" | "tangente" | "dedoublee";
export const PHASES_TD: PhaseTD[] = ["branche", "pente", "tangente", "dedoublee"];

/** Fonctions proposées à l'écran 1 : la bonne branche, l'autre, et deux formules fausses (± ). */
export type OptionTD = "haut" | "bas" | "leurreHaut" | "leurreBas";

export interface ExerciceTD {
  variante: VarianteTD;
  conique: Conique;
  P: Pt;
  Q: Pt;
  /** Q est un sommet de l'axe focal (tangente verticale). */
  qSommet: boolean;
  /** Ordre d'affichage des quatre fonctions de l'écran 1. */
  options: OptionTD[];
}

/** Bonne option de l'écran 1 (branche qui contient P). */
export const branche = (e: ExerciceTD): OptionTD => (e.P.y > 0 ? "haut" : "bas");

/** Valeur de f(x) sur la branche supérieure (sans signe). */
export function fHaut(c: Conique, x: number): number {
  if (c.type === "parabole") return Math.sqrt(2 * c.p * x);
  if (c.type === "ellipse") return (c.b / c.a) * Math.sqrt(c.a * c.a - x * x);
  return (c.b / c.a) * Math.sqrt(x * x - c.a * c.a);
}

/** Pente de la tangente en P (dérivée de la branche qui contient P). */
export function pente(e: ExerciceTD): number {
  const c = e.conique;
  const { x, y } = e.P;
  if (c.type === "parabole") return c.p / y;
  if (c.type === "ellipse") return -(c.b * c.b * x) / (c.a * c.a * y);
  return (c.b * c.b * x) / (c.a * c.a * y);
}

/** Tangente en P : y − y_P = m(x − x_P). */
export function tangenteP(e: ExerciceTD): D {
  const m = pente(e);
  return normaliserDroite({ a: m, b: -1, c: e.P.y - m * e.P.x });
}

/** Tangente en Q (forme dédoublée). */
export const tangenteQ = (e: ExerciceTD): D => tangenteDedoublee(e.conique, e.Q);

/** Pente obtenue en dérivant l'AUTRE branche (piège du cours). */
export const penteAutreBranche = (e: ExerciceTD): number => -pente(e);
