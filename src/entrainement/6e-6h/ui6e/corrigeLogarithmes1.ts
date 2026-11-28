import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";
import { fractionLatex, pgcdEntier } from "./formatMonome";

/**
 * Briques communes du corrigé détaillé « comme au tableau » du chapitre 3 de 6e (fonctions
 * logarithmes), moitié 1 : 6gen13 à 6gen21 — règle `.claude/rules/feuilles-evaluations.md`
 * (« Corrigé détaillé — comme au tableau »). SANS `docx` : importé par les adaptateurs papier ET
 * par les générateurs interactifs (corrigé d'une étape échouée).
 *
 * - renvois `COURS_*` aux sections du chapitre « Fonctions logarithmes » (§ 1 à 9) ;
 * - nombres exacts (`frac`, `nb`, `parN`, `decimal`) et termes signés (`terme`, `sommeTermes`) ;
 * - `logBase` : « ln » en base e, « log » en base 10 (jamais « log₁₀ »), « log_b » sinon ;
 * - `lignesAffine` : résolution d'une équation du premier degré a·x + b = V ligne à ligne ;
 * - `justif` : justification en fragments (formules en KaTeX, jamais au clavier).
 */

export const COURS_PROPRIETES = "(cours, point 1)";
export const COURS_EQUATIONS = "(cours, point 2)";
export const COURS_INEQUATIONS = "(cours, point 3)";
export const COURS_DERIVEE = "(cours, point 4)";
export const COURS_LIMITES = "(cours, point 5)";
export const COURS_PARAMETRES = "(cours, point 6)";
export const COURS_HYPERBOLIQUES = "(cours, point 7)";
export const COURS_GRAPHIQUE_DERIVEE = "(cours, point 8)";
export const COURS_ETUDE = "(cours, point 9)";

type Fragments = FragmentConsigne[];

/** Justification mêlant texte et formules : `justif("car ", { l: "x>0" })`. */
export function justif(...morceaux: (string | { l: string })[]): Fragments {
  return morceaux.map((m) => (typeof m === "string" ? texte(m) : latex(m.l)));
}

/** Fraction irréductible n/d en LaTeX (« 3 », « -\dfrac{2}{3} »). */
export function frac(n: number, d = 1): string {
  return fractionLatex(n, d);
}

function estEntier(v: number): boolean {
  return Math.abs(v - Math.round(v)) < 1e-9;
}

/** Rationnel d'un flottant (dénominateur ≤ 1000), sinon null. */
export function rationnel(v: number): { n: number; d: number } | null {
  if (!Number.isFinite(v)) return null;
  for (let d = 1; d <= 1000; d++) {
    const n = Math.round(v * d);
    if (Math.abs(n / d - v) < 1e-9 * Math.max(1, Math.abs(v))) {
      const g = pgcdEntier(n, d) || 1;
      return { n: n / g, d: d / g };
    }
  }
  return null;
}

/** Nombre exact (entier ou fraction) d'un flottant rationnel ; sinon décimal à 3 chiffres. */
export function nb(v: number): string {
  if (estEntier(v)) return String(Math.round(v));
  const r = rationnel(v);
  return r ? frac(r.n, r.d) : decimal(v, 3);
}

/** Nombre entre parenthèses s'il est négatif ou fractionnaire (facteur d'un produit). */
export function parN(v: number): string {
  const s = nb(v);
  if (v >= 0) return s;
  return /\\dfrac/.test(s) ? `\\left(${s}\\right)` : `(${s})`;
}

/** Décimal français à `d` chiffres après la virgule au plus (« 1{,}262 », « -0{,}5 »). */
export function decimal(v: number, d = 3): string {
  const f = Math.pow(10, d);
  const r = Math.round(v * f) / f;
  return String(Object.is(r, -0) ? 0 : r).replace(".", "{,}");
}

/** Terme signé d'une somme : « +3x », « -x », « +\dfrac{1}{2}\ln(2) » (en tête, sans « + »). */
export function terme(coef: number, partie: string, premier = false): string {
  if (coef === 0) return "";
  const abs = Math.abs(coef);
  const r = rationnel(abs);
  let mag: string;
  if (partie === "") mag = nb(abs);
  else if (abs === 1) mag = partie;
  else if (r && r.d !== 1) mag = `${frac(r.n, r.d)}${/^[a-zA-Z(\\]/.test(partie) && !/^\\(dfrac|frac)/.test(partie) ? "" : "\\cdot "}${partie}`;
  else mag = `${nb(abs)}${/^[0-9]/.test(partie) || /^\\(dfrac|frac)/.test(partie) ? "\\cdot " : ""}${partie}`;
  if (premier) return coef < 0 ? `-${mag}` : mag;
  return coef < 0 ? `-${mag}` : `+${mag}`;
}

/** Somme de termes [coef, partie] (termes nuls omis, « 0 » si tout est nul). */
export function sommeTermes(termes: [number, string][]): string {
  let s = "";
  for (const [c, p] of termes) {
    if (c === 0) continue;
    s += terme(c, p, s === "");
  }
  return s === "" ? "0" : s;
}

/** a·x + b (« 2x-3 », « -x », « 5 »). */
export function affine(a: number, b: number, x = "x"): string {
  return sommeTermes([
    [a, x],
    [b, ""],
  ]);
}

/** Expression entre parenthèses si elle a un + / − de niveau 0 (ou commence par « − »). */
export function parE(t: string): string {
  let prof = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "{" || c === "(" || c === "[") prof++;
    else if (c === "}" || c === ")" || c === "]") prof--;
    else if (prof === 0 && i > 0 && (c === "+" || c === "-")) return `(${t})`;
  }
  return t.startsWith("-") ? `(${t})` : t;
}

/** Nom du logarithme de base `b` : « \ln » (base e), « \log » (base 10), « \log_{b} » sinon. */
export function logBase(b: number | string): string {
  if (typeof b === "number" && Math.abs(b - Math.E) < 1e-9) return "\\ln";
  if (b === "e") return "\\ln";
  if (b === 10 || b === "10") return "\\log";
  return `\\log_{${b}}`;
}

/** Remplace « \log_{10} » par « \log » (typographie du chapitre) dans une formule de l'écran. */
export function sansLog10(t: string): string {
  return t.replace(/\\log_\{10\}/g, "\\log").replace(/\\log_10(?![0-9])/g, "\\log");
}

/**
 * Équation du premier degré a·x + b = V (V en LaTeX, `vNum` sa valeur, `vRationnel` vrai si V est
 * un nombre rationnel connu) résolue ligne à ligne : « a·x = V − b » puis « x = (V − b)/a » puis la
 * valeur. Renvoie les lignes et l'écriture finale de x.
 */
export function lignesAffine(a: number, b: number, vL: string, x = "x"): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`${affine(a, b, x)}=${vL}`)];
  let droite = vL;
  if (b !== 0) {
    droite = `${vL}${b > 0 ? "-" : "+"}${Math.abs(b)}`;
    lignes.push(ligne(`${terme(a, x, true)}=${droite}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
  }
  if (a !== 1) {
    lignes.push(ligne(`${x}=${a === -1 ? `-${parE(droite)}` : `\\dfrac{${droite}}{${a}}`}`, `on divise par ${a}`));
  }
  return lignes;
}

/** Typographie du chapitre appliquée à tout un corrigé : « log » pour le logarithme décimal
 * (jamais « log₁₀ »), y compris dans les formules reprises de l'écran. */
export function typoLog(etapes: EtapeCorrection[]): EtapeCorrection[] {
  const f = (fr: FragmentConsigne): FragmentConsigne => (fr.type === "latex" ? { ...fr, valeur: sansLog10(fr.valeur) } : fr);
  return etapes.map((e) => ({
    ...e,
    fragments: e.fragments.map(f),
    ...(e.calcul ? { calcul: e.calcul.map((l) => ({ ...l, latex: sansLog10(l.latex), ...(Array.isArray(l.justification) ? { justification: l.justification.map(f) } : {}) })) } : {}),
  }));
}

/**
 * Formules des justifications rendues insécables (groupe `{…}` : KaTeX ne coupe pas à l'intérieur
 * d'un groupe) — dans la colonne étroite des justifications (2,6 à 4,4 cm), une formule comme
 * « ch(−u) = ch(u) » passait sinon à la ligne au milieu, après son « = ». Le retour à la ligne se
 * fait alors entre le texte et la formule.
 */
export function justificationsInsecables(etapes: EtapeCorrection[]): EtapeCorrection[] {
  const groupe = (fr: FragmentConsigne): FragmentConsigne => (fr.type === "latex" && !/^\{.*\}$/.test(fr.valeur) ? { ...fr, valeur: `{${fr.valeur}}` } : fr);
  return etapes.map((e) => (e.calcul ? { ...e, calcul: e.calcul.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map(groupe) } : l)) } : e));
}

/** `\frac` → `\dfrac` hors indices et exposants (`_{…}`, `^{…}`) : une fraction `\frac` dans un
 * `\dfrac` ou en ligne était rendue en très petit (6gen17 A, « f(x) = ln(x)(…)/ln(x)(…) »). */
export function fractionsLisibles(t: string): string {
  let out = "";
  const pile: boolean[] = []; // true : groupe d'indice ou d'exposant
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c === "\\" && t.startsWith("\\frac", i) && !/[a-zA-Z]/.test(t[i + 5] ?? "")) {
      out += pile.includes(true) ? "\\frac" : "\\dfrac";
      i += 4;
      continue;
    }
    if (c === "\\") {
      // commande ou symbole échappé : recopié tel quel (« \{ » n'ouvre pas de groupe)
      const m = /^\\([a-zA-Z]+|.)/.exec(t.slice(i));
      out += m ? m[0] : c;
      i += m ? m[0].length - 1 : 0;
      continue;
    }
    if (c === "{") pile.push(/[_^]\s*$/.test(out) || pile.includes(true));
    if (c === "}") pile.pop();
    out += c;
  }
  return out;
}

/** Fractions lisibles dans les lignes de calcul et les résultats (pas dans les justifications). */
export function fractionsLisiblesCorrige(etapes: EtapeCorrection[]): EtapeCorrection[] {
  const f = (fr: FragmentConsigne): FragmentConsigne => (fr.type === "latex" ? { ...fr, valeur: fractionsLisibles(fr.valeur) } : fr);
  return etapes.map((e) => ({
    ...e,
    ...(e.type === "resultat" ? { fragments: e.fragments.map(f) } : {}),
    ...(e.calcul ? { calcul: e.calcul.map((l) => ({ ...l, latex: fractionsLisibles(l.latex) })) } : {}),
  }));
}

/** Finition commune des corrigés de la moitié 1 : fractions lisibles, « log » décimal, justifications insécables. */
export function finaliserCorrige(etapes: EtapeCorrection[]): EtapeCorrection[] {
  return justificationsInsecables(typoLog(fractionsLisiblesCorrige(etapes)));
}

/** Liste « a, b et c » de formules (fragments). */
export function listeEt(formules: string[]): Fragments {
  const f: Fragments = [];
  formules.forEach((x, i) => {
    if (i > 0) f.push(texte(i === formules.length - 1 ? " et " : ", "));
    f.push(latex(x));
  });
  return f;
}
