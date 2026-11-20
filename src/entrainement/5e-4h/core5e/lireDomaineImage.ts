import type { Ensemble, Intervalle } from "../moteur5e/ensemblesReels";
import { intervalle, normaliser, point, priveDe, reunion } from "../moteur5e/ensemblesReels";

/**
 * Couche core — `5gen59` « Lire domaine et image sur un graphique » (5e ch. 1, intro et § 1,
 * processus 1 CONNAÎTRE). Une fonction affine par morceaux, sommets à coordonnées ENTIÈRES (toutes
 * les valeurs se lisent sur les lignes d'une grille d'une unité), extrémités pleines (comprises) ou
 * creuses (exclues), flèches quand la courbe se prolonge ; sans flèche, le graphique est déclaré
 * complet. Trois écrans : dom f (projection sur Ox), Im f (projection sur Oy), f(a) existe ou non
 * (VERDICT tiré 50/50, jamais dans `forme`).
 */

export type VarianteLireDomaine = "complet" | "deuxMorceaux" | "prolongee" | "pointExclu";
export type Extremite = "plein" | "creux" | "fleche";

export interface Morceau {
  /** Sommets (x croissants), coordonnées entières. */
  pts: [number, number][];
  g: Extremite;
  d: Extremite;
}

/** Où tombe la valeur a de l'écran 3 (pour le message ciblé et le corrigé). */
export type LieuA = "dehors" | "creux" | "trou" | "ecart" | "plein" | "sommet" | "deplace" | "saut" | "interieur";

export interface ExerciceLireDomaine {
  variante: VarianteLireDomaine;
  morceaux: Morceau[];
  /** Point creux à l'intérieur de la courbe (valeur retirée), sur un sommet. */
  trou: { x: number; y: number } | null;
  /** Point plein isolé à l'abscisse du trou (la valeur existe, mais ailleurs). */
  deplace: { x: number; y: number } | null;
  a: number;
  existe: boolean;
  lieu: LieuA;
  fenetre: { xMin: number; xMax: number; yMin: number; yMax: number };
}

const pente = (p: [number, number], q: [number, number]) => (q[1] - p[1]) / (q[0] - p[0]);

/** Domaine lu sur le graphique. */
export function domaine(e: ExerciceLireDomaine): Ensemble {
  const parts: Intervalle[] = e.morceaux.map((m) => {
    const g = m.pts[0]![0];
    const d = m.pts[m.pts.length - 1]![0];
    return intervalle(m.g === "fleche" ? -Infinity : g, m.g === "plein", m.d === "fleche" ? Infinity : d, m.d === "plein");
  });
  let ens = normaliser(parts);
  if (e.trou) ens = priveDe(ens, [e.trou.x]);
  if (e.deplace) ens = reunion(ens, [point(e.deplace.x)]);
  return ens;
}

/** Image de UN morceau (trou compris s'il y est). */
export function imageMorceau(e: ExerciceLireDomaine, m: Morceau): Ensemble {
  const parts: Intervalle[] = [];
  const n = m.pts.length;
  for (let i = 0; i < n - 1; i++) {
    const P = m.pts[i]!;
    const Q = m.pts[i + 1]!;
    let iP = i > 0 || m.g !== "creux";
    let iQ = i < n - 2 || m.d !== "creux";
    if (e.trou && e.trou.x === P[0] && e.trou.y === P[1]) iP = false;
    if (e.trou && e.trou.x === Q[0] && e.trou.y === Q[1]) iQ = false;
    if (P[1] === Q[1]) parts.push(point(P[1]));
    else if (P[1] < Q[1]) parts.push({ g: P[1], gF: iP, d: Q[1], dF: iQ });
    else parts.push({ g: Q[1], gF: iQ, d: P[1], dF: iP });
  }
  if (m.g === "fleche") {
    const s = pente(m.pts[0]!, m.pts[1]!);
    const y0 = m.pts[0]![1];
    parts.push(s > 0 ? intervalle(-Infinity, false, y0, true) : s < 0 ? intervalle(y0, true, Infinity, false) : point(y0));
  }
  if (m.d === "fleche") {
    const s = pente(m.pts[n - 2]!, m.pts[n - 1]!);
    const yn = m.pts[n - 1]![1];
    parts.push(s > 0 ? intervalle(yn, true, Infinity, false) : s < 0 ? intervalle(-Infinity, false, yn, true) : point(yn));
  }
  return normaliser(parts);
}

/** Image lue sur le graphique. */
export function image(e: ExerciceLireDomaine): Ensemble {
  const ens = reunion(...e.morceaux.map((m) => imageMorceau(e, m)));
  return e.deplace ? reunion(ens, [point(e.deplace.y)]) : ens;
}

/** f(x) lu sur le graphique (null : n'existe pas). */
export function valeur(e: ExerciceLireDomaine, x: number): number | null {
  if (e.deplace && e.deplace.x === x) return e.deplace.y;
  if (e.trou && e.trou.x === x) return null;
  for (const m of e.morceaux) {
    const n = m.pts.length;
    const x0 = m.pts[0]![0];
    const xn = m.pts[n - 1]![0];
    if (x < x0) {
      if (m.g !== "fleche") continue;
      return m.pts[0]![1] + pente(m.pts[0]!, m.pts[1]!) * (x - x0);
    }
    if (x > xn) {
      if (m.d !== "fleche") continue;
      return m.pts[n - 1]![1] + pente(m.pts[n - 2]!, m.pts[n - 1]!) * (x - xn);
    }
    if (x === x0 && m.g === "creux") continue;
    if (x === xn && m.d === "creux") continue;
    for (let i = 0; i < n - 1; i++) {
      const P = m.pts[i]!;
      const Q = m.pts[i + 1]!;
      if (x >= P[0] && x <= Q[0]) return P[1] + pente(P, Q) * (x - P[0]);
    }
  }
  return null;
}

/** Le graphique a-t-il au moins une flèche ? */
export const aDesFleches = (e: ExerciceLireDomaine): boolean => e.morceaux.some((m) => m.g === "fleche" || m.d === "fleche");
