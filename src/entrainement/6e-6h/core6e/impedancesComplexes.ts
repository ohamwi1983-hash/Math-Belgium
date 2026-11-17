/**
 * Couche core (6e) — `6gen96` « Électricité : impédances complexes » (chapitre 5 de 6e, « Nombres
 * complexes », section `problemesavances`). SOURCE UNIQUE des grandeurs du circuit : l'écran, la
 * vérification, le récapitulatif et l'adaptateur de feuilles en dérivent.
 *
 * Notation des électriciens (décision de l'utilisateur) : l'unité imaginaire s'écrit j (j² = −1,
 * j joue le rôle de i, car i désigne l'intensité du courant). Impédances :
 * Z_R = R, Z_L = jLω, Z_C = 1/(jCω) = −j/(Cω) ; en série elles s'additionnent, en parallèle
 * 1/Z = 1/Z₁ + 1/Z₂, c'est-à-dire Z = Z₁Z₂/(Z₁ + Z₂).
 *
 * Les réactances X_L = Lω et X_C = 1/(Cω) sont stockées en ohms ENTIERS (L et C en sont déduits,
 * en mH et en µF, avec au plus une décimale) : les impédances des composants sont exactes, la
 * forme algébrique de Z aussi (entière en série, décimale à au plus deux chiffres en parallèle) ;
 * seuls le module, l'argument et l'intensité demandent un arrondi (calculatrice).
 */

export type IdVarianteImpedances = "serie2" | "rlc" | "parallele";

/** Nature du circuit — VERDICT de l'écran e), tiré avant les valeurs, jamais dans `forme`. */
export type NatureCircuit = "inductif" | "capacitif" | "resistif";

export interface ExerciceImpedances {
  variante: IdVarianteImpedances;
  nature: NatureCircuit;
  /** Tension efficace (V). */
  U: number;
  /** Pulsation (rad/s). */
  omega: number;
  /** Résistance (Ω). */
  R: number;
  /** Réactance de la bobine X_L = Lω (Ω, entier), `null` sans bobine. */
  xL: number | null;
  /** Réactance du condensateur X_C = 1/(Cω) (Ω, entier), `null` sans condensateur. */
  xC: number | null;
}

export interface Complexe {
  re: number;
  im: number;
}

/** Arrondi qui efface le bruit flottant (19.200000000000003 → 19.2). */
export function nettoyer(v: number, decimales = 9): number {
  const p = 10 ** decimales;
  const r = Math.round(v * p) / p;
  return Object.is(r, -0) ? 0 : r;
}

/** Inductance en mH : L = X_L/ω (H) = 1000·X_L/ω (mH). */
export function inductanceMilliHenry(e: ExerciceImpedances): number {
  return e.xL === null ? 0 : nettoyer((1000 * e.xL) / e.omega, 6);
}

/** Capacité en µF : C = 1/(ω·X_C) (F) = 10⁶/(ω·X_C) (µF). */
export function capaciteMicroFarad(e: ExerciceImpedances): number {
  return e.xC === null ? 0 : nettoyer(1e6 / (e.omega * e.xC), 6);
}

/** Impédance de la bobine : jX_L. */
export function impedanceBobine(e: ExerciceImpedances): Complexe {
  return { re: 0, im: e.xL ?? 0 };
}

/** Impédance du condensateur : 1/(jCω) = −j/(Cω) = −jX_C. */
export function impedanceCondensateur(e: ExerciceImpedances): Complexe {
  return { re: 0, im: -(e.xC ?? 0) };
}

/** Réactance totale d'un circuit série : X = X_L − X_C. */
export function reactanceSerie(e: ExerciceImpedances): number {
  return (e.xL ?? 0) - (e.xC ?? 0);
}

/** Réactance (signée) de la branche réactive d'un circuit parallèle : +X_L ou −X_C. */
export function reactanceBranche(e: ExerciceImpedances): number {
  return e.xL !== null ? e.xL : -(e.xC ?? 0);
}

/** Impédance totale Z (forme algébrique, valeurs nettoyées). */
export function impedanceTotale(e: ExerciceImpedances): Complexe {
  if (e.variante !== "parallele") return { re: e.R, im: reactanceSerie(e) };
  // Z = R·jX/(R + jX) = (R X² + j R² X)/(R² + X²)
  const X = reactanceBranche(e);
  const d = e.R * e.R + X * X;
  return { re: nettoyer((e.R * X * X) / d), im: nettoyer((e.R * e.R * X) / d) };
}

export function moduleZ(e: ExerciceImpedances): number {
  const z = impedanceTotale(e);
  return Math.hypot(z.re, z.im);
}

/** Déphasage φ = arg Z, en degrés (Re Z > 0 : φ ∈ ]−90° ; 90°[). */
export function argumentDegres(e: ExerciceImpedances): number {
  const z = impedanceTotale(e);
  return nettoyer((Math.atan2(z.im, z.re) * 180) / Math.PI);
}

/** Intensité efficace I = U/|Z| (A). */
export function intensite(e: ExerciceImpedances): number {
  return e.U / moduleZ(e);
}

/** Nature déduite des valeurs (contrôle de cohérence avec `e.nature`). */
export function natureCalculee(e: ExerciceImpedances): NatureCircuit {
  const im = impedanceTotale(e).im;
  if (Math.abs(im) < 1e-9) return "resistif";
  return im > 0 ? "inductif" : "capacitif";
}

/** Précisions demandées (affichées dans les consignes, tolérances cohérentes). */
export const DECIMALES_MODULE = 1;
export const DECIMALES_ARGUMENT = 1;
export const DECIMALES_INTENSITE = 2;
