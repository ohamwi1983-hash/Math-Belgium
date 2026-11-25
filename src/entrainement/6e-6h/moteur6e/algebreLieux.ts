import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";

/**
 * Algèbre EXACTE commune aux quatre générateurs du 6e ch. 9 « Lieux géométriques » (6gen54–6gen57,
 * audit du chapitre, lot B). Remplace les quatre lecteurs d'origine, qui violaient les mêmes règles :
 * tolérance qui grandissait avec le carré des coefficients (6gen54 acceptait le miroir comme rayon
 * réfléchi), « − » typographique illisible (6gen55), « α » refusé et inéquation acceptée (6gen57),
 * triplets comparés dans un ordre fixe (6gen56).
 *
 * - Rationnels exacts (BigInt) et polynômes à plusieurs variables (x, y, α, t, D, E, F, r…).
 * - Lecture d'une saisie (`lireExpression`) : « − – — », « × · * », « ÷ / », puissances « ^ » ou en
 *   exposant (« x² »), multiplication implicite (« 2x », « 3(x − 1) », « xy »), virgule ou point
 *   décimal, « √ » (« √13 », « 2√5 », « √(13) », « rac(13) ») dans les NOMBRES seulement. Une équation
 *   s'écrit avec « = » ; « < », « > », « ≤ », « ≥ » sont refusés (pas une équation).
 * - Comparaison d'équations par PROPORTIONNALITÉ EXACTE des premiers membres (P − Q) : aucune
 *   tolérance, donc aucun « petit triplet absurde » accepté, et tout multiple non nul accepté.
 * Rien n'est imposé pendant la frappe : ce module ne fait que LIRE au moment de la validation.
 */

// ============================================================================
// Rationnels
// ============================================================================

export interface Q {
  n: bigint;
  d: bigint;
}

function pgcdB(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

export function q(n: number | bigint, d: number | bigint = 1): Q {
  let N = typeof n === "bigint" ? n : BigInt(n);
  let D = typeof d === "bigint" ? d : BigInt(d);
  if (D === 0n) throw new Error("dénominateur nul");
  if (D < 0n) {
    N = -N;
    D = -D;
  }
  const g = pgcdB(N, D) || 1n;
  return { n: N / g, d: D / g };
}

export const Q0 = q(0);
export const Q1 = q(1);
export const qAdd = (a: Q, b: Q) => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q) => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a: Q, b: Q) => q(a.n * b.n, a.d * b.d);
export const qNeg = (a: Q) => q(-a.n, a.d);
export function qDiv(a: Q, b: Q): Q {
  if (b.n === 0n) throw new Error("division par zéro");
  return q(a.n * b.d, a.d * b.n);
}
export const qEq = (a: Q, b: Q) => a.n === b.n && a.d === b.d;
export const qNum = (a: Q) => Number(a.n) / Number(a.d);
export const estNul = (a: Q) => a.n === 0n;

/** Rationnel depuis un nombre JS (entier ou fraction de petit dénominateur, ≤ 10 000). */
export function qDepuis(x: number): Q {
  if (Number.isInteger(x)) return q(x);
  for (let d = 2; d <= 10000; d++) {
    const n = Math.round(x * d);
    if (Math.abs(n / d - x) < 1e-12) return q(n, d);
  }
  throw new Error(`qDepuis : ${x} n'est pas un rationnel simple`);
}

// ============================================================================
// Polynômes à plusieurs variables
// ============================================================================

/** Monôme : clé « x:2,y:1 » (variables triées), coefficient rationnel. */
export type Poly = Map<string, Q>;

function cleMonome(exps: Record<string, number>): string {
  return Object.keys(exps)
    .filter((v) => exps[v] > 0)
    .sort()
    .map((v) => `${v}:${exps[v]}`)
    .join(",");
}
function lireCle(cle: string): Record<string, number> {
  const r: Record<string, number> = {};
  if (cle === "") return r;
  for (const morceau of cle.split(",")) {
    const [v, e] = morceau.split(":");
    r[v] = Number(e);
  }
  return r;
}

export function polyConst(c: Q): Poly {
  const p: Poly = new Map();
  if (!estNul(c)) p.set("", c);
  return p;
}
export function polyVar(v: string): Poly {
  return new Map([[cleMonome({ [v]: 1 }), Q1]]);
}
export function polyAdd(a: Poly, b: Poly): Poly {
  const r: Poly = new Map(a);
  for (const [k, c] of b) {
    const s = qAdd(r.get(k) ?? Q0, c);
    if (estNul(s)) r.delete(k);
    else r.set(k, s);
  }
  return r;
}
export function polyScal(a: Poly, c: Q): Poly {
  if (estNul(c)) return new Map();
  const r: Poly = new Map();
  for (const [k, v] of a) r.set(k, qMul(v, c));
  return r;
}
export const polySub = (a: Poly, b: Poly) => polyAdd(a, polyScal(b, q(-1)));
export function polyMul(a: Poly, b: Poly): Poly {
  let r: Poly = new Map();
  for (const [ka, ca] of a) {
    const ea = lireCle(ka);
    for (const [kb, cb] of b) {
      const eb = lireCle(kb);
      const e: Record<string, number> = { ...ea };
      for (const v of Object.keys(eb)) e[v] = (e[v] ?? 0) + eb[v];
      r = polyAdd(r, new Map([[cleMonome(e), qMul(ca, cb)]]));
    }
  }
  return r;
}
export function polyPuissance(a: Poly, n: number): Poly {
  let r = polyConst(Q1);
  for (let i = 0; i < n; i++) r = polyMul(r, a);
  return r;
}
export const polyEstConstant = (a: Poly) => [...a.keys()].every((k) => k === "");
export const polyEstNul = (a: Poly) => a.size === 0;
export function polyConstante(a: Poly): Q {
  return a.get("") ?? Q0;
}
/** Variables présentes. */
export function polyVariables(a: Poly): Set<string> {
  const s = new Set<string>();
  for (const k of a.keys()) for (const v of Object.keys(lireCle(k))) s.add(v);
  return s;
}
/** Degré total. */
export function polyDegre(a: Poly): number {
  let d = 0;
  for (const k of a.keys()) d = Math.max(d, Object.values(lireCle(k)).reduce((s, e) => s + e, 0));
  return d;
}
/** Coefficient d'un monôme décrit par ses exposants. */
export function polyCoef(a: Poly, exps: Record<string, number>): Q {
  return a.get(cleMonome(exps)) ?? Q0;
}
/** Valeur numérique en un point. */
export function polyEval(a: Poly, valeurs: Record<string, number>): number {
  let s = 0;
  for (const [k, c] of a) {
    let t = qNum(c);
    const e = lireCle(k);
    for (const v of Object.keys(e)) t *= Math.pow(valeurs[v] ?? 0, e[v]);
    s += t;
  }
  return s;
}

/** a = λ·b, λ ≠ 0 (exact). */
export function proportionnels(a: Poly, b: Poly): boolean {
  if (polyEstNul(a) || polyEstNul(b) || a.size !== b.size) return false;
  const [k0, c0] = b.entries().next().value as [string, Q];
  const ca = a.get(k0);
  if (!ca) return false;
  const lambda = qDiv(ca, c0);
  for (const [k, c] of b) {
    const v = a.get(k);
    if (!v || !qEq(v, qMul(c, lambda))) return false;
  }
  return true;
}

// ============================================================================
// Lecture d'une saisie
// ============================================================================

type Jeton =
  | { t: "nb"; v: string }
  | { t: "var"; v: string }
  | { t: "op"; v: "+" | "-" | "*" | "/" | "^" | "(" | ")" | "=" }
  | { t: "rac" };

export class ErreurLecture extends Error {
  raison: "illisible" | "inequation" | "racine" | "variable" | "division" | "egal";
  constructor(raison: "illisible" | "inequation" | "racine" | "variable" | "division" | "egal") {
    super(raison);
    this.raison = raison;
  }
}

const EXPOSANTS: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6" };

/** `variables` : noms acceptés (« x », « y », « α », « t », « D »…) ; `alias` : écritures équivalentes. */
function tokeniser(brut: string, variables: readonly string[]): Jeton[] {
  let s = normaliserSigneMoins(brut).replace(/\s+/g, "");
  if (/[<>≤≥⩽⩾]/.test(s)) throw new ErreurLecture("inequation");
  s = s.replace(/alpha/gi, "α").replace(/racine|sqrt|rac/gi, "√").replace(/[×·*]/g, "*").replace(/÷/g, "/").replace(/:/g, "/");
  const jetons: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.,]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.,]/.test(s[j])) j++;
      const nb = s.slice(i, j).replace(",", ".");
      if ((nb.match(/\./g) ?? []).length > 1 || nb === ".") throw new ErreurLecture("illisible");
      jetons.push({ t: "nb", v: nb });
      i = j;
      continue;
    }
    if (EXPOSANTS[c] !== undefined) {
      let j = i;
      let e = "";
      while (j < s.length && EXPOSANTS[s[j]] !== undefined) e += EXPOSANTS[s[j++]];
      jetons.push({ t: "op", v: "^" }, { t: "nb", v: e });
      i = j;
      continue;
    }
    if ("+-*/^()=".includes(c)) {
      jetons.push({ t: "op", v: c as "+" });
      i++;
      continue;
    }
    if (c === "[" || c === "{") {
      jetons.push({ t: "op", v: "(" });
      i++;
      continue;
    }
    if (c === "]" || c === "}") {
      jetons.push({ t: "op", v: ")" });
      i++;
      continue;
    }
    if (c === "√") {
      jetons.push({ t: "rac" });
      i++;
      continue;
    }
    const v = variables.find((n) => n === c) ?? variables.find((n) => n.toLowerCase() === c.toLowerCase());
    if (v) {
      jetons.push({ t: "var", v });
      i++;
      continue;
    }
    if (/[a-zA-Zα-ωΑ-Ω]/.test(c)) throw new ErreurLecture("variable");
    throw new ErreurLecture("illisible");
  }
  return jetons;
}

/** Arbre de lecture. `facteurs` : nombre de facteurs non constants d'un produit (forme factorisée). */
type Noeud =
  | { k: "nb"; v: Q; dec: boolean }
  | { k: "var"; v: string }
  | { k: "rac"; a: Noeud }
  | { k: "neg"; a: Noeud }
  | { k: "add" | "sub" | "mul" | "div"; a: Noeud; b: Noeud }
  | { k: "pow"; a: Noeud; e: number }
  | { k: "par"; a: Noeud };

class Lecteur {
  i = 0;
  private j: Jeton[];
  constructor(j: Jeton[]) {
    this.j = j;
  }
  voir(): Jeton | undefined {
    return this.j[this.i];
  }
  estOp(v: string): boolean {
    const x = this.voir();
    return !!x && x.t === "op" && x.v === v;
  }
  fin(): boolean {
    return this.i >= this.j.length;
  }
  expr(): Noeud {
    let g = this.terme();
    while (this.estOp("+") || this.estOp("-")) {
      const op = (this.j[this.i++] as { v: string }).v;
      const d = this.terme();
      g = { k: op === "+" ? "add" : "sub", a: g, b: d };
    }
    return g;
  }
  debutFacteur(): boolean {
    const x = this.voir();
    return !!x && (x.t === "nb" || x.t === "var" || x.t === "rac" || (x.t === "op" && x.v === "("));
  }
  terme(): Noeud {
    let g = this.unaire();
    for (;;) {
      if (this.estOp("*") || this.estOp("/")) {
        const op = (this.j[this.i++] as { v: string }).v;
        const d = this.unaire();
        g = { k: op === "*" ? "mul" : "div", a: g, b: d };
      } else if (this.debutFacteur()) {
        g = { k: "mul", a: g, b: this.puissance() };
      } else return g;
    }
  }
  unaire(): Noeud {
    if (this.estOp("-")) {
      this.i++;
      return { k: "neg", a: this.unaire() };
    }
    if (this.estOp("+")) {
      this.i++;
      return this.unaire();
    }
    return this.puissance();
  }
  puissance(): Noeud {
    const base = this.atome();
    if (this.estOp("^")) {
      this.i++;
      let paren = false;
      if (this.estOp("(")) {
        paren = true;
        this.i++;
      }
      const x = this.voir();
      if (!x || x.t !== "nb" || x.v.includes(".")) throw new ErreurLecture("illisible");
      this.i++;
      if (paren) {
        if (!this.estOp(")")) throw new ErreurLecture("illisible");
        this.i++;
      }
      const e = Number(x.v);
      if (e > 8) throw new ErreurLecture("illisible");
      return { k: "pow", a: base, e };
    }
    return base;
  }
  atome(): Noeud {
    const x = this.voir();
    if (!x) throw new ErreurLecture("illisible");
    if (x.t === "nb") {
      this.i++;
      const dec = x.v.includes(".");
      const [ent, frac = ""] = x.v.split(".");
      const v = q(BigInt((ent || "0") + frac), 10n ** BigInt(frac.length));
      return { k: "nb", v, dec };
    }
    if (x.t === "var") {
      this.i++;
      return { k: "var", v: x.v };
    }
    if (x.t === "rac") {
      this.i++;
      return { k: "rac", a: this.atome() };
    }
    if (x.t === "op" && x.v === "(") {
      this.i++;
      const e = this.expr();
      if (!this.estOp(")")) throw new ErreurLecture("illisible");
      this.i++;
      return { k: "par", a: e };
    }
    throw new ErreurLecture("illisible");
  }
}

function versPoly(n: Noeud): Poly {
  switch (n.k) {
    case "nb":
      return polyConst(n.v);
    case "var":
      return polyVar(n.v);
    case "rac":
      throw new ErreurLecture("racine");
    case "neg":
      return polyScal(versPoly(n.a), q(-1));
    case "par":
      return versPoly(n.a);
    case "add":
      return polyAdd(versPoly(n.a), versPoly(n.b));
    case "sub":
      return polySub(versPoly(n.a), versPoly(n.b));
    case "mul":
      return polyMul(versPoly(n.a), versPoly(n.b));
    case "div": {
      const d = versPoly(n.b);
      if (!polyEstConstant(d) || polyEstNul(d)) throw new ErreurLecture("division");
      return polyScal(versPoly(n.a), qDiv(Q1, polyConstante(d)));
    }
    case "pow":
      return polyPuissance(versPoly(n.a), n.e);
  }
}

function versNombre(n: Noeud): number {
  switch (n.k) {
    case "nb":
      return qNum(n.v);
    case "var":
      throw new ErreurLecture("variable");
    case "rac": {
      const v = versNombre(n.a);
      if (v < 0) throw new ErreurLecture("illisible");
      return Math.sqrt(v);
    }
    case "neg":
      return -versNombre(n.a);
    case "par":
      return versNombre(n.a);
    case "add":
      return versNombre(n.a) + versNombre(n.b);
    case "sub":
      return versNombre(n.a) - versNombre(n.b);
    case "mul":
      return versNombre(n.a) * versNombre(n.b);
    case "div": {
      const d = versNombre(n.b);
      if (d === 0) throw new ErreurLecture("division");
      return versNombre(n.a) / d;
    }
    case "pow":
      return Math.pow(versNombre(n.a), n.e);
  }
}

function contientDecimal(n: Noeud): boolean {
  switch (n.k) {
    case "nb":
      return n.dec;
    case "var":
      return false;
    case "rac":
    case "neg":
    case "par":
    case "pow":
      return contientDecimal(n.a);
    default:
      return contientDecimal(n.a) || contientDecimal(n.b);
  }
}

/** Nombre de facteurs NON constants d'un produit (« y(2x − 3) » : 2 ; « 2xy − 3y » : 1). */
function facteurs(n: Noeud): number {
  const p = (() => {
    try {
      return versPoly(n);
    } catch {
      return null;
    }
  })();
  if (p && polyEstConstant(p)) return 0;
  switch (n.k) {
    case "neg":
    case "par":
      return facteurs(n.a);
    case "mul":
      return facteurs(n.a) + facteurs(n.b);
    case "div":
      return facteurs(n.a);
    case "pow":
      return facteurs(n.a) * n.e;
    default:
      return 1;
  }
}

function lire(texte: string, variables: readonly string[]): { gauche: Noeud; droite: Noeud | null } {
  const jetons = tokeniser(texte, variables);
  if (jetons.length === 0) throw new ErreurLecture("illisible");
  const l = new Lecteur(jetons);
  const gauche = l.expr();
  let droite: Noeud | null = null;
  if (l.estOp("=")) {
    l.i++;
    droite = l.expr();
  }
  if (!l.fin()) throw new ErreurLecture(l.estOp("=") ? "egal" : "illisible");
  return { gauche, droite };
}

export interface EquationLue {
  /** Premier membre moins second membre. */
  poly: Poly;
  /** Nombre de facteurs non constants quand un membre est nul (forme « produit = 0 »), sinon 1. */
  facteurs: number;
  decimal: boolean;
}

/** Équation « … = … » en polynôme (exact). Lève `ErreurLecture`. */
export function lireEquation(texte: string, variables: readonly string[]): EquationLue {
  const { gauche, droite } = lire(texte, variables);
  if (!droite) throw new ErreurLecture("egal");
  const pg = versPoly(gauche);
  const pd = versPoly(droite);
  const nf = polyEstNul(pd) ? facteurs(gauche) : polyEstNul(pg) ? facteurs(droite) : 1;
  return { poly: polySub(pg, pd), facteurs: nf, decimal: contientDecimal(gauche) || contientDecimal(droite) };
}

/** Expression (sans « = ») en polynôme exact. Lève `ErreurLecture`. */
export function lireExpressionPoly(texte: string, variables: readonly string[]): { poly: Poly; decimal: boolean } {
  const { gauche, droite } = lire(texte, variables);
  if (droite) throw new ErreurLecture("illisible");
  return { poly: versPoly(gauche), decimal: contientDecimal(gauche) };
}

export interface NombreLu {
  valeur: number;
  /** La saisie contient une écriture décimale (« 3,61 »). */
  decimal: boolean;
}

/** Nombre (fractions, racines, décimaux). Lève `ErreurLecture`. */
export function lireNombre(texte: string): NombreLu {
  const { gauche, droite } = lire(texte, []);
  if (droite) throw new ErreurLecture("illisible");
  const valeur = versNombre(gauche);
  if (!Number.isFinite(valeur)) throw new ErreurLecture("illisible");
  return { valeur, decimal: contientDecimal(gauche) };
}

/** Point « (a ; b) » ou « a ; b ». Lève `ErreurLecture`. */
export function lirePoint(texte: string): { x: NombreLu; y: NombreLu } {
  let t = normaliserSigneMoins(texte).trim();
  t = t.replace(/^[A-Za-z]'?\s*=\s*/, "");
  if (t.startsWith("(") && t.endsWith(")")) t = t.slice(1, -1);
  const morceaux = t.split(/[;|]/);
  if (morceaux.length !== 2) throw new ErreurLecture("illisible");
  return { x: lireNombre(morceaux[0]), y: lireNombre(morceaux[1]) };
}

// ============================================================================
// Droites, cercles : constructions exactes et écriture
// ============================================================================

export interface Pt {
  x: Q;
  y: Q;
}
export const pt = (x: number | Q, y: number | Q): Pt => ({ x: typeof x === "number" ? qDepuis(x) : x, y: typeof y === "number" ? qDepuis(y) : y });
export const ptNum = (p: Pt) => ({ x: qNum(p.x), y: qNum(p.y) });
export const ptEq = (a: Pt, b: Pt) => qEq(a.x, b.x) && qEq(a.y, b.y);
export const milieu = (a: Pt, b: Pt): Pt => ({ x: qDiv(qAdd(a.x, b.x), q(2)), y: qDiv(qAdd(a.y, b.y), q(2)) });

/** Droite ax + by + c = 0, coefficients ENTIERS premiers entre eux, premier coefficient non nul > 0. */
export interface Droite {
  a: bigint;
  b: bigint;
  c: bigint;
}

export function droiteNormalisee(a: Q, b: Q, c: Q): Droite {
  if (estNul(a) && estNul(b)) throw new Error("droite dégénérée");
  const ppcm = [a.d, b.d, c.d].reduce((m, d) => (m * d) / pgcdB(m, d), 1n);
  let A = (a.n * ppcm) / a.d;
  let B = (b.n * ppcm) / b.d;
  let C = (c.n * ppcm) / c.d;
  const g = pgcdB(pgcdB(A, B), C) || 1n;
  A /= g;
  B /= g;
  C /= g;
  if (A < 0n || (A === 0n && B < 0n)) {
    A = -A;
    B = -B;
    C = -C;
  }
  return { a: A, b: B, c: C };
}

export function droiteParDeuxPoints(p: Pt, r: Pt): Droite {
  // (y_r − y_p)(x − x_p) − (x_r − x_p)(y − y_p) = 0
  const a = qSub(r.y, p.y);
  const b = qNeg(qSub(r.x, p.x));
  const c = qNeg(qAdd(qMul(a, p.x), qMul(b, p.y)));
  return droiteNormalisee(a, b, c);
}
/** Droite par p, de vecteur normal (a ; b). */
export function droiteNormale(p: Pt, a: Q, b: Q): Droite {
  return droiteNormalisee(a, b, qNeg(qAdd(qMul(a, p.x), qMul(b, p.y))));
}
export const qB = (n: bigint) => q(n);
export function surDroite(p: Pt, d: Droite): boolean {
  return estNul(qAdd(qAdd(qMul(qB(d.a), p.x), qMul(qB(d.b), p.y)), qB(d.c)));
}
export function memeDroite(d: Droite, e: Droite): boolean {
  return d.a === e.a && d.b === e.b && d.c === e.c;
}
export function intersection(d: Droite, e: Droite): Pt | null {
  const det = d.a * e.b - e.a * d.b;
  if (det === 0n) return null;
  return { x: q(d.b * e.c - e.b * d.c, det), y: q(e.a * d.c - d.a * e.c, det) };
}
export function polyDroite(d: Droite): Poly {
  return polyAdd(polyAdd(polyScal(polyVar("x"), qB(d.a)), polyScal(polyVar("y"), qB(d.b))), polyConst(qB(d.c)));
}
/** Médiatrice de [AB]. */
export function mediatrice(a: Pt, b: Pt): Droite {
  return droiteNormale(milieu(a, b), qSub(b.x, a.x), qSub(b.y, a.y));
}
/** Perpendiculaire à d passant par p. */
export function perpendiculaire(d: Droite, p: Pt): Droite {
  return droiteNormale(p, qNeg(qB(d.b)), qB(d.a));
}
/** Parallèle à d passant par p. */
export function parallele(d: Droite, p: Pt): Droite {
  return droiteNormale(p, qB(d.a), qB(d.b));
}
/** Projeté orthogonal de p sur d. */
export function projete(p: Pt, d: Droite): Pt {
  return intersection(d, perpendiculaire(d, p))!;
}
export const dist2 = (a: Pt, b: Pt): Q => qAdd(qMul(qSub(a.x, b.x), qSub(a.x, b.x)), qMul(qSub(a.y, b.y), qSub(a.y, b.y)));
/** Carré de la distance de p à d. */
export function dist2Droite(p: Pt, d: Droite): Q {
  const v = qAdd(qAdd(qMul(qB(d.a), p.x), qMul(qB(d.b), p.y)), qB(d.c));
  return qDiv(qMul(v, v), qB(d.a * d.a + d.b * d.b));
}
/** Cercle (x − x₀)² + (y − y₀)² = R. */
export function polyCercle(c: Pt, r2: Q): Poly {
  const dx = polySub(polyVar("x"), polyConst(c.x));
  const dy = polySub(polyVar("y"), polyConst(c.y));
  return polySub(polyAdd(polyMul(dx, dx), polyMul(dy, dy)), polyConst(r2));
}

// ============================================================================
// Écriture KaTeX
// ============================================================================

export function latexQ(r: Q): string {
  if (r.d === 1n) return r.n.toString();
  const s = r.n < 0n ? "-" : "";
  const n = r.n < 0n ? -r.n : r.n;
  return `${s}\\frac{${n}}{${r.d}}`;
}
export const latexN = (x: number) => latexQ(qDepuis(x));

/** √R simplifié (R rationnel ≥ 0) : « 2\sqrt{5} », « \frac{\sqrt{6}}{2} », « 3 ». */
export function latexRacine(R: Q): string {
  if (R.n < 0n) throw new Error("racine d'un négatif");
  if (R.n === 0n) return "0";
  // √(n/d) = √(n·d)/d
  const N = R.n * R.d;
  let ext = 1n;
  let int = N;
  for (let k = 2n; k * k <= int; k++) {
    while (int % (k * k) === 0n) {
      int /= k * k;
      ext *= k;
    }
  }
  const rad = int === 1n ? "" : `\\sqrt{${int}}`;
  const g = pgcdB(ext, R.d);
  const extR = ext / g;
  const den = R.d / g;
  const haut = int === 1n ? `${extR}` : `${extR === 1n ? "" : extR}${rad}`;
  return den === 1n ? haut : `\\frac{${haut}}{${den}}`;
}
export function estCarreParfait(R: Q): boolean {
  const r = (x: bigint) => {
    if (x < 0n) return false;
    const s = BigInt(Math.round(Math.sqrt(Number(x))));
    return s * s === x;
  };
  return r(R.n) && r(R.d);
}

export const latexPoint = (p: Pt) => `(${latexQ(p.x)}\\,;${latexQ(p.y)})`;

/** Terme « + 3x », « − x », « + \frac{1}{2}y » (premier terme sans « + »). */
function terme(coef: Q, lettre: string, premier: boolean): string {
  if (estNul(coef)) return "";
  const neg = coef.n < 0n;
  const abs = neg ? qNeg(coef) : coef;
  const corps = lettre === "" ? latexQ(abs) : qEq(abs, Q1) ? lettre : `${latexQ(abs)}${lettre}`;
  if (premier) return `${neg ? "-" : ""}${corps}`;
  return `${neg ? "-" : "+"}${corps}`;
}

/** Somme de termes (coef, lettre) ; « 0 » si tout est nul. */
export function latexSomme(termes: [Q, string][]): string {
  let s = "";
  for (const [c, l] of termes) s += terme(c, l, s === "");
  return s === "" ? "0" : s;
}

export function latexDroite(d: Droite): string {
  return `${latexSomme([
    [qB(d.a), "x"],
    [qB(d.b), "y"],
    [qB(d.c), ""],
  ])}=0`;
}
/** « (x − 2)² » / « x² » / « (x + \frac{1}{2})² ». */
export function latexCarreDecale(lettre: string, centre: Q): string {
  if (estNul(centre)) return `${lettre}^2`;
  return `(${lettre}${terme(qNeg(centre), "", false)})^2`;
}
export function latexCercle(c: Pt, r2: Q): string {
  return `${latexCarreDecale("x", c.x)}+${latexCarreDecale("y", c.y)}=${latexQ(r2)}`;
}

/** Polynôme quelconque en KaTeX (ordre : degré décroissant), sans « = 0 ». */
export function latexPoly(p: Poly, ordre: readonly string[] = ["x", "y", "α", "t"]): string {
  const cles = [...p.keys()].sort((a, b) => {
    const ea = lireCle(a);
    const eb = lireCle(b);
    const da = Object.values(ea).reduce((s, e) => s + e, 0);
    const db = Object.values(eb).reduce((s, e) => s + e, 0);
    if (da !== db) return db - da;
    for (const v of ordre) if ((ea[v] ?? 0) !== (eb[v] ?? 0)) return (eb[v] ?? 0) - (ea[v] ?? 0);
    return 0;
  });
  return latexSomme(
    cles.map((k) => {
      const e = lireCle(k);
      const lettres = Object.keys(e)
        .sort((a, b) => ordre.indexOf(a) - ordre.indexOf(b))
        .map((v) => (e[v] === 1 ? v.replace("α", "\\alpha ") : `${v.replace("α", "\\alpha ")}^${e[v]}`))
        .join("");
      return [p.get(k)!, lettres] as [Q, string];
    }),
  ).replace(/\\alpha (?=[^a-zA-Z])/g, "\\alpha ");
}

/** Pgcd et ppcm entiers (tirages). */
export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}
export function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function tirerParmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
export function melanger<T>(t: readonly T[]): T[] {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j], c[i]];
  }
  return c;
}

// ============================================================================
// Aperçu KaTeX d'une saisie (sous le champ, pendant la frappe — n'impose rien)
// ============================================================================

function noeudLatex(n: Noeud): string {
  switch (n.k) {
    case "nb":
      return latexQ(n.v);
    case "var":
      return n.v === "α" ? "\\alpha " : n.v;
    case "rac":
      return `\\sqrt{${n.a.k === "par" ? noeudLatex(n.a.a) : noeudLatex(n.a)}}`;
    case "neg":
      return `-${noeudLatex(n.a)}`;
    case "par":
      return `\\left(${noeudLatex(n.a)}\\right)`;
    case "add":
      return `${noeudLatex(n.a)}+${noeudLatex(n.b)}`;
    case "sub":
      return `${noeudLatex(n.a)}-${noeudLatex(n.b)}`;
    case "mul": {
      const g = noeudLatex(n.a);
      const d = noeudLatex(n.b);
      const chiffres = n.b.k === "nb" || (n.b.k === "pow" && n.b.a.k === "nb");
      return chiffres ? `${g}\\times ${d}` : `${g}${d}`;
    }
    case "div":
      return `\\dfrac{${noeudLatex(n.a.k === "par" ? n.a.a : n.a)}}{${noeudLatex(n.b.k === "par" ? n.b.a : n.b)}}`;
    case "pow":
      return `{${noeudLatex(n.a)}}^{${n.e}}`;
  }
}

/** Aperçu KaTeX d'une saisie (équation, expression, point « (a ; b) ») ; null si illisible. */
export function apercuSaisieLatex(texte: string, variables: readonly string[] = ["x", "y", "α", "t"]): string | null {
  try {
    const t = normaliserSigneMoins(texte).trim();
    if (t.includes(";")) {
      const morceaux = t.replace(/^\(|\)$/g, "").split(";");
      if (morceaux.length !== 2) return null;
      return `\\left(${morceaux.map((m) => noeudLatex(lire(m, []).gauche)).join("\\,;\\,")}\\right)`;
    }
    const { gauche, droite } = lire(t, variables);
    return droite ? `${noeudLatex(gauche)}=${noeudLatex(droite)}` : noeudLatex(gauche);
  } catch {
    return null;
  }
}
