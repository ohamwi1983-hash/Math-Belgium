import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { lireValeur } from "../../../../5e-4h/moteur5e/lectureValeurTrigo";
import { formePolynome, lirePolynome } from "../../../../5e-4h/moteur5e/polynomeSaisi";
import type { ExerciceSansAbs, PhaseSansAbs } from "../core/types";
import { indiceMorceau, interieurL } from "../ui/format";

/**
 * Couche B — vérification de `56gen19`. Zéros : deux nombres lus (fractions, « − »), rangés. Morceaux :
 * polynôme lu par `polynomeSaisi` ; juste en valeur mais non réduit (« −x + 1 + 2x + 3 ») ou encore avec
 * des parenthèses : à reprendre, sans tentative. Messages ciblés : expression d'un autre intervalle, un
 * seul terme au mauvais signe, zéros échangés.
 */

type E = ExerciceSansAbs;
type P = PhaseSansAbs;
const EPS = 1e-9;
const v = (x: { n: number; d: number }) => x.n / x.d;

/** Écriture réduite (« 0 » seul compte comme réduit). */
const estReduite = (texte: string): boolean => /^\s*[+-]?\s*0\s*$/.test(texte) || formePolynome(texte) === "developpee-reduite";

function lireAffine(texte: string): [number, number] | null {
  const p = lirePolynome(texte.replace(/^\s*f\s*\(\s*x\s*\)\s*=\s*/, ""));
  if (!p) return null;
  if (p.slice(2).some((c) => Math.abs(c) > EPS)) return [NaN, NaN];
  return [p[1] ?? 0, p[0] ?? 0];
}

export function diagnostiquer(e: E, p: P, valeurs: string[]): StatutVerification[] {
  if (p === "zeros") {
    const a = lireValeur(valeurs[0] ?? "");
    const b = lireValeur(valeurs[1] ?? "");
    if (a === null || b === null) return ["parse_error"];
    return [Math.abs(a - v(e.z1)) < EPS ? "correct" : "not_equivalent", Math.abs(b - v(e.z2)) < EPS ? "correct" : "not_equivalent"];
  }
  const l = lireAffine(valeurs[0] ?? "");
  if (!l) return ["parse_error"];
  const [pente, ord] = e.morceaux[indiceMorceau(p)];
  const juste = Math.abs(l[0] - pente) < EPS && Math.abs(l[1] - ord) < EPS;
  if (!juste) return ["not_equivalent"];
  return [estReduite((valeurs[0] ?? "").replace(/^\s*f\s*\(\s*x\s*\)\s*=\s*/, "")) ? "correct" : "not_equivalent"];
}

export function aReprendre(e: E, p: P, valeurs: string[]): Frag[] | null {
  if (p === "zeros") return null;
  const texte = (valeurs[0] ?? "").replace(/^\s*f\s*\(\s*x\s*\)\s*=\s*/, "");
  const l = lireAffine(texte);
  if (!l) return null;
  const [pente, ord] = e.morceaux[indiceMorceau(p)];
  if (Math.abs(l[0] - pente) > EPS || Math.abs(l[1] - ord) > EPS) return null;
  if (estReduite(texte)) return null;
  return [tx("C'est la bonne valeur, mais réduis l'expression (sans parenthèses, un seul terme en x et un seul nombre). Cette saisie ne compte pas comme une tentative.")];
}

export function piege(e: E, p: P, valeurs: string[]): Frag[] | null {
  const statuts = diagnostiquer(e, p, valeurs);
  if (statuts.every((s) => s === "correct") || statuts.includes("parse_error")) return null;
  if (p === "zeros") {
    const a = lireValeur(valeurs[0] ?? "")!;
    const b = lireValeur(valeurs[1] ?? "")!;
    if (Math.abs(a - v(e.z2)) < EPS && Math.abs(b - v(e.z1)) < EPS) return [tx("Ce sont les bons zéros, mais range-les : "), lx("z_1"), tx(" est le plus petit.")];
    const [t1, t2] = e.termes;
    return [tx("Le zéro de "), lx(interieurL(t2)), tx(" est la solution de "), lx(`${interieurL(t2)}=0`), tx(" ; celui de "), lx(interieurL(t1)), tx(" de "), lx(`${interieurL(t1)}=0`), tx(".")];
  }
  const l = lireAffine(valeurs[0] ?? "");
  if (!l || Number.isNaN(l[0])) return null;
  const i = indiceMorceau(p);
  const autre = e.morceaux.findIndex((m, j) => j !== i && Math.abs(m[0] - l[0]) < EPS && Math.abs(m[1] - l[1]) < EPS);
  if (autre !== -1) return [tx("C'est l'expression d'un autre intervalle : reprends le signe de chaque expression sur celui-ci.")];
  // Un seul terme au mauvais signe ?
  const [t1, t2] = e.termes;
  const [pente, ord] = e.morceaux[i];
  for (const t of [t1, t2]) {
    const pente2 = pente - 2 * t.alpha * signe(e, t, i) * t.a;
    const ord2 = ord - 2 * t.alpha * signe(e, t, i) * t.b;
    if (Math.abs(pente2 - l[0]) < EPS && Math.abs(ord2 - l[1]) < EPS) return [tx("Revois le signe de "), lx(interieurL(t)), tx(" sur cet intervalle : prends une valeur test.")];
  }
  return [tx("Remplace chaque valeur absolue par l'expression ou son opposé, puis réduis en regroupant les termes en x et les nombres.")];
}

/** Signe de a x + b sur l'intervalle i. */
export function signe(e: E, t: { a: number; b: number }, i: number): number {
  const z1 = v(e.z1);
  const z2 = v(e.z2);
  const x0 = i === 0 ? z1 - 1 : i === 1 ? (z1 + z2) / 2 : z2 + 1;
  return Math.sign(t.a * x0 + t.b);
}
