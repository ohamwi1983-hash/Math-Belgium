import { nombreLatex } from "../../4e/moteur/algebreTransfertSecondDegre";
import type { Frag } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import type { D, Fenetre, SpecFigure } from "../../4e/ui/outilsAnalytiqueLotG";
import { COULEURS, fenetreAutour, figureRepere, nombreTexte } from "../../4e/ui/outilsAnalytiqueLotG";

/**
 * Outils communs du lot H2 du 6e ch. 9 « Lieux géométriques » (6gen128 traduire un lieu, 6gen129
 * courbe paramétrée, 6gen130 lieux en contexte, 6gen131 détective) — SOURCE UNIQUE pour l'écran, les
 * aides, le papier et le corrigé : écritures LaTeX du cours (point A(3 ; −2), équations de cercle et de
 * droite en forme implicite, nombres exacts), hasard (`Math.random` seul : `genererAvecCode` le
 * remplace par une graine) et figures (repère quadrillé de `4e/ui/outilsAnalytiqueLotG.ts`, même
 * échelle sur les deux axes, aucun identifiant SVG).
 */

export interface Pt {
  x: number;
  y: number;
}

export const t = tx;
export const l = lx;

// ---------------------------------------------------------------------------------------------
// Hasard
// ---------------------------------------------------------------------------------------------

export const entier = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));
export const parmi = <T,>(liste: readonly T[]): T => liste[Math.floor(Math.random() * liste.length)]!;
export function nonNul(a: number, b: number): number {
  for (;;) {
    const v = entier(a, b);
    if (v !== 0) return v;
  }
}
export function melanger<T>(liste: readonly T[]): T[] {
  const c = [...liste];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}

export function pgcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

// ---------------------------------------------------------------------------------------------
// Nombres et points
// ---------------------------------------------------------------------------------------------

const net = (v: number) => (Math.abs(v) < 1e-12 ? 0 : Math.abs(v - Math.round(v)) < 1e-9 ? Math.round(v) : v);

/** Nombre exact en LaTeX (entier, fraction, racine). */
export function nL(v: number): string {
  return nombreLatex(net(v));
}
/** Même nombre, entre parenthèses s'il est négatif. */
export const nP = (v: number): string => (net(v) < 0 ? `(${nL(v)})` : nL(v));
/** Expression affine « c + kt » (« 3-2t », « t », « -t », « 4 »). */
export function affineTL(c: number, k: number, v = "t"): string {
  const kt = k === 0 ? "" : `${Math.abs(k) === 1 ? "" : nL(Math.abs(k))}${v}`;
  if (c === 0) return k === 0 ? "0" : `${k < 0 ? "-" : ""}${kt}`;
  return k === 0 ? nL(c) : `${nL(c)}${k < 0 ? "-" : "+"}${kt}`;
}

/** Coordonnées « (3\,;-2) ». */
export const coordL = (p: Pt): string => {
  const c = `${nL(p.x)}\\,;${nL(p.y)}`;
  return /dfrac/.test(c) ? `\\left(${c}\\right)` : `(${c})`;
};
/** Point nommé « A(3\,;-2) ». */
export const ptL = (nom: string, p: Pt): string => `${nom}${coordL(p)}`;
/** Étiquette de figure (texte brut, « − » typographique, « 5/2 »). */
export const etiquette = (nom: string, p: Pt): string => `${nom}(${nombreTexte(net(p.x))} ; ${nombreTexte(net(p.y))})`;
/** Liste de points « (1\,;2)\ ;\ (3\,;-1) ». */
export const listeL = (pts: Pt[]): string => pts.map(coordL).join("\\ ;\\ ");
export const milieu = (A: Pt, B: Pt): Pt => ({ x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 });
export const dist2 = (A: Pt, B: Pt): number => (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
export const memePoint = (A: Pt, B: Pt, eps = 1e-7): boolean => Math.abs(A.x - B.x) < eps && Math.abs(A.y - B.y) < eps;

/** Racine exacte d'un rationnel positif (« \sqrt{13} », « 3 », « \dfrac{\sqrt{10}}{2} »). */
export function racineL(carre: number): string {
  const c = net(carre);
  for (const d of [1, 2, 4, 9, 16, 25, 36, 3, 8]) {
    const n = c * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) {
      const entierN = Math.round(n);
      // √(n/d) = √(n·d)/d
      const produit = entierN * d;
      let k = 1;
      let reste = produit;
      for (let f = 2; f * f <= reste; f++) {
        while (reste % (f * f) === 0) {
          reste /= f * f;
          k *= f;
        }
      }
      const g = pgcd(k, d);
      const num = k / g;
      const den = d / g;
      const rac = reste === 1 ? `${num}` : `${num === 1 ? "" : num}\\sqrt{${reste}}`;
      return den === 1 ? rac : `\\dfrac{${rac}}{${den}}`;
    }
  }
  return `\\sqrt{${nL(c)}}`;
}

// ---------------------------------------------------------------------------------------------
// Polynômes en x et y (équations de lieux)
// ---------------------------------------------------------------------------------------------

export type Monome = "x2" | "y2" | "xy" | "x" | "y" | "1";
export type Poly = Partial<Record<Monome, number>>;
const ORDRE: Monome[] = ["x2", "y2", "xy", "x", "y", "1"];
const PARTIE: Record<Monome, string> = { x2: "x^2", y2: "y^2", xy: "xy", x: "x", y: "y", "1": "" };

export function evalPoly(p: Poly, x: number, y: number): number {
  return (p.x2 ?? 0) * x * x + (p.y2 ?? 0) * y * y + (p.xy ?? 0) * x * y + (p.x ?? 0) * x + (p.y ?? 0) * y + (p["1"] ?? 0);
}

/** Écriture « x^2+y^2-4x+2y-4 » (termes nuls omis, coefficients ±1 implicites). */
export function polyL(p: Poly): string {
  let s = "";
  for (const m of ORDRE) {
    const c = net(p[m] ?? 0);
    if (c === 0) continue;
    const abs = Math.abs(c);
    const coef = m !== "1" && abs === 1 ? "" : nL(abs);
    s += `${c < 0 ? "-" : s ? "+" : ""}${coef}${PARTIE[m]}`;
  }
  return s || "0";
}
export const equationPolyL = (p: Poly): string => `${polyL(p)}=0`;

/** Coefficients entiers premiers entre eux, premier coefficient non nul positif. */
export function normaliserPoly(p: Poly): Poly {
  const vals = ORDRE.map((m) => p[m] ?? 0);
  let k = 1;
  for (; k <= 60; k++) if (vals.every((v) => Math.abs(v * k - Math.round(v * k)) < 1e-9)) break;
  const ent = vals.map((v) => Math.round(v * k));
  const g = ent.reduce((a, b) => pgcd(a, b), 0) || 1;
  const premier = ent.find((v) => v !== 0) ?? 1;
  const s = premier < 0 ? -1 : 1;
  const r: Poly = {};
  ORDRE.forEach((m, i) => {
    if (ent[i]) r[m] = (s * ent[i]!) / g;
  });
  return r;
}

/** Cercle (x − a)² + (y − b)² = r² en forme développée normalisée. */
export function polyCercle(c: Pt, r2: number): Poly {
  return { x2: 1, y2: 1, x: -2 * c.x, y: -2 * c.y, "1": c.x * c.x + c.y * c.y - r2 };
}
/** Cercle de diamètre [AB] : (x − xA)(x − xB) + (y − yA)(y − yB) = 0. */
export function polyDiametre(A: Pt, B: Pt): Poly {
  return { x2: 1, y2: 1, x: -(A.x + B.x), y: -(A.y + B.y), "1": A.x * B.x + A.y * B.y };
}
export const polyDroite = (d: D): Poly => ({ x: d.a, y: d.b, "1": d.c });
/** Produit de deux droites (réunion). */
export function polyProduit(d1: D, d2: D): Poly {
  return { x2: d1.a * d2.a, y2: d1.b * d2.b, xy: d1.a * d2.b + d1.b * d2.a, x: d1.a * d2.c + d1.c * d2.a, y: d1.b * d2.c + d1.c * d2.b, "1": d1.c * d2.c };
}
export function normaliserDroite(d: D): D {
  const p = normaliserPoly(polyDroite(d));
  return { a: p.x ?? 0, b: p.y ?? 0, c: p["1"] ?? 0 };
}
export const droiteL = (d: D): string => equationPolyL(polyDroite(normaliserDroite(d)));
export const evalDroite = (d: D, p: Pt): number => d.a * p.x + d.b * p.y + d.c;
/** Droite par deux points. */
export function droiteDeuxPoints(A: Pt, B: Pt): D {
  return normaliserDroite({ a: B.y - A.y, b: A.x - B.x, c: -(B.y - A.y) * A.x - (A.x - B.x) * A.y });
}
/** Médiatrice de [AB] : 2(xB − xA)x + 2(yB − yA)y + (xA² + yA² − xB² − yB²) = 0. */
export function mediatrice(A: Pt, B: Pt): D {
  return normaliserDroite({ a: 2 * (B.x - A.x), b: 2 * (B.y - A.y), c: A.x * A.x + A.y * A.y - B.x * B.x - B.y * B.y });
}
/** Perpendiculaire à (AB) passant par P. */
export function perpendiculaire(A: Pt, B: Pt, P: Pt): D {
  return normaliserDroite({ a: B.x - A.x, b: B.y - A.y, c: -(B.x - A.x) * P.x - (B.y - A.y) * P.y });
}
export function intersection(d1: D, d2: D): Pt | null {
  const det = d1.a * d2.b - d2.a * d1.b;
  if (Math.abs(det) < 1e-12) return null;
  return { x: (d1.b * d2.c - d2.b * d1.c) / det, y: (d2.a * d1.c - d1.a * d2.c) / det };
}

/** « (x−3)^2 » ; « x^2 » si 0. */
export function carreL(v: string, c: number): string {
  const k = net(c);
  if (k === 0) return `${v}^2`;
  return `(${v}${k < 0 ? "+" : "-"}${nL(Math.abs(k))})^2`;
}
/** Équation réduite du cercle « (x-3)^2+(y+1)^2=13 ». */
export const cercleReduitL = (c: Pt, r2: number): string => `${carreL("x", c.x)}+${carreL("y", c.y)}=${nL(r2)}`;

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

export { COULEURS, figureRepere };
export type { D, Fenetre, SpecFigure };

/** Fenêtre entière autour des points, plafonnée pour rester lisible à 390 px. */
export function fenetreLieu(points: Pt[], marge = 1, min = 6): Fenetre {
  return fenetreAutour(points, marge, min);
}

/** Points d'un cercle (pour les arcs : `t0` → `t1`, en radians). */
export function pointsArc(c: Pt, r: number, t0 = 0, t1 = 2 * Math.PI, n = 96): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const a = t0 + ((t1 - t0) * i) / n;
    pts.push({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
  }
  return pts;
}

export function figureLieu(spec: SpecFigure): string {
  return figureRepere({ unite: 20, graduationsLisibles: true, ...spec });
}

/** Texte « une équation » de la saisie lisible en LaTeX (fiche). */
export function fragmentsTexte(...morceaux: (string | { l: string })[]): Frag[] {
  return morceaux.map((m) => (typeof m === "string" ? t(m) : l(m.l)));
}
