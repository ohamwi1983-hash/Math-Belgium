import type { LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne } from "../../export/corrigeTableau";

/**
 * Briques de calcul « comme au tableau » pour les nombres complexes (6e, chapitre 5) : produit,
 * carré, division par le conjugué, somme… écrits UNE transformation par ligne, avec la règle
 * utilisée — partagées par les corrigés détaillés des générateurs 6gen34–42/93–99
 * (`generateurs6e/<générateur>/corrigeDetaille.ts`). Valeurs EXACTES (entiers, fractions
 * réduites), toujours calculées depuis les paramètres de l'instance.
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

export function frac(n: number, d = 1): Fraction {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (n === 0) return { n: 0, d: 1 };
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}

/** Écriture décimale courte d'une fraction décimale (dénominateur 2^p·5^q), sinon fraction. */
export function fracLatex(f: Fraction, options?: { dfrac?: boolean; decimal?: boolean }): string {
  if (f.d === 1) return `${f.n}`;
  let r = f.d;
  while (r % 2 === 0) r /= 2;
  while (r % 5 === 0) r /= 5;
  if (r === 1 && options?.decimal !== false) return String(Number((f.n / f.d).toFixed(6))).replace(".", "{,}");
  const c = options?.dfrac ? "\\dfrac" : "\\frac";
  return `${f.n < 0 ? "-" : ""}${c}{${Math.abs(f.n)}}{${f.d}}`;
}

/** Monôme c·s écrit réduit : « 3i », « -i », « 4 », « » si c = 0 (s = "" pour une constante). */
export function mono(c: number, s = ""): string {
  if (c === 0) return "";
  if (s === "") return `${c}`;
  if (c === 1) return s;
  if (c === -1) return `-${s}`;
  return `${c}${s}`;
}

/** Somme de termes déjà écrits (chacun peut commencer par « - ») : signes gérés, termes vides ignorés. */
export function somme(termes: string[]): string {
  const t = termes.filter((x) => x !== "");
  if (t.length === 0) return "0";
  return t.map((x, i) => (i === 0 || x.startsWith("-") ? x : `+${x}`)).join("");
}

/** Complexe à coefficients entiers, « a+bi » réduit. */
export function cz(re: number, im: number): string {
  return somme([mono(re), mono(im, "i")]);
}

/** Complexe à coefficients rationnels, « a+bi » réduit (fractions/décimaux courts). */
export function cq(re: Fraction, im: Fraction): string {
  if (re.n === 0 && im.n === 0) return "0";
  const r = re.n === 0 ? "" : fracLatex(re);
  if (im.n === 0) return r;
  const mag = Math.abs(im.n) === 1 && im.d === 1 ? "" : fracLatex(frac(Math.abs(im.n), im.d));
  return `${r}${im.n < 0 ? "-" : r ? "+" : ""}${mag}i`;
}

/** Facteur entre parenthèses s'il contient plusieurs termes ou commence par « - ». */
export function par(x: string): string {
  return /^-|.[+-]/.test(x) ? `(${x})` : x;
}

/** Nombre décimal court (demi-entier…), virgule décimale. */
export function nb(v: number): string {
  return String(Number(v.toFixed(6))).replace(".", "{,}");
}

/** Décimal entre parenthèses s'il est négatif. */
export function pnb(v: number): string {
  return v < 0 ? `(${nb(v)})` : nb(v);
}

/** Monôme à coefficient décimal. */
export function monoD(c: number, s = ""): string {
  if (c === 0) return "";
  if (s === "") return nb(c);
  if (c === 1) return s;
  if (c === -1) return `-${s}`;
  return `${nb(c)}${s}`;
}

/** Complexe à coefficients décimaux courts, « a+bi » réduit. */
export function cd(re: number, im: number): string {
  return somme([monoD(re), monoD(im, "i")]);
}

/** Facteur d'un produit ou base d'une puissance : entre parenthèses sauf s'il s'agit d'un entier
 * positif (« (2i)^2 », « (3-i)(2i) »). */
/** Produit de deux facteurs écrits : « \cdot » entre deux nombres (« 3\cdot 3 », jamais « 33 »). */
export function juxtaposer(a: string, b: string): string {
  return /[0-9}]$/.test(a) && /^[0-9]/.test(b) ? `${a}\\cdot ${b}` : `${a}${b}`;
}

export function parP(x: string): string {
  return /^([0-9]+|i)$/.test(x) ? x : `(${x})`;
}

/** Monôme à coefficient rationnel f·s (« 1{,}5i », « -\frac{2}{3}i », « » si f = 0). */
export function monoQ(f: Fraction, s = ""): string {
  if (f.n === 0) return "";
  if (f.d === 1) return mono(f.n, s);
  return `${fracLatex(f)}${s}`;
}

/** Entier entre parenthèses s'il est négatif. */
export function pn(n: number): string {
  return n < 0 ? `(${n})` : `${n}`;
}

/** Ajoute une ligne de continuation « =… » si elle diffère de la dernière écrite. */
function pousser(lignes: LigneCalcul[], latex: string, justification?: string) {
  const derniere = lignes[lignes.length - 1];
  const dernierMembre = derniere ? derniere.latex.slice(derniere.latex.lastIndexOf("=") + 1) : null;
  if (dernierMembre === latex) return;
  lignes.push(ligne(`=${latex}`, justification));
}

/**
 * Produit de deux complexes entiers, une transformation par ligne :
 * (a+bi)(c+di) = ac + adi + bci + bdi²  (on distribue)
 *              = ac + adi + bci − bd     (car i² = −1)
 *              = (ac − bd) + (ad + bc)i  (on regroupe)
 * `gauche` : membre de gauche (par défaut « (a+bi)(c+di) »).
 */
export function lignesProduit(a: number, b: number, c: number, d: number, gauche?: string): LigneCalcul[] {
  const g = gauche ?? juxtaposer(parP(cz(a, b)), parP(cz(c, d)));
  const developpe = somme([mono(a * c), mono(a * d, "i"), mono(b * c, "i"), mono(b * d, "i^2")]);
  const lignes: LigneCalcul[] = [ligne(`${g}=${developpe}`, "on distribue")];
  if (b * d !== 0) pousser(lignes, somme([mono(a * c), mono(a * d, "i"), mono(b * c, "i"), mono(-b * d)]), "car i² = −1");
  pousser(lignes, cz(a * c - b * d, a * d + b * c), "on regroupe parties réelles et parties imaginaires");
  return lignes;
}

/**
 * Carré d'un complexe entier : (a+bi)² = a² + 2·a·bi + (bi)², puis i² = −1 et regroupement.
 */
export function lignesCarre(a: number, b: number, gauche?: string): LigneCalcul[] {
  const g = gauche ?? `${parP(cz(a, b))}^2`;
  if (a === 0) {
    return [ligne(`${g}=${pn(b)}^2\\,i^2`, "(ab)² = a²b²"), ligne(`=${mono(-b * b)}`, "car i² = −1")];
  }
  if (b === 0) return [ligne(`${g}=${a * a}`)];
  const bi = mono(b, "i");
  const lignes: LigneCalcul[] = [ligne(`${g}=${pn(a)}^2+2\\cdot ${pn(a)}\\cdot(${bi})+(${bi})^2`, "(x + y)² = x² + 2xy + y²")];
  pousser(lignes, somme([mono(a * a), mono(2 * a * b, "i"), mono(b * b, "i^2")]), "on calcule chaque terme");
  pousser(lignes, somme([mono(a * a), mono(2 * a * b, "i"), mono(-b * b)]), "car i² = −1");
  pousser(lignes, cz(a * a - b * b, 2 * a * b), "on regroupe");
  return lignes;
}

/**
 * Division de deux complexes entiers par le conjugué du dénominateur (dénominateur non réel) :
 * N/D = (N·D̄)/(D·D̄), produit du numérateur, dénominateur c² + d², séparation, simplification.
 * `gauche` : écriture de la fraction de départ (par défaut \dfrac{N}{D}).
 */
export function lignesDivisionConjugue(a: number, b: number, c: number, d: number, gauche?: string): LigneCalcul[] {
  const N = cz(a, b);
  const D = cz(c, d);
  const Db = cz(c, -d);
  const g = gauche ?? `\\dfrac{${N}}{${D}}`;
  if (d === 0) return [ligne(`${g}=${cq(frac(a, c), frac(b, c))}`, `on divise chaque partie par ${c}`.replace("-", "−"))];
  const pr = a * c + b * d;
  const pi = b * c - a * d;
  const n2 = c * c + d * d;
  const lignes: LigneCalcul[] = [ligne(`${g}=\\dfrac{${parP(N)}${parP(Db)}}{${parP(D)}${parP(Db)}}`, `on multiplie haut et bas par le conjugué ${Db.replace(/-/g, "−")}`)];
  // Numérateur (produit développé) puis dénominateur.
  lignes.push(...lignesProduit(a, b, c, -d, `${parP(N)}${parP(Db)}`));
  lignes.push(ligne(`${parP(D)}${parP(Db)}=${pn(c)}^2+${pn(d)}^2`, "(c + di)(c − di) = c² + d²"));
  pousser(lignes, `${n2}`);
  lignes.push(ligne(`${g}=\\dfrac{${cz(pr, pi)}}{${n2}}`));
  const re = frac(pr, n2);
  const im = frac(pi, n2);
  if (pr !== 0 && pi !== 0) pousser(lignes, `\\dfrac{${pr}}{${n2}}${pi < 0 ? "-" : "+"}\\dfrac{${Math.abs(pi)}}{${n2}}\\,i`, "on sépare partie réelle et partie imaginaire");
  pousser(lignes, cq(re, im), "on simplifie");
  return lignes;
}

/**
 * Produit d'un complexe rationnel par un complexe entier, une transformation par ligne (vérification
 * d'une division : quotient × dénominateur = numérateur).
 */
export function lignesProduitQ(re: Fraction, im: Fraction, c: number, d: number, gauche?: string): LigneCalcul[] {
  const g = gauche ?? juxtaposer(parP(cq(re, im)), parP(cz(c, d)));
  const fq = (x: Fraction, k: number) => fois(x, frac(k));
  const lignes: LigneCalcul[] = [ligne(`${g}=${somme([monoQ(fq(re, c)), monoQ(fq(re, d), "i"), monoQ(fq(im, c), "i"), monoQ(fq(im, d), "i^2")])}`, "on distribue")];
  if (im.n !== 0 && d !== 0) pousser(lignes, somme([monoQ(fq(re, c)), monoQ(fq(re, d), "i"), monoQ(fq(im, c), "i"), monoQ(fq(frac(-im.n, im.d), d))]), "car i² = −1");
  pousser(lignes, cq(plus(fq(re, c), fq(frac(-im.n, im.d), d)), plus(fq(re, d), fq(im, c))), "on regroupe");
  return lignes;
}

/** Valeur exacte du quotient (a+bi)/(c+di). */
export function quotientExact(a: number, b: number, c: number, d: number): { re: Fraction; im: Fraction } {
  const n2 = c * c + d * d;
  return { re: frac(a * c + b * d, n2), im: frac(b * c - a * d, n2) };
}

/** Somme de fractions. */
export function plus(x: Fraction, y: Fraction): Fraction {
  return frac(x.n * y.d + y.n * x.d, x.d * y.d);
}

export function fois(x: Fraction, y: Fraction): Fraction {
  return frac(x.n * y.n, x.d * y.d);
}

/**
 * Somme ou différence de deux complexes rationnels : on regroupe parties réelles et imaginaires.
 */
export function lignesSomme(u: { re: Fraction; im: Fraction }, v: { re: Fraction; im: Fraction }, op: "+" | "-", gauche?: string): LigneCalcul[] {
  const U = cq(u.re, u.im);
  const V = cq(v.re, v.im);
  const g = gauche ?? `${par(U)}${op}${par(V)}`;
  const vr = op === "+" ? v.re : frac(-v.re.n, v.re.d);
  const vi = op === "+" ? v.im : frac(-v.im.n, v.im.d);
  const reTxt = `${fracLatex(u.re)}${op}${par(fracLatex(v.re))}`;
  const imTxt = `${fracLatex(u.im)}${op}${par(fracLatex(v.im))}`;
  const lignes: LigneCalcul[] = [ligne(`${g}=(${reTxt})+(${imTxt})\\,i`, "on regroupe parties réelles et parties imaginaires")];
  pousser(lignes, cq(plus(u.re, vr), plus(u.im, vi)));
  return lignes;
}

// ============================================================================
// Complexes à coefficients entiers ou décimaux { re, im } (équations, transformations…)
// ============================================================================

export interface V {
  re: number;
  im: number;
}

const z0 = (x: number) => (x === 0 ? 0 : x);
export const v = (re: number, im = 0): V => ({ re: z0(re), im: z0(im) });
export const addV = (a: V, b: V): V => v(a.re + b.re, a.im + b.im);
export const subV = (a: V, b: V): V => v(a.re - b.re, a.im - b.im);
export const mulV = (a: V, b: V): V => v(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
export const negV = (a: V): V => v(-a.re, -a.im);
export const estNul = (a: V) => a.re === 0 && a.im === 0;

/** Écriture « a+bi » (décimaux courts acceptés). */
export function cv(a: V): string {
  return cd(a.re, a.im);
}

/** Facteur d'un produit écrit en clair : réel positif nu, sinon entre parenthèses. */
export function pv(a: V): string {
  return parP(cv(a));
}

/** Coefficient complexe devant une lettre : « 3z », « -z », « iz », « -2iz », « (1+2i)z ». */
export function coefV(a: V, lettre: string): string {
  if (a.im === 0) return monoD(a.re, lettre);
  if (a.re === 0) return monoD(a.im, `i${lettre}`);
  return `(${cv(a)})${lettre}`;
}

/** « +(b) » à ajouter à une somme (rien si b est nul). */
export function plusV(a: V): string {
  if (estNul(a)) return "";
  const t = cv(a);
  return /.[+-]/.test(t) ? `+(${t})` : t.startsWith("-") ? t : `+${t}`;
}

/** Lignes de calcul dont la première continue une chaîne déjà commencée (membre de gauche retiré). */
export function suite(lignes: LigneCalcul[]): LigneCalcul[] {
  return lignes.map((l, i) => (i === 0 ? { ...l, latex: l.latex.slice(l.latex.indexOf("=")) } : l));
}

/**
 * Quotient num/den de deux complexes entiers écrit pas à pas, à la suite d'une ligne « lettre=… » :
 * division d'un réel (on divise chaque partie), sinon multiplication par le conjugué.
 */
export function lignesQuotient(num: V, den: V, lettre = "z"): LigneCalcul[] {
  const g = `${lettre}=\\dfrac{${cv(num)}}{${cv(den)}}`;
  if (estNul(num)) return [ligne(`${g}=0`)];
  if (den.im === 0) {
    const q = cq(frac(num.re, den.re), frac(num.im, den.re));
    return den.re === 1 ? [ligne(`${lettre}=${cv(num)}`)] : [ligne(g), ligne(`=${q}`, `on divise chaque partie par ${nb(den.re).replace("-", "−")}`)];
  }
  return [ligne(g), ...suite(lignesDivisionConjugue(num.re, num.im, den.re, den.im))];
}

/**
 * Racine carrée r de w (r² = w), pas à pas : réel négatif (−k = k·i² = (√k·i)²), réel positif, ou
 * complexe (r = x + yi : identification des parties réelles, imaginaires et des modules). `nom` :
 * l'inconnue dont on cherche le carré (« z », « \delta »…). `r` : la racine retenue par le
 * générateur (partie réelle positive) — l'autre est son opposée.
 */
export function lignesRacineCarree(w: V, r: V, nom = "z"): LigneCalcul[] {
  if (w.im === 0 && w.re < 0) {
    const s = Math.sqrt(-w.re);
    return [ligne(`${nom}^2=${nb(w.re)}`), ligne(`=${nb(-w.re)}\\,i^2`, "car i² = −1"), ligne(`=(${monoD(s, "i")})^2`, "a²b² = (ab)²")];
  }
  if (w.im === 0) return [ligne(`${nom}^2=${nb(w.re)}`), ligne(`=${nb(Math.sqrt(w.re))}^2`)];
  const m = Math.hypot(w.re, w.im);
  const x = r.re;
  return [
    ligne(`(x+yi)^2=(x^2-y^2)+2xy\\,i`, "on pose " + nom.replace("\\delta", "δ") + " = x + yi ; i² = −1"),
    ligne(`x^2-y^2=${nb(w.re)}`, "parties réelles égales"),
    ligne(`2xy=${nb(w.im)}`, "parties imaginaires égales"),
    ligne(`x^2+y^2=\\sqrt{${pnb(w.re)}^2+${pnb(w.im)}^2}`, "modules égaux : x² + y² = |w|"),
    ligne(`=\\sqrt{${nb(w.re * w.re + w.im * w.im)}}`),
    ligne(`=${nb(m)}`),
    ligne(`2x^2=${nb(w.re)}+${nb(m)}`, "1ʳᵉ + 3ᵉ équation"),
    ligne(`=${nb(w.re + m)}`),
    ligne(`x^2=${nb((w.re + m) / 2)}`, `on divise par 2 : x = ±${nb(Math.abs(x)).replace("{,}", ",")}`),
    ligne(`y=\\dfrac{${nb(w.im)}}{2\\cdot ${pnb(x)}}=${nb(r.im)}`, `pour x = ${nb(x).replace("{,}", ",").replace("-", "−")}`),
  ];
}

// ============================================================================
// Angles kπ/d (formes trigonométriques)
// ============================================================================

/** Angle kπ/d écrit sous forme réduite (« -\frac{3\pi}{4} », « \pi », « 0 »). */
export function anglePi(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (d === 1) return a === 1 ? `${s}\\pi` : `${s}${a}\\pi`;
  return a === 1 ? `${s}\\frac{\\pi}{${d}}` : `${s}\\frac{${a}\\pi}{${d}}`;
}

/** Angle entre parenthèses s'il est négatif (facteur ou terme d'une somme). */
export function parAngle(a: string): string {
  return a.startsWith("-") ? `\\left(${a}\\right)` : a;
}

/** Angle kπ/d ramené dans ]−π ; π] : { num, den } réduit. */
export function anglePrincipal(num: number, den: number): { num: number; den: number } {
  const g = pgcd(num, den);
  let n = num / g;
  const d = den / g;
  while (n > d) n -= 2 * d;
  while (n <= -d) n += 2 * d;
  return { num: n, den: d };
}

/**
 * Lignes qui ramènent l'angle brut kπ/d dans ]−π ; π] (rien s'il y est déjà) :
 * « −9π/4 ∉ ]−π ; π] » (on ajoute un tour, 2π = 8π/4), puis « −9π/4 + 8π/4 = −π/4 ».
 */
export function lignesRamenerAngle(num: number, den: number): LigneCalcul[] {
  const g = pgcd(num, den);
  const n = num / g;
  const d = den / g;
  if (n > -d && n <= d) return [];
  const p = anglePrincipal(n, d);
  const tours = (n - p.num) / (2 * d);
  const t = Math.abs(tours);
  const tourLatex = d === 1 ? `${2 * t}\\pi` : `\\frac{${2 * t * d}\\pi}{${d}}`;
  const tourTexte = d === 1 ? `${2 * t}π` : `${2 * t}π = ${2 * t * d}π/${d}`;
  return [
    ligne(`${anglePi(n, d)}\\notin\\,]-\\pi\\,;\\pi]`, `${tours > 0 ? "trop grand : on retire" : "trop petit : on ajoute"} ${t === 1 ? "un tour" : `${t} tours`}, ${tourTexte}`),
    ligne(`${anglePi(n, d)}${tours > 0 ? "-" : "+"}${tourLatex}=${anglePi(p.num, p.den)}`),
  ];
}
