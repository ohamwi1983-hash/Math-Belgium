/**
 * Arithmétique EXACTE des générateurs 5gen50–5gen53 (5e, chapitre 2 « Trigonométrie ») : rationnels,
 * multiples rationnels de π, valeurs exactes de cos / sin / tan aux angles remarquables. Jamais un
 * flottant relu en fraction : tout ce qui est imprimé (écran, papier, corrigé) vient d'ici.
 *
 * Un angle « en π » est représenté par son coefficient rationnel c (l'angle vaut c·π) :
 * c = 5/6 ↔ 5π/6.
 */

export interface Rat {
  n: number;
  d: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function rat(n: number, d = 1): Rat {
  if (d === 0) throw new Error("dénominateur nul");
  if (d < 0) {
    n = -n;
    d = -d;
  }
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}

export const ZERO = rat(0);
export const UN = rat(1);

export const add = (a: Rat, b: Rat): Rat => rat(a.n * b.d + b.n * a.d, a.d * b.d);
export const sub = (a: Rat, b: Rat): Rat => rat(a.n * b.d - b.n * a.d, a.d * b.d);
export const mul = (a: Rat, b: Rat): Rat => rat(a.n * b.n, a.d * b.d);
export const div = (a: Rat, b: Rat): Rat => rat(a.n * b.d, a.d * b.n);
export const neg = (a: Rat): Rat => rat(-a.n, a.d);
export const egal = (a: Rat, b: Rat): boolean => a.n === b.n && a.d === b.d;
export const val = (a: Rat): number => a.n / a.d;
export const estEntier = (a: Rat): boolean => a.d === 1;

/** Plus grand diviseur commun de deux rationnels (pas de grille commun) : pgcd(a, b) au sens de ℚ. */
export function pgcdRat(a: Rat, b: Rat): Rat {
  if (a.n === 0) return rat(Math.abs(b.n), b.d);
  if (b.n === 0) return rat(Math.abs(a.n), a.d);
  const d = (a.d * b.d) / pgcd(a.d, b.d);
  return rat(pgcd((a.n * d) / a.d, (b.n * d) / b.d), d);
}

/** Entier (ou décimal) en LaTeX : « − » par le moins de LaTeX, virgule décimale `{,}`. */
export function nombreLatex(x: number): string {
  const r = Math.round(x * 1e6) / 1e6;
  const s = String(Math.abs(r)).replace(".", "{,}");
  return r < 0 ? `-${s}` : s;
}

/** Rationnel en LaTeX : « 2 », « -3 », « \dfrac{3}{4} », « -\dfrac{1}{2} ». */
export function ratLatex(a: Rat, frac = "\\dfrac"): string {
  if (a.d === 1) return String(a.n);
  return `${a.n < 0 ? "-" : ""}${frac}{${Math.abs(a.n)}}{${a.d}}`;
}

/** Rationnel en texte Unicode (étiquettes SVG) : « −3/4 », « 2 », « 0,5 » jamais. */
export function ratTexte(a: Rat): string {
  const s = a.d === 1 ? String(Math.abs(a.n)) : `${Math.abs(a.n)}/${a.d}`;
  return a.n < 0 ? `−${s}` : s;
}

/** Multiple de π en LaTeX : « 0 », « \pi », « -\pi », « 2\pi », « \dfrac{\pi}{6} », « -\dfrac{5\pi}{6} ». */
export function piLatex(c: Rat, frac = "\\dfrac"): string {
  if (c.n === 0) return "0";
  const s = c.n < 0 ? "-" : "";
  const a = Math.abs(c.n);
  const num = a === 1 ? "\\pi" : `${a}\\pi`;
  return c.d === 1 ? `${s}${num}` : `${s}${frac}{${num}}{${c.d}}`;
}

/** Rationnel écrit « en ligne » dans un dénominateur : « 2 », « 1/2 » (jamais une fraction empilée). */
export function omegaEnLigne(a: Rat): string {
  return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
}

/** « A = B = C » sans deux membres consécutifs identiques (« \dfrac{\pi}{2} = \dfrac{\pi}{2} »). */
export function chaineEgalites(...membres: string[]): string {
  return membres.filter((m, i) => i === 0 || m.replace(/\s/g, "") !== membres[i - 1]!.replace(/\s/g, "")).join(" = ");
}

/** Multiple de π en texte Unicode (étiquettes de graphique) : « π/6 », « −3π/4 », « 2π », « 0 ». */
export function piTexte(c: Rat): string {
  if (c.n === 0) return "0";
  const a = Math.abs(c.n);
  const s = `${a === 1 ? "" : a}π${c.d === 1 ? "" : `/${c.d}`}`;
  return c.n < 0 ? `−${s}` : s;
}

/** Ramène c (angle c·π) dans [0 ; 2[, c'est-à-dire l'angle dans [0 ; 2π[. */
export function reduire02(c: Rat): Rat {
  const deux = 2 * c.d;
  return rat((((c.n % deux) + deux) % deux), c.d);
}

/** Ramène c dans ]−1 ; 1], c'est-à-dire l'angle dans ]−π ; π]. */
export function reduirePiPi(c: Rat): Rat {
  const r = reduire02(c);
  return val(r) > 1 ? sub(r, rat(2)) : r;
}

/** Nombre de tours (entier k) tel que c = réduit + 2k. */
export function toursRetires(c: Rat): number {
  return Math.round((val(c) - val(reduire02(c))) / 2);
}

// ---------------------------------------------------------------------------------------------
// Valeurs exactes de cos, sin, tan aux angles remarquables (multiples de π/6 et de π/4)
// ---------------------------------------------------------------------------------------------

export interface ValeurExacte {
  latex: string;
  valeur: number;
}

const VALEURS_ABSOLUES: { v: number; latex: string }[] = [
  { v: 0, latex: "0" },
  { v: 0.5, latex: "\\dfrac{1}{2}" },
  { v: Math.SQRT2 / 2, latex: "\\dfrac{\\sqrt{2}}{2}" },
  { v: Math.sqrt(3) / 2, latex: "\\dfrac{\\sqrt{3}}{2}" },
  { v: 1, latex: "1" },
  { v: Math.sqrt(3) / 3, latex: "\\dfrac{\\sqrt{3}}{3}" },
  { v: Math.sqrt(3), latex: "\\sqrt{3}" },
];

/** Valeur numérique → écriture exacte remarquable (`null` si ce n'en est pas une). */
export function exactDepuisValeur(v: number): ValeurExacte | null {
  const a = Math.abs(v);
  const trouve = VALEURS_ABSOLUES.find((x) => Math.abs(x.v - a) < 1e-9);
  if (!trouve) return null;
  if (trouve.v === 0) return { latex: "0", valeur: 0 };
  return { latex: v < 0 ? `-${trouve.latex}` : trouve.latex, valeur: v < 0 ? -trouve.v : trouve.v };
}

/** Angle remarquable (multiple de π/4 ou de π/6) ? */
export function estRemarquable(c: Rat): boolean {
  return 12 % c.d === 0 || 4 % c.d === 0;
}

function propre(v: number): number {
  return Math.abs(v) < 1e-12 ? 0 : v;
}

export function cosExact(c: Rat): ValeurExacte {
  const r = exactDepuisValeur(propre(Math.cos(val(c) * Math.PI)));
  if (!r) throw new Error(`cos non remarquable : ${c.n}/${c.d}`);
  return r;
}

export function sinExact(c: Rat): ValeurExacte {
  const r = exactDepuisValeur(propre(Math.sin(val(c) * Math.PI)));
  if (!r) throw new Error(`sin non remarquable : ${c.n}/${c.d}`);
  return r;
}

/** `null` : tangente non définie (cos = 0). */
export function tanExact(c: Rat): ValeurExacte | null {
  const co = cosExact(c);
  if (co.valeur === 0) return null;
  const r = exactDepuisValeur(propre(sinExact(c).valeur / co.valeur));
  if (!r) throw new Error(`tan non remarquable : ${c.n}/${c.d}`);
  return r;
}

/** Valeur exacte « m » d'un second membre remarquable, tirée de son écriture. */
export const SECONDS_MEMBRES: ValeurExacte[] = [
  { latex: "\\dfrac{1}{2}", valeur: 0.5 },
  { latex: "\\dfrac{\\sqrt{2}}{2}", valeur: Math.SQRT2 / 2 },
  { latex: "\\dfrac{\\sqrt{3}}{2}", valeur: Math.sqrt(3) / 2 },
  { latex: "-\\dfrac{1}{2}", valeur: -0.5 },
  { latex: "-\\dfrac{\\sqrt{2}}{2}", valeur: -Math.SQRT2 / 2 },
  { latex: "-\\dfrac{\\sqrt{3}}{2}", valeur: -Math.sqrt(3) / 2 },
];

/** arcsin d'une valeur remarquable, dans [−π/2 ; π/2], en coefficient de π. */
export function arcsinPi(v: number): Rat {
  const candidats = [rat(-1, 2), rat(-1, 3), rat(-1, 4), rat(-1, 6), ZERO, rat(1, 6), rat(1, 4), rat(1, 3), rat(1, 2)];
  const r = candidats.find((c) => Math.abs(Math.sin(val(c) * Math.PI) - v) < 1e-9);
  if (!r) throw new Error(`arcsin non remarquable : ${v}`);
  return r;
}

/** arccos d'une valeur remarquable, dans [0 ; π]. */
export function arccosPi(v: number): Rat {
  const candidats = [ZERO, rat(1, 6), rat(1, 4), rat(1, 3), rat(1, 2), rat(2, 3), rat(3, 4), rat(5, 6), UN];
  const r = candidats.find((c) => Math.abs(Math.cos(val(c) * Math.PI) - v) < 1e-9);
  if (!r) throw new Error(`arccos non remarquable : ${v}`);
  return r;
}

/** arctan d'une valeur remarquable, dans ]−π/2 ; π/2[. */
export function arctanPi(v: number): Rat {
  const candidats = [rat(-1, 3), rat(-1, 4), rat(-1, 6), ZERO, rat(1, 6), rat(1, 4), rat(1, 3)];
  const r = candidats.find((c) => Math.abs(Math.tan(val(c) * Math.PI) - v) < 1e-9);
  if (!r) throw new Error(`arctan non remarquable : ${v}`);
  return r;
}

/** Valeurs v + k·p (coefficients de π) de [0 ; 2[ (angles de [0 ; 2π[), triées. */
export function valeursDans02(v: Rat, p: Rat): Rat[] {
  const res: Rat[] = [];
  const pv = val(p);
  let k = Math.ceil((0 - val(v)) / pv - 1e-9);
  for (; ; k++) {
    const x = add(v, mul(rat(k), p));
    if (val(x) >= 2 - 1e-12) break;
    if (val(x) >= -1e-12) res.push(x);
  }
  return res;
}

/** Union triée sans doublon de listes de coefficients. */
export function unionTriee(...listes: Rat[][]): Rat[] {
  const tout: Rat[] = [];
  for (const l of listes) for (const x of l) if (!tout.some((y) => egal(x, y))) tout.push(x);
  return tout.sort((a, b) => val(a) - val(b));
}

/** Liste d'angles en LaTeX : « \left\{\dfrac{\pi}{6}\,;\,\dfrac{5\pi}{6}\right\} ». */
export function ensembleLatex(angles: Rat[]): string {
  if (angles.length === 0) return "\\varnothing";
  return `\\left\\{${angles.map((a) => piLatex(a)).join("\\,;\\,")}\\right\\}`;
}

export function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

export function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}
