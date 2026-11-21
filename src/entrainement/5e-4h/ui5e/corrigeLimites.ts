import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { finaliserCorrige, jf, sansDoublons } from "./corrigeTrigonometrie1";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 4 de 5e (« Limites et asymptotes ») :
 * 5gen20 (limites), 5gen21 (asymptote oblique), 5gen22 (lecture graphique), 5gen23 (contexte),
 * 5gen24 (étude complète) — règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé
 * détaillé — comme au tableau ». SANS `docx` : importé par les générateurs interactifs ET par les
 * adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de
 *   `content/chapters/5e-4h/limites-asymptotes.ts`).
 * - Limites : `\lim\limits_{x\to a^{+}}` (x → a SOUS « lim »), 0⁺ / 0⁻ justifiés par le signe.
 * - Polynômes à coefficients entiers (indice = degré) : valeur en un point (substitution, termes,
 *   somme — une transformation par ligne), mise en évidence du terme de plus haut degré, division
 *   euclidienne écrite tour par tour, factorisation d'un trinôme unitaire (Δ ou identité
 *   remarquable).
 * - Polynômes AFFICHÉS (énoncé, ordre des termes propre à l'instance) relus par `monomesDe` : une
 *   substitution suit l'écriture de l'énoncé, jamais une seconde écriture recalculée à part.
 */

export const COURS_LIMITES = "(cours, § 1)";
export const COURS_OBLIQUE = "(cours, § 2)";
export const COURS_LECTURE = "(cours, § 3)";
export const COURS_CONTEXTE = "(cours, § 4)";
export const COURS_ETUDE = "(cours, § 5)";

export type Fragments = FragmentConsigne[];
export const t = texte;
export const f = latex;
export { finaliserCorrige, jf, sansDoublons };

// ============================================================================
// Nombres.
// ============================================================================

export function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Entier en LaTeX (« -3 »). */
export function nbL(n: number): string {
  return `${n}`;
}

/** Entier dans une phrase : vrai signe moins (« −3 »). */
export function nbT(n: number): string {
  return `${n}`.replace("-", "−");
}

/** Entier entre parenthèses s'il est négatif (facteur d'un produit, base d'une puissance). */
export function par(n: number): string {
  return n < 0 ? `(${n})` : `${n}`;
}

/** Fraction n/d réduite, signe devant (« -\dfrac{3}{4} », « 2 »). */
export function fracL(n: number, d: number): string {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  if (n === 0) return "0";
  const g = pgcd(n, d);
  const nn = n / g;
  const dd = d / g;
  if (dd === 1) return `${nn}`;
  return `${nn < 0 ? "-" : ""}\\dfrac{${Math.abs(nn)}}{${dd}}`;
}

/** Fraction n/d telle quelle (ni réduite ni signe déplacé : « \dfrac{-5}{-1} »), entier si d = 1. */
export function fracBrute(n: number, d: number): string {
  if (d === 1) return `${n}`;
  return `\\dfrac{${n}}{${d}}`;
}

/** Décimal à virgule, arrondi à `dec` décimales (zéros finaux gardés), pour du LaTeX. */
export function decL(v: number, dec = 2): string {
  const s = (Math.round(v * 10 ** dec) / 10 ** dec).toFixed(dec);
  return (s === `-${(0).toFixed(dec)}` ? (0).toFixed(dec) : s).replace(".", "{,}");
}

/** Vrai si v s'écrit exactement avec au plus `dec` décimales. */
export function estExact(v: number, dec = 2): boolean {
  return Math.abs(v * 10 ** dec - Math.round(v * 10 ** dec)) < 1e-7;
}

/** « = 3,5 » ou « \approx 3,47 » (valeur décimale au plus `dec` décimales). */
export function egalOuApprox(v: number, dec = 2): string {
  if (estExact(v, dec)) {
    const s = String(Math.round(v * 10 ** dec) / 10 ** dec).replace(".", "{,}");
    return `=${s}`;
  }
  return `\\approx ${decL(v, dec)}`;
}

// ============================================================================
// Limites.
// ============================================================================

/** « \lim\limits_{x\to a} » (x → a sous « lim »). */
export function lim(cible: string | number, variable = "x"): string {
  return `\\lim\\limits_{${variable}\\to ${cible}}`;
}

/** Cible unilatérale « 2^{-} » / « 2^{+} ». */
export function cote(a: number, sens: "gauche" | "droite"): string {
  return `${a}^{${sens === "gauche" ? "-" : "+"}}`;
}

export function infini(s: number): string {
  return s > 0 ? "+\\infty" : "-\\infty";
}

/** Infini dans une phrase. */
export function infiniT(s: number): string {
  return s > 0 ? "+∞" : "−∞";
}

/** 0⁺ / 0⁻ en LaTeX. */
export function zeroSigne(s: number): string {
  return s > 0 ? "0^{+}" : "0^{-}";
}

// ============================================================================
// Polynômes (coefficients entiers, indice = degré).
// ============================================================================

export type Poly = number[];

export function degre(p: Poly): number {
  let d = p.length - 1;
  while (d > 0 && Math.abs(p[d] ?? 0) < 1e-12) d--;
  return d;
}

export function normP(p: Poly): Poly {
  return p.slice(0, degre(p) + 1).map((c) => (Math.abs(c) < 1e-12 ? 0 : c));
}

export function evalP(p: Poly, x: number): number {
  let acc = 0;
  for (let i = p.length - 1; i >= 0; i--) acc = acc * x + p[i];
  return acc;
}

export function addP(a: Poly, b: Poly): Poly {
  const n = Math.max(a.length, b.length);
  return normP(Array.from({ length: n }, (_, i) => (a[i] ?? 0) + (b[i] ?? 0)));
}

export function subP(a: Poly, b: Poly): Poly {
  return addP(a, b.map((c) => -c));
}

export function mulP(a: Poly, b: Poly): Poly {
  const r = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) r[i + j] += a[i] * b[j];
  return normP(r);
}

export function egalP(a: Poly, b: Poly): boolean {
  const x = normP(a);
  const y = normP(b);
  return x.length === y.length && x.every((c, i) => Math.abs(c - y[i]) < 1e-9);
}

/** Monôme « 3x^{2} », « -x », « 5 » ; `premier` : pas de « + » devant. */
export function monomeLatex(c: number, d: number, premier: boolean, v = "x"): string {
  if (c === 0) return "";
  const abs = Math.abs(c);
  const signe = c < 0 ? "-" : premier ? "" : "+";
  const variable = d === 0 ? "" : d === 1 ? v : `${v}^{${d}}`;
  const coeff = abs === 1 && d !== 0 ? "" : `${abs}`;
  return `${signe}${coeff}${variable}`;
}

/** Polynôme par degrés décroissants (« 2x^{3}-5x+1 »), « 0 » pour le polynôme nul. */
export function polyLatex(p: Poly, v = "x"): string {
  let out = "";
  for (let d = p.length - 1; d >= 0; d--) out += monomeLatex(p[d] ?? 0, d, out === "", v);
  return out === "" ? "0" : out;
}

/** Polynôme entre parenthèses s'il a plusieurs termes ou commence par « − » (facteur d'un produit). */
export function polyFacteur(p: Poly): string {
  const s = polyLatex(p);
  const termes = normP(p).filter((c) => c !== 0).length;
  return termes > 1 || s.startsWith("-") ? `(${s})` : s;
}

export interface Monome {
  c: number;
  d: number;
}

/** Monômes d'un polynôme AFFICHÉ (« 3-4x+x^{2} »), dans l'ordre de l'écriture ; `null` si l'écriture
 * n'est pas une somme de monômes entiers. */
export function monomesDe(latexPoly: string): Monome[] | null {
  const s = latexPoly.replace(/\s+/g, "");
  if (s === "") return null;
  const re = /([+-]?)(\d*)(x(?:\^\{(\d+)\}|\^(\d))?)?/g;
  const out: Monome[] = [];
  let i = 0;
  while (i < s.length) {
    re.lastIndex = i;
    const m = re.exec(s);
    if (!m || m.index !== i || m[0] === "" || (m[2] === "" && !m[3])) return null;
    const signe = m[1] === "-" ? -1 : 1;
    const coeff = m[2] === "" ? 1 : Number(m[2]);
    const d = m[3] ? Number(m[4] ?? m[5] ?? 1) : 0;
    out.push({ c: signe * coeff, d });
    i += m[0].length;
  }
  return out;
}

export function polyDepuisMonomes(m: Monome[]): Poly {
  const p: Poly = [];
  for (const { c, d } of m) {
    while (p.length <= d) p.push(0);
    p[d] += c;
  }
  return normP(p);
}

export function monomesLatex(m: Monome[]): string {
  return m.map((x, i) => monomeLatex(x.c, x.d, i === 0)).join("") || "0";
}

/** x remplacé par v dans les monômes affichés : « 3\cdot 2^{2}-5\cdot 2+1 ». */
export function substitution(m: Monome[], v: number): string {
  return m
    .map(({ c, d }, i) => {
      const signe = c < 0 ? "-" : i === 0 ? "" : "+";
      if (d === 0) return `${signe}${Math.abs(c)}`;
      const base = par(v);
      const puissance = d === 1 ? base : `${base}^{${d}}`;
      const coeff = Math.abs(c) === 1 ? "" : `${Math.abs(c)}\\cdot `;
      return `${signe}${coeff}${puissance}`;
    })
    .join("");
}

/** Puissances déjà calculées : « 3\cdot 4-5\cdot 2+1 ». */
export function substitutionPuissances(m: Monome[], v: number): string {
  return m
    .map(({ c, d }, i) => {
      const signe = c < 0 ? "-" : i === 0 ? "" : "+";
      if (d === 0) return `${signe}${Math.abs(c)}`;
      const valeur = v ** d;
      const coeff = Math.abs(c) === 1 ? "" : `${Math.abs(c)}\\cdot `;
      return `${signe}${coeff}${Math.abs(c) === 1 && i === 0 && c > 0 ? nbL(valeur) : par(valeur)}`;
    })
    .join("");
}

/** Valeurs des termes : « 12-10+1 ». */
export function termesEvalues(m: Monome[], v: number): string {
  return m
    .map(({ c, d }, i) => {
      const val = c * v ** d;
      if (i === 0) return nbL(val);
      return val < 0 ? `-${Math.abs(val)}` : `+${val}`;
    })
    .join("");
}

/**
 * Valeur d'un polynôme affiché en v, une transformation par ligne : « gauche = substitution »,
 * « = termes calculés » (seulement s'il y a au moins deux termes non constants à calculer), « = valeur ».
 * Substitution trop longue (colonne étroite du papier) : les puissances sont calculées dès la
 * première ligne.
 */
export function lignesValeur(gauche: string, m: Monome[], v: number, justification: string | Fragments = `on remplace x par ${nbT(v)}`): { lignes: LigneCalcul[]; valeur: number } {
  const valeur = m.reduce((s, { c, d }) => s + c * v ** d, 0);
  const sub = substitution(m, v);
  const lignes: LigneCalcul[] = [];
  const nonConstants = m.filter((x) => x.d > 0).length;
  const termes = termesEvalues(m, v);
  const puissances = substitutionPuissances(m, v);
  let termesFaits = false;
  // Colonne du milieu du papier ≈ 230 px : le membre de droite tient en ≈ 26 caractères visibles.
  if (largeurVisible(sub) <= 26) lignes.push(ligne(`${gauche}=${sub}`, justification));
  else if (largeurVisible(puissances) <= 26) lignes.push(ligne(`${gauche}=${puissances}`, typeof justification === "string" ? `${justification} et on calcule les puissances` : justification));
  else {
    lignes.push(ligne(`${gauche}=${termes}`, typeof justification === "string" ? `${justification} et on calcule chaque terme` : justification));
    termesFaits = true;
  }
  if (!termesFaits && v !== 0 && m.length > 1 && (nonConstants >= 2 || m.some((x) => x.d >= 2))) lignes.push(ligne(`=${termes}`, "on calcule chaque terme"));
  lignes.push(ligne(`=${nbL(valeur)}`));
  return { lignes: sansDoublons(lignes), valeur };
}

/** Mise en évidence du terme de plus haut degré : « x^{3}\left(3-\frac{5}{x}+\frac{2}{x^{3}}\right) ».
 * `parenthese` = la seule parenthèse (« 3-\frac{5}{x}+… »), `monome` = vrai si le polynôme n'a qu'un terme. */
export function miseEnEvidence(p: Poly): { latex: string; parenthese: string; puissance: string; monome: boolean; dominant: string } {
  const n = degre(p);
  const lead = p[n];
  const puissance = n === 0 ? "" : n === 1 ? "x" : `x^{${n}}`;
  const dominant = monomeLatex(lead, n, true);
  const autres = [];
  for (let d = n - 1; d >= 0; d--) if (p[d]) autres.push({ c: p[d], k: n - d });
  if (autres.length === 0 || n === 0) return { latex: dominant, parenthese: `${lead}`, puissance, monome: true, dominant };
  let par = `${lead}`;
  for (const { c, k } of autres) {
    const den = k === 1 ? "x" : `x^{${k}}`;
    par += `${c < 0 ? "-" : "+"}\\frac{${Math.abs(c)}}{${den}}`;
  }
  return { latex: `${puissance}\\left(${par}\\right)`, parenthese: par, puissance, monome: false, dominant };
}

/** Facteur « (x-2) », « (x+3) », « x ». */
export function facteurLatex(r: number): string {
  if (r === 0) return "x";
  return r > 0 ? `(x-${r})` : `(x+${-r})`;
}

/** Facteur sans parenthèses (« x-2 »), pour une phrase ou une limite. */
export function facteurNu(r: number): string {
  if (r === 0) return "x";
  return r > 0 ? `x-${r}` : `x+${-r}`;
}

/** k·(x − r₁)(x − r₂)…, racines répétées regroupées en carré : « 2(x-1)(x+3)^{2} ». */
export function produitFacteurs(k: number, racines: number[]): string {
  const comptes = new Map<number, number>();
  for (const r of [...racines].sort((u, v) => (u === 0 ? -1 : v === 0 ? 1 : 0))) comptes.set(r, (comptes.get(r) ?? 0) + 1);
  let corps = "";
  for (const [r, n] of comptes) {
    const base = r === 0 ? "x" : `(${facteurNu(r)})`;
    corps += n === 1 ? (r === 0 ? "x" : base) : `${base}^{${n}}`;
  }
  // « x » en tête suivi d'une parenthèse : « x(x-2) » ; coefficient : « 3x(x-2) », « -(x-1) ».
  if (k === 1) return corps;
  if (k === -1) return `-${corps}`;
  return `${k}${corps}`;
}

// ============================================================================
// Division euclidienne (diviseur unitaire).
// ============================================================================

export interface TourDivision {
  /** Monôme du quotient obtenu à ce tour. */
  terme: Poly;
  /** terme × diviseur. */
  produit: Poly;
  /** Reste après ce tour. */
  reste: Poly;
  /** Reste avant ce tour. */
  avant: Poly;
}

export function divisionEuclidienne(P: Poly, D: Poly): { quotient: Poly; reste: Poly; tours: TourDivision[] } {
  const dD = degre(D);
  const lead = D[dD];
  let reste = normP(P);
  let quotient: Poly = [0];
  const tours: TourDivision[] = [];
  for (let garde = 0; garde < 12 && !(degre(reste) < dD || (degre(reste) === 0 && reste[0] === 0)); garde++) {
    const dr = degre(reste);
    const terme: Poly = new Array(dr - dD + 1).fill(0);
    terme[dr - dD] = reste[dr] / lead;
    const produit = mulP(terme, D);
    const avant = reste;
    reste = subP(reste, produit);
    quotient = addP(quotient, terme);
    tours.push({ terme, produit, reste, avant });
  }
  return { quotient, reste, tours };
}

// ============================================================================
// Factorisation d'un trinôme unitaire à racines entières.
// ============================================================================

/**
 * Lignes qui factorisent un trinôme UNITAIRE x² + bx + c dont les racines sont entières : mise en
 * évidence (c = 0), identité remarquable (carré parfait), sinon Δ et les deux racines.
 * `latexAffiche` : membre de gauche de la ligne de factorisation (le trinôme tel qu'écrit, ou « D(x) »).
 */
export function lignesFactoriserTrinome(p: Poly, latexAffiche: string): { lignes: LigneCalcul[]; racines: number[] } {
  const b = p[1] ?? 0;
  const c = p[0] ?? 0;
  const ordonne = polyLatex(p);
  const lignes: LigneCalcul[] = [];
  if (c === 0) {
    const r = -b;
    lignes.push(ligne(`${latexAffiche}=${produitFacteurs(1, [0, r])}`, "on met x en évidence"));
    return { lignes, racines: [0, r].sort((u, v) => u - v) };
  }
  const delta = b * b - 4 * c;
  if (delta === 0) {
    const r = -b / 2;
    lignes.push(ligne(`${latexAffiche}=${produitFacteurs(1, [r, r])}`, r > 0 ? "identité remarquable a² − 2ab + b²" : "identité remarquable a² + 2ab + b²"));
    return { lignes, racines: [r, r] };
  }
  const s = Math.round(Math.sqrt(delta));
  const r1 = (-b - s) / 2;
  const r2 = (-b + s) / 2;
  lignes.push(ligne(`\\Delta=${par(b)}^{2}-4\\cdot 1\\cdot ${par(c)}`, [texte("discriminant de "), latex(ordonne)]));
  lignes.push(ligne(`=${delta}`));
  lignes.push(ligne(`x_1=\\dfrac{${-b}-\\sqrt{${delta}}}{2}`, [latex("x_1=\\frac{-b-\\sqrt{\\Delta}}{2a}")]));
  lignes.push(ligne(`=${nbL(r1)}`, [texte("car "), latex(`\\sqrt{${delta}}=${s}`)]));
  lignes.push(ligne(`x_2=\\dfrac{${-b}+\\sqrt{${delta}}}{2}`, [latex("x_2=\\frac{-b+\\sqrt{\\Delta}}{2a}")]));
  lignes.push(ligne(`=${nbL(r2)}`));
  lignes.push(ligne(`${latexAffiche}=${produitFacteurs(1, [r1, r2])}`, [latex("a(x-x_1)(x-x_2)")]));
  return { lignes, racines: [r1, r2] };
}

// ============================================================================
// Largeur visible d'une formule (colonne du milieu du papier ≈ 230 px ≈ 48 caractères).
// ============================================================================

/** Nombre approximatif de caractères visibles : une fraction compte pour sa plus large ligne, un
 * exposant pour la moitié. */
export function largeurVisible(l: string): number {
  let s = l.replace(/\\lim\\limits_\{[^{}]*\}/g, "lim  ").replace(/\\left|\\right|\\limits|\\displaystyle/g, "");
  for (let i = 0; i < 6; i++) {
    s = s.replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => "#".repeat(Math.max(largeurVisible(a), largeurVisible(b))));
  }
  s = s.replace(/\^\{([^{}]*)\}/g, (_m, e: string) => "#".repeat(Math.ceil(e.length / 2)));
  s = s.replace(/\\(cdot|times|neq|leq|geq|approx|infty|to|pm|iff|in|notin|Delta|setminus|cup|cap)/g, "#");
  s = s.replace(/\\text\{([^{}]*)\}/g, "$1").replace(/\\[a-zA-Z]+/g, "").replace(/\\[,;! ]/g, "").replace(/[{}\s]/g, "");
  return s.length;
}

// ============================================================================
// Finition.
// ============================================================================

/** Lignes par étape dans l'ordre des lettres, sans doublons de calcul, formules groupées. */
export function finaliser(etapes: EtapeCorrection[]): EtapeCorrection[] {
  const lims = (l: string) => l.replace(/\\lim(?!\\limits|[a-zA-Z])\s*_/g, "\\lim\\limits_");
  const frag = (fr: Fragments) => fr.map((x) => (x.type === "latex" ? latex(lims(x.valeur)) : x));
  return finaliserCorrige(
    etapes.map((e) => ({
      ...e,
      fragments: frag(e.fragments),
      ...(e.calcul ? { calcul: sansDoublons(e.calcul.map((l) => ({ ...l, latex: lims(l.latex), ...(Array.isArray(l.justification) ? { justification: frag(l.justification) } : {}) }))) } : {}),
    })),
  );
}
