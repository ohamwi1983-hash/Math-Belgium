import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { ligne, texte } from "../../export/corrigeTableau";
import { decimalLatex, fractionLatex, pgcdEntier, valeurExacteLatex } from "./formatMonome";

/**
 * Briques communes du corrigé détaillé « comme au tableau » du chapitre 4 de 6e (primitives et
 * intégrales), moitié 1 : 6gen23 à 6gen29 — règle `.claude/rules/feuilles-evaluations.md`
 * (« Corrigé détaillé — comme au tableau »). SANS `docx` : importé par les adaptateurs papier ET
 * par les générateurs interactifs (corrigé d'une étape échouée).
 *
 * - `cours(n)` : renvoi « (cours, § n) » au chapitre « Intégrales et primitives » ;
 * - rationnels exacts (`Q`) pour les calculs polynomiaux (bornes, coefficients, volumes) ;
 * - `substituer` : remplace la variable d'une expression LaTeX par une valeur (parenthèses quand
 *   il le faut, « \cdot » entre deux nombres juxtaposés) — sert à écrire F(b) et F(a) « valeurs
 *   substituées sur une ligne » avant le calcul ;
 * - `crochet` / `lignesCrochet` : [F(x)]ₐᵇ, puis F(b) − F(a) substitué, puis les valeurs, puis le
 *   résultat exact (et sa valeur approchée s'il est irrationnel).
 */

export const cours = (n: number): string => `(cours, § ${n})`;

// ============================================================================
// Rationnels exacts.
// ============================================================================

export interface Q {
  n: number;
  d: number;
}

export function q(n: number, d = 1): Q {
  if (d === 0) throw new Error("dénominateur nul");
  const g = pgcdEntier(n, d);
  const s = d < 0 ? -1 : 1;
  return { n: (s * n) / g || 0, d: (s * d) / g };
}

/** Rationnel exact d'un flottant (dénominateur ≤ 2000), sinon null. */
export function qDepuis(v: number): Q | null {
  if (!Number.isFinite(v)) return null;
  for (let d = 1; d <= 2000; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9 * Math.max(1, Math.abs(v))) return q(n, d);
  }
  return null;
}

export const qAdd = (a: Q, b: Q): Q => q(a.n * b.d + b.n * a.d, a.d * b.d);
export const qSub = (a: Q, b: Q): Q => q(a.n * b.d - b.n * a.d, a.d * b.d);
export const qMul = (a: Q, b: Q): Q => q(a.n * b.n, a.d * b.d);
export const qDiv = (a: Q, b: Q): Q => q(a.n * b.d, a.d * b.n);
export const qNeg = (a: Q): Q => q(-a.n, a.d);
export const qVal = (a: Q): number => a.n / a.d;
export const qNul = (a: Q): boolean => a.n === 0;
export const qPow = (a: Q, k: number): Q => {
  let r = q(1);
  for (let i = 0; i < k; i++) r = qMul(r, a);
  return r;
};

/** « 3 », « -\dfrac{2}{3} ». */
export function qL(a: Q): string {
  return fractionLatex(a.n, a.d);
}

/** Argument d'une fonction : « (3) », « \left(\dfrac{1}{2}\right) ». */
export function argQ(a: Q): string {
  return a.d === 1 ? `(${a.n})` : `\\left(${qL(a)}\\right)`;
}

/** Facteur entre parenthèses s'il est négatif ou fractionnaire (« (-2) », « \left(\dfrac{1}{2}\right) »). */
export function qP(a: Q): string {
  if (a.d !== 1) return `\\left(${qL(a)}\\right)`;
  return a.n < 0 ? `(${a.n})` : `${a.n}`;
}

/** Terme d'une somme : « + 3 », « - \dfrac{2}{3} » (premier terme sans « + »). */
export function qTerme(a: Q, premier = false): string {
  if (premier) return qL(a);
  return a.n < 0 ? `-${qL(qNeg(a))}` : `+${qL(a)}`;
}

// ============================================================================
// Polynômes à coefficients rationnels (degré → coefficient).
// ============================================================================

export type Poly = Map<number, Q>;

export function polyDepuisNombres(c: Map<number, number>): Poly {
  const p: Poly = new Map();
  for (const [n, v] of c) {
    const r = qDepuis(v);
    if (r && !qNul(r)) p.set(n, r);
  }
  return p;
}

/** Monôme c·xⁿ (signe compris, « + » devant sauf en tête). */
function monomeQ(c: Q, n: number, premier: boolean, variable: string): string {
  const neg = c.n < 0;
  const abs = neg ? qNeg(c) : c;
  const corps = n === 0 ? "" : n === 1 ? variable : `${variable}^{${n}}`;
  let mag: string;
  if (corps === "") mag = qL(abs);
  else if (abs.n === 1 && abs.d === 1) mag = corps;
  else if (abs.d === 1) mag = `${abs.n}${corps}`;
  else mag = `\\dfrac{${abs.n === 1 ? "" : abs.n}${corps}}{${abs.d}}`;
  if (premier) return neg ? `-${mag}` : mag;
  return neg ? `-${mag}` : `+${mag}`;
}

export function polyL(p: Poly, variable = "x"): string {
  const degres = [...p.keys()].filter((n) => !qNul(p.get(n) as Q)).sort((a, b) => b - a);
  if (degres.length === 0) return "0";
  return degres.map((n, i) => monomeQ(p.get(n) as Q, n, i === 0, variable)).join("");
}

export function polyPrimitive(p: Poly): Poly {
  const r: Poly = new Map();
  for (const [n, c] of p) r.set(n + 1, qDiv(c, q(n + 1)));
  return r;
}

export function polyEval(p: Poly, x: Q): Q {
  let s = q(0);
  for (const [n, c] of p) s = qAdd(s, qMul(c, qPow(x, n)));
  return s;
}

/** Valeur de P en x écrite terme à terme, x substitué : « 2\cdot 3^{2}-3 ». */
export function polySubstitue(p: Poly, x: Q, variable = "x"): string {
  return substituer(polyL(p, variable), qL(x), variable);
}

// ============================================================================
// Nombres : valeur exacte ou approchée.
// ============================================================================

/** Forme exacte reconnue (rationnel, ou r₀ + r₁K avec K ∈ {π, e, ln 2, ln 3, ln 5, √2, √3, √5}). */
export function exact(v: number): string | null {
  if (Math.abs(v) < 1e-12) return "0";
  return valeurExacteLatex(v);
}

export function estRationnel(v: number): boolean {
  return qDepuis(v) !== null;
}

/** Fin de chaîne : « = exacte » (si elle diffère de `deja`) puis « ≈ approchée » si irrationnelle. */
export function lignesFin(v: number, deja: string | null, justification?: string | FragmentConsigne[]): LigneCalcul[] {
  const e = exact(v);
  const lignes: LigneCalcul[] = [];
  if (e !== null && e !== deja) lignes.push(ligne(`=${e}`, justification));
  if (!estRationnel(v) || (e === null && deja === null)) lignes.push(ligne(`\\approx ${decimalLatex(v, 2)}`, lignes.length === 0 ? justification ?? "valeur approchée" : "valeur approchée"));
  else if (e !== null && /\\dfrac/.test(e) && !/\\(pi|ln|sqrt)/.test(e) && Math.abs(v * 100 - Math.round(v * 100)) > 1e-9) {
    // Fraction non décimale : valeur approchée utile pour comparer avec la calculatrice.
    lignes.push(ligne(`\\approx ${decimalLatex(v, 2)}`, "valeur approchée"));
  }
  return lignes;
}

/** « = exacte ≈ approchée » d'un résultat (membre de droite d'un « Résultat »). */
export function egalValeur(v: number): string {
  const e = exact(v);
  const d = decimalLatex(v, 2);
  if (e === null) return `\\approx ${d}`;
  if (estRationnel(v)) {
    if (!/\\dfrac/.test(e)) return `=${e}`;
    const exacte = Math.abs(v * 100 - Math.round(v * 100)) < 1e-9;
    return `=${e}${exacte ? "=" : "\\approx "}${d}`;
  }
  return `=${e}\\approx ${d}`;
}

/** Valeur d'une borne (exacte si reconnue). */
export function borneL(v: number): string {
  return exact(v) ?? decimalLatex(v, 2);
}

// ============================================================================
// Substitution d'une valeur dans une expression LaTeX.
// ============================================================================

/**
 * Remplace chaque occurrence de la variable (lettre isolée, jamais dans un nom de commande) par
 * `valeur`. Parenthèses autour d'une valeur négative ou composée, sauf quand elle est seule entre
 * deux délimiteurs (« \ln|x| », « \sqrt{x} », « e^{x} », « \cos(x) ») ; « \cdot » quand un nombre
 * précède (« 3x » → « 3\cdot 2 »). Dans un exposant, « \dfrac » devient « \frac ».
 */
export function substituer(expr: string, valeur: string, variable = "x"): string {
  const composite = !/^(\d+|[a-zA-Z])$/.test(valeur);
  const lettre = /^[a-zA-Z]$/.test(valeur);
  let sortie = "";
  let i = 0;
  const estCommande = variable.startsWith("\\");
  while (i < expr.length) {
    const c = expr[i];
    if (c === "\\") {
      const m = /^\\([a-zA-Z]+)/.exec(expr.slice(i));
      if (m) {
        if (estCommande && m[0] === variable && !/[a-zA-Z]/.test(expr[i + m[0].length] ?? "")) {
          sortie += placer(sortie, expr, i + m[0].length);
          i += m[0].length;
          continue;
        }
        sortie += m[0];
        i += m[0].length;
        continue;
      }
      sortie += expr.slice(i, i + 2);
      i += 2;
      continue;
    }
    if (!estCommande && c === variable) {
      sortie += placer(sortie, expr, i + 1);
      i++;
      continue;
    }
    sortie += c;
    i++;
  }
  return sortie;

  function placer(avant: string, source: string, fin: number): string {
    const av = avant.replace(/\s+$/, "");
    const prec = av.slice(-1);
    const reste = source.slice(fin).replace(/^\s+/, "");
    const suiv = (reste.startsWith("\\right") ? reste[6] : reste[0]) ?? "";
    const seul = (prec === "{" && suiv === "}") || (prec === "|" && suiv === "|") || (prec === "(" && suiv === ")") || (prec === "[" && suiv === "]");
    const dansExposant = prec === "{" && av.slice(-2, -1) === "^" && suiv === "}";
    let v = dansExposant ? valeur.replace(/\\dfrac/g, "\\frac") : valeur;
    const envelopper = !seul && (valeur.startsWith("-") || (composite && (suiv === "^" || /[0-9})a-zA-Z]/.test(prec) || /[a-zA-Z\\(]/.test(suiv))));
    if (envelopper) v = /\\d?frac/.test(v) ? `\\left(${v}\\right)` : `(${v})`;
    const juxtapose = !seul && /[0-9)}]/.test(prec);
    if (juxtapose && !envelopper && !lettre) return `\\cdot ${v}`;
    return v;
  }
}

// ============================================================================
// Crochets [F(x)]ₐᵇ.
// ============================================================================

/** « \Big[F(x)\Big]_{a}^{b} » : crochets de taille fixe, jamais « \left…\right » (insécable). */
export function crochet(F: string, a: string, b: string): string {
  return `\\Big[${F}\\Big]_{${a}}^{${b}}`;
}

/** Terme entre parenthèses s'il contient une addition / soustraction de niveau 0 ou commence par « − ». */
export function par(t: string): string {
  let prof = 0;
  let abs = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (t.startsWith("\\left", i)) {
      prof++;
      i += 5;
      continue;
    }
    if (t.startsWith("\\right", i)) {
      prof--;
      i += 6;
      continue;
    }
    if (c === "{" || c === "(" || c === "[") prof++;
    else if (c === "}" || c === ")" || c === "]") prof--;
    else if (c === "|") abs = !abs;
    else if (prof === 0 && !abs && i > 0 && (c === "+" || c === "-")) return entoure(t);
  }
  return t.startsWith("-") ? entoure(t) : t;
}

/**
 * Parenthèses autour d'une expression : « \left(…\right) » si elle est courte, « \Big(…\Big) »
 * (taille fixe) si elle est longue — un groupe « \left…\right » est insécable et sortait de sa
 * cellule à 680 px (règle « formule coupée sur papier »).
 */
export function entoure(t: string): string {
  const visible = t.replace(/\\[a-zA-Z]+|[{}]/g, "").length;
  return visible > 14 ? `\\Big(${t}\\Big)` : `\\left(${t}\\right)`;
}

/** « a − b » avec parenthèses autour de b quand il le faut. */
export function moins(a: string, b: string): string {
  if (b === "0") return a;
  if (a === "0") return b.startsWith("-") && par(b.slice(1)) === b.slice(1) ? b.slice(1) : `-${par(b)}`;
  return `${a}-${par(b)}`;
}

export interface OptionsCrochet {
  /** Primitive (en x) à évaluer. */
  F: string;
  aL: string;
  bL: string;
  Fa: number;
  Fb: number;
  variable?: string;
  /** Membre de gauche de la première ligne (par défaut le crochet lui-même). */
  gauche?: string;
  /** Justification de la première ligne. */
  justification?: string | FragmentConsigne[];
  /** Expressions déjà substituées / exactes de F(a) et F(b), si l'appelant les connaît mieux. */
  FaL?: string | null;
  FbL?: string | null;
}

/**
 * [F(x)]ₐᵇ évalué ligne à ligne : F(b) − F(a) valeurs substituées, puis valeurs calculées (si
 * exactes), puis le résultat exact et sa valeur approchée. Renvoie aussi le membre final.
 */
export function lignesCrochet(o: OptionsCrochet): LigneCalcul[] {
  const v = o.variable ?? "x";
  const subB = substituer(o.F, o.bL, v);
  const subA = substituer(o.F, o.aL, v);
  const lignes: LigneCalcul[] = [];
  const debut = o.gauche ?? crochet(o.F, o.aL, o.bL);
  lignes.push(ligne(`${debut}=${moins(subB, subA)}`, o.justification ?? "F(b) − F(a)"));
  const eB = o.FbL !== undefined ? o.FbL : exact(o.Fb);
  const eA = o.FaL !== undefined ? o.FaL : exact(o.Fa);
  let dernier = moins(subB, subA);
  if (eB !== null && eA !== null) {
    const l = moins(eB, eA);
    if (l !== dernier) {
      lignes.push(ligne(`=${l}`, "on calcule F(b) et F(a)"));
      dernier = l;
    }
  }
  lignes.push(...lignesFin(o.Fb - o.Fa, dernier, "on réduit"));
  return lignes;
}

/** Retire les lignes dont le LaTeX répète exactement la précédente. */
export function sansRepetition(lignes: LigneCalcul[]): LigneCalcul[] {
  const normal = (s: string) => s.replace(/\\dfrac/g, "\\frac").replace(/\s+/g, "").replace(/^=/, "");
  return lignes.filter((l, i) => i === 0 || normal(l.latex) !== normal(lignes[i - 1].latex));
}

// ============================================================================
// Polynômes : racines, signe, carré, intégrale définie (6gen26, 6gen27, 6gen29).
// ============================================================================

export function polyMul(a: Poly, b: Poly): Poly {
  const r: Poly = new Map();
  for (const [n, c] of a) for (const [m, d] of b) r.set(n + m, qAdd(r.get(n + m) ?? q(0), qMul(c, d)));
  for (const [n, c] of [...r]) if (qNul(c)) r.delete(n);
  return r;
}

export function polySub(a: Poly, b: Poly): Poly {
  const r: Poly = new Map(a);
  for (const [n, c] of b) r.set(n, qSub(r.get(n) ?? q(0), c));
  for (const [n, c] of [...r]) if (qNul(c)) r.delete(n);
  return r;
}

export function polyNeg(a: Poly): Poly {
  return new Map([...a].map(([n, c]) => [n, qNeg(c)] as [number, Q]));
}

/** Monôme seul (signe compris), en tête. */
export function monoL(c: Q, n: number, variable = "x"): string {
  return polyL(new Map([[n, c]]), variable);
}

/** « f(r)=… =v » : valeur substituée, puis résultat. */
export function lignesValeurPoly(p: Poly, x: Q, nom = "f", justification?: string | FragmentConsigne[]): LigneCalcul[] {
  const v = polyEval(p, x);
  const sub = polySubstitue(p, x);
  const arg = x.d === 1 ? `(${qL(x)})` : `\\left(${qL(x)}\\right)`;
  const lignes: LigneCalcul[] = [ligne(`${nom}${arg}=${sub}`, justification)];
  if (sub !== qL(v)) lignes.push(ligne(`=${qL(v)}`));
  return lignes;
}

/** Racines d'un trinôme a x² + b x + c par le discriminant (racines rationnelles attendues). */
export function lignesTrinome(p: Poly, variable = "x"): { lignes: LigneCalcul[]; racines: Q[] } {
  const a = p.get(2) ?? q(0);
  const b = p.get(1) ?? q(0);
  const c = p.get(0) ?? q(0);
  const D = qSub(qMul(b, b), qMul(q(4), qMul(a, c)));
  const lignes: LigneCalcul[] = [ligne(`\\Delta=${qNul(b) ? "" : `${qP(b)}^2`}-4\\cdot ${qP(a)}\\cdot ${qP(c)}`, "discriminant"), ligne(`=${qL(D)}`)];
  const s = qDepuis(Math.sqrt(Math.max(0, qVal(D))));
  if (!s) return { lignes, racines: [] };
  const deuxA = qMul(q(2), a);
  if (qNul(D)) {
    const r = qDiv(qNeg(b), deuxA);
    lignes.push(ligne(`${variable}=\\dfrac{${qL(qNeg(b))}}{${qL(deuxA)}}`, "Δ = 0 : racine double"), ligne(`=${qL(r)}`));
    return { lignes, racines: [r] };
  }
  lignes.push(ligne(`\\sqrt{\\Delta}=${qL(s)}`));
  const r1 = qDiv(qSub(qNeg(b), s), deuxA);
  const r2 = qDiv(qAdd(qNeg(b), s), deuxA);
  const [pt, gd, sp, sg] = qVal(r1) < qVal(r2) ? [r1, r2, "-", "+"] : [r2, r1, "+", "-"];
  const mb = qNul(b) ? "" : qL(qNeg(b));
  lignes.push(ligne(`${variable}_1=\\dfrac{${mb}${mb === "" && sp === "+" ? "" : sp}${qL(s)}}{${qL(deuxA)}}`, [texte("formule "), { type: "latex", valeur: "\\dfrac{-b\\pm\\sqrt{\\Delta}}{2a}" }]));
  lignes.push(ligne(`=${qL(pt)}`));
  lignes.push(ligne(`${variable}_2=\\dfrac{${mb}${mb === "" && sg === "+" ? "" : sg}${qL(s)}}{${qL(deuxA)}}`));
  lignes.push(ligne(`=${qL(gd)}`));
  return { lignes, racines: [pt, gd] };
}

/** Carré d'un polynôme développé : (a + b)² = a² + 2ab + b² (ou trois termes), puis réduit. */
export function lignesCarrePoly(p: Poly, gauche: string): LigneCalcul[] {
  const termes = [...p].filter(([, c]) => !qNul(c)).sort((x, y) => y[0] - x[0]);
  const t = (c: Q, n: number) => monoL(c, n);
  const pt = (c: Q, n: number) => (n === 0 && c.n > 0 && c.d === 1 ? `${c.n}` : `(${t(c, n)})`);
  const lignes: LigneCalcul[] = [ligne(`${gauche}=\\left(${polyL(p)}\\right)^2`)];
  if (termes.length === 1) {
    lignes.push(ligne(`=${polyL(polyMul(p, p))}`, "on élève au carré"));
    return lignes;
  }
  const carres = termes.map(([n, c]) => `${pt(c, n)}^2`);
  const doubles: string[] = [];
  for (let i = 0; i < termes.length; i++) for (let j = i + 1; j < termes.length; j++) doubles.push(`2\\cdot ${pt(termes[i][1], termes[i][0])}\\cdot ${pt(termes[j][1], termes[j][0])}`);
  const identite = termes.length === 2 ? "(a+b)^2=a^2+2ab+b^2" : "(a+b+c)^2=a^2+b^2+c^2+2ab+2ac+2bc";
  const ordre = termes.length === 2 ? [carres[0], doubles[0], carres[1]] : [...carres, ...doubles];
  lignes.push(ligne(`=${ordre.join("+")}`, [texte("identité "), { type: "latex", valeur: identite }]));
  const morceaux: string[] = [];
  const ajouter = (c: Q, n: number) => {
    if (qNul(c)) return;
    const m = t(c, n);
    morceaux.push(morceaux.length === 0 || m.startsWith("-") ? m : `+${m}`);
  };
  if (termes.length === 2) {
    ajouter(qMul(termes[0][1], termes[0][1]), 2 * termes[0][0]);
    ajouter(qMul(q(2), qMul(termes[0][1], termes[1][1])), termes[0][0] + termes[1][0]);
    ajouter(qMul(termes[1][1], termes[1][1]), 2 * termes[1][0]);
  } else {
    for (const [n, c] of termes) ajouter(qMul(c, c), 2 * n);
    for (let i = 0; i < termes.length; i++) for (let j = i + 1; j < termes.length; j++) ajouter(qMul(q(2), qMul(termes[i][1], termes[j][1])), termes[i][0] + termes[j][0]);
  }
  const brut = morceaux.join("");
  lignes.push(ligne(`=${brut}`, "on calcule chaque terme"));
  const reduit = polyL(polyMul(p, p));
  if (reduit !== brut) lignes.push(ligne(`=${reduit}`, "on regroupe les termes de même degré"));
  return lignes;
}

/** « 3\pi », « -\dfrac{2\pi}{3} » : multiple rationnel de π. */
export function piL(c: Q): string {
  if (qNul(c)) return "0";
  const neg = c.n < 0;
  const n = Math.abs(c.n);
  const corps = c.d === 1 ? `${n === 1 ? "" : n}\\pi` : `\\dfrac{${n === 1 ? "" : n}\\pi}{${c.d}}`;
  return neg ? `-${corps}` : corps;
}

export interface OptionsIntegralePoly {
  /** Membre de gauche de la première ligne (« \text{Aire} », « V »…), ou "" pour continuer. */
  gauche: string;
  /** Intégrande affiché dans la première ligne (« f(x) », « [f(x)]^2 »…). */
  integrande: string;
  p: Poly;
  a: Q;
  b: Q;
  /** Facteur devant l'intégrale : « - » (aire sous l'axe), « \pi » (volume), « » sinon. */
  facteur?: "" | "-" | "\\pi";
  variable?: string;
}

/** Intégrale définie d'un polynôme : ∫ → [P]ₐᵇ → P(b) − P(a) substitué → valeurs → résultat. */
export function lignesIntegralePoly(o: OptionsIntegralePoly): { lignes: LigneCalcul[]; valeur: Q } {
  const fac = o.facteur ?? "";
  const v = o.variable ?? "x";
  const P = polyPrimitive(o.p);
  const aL = qL(o.a);
  const bL = qL(o.b);
  const Pb = polyEval(P, o.b);
  const Pa = polyEval(P, o.a);
  const diff = qSub(Pb, Pa);
  const valeur = fac === "-" ? qNeg(diff) : diff;
  const enveloppe = (s: string) => (fac === "" ? s : fac === "-" ? `-${entoure(s)}` : `\\pi${entoure(s)}`);
  const lignes: LigneCalcul[] = [];
  const debut = `${fac}\\int_{${aL}}^{${bL}} ${o.integrande}\\,d${v}`;
  lignes.push(ligne(o.gauche === "" ? `=${debut}` : `${o.gauche}=${debut}`));
  lignes.push(ligne(`=${fac}${crochet(polyL(P, v), aL, bL)}`, [texte("primitive terme à terme : "), { type: "latex", valeur: "x^n\\to\\dfrac{x^{n+1}}{n+1}" }]));
  const subB = substituer(polyL(P, v), bL, v);
  const subA = substituer(polyL(P, v), aL, v);
  lignes.push(ligne(`=${enveloppe(moins(subB, subA))}`, "F(b) − F(a)"));
  const vals = moins(qL(Pb), qL(Pa));
  if (vals !== moins(subB, subA)) lignes.push(ligne(`=${enveloppe(vals)}`, "on calcule F(b) et F(a)"));
  const fin = fac === "\\pi" ? piL(diff) : qL(valeur);
  lignes.push(ligne(`=${fin}`, "on réduit"));
  const num = fac === "\\pi" ? qVal(diff) * Math.PI : qVal(valeur);
  if ((fac === "\\pi" && !qNul(diff)) || Math.abs(num * 100 - Math.round(num * 100)) > 1e-9) lignes.push(ligne(`\\approx ${decimalLatex(num, 2)}`, "valeur approchée"));
  return { lignes: sansRepetition(lignes), valeur };
}
