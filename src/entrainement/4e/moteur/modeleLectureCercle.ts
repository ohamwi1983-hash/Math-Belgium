import type { ExerciceLectureCercle, Grandeur, PositionCercle, ValeurExacteSignee } from "../core/lectureCercle.types";

/**
 * Modèle de gen122 « Lire sur le cercle trigonométrique » : valeurs EXACTES (jamais de flottant
 * relu) de cos θ, sin θ et tan θ pour les 16 angles remarquables, position de M, candidats de
 * l'écran 2 et écritures LaTeX (degrés, radians, valeurs). Une seule source pour l'écran, les aides,
 * le papier et le corrigé.
 */

type E = ExerciceLectureCercle;

/** Les 16 angles remarquables de [0° ; 360°[. */
export const ANGLES_REMARQUABLES = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330] as const;

export const VALEUR_GRANDEUR: Record<Grandeur, number> = {
  "0": 0,
  "1/2": 0.5,
  "r2/2": Math.SQRT2 / 2,
  "r3/2": Math.sqrt(3) / 2,
  "1": 1,
  "r3/3": Math.sqrt(3) / 3,
  r3: Math.sqrt(3),
};

export const LATEX_GRANDEUR: Record<Grandeur, string> = {
  "0": "0",
  "1/2": "\\dfrac{1}{2}",
  "r2/2": "\\dfrac{\\sqrt{2}}{2}",
  "r3/2": "\\dfrac{\\sqrt{3}}{2}",
  "1": "1",
  "r3/3": "\\dfrac{\\sqrt{3}}{3}",
  r3: "\\sqrt{3}",
};

/** Graduations des axes (demi-axes positifs) et de la tangente x = 1. */
export const GRADUATIONS_AXES: Grandeur[] = ["1/2", "r2/2", "r3/2", "1"];
export const GRADUATIONS_TANGENTE: Grandeur[] = ["r3/3", "1", "r3"];

/** cos, sin, tan de l'angle du premier quadrant (0°, 30°, 45°, 60°, 90°). */
const COS_REF: Record<number, Grandeur> = { 0: "1", 30: "r3/2", 45: "r2/2", 60: "1/2", 90: "0" };
const SIN_REF: Record<number, Grandeur> = { 0: "0", 30: "1/2", 45: "r2/2", 60: "r3/2", 90: "1" };
const TAN_REF: Record<number, Grandeur | null> = { 0: "0", 30: "r3/3", 45: "1", 60: "r3", 90: null };

export function position(e: E): PositionCercle {
  const a = e.angle;
  if (a === 0 || a === 180) return "axe-horizontal";
  if (a === 90 || a === 270) return "axe-vertical";
  return a < 90 ? "I" : a < 180 ? "II" : a < 270 ? "III" : "IV";
}

export function surUnAxe(e: E): boolean {
  return position(e).startsWith("axe");
}

/** Angle du premier quadrant (angle aigu entre (OM) et l'axe horizontal), de 0° à 90°. */
export function angleReference(e: E): number {
  const a = e.angle;
  if (a <= 90) return a;
  if (a <= 180) return 180 - a;
  if (a <= 270) return a - 180;
  return 360 - a;
}

function signeCos(a: number): -1 | 0 | 1 {
  if (a === 90 || a === 270) return 0;
  return a < 90 || a > 270 ? 1 : -1;
}

function signeSin(a: number): -1 | 0 | 1 {
  if (a === 0 || a === 180) return 0;
  return a < 180 ? 1 : -1;
}

export function cosExact(e: E): ValeurExacteSignee {
  return { signe: signeCos(e.angle), grandeur: COS_REF[angleReference(e)]! };
}

export function sinExact(e: E): ValeurExacteSignee {
  return { signe: signeSin(e.angle), grandeur: SIN_REF[angleReference(e)]! };
}

/** null : tan θ n'est pas définie (cos θ = 0, (OM) parallèle à la tangente x = 1). */
export function tanExact(e: E): ValeurExacteSignee | null {
  const g = TAN_REF[angleReference(e)];
  if (g === null || g === undefined) return null;
  const s = signeCos(e.angle) * signeSin(e.angle);
  return { signe: (g === "0" ? 0 : s) as -1 | 0 | 1, grandeur: g };
}

export function tanDefinie(e: E): boolean {
  return tanExact(e) !== null;
}

export function valeurNumerique(v: ValeurExacteSignee): number {
  return v.grandeur === "0" ? 0 : (v.signe < 0 ? -1 : 1) * VALEUR_GRANDEUR[v.grandeur];
}

export function valeurLatex(v: ValeurExacteSignee): string {
  return v.signe < 0 && v.grandeur !== "0" ? `-${LATEX_GRANDEUR[v.grandeur]}` : LATEX_GRANDEUR[v.grandeur];
}

export function oppose(v: ValeurExacteSignee): ValeurExacteSignee {
  return { signe: (v.signe === 0 ? 0 : -v.signe) as -1 | 0 | 1, grandeur: v.grandeur };
}

/** Angle de [0 ; 360[ ramené (sans flottant). */
export function ramener(a: number): number {
  return ((a % 360) + 360) % 360;
}

/** Les angles de [0° ; 360°[ de même cosinus que θ (deux candidats, un seul en 0° et 180°). */
export function candidatsCosinus(e: E): number[] {
  const a = e.angle;
  const autre = ramener(360 - a);
  return autre === a ? [a] : [Math.min(a, autre), Math.max(a, autre)];
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

/** « 120^\circ » ou « \dfrac{2\pi}{3} » (θ en degrés entiers, radians en kπ/n réduit). */
export function angleLatexUnite(degres: number, unite: E["variante"]): string {
  if (unite === "degres") return `${degres}^\\circ`;
  if (degres === 0) return "0";
  const g = pgcd(degres, 180);
  const p = degres / g;
  const q = 180 / g;
  const num = p === 1 ? "\\pi" : `${p}\\pi`;
  return q === 1 ? num : `\\dfrac{${num}}{${q}}`;
}

export function angleLatex(e: E, degres = e.angle): string {
  return angleLatexUnite(degres, e.variante);
}

/** Valeur numérique attendue à l'écran 2 (degrés ou radians). */
export function angleAttendu(e: E): number {
  return e.variante === "degres" ? e.angle : (e.angle * Math.PI) / 180;
}

/** Coordonnées de M (flottants, pour la figure seulement). */
export function coordonneesM(e: E): { x: number; y: number } {
  return { x: valeurNumerique(cosExact(e)), y: valeurNumerique(sinExact(e)) };
}
