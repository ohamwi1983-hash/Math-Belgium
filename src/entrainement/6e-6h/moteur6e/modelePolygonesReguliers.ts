import type { ExerciceMesures, ExercicePolygones, ExerciceSommeNulle, ExerciceSommets, PointEntier } from "../core6e/polygonesReguliers.types";

/**
 * Couche B (6e) — modèle EXACT de `6gen97` « Polygones réguliers et racines n-ièmes » : nombres de
 * la forme p + q√d (p, q rationnels, d sans facteur carré), sommets zₖ = c + (a − c)·e^{2ikπ/n},
 * mesures du polygone inscrit. Source unique des valeurs de l'écran, du corrigé et de l'adaptateur
 * d'export (la vérification compare des flottants à 1e-9 près, l'affichage utilise la forme exacte).
 * N'importe rien de `generateurs6e/`.
 */

// ---------------------------------------------------------------------------------------------
// Fractions et nombres p + q√d.
// ---------------------------------------------------------------------------------------------

export interface Fraction {
  num: number;
  den: number;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function frac(num: number, den = 1): Fraction {
  if (den < 0) {
    num = -num;
    den = -den;
  }
  const g = pgcd(num, den);
  const n = num / g;
  return { num: n === 0 ? 0 : n, den: num === 0 ? 1 : den / g };
}

function plusF(a: Fraction, b: Fraction): Fraction {
  return frac(a.num * b.den + b.num * a.den, a.den * b.den);
}

function foisF(a: Fraction, b: Fraction): Fraction {
  return frac(a.num * b.num, a.den * b.den);
}

/** p + q√d. */
export interface Radical {
  p: Fraction;
  q: Fraction;
  d: number;
}

export function entier(v: number): Radical {
  return { p: frac(v), q: frac(0), d: 1 };
}

function normaliserR(r: Radical): Radical {
  if (r.d === 1 || r.q.num === 0) return { p: r.d === 1 ? plusF(r.p, r.q) : r.p, q: frac(0), d: 1 };
  return r;
}

export function plusR(a: Radical, b: Radical): Radical {
  const ra = normaliserR(a);
  const rb = normaliserR(b);
  if (ra.q.num !== 0 && rb.q.num !== 0 && ra.d !== rb.d) throw new Error("plusR : radicaux différents");
  const d = ra.q.num !== 0 ? ra.d : rb.d;
  return normaliserR({ p: plusF(ra.p, rb.p), q: plusF(ra.q, rb.q), d });
}

export function foisEntierR(k: number | Fraction, a: Radical): Radical {
  const f = typeof k === "number" ? frac(k) : k;
  return normaliserR({ p: foisF(f, a.p), q: foisF(f, a.q), d: a.d });
}

export function valeurR(r: Radical): number {
  return r.p.num / r.p.den + (r.q.num / r.q.den) * Math.sqrt(r.d);
}

/** √N simplifié : k√m (m sans facteur carré). */
export function racineSimplifiee(N: number): Radical {
  let k = 1;
  let m = N;
  for (let f = 2; f * f <= m; f++) {
    while (m % (f * f) === 0) {
      m /= f * f;
      k *= f;
    }
  }
  return m === 1 ? entier(k) : { p: frac(0), q: frac(k), d: m };
}

function fracLatex(f: Fraction, signeDevant: boolean): string {
  const s = f.num < 0 ? "-" : signeDevant ? "+" : "";
  const n = Math.abs(f.num);
  return f.den === 1 ? `${s}${n}` : `${s}\\frac{${n}}{${f.den}}`;
}

function termeRadicalLatex(q: Fraction, d: number, signeDevant: boolean): string {
  const s = q.num < 0 ? "-" : signeDevant ? "+" : "";
  const n = Math.abs(q.num);
  const coef = n === 1 ? "" : `${n}`;
  const rac = `${coef}\\sqrt{${d}}`;
  return q.den === 1 ? `${s}${rac}` : `${s}\\frac{${rac}}{${q.den}}`;
}

/** « 1+\sqrt{3} », « -\frac{\sqrt{2}}{2} », « \frac{3\sqrt{3}}{4} », « 0 ». */
export function radicalLatex(r0: Radical): string {
  const r = normaliserR(r0);
  if (r.q.num === 0) return fracLatex(r.p, false);
  if (r.p.num === 0) return termeRadicalLatex(r.q, r.d, false);
  return `${fracLatex(r.p, false)}${termeRadicalLatex(r.q, r.d, true)}`;
}

/** Parenthèses autour d'un nombre négatif ou d'une somme (pour un produit écrit en ligne). */
export function radicalLatexParenthese(r0: Radical): string {
  const r = normaliserR(r0);
  const simple = r.q.num === 0 ? r.p.num >= 0 : r.p.num === 0 && r.q.num > 0;
  const tx = radicalLatex(r);
  return simple ? tx : `\\left(${tx}\\right)`;
}

// ---------------------------------------------------------------------------------------------
// Nombres complexes exacts.
// ---------------------------------------------------------------------------------------------

export interface ComplexeExact {
  re: Radical;
  im: Radical;
}

/** a + bi à coordonnées entières : « 3-2i », « -i », « 4 », « 2i », « 0 ». */
export function affixeLatex(p: PointEntier): string {
  const coefI = (v: number) => (v === 1 ? "i" : v === -1 ? "-i" : `${v}i`);
  if (p.y === 0) return `${p.x}`;
  if (p.x === 0) return coefI(p.y);
  return `${p.x}${p.y > 0 ? "+" : "-"}${Math.abs(p.y) === 1 ? "" : Math.abs(p.y)}i`;
}

/** Complexe exact en LaTeX (forme algébrique) : « 1+\sqrt{3}+\left(2-\sqrt{3}\right)i ». */
export function complexeExactLatex(z: ComplexeExact): string {
  const re = normaliserR(z.re);
  const im = normaliserR(z.im);
  const reNul = re.p.num === 0 && re.q.num === 0;
  const imNul = im.p.num === 0 && im.q.num === 0;
  if (imNul) return radicalLatex(re);
  let partieIm: string;
  let negatif = false;
  if (im.q.num === 0) {
    const v = im.p;
    negatif = v.num < 0;
    const abs = frac(Math.abs(v.num), v.den);
    partieIm = abs.den === 1 ? (abs.num === 1 ? "i" : `${abs.num}i`) : `${fracLatex(abs, false)}\\,i`;
  } else if (im.p.num === 0) {
    negatif = im.q.num < 0;
    partieIm = `${termeRadicalLatex(frac(Math.abs(im.q.num), im.q.den), im.d, false)}\\,i`;
  } else {
    partieIm = `\\left(${radicalLatex(im)}\\right)i`;
  }
  if (reNul) return `${negatif ? "-" : ""}${partieIm}`;
  return `${radicalLatex(re)}${negatif ? "-" : "+"}${partieIm}`;
}

export function pointVersExact(p: PointEntier): ComplexeExact {
  return { re: entier(p.x), im: entier(p.y) };
}

// ---------------------------------------------------------------------------------------------
// cos et sin exacts des multiples de 45° et 30° (angles en degrés entiers).
// ---------------------------------------------------------------------------------------------

const RAC2_2: Radical = { p: frac(0), q: frac(1, 2), d: 2 };
const RAC3_2: Radical = { p: frac(0), q: frac(1, 2), d: 3 };

/** (cos, sin) exacts d'un angle multiple de 30° ou de 45° (degrés). */
export function cosSinExacts(degres: number): { cos: Radical; sin: Radical } {
  const a = ((degres % 360) + 360) % 360;
  const demi: Radical = { p: frac(1, 2), q: frac(0), d: 1 };
  const base: Record<number, [Radical, Radical]> = {
    0: [entier(1), entier(0)],
    30: [RAC3_2, demi],
    45: [RAC2_2, RAC2_2],
    60: [demi, RAC3_2],
  };
  const quadrant = Math.floor(a / 90);
  const reste = a - 90 * quadrant;
  if (!base[reste]) throw new Error(`cosSinExacts : angle non remarquable ${degres}`);
  const [c0, s0] = base[reste];
  // Rotation d'un quart de tour par quadrant : (cos, sin) → (−sin, cos).
  let cos = c0;
  let sin = s0;
  for (let k = 0; k < quadrant; k++) [cos, sin] = [foisEntierR(-1, sin), cos];
  return { cos: normaliserR(cos), sin: normaliserR(sin) };
}

/** Angle 2π/n en LaTeX, simplifié : « \frac{2\pi}{3} », « \frac{\pi}{2} », « \frac{\pi}{3} », « \frac{\pi}{4} ». */
export function angleSurLatex(numerateurPi: number, n: number): string {
  const g = pgcd(numerateurPi, n);
  const num = numerateurPi / g;
  const den = n / g;
  const tete = num === 1 ? "\\pi" : num === -1 ? "-\\pi" : `${num}\\pi`;
  return den === 1 ? tete : `\\frac{${tete}}{${den}}`;
}

/** Angle de la rotation qui envoie un sommet sur le suivant, en LaTeX simplifié (2π/n). */
export function anglePasLatex(n: number): string {
  return angleSurLatex(2, n);
}

// ---------------------------------------------------------------------------------------------
// Variante « sommets ».
// ---------------------------------------------------------------------------------------------

export function vecteurCA(e: ExerciceSommets | ExerciceSommeNulle): PointEntier {
  return { x: e.a.x - e.c.x, y: e.a.y - e.c.y };
}

export function centreEnO(e: ExerciceSommets): boolean {
  return e.c.x === 0 && e.c.y === 0;
}

/** Indices des sommets demandés : Z₁ à l'écran 3, puis Z₂ (et Z₃ si n ≥ 4) à l'écran 4. */
export function sommetsAutres(e: ExerciceSommets): number[] {
  return e.n === 3 ? [2] : [2, 3];
}

export function sommetsDemandes(e: ExerciceSommets): number[] {
  return [1, ...sommetsAutres(e)];
}

/** (cos, sin) exacts de l'angle 2kπ/n (k entier, éventuellement négatif). */
export function cosSinPas(n: number, k: number): { cos: Radical; sin: Radical } {
  return cosSinExacts((360 * k) / n);
}

/** Produit exact (p + qi)·(cos + i sin) pour un vecteur entier. */
export function tournerExact(v: PointEntier, cos: Radical, sin: Radical): ComplexeExact {
  return {
    re: plusR(foisEntierR(v.x, cos), foisEntierR(-v.y, sin)),
    im: plusR(foisEntierR(v.x, sin), foisEntierR(v.y, cos)),
  };
}

export function translaterExact(z: ComplexeExact, c: PointEntier): ComplexeExact {
  return { re: plusR(z.re, entier(c.x)), im: plusR(z.im, entier(c.y)) };
}

/** zₖ = c + (a − c)·e^{2ikπ/n} (exact). */
export function sommetExact(e: ExerciceSommets | ExerciceSommeNulle, k: number): ComplexeExact {
  const { cos, sin } = cosSinPas(e.n, k);
  return translaterExact(tournerExact(vecteurCA(e), cos, sin), e.c);
}

export function valeurComplexe(z: ComplexeExact): { re: number; im: number } {
  return { re: valeurR(z.re), im: valeurR(z.im) };
}

/** Sommet zₖ en flottants (figures). */
export function sommetFlottant(e: ExercicePolygones, k: number): { x: number; y: number } {
  const n = e.n;
  const t = (2 * Math.PI * k) / n;
  if (e.variante === "mesures") {
    return { x: e.a.x * Math.cos(t) - e.a.y * Math.sin(t), y: e.a.x * Math.sin(t) + e.a.y * Math.cos(t) };
  }
  const v = vecteurCA(e);
  return { x: e.c.x + v.x * Math.cos(t) - v.y * Math.sin(t), y: e.c.y + v.x * Math.sin(t) + v.y * Math.cos(t) };
}

/** Valeurs-pièges d'un sommet (flottants), dans l'ordre de priorité du diagnostic. */
export function piegesSommet(e: ExerciceSommets, k: number): { id: string; re: number; im: number }[] {
  const t = (2 * Math.PI * k) / e.n;
  const v = vecteurCA(e);
  const rot = (p: PointEntier, angle: number) => ({ re: p.x * Math.cos(angle) - p.y * Math.sin(angle), im: p.x * Math.sin(angle) + p.y * Math.cos(angle) });
  const pieges: { id: string; re: number; im: number }[] = [];
  if (!centreEnO(e)) {
    pieges.push({ id: "rotationO", ...rot(e.a, t) });
    pieges.push({ id: "oubliTranslation", ...rot(v, t) });
  }
  const horaire = rot(v, -t);
  pieges.push({ id: "sensHoraire", re: e.c.x + horaire.re, im: e.c.y + horaire.im });
  const juste = valeurComplexe(sommetExact(e, k));
  pieges.push({ id: "echange", re: juste.im, im: juste.re });
  return pieges;
}

// ---------------------------------------------------------------------------------------------
// Variante « mesures ».
// ---------------------------------------------------------------------------------------------

export function rayonCarre(e: ExerciceMesures): number {
  return e.a.x * e.a.x + e.a.y * e.a.y;
}

export function rayonExact(e: ExerciceMesures): Radical {
  return racineSimplifiee(rayonCarre(e));
}

/** ℓ = 2r·sin(π/n) : r√3 (n = 3), r√2 (n = 4), r (n = 6). */
export function coteExact(e: ExerciceMesures): Radical {
  const facteur: Record<number, number> = { 3: 3, 4: 2, 6: 1 };
  return racineSimplifiee(rayonCarre(e) * facteur[e.n]);
}

export function perimetreExact(e: ExerciceMesures): Radical {
  return foisEntierR(e.n, coteExact(e));
}

/** 𝒜 = n·½·r²·sin(2π/n) : 3√3·R/4 (n = 3), 2R (n = 4), 3√3·R/2 (n = 6), R = r². */
export function aireExacte(e: ExerciceMesures): Radical {
  const R = rayonCarre(e);
  if (e.n === 4) return entier(2 * R);
  const coef = e.n === 3 ? frac(3 * R, 4) : frac(3 * R, 2);
  return { p: frac(0), q: coef, d: 3 };
}

export function valeurRayon(e: ExerciceMesures): number {
  return Math.sqrt(rayonCarre(e));
}

/** sin(π/n) et sin(2π/n) exacts (LaTeX) pour n = 3, 4, 6. */
export const SIN_PI_SUR_N: Record<number, string> = { 3: "\\frac{\\sqrt{3}}{2}", 4: "\\frac{\\sqrt{2}}{2}", 6: "\\frac{1}{2}" };
export const SIN_2PI_SUR_N: Record<number, string> = { 3: "\\frac{\\sqrt{3}}{2}", 4: "1", 6: "\\frac{\\sqrt{3}}{2}" };

// ---------------------------------------------------------------------------------------------
// Variante « somme-nulle ».
// ---------------------------------------------------------------------------------------------

export function sommeSommets(e: ExerciceSommeNulle): PointEntier {
  return { x: e.n * e.c.x, y: e.n * e.c.y };
}

export function sommeSansA(e: ExerciceSommeNulle): PointEntier {
  return { x: e.n * e.c.x - e.a.x, y: e.n * e.c.y - e.a.y };
}

export const NOMS_POLYGONES: Record<number, string> = {
  3: "triangle équilatéral",
  4: "carré",
  5: "pentagone régulier",
  6: "hexagone régulier",
  7: "heptagone régulier",
  8: "octogone régulier",
};

/** Nom du polygone avec article indéfini : « un triangle équilatéral », « un carré »… */
export function nomPolygone(n: number): string {
  return NOMS_POLYGONES[n] ?? `polygone régulier à ${n} côtés`;
}

/** Points à coordonnées entières : tous les sommets dans le cadre [−borne ; borne]². */
export function sommetsDansCadre(e: ExercicePolygones, borne: number): boolean {
  for (let k = 0; k < e.n; k++) {
    const p = sommetFlottant(e, k);
    if (Math.abs(p.x) > borne + 1e-9 || Math.abs(p.y) > borne + 1e-9) return false;
  }
  return true;
}
