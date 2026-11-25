/**
 * Calculs de statistique à deux variables des générateurs du lot H2 du 5e ch. 6 (5gen78 « modéliser et
 * prévoir », 5gen79 « meilleur ajustement », 5gen81 « détective d'erreurs ») — notations du cours :
 * moyennes x̄, ȳ ; écart-type σ (division par n, comme en 4e) ; Cov(x, y) ; droite des moindres
 * carrés y = ax + b (a = Cov / V(x), b = ȳ − a x̄) ; r = Cov / (σx σy) ; droite de Mayer (données
 * triées selon x, deux groupes d'effectifs égaux à une unité près, le PREMIER groupe a le plus petit
 * effectif quand n est impair, comme dans le cours). Fonctions pures, testables seules.
 */

export interface Point2 {
  x: number;
  y: number;
}

export const somme = (t: readonly number[]): number => t.reduce((s, v) => s + v, 0);
export const moyenne = (t: readonly number[]): number => somme(t) / t.length;

/** Variance (division par n). */
export function variance(t: readonly number[]): number {
  const m = moyenne(t);
  return somme(t.map((v) => (v - m) ** 2)) / t.length;
}
export const ecartType = (t: readonly number[]): number => Math.sqrt(variance(t));
/** Écart-type « Sx » de la calculatrice (division par n − 1) : piège du cours. */
export const ecartTypeEchantillon = (t: readonly number[]): number => Math.sqrt((variance(t) * t.length) / (t.length - 1));

export function covariance(p: readonly Point2[]): number {
  const mx = moyenne(p.map((q) => q.x));
  const my = moyenne(p.map((q) => q.y));
  return somme(p.map((q) => (q.x - mx) * (q.y - my))) / p.length;
}

export interface Droite {
  a: number;
  b: number;
}

export interface Resume2 {
  n: number;
  mx: number;
  my: number;
  sx: number;
  sy: number;
  cov: number;
  a: number;
  b: number;
  r: number;
}

export function resume(p: readonly Point2[]): Resume2 {
  const xs = p.map((q) => q.x);
  const ys = p.map((q) => q.y);
  const mx = moyenne(xs);
  const my = moyenne(ys);
  const sx = ecartType(xs);
  const sy = ecartType(ys);
  const cov = covariance(p);
  const a = cov / (sx * sx);
  return { n: p.length, mx, my, sx, sy, cov, a, b: my - a * mx, r: cov / (sx * sy) };
}

/** Droite des moindres carrés (régression de y en x). */
export function moindresCarres(p: readonly Point2[]): Droite {
  const r = resume(p);
  return { a: r.a, b: r.b };
}

/** Régression de x en y (listes échangées sur la calculatrice : piège). */
export function regressionXenY(p: readonly Point2[]): Droite {
  return moindresCarres(p.map((q) => ({ x: q.y, y: q.x })));
}

export const valeurDroite = (d: Droite, x: number): number => d.a * x + d.b;

/** Somme des carrés des écarts verticaux. */
export function sommeCarres(p: readonly Point2[], d: Droite): number {
  return somme(p.map((q) => (q.y - valeurDroite(d, q.x)) ** 2));
}

export interface Mayer {
  groupe1: Point2[];
  groupe2: Point2[];
  g1: Point2;
  g2: Point2;
  droite: Droite;
}

const pointMoyen = (p: readonly Point2[]): Point2 => ({ x: moyenne(p.map((q) => q.x)), y: moyenne(p.map((q) => q.y)) });

/** Droite de Mayer des points PRIS DANS L'ORDRE donné (`trier` : on trie d'abord selon x). */
export function mayer(p: readonly Point2[], trier = true): Mayer {
  const t = trier ? [...p].sort((u, v) => u.x - v.x) : [...p];
  const k = Math.floor(t.length / 2);
  const groupe1 = t.slice(0, k);
  const groupe2 = t.slice(k);
  const g1 = pointMoyen(groupe1);
  const g2 = pointMoyen(groupe2);
  const a = (g2.y - g1.y) / (g2.x - g1.x);
  return { groupe1, groupe2, g1, g2, droite: { a, b: g1.y - a * g1.x } };
}

/** Arrondi à `d` décimales. */
export const arrondi = (x: number, d: number): number => {
  const f = 10 ** d;
  return Math.round(x * f + (x >= 0 ? 1e-9 : -1e-9)) / f;
};

/** Un nombre s'écrit-il avec au plus `d` décimales ? */
export const decimalesAuPlus = (x: number, d: number): boolean => Math.abs(x * 10 ** d - Math.round(x * 10 ** d)) < 1e-6;

/** Médiane (séries triées ou non). */
export function mediane(t: readonly number[]): number {
  const s = [...t].sort((u, v) => u - v);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2]! : (s[n / 2 - 1]! + s[n / 2]!) / 2;
}

/* ----------------------------------------------------------------------------------------------
 * Tirages
 * -------------------------------------------------------------------------------------------- */

export function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
export const entier = (a: number, b: number): number => a + Math.floor(Math.random() * (b - a + 1));
export function melanger<T>(t: readonly T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}
/** Bruit gaussien (Box–Muller). */
export function gauss(): number {
  let u = 0;
  while (u === 0) u = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
}
