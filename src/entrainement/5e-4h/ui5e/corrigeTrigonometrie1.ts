import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { decouperLigneCalcul, latex, ligne, texte } from "../../export/corrigeTableau";

/**
 * Briques du corrigé détaillé « comme au tableau » du chapitre 2 de 5e (Trigonométrie), moitié 1 :
 * 5gen6 (arcs et secteurs), 5gen7 (polygones, arcs et secteurs), 5gen12 (géométrie du cercle),
 * 5gen8 (paramètres d'une sinusoïde) — règle `.claude/rules/feuilles-evaluations.md`, section
 * « Corrigé détaillé — comme au tableau ». SANS `docx` : importé par les générateurs interactifs ET
 * par les adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de `content/chapters/5e-4h/trigonometrie.ts`).
 * - Rationnels exacts `Q` et multiples rationnels de π (`piQ`, `piBrut` : `\dfrac{5\pi}{12}`, `2\pi`),
 *   simplification écrite sur sa propre ligne (« on simplifie par 15 »).
 * - Conversions degrés ↔ radians ligne à ligne (`lignesDegresVersRadians`, `lignesRadiansVersDegres`),
 *   produit et quotients de multiples de π (longueur d'arc s = rθ, aire de secteur ½r²θ, θ = s/r…).
 * - Décimaux à la virgule (`dec`, `vaut`), nombre dans un texte (`nt`, « − » typographique).
 * - Paramètres d'une sinusoïde (A, ω, φ, Φ, b ; T = 2π/ω, f = 1/T) : `RationnelPi` signés (`rpLatex`).
 * Une transformation par ligne, égalités toujours VRAIES (« ≈ » seulement après une valeur approchée).
 */

export const COURS_ARCS = "(cours, § 1)";
export const COURS_POLYGONES = "(cours, § 2)";
export const COURS_GEOMETRIE_CERCLE = "(cours, § 3)";
export const COURS_PARAMETRES = "(cours, § 4)";

export type Fragments = FragmentConsigne[];

// ============================================================================
// Rationnels.
// ============================================================================

export interface Q {
  /** Signé. */
  n: number;
  /** > 0. */
  d: number;
}

export function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

export function q(n: number, d = 1): Q {
  if (d < 0) return q(-n, -d);
  if (n === 0) return { n: 0, d: 1 };
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}

export const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const qAdd = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qVal = (a: Q): number => a.n / a.d;

/** Fraction NON réduite `\dfrac{n}{d}` (entier si d = 1) ; `inner` : `\frac` (dans une autre fraction). */
export function fracBrute(n: number, d: number, inner = false): string {
  if (d === 1) return `${n}`;
  const f = inner ? "\\frac" : "\\dfrac";
  return n < 0 ? `-${f}{${-n}}{${d}}` : `${f}{${n}}{${d}}`;
}

export function fracQ(x: Q, inner = false): string {
  return fracBrute(x.n, x.d, inner);
}

/** n·π/d NON réduit : « \dfrac{75\pi}{180} », « 2\pi », « \pi », « -\dfrac{\pi}{4} », « 0 ». */
export function piBrut(n: number, d: number, inner = false): string {
  if (n === 0) return "0";
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  const num = a === 1 ? "\\pi" : `${a}\\pi`;
  if (d === 1) return `${s}${num}`;
  return `${s}${inner ? "\\frac" : "\\dfrac"}{${num}}{${d}}`;
}

/** Multiple rationnel de π, réduit. */
export function piQ(x: Q, inner = false): string {
  return piBrut(x.n, x.d, inner);
}

/** Négatif entre parenthèses (facteur d'un produit) : « (−3) », « \left(-\dfrac{\pi}{4}\right) ». */
export function par(l: string): string {
  if (!l.startsWith("-")) return l;
  return /\\[dt]?frac/.test(l) ? `\\left(${l}\\right)` : `(${l})`;
}

/** Produit écrit de facteurs entiers (« 5\times 12 ») ; les facteurs 1 sont omis, « 1 » s'il n'en reste aucun. */
export function produitEcrit(facteurs: number[]): string {
  const f = facteurs.filter((x) => x !== 1);
  return f.length === 0 ? "1" : f.map((x) => (x < 0 ? `(${x})` : `${x}`)).join("\\times ");
}

// ============================================================================
// Décimaux et textes.
// ============================================================================

/** Décimal en LaTeX, virgule belge, au plus `d` décimales (zéros finaux retirés). */
export function dec(v: number, d = 2): string {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  const t = (Object.is(r, -0) ? 0 : r).toFixed(d).replace(/\.?0+$/, "");
  return t.replace(".", "{,}");
}

/** Valeur ARRONDIE à `d` décimales, zéros finaux gardés (« 8,90 » : arrondi au centième). */
export function approche(v: number, d = 2): string {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  return (Object.is(r, -0) ? 0 : r).toFixed(d).replace(".", "{,}");
}

export function decimalExact(v: number, d = 2): boolean {
  return Math.abs(Math.round(v * 10 ** d) - v * 10 ** d) < 1e-6;
}

/** « =décimal » si l'écriture à `d` décimales est exacte, sinon « \approx décimal ». */
export function vaut(v: number, d = 2): string {
  return `${decimalExact(v, d) ? "=" : "\\approx "}${dec(v, d)}`;
}

/** Nombre écrit dans un texte (justification) : virgule, « − » typographique. */
export function nt(v: number, d = 4): string {
  return dec(v, d).replace("{,}", ",").replace("-", "−");
}

/** Ligne finale « ≈ décimal » (au centième par défaut) d'une valeur exacte non décimale ; rien si
 * la valeur est entière. */
export function lignesArrondi(v: number, d = 2, justification?: string | Fragments): LigneCalcul[] {
  if (Number.isInteger(Math.round(v * 1e9) / 1e9)) return [];
  const exact = decimalExact(v, d);
  return [ligne(`${exact ? `=${dec(v, d)}` : `\\approx ${approche(v, d)}`}`, justification ?? (exact ? "écriture décimale" : d === 2 ? "arrondi au centième" : d === 4 ? "valeur gardée pour la suite" : d === 1 ? "arrondi au dixième" : "arrondi à l'unité"))];
}

// ============================================================================
// Simplification (une ligne) et lignes consécutives répétées.
// ============================================================================

/** Lignes répétées retirées (à `\frac`/`\dfrac` et aux espaces près) : une ligne « =Y » qui suit
 * une ligne « X=Y » (ou « =Y ») n'apporte rien. */
export function sansDoublons(lignes: LigneCalcul[]): LigneCalcul[] {
  const norm = (l: string) => l.replace(/\\frac/g, "\\dfrac").replace(/\s+/g, "");
  const suite = (l: string) => {
    const { droite } = decouperLigneCalcul(l);
    return droite === null ? norm(l) : norm(droite);
  };
  const out: LigneCalcul[] = [];
  for (const l of lignes) {
    const prec = out[out.length - 1];
    if (prec && (norm(l.latex) === norm(prec.latex) || (decouperLigneCalcul(l.latex).gauche === "" && suite(l.latex) === suite(prec.latex)))) continue;
    out.push(l);
  }
  return out;
}

/** « =\dfrac{5\pi}{12} » (on simplifie par g) si nπ/d se simplifie ; rien sinon. */
export function ligneSimplifierPi(n: number, d: number): LigneCalcul[] {
  const g = pgcd(n, d);
  if (g === 1 || n === 0) return [];
  return [ligne(`=${piQ(q(n, d))}`, d === g ? `on divise par ${g}` : `on simplifie par ${g}`)];
}

export function ligneSimplifierQ(n: number, d: number): LigneCalcul[] {
  const g = pgcd(n, d);
  if (g === 1 || n === 0) return [];
  return [ligne(`=${fracQ(q(n, d))}`, d === g ? `on divise par ${g}` : `on simplifie par ${g}`)];
}

// ============================================================================
// Conversions degrés ↔ radians (cours, § 1).
// ============================================================================

export const FORMULE_DEG_VERS_RAD = "\\theta_{rad}=\\theta°\\times\\dfrac{\\pi}{180}";
export const FORMULE_RAD_VERS_DEG = "\\theta°=\\theta_{rad}\\times\\dfrac{180}{\\pi}";

/** Nombre de degrés (entier ou décimal) en LaTeX, sans le symbole ° (il multiplie π/180). */
export function nombreLatex(v: number, d = 2): string {
  return dec(v, d);
}

/**
 * θ_rad = θ° × π/180 : substitution (le nombre de degrés, sans « ° »), produit, simplification —
 * valeur EXACTE (multiple de π) pour un nombre entier de degrés, « ≈ » au centième sinon.
 */
export function lignesDegresVersRadians(deg: number, gauche = "\\theta_{rad}", arrondi = 2): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${nombreLatex(deg)}\\times\\dfrac{\\pi}{180}`, [texte("on remplace "), latex("\\theta°"), texte(` par ${nt(deg, 2)}`)])];
  if (!Number.isInteger(deg)) return [...lignes, ligne(`\\approx ${dec((deg * Math.PI) / 180, arrondi)}`, arrondi === 1 ? "calculatrice, arrondi au dixième" : "calculatrice, arrondi au centième")];
  lignes.push(ligne(`=${piBrut(deg, 180)}`, "on multiplie"));
  lignes.push(...ligneSimplifierPi(deg, 180));
  return sansDoublons(lignes);
}

/**
 * θ° = θ_rad × 180/π pour θ_rad = nπ/d (réduit) : substitution, simplification par π, quotient
 * 180 : d, produit — un nombre de degrés exact (sans « ° » dans la chaîne : c'est un nombre).
 */
export function lignesRadiansVersDegres(theta: Q, gauche = "\\theta°"): LigneCalcul[] {
  const { n, d } = theta;
  const lignes: LigneCalcul[] = [ligne(`${gauche}=${piQ(theta)}\\times\\dfrac{180}{\\pi}`, [texte("on remplace "), latex("\\theta_{rad}"), texte(" par sa valeur")])];
  const resultat = (n * 180) / d;
  if (d === 1) {
    lignes.push(ligne(`=${Math.abs(n) === 1 ? (n < 0 ? "-180" : "180") : `${n}\\times 180`}`, "on simplifie par π"));
  } else if (180 % d === 0) {
    lignes.push(ligne(`=${Math.abs(n) === 1 ? fracBrute(n * 180, d) : `${n}\\times\\dfrac{180}{${d}}`}`, "on simplifie par π"));
    if (Math.abs(n) !== 1) lignes.push(ligne(`=${n}\\times ${180 / d}`, `180 : ${d} = ${180 / d}`));
  } else {
    lignes.push(ligne(`=${fracBrute(n * 180, d)}`, "on simplifie par π"));
  }
  lignes.push(ligne(`=${Number.isInteger(resultat) ? resultat : dec(resultat, 4)}`, Number.isInteger(resultat) ? undefined : "on divise"));
  return sansDoublons(lignes);
}

/** θ° = θ_rad × 180/π pour un θ_rad décimal : substitution, puis « ≈ » au centième. */
export function lignesRadiansDecimauxVersDegres(rad: number, gauche = "\\theta°"): LigneCalcul[] {
  return [
    ligne(`${gauche}=${dec(rad, 4)}\\times\\dfrac{180}{\\pi}`, [texte("on remplace "), latex("\\theta_{rad}"), texte(` par ${nt(rad, 4)}`)]),
    ligne(`\\approx ${dec((rad * 180) / Math.PI, 2)}`, "calculatrice, arrondi au centième"),
  ];
}

// ============================================================================
// Produits et quotients de multiples de π (arc, secteur, angle).
// ============================================================================

/**
 * Suite d'une ligne « … = m × (aπ/b) » déjà écrite (m rationnel > 0) : le produit (non réduit)
 * puis la simplification.
 */
export function lignesProduitPi(m: Q, x: Q): LigneCalcul[] {
  const n = m.n * x.n;
  const d = m.d * x.d;
  if (m.d === 1) return sansDoublons([ligne(`=${piBrut(n, d)}`, "on multiplie"), ...ligneSimplifierPi(n, d)]);
  return sansDoublons([ligne(`=${piBrut(n, d)}`, "on multiplie les numérateurs et les dénominateurs"), ...ligneSimplifierPi(n, d)]);
}

/** Suite d'une ligne « … = \dfrac{\frac{aπ}{b}}{m} » (ou « \dfrac{aπ}{m} ») : division par l'entier m. */
export function lignesQuotientPiParEntier(x: Q, m: number): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  if (x.d !== 1) lignes.push(ligne(`=${x.n === 1 ? "\\dfrac{\\pi}" : `\\dfrac{${x.n}\\pi}`}{${x.d}\\times ${m}}`, `diviser par ${m}, c'est multiplier le dénominateur par ${m}`));
  lignes.push(ligne(`=${piBrut(x.n, x.d * m)}`, x.d !== 1 ? "on multiplie" : undefined));
  lignes.push(...ligneSimplifierPi(x.n, x.d * m));
  return sansDoublons(lignes);
}

/** Suite d'une ligne « … = \dfrac{\frac{aπ}{b}}{\frac{cπ}{e}} » : produit par l'inverse, π
 * simplifié, produit, quotient (rationnel). */
export function lignesQuotientPiParPi(x: Q, y: Q): LigneCalcul[] {
  const inverse = y.n === 1 ? `\\dfrac{${y.d}}{\\pi}` : `\\dfrac{${y.d}}{${y.n}\\pi}`;
  const n = x.n * y.d;
  const d = x.d * y.n;
  const lignes: LigneCalcul[] = [
    ligne(`=${piQ(x)}\\times ${inverse}`, "diviser par une fraction, c'est multiplier par son inverse"),
    ligne(`=${d === 1 && produitEcrit([x.d, y.n]) === "1" ? produitEcrit([x.n, y.d]) : `\\dfrac{${produitEcrit([x.n, y.d])}}{${produitEcrit([x.d, y.n])}}`}`, "on simplifie par π"),
    ligne(`=${fracBrute(n, d)}`, "on multiplie"),
    ...ligneSimplifierQ(n, d),
  ];
  return sansDoublons(lignes);
}

// ============================================================================
// Paramètres d'une sinusoïde (cours, § 4) — `RationnelPi` signés (degré de π −1, 0 ou 1).
// ============================================================================

export interface RP {
  numerateur: number;
  denominateur: number;
  degrePi: -1 | 0 | 1;
}

/** RationnelPi en LaTeX NON réduit (nombre, fraction, « π » au numérateur ou au dénominateur). */
export function rpBrut(numerateur: number, denominateur: number, degrePi: -1 | 0 | 1, inner = false): string {
  if (numerateur === 0) return "0";
  const f = inner ? "\\frac" : "\\dfrac";
  const s = numerateur < 0 ? "-" : "";
  const a = Math.abs(numerateur);
  if (degrePi === 0) return denominateur === 1 ? `${s}${a}` : `${s}${f}{${a}}{${denominateur}}`;
  if (degrePi === 1) {
    const num = a === 1 ? "\\pi" : `${a}\\pi`;
    return denominateur === 1 ? `${s}${num}` : `${s}${f}{${num}}{${denominateur}}`;
  }
  return `${s}${f}{${a}}{${denominateur === 1 ? "" : denominateur}\\pi}`;
}

export function rpReduit(v: RP): RP {
  if (v.numerateur === 0) return { numerateur: 0, denominateur: 1, degrePi: v.degrePi };
  const g = pgcd(v.numerateur, v.denominateur);
  const s = v.denominateur < 0 ? -1 : 1;
  return { numerateur: (s * v.numerateur) / g, denominateur: (s * v.denominateur) / g, degrePi: v.degrePi };
}

export function rpLatex(v: RP, inner = false): string {
  const r = rpReduit(v);
  return rpBrut(r.numerateur, r.denominateur, r.degrePi, inner);
}

/** Valeur numérique d'un RationnelPi. */
export function rpVal(v: RP): number {
  return (v.numerateur / v.denominateur) * Math.PI ** v.degrePi;
}

/** « =… » (forme non réduite) puis la simplification éventuelle. */
export function lignesFinRP(numerateur: number, denominateur: number, degrePi: -1 | 0 | 1, justification?: string): LigneCalcul[] {
  const brut = rpBrut(numerateur, denominateur, degrePi);
  const reduit = rpLatex({ numerateur, denominateur, degrePi });
  const lignes = [ligne(`=${brut}`, justification)];
  const g = pgcd(numerateur, denominateur);
  if (reduit !== brut) lignes.push(ligne(`=${reduit}`, Math.abs(denominateur) === g ? `on divise par ${g}` : `on simplifie par ${g}`));
  return sansDoublons(lignes);
}

// ============================================================================
// Finition : formules insécables dans les justifications et les textes rédigés.
// ============================================================================

function groupe(l: string): string {
  return l.startsWith("{") && l.endsWith("}") ? l : `{${l}}`;
}

/**
 * Formules des justifications (colonne étroite), de « Ce qu'on utilise » et des résultats rédigés
 * groupées `{…}` : KaTeX ne les coupe plus après « = » en fin de ligne. Un résultat qui n'est
 * qu'une formule reste découpable.
 */
export function finaliserCorrige(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return etapes.map((e) => {
    const calculs = e.calcul?.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map((f) => (f.type === "latex" ? latex(groupe(f.valeur)) : f)) } : l));
    const redige = e.fragments.some((f) => f.type === "texte" && f.valeur.trim() !== "");
    const fragments = redige ? e.fragments.map((f) => (f.type === "latex" ? latex(groupe(f.valeur)) : f)) : e.fragments;
    return { ...e, fragments, ...(calculs ? { calcul: calculs } : {}) };
  });
}

/** Fragments « texte formule texte » d'une justification. */
export function jf(...morceaux: (string | { l: string })[]): Fragments {
  return morceaux.map((m) => (typeof m === "string" ? texte(m) : latex(m.l)));
}
