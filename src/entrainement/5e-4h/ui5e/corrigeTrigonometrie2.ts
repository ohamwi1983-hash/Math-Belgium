import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { finaliserCorrige as finaliserSecondDegre } from "../../4e/ui/corrigeSecondDegre1";
import type { RationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";
import { reduireRationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 2 de 5e (Trigonométrie),
 * moitié 2 : 5gen9 (lecture graphique d'une sinusoïde), 5gen10 (équations trigonométriques), 5gen11
 * (extremums), 5gen13 (modéliser) — règle `.claude/rules/feuilles-evaluations.md`, section « Corrigé
 * détaillé — comme au tableau ». SANS `docx` : importé par les générateurs interactifs ET par les
 * adaptateurs.
 *
 * - Renvois au cours (`COURS_*`, numéros `number` des sections de `content/chapters/5e-4h/trigonometrie.ts`).
 * - Rationnels exacts `Q` et expressions symboliques `Expr` = a·π + b·α + c (α : angle de référence
 *   donné par la calculatrice, gardé sous forme de lettre jusqu'à la dernière ligne, qui arrondit à
 *   partir de la valeur NON arrondie).
 * - Séries de solutions (« c + k·p »), équation du premier degré en x ligne à ligne (regrouper,
 *   réduire, diviser — la période aussi), solutions d'un intervalle une par une (valeur de k).
 * Une transformation par ligne, égalités toujours VRAIES, « − » typographique, virgule `{,}`.
 */

export type Fragments = FragmentConsigne[];

export const COURS_PARAMETRES = "(cours, point 4)";
export const COURS_LECTURE = "(cours, point 5)";
export const COURS_EXTREMUMS = "(cours, point 6)";
export const COURS_EQUATIONS = "(cours, point 7)";
export const COURS_MODELISER = "(cours, point 8)";

/** Formules des justifications et des résultats rédigés groupées `{…}` (insécables). */
export const finaliserCorrige = finaliserSecondDegre;

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

export function pgcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1;
}

/** Nombre décimal en LaTeX (virgule `{,}`), au plus `decimales` décimales. */
export function dec(v: number, decimales = 2): string {
  const f = 10 ** decimales;
  const r = Math.round(v * f) / f;
  return String(Object.is(r, -0) || r === 0 ? 0 : r).replace(".", "{,}");
}

/** Le nombre s'écrit-il exactement avec `decimales` décimales ? */
export function estExactADecimales(v: number, decimales = 2): boolean {
  const f = 10 ** decimales;
  return Math.abs(v * f - Math.round(v * f)) < 1e-7;
}

/** Nombre dans une justification (texte) : virgule, « − » typographique. */
export function nombreTexte(v: number, decimales = 4): string {
  return dec(v, decimales).replace("{,}", ",").replace("-", "−");
}

// ---------------------------------------------------------------------------------------------
// Rationnels
// ---------------------------------------------------------------------------------------------

export interface Q {
  n: number;
  d: number;
}

export function q(n: number, d = 1): Q {
  if (d < 0) [n, d] = [-n, -d];
  if (n === 0) return { n: 0, d: 1 };
  const g = pgcd(n, d);
  return { n: n / g, d: d / g };
}
export const ZERO: Q = { n: 0, d: 1 };
export const UN: Q = { n: 1, d: 1 };
export const qAdd = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const qNeg = (a: Q): Q => q(-a.n, a.d);
export const qNul = (a: Q): boolean => a.n === 0;
export const qEgal = (a: Q, b: Q): boolean => a.n === b.n && a.d === b.d;
export const qVal = (a: Q): number => a.n / a.d;

/** Fraction exacte d'un flottant (dénominateur ≤ `dmax`), `null` sinon. */
export function qDepuis(v: number, dmax = 48): Q | null {
  for (let d = 1; d <= dmax; d++) {
    const n = Math.round(v * d);
    if (Math.abs(v - n / d) < 1e-9) return q(n, d);
  }
  return null;
}

/** Écriture exacte : entier, ou `\dfrac` (signe devant). */
export function fr(a: Q): string {
  if (a.d === 1) return `${a.n}`;
  return `${a.n < 0 ? "-" : ""}\\dfrac{${Math.abs(a.n)}}{${a.d}}`;
}

/** Facteur ou terme soustrait : négatif entre parenthèses. */
export function frPar(a: Q): string {
  return a.n < 0 ? `\\left(${fr(a)}\\right)` : fr(a);
}

/** Écriture d'une fraction dans un texte (« 2/3 », « −1/2 »). */
export function frTexte(a: Q): string {
  return `${a.n < 0 ? "−" : ""}${Math.abs(a.n)}${a.d === 1 ? "" : `/${a.d}`}`;
}

// ---------------------------------------------------------------------------------------------
// Expressions a·π + b·α + c
// ---------------------------------------------------------------------------------------------

export interface Expr {
  pi: Q;
  al: Q;
  un: Q;
}

export const E = (pi: Q = ZERO, un: Q = ZERO, al: Q = ZERO): Expr => ({ pi, al, un });
export const EPi = (n: number, d = 1): Expr => E(q(n, d));
export const EZero: Expr = E();
export const eAdd = (a: Expr, b: Expr): Expr => E(qAdd(a.pi, b.pi), qAdd(a.un, b.un), qAdd(a.al, b.al));
export const eSub = (a: Expr, b: Expr): Expr => E(qSub(a.pi, b.pi), qSub(a.un, b.un), qSub(a.al, b.al));
export const eMul = (a: Expr, k: Q): Expr => E(qMul(a.pi, k), qMul(a.un, k), qMul(a.al, k));
export const eNeg = (a: Expr): Expr => eMul(a, q(-1));
export const eNul = (a: Expr): boolean => qNul(a.pi) && qNul(a.al) && qNul(a.un);
export const eEgal = (a: Expr, b: Expr): boolean => eNul(eSub(a, b));
/** Seulement des multiples de π (valeur exacte « en π »). */
export const eEnPi = (a: Expr): boolean => qNul(a.al) && qNul(a.un);
/** Valeur exacte écrite sans arrondi : pas de α, et la partie sans π est nulle ou la seule. */
export const eExacte = (a: Expr): boolean => qNul(a.al) && (qNul(a.un) || qNul(a.pi));
export const eVal = (a: Expr, alpha = 0): number => qVal(a.pi) * Math.PI + qVal(a.al) * alpha + qVal(a.un);

/** Terme q·sym : « \dfrac{3\pi}{4} », « -\pi », « 2\alpha », « \dfrac{1}{2} » (sym vide). */
export function terme(c: Q, sym: string): string {
  if (sym === "") return fr(c);
  const n = Math.abs(c.n);
  const num = n === 1 ? sym : `${n}${sym}`;
  const s = c.n < 0 ? "-" : "";
  return c.d === 1 ? `${s}${num}` : `${s}\\dfrac{${num}}{${c.d}}`;
}

/** Somme de termes LaTeX (chacun peut commencer par « - »). */
export function somme(termes: string[]): string {
  const t = termes.filter((x) => x !== "" && x !== "0");
  if (t.length === 0) return "0";
  return t.map((x, i) => (i === 0 || x.startsWith("-") ? x : `+${x}`)).join("");
}

export function termesExpr(e: Expr, nomAlpha = "\\alpha"): string[] {
  const t: string[] = [];
  if (!qNul(e.pi)) t.push(terme(e.pi, "\\pi"));
  if (!qNul(e.al)) t.push(terme(e.al, nomAlpha));
  if (!qNul(e.un)) t.push(terme(e.un, ""));
  return t;
}

export function exprLatex(e: Expr, nomAlpha = "\\alpha"): string {
  return somme(termesExpr(e, nomAlpha));
}

/** Expression comme facteur (entre parenthèses si elle a plusieurs termes ou un signe). */
export function exprPar(e: Expr, nomAlpha = "\\alpha"): string {
  const t = termesExpr(e, nomAlpha);
  const s = somme(t);
  return t.length > 1 || s.startsWith("-") ? `\\left(${s}\\right)` : s;
}

/** Terme « k·période » (période en π) écrit comme au cours : « 2k\pi », « \dfrac{2k\pi}{3} ». */
export function termeK(p: Expr): string {
  if (eEnPi(p)) {
    const c = p.pi;
    const n = Math.abs(c.n);
    const num = n === 1 ? "k\\pi" : `${n}k\\pi`;
    return `${c.n < 0 ? "-" : ""}${c.d === 1 ? num : `\\dfrac{${num}}{${c.d}}`}`;
  }
  return `${exprPar(p)}k`;
}

/** Série « c + k·p » (constante omise si nulle). */
export function serie(c: Expr, p: Expr, nomAlpha = "\\alpha"): string {
  return eNul(c) ? termeK(p) : somme([...termesExpr(c, nomAlpha), termeK(p)]);
}

/** Série approchée : constante arrondie à `decimales`, période en π. */
export function serieApprochee(c: Expr, p: Expr, alpha: number, decimales = 2): string {
  const v = eVal(c, alpha);
  return Math.abs(v) < 1e-12 ? termeK(p) : somme([dec(v, decimales), termeK(p)]);
}

// ---------------------------------------------------------------------------------------------
// RationnelPi (5gen9, 5gen11) : écriture exacte
// ---------------------------------------------------------------------------------------------

/** « \dfrac{3\pi}{4} », « -\pi », « \dfrac{1}{4\pi} », « \dfrac{5}{2} ». */
export function rpLatex(v: RationnelPi): string {
  const r = reduireRationnelPi(v);
  if (r.numerateur === 0) return "0";
  const s = r.numerateur < 0 ? "-" : "";
  const n = Math.abs(r.numerateur);
  const d = r.denominateur;
  if (r.degrePi === 0) return d === 1 ? `${s}${n}` : `${s}\\dfrac{${n}}{${d}}`;
  if (r.degrePi === 1) {
    const num = n === 1 ? "\\pi" : `${n}\\pi`;
    return d === 1 ? `${s}${num}` : `${s}\\dfrac{${num}}{${d}}`;
  }
  return `${s}\\dfrac{${n}}{${d === 1 ? "" : d}\\pi}`;
}

export function rpPar(v: RationnelPi): string {
  const l = rpLatex(v);
  return l.startsWith("-") ? `\\left(${l}\\right)` : l;
}

/** Terme « k·période » d'une période `RationnelPi` (positive) : « 2k\pi », « \dfrac{2k\pi}{3} », « 6k ». */
export function rpTermeK(p: RationnelPi): string {
  const r = reduireRationnelPi(p);
  const n = Math.abs(r.numerateur);
  const d = r.denominateur;
  const coeff = n === 1 ? "k" : `${n}k`;
  if (r.degrePi === 1) return d === 1 ? `${coeff}\\pi` : `\\dfrac{${coeff}\\pi}{${d}}`;
  if (r.degrePi === -1) return `\\dfrac{${coeff}}{${d === 1 ? "" : d}\\pi}`;
  return d === 1 ? coeff : `\\dfrac{${coeff}}{${d}}`;
}

// ---------------------------------------------------------------------------------------------
// Équation du premier degré en x (une série) : regrouper, réduire, diviser — la période aussi
// ---------------------------------------------------------------------------------------------

/** a·x + c (a rationnel, c expression). */
export interface Lin {
  a: Q;
  c: Expr;
}

export function coefX(a: Q, v = "x"): string {
  if (qEgal(a, UN)) return v;
  if (qEgal(a, q(-1))) return `-${v}`;
  return `${fr(a)}${v}`;
}

export function linLatex(l: Lin, v = "x", nomAlpha = "\\alpha"): string {
  const t: string[] = [];
  if (!qNul(l.a)) t.push(coefX(l.a, v));
  t.push(...termesExpr(l.c, nomAlpha));
  return somme(t);
}

/** Opération qui fait passer la constante `c` dans l'autre membre (texte + formule). */
function justificationConstante(c: Expr, nomAlpha: string): Fragments {
  const t = termesExpr(c, nomAlpha);
  if (t.length === 1) {
    const negatif = t[0]!.startsWith("-");
    return [texte(negatif ? "on ajoute " : "on retranche "), latex(negatif ? t[0]!.slice(1) : t[0]!), texte(" aux deux membres")];
  }
  return [texte("on retranche "), latex(somme(t)), texte(" aux deux membres")];
}

/** Division par a (coefficient de x) : « on divise par 2 : chaque terme, la période aussi ». */
function justificationDivision(a: Q): Fragments {
  if (a.d === 1) return [texte(`on divise par ${frTexte(a)} : on multiplie par `), latex(fr(qDiv(UN, a))), texte(" chaque terme, la période aussi")];
  return [texte("on divise par "), latex(fr(a)), texte(", c'est-à-dire on multiplie par "), latex(fr(qDiv(UN, a)))];
}

/**
 * Résout `gauche = droite + k·P` pour x, une transformation par ligne. La première ligne est
 * l'équation de départ (`depart`, sinon écrite depuis `gauche`/`droite`). Renvoie les lignes et la
 * série finale (constante, période).
 */
export function lignesIsolerX(gauche: Lin, droite: Lin, P: Expr, opts: { depart?: string; justificationDepart?: string | Fragments; v?: string; nomAlpha?: string } = {}): { lignes: LigneCalcul[]; c: Expr; p: Expr } {
  const v = opts.v ?? "x";
  const al = opts.nomAlpha ?? "\\alpha";
  const kTerme = termeK(P);
  const lignes: LigneCalcul[] = [ligne(opts.depart ?? `${linLatex(gauche, v, al)}=${somme([linLatex(droite, v, al), kTerme])}`, opts.justificationDepart)];
  const A = qSub(gauche.a, droite.a);
  const C = eSub(droite.c, gauche.c);
  const xGauche = !qNul(droite.a) ? somme([coefX(gauche.a, v), coefX(qNeg(droite.a), v)]) : coefX(gauche.a, v);
  const aDeplacer = !qNul(droite.a) || !eNul(gauche.c);
  if (aDeplacer) {
    const termesDroite = [...termesExpr(droite.c, al), ...termesExpr(eNeg(gauche.c), al)];
    const l1 = `${xGauche}=${somme([...termesDroite, kTerme])}`;
    const justification: string | Fragments = !qNul(droite.a) ? (eNul(gauche.c) ? "on regroupe les termes en x dans le membre de gauche" : "on regroupe les termes en x à gauche, les constantes à droite") : justificationConstante(gauche.c, al);
    lignes.push(ligne(l1, justification));
    const l2 = `${coefX(A, v)}=${somme([...termesExpr(C, al), kTerme])}`;
    if (l2 !== l1) lignes.push(ligne(l2, "on réduit"));
  }
  let c = C;
  let p = P;
  if (!qEgal(A, UN)) {
    const inv = qDiv(UN, A);
    c = eMul(C, inv);
    p = eMul(P, inv);
    lignes.push(ligne(`${v}=${fr(inv)}\\left(${somme([...termesExpr(C, al), kTerme])}\\right)`, justificationDivision(A)));
    lignes.push(ligne(`=${serie(c, p, al)}`, "on distribue"));
  }
  return { lignes, c, p };
}

// ---------------------------------------------------------------------------------------------
// Solutions d'une série dans un intervalle, une par une (valeur de k)
// ---------------------------------------------------------------------------------------------

export interface OptionsSolutions {
  /** Nom de la variable (« x », « t »). */
  v?: string;
  /** Valeur de α (expressions avec α). */
  alpha?: number;
  nomAlpha?: string;
  /** Borne supérieure (exclue : 2π ; incluse : fenêtre). */
  borne?: { valeur: number; latex: string; texte: string; incluse: boolean };
  /** Valeurs déjà obtenues par une série précédente (doublons signalés). */
  dejaVues?: number[];
  decimales?: number;
}

const DEUX_PI_BORNE = { valeur: 2 * Math.PI, latex: "2\\pi", texte: "[0 ; 2π[", incluse: false };

function kLatex(k: number): string {
  return k < 0 ? `(${k})` : `${k}`;
}

/** Valeurs de k qui placent c + k·p dans l'intervalle (p > 0). */
export function kDansIntervalle(c: number, p: number, borne: number, incluse: boolean): number[] {
  const ks: number[] = [];
  const kmin = Math.ceil((-c - 1e-9) / p);
  for (let k = kmin; k < kmin + 400; k++) {
    const x = c + k * p;
    if (incluse ? x > borne + 1e-9 : x >= borne - 1e-9) break;
    if (x >= -1e-9) ks.push(k);
  }
  return ks;
}

/**
 * Une ligne par valeur de k : « x = c + p·1 = valeur » (« ≈ » si approchée), plus une ligne de
 * rejet de part et d'autre (« < 0 », « ⩾ 2π »). Renvoie les lignes et les valeurs gardées.
 */
export function lignesSolutionsSerie(c: Expr, p: Expr, opts: OptionsSolutions = {}): { lignes: LigneCalcul[]; valeurs: number[] } {
  const v = opts.v ?? "x";
  const alpha = opts.alpha ?? 0;
  const al = opts.nomAlpha ?? "\\alpha";
  const borne = opts.borne ?? DEUX_PI_BORNE;
  const decimales = opts.decimales ?? 2;
  const cv = eVal(c, alpha);
  const pv = eVal(p, alpha);
  const ks = kDansIntervalle(cv, pv, borne.valeur, borne.incluse);
  const dejaVues = [...(opts.dejaVues ?? [])];
  const lignes: LigneCalcul[] = [];
  const valeurs: number[] = [];
  const kmin = ks.length ? ks[0]! : Math.ceil(-cv / pv);
  const kmax = ks.length ? ks[ks.length - 1]! : kmin - 1;
  const cL = exprLatex(c, al);
  for (let k = kmin - 1; k <= kmax + 1; k++) {
    const val = eAdd(c, eMul(p, q(k)));
    const x = eVal(val, alpha);
    const exacte = eExacte(val);
    const substitution = k === 0 ? cL : eNul(c) ? `${exprPar(p, al)}\\cdot ${kLatex(k)}` : somme([cL, `${exprPar(p, al)}\\cdot ${kLatex(k)}`]);
    const valeurL = exacte ? exprLatex(val, al) : dec(x, decimales);
    const rel = exacte ? "=" : "\\approx";
    const chaine = substitution === valeurL ? `${v}=${valeurL}` : `${v}=${substitution}${rel}${valeurL}`;
    if (k < kmin) {
      lignes.push(ligne(`${chaine}<0`, `k = ${k} : hors de ${borne.texte}`));
    } else if (k > kmax) {
      lignes.push(ligne(`${chaine}${borne.incluse ? ">" : "\\geq "}${borne.latex}`, `k = ${k} : hors de ${borne.texte}`));
    } else {
      const doublon = dejaVues.some((y) => Math.abs(y - x) < 1e-6);
      lignes.push(ligne(chaine, `k = ${k}${doublon ? " : déjà obtenue" : ""}`));
      if (!doublon) {
        valeurs.push(x);
        dejaVues.push(x);
      }
    }
  }
  return { lignes, valeurs };
}

/** Lettres présentes dans un corrigé (dans l'ordre). */
export function lettresDuCorrige(etapes: EtapeCorrection[]): string[] {
  return [...new Set(etapes.map((e) => e.sousQuestion).filter((l): l is string => !!l))];
}

/** Fragments « a ou b ou c » d'une liste de formules. */
export function ouLatex(formules: string[]): Fragments {
  return formules.flatMap((f, i) => (i === 0 ? [latex(f)] : [texte(" ou "), latex(f)]));
}

/** Fragments « a ; b ; c » d'une liste de formules. */
export function listeLatex(formules: string[], sep = " ; "): Fragments {
  return formules.flatMap((f, i) => (i === 0 ? [latex(f)] : [texte(sep), latex(f)]));
}

/** `\frac` → `\dfrac` (formules d'écran recopiées dans le corrigé). */
export function dfrac(l: string): string {
  return l.replace(/\\frac/g, "\\dfrac");
}

function normaliser(l: string): string {
  return l.replace(/\\dfrac|\\tfrac/g, "\\frac").replace(/\\left|\\right/g, "").replace(/\s+/g, "");
}

/** Dernière ligne = la forme de l'écran (`finale`, relation comprise : « =… » ou « \approx … »),
 * ajoutée sauf si la dernière ligne y arrive déjà. */
export function avecFinale(lignes: LigneCalcul[], relation: "=" | "\\approx", finale: string, justification?: string | Fragments): LigneCalcul[] {
  const der = lignes[lignes.length - 1];
  if (der) {
    const i = Math.max(der.latex.lastIndexOf("="), der.latex.lastIndexOf("\\approx"));
    const fin = der.latex.slice(i).replace(/^=|^\\approx/, "");
    if (i >= 0 && normaliser(fin) === normaliser(finale)) return lignes;
  }
  return [...lignes, ligne(`${relation === "=" ? "=" : "\\approx "}${finale}`, justification)];
}
