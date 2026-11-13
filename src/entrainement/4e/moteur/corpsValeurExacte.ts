/**
 * Arithmétique EXACTE de gen76 dans ℚ(√2, √3) : un nombre s'écrit a + b√2 + c√3 + d√6 avec a, b, c,
 * d rationnels. Toutes les valeurs remarquables (sin, cos, tan de 30°, 45°, 60°) y vivent, et ce
 * corps est stable par somme, différence et produit (√2·√3 = √6, √2·√6 = 2√3, √3·√6 = 3√2) : la
 * valeur de l'expression et chaque étape du corrigé sont donc calculées sans aucun flottant, puis
 * écrites en LaTeX sur un dénominateur commun.
 */

export interface Fraction {
  n: number;
  d: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

function ppcm(a: number, b: number): number {
  return (a / pgcd(a, b)) * b;
}

export function frac(n: number, d = 1): Fraction {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { n: n / g || 0, d: d / g };
}

const fAdd = (x: Fraction, y: Fraction) => frac(x.n * y.d + y.n * x.d, x.d * y.d);
const fMul = (x: Fraction, y: Fraction) => frac(x.n * y.n, x.d * y.d);
const fScale = (x: Fraction, k: number) => frac(x.n * k, x.d);

/** [rationnel, coefficient de √2, de √3, de √6]. */
export type NombreExact = [Fraction, Fraction, Fraction, Fraction];

export const RADICANDES = [1, 2, 3, 6] as const;

export function exact(a: Fraction, b: Fraction = frac(0), c: Fraction = frac(0), d: Fraction = frac(0)): NombreExact {
  return [a, b, c, d];
}

export const ZERO: NombreExact = exact(frac(0));
export const UN: NombreExact = exact(frac(1));

export function somme(x: NombreExact, y: NombreExact): NombreExact {
  return x.map((c, i) => fAdd(c, y[i]!)) as NombreExact;
}

export function oppose(x: NombreExact): NombreExact {
  return x.map((c) => fScale(c, -1)) as NombreExact;
}

export function difference(x: NombreExact, y: NombreExact): NombreExact {
  return somme(x, oppose(y));
}

/** Table de multiplication des radicaux : √i·√j = k·√m. */
function produitRadicaux(i: number, j: number): { k: number; indice: number } {
  const p = RADICANDES[i]! * RADICANDES[j]!;
  // p ∈ {1,2,3,6,4,12,18,36,9} : on extrait le plus grand carré.
  for (const carre of [36, 9, 4, 1]) {
    if (p % carre === 0) {
      const reste = p / carre;
      const indice = RADICANDES.indexOf(reste as 1 | 2 | 3 | 6);
      if (indice >= 0) return { k: Math.sqrt(carre), indice };
    }
  }
  throw new Error(`Produit de radicaux hors du corps : ${p}`);
}

export function produit(x: NombreExact, y: NombreExact): NombreExact {
  let r: NombreExact = [...ZERO] as NombreExact;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (x[i]!.n === 0 || y[j]!.n === 0) continue;
      const { k, indice } = produitRadicaux(i, j);
      r = r.map((c, m) => (m === indice ? fAdd(c, fScale(fMul(x[i]!, y[j]!), k)) : c)) as NombreExact;
    }
  }
  return r;
}

export function valeurApprochee(x: NombreExact): number {
  return x.reduce((s, c, i) => s + (c.n / c.d) * Math.sqrt(RADICANDES[i]!), 0);
}

export function estNul(x: NombreExact): boolean {
  return x.every((c) => c.n === 0);
}

export function estRationnel(x: NombreExact): boolean {
  return x[1].n === 0 && x[2].n === 0 && x[3].n === 0;
}

/** Nombre de composantes non nulles (1, √2, √3, √6). */
export function nombreComposantes(x: NombreExact): number {
  return x.filter((c) => c.n !== 0).length;
}

export function denominateurCommun(x: NombreExact): number {
  return x.reduce((d, c) => (c.n === 0 ? d : ppcm(d, c.d)), 1);
}

function monome(coef: number, indice: number): string {
  const rad = RADICANDES[indice]!;
  if (rad === 1) return String(coef);
  return `${coef === 1 ? "" : coef}\\sqrt{${rad}}`;
}

/**
 * Écriture LaTeX réduite, sur un dénominateur commun : « \frac{\sqrt{3}}{2} », « -\frac{1}{2} »,
 * « \frac{2+\sqrt{6}}{4} », « \sqrt{3}-1 », « -\frac{1+\sqrt{3}}{2} »… Un terme positif est
 * toujours placé en tête ; si tous sont négatifs, le signe moins sort de la fraction.
 */
export function exactLatex(x: NombreExact): string {
  if (estNul(x)) return "0";
  const d = denominateurCommun(x);
  const coefs = x.map((c, i) => ({ k: (c.n * d) / c.d, i })).filter((t) => t.k !== 0);
  const tousNegatifs = coefs.every((t) => t.k < 0);
  const termes = (tousNegatifs ? coefs.map((t) => ({ ...t, k: -t.k })) : coefs).sort((a, b) => (a.k > 0 === b.k > 0 ? a.i - b.i : a.k > 0 ? -1 : 1));
  // pgcd du numérateur et du dénominateur : déjà réduit par construction du dénominateur commun,
  // sauf pour plusieurs termes (ex. (2 + 2√3)/4) — on simplifie.
  const g = termes.reduce((acc, t) => pgcd(acc, t.k), d);
  const den = d / g;
  const num = termes
    .map((t, idx) => {
      const k = t.k / g;
      const m = monome(Math.abs(k), t.i);
      return idx === 0 ? (k < 0 ? `-${m}` : m) : `${k < 0 ? " - " : " + "}${m}`;
    })
    .join("");
  const signe = tousNegatifs ? "-" : "";
  if (den === 1) return termes.length > 1 && tousNegatifs ? `-(${num})` : `${signe}${num}`;
  return `${signe}\\frac{${num}}{${den}}`;
}

/** Facteur d'un produit ou base d'un carré : parenthèses si le nombre est négatif ou une somme. */
export function exactLatexFacteur(x: NombreExact): string {
  const l = exactLatex(x);
  if (!(l.startsWith("-") || (nombreComposantes(x) > 1 && denominateurCommun(x) === 1))) return l;
  return l.includes("\\frac") ? `\\left(${l}\\right)` : `(${l})`;
}
