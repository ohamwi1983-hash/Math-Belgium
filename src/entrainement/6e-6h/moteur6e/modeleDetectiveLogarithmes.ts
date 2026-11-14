import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { MorceauIntervalle } from "../core6e/ensembleReel.types";
import type {
  ExerciceDetectiveLogarithmes,
  IdDescriptionLogarithmes,
  IdScenarioLogarithmes,
  NombreExact,
  TypeErreurLogarithmes,
  ValeurLog,
} from "../core6e/detectiveLogarithmes.types";
import { rat, ratLatex } from "./modeleDetectiveIntegrales";
import type { Rationnel } from "../core6e/detectiveIntegrales.types";

/**
 * Modèle de 6gen88 (« Le détective d'erreurs : logarithmes ») : résolution pure de l'exercice
 * support, ligne par ligne. UNE seule source pour l'écran, les aides, la vérification et
 * l'adaptateur de feuilles (même architecture que 6gen84, `modeleDetectiveIntegrales.ts`, dont les
 * rationnels exacts sont réutilisés).
 *
 * - `copieEleve(e)` : la copie fictive (le défaut est injecté à la ligne fausse ; les lignes
 *   suivantes en découlent avec la bonne méthode : la conclusion reste cohérente avec l'erreur) ;
 * - `correction(e)` : la résolution juste, à partir de la ligne fausse (la ligne corrigée d'abord) ;
 * - `valeursAttendues(e)` : ce que l'écran 3 demande (valeur de la ligne corrigée quand elle porte
 *   une valeur propre, puis le résultat final : nombre, fonction, ensemble fini ou intervalle).
 *
 * Toutes les valeurs sont EXACTES (rationnels, puissances de e, quotients de ln) : aucune
 * calculatrice. Notation du cours : `\ln(x)`, `\log_a(x)`, `\log(x)` (base 10), CE,
 * `(\ln(x))^2`, `\ln(x^2) = 2\ln|x|`.
 */

export const SCENARIOS: Record<IdScenarioLogarithmes, { type: TypeErreurLogarithmes; ligne: number; nombreLignes: number }> = {
  S1: { type: "somme", ligne: 1, nombreLignes: 4 },
  S2: { type: "somme", ligne: 1, nombreLignes: 4 },
  C1: { type: "carre", ligne: 1, nombreLignes: 4 },
  C2: { type: "carre", ligne: 0, nombreLignes: 3 },
  D1: { type: "domaine", ligne: 1, nombreLignes: 4 },
  D2: { type: "domaine", ligne: 3, nombreLignes: 4 },
  B1: { type: "base", ligne: 1, nombreLignes: 4 },
  B2: { type: "base", ligne: 1, nombreLignes: 4 },
  P1: { type: "puissance", ligne: 1, nombreLignes: 4 },
  P2: { type: "puissance", ligne: 1, nombreLignes: 4 },
  Q1: { type: "quotient", ligne: 1, nombreLignes: 4 },
  Q2: { type: "quotient", ligne: 0, nombreLignes: 3 },
  V1: { type: "derivee", ligne: 1, nombreLignes: 3 },
  V2: { type: "derivee", ligne: 1, nombreLignes: 4 },
  K1: { type: "changementBase", ligne: 1, nombreLignes: 3 },
  K2: { type: "changementBase", ligne: 0, nombreLignes: 3 },
};

export const SCENARIOS_PAR_TYPE: Record<TypeErreurLogarithmes, IdScenarioLogarithmes[]> = {
  somme: ["S1", "S2"],
  carre: ["C1", "C2"],
  domaine: ["D1", "D2"],
  base: ["B1", "B2"],
  puissance: ["P1", "P2"],
  quotient: ["Q1", "Q2"],
  derivee: ["V1", "V2"],
  changementBase: ["K1", "K2"],
};

export function typeErreur(e: { scenario: IdScenarioLogarithmes }): TypeErreurLogarithmes {
  return SCENARIOS[e.scenario].type;
}

/** Indice (0 = ligne 1) de la ligne fausse. */
export function indiceLigneFausse(e: { scenario: IdScenarioLogarithmes }): number {
  return SCENARIOS[e.scenario].ligne;
}

/** Description juste de l'erreur (écran 2). */
export function descriptionCorrecte(e: { scenario: IdScenarioLogarithmes }): IdDescriptionLogarithmes {
  switch (e.scenario) {
    case "S1":
      return "somme";
    case "S2":
      return "produit";
    case "C1":
    case "C2":
      return "valeurAbsolue";
    case "D1":
      return "ceRegroupee";
    case "D2":
      return "solutionParasite";
    case "B1":
    case "B2":
      return "sensBase";
    case "P1":
    case "P2":
      return "carreLn";
    case "Q1":
    case "Q2":
      return "quotient";
    case "V1":
    case "V2":
      return "deriveeCompose";
    case "K1":
    case "K2":
      return "changementBase";
  }
}

// ---------------------------------------------------------------------------------------------
// Tables de données (indices tirés par le générateur)
// ---------------------------------------------------------------------------------------------

/** D1 : base, q, racines r et −s de x² − px − a^q = 0 (p = r − s > 0). */
export const TABLE_D1: { base: number; q: number; r: number; s: number }[] = [
  { base: 2, q: 3, r: 4, s: 2 },
  { base: 2, q: 2, r: 4, s: 1 },
  { base: 2, q: 4, r: 8, s: 2 },
  { base: 2, q: 5, r: 8, s: 4 },
  { base: 2, q: 3, r: 8, s: 1 },
  { base: 3, q: 2, r: 9, s: 1 },
  { base: 3, q: 3, r: 9, s: 3 },
  { base: 10, q: 1, r: 5, s: 2 },
];

/** B1 : dénominateur de la base (1/2 ou 1/3) et exposant n (second membre −n). */
export const TABLE_B1: { d: number; n: number }[] = [
  { d: 2, n: 1 },
  { d: 2, n: 2 },
  { d: 2, n: 3 },
  { d: 3, n: 1 },
  { d: 3, n: 2 },
];

/** B2 : bases strictement comprises entre 0 et 1. */
export const BASES_B2 = ["0{,}5", "0{,}2"];

/** K1 : aˣ = b avec a < b, b non puissance de a. */
export const TABLE_K1: [number, number][] = [
  [2, 3],
  [2, 5],
  [2, 7],
  [3, 5],
  [3, 7],
  [3, 10],
  [5, 7],
  [2, 10],
];

/** K2 : log_B(A) avec B = c^p et A = c^q. */
export const TABLE_K2: { c: number; p: number; q: number }[] = [
  { c: 2, p: 2, q: 3 },
  { c: 2, p: 3, q: 2 },
  { c: 3, p: 2, q: 3 },
  { c: 3, p: 3, q: 2 },
  { c: 2, p: 3, q: 4 },
  { c: 2, p: 4, q: 3 },
  { c: 5, p: 2, q: 3 },
  { c: 2, p: 2, q: 5 },
  { c: 2, p: 3, q: 5 },
];

// ---------------------------------------------------------------------------------------------
// Écritures exactes
// ---------------------------------------------------------------------------------------------

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

/** `e^{r}` pour un exposant rationnel (`e`, `e^{2}`, `e^{-1}`, `e^{\frac{9}{2}}`). */
export function ePuissance(r: Rationnel): string {
  if (r.d === 1) return r.n === 1 ? "e" : `e^{${r.n}}`;
  return `e^{${r.n < 0 ? "-" : ""}\\frac{${Math.abs(r.n)}}{${r.d}}}`;
}

function eP(k: number): string {
  return ePuissance(rat(k));
}

/** Entier entre parenthèses s'il est négatif. */
export function parN(x: number): string {
  return x < 0 ? `(${x})` : String(x);
}

/** `ax + b` (a ≠ 0) avec signes propres. */
export function affine(a: number, b: number, v = "x"): string {
  const debut = a === 1 ? v : a === -1 ? `-${v}` : `${a}${v}`;
  if (b === 0) return debut;
  return `${debut} ${b < 0 ? "-" : "+"} ${Math.abs(b)}`;
}

const n = (latex: string, valeur: number): NombreExact => ({ latex, valeur });
const nr = (r: Rationnel): NombreExact => n(ratLatex(r), r.n / r.d);

/** `\{a;b\}` (accolades extensibles dès qu'un élément est une fraction). */
export function ensembleLatex(elements: string[]): string {
  if (elements.length === 0) return "\\varnothing";
  const grand = elements.some((x) => x.includes("frac"));
  return grand ? `\\left\\{${elements.join(";")}\\right\\}` : `\\{${elements.join(";")}\\}`;
}

/** Un morceau d'intervalle exact : structure (pour la vérification) + LaTeX (cours : `]0\,;\,e^2]`). */
function morceau(inf: NombreExact | null, sup: NombreExact | null, infInclus: boolean, supInclus: boolean): { m: MorceauIntervalle; latex: string } {
  const gauche = inf !== null && infInclus ? "[" : "\\mathopen{]}";
  const droite = sup !== null && supInclus ? "]" : "\\mathclose{[}";
  return {
    m: { inf: inf?.valeur ?? null, sup: sup?.valeur ?? null, infInclus: inf !== null && infInclus, supInclus: sup !== null && supInclus },
    latex: `${gauche}${inf?.latex ?? "-\\infty"}\\,;\\,${sup?.latex ?? "+\\infty"}${droite}`,
  };
}

function intervalle(libelle: string, quantite: string, morceaux: ReturnType<typeof morceau>[], bornes: NombreExact[]): ValeurLog {
  return {
    genre: "intervalle",
    libelle,
    quantite,
    ensemble: { forme: "intervalles", points: [], morceaux: morceaux.map((x) => x.m) },
    latex: morceaux.map((x) => x.latex).join(" \\cup "),
    bornes,
  };
}

/** Base d'un logarithme en LaTeX (`\log_2`, `\log` pour la base 10). */
export function logBase(base: number): string {
  return base === 10 ? "\\log" : `\\log_{${base}}`;
}

/** Signe d'inégalité stricte (s = 0) ou large (s = 1), et son inverse. */
export function signe(s: number, sens: "<" | ">"): string {
  if (sens === "<") return s === 1 ? "\\le" : "<";
  return s === 1 ? "\\ge" : ">";
}

// ---------------------------------------------------------------------------------------------
// Copie, correction, valeurs attendues
// ---------------------------------------------------------------------------------------------

interface Resolution {
  copie: FragmentConsigne[][];
  correction: FragmentConsigne[][];
  valeurs: ValeurLog[];
}

const final = "Résultat final corrigé :";

function fonction(libelle: string, quantite: string, latex: string, f: (x: number) => number, points: number[]): ValeurLog {
  return { genre: "fonction", libelle, quantite, latex, variable: "x", f, points, aConstantePres: false, avecC: false };
}

function resoudre(e: ExerciceDetectiveLogarithmes): Resolution {
  const d = e.donnees;
  switch (e.scenario) {
    case "S1": {
      const { a, b } = d as { a: number; b: number };
      const eb = eP(b);
      const sol = `${eb} - ${a}`;
      return {
        copie: [
          [t("CE : "), l(`x + ${a} > 0`), t(", donc "), l(`x > -${a}`), t(".")],
          [l(`\\ln(x + ${a}) = \\ln(x) + \\ln(${a})`), t(", donc l'équation s'écrit "), l(`\\ln(x) + \\ln(${a}) = ${b}`), t(".")],
          [l(`\\ln(x) = ${b} - \\ln(${a})`), t(", donc "), l(`x = e^{${b} - \\ln(${a})} = \\dfrac{${eb}}{${a}}`), t(".")],
          [t("Cette valeur vérifie la CE : "), l(`S = ${ensembleLatex([`\\dfrac{${eb}}{${a}}`])}`), t(".")],
        ],
        correction: [
          [t("Par définition du logarithme, "), l(`\\ln(x + ${a}) = ${b} \\iff x + ${a} = ${eb}`), t(".")],
          [l(`x = ${sol}`), t(", qui vérifie la CE car "), l(`${eb} > 0`), t(".")],
          [l(`S = ${ensembleLatex([sol])}`)],
        ],
        valeurs: [{ genre: "ensemble", libelle: final, elements: [n(sol, Math.exp(b) - a)] }],
      };
    }
    case "S2": {
      const { k, m } = d as { k: number; m: number };
      const ek = eP(k);
      const copieX = ePuissance(rat(m, k));
      const sol = eP(m - k);
      return {
        copie: [
          [t("CE : "), l(`${ek}x > 0`), t(", donc "), l("x > 0"), t(".")],
          [l(`\\ln(${ek}x) = \\ln(${ek}) \\cdot \\ln(x) = ${k}\\ln(x)`), t(".")],
          [t("L'équation s'écrit "), l(`${k}\\ln(x) = ${m}`), t(", donc "), l(`\\ln(x) = ${ratLatex(rat(m, k))}`), t(".")],
          [l(`x = ${copieX}`), t(" vérifie la CE : "), l(`S = ${ensembleLatex([copieX])}`), t(".")],
        ],
        correction: [
          [l(`\\ln(${ek}x) = \\ln(${ek}) + \\ln(x) = ${k} + \\ln(x)`), t(", car le logarithme d'un produit est la somme des logarithmes.")],
          [t("L'équation s'écrit "), l(`${k} + \\ln(x) = ${m}`), t(", donc "), l(`\\ln(x) = ${m - k}`), t(".")],
          [l(`x = ${sol}`), t(" vérifie la CE : "), l(`S = ${ensembleLatex([sol])}`), t(".")],
        ],
        valeurs: [
          fonction(`Ligne 2 corrigée :`, `\\ln(${ek}x)`, `${k} + \\ln(x)`, (x) => k + Math.log(x), [0.4, 1.3, 2.5, 6]),
          { genre: "ensemble", libelle: final, elements: [n(sol, Math.exp(m - k))] },
        ],
      };
    }
    case "C1": {
      const { a } = d as { a: number };
      const A = a * a;
      return {
        copie: [
          [t("CE : "), l("x^2 > 0"), t(", donc "), l("x \\neq 0"), t(".")],
          [l("\\ln(x^2) = 2\\ln(x)"), t(", donc l'équation s'écrit "), l(`2\\ln(x) = \\ln(${A})`), t(".")],
          [l(`\\ln(x) = \\dfrac{\\ln(${A})}{2} = \\ln(${a})`), t(", donc "), l(`x = ${a}`), t(".")],
          [l(`S = \\{${a}\\}`)],
        ],
        correction: [
          [l("\\ln(x^2) = 2\\ln|x|"), t(" pour tout "), l("x \\neq 0"), t(", donc l'équation s'écrit "), l(`2\\ln|x| = \\ln(${A})`), t(".")],
          [l(`\\ln|x| = \\ln(${a})`), t(", donc "), l(`|x| = ${a}`), t(" : "), l(`x = -${a}`), t(" ou "), l(`x = ${a}`), t(", deux valeurs non nulles.")],
          [l(`S = \\{-${a};${a}\\}`)],
        ],
        valeurs: [{ genre: "ensemble", libelle: final, elements: [n(`-${a}`, -a), n(`${a}`, a)] }],
      };
    }
    case "C2": {
      const { k, s } = d as { k: number; s: number };
      const lt = signe(s, "<");
      const ek = eP(k);
      const large = s === 1;
      const borneP = n(ek, Math.exp(k));
      const borneM = n(`-${ek}`, -Math.exp(k));
      const zero = n("0", 0);
      const copieS = morceau(zero, borneP, false, large);
      return {
        copie: [
          [l("\\ln(x^2) = 2\\ln(x)"), t(", donc l'inéquation s'écrit "), l(`2\\ln(x) ${lt} ${2 * k}`), t(".")],
          [l(`\\ln(x) ${lt} ${k}`), t(" ; l'exponentielle est croissante, donc "), l(`x ${lt} ${ek}`), t(".")],
          [t("Comme "), l("\\ln(x)"), t(" n'existe que pour "), l("x > 0"), t(" : "), l(`S = ${copieS.latex}`), t(".")],
        ],
        correction: [
          [l("\\ln(x^2) = 2\\ln|x|"), t(" pour tout "), l("x \\neq 0"), t(", donc l'inéquation s'écrit "), l(`2\\ln|x| ${lt} ${2 * k}`), t(".")],
          [l(`\\ln|x| ${lt} ${k}`), t(", donc "), l(`0 < |x| ${lt} ${ek}`), t(", c'est-à-dire "), l(`-${ek} ${lt} x ${lt} ${ek}`), t(" avec "), l("x \\neq 0"), t(".")],
          [l(`S = ${morceau(borneM, zero, large, false).latex} \\cup ${morceau(zero, borneP, false, large).latex}`)],
        ],
        valeurs: [intervalle(final, "S =", [morceau(borneM, zero, large, false), morceau(zero, borneP, false, large)], [borneM, zero, borneP])],
      };
    }
    case "D1": {
      const { base, q, r, s } = TABLE_D1[d.i!]!;
      const p = r - s;
      const N = base ** q;
      const lg = logBase(base);
      const gauche = `${lg}(x) + ${lg}(x - ${p})`;
      return {
        copie: [
          [l(`${gauche} = ${lg}\\big(x(x - ${p})\\big)`), t(", donc l'équation s'écrit "), l(`${lg}\\big(x(x - ${p})\\big) = ${q}`), t(".")],
          [t("CE : "), l(`x(x - ${p}) > 0`), t(", donc "), l("x < 0"), t(" ou "), l(`x > ${p}`), t(".")],
          [l(`x(x - ${p}) = ${q === 1 ? base : `${base}^{${q}}`} \\iff x^2 - ${p}x - ${N} = 0 \\iff (x - ${r})(x + ${s}) = 0`), t(", donc "), l(`x = ${r}`), t(" ou "), l(`x = -${s}`), t(".")],
          [t("Les deux valeurs vérifient la CE : "), l(`S = \\{-${s};${r}\\}`), t(".")],
        ],
        correction: [
          [t("CE de l'équation de départ : "), l("x > 0"), t(" et "), l(`x - ${p} > 0`), t(", donc "), l(`x > ${p}`), t(".")],
          [t("La résolution donne toujours "), l(`x = ${r}`), t(" ou "), l(`x = -${s}`), t(" ; "), l(`x = -${s}`), t(" est rejetée par la CE ("), l(`${lg}(-${s})`), t(" n'existe pas).")],
          [l(`S = \\{${r}\\}`)],
        ],
        valeurs: [
          intervalle("Ligne 2 corrigée — la CE :", "x \\in", [morceau(n(String(p), p), null, false, false)], [n(String(p), p)]),
          { genre: "ensemble", libelle: final, elements: [n(String(r), r)] },
        ],
      };
    }
    case "D2": {
      const { r } = d as { r: number };
      const s = r - 1;
      const nn = r * s;
      return {
        copie: [
          [l("2\\ln(x) = \\ln(x^2)"), t(", donc l'équation s'écrit "), l(`\\ln(x^2) = \\ln(x + ${nn})`), t(".")],
          [t("La fonction ln est injective : "), l(`x^2 = x + ${nn} \\iff x^2 - x - ${nn} = 0`), t(".")],
          [l(`(x - ${r})(x + ${s}) = 0`), t(", donc "), l(`x = ${r}`), t(" ou "), l(`x = -${s}`), t(".")],
          [t("Conclusion : "), l(`S = \\{-${s};${r}\\}`), t(".")],
        ],
        correction: [
          [t("CE de l'équation de départ : "), l("x > 0"), t(" (pour "), l("\\ln(x)"), t(") et "), l(`x + ${nn} > 0`), t(", donc "), l("x > 0"), t(" : "), l(`x = -${s}`), t(" est rejetée.")],
          [t("Vérification : "), l(`2\\ln(${r}) = \\ln(${r * r}) = \\ln(${r} + ${nn})`), t(", donc "), l(`S = \\{${r}\\}`), t(".")],
        ],
        valeurs: [{ genre: "ensemble", libelle: final, elements: [n(String(r), r)] }],
      };
    }
    case "B1": {
      const { d: den, n: k } = TABLE_B1[d.i!]!;
      const { p, s } = d as { p: number; s: number };
      const M = den ** k;
      const base = `\\log_{1/${den}}`;
      const gt = signe(s, ">");
      const lt = signe(s, "<");
      const P = n(String(p), p);
      const borne = n(String(p + M), p + M);
      return {
        copie: [
          [t("CE : "), l(`x - ${p} > 0`), t(", donc "), l(`x > ${p}`), t(".")],
          [l(`${base}(x - ${p}) ${gt} -${k} \\iff x - ${p} ${gt} \\left(\\frac{1}{${den}}\\right)^{-${k}} = ${M}`), t(".")],
          [l(`x ${gt} ${p + M}`), t(".")],
          [t("Avec la CE : "), l(`S = ${morceau(borne, null, s === 1, false).latex}`), t(".")],
        ],
        correction: [
          [t("La base "), l(`\\frac{1}{${den}}`), t(" est comprise entre 0 et 1 : "), l(base), t(" est décroissante et le sens s'inverse, "), l(`x - ${p} ${lt} ${M}`), t(".")],
          [l(`x ${lt} ${p + M}`), t(".")],
          [t("Avec la CE : "), l(`S = ${morceau(P, borne, false, s === 1).latex}`), t(".")],
        ],
        valeurs: [intervalle(final, "S =", [morceau(P, borne, false, s === 1)], [P, borne])],
      };
    }
    case "B2": {
      const { j, b, c, s } = d as { j: number; b: number; c: number; s: number };
      const base = `\\log_{${BASES_B2[j]}}`;
      const lt = signe(s, "<");
      const gt = signe(s, ">");
      const ce = rat(b, 2);
      const CE = nr(ce);
      const borne = n(String(b + c), b + c);
      const deux = affine(2, -b);
      return {
        copie: [
          [t("CE : "), l(`${deux} > 0`), t(" et "), l(`x + ${c} > 0`), t(", donc "), l(`x > ${CE.latex}`), t(".")],
          [l(`${base}(${deux}) ${lt} ${base}(x + ${c}) \\iff ${deux} ${lt} x + ${c}`), t(".")],
          [l(`x ${lt} ${b + c}`), t(".")],
          [t("Avec la CE : "), l(`S = ${morceau(CE, borne, false, s === 1).latex}`), t(".")],
        ],
        correction: [
          [t("La base "), l(BASES_B2[j]!), t(" est comprise entre 0 et 1 : "), l(base), t(" est décroissante et le sens s'inverse, "), l(`${deux} ${gt} x + ${c}`), t(".")],
          [l(`x ${gt} ${b + c}`), t(".")],
          [t("Avec la CE ("), l(`${b + c} > ${CE.latex}`), t(") : "), l(`S = ${morceau(borne, null, s === 1, false).latex}`), t(".")],
        ],
        valeurs: [intervalle(final, "S =", [morceau(borne, null, s === 1, false)], [borne])],
      };
    }
    case "P1": {
      const { m } = d as { m: number };
      const M = m * m;
      const copieX = ePuissance(rat(M, 2));
      const sols = [eP(-m), eP(m)];
      return {
        copie: [
          [t("CE : "), l("x > 0"), t(".")],
          [l("(\\ln(x))^2 = 2\\ln(x)"), t(", donc l'équation s'écrit "), l(`2\\ln(x) = ${M}`), t(".")],
          [l(`\\ln(x) = ${ratLatex(rat(M, 2))}`), t(", donc "), l(`x = ${copieX}`), t(".")],
          [t("Cette valeur vérifie la CE : "), l(`S = ${ensembleLatex([copieX])}`), t(".")],
        ],
        correction: [
          [l("(\\ln(x))^2"), t(" est le carré de "), l("\\ln(x)"), t(" : avec "), l("t = \\ln(x)"), t(", "), l(`t^2 = ${M}`), t(", donc "), l(`t = -${m}`), t(" ou "), l(`t = ${m}`), t(".")],
          [l(`\\ln(x) = -${m}`), t(" ou "), l(`\\ln(x) = ${m}`), t(", donc "), l(`x = ${sols[0]}`), t(" ou "), l(`x = ${sols[1]}`), t(", deux nombres strictement positifs.")],
          [l(`S = ${ensembleLatex(sols)}`)],
        ],
        valeurs: [{ genre: "ensemble", libelle: final, elements: [n(sols[0]!, Math.exp(-m)), n(sols[1]!, Math.exp(m))] }],
      };
    }
    case "P2": {
      const { k } = d as { k: number };
      const ek = eP(k);
      const copieV = `2${eP(-k)}`;
      const juste = `${2 * k}${eP(-k)}`;
      return {
        copie: [
          [t("Domaine : "), l("\\text{dom} f = \\mathopen{]}0;+\\infty\\mathclose{[}"), t(".")],
          [l("f(x) = (\\ln(x))^2 = 2\\ln(x)"), t(".")],
          [l("f'(x) = \\dfrac{2}{x}"), t(".")],
          [l(`f'(${ek}) = \\dfrac{2}{${ek}} = ${copieV}`)],
        ],
        correction: [
          [l("f(x) = (\\ln(x))^2"), t(" est le carré de "), l("u = \\ln(x)"), t(" : "), l("f'(x) = 2\\ln(x) \\cdot \\dfrac{1}{x} = \\dfrac{2\\ln(x)}{x}"), t(".")],
          [l(`f'(${ek}) = \\dfrac{2\\ln(${ek})}{${ek}} = \\dfrac{${2 * k}}{${ek}} = ${juste}`)],
        ],
        valeurs: [
          fonction("La dérivée corrigée :", "f'(x)", "\\dfrac{2\\ln(x)}{x}", (x) => (2 * Math.log(x)) / x, [0.4, 1.3, 2.5, 6]),
          { genre: "nombre", libelle: final, quantite: `f'(${ek}) =`, nombre: n(juste, 2 * k * Math.exp(-k)) },
        ],
      };
    }
    case "Q1": {
      const { a, q } = d as { a: number; q: number };
      const N = a ** q;
      const copieX = `${a} + ${eP(q)}`;
      return {
        copie: [
          [t("CE : "), l("x > 0"), t(".")],
          [l(`\\dfrac{\\ln(x)}{\\ln(${a})} = \\ln(x - ${a})`), t(", donc l'équation s'écrit "), l(`\\ln(x - ${a}) = ${q}`), t(".")],
          [l(`x - ${a} = ${eP(q)}`), t(", donc "), l(`x = ${copieX}`), t(".")],
          [t("Cette valeur vérifie la CE : "), l(`S = \\{${copieX}\\}`), t(".")],
        ],
        correction: [
          [t("Changement de base : "), l(`\\dfrac{\\ln(x)}{\\ln(${a})} = \\log_{${a}}(x)`), t(", donc l'équation s'écrit "), l(`\\log_{${a}}(x) = ${q}`), t(".")],
          [l(`x = ${a}^{${q}} = ${N}`), t(", qui vérifie la CE.")],
          [l(`S = \\{${N}\\}`)],
        ],
        valeurs: [{ genre: "ensemble", libelle: final, elements: [n(String(N), N)] }],
      };
    }
    case "Q2": {
      const { n: k } = d as { n: number };
      const X = 2 ** (k + 1);
      const Y = 2 ** k;
      const quotient = `\\dfrac{\\log_2(${X})}{\\log_2(${Y})}`;
      return {
        copie: [
          [l(`${quotient} = \\log_2(${X} - ${Y})`)],
          [l(`= \\log_2(${Y})`)],
          [l(`= ${k}`), t(", car "), l(`2^{${k}} = ${Y}`), t(".")],
        ],
        correction: [
          [l(`\\log_2(${X}) = ${k + 1}`), t(" et "), l(`\\log_2(${Y}) = ${k}`), t(", car "), l(`2^{${k + 1}} = ${X}`), t(" et "), l(`2^{${k}} = ${Y}`), t(".")],
          [l(`${quotient} = ${ratLatex(rat(k + 1, k))}`)],
        ],
        valeurs: [{ genre: "nombre", libelle: final, quantite: `${quotient} =`, nombre: nr(rat(k + 1, k)) }],
      };
    }
    case "V1": {
      const { c, x0 } = d as { c: number; x0: number };
      const D = x0 * x0 + c;
      return {
        copie: [
          [l(`x^2 + ${c} > 0`), t(" pour tout réel "), l("x"), t(" : "), l("\\text{dom} f = \\mathbb{R}"), t(".")],
          [l(`f'(x) = \\dfrac{1}{x^2 + ${c}}`), t(".")],
          [l(`f'(${x0}) = \\dfrac{1}{${parN(x0)}^2 + ${c}} = \\dfrac{1}{${D}}`)],
        ],
        correction: [
          [t("Avec "), l(`u(x) = x^2 + ${c}`), t(" et "), l("u'(x) = 2x"), t(" : "), l(`f'(x) = \\dfrac{u'(x)}{u(x)} = \\dfrac{2x}{x^2 + ${c}}`), t(".")],
          [l(`f'(${x0}) = \\dfrac{2 \\cdot ${parN(x0)}}{${parN(x0)}^2 + ${c}} = ${ratLatex(rat(2 * x0, D))}`)],
        ],
        valeurs: [
          fonction("La dérivée corrigée :", "f'(x)", `\\dfrac{2x}{x^2 + ${c}}`, (x) => (2 * x) / (x * x + c), [-2.5, -0.7, 0.4, 1.9]),
          { genre: "nombre", libelle: final, quantite: `f'(${x0}) =`, nombre: nr(rat(2 * x0, D)) },
        ],
      };
    }
    case "V2": {
      const { a, x0 } = d as { a: number; x0: number };
      const b = 1 - a * x0;
      const u = affine(a, b);
      const tangente = affine(a, -a * x0);
      const copieT = affine(1, -x0);
      return {
        copie: [
          [t("Domaine : "), l(`${u} > 0`), t(", donc "), l(`x > ${ratLatex(rat(-b, a))}`), t(".")],
          [l(`f'(x) = \\dfrac{1}{${u}}`), t(".")],
          [l(`f(${x0}) = \\ln(1) = 0`), t(" et "), l(`f'(${x0}) = \\dfrac{1}{1} = 1`), t(".")],
          [t("Tangente : "), l(`y = f'(${x0})(${affine(1, -x0)}) + f(${x0})`), t(", soit "), l(`y = ${copieT}`), t(".")],
        ],
        correction: [
          [t("Avec "), l(`u(x) = ${u}`), t(" et "), l(`u'(x) = ${a}`), t(" : "), l(`f'(x) = \\dfrac{u'(x)}{u(x)} = \\dfrac{${a}}{${u}}`), t(".")],
          [l(`f(${x0}) = \\ln(1) = 0`), t(" et "), l(`f'(${x0}) = \\dfrac{${a}}{1} = ${a}`), t(".")],
          [t("Tangente : "), l(`y = ${a}(${affine(1, -x0)})`), t(", soit "), l(`y = ${tangente}`), t(".")],
        ],
        valeurs: [
          fonction("La dérivée corrigée :", "f'(x)", `\\dfrac{${a}}{${u}}`, (x) => a / (a * x + b), [x0, x0 + 0.5, x0 + 1.3, x0 + 2.7]),
          fonction(final, "y", tangente, (x) => a * (x - x0), [-2, 0.5, 1.5, 3]),
        ],
      };
    }
    case "K1": {
      const [a, b] = TABLE_K1[d.i!]!;
      const copieX = `\\dfrac{\\ln(${a})}{\\ln(${b})}`;
      const juste = `\\dfrac{\\ln(${b})}{\\ln(${a})}`;
      return {
        copie: [
          [l(`${a}^x = ${b} \\iff x = \\log_{${a}}(${b})`), t(".")],
          [t("Changement de base : "), l(`\\log_{${a}}(${b}) = ${copieX}`), t(".")],
          [l(`S = ${ensembleLatex([copieX])}`)],
        ],
        correction: [
          [t("Changement de base : "), l(`\\log_{${a}}(${b}) = ${juste}`), t(" (le logarithme de l'argument au numérateur, celui de la base au dénominateur).")],
          [l(`S = ${ensembleLatex([juste])}`)],
        ],
        valeurs: [{ genre: "ensemble", libelle: final, elements: [n(juste, Math.log(b) / Math.log(a))] }],
      };
    }
    case "K2": {
      const { c, p, q } = TABLE_K2[d.i!]!;
      const B = c ** p;
      const A = c ** q;
      const lg = `\\log_{${B}}(${A})`;
      return {
        copie: [
          [t("Changement de base : "), l(`${lg} = \\dfrac{\\ln(${B})}{\\ln(${A})}`), t(".")],
          [l(`= \\dfrac{\\ln(${c}^{${p}})}{\\ln(${c}^{${q}})} = \\dfrac{${p}\\ln(${c})}{${q}\\ln(${c})}`)],
          [l(`= ${ratLatex(rat(p, q))}`)],
        ],
        correction: [
          [t("Changement de base : "), l(`${lg} = \\dfrac{\\ln(${A})}{\\ln(${B})}`), t(".")],
          [l(`${lg} = \\dfrac{${q}\\ln(${c})}{${p}\\ln(${c})} = ${ratLatex(rat(q, p))}`)],
        ],
        valeurs: [{ genre: "nombre", libelle: final, quantite: `${lg} =`, nombre: nr(rat(q, p)) }],
      };
    }
  }
}

export function copieEleve(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  return resoudre(e).copie;
}

/** Résolution juste à partir de la ligne fausse (la première ligne est la ligne corrigée). */
export function correction(e: ExerciceDetectiveLogarithmes): FragmentConsigne[][] {
  return resoudre(e).correction;
}

export function valeursAttendues(e: ExerciceDetectiveLogarithmes): ValeurLog[] {
  return resoudre(e).valeurs;
}

/** Une valeur exacte en LaTeX (sans son préfixe). */
export function latexValeur(v: ValeurLog): string {
  switch (v.genre) {
    case "nombre":
      return v.nombre.latex;
    case "fonction":
      return v.latex;
    case "ensemble":
      return ensembleLatex(v.elements.map((x) => x.latex));
    case "intervalle":
      return v.latex;
  }
}

/** Une valeur avec son préfixe (`S = \{4\}`, `f'(x) = …`, `x \in \mathopen{]}2;+\infty\mathclose{[}`). */
export function latexValeurComplete(v: ValeurLog): string {
  switch (v.genre) {
    case "nombre":
      return `${v.quantite} ${v.nombre.latex}`;
    case "fonction":
      return `${v.quantite} = ${v.latex}`;
    case "ensemble":
      return `S = ${latexValeur(v)}`;
    case "intervalle":
      return `${v.quantite} ${v.latex}`;
  }
}
