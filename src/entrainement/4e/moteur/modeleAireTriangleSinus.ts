import type { DonneesAngleCompris, ExerciceAireTriangleSinus, NombreRadical, SommetTriangle } from "../core/aireTriangleSinus.types";

/**
 * Modèle de gen75 (« Aire d'un triangle quelconque ») : étapes de chaque famille et valeurs
 * attendues — une seule source pour l'écran, la vérification, l'adaptateur papier et le profil.
 * Toutes les valeurs sont calculées depuis les DONNÉES DE L'ÉNONCÉ (aire donnée au dixième
 * comprise), jamais depuis les valeurs d'origine du tirage.
 */

export type EtapeAireTriangle =
  | "formuleAire"
  | "calculAire"
  | "formuleCote"
  | "calculCote"
  | "sinus"
  | "nombreAngles"
  | "angles"
  | "aireABC"
  | "diagonale"
  | "aireTotale"
  | "demiPerimetre"
  | "aireHeron";

export function etapes(e: ExerciceAireTriangleSinus): EtapeAireTriangle[] {
  switch (e.famille) {
    case "aire":
      return ["formuleAire", "calculAire"];
    case "cote":
      return ["formuleCote", "calculCote"];
    case "angle":
      return ["sinus", "nombreAngles", "angles"];
    case "quadrilatere":
      return ["aireABC", "diagonale", "aireTotale"];
    case "heron":
      return ["demiPerimetre", "aireHeron"];
  }
}

export const ANGLES_REMARQUABLES = [30, 45, 60, 90, 120, 135, 150] as const;

export function estRemarquable(angle: number): boolean {
  return (ANGLES_REMARQUABLES as readonly number[]).includes(angle);
}

const D2R = Math.PI / 180;

export function sinDeg(a: number): number {
  return Math.sin(a * D2R);
}

export function cosDeg(a: number): number {
  return Math.cos(a * D2R);
}

// ---------------------------------------------------------------------------------------------
// Noms des points et des segments
// ---------------------------------------------------------------------------------------------

/** Segment écrit dans l'ordre alphabétique (« AB », « BC », « AC »). */
export function segment(p: string, q: string): string {
  return p < q ? `${p}${q}` : `${q}${p}`;
}

/** Sommet X de l'angle compris et les deux autres sommets Y < Z : côtés [XY] (cote1) et [XZ] (cote2),
 * côté opposé [YZ]. */
export function nomsAngleCompris(sommet: SommetTriangle): { X: SommetTriangle; Y: SommetTriangle; Z: SommetTriangle; seg1: string; seg2: string; oppose: string } {
  const autres = (["A", "B", "C"] as const).filter((s) => s !== sommet);
  const [Y, Z] = autres as [SommetTriangle, SommetTriangle];
  return { X: sommet, Y, Z, seg1: segment(sommet, Y), seg2: segment(sommet, Z), oppose: segment(Y, Z) };
}

// ---------------------------------------------------------------------------------------------
// Nombres exacts
// ---------------------------------------------------------------------------------------------

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function radical(n: number, d: number, r: 1 | 2 | 3): NombreRadical {
  const g = pgcd(n, d);
  return { n: n / g, d: d / g, r };
}

export function valeurRadical(x: NombreRadical): number {
  return (x.n / x.d) * Math.sqrt(x.r);
}

/** sin d'un angle remarquable en valeur exacte (n/d)·√r. */
export function sinusExact(angle: number): NombreRadical | null {
  const aigu = angle > 90 ? 180 - angle : angle;
  if (aigu === 30) return { n: 1, d: 2, r: 1 };
  if (aigu === 45) return { n: 1, d: 2, r: 2 };
  if (aigu === 60) return { n: 1, d: 2, r: 3 };
  if (aigu === 90) return { n: 1, d: 1, r: 1 };
  return null;
}

/** ½·c1·c2·sin(angle) en valeur exacte, si l'angle est remarquable. */
export function aireExacte(c1: number, c2: number, angle: number): NombreRadical | null {
  const s = sinusExact(angle);
  if (!s) return null;
  return radical(c1 * c2 * s.n, 2 * s.d, s.r);
}

// ---------------------------------------------------------------------------------------------
// Valeurs attendues
// ---------------------------------------------------------------------------------------------

export function aireAngleCompris(d: DonneesAngleCompris): number {
  return 0.5 * d.cote1 * d.cote2 * sinDeg(d.angle);
}

/** Famille `cote` : XZ = 2·Aire / (XY·sin X̂), depuis l'aire DONNÉE. */
export function coteAttendu(e: Extract<ExerciceAireTriangleSinus, { famille: "cote" }>): number {
  return (2 * e.aire.valeur) / (e.cote1 * sinDeg(e.angle));
}

/** Famille `angle` : sin X̂ = 2·Aire / (XY·XZ). */
export function sinusAttendu(e: Extract<ExerciceAireTriangleSinus, { famille: "angle" }>): number {
  return (2 * e.aire.valeur) / (e.cote1 * e.cote2);
}

/** Les amplitudes possibles de X̂ (une seule si sin X̂ = 1), dans l'ordre croissant. */
export function anglesAttendus(e: Extract<ExerciceAireTriangleSinus, { famille: "angle" }>): number[] {
  const s = sinusAttendu(e);
  if (Math.abs(s - 1) < 1e-9) return [90];
  const aigu = Math.asin(Math.min(1, s)) / D2R;
  return [aigu, 180 - aigu];
}

export function aireABC(e: Extract<ExerciceAireTriangleSinus, { famille: "quadrilatere" }>): number {
  return 0.5 * e.AB * e.BC * sinDeg(e.angleB);
}

export function diagonaleCarree(e: Extract<ExerciceAireTriangleSinus, { famille: "quadrilatere" }>): number {
  return e.AB * e.AB + e.BC * e.BC - 2 * e.AB * e.BC * cosDeg(e.angleB);
}

export function diagonale(e: Extract<ExerciceAireTriangleSinus, { famille: "quadrilatere" }>): number {
  return Math.sqrt(diagonaleCarree(e));
}

export function aireACD(e: Extract<ExerciceAireTriangleSinus, { famille: "quadrilatere" }>): number {
  return 0.5 * diagonale(e) * e.CD * sinDeg(e.angleACD);
}

export function aireQuadrilatere(e: Extract<ExerciceAireTriangleSinus, { famille: "quadrilatere" }>): number {
  return aireABC(e) + aireACD(e);
}

export function demiPerimetre(e: Extract<ExerciceAireTriangleSinus, { famille: "heron" }>): number {
  return (e.a + e.b + e.c) / 2;
}

export function produitHeron(e: Extract<ExerciceAireTriangleSinus, { famille: "heron" }>): number {
  const p = demiPerimetre(e);
  return p * (p - e.a) * (p - e.b) * (p - e.c);
}

export function aireHeron(e: Extract<ExerciceAireTriangleSinus, { famille: "heron" }>): number {
  return Math.sqrt(produitHeron(e));
}

/** Valeur attendue d'une étape numérique à un seul champ (`null` pour les étapes à choix fermé et
 * l'étape `angles`, à plusieurs champs). */
export function valeurAttendue(e: ExerciceAireTriangleSinus, etape: EtapeAireTriangle): number | null {
  switch (etape) {
    case "calculAire":
      return e.famille === "aire" ? aireAngleCompris(e) : null;
    case "calculCote":
      return e.famille === "cote" ? coteAttendu(e) : null;
    case "sinus":
      return e.famille === "angle" ? sinusAttendu(e) : null;
    case "aireABC":
      return e.famille === "quadrilatere" ? aireABC(e) : null;
    case "diagonale":
      return e.famille === "quadrilatere" ? diagonale(e) : null;
    case "aireTotale":
      return e.famille === "quadrilatere" ? aireQuadrilatere(e) : null;
    case "demiPerimetre":
      return e.famille === "heron" ? demiPerimetre(e) : null;
    case "aireHeron":
      return e.famille === "heron" ? aireHeron(e) : null;
    default:
      return null;
  }
}

/** Angle qui « porte » le sinus de l'exercice (cas particulier 90° : sin = 1). */
export function angleCle(e: ExerciceAireTriangleSinus): number | null {
  if (e.famille === "aire" || e.famille === "cote" || e.famille === "angle") return e.angle;
  if (e.famille === "quadrilatere") return e.angleB;
  return null;
}

/** Exercice faisable sans calculatrice (valeurs remarquables, nombres simples). */
export function calculExact(e: ExerciceAireTriangleSinus): boolean {
  if (e.famille === "aire") return estRemarquable(e.angle);
  if (e.famille === "angle" || e.famille === "cote") return e.aire.exacte !== null;
  if (e.famille === "heron") {
    // Demi-périmètre entier et produit carré parfait : aire entière.
    const racine = Math.round(Math.sqrt(produitHeron(e)));
    return Number.isInteger(demiPerimetre(e)) && racine * racine === produitHeron(e);
  }
  return false;
}

// ---------------------------------------------------------------------------------------------
// Options des écrans à choix fermé (identifiants ; textes dans `ui/formatAireTriangleSinus.ts`)
// ---------------------------------------------------------------------------------------------

export type OptionFormule = "correcte" | "piege1" | "piege2" | "piege3";
export const OPTIONS_FORMULE: OptionFormule[] = ["correcte", "piege1", "piege2", "piege3"];

export type OptionNombre = "un" | "deux";
