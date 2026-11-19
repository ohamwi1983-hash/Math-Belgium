import { q, racineCarreeLatex } from "../ui/corrigeChapitre3";

/**
 * Algèbre commune aux nouveaux générateurs « transférer / appliquer » du chapitre 2 de 4e
 * (gen115, gen116, gen118, gen119, gen120) : trinômes, ensembles-solutions d'une (in)équation du
 * second degré, comparaison d'ENSEMBLES (forme canonique : intervalles disjoints triés, un point
 * isolé = intervalle fermé réduit à un nombre) et écriture LaTeX de ces ensembles (crochets
 * `\mathopen{]}` / `\mathclose{[}`, point-virgule entre les bornes, « − » typographique via `q`).
 * Aucune dépendance React ni `docx`.
 */

export type Poly2 = [number, number, number];
export type Symbole = "<" | ">" | "≤" | "≥";
export type Relation = Symbole | "=";

export interface Intervalle {
  g: number;
  gFerme: boolean;
  d: number;
  dFerme: boolean;
}

/** Ensemble de réels : intervalles disjoints, triés (forme canonique après `normaliserEnsemble`). */
export type Ensemble = Intervalle[];

const EPS = 1e-9;

export function net(v: number): number {
  return Object.is(v, -0) || Math.abs(v) < 1e-12 ? 0 : v;
}

export function proches(a: number, b: number, tol = 1e-7): boolean {
  if (a === b) return true;
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));
}

export function evaluerPoly([a, b, c]: Poly2, x: number): number {
  return a * x * x + b * x + c;
}

export function discriminant([a, b, c]: Poly2): number {
  return net(b * b - 4 * a * c);
}

/** Racines réelles triées (une seule si Δ = 0) ; degré 1 ou 0 traités aussi. */
export function racines(p: Poly2): number[] {
  const [a, b, c] = p;
  if (net(a) === 0) {
    if (net(b) === 0) return [];
    return [net(-c / b)];
  }
  const d = discriminant(p);
  if (d < -EPS) return [];
  if (Math.abs(d) <= EPS) return [net(-b / (2 * a))];
  const r = Math.sqrt(d);
  const x1 = (-b - r) / (2 * a);
  const x2 = (-b + r) / (2 * a);
  return [net(Math.min(x1, x2)), net(Math.max(x1, x2))];
}

export function satisfait(v: number, s: Relation): boolean {
  const z = Math.abs(v) <= 1e-9 ? 0 : v;
  switch (s) {
    case "<":
      return z < 0;
    case ">":
      return z > 0;
    case "≤":
      return z <= 0;
    case "≥":
      return z >= 0;
    case "=":
      return z === 0;
  }
}

/** Ensemble-solution de `p(x) ◇ 0` (p de degré ≤ 2), par zones entre les racines. */
export function ensembleRelation(p: Poly2, s: Relation): Ensemble {
  const [a, b, c] = p;
  if (net(a) === 0 && net(b) === 0) return satisfait(c, s) ? [{ g: -Infinity, gFerme: false, d: Infinity, dFerme: false }] : [];
  const rs = racines(p);
  const bornes = [-Infinity, ...rs, Infinity];
  const morceaux: Intervalle[] = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const g = bornes[i]!;
    const d = bornes[i + 1]!;
    const milieu = g === -Infinity ? (d === Infinity ? 0 : d - 1) : d === Infinity ? g + 1 : (g + d) / 2;
    if (satisfait(evaluerPoly(p, milieu), s)) morceaux.push({ g, gFerme: false, d, dFerme: false });
  }
  for (const r of rs) if (satisfait(0, s)) morceaux.push({ g: r, gFerme: true, d: r, dFerme: true });
  return normaliserEnsemble(morceaux);
}

/** Forme canonique : intervalles non vides, triés, fusionnés quand ils se touchent. */
export function normaliserEnsemble(e: Ensemble): Ensemble {
  const valides = e
    .map((i) => ({ ...i, gFerme: i.g === -Infinity ? false : i.gFerme, dFerme: i.d === Infinity ? false : i.dFerme }))
    .filter((i) => i.g < i.d - EPS || (proches(i.g, i.d) && i.gFerme && i.dFerme))
    .map((i) => (proches(i.g, i.d) ? { ...i, d: i.g } : i))
    .sort((x, y) => x.g - y.g || (x.gFerme === y.gFerme ? 0 : x.gFerme ? -1 : 1));
  const out: Intervalle[] = [];
  for (const i of valides) {
    const der = out[out.length - 1];
    if (der && (i.g < der.d - EPS || (proches(i.g, der.d) && (i.gFerme || der.dFerme)))) {
      if (i.d > der.d + EPS) out[out.length - 1] = { ...der, d: i.d, dFerme: i.dFerme };
      else if (proches(i.d, der.d)) out[out.length - 1] = { ...der, dFerme: der.dFerme || i.dFerme };
      if (proches(i.g, der.g)) out[out.length - 1] = { ...out[out.length - 1]!, gFerme: der.gFerme || i.gFerme };
    } else out.push({ ...i });
  }
  return out;
}

export function ensemblesEgaux(e1: Ensemble, e2: Ensemble): boolean {
  const a = normaliserEnsemble(e1);
  const b = normaliserEnsemble(e2);
  if (a.length !== b.length) return false;
  return a.every((i, k) => {
    const j = b[k]!;
    return proches(i.g, j.g) && proches(i.d, j.d) && i.gFerme === j.gFerme && i.dFerme === j.dFerme;
  });
}

/** Mêmes bornes finies (crochets mis à part) ? */
export function memesBornes(e1: Ensemble, e2: Ensemble): boolean {
  const bornes = (e: Ensemble) =>
    normaliserEnsemble(e)
      .flatMap((i) => [i.g, i.d])
      .filter((v) => Number.isFinite(v))
      .sort((x, y) => x - y)
      .filter((v, k, t) => k === 0 || !proches(v, t[k - 1]!));
  const a = bornes(e1);
  const b = bornes(e2);
  return a.length === b.length && a.every((v, k) => proches(v, b[k]!));
}

/** Complémentaire dans ℝ. */
export function complementaire(e: Ensemble): Ensemble {
  const n = normaliserEnsemble(e);
  const out: Intervalle[] = [];
  let g = -Infinity;
  let gFerme = false;
  for (const i of n) {
    out.push({ g, gFerme, d: i.g, dFerme: !i.gFerme });
    g = i.d;
    gFerme = !i.dFerme;
  }
  out.push({ g, gFerme, d: Infinity, dFerme: false });
  return normaliserEnsemble(out);
}

/** Ensemble fini de nombres {a ; b ; …}. */
export function ensemblePoints(valeurs: number[]): Ensemble {
  return normaliserEnsemble(valeurs.map((v) => ({ g: v, gFerme: true, d: v, dFerme: true })));
}

/** Les nombres d'un ensemble fini (null si l'ensemble contient un vrai intervalle). */
export function pointsDe(e: Ensemble): number[] | null {
  const n = normaliserEnsemble(e);
  if (n.some((i) => !proches(i.g, i.d))) return null;
  return n.map((i) => i.g);
}

// ---------------------------------------------------------------------------------------------
// Écritures LaTeX
// ---------------------------------------------------------------------------------------------

/** Rationnel de dénominateur ≤ 5040 (à 1e-7 près). */
export function estRationnelSimple(v: number): boolean {
  return Math.abs(v * 5040 - Math.round(v * 5040)) < 1e-6;
}

/** Nombre exact (entier, fraction, radical simple √n) en LaTeX. */
export function nombreLatex(v: number): string {
  const n = net(v);
  if (estRationnelSimple(n)) return q(n);
  // ±√(rationnel)
  if (estRationnelSimple(n * n)) {
    const r = racineCarreeLatex(n * n);
    return n < 0 ? `-${r}` : r;
  }
  return q(n);
}

function borneLatex(v: number): string {
  if (v === -Infinity) return "-\\infty";
  if (v === Infinity) return "+\\infty";
  return nombreLatex(v);
}

function intervalleLatex(i: Intervalle): string {
  const g = i.gFerme ? "[" : "\\mathopen{]}";
  const d = i.dFerme ? "]" : "\\mathclose{[}";
  return `${g}${borneLatex(i.g)}\\,;${borneLatex(i.d)}${d}`;
}

/** `\varnothing`, `\mathbb{R}`, `\{3\}`, `\{-2\,;3\}`, `\mathbb{R}\setminus\{3\}`, unions d'intervalles et de points. */
export function ensembleLatex(e: Ensemble): string {
  const n = normaliserEnsemble(e);
  if (n.length === 0) return "\\varnothing";
  if (n.length === 1 && n[0]!.g === -Infinity && n[0]!.d === Infinity) return "\\mathbb{R}";
  const pts = pointsDe(n);
  if (pts) return `\\{${pts.map(nombreLatex).join("\\,;")}\\}`;
  // ℝ privé de points : ]−∞ ; a[ ∪ ]a ; b[ ∪ … ∪ ]z ; +∞[ dont toutes les bornes finies sont ouvertes.
  const comp = complementaire(n);
  const ptsComp = pointsDe(comp);
  if (ptsComp && ptsComp.length > 0) return `\\mathbb{R}\\setminus\\{${ptsComp.map(nombreLatex).join("\\,;")}\\}`;
  const morceaux: string[] = [];
  const isoles: number[] = [];
  for (const i of n) {
    if (proches(i.g, i.d)) isoles.push(i.g);
    else morceaux.push(intervalleLatex(i));
  }
  if (isoles.length) morceaux.push(`\\{${isoles.map(nombreLatex).join("\\,;")}\\}`);
  return morceaux.join("\\cup ");
}

export function symboleLatex(s: Relation): string {
  return s === "≤" ? "\\leq" : s === "≥" ? "\\geq" : s;
}

/** Symbole retourné (on multiplie par un négatif ou on échange les membres). */
export function symboleInverse(s: Relation): Relation {
  return s === "<" ? ">" : s === ">" ? "<" : s === "≤" ? "≥" : s === "≥" ? "≤" : "=";
}

export function estLarge(s: Relation): boolean {
  return s === "≤" || s === "≥";
}

/** Plus grand commun diviseur (entiers). */
export function pgcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) [a, b] = [b, a % b];
  return a;
}

export function entierAlea(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}

export function melanger<T>(t: readonly T[]): T[] {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}

/** Tirage pondéré : `[[valeur, poids], …]`. */
export function tirerPondere<T>(options: [T, number][]): T {
  const total = options.reduce((s, [, p]) => s + p, 0);
  let r = Math.random() * total;
  for (const [v, p] of options) {
    r -= p;
    if (r < 0) return v;
  }
  return options[options.length - 1]![0];
}
