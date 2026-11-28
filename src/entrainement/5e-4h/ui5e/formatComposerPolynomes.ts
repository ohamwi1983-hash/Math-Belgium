import type { ExerciceComposerPolynomes } from "../core5e/composerPolynomes";
import { evalP } from "../moteur5e/polynomeSaisi";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";

/**
 * Couche C — textes de `5gen61` « Composer des polynômes » : écritures des polynômes (forme
 * développée, substitution non développée, développement ligne à ligne), consignes, champs, aides,
 * réponses. Source unique de l'écran, du récapitulatif, du corrigé et du papier.
 */

type E = ExerciceComposerPolynomes;
export type PhaseComposerPolynomes = "substitution" | "fog" | "gof" | "point" | "verdict";

export function phases(e: E): PhaseComposerPolynomes[] {
  return e.variante === "affines" ? ["substitution", "fog", "gof", "point", "verdict"] : ["substitution", "fog", "gof", "point"];
}

// ============================================================================
// Écritures.
// ============================================================================

export interface Terme {
  c: number;
  d: number;
}

function monomeL(c: number, d: number, v: string, premier: boolean): string {
  const signe = c < 0 ? "-" : premier ? "" : "+";
  const a = Math.abs(c);
  if (d === 0) return `${signe}${a}`;
  const coef = a === 1 ? "" : `${a}`;
  return `${signe}${coef}${v}${d === 1 ? "" : `^{${d}}`}`;
}

/** Suite de termes (dans l'ordre donné, coefficients nuls omis) : « 4x^{2}-12x+9+1 ». */
export function termesL(t: Terme[], v = "x"): string {
  const l = t.filter((x) => x.c !== 0);
  if (l.length === 0) return "0";
  return l.map((x, i) => monomeL(x.c, x.d, v, i === 0)).join("");
}

/** Polynôme en forme développée réduite, degrés décroissants. */
export function polyL(p: number[], v = "x"): string {
  return termesL(
    p.map((c, d) => ({ c, d })).reverse(),
    v,
  );
}

/** Expression de l'extérieure où chaque x est remplacé par (intérieure), sans développer :
 * « (2x-3)^{2}+1 », « 3(x^{2}+1)-2 », « -(2x-3)+5 ». */
export function substL(ext: number[], int: number[]): string {
  const par = `\\left(${polyL(int)}\\right)`;
  const morceaux: string[] = [];
  for (let k = ext.length - 1; k >= 0; k--) {
    const c = ext[k];
    if (c === 0) continue;
    const premier = morceaux.length === 0;
    if (k === 0) {
      morceaux.push(c < 0 ? `-${-c}` : premier ? `${c}` : `+${c}`);
      continue;
    }
    const base = `${par}${k === 1 ? "" : `^{${k}}`}`;
    const s = c < 0 ? "-" : premier ? "" : "+";
    const a = Math.abs(c);
    morceaux.push(`${s}${a === 1 ? "" : a}${base}`);
  }
  return morceaux.join("") || "0";
}

/** Nombre entre parenthèses s'il est négatif (substitution). */
export const parN = (x: number) => (x < 0 ? `(${x})` : `${x}`);

/** Polynôme évalué en un nombre, sans calculer : « 2\cdot 2-3 », « (-1)^{2}+1 ». */
export function substNombreL(p: number[], a: number): string {
  const morceaux: string[] = [];
  for (let k = p.length - 1; k >= 0; k--) {
    const c = p[k];
    if (c === 0) continue;
    const premier = morceaux.length === 0;
    const s = c < 0 ? "-" : premier ? "" : "+";
    const abs = Math.abs(c);
    if (k === 0) {
      morceaux.push(`${s}${abs}`);
      continue;
    }
    const base = `${parN(a)}${k === 1 ? "" : `^{${k}}`}`;
    // En 0, le coefficient reste écrit (« −1·0 », jamais « −0 »).
    morceaux.push(`${s}${abs === 1 && a !== 0 ? "" : `${abs}\\cdot `}${base}`);
  }
  return morceaux.join("") || "0";
}

export const fL = (e: E) => `f(x)=${polyL(e.f)}`;
export const gL = (e: E) => `g(x)=${polyL(e.g)}`;

/** Ligne du développement : formule (commence par « = » dans la chaîne) et justification. */
export interface LigneDev {
  latex: string;
  justification: string;
}

/** Carré (mx + p)² de l'intérieure affine : identité « avec A = …, B = … ». */
export function carreAffine(int: number[]): { identite: string; resultat: number[]; A: string; B: string } {
  const [p, m] = int;
  const Ap = m === 1 ? "x" : `(${m === -1 ? "-" : m}x)`;
  return {
    identite: `${Ap}^{2}+2\\cdot ${Ap}\\cdot ${parN(p)}+${parN(p)}^{2}`,
    resultat: [p * p, 2 * m * p, m * m],
    A: m === 1 ? "x" : m === -1 ? "-x" : `${m}x`,
    B: `${p}`,
  };
}

/** Développement ligne à ligne de ext(int) (au plus une parabole : ext ou int) : lignes de la
 * chaîne après « (…)(x) = substitution ». */
export function developpement(ext: number[], int: number[]): LigneDev[] {
  const lignes: LigneDev[] = [];
  const termes: Terme[] = [];
  if (ext.length === 3 && int.length === 2) {
    const [c0, c1, c2] = ext;
    const sq = carreAffine(int).resultat;
    // Le carré développé remis à sa place.
    const morceaux: string[] = [];
    const s2 = c2 === 1 ? "" : c2 === -1 ? "-" : `${c2}`;
    morceaux.push(`${s2}\\left(${polyL(sq)}\\right)`);
    if (c1 !== 0) morceaux.push(`${c1 < 0 ? "-" : "+"}${Math.abs(c1) === 1 ? "" : Math.abs(c1)}\\left(${polyL(int)}\\right)`);
    if (c0 !== 0) morceaux.push(c0 < 0 ? `${c0}` : `+${c0}`);
    lignes.push({ latex: morceaux.join(""), justification: "carré développé (calcul ci-dessus)" });
    termes.push({ c: c2 * sq[2], d: 2 }, { c: c2 * sq[1], d: 1 }, { c: c2 * sq[0], d: 0 }, { c: c1 * int[1], d: 1 }, { c: c1 * int[0], d: 0 }, { c: c0, d: 0 });
  } else {
    // Extérieure affine : m·(intérieure) + p.
    const [p, m] = ext;
    for (let k = int.length - 1; k >= 0; k--) termes.push({ c: m * int[k], d: k });
    termes.push({ c: p, d: 0 });
  }
  const distribue = termesL(termes);
  lignes.push({ latex: distribue, justification: "distributivité : le facteur multiplie chaque terme" });
  // Réduction.
  const reduit = Array.from({ length: 3 }, (_, d) => termes.filter((t) => t.d === d).reduce((s, t) => s + t.c, 0));
  while (reduit.length > 1 && reduit[reduit.length - 1] === 0) reduit.pop();
  const r = polyL(reduit);
  if (r !== distribue) lignes.push({ latex: r, justification: "termes de même degré regroupés" });
  // Lignes identiques consécutives (parenthèse inutile) : on garde la dernière.
  return lignes.filter((l, i) => i === lignes.length - 1 || l.latex.replace(/\\left\(|\\right\)/g, "") !== lignes[i + 1].latex);
}

// ============================================================================
// Écrans.
// ============================================================================

export function consigneGenerale(e: E): Frag[] {
  const fin = e.variante === "affines" ? ", puis compare " : ".";
  const t: Frag[] = [tx("Soit "), lx(fL(e)), tx(" et "), lx(gL(e)), tx(". Calcule "), lx("(f\\circ g)(x)"), tx(" et "), lx("(g\\circ f)(x)"), tx(" sous forme développée et réduite, vérifie "), lx(`(f\\circ g)(${e.a})`), tx(" étage par étage"), tx(fin)];
  if (e.variante === "affines") t.push(lx("f\\circ g"), tx(" et "), lx("g\\circ f"), tx("."));
  return t;
}

export function libelle(e: E, phase: PhaseComposerPolynomes): string {
  switch (phase) {
    case "substitution":
      return "f(g(x)) écrit";
    case "fog":
      return "(f∘g)(x) développée";
    case "gof":
      return "(g∘f)(x) développée";
    case "point":
      return `Vérification en ${e.a < 0 ? "−" + -e.a : e.a}`;
    case "verdict":
      return "f∘g et g∘f";
  }
}

export function consigne(e: E, phase: PhaseComposerPolynomes): Frag[] {
  switch (phase) {
    case "substitution":
      return [tx("Écris "), lx("(f\\circ g)(x)=f\\big(g(x)\\big)"), tx(" : remplace chaque "), lx("x"), tx(" de "), lx("f"), tx(" par l'expression de "), lx("g(x)"), tx(", sans développer.")];
    case "fog":
      return [tx("Développe et réduis "), lx("(f\\circ g)(x)"), tx(".")];
    case "gof":
      return [tx("Calcule "), lx("(g\\circ f)(x)=g\\big(f(x)\\big)"), tx(" sous forme développée et réduite.")];
    case "point":
      return [tx("Vérifie en "), lx(`x=${e.a}`), tx(", étage par étage : calcule "), lx(`g(${e.a})`), tx(", puis "), lx(`(f\\circ g)(${e.a})=f\\big(g(${e.a})\\big)`), tx(". Le résultat doit être la valeur de ta forme développée en "), lx(`${e.a}`), tx(".")];
    case "verdict":
      return [tx("Compare les deux formes développées : a-t-on "), lx("f\\circ g=g\\circ f"), tx(" ?")];
  }
}

export function champs(e: E, phase: PhaseComposerPolynomes): ChampEcran[] {
  switch (phase) {
    case "substitution":
      return [{ label: "f(g(x))", labelLatex: "f\\big(g(x)\\big) =", placeholder: "ex. : 3(x + 1)² − 2", apercu: true }];
    case "fog":
      return [{ label: "(f∘g)(x)", labelLatex: "(f\\circ g)(x) =", placeholder: "ex. : −3x² + 5x − 1", apercu: true }];
    case "gof":
      return [{ label: "(g∘f)(x)", labelLatex: "(g\\circ f)(x) =", placeholder: "ex. : 2x² + x − 7", apercu: true }];
    case "point":
      return [
        { label: `g(${e.a})`, labelLatex: `g(${e.a}) =`, placeholder: "ex. : −5" },
        { label: `(f∘g)(${e.a})`, labelLatex: `(f\\circ g)(${e.a}) =`, placeholder: "ex. : 26" },
      ];
    default:
      return [];
  }
}

export function optionsVerdict(): OptionEcran[] {
  return [
    { id: "egales", fragments: [lx("f\\circ g=g\\circ f"), tx(" : les deux composées ont la même expression")] },
    { id: "differentes", fragments: [lx("f\\circ g\\neq g\\circ f"), tx(" : les deux expressions diffèrent")] },
  ];
}

// ============================================================================
// Aides (deux niveaux, jamais la réponse).
// ============================================================================

const extFog = (e: E) => e.f;

function aideDeveloppement2(ext: number[], int: number[]): AideEcran {
  if (ext.length === 3 && int.length === 2) {
    const c = carreAffine(int);
    return { texte: [tx("Ici, commence par le carré, avec "), lx(`A=${c.A}`), tx(" et "), lx(`B=${c.B}`), tx(" :")], latex: `\\left(${polyL(int)}\\right)^{2}=${c.identite}` };
  }
  const m = ext[1];
  const morceaux = [...int]
    .map((c, d) => ({ c, d }))
    .reverse()
    .filter((t) => t.c !== 0)
    .map((t) => `${parN(m)}\\cdot ${t.c < 0 ? `\\left(${monomeL(t.c, t.d, "x", true)}\\right)` : monomeL(t.c, t.d, "x", true)}`);
  return { texte: [tx("Ici, le facteur "), lx(`${m}`), tx(" multiplie chaque terme de la parenthèse :")], latex: `${m === 1 ? "" : m === -1 ? "-" : m}\\left(${polyL(int)}\\right)=${morceaux.join("+")}` };
}

export function aide1(e: E, phase: PhaseComposerPolynomes): AideEcran {
  switch (phase) {
    case "substitution":
      return { texte: [tx("Dans "), lx("f\\circ g"), tx(", g agit d'abord : sa sortie devient l'entrée de f. On remplace donc chaque "), lx("x"), tx(" de f par toute l'expression de "), lx("g(x)"), tx(", entre parenthèses (cours, point 3) :")], latex: "(f\\circ g)(x)=f\\big(g(x)\\big)" };
    case "fog": {
      const carre = extFog(e).length === 3;
      return {
        texte: carre ? [tx("Développe d'abord le carré, puis distribue chaque facteur et regroupe les termes de même degré :")] : [tx("Distribue le facteur sur chaque terme de la parenthèse, puis regroupe les termes de même degré :")],
        latex: carre ? "(A+B)^2=A^2+2AB+B^2\\qquad k(A+B)=kA+kB" : "k(A+B)=kA+kB",
      };
    }
    case "gof": {
      const carre = e.g.length === 3;
      return {
        texte: [tx("Cette fois, f agit d'abord : remplace chaque "), lx("x"), tx(" de g par "), lx("f(x)"), tx(carre ? ", développe le carré, distribue, puis regroupe les termes de même degré :" : ", distribue, puis regroupe les termes de même degré :")],
        latex: carre ? "(g\\circ f)(x)=g\\big(f(x)\\big)\\qquad (A+B)^2=A^2+2AB+B^2" : "(g\\circ f)(x)=g\\big(f(x)\\big)\\qquad k(A+B)=kA+kB",
      };
    }
    case "point":
      return { texte: [tx("Calcule étage par étage : d'abord le nombre "), lx(`g(${e.a})`), tx(", puis f de ce nombre. Ta forme développée, évaluée en "), lx(`${e.a}`), tx(", doit donner la même valeur :")], latex: `(f\\circ g)(${e.a})=f\\big(g(${e.a})\\big)` };
    case "verdict":
      return { texte: [tx("Deux expressions développées et réduites sont égales quand elles ont les mêmes coefficients, terme par terme : compare le coefficient de "), lx("x"), tx(", puis le terme constant.")] };
  }
}

export function aide2(e: E, phase: PhaseComposerPolynomes): AideEcran | null {
  switch (phase) {
    case "substitution":
      return { texte: [tx("Ici, écris f avec une autre lettre : c'est "), lx("t"), tx(" qui devient "), lx("g(x)"), tx(" :")], latex: `f(t)=${polyL(e.f, "t")}\\qquad t=g(x)=${polyL(e.g)}` };
    case "fog":
      return aideDeveloppement2(e.f, e.g);
    case "gof":
      return { texte: [tx("Ici, sans développer :")], latex: `g\\big(f(x)\\big)=${substL(e.g, e.f)}` };
    case "point":
      return { texte: [tx("Ici, le premier étage :")], latex: `g(${e.a})=${substNombreL(e.g, e.a)}` };
    case "verdict":
      return { texte: [tx("Pour deux affines, les deux composées ont toujours la même pente "), lx(`${parN(e.f[1])}\\cdot ${parN(e.g[1])}=${e.f[1] * e.g[1]}`), tx(" : tout se joue sur le terme constant.")] };
  }
}

export function messageIllisible(_e: E, phase: PhaseComposerPolynomes): string {
  if (phase === "point") return "Nombre non reconnu : écris un entier comme −7 ou 25. Cette saisie ne compte pas comme une tentative.";
  return "Expression non reconnue : écris un polynôme en x comme 4x² − 12x + 10 ou 3(2x − 1)² + 5 (« x^2 » ou « x² »). Cette saisie ne compte pas comme une tentative.";
}

// ============================================================================
// Réponses.
// ============================================================================

export function reponse(e: E, phase: PhaseComposerPolynomes): Frag[] {
  switch (phase) {
    case "substitution":
      return [lx(`f\\big(g(x)\\big)=${substL(e.f, e.g)}`)];
    case "fog":
      return [lx(`(f\\circ g)(x)=${polyL(e.fog)}`)];
    case "gof":
      return [lx(`(g\\circ f)(x)=${polyL(e.gof)}`)];
    case "point":
      return [lx(`g(${e.a})=${e.ga}`), tx(" et "), lx(`(f\\circ g)(${e.a})=f(${e.ga})=${e.fga}`)];
    case "verdict":
      return e.commutent ? [lx("f\\circ g=g\\circ f"), tx(" : mêmes coefficients")] : [lx("f\\circ g\\neq g\\circ f"), tx(" : les expressions diffèrent")];
  }
}

export const recap = reponse;

export function explicationVerdict(e: E): string {
  const k1 = e.fog[0];
  const k2 = e.gof[0];
  const n = (x: number) => (x < 0 ? `−${-x}` : `${x}`);
  return e.commutent ? `Les deux formes développées sont identiques (même pente, même terme constant ${n(k1)}).` : `Même pente, mais termes constants différents : ${n(k1)} pour f∘g et ${n(k2)} pour g∘f.`;
}

/** Valeur de contrôle (tests) : la forme développée de f∘g en a. */
export const valeurFogEnA = (e: E) => evalP(e.fog, e.a);
