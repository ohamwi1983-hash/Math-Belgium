import { estCarreParfait, latexCarreDecale, latexQ, latexRacine, polyAdd, polyConst, polyMul, polyScal, polySub, polyVar, q, qAdd, qDiv, qMul, qNeg, qNum, qSub, Q0, Q1 } from "./algebreLieux";
import type { Droite, Poly, Pt, Q } from "./algebreLieux";
import { droiteNormalisee } from "./algebreLieux";

/**
 * Algèbre EXACTE des coniques, commune aux six générateurs du 6e ch. 10 (6gen58–6gen63, audit, lots B
 * et C). Une conique est décrite par sa nature, son centre (ou son sommet) et son axe focal, avec les
 * conventions du COURS :
 * - ellipse : a = demi-grand axe (sur l'axe focal), b = demi-petit axe, c² = a² − b² ;
 * - hyperbole : a = demi-axe focal, b = l'autre demi-axe, c² = a² + b² ; axe focal Oy :
 *   y²/a² − x²/b² = 1, asymptotes y = ±(a/b)x ;
 * - parabole (décision 1 de l'utilisateur, alignée sur la 4e) : y² = 2px, p = dist(F ; d) > 0,
 *   F(p/2 ; 0), d ≡ x = −p/2, tangente y·y_P = p(x + x_P).
 * Coordonnées irrationnelles (foyers, sommets) écrites h ± √R simplifiée, valeurs numériques à part.
 */

export type Axe = "x" | "y";

export type Conique =
  | { type: "ellipse"; centre: Pt; axe: Axe; a2: Q; b2: Q }
  | { type: "hyperbole"; centre: Pt; axe: Axe; a2: Q; b2: Q }
  | { type: "cercle"; centre: Pt; r2: Q }
  /** (y − k)² = sens·2p(x − h) si l'axe focal est parallèle à Ox ; (x − h)² = sens·2p(y − k) sinon. */
  | { type: "parabole"; sommet: Pt; axe: Axe; sens: 1 | -1; p: Q };

const X = () => polyVar("x");
const Y = () => polyVar("y");
const decale = (v: Poly, c: Q) => polySub(v, polyConst(c));
const carre = (p: Poly) => polyMul(p, p);

/** Premier membre P de l'équation P = 0 de la conique. */
export function polyConique(c: Conique): Poly {
  switch (c.type) {
    case "cercle":
      return polySub(polyAdd(carre(decale(X(), c.centre.x)), carre(decale(Y(), c.centre.y))), polyConst(c.r2));
    case "ellipse":
    case "hyperbole": {
      const u = carre(decale(c.axe === "x" ? X() : Y(), c.axe === "x" ? c.centre.x : c.centre.y));
      const v = carre(decale(c.axe === "x" ? Y() : X(), c.axe === "x" ? c.centre.y : c.centre.x));
      const signe = c.type === "ellipse" ? Q1 : q(-1);
      return polySub(polyAdd(polyScal(u, qDiv(Q1, c.a2)), polyScal(v, qDiv(signe, c.b2))), polyConst(Q1));
    }
    case "parabole": {
      const h = c.sommet.x;
      const k = c.sommet.y;
      const deuxP = qMul(q(2 * c.sens), c.p);
      return c.axe === "x" ? polySub(carre(decale(Y(), k)), polyScal(decale(X(), h), deuxP)) : polySub(carre(decale(X(), h)), polyScal(decale(Y(), k), deuxP));
    }
  }
}

/** « \dfrac{(x-1)^2}{25} » ; dénominateur 1 : « (x-1)^2 ». */
function fracCarre(lettre: string, centre: Q, den: Q): string {
  const num = latexCarreDecale(lettre, centre);
  if (den.n === 1n && den.d === 1n) return num;
  return `\\dfrac{${num}}{${latexQ(den)}}`;
}

/** Équation réduite en KaTeX, conventions du cours. */
export function latexConique(c: Conique): string {
  switch (c.type) {
    case "cercle":
      return `${latexCarreDecale("x", c.centre.x)}+${latexCarreDecale("y", c.centre.y)}=${latexQ(c.r2)}`;
    case "ellipse":
    case "hyperbole": {
      const [lu, cu, lv, cv] = c.axe === "x" ? ["x", c.centre.x, "y", c.centre.y] : ["y", c.centre.y, "x", c.centre.x];
      return `${fracCarre(lu as string, cu as Q, c.a2)}${c.type === "ellipse" ? "+" : "-"}${fracCarre(lv as string, cv as Q, c.b2)}=1`;
    }
    case "parabole": {
      const [lc, cc, ll, cl] = c.axe === "x" ? ["y", c.sommet.y, "x", c.sommet.x] : ["x", c.sommet.x, "y", c.sommet.y];
      const coef = qMul(q(2 * c.sens), c.p);
      const lin = (cl as Q).n === 0n ? (ll as string) : `(${ll}${(cl as Q).n < 0n ? "+" : "-"}${latexQ(qAbs(cl as Q))})`;
      const coefL = coef.n === 1n && coef.d === 1n ? "" : coef.n === -1n && coef.d === 1n ? "-" : latexQ(coef);
      return `${latexCarreDecale(lc as string, cc as Q)}=${coefL}${lin}`;
    }
  }
}

export const qAbs = (r: Q) => (r.n < 0n ? qNeg(r) : r);

/** c² (distance centre–foyer au carré). */
export function c2Conique(c: Extract<Conique, { type: "ellipse" | "hyperbole" }>): Q {
  return c.type === "ellipse" ? qSub(c.a2, c.b2) : qAdd(c.a2, c.b2);
}

/** Écriture KaTeX de h + s·√R (simplifiée ; R carré parfait → rationnel). */
export function latexCoord(h: Q, s: 1 | -1, R: Q): string {
  if (R.n === 0n) return latexQ(h);
  if (estCarreParfait(R)) return latexQ(qAdd(h, qMul(q(s), racineQ(R))));
  const rac = latexRacine(R);
  if (h.n === 0n) return s < 0 ? `-${rac}` : rac;
  return `${latexQ(h)}${s < 0 ? "-" : "+"}${rac}`;
}

/** √R exact pour un carré parfait rationnel. */
export function racineQ(R: Q): Q {
  return q(BigInt(Math.round(Math.sqrt(Number(R.n)))), BigInt(Math.round(Math.sqrt(Number(R.d)))));
}

export interface PointConique {
  x: number;
  y: number;
  /** « (x ; y) » en KaTeX. */
  latex: string;
}

function pointSurAxe(centre: Pt, axe: Axe, s: 1 | -1, R: Q): PointConique {
  const v = Math.sqrt(qNum(R));
  if (axe === "x") return { x: qNum(centre.x) + s * v, y: qNum(centre.y), latex: `(${latexCoord(centre.x, s, R)}\\,;${latexQ(centre.y)})` };
  return { x: qNum(centre.x), y: qNum(centre.y) + s * v, latex: `(${latexQ(centre.x)}\\,;${latexCoord(centre.y, s, R)})` };
}

/** Foyers (ellipse, hyperbole : deux ; parabole : un). */
export function foyersConique(c: Conique): PointConique[] {
  if (c.type === "cercle") return [];
  if (c.type === "parabole") {
    const d = qMul(q(c.sens), qDiv(c.p, q(2)));
    const F = c.axe === "x" ? { x: qAdd(c.sommet.x, d), y: c.sommet.y } : { x: c.sommet.x, y: qAdd(c.sommet.y, d) };
    return [{ x: qNum(F.x), y: qNum(F.y), latex: `(${latexQ(F.x)}\\,;${latexQ(F.y)})` }];
  }
  const R = c2Conique(c);
  return [pointSurAxe(c.centre, c.axe, 1, R), pointSurAxe(c.centre, c.axe, -1, R)];
}

/** Sommets sur l'axe focal (ellipse : les deux sommets principaux ; hyperbole : les deux sommets). */
export function sommetsFocaux(c: Extract<Conique, { type: "ellipse" | "hyperbole" }>): PointConique[] {
  return [pointSurAxe(c.centre, c.axe, 1, c.a2), pointSurAxe(c.centre, c.axe, -1, c.a2)];
}

/** Sommets sur l'axe non focal (ellipse). */
export function sommetsNonFocaux(c: Extract<Conique, { type: "ellipse" }>): PointConique[] {
  const autre: Axe = c.axe === "x" ? "y" : "x";
  return [pointSurAxe(c.centre, autre, 1, c.b2), pointSurAxe(c.centre, autre, -1, c.b2)];
}

/** Pente positive des asymptotes (b/a si l'axe focal est Ox, a/b sinon) — null si irrationnelle. */
export function penteAsymptote(c: Extract<Conique, { type: "hyperbole" }>): Q | null {
  const r = c.axe === "x" ? qDiv(c.b2, c.a2) : qDiv(c.a2, c.b2);
  return estCarreParfait(r) ? racineQ(r) : null;
}

/** Asymptotes d'une hyperbole (pente rationnelle exigée). */
export function asymptotes(c: Extract<Conique, { type: "hyperbole" }>): Droite[] {
  const m = penteAsymptote(c);
  if (!m) return [];
  // y − k = ±m(x − h) ⇔ ±m x − y + (k ∓ m h) = 0
  return [1, -1].map((s) => {
    const ms = qMul(q(s), m);
    return droiteNormalisee(ms, q(-1), qSub(c.centre.y, qMul(ms, c.centre.x)));
  });
}

/** Directrice(s) : abscisse ou ordonnée (numérique) de chaque directrice, et son axe (droite x = … ou y = …). */
export function directricesNum(c: Conique): { axe: Axe; valeur: number }[] {
  if (c.type === "cercle") return [];
  if (c.type === "parabole") {
    const d = -c.sens * qNum(c.p) / 2;
    return [{ axe: c.axe, valeur: (c.axe === "x" ? qNum(c.sommet.x) : qNum(c.sommet.y)) + d }];
  }
  const cc = Math.sqrt(qNum(c2Conique(c)));
  const dist = qNum(c.a2) / cc;
  const base = c.axe === "x" ? qNum(c.centre.x) : qNum(c.centre.y);
  return [{ axe: c.axe, valeur: base + dist }, { axe: c.axe, valeur: base - dist }];
}

/** Valeur numérique du premier membre normalisé (signe : < 0 « intérieur » pour une ellipse). */
export function valeurConique(c: Conique, x: number, y: number): number {
  switch (c.type) {
    case "cercle":
      return (x - qNum(c.centre.x)) ** 2 + (y - qNum(c.centre.y)) ** 2 - qNum(c.r2);
    case "ellipse":
    case "hyperbole": {
      const [u, v] = c.axe === "x" ? [x - qNum(c.centre.x), y - qNum(c.centre.y)] : [y - qNum(c.centre.y), x - qNum(c.centre.x)];
      return (u * u) / qNum(c.a2) + ((c.type === "ellipse" ? 1 : -1) * v * v) / qNum(c.b2) - 1;
    }
    case "parabole": {
      const [w, v] = c.axe === "x" ? [x - qNum(c.sommet.x), y - qNum(c.sommet.y)] : [y - qNum(c.sommet.y), x - qNum(c.sommet.x)];
      return v * v - 2 * c.sens * qNum(c.p) * w;
    }
  }
}

/** Vrai si le point exact est sur la conique. */
export function surConique(c: Conique, p: Pt): boolean {
  const P = polyConique(c);
  let s = Q0;
  for (const [k, coef] of P) {
    let t = coef;
    if (k !== "") {
      for (const m of k.split(",")) {
        const [v, e] = m.split(":");
        const base = v === "x" ? p.x : p.y;
        for (let i = 0; i < Number(e); i++) t = qMul(t, base);
      }
    }
    s = qAdd(s, t);
  }
  return s.n === 0n;
}

/** Dénominateur commun (ppcm des dénominateurs) d'une liste de rationnels. */
export function ppcmDen(liste: Q[]): bigint {
  const g = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : g(b, a % b));
  return liste.reduce((m, r) => (m * r.d) / g(m, r.d), 1n);
}

/** Plus grand dénominateur et plus grand numérateur (en valeur absolue) — bornes des tirages. */
export function tailleQ(r: Q): number {
  return Math.max(Number(r.d), Math.abs(Number(r.n)));
}
