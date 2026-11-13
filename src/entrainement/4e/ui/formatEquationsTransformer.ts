import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import { latex, texte } from "../../export/fragmentsDocx";
import type { EcranEquationsTransformer, EquationBase, ExerciceEquationsTransformer, FonctionTrig, MembreAffine, ValeurK } from "../core/equationsTransformer.types";
import { candidats, ecransDe } from "../moteur/modeleEquationsTransformer";

/**
 * Textes de gen78 (« Équations trigonométriques à transformer ») — écran ET papier : une seule
 * source. Formules toujours en LaTeX (jamais « ^ », « sqrt », « * ») ; virgule décimale ; signe
 * moins typographique (KaTeX) ; aides = une phrase terminée par « : » puis la formule.
 */

export const CONSIGNE_GENERALE = "Résous cette équation trigonométrique.";
export const DOMAINE_LATEX = "\\left[0^\\circ \\,;\\, 360^\\circ\\right[";

const NOM: Record<FonctionTrig, string> = { sin: "\\sin", cos: "\\cos", tan: "\\tan" };

export function fonctionLatex(f: FonctionTrig): string {
  return `${NOM[f]}\\alpha`;
}

/** Nombre décimal en LaTeX : virgule décimale, jamais « -0 ». */
export function nombreLatex(x: number): string {
  const v = Math.round(x * 1000) / 1000;
  if (v === 0) return "0";
  return String(v).replace(".", "{,}");
}

/** Angle en degrés : « 30^\circ », « 156{,}4^\circ ». */
export function angleLatex(x: number): string {
  return `${nombreLatex(x)}^\\circ`;
}

/** Angle de référence tel qu'on l'écrit : exact (entier) ou arrondi au dixième. */
export function referenceAffichee(b: EquationBase): number {
  return b.k.decimal ? Math.round((b.reference ?? 0) * 10) / 10 : Math.round(b.reference ?? 0);
}

function radicalLatex(coef: number, racine: number): string {
  if (racine === 1) return `${coef}`;
  return coef === 1 ? `\\sqrt{${racine}}` : `${coef}\\sqrt{${racine}}`;
}

/** |k| en LaTeX. */
export function kAbsLatex(k: ValeurK): string {
  if (k.signe === 0) return "0";
  if (k.decimal) return nombreLatex((k.num * Math.sqrt(k.racine)) / k.den);
  const numerateur = radicalLatex(k.num, k.racine);
  return k.den === 1 ? numerateur : `\\frac{${numerateur}}{${k.den}}`;
}

export function kLatex(k: ValeurK): string {
  return k.signe === -1 ? `-${kAbsLatex(k)}` : kAbsLatex(k);
}

/** Équation de base « \sin\alpha = -\frac{1}{2} ». */
export function baseLatex(b: EquationBase): string {
  return `${fonctionLatex(b.fonction)} = ${kLatex(b.k)}`;
}

/** Valeur rationnelle num/den en LaTeX (décimale si `decimal`). */
function rationnelLatex(num: number, den: number, decimal: boolean): string {
  if (decimal) return nombreLatex(num / den);
  const abs = den === 1 ? `${Math.abs(num)}` : `\\frac{${Math.abs(num)}}{${den}}`;
  return num < 0 ? `-${abs}` : abs;
}

/** « 2\sin\alpha », « -\cos\alpha », « 4\sin^2\alpha ». */
function termeFonction(m: MembreAffine, carre: boolean): string {
  const f = carre ? `${NOM[m.fonction]}^2\\alpha` : fonctionLatex(m.fonction);
  if (m.a === 1) return f;
  if (m.a === -1) return `-${f}`;
  return `${m.a}${f}`;
}

/** Terme constant b signé : « + 3 », « - \sqrt{3} », « + 2\sqrt{2} » (vide si b = 0). */
function termeConstant(m: MembreAffine): string {
  if (m.bRacineCoef !== 0) {
    const c = Math.abs(m.bRacineCoef);
    return ` ${m.bRacineCoef < 0 ? "-" : "+"} ${radicalLatex(c, m.bRacine)}`;
  }
  if (m.bEntier === 0) return "";
  return ` ${m.bEntier < 0 ? "-" : "+"} ${Math.abs(m.bEntier)}`;
}

/** −b (« \sqrt{3} », « -3 »). */
function moinsBLatex(m: MembreAffine): string {
  if (m.bRacineCoef !== 0) return `${m.bRacineCoef > 0 ? "-" : ""}${radicalLatex(Math.abs(m.bRacineCoef), m.bRacine)}`;
  return `${-m.bEntier}`;
}

/** c − b NON calculé (aide : il reste le calcul à faire) — « 1 - 3 », « 2 + 1 », ou −b si c = 0. */
function cMoinsBLatex(m: MembreAffine): string {
  if (m.c === 0) return moinsBLatex(m);
  if (m.bRacineCoef === 0 && m.bEntier === 0) return `${m.c}`;
  const b = m.bRacineCoef !== 0 ? radicalLatex(Math.abs(m.bRacineCoef), m.bRacine) : `${Math.abs(m.bEntier)}`;
  const bNegatif = m.bRacineCoef !== 0 ? m.bRacineCoef < 0 : m.bEntier < 0;
  return `${m.c} ${bNegatif ? "+" : "-"} ${b}`;
}

/** Facteur « (2\cos\alpha - 1) » du produit. */
function facteurAffineLatex(m: MembreAffine): string {
  return `\\left(${termeFonction(m, false)}${termeConstant(m)}\\right)`;
}

/** L'équation de départ. */
export function enonceLatex(e: ExerciceEquationsTransformer): string {
  const f = e.forme;
  if (f.type === "affine") return `${termeFonction(f.membre, false)}${termeConstant(f.membre)} = ${f.membre.c}`;
  if (f.type === "carre") {
    if (f.nue) return `${NOM[f.membre.fonction]}^2\\alpha = ${rationnelLatex(f.carreNum, f.carreDen, f.carreDecimal)}`;
    return `${termeFonction(f.membre, true)}${termeConstant(f.membre)} = ${f.membre.c}`;
  }
  const nu = fonctionLatex(f.nu);
  const af = facteurAffineLatex(f.affine);
  return f.nuEnPremier ? `${nu} \\cdot ${af} = 0` : `${af} \\cdot ${nu} = 0`;
}

/** Valeur de f²(α) (carré) en LaTeX. */
export function carreLatex(e: ExerciceEquationsTransformer): string {
  if (e.forme.type !== "carre") return "";
  return rationnelLatex(e.forme.carreNum, e.forme.carreDen, e.forme.carreDecimal);
}

/** Ensemble « S = \{30^\circ \,;\, 150^\circ\} » ou « S = \varnothing ». */
export function ensembleLatex(solutions: number[]): string {
  if (solutions.length === 0) return "S = \\varnothing";
  return `S = \\left\\{${solutions.map(angleLatex).join(" \\,;\\, ")}\\right\\}`;
}

export function precisionTexte(e: ExerciceEquationsTransformer): string {
  return e.calculatrice ? " Donne les angles au dixième de degré." : "";
}

// ---------------------------------------------------------------------------------------------
// Écrans : titres et consignes
// ---------------------------------------------------------------------------------------------

function numeroBase(e: ExerciceEquationsTransformer, i: number): string {
  return e.bases.length > 1 ? ` (équation ${i + 1})` : "";
}

export function titreEcran(e: ExerciceEquationsTransformer, ecran: EcranEquationsTransformer): string {
  switch (ecran.type) {
    case "bases":
      return e.bases.length > 1 || e.forme.type !== "affine" ? "Équations de base" : "Équation de base";
    case "reference":
      return `Angle de référence${numeroBase(e, ecran.base)}`;
    case "solutions":
      return `Solutions${numeroBase(e, ecran.base)}`;
    case "ensemble":
      return "Ensemble des solutions";
  }
}

export function consigneEcran(e: ExerciceEquationsTransformer, ecran: EcranEquationsTransformer): FragmentConsigne[] {
  switch (ecran.type) {
    case "bases":
      if (e.forme.type === "affine") return [texte("Isole "), latex(fonctionLatex(e.forme.membre.fonction)), texte(" : quelle est l'équation de base ? (valeur exacte)")];
      if (e.forme.type === "carre") return [texte("Ramène l'équation à une ou plusieurs équations de base de la forme "), latex(`${fonctionLatex(e.forme.membre.fonction)} = k`), texte(", ou conclus qu'il n'y a pas de solution.")];
      return [texte("Un produit est nul si l'un de ses facteurs est nul : écris les deux équations de base (valeurs exactes).")];
    case "reference": {
      const b = e.bases[ecran.base]!;
      return [
        texte("L'équation "),
        latex(baseLatex(b)),
        texte(" a-t-elle des solutions ? Si oui, donne son angle de référence "),
        latex("\\alpha_0"),
        texte(` (entre 0° et 90°${b.k.decimal ? ", au dixième de degré" : ""}).`),
      ];
    }
    case "solutions": {
      const b = e.bases[ecran.base]!;
      return [texte("Donne toutes les solutions de "), latex(baseLatex(b)), texte(" dans "), latex(DOMAINE_LATEX), texte(b.k.decimal ? " (au dixième de degré)." : ".")];
    }
    case "ensemble":
      return [texte("Donne toutes les solutions de l'équation de départ dans "), latex(DOMAINE_LATEX), texte(".")];
  }
}

export function consignesEcrans(e: ExerciceEquationsTransformer): FragmentConsigne[][] {
  return ecransDe(e).map((ecran) => consigneEcran(e, ecran));
}

// ---------------------------------------------------------------------------------------------
// Aides (jamais la réponse finale : il reste toujours un calcul ou une lecture à faire)
// ---------------------------------------------------------------------------------------------

/** Règle des deux solutions, selon la fonction et le signe de k (méthode du cours). */
export function regleSolutions(b: EquationBase): FragmentConsigne[] {
  const positif = b.k.signe >= 0;
  const ou = " \\quad\\text{ou}\\quad ";
  switch (b.fonction) {
    case "sin":
      return positif
        ? [texte("sin α est positif ou nul dans les quadrants I et II ; la seconde solution est symétrique de la première par rapport à l'axe vertical : "), latex(`\\alpha = \\alpha_0${ou}\\alpha = 180^\\circ - \\alpha_0`)]
        : [texte("sin α est négatif dans les quadrants III et IV : "), latex(`\\alpha = 180^\\circ + \\alpha_0${ou}\\alpha = 360^\\circ - \\alpha_0`)];
    case "cos":
      return positif
        ? [texte("cos α est positif ou nul dans les quadrants I et IV ; les deux solutions sont symétriques par rapport à l'axe horizontal : "), latex(`\\alpha = \\alpha_0${ou}\\alpha = 360^\\circ - \\alpha_0`)]
        : [texte("cos α est négatif dans les quadrants II et III : "), latex(`\\alpha = 180^\\circ - \\alpha_0${ou}\\alpha = 180^\\circ + \\alpha_0`)];
    case "tan":
      return positif
        ? [texte("tan α est positive ou nulle dans les quadrants I et III ; la tangente a une période de 180° : "), latex(`\\alpha = \\alpha_0${ou}\\alpha = 180^\\circ + \\alpha_0`)]
        : [texte("tan α est négative dans les quadrants II et IV ; la tangente a une période de 180° : "), latex(`\\alpha = 180^\\circ - \\alpha_0${ou}\\alpha = 360^\\circ - \\alpha_0`)];
  }
}

function inverseLatex(f: FonctionTrig): string {
  return `${NOM[f]}^{-1}`;
}

export function aidesEcran(e: ExerciceEquationsTransformer, ecran: EcranEquationsTransformer): FragmentConsigne[][] {
  switch (ecran.type) {
    case "bases": {
      const f = e.forme;
      if (f.type === "affine") {
        const m = f.membre;
        const aides: FragmentConsigne[][] = [[texte("Fais passer le terme constant dans l'autre membre : "), latex(`${termeFonction(m, false)} = ${cMoinsBLatex(m)}`)]];
        if (m.a !== 1) aides.push([texte(`Divise ensuite les deux membres par le coefficient de ${m.fonction} α, puis simplifie :`), latex(`a\\,${fonctionLatex(m.fonction)} = d \\iff ${fonctionLatex(m.fonction)} = \\dfrac{d}{a}`)]);
        return aides;
      }
      if (f.type === "carre") {
        const m = f.membre;
        const nom = fonctionLatex(m.fonction);
        const aides: FragmentConsigne[][] = [];
        if (!f.nue) aides.push([texte("Isole d'abord le carré : "), latex(m.a === 1 ? `${NOM[m.fonction]}^2\\alpha = ${cMoinsBLatex(m)}` : `${NOM[m.fonction]}^2\\alpha = \\dfrac{${cMoinsBLatex(m)}}{${m.a}}`)]);
        aides.push([texte("Un carré n'est jamais négatif. Si le carré vaut un nombre k positif ou nul, il y a deux racines opposées : "), latex(`${NOM[m.fonction]}^2\\alpha = k \\iff ${nom} = \\sqrt{k} \\quad\\text{ou}\\quad ${nom} = -\\sqrt{k}`)]);
        return aides;
      }
      const m = f.affine;
      return [
        [texte("Un produit est nul si et seulement si l'un de ses facteurs est nul : "), latex("A \\cdot B = 0 \\iff A = 0 \\quad\\text{ou}\\quad B = 0")],
        [texte("Pour le facteur avec le terme constant, fais passer ce terme dans l'autre membre : "), latex(`${termeFonction(m, false)} = ${moinsBLatex(m)}`)],
      ];
    }
    case "reference": {
      const b = e.bases[ecran.base]!;
      const borne: FragmentConsigne[] =
        b.fonction === "tan"
          ? [texte("La tangente prend toutes les valeurs réelles : pour tout nombre k, l'équation tan α = k a des solutions. Rappel de l'encadrement du sinus et du cosinus : "), latex("-1 \\le \\sin\\alpha \\le 1 \\qquad -1 \\le \\cos\\alpha \\le 1")]
          : [texte(`Pour tout angle α, ${b.fonction} α est compris entre −1 et 1 :`), latex(`-1 \\le ${fonctionLatex(b.fonction)} \\le 1`)];
      const abs = `\\left|${kLatex(b.k)}\\right|`;
      const reference: FragmentConsigne[] = b.k.decimal
        ? [texte("Si l'équation a des solutions, son angle de référence se lit à la calculatrice (en mode degrés) : "), latex(`\\alpha_0 = ${inverseLatex(b.fonction)}\\left(${abs}\\right)`)]
        : [texte("Si l'équation a des solutions, cherche dans la table des valeurs remarquables l'angle α₀ du premier quadrant tel que : "), latex(`${NOM[b.fonction]}\\,\\alpha_0 = ${abs}`)];
      return [borne, reference];
    }
    case "solutions":
      return [regleSolutions(e.bases[ecran.base]!)];
    case "ensemble":
      return [[texte("Réunis les solutions trouvées pour chaque équation de base, sans écrire deux fois la même : "), latex("S = S_1 \\cup S_2")]];
  }
}

/** Réponse attendue d'un écran (validation, historique) : texte et formules séparés. */
export function reponseAttendueFragments(e: ExerciceEquationsTransformer, ecran: EcranEquationsTransformer): FragmentConsigne[] {
  const avecOu = (formules: string[]): FragmentConsigne[] => formules.flatMap((f, i) => (i === 0 ? [latex(f)] : [texte(" ou "), latex(f)]));
  switch (ecran.type) {
    case "bases":
      if (e.bases.length === 0) return [texte("Pas de solution : un carré n'est jamais négatif.")];
      return avecOu(e.bases.map(baseLatex));
    case "reference": {
      const b = e.bases[ecran.base]!;
      if (b.reference === null) return [texte("Pas de solution : "), latex(`\\left|${kLatex(b.k)}\\right| > 1`)];
      return [latex(`\\alpha_0 ${b.k.decimal ? "\\approx" : "="} ${angleLatex(referenceAffichee(b))}`)];
    }
    case "solutions":
      return avecOu(e.bases[ecran.base]!.solutions.map((s) => `\\alpha = ${angleLatex(s)}`));
    case "ensemble":
      return [latex(ensembleLatex(e.solutions))];
  }
}

// ---------------------------------------------------------------------------------------------
// Corrigé (papier) : chaînes de calcul
// ---------------------------------------------------------------------------------------------

/** a·k = c − b calculé (« 1 », « \sqrt{3} », « -2\sqrt{2} »). */
function cMoinsBCalculeLatex(m: MembreAffine): string {
  if (m.bRacineCoef !== 0) return moinsBLatex(m);
  return `${m.c - m.bEntier}`;
}

/** Forme affine : « 2\sin\alpha - 1 = 0 \iff 2\sin\alpha = 1 \iff \sin\alpha = \frac{1}{2} ». */
export function chaineIsolementLatex(m: MembreAffine, k: ValeurK): string {
  const depart = `${termeFonction(m, false)}${termeConstant(m)} = ${m.c}`;
  const etapes = [depart];
  if (termeConstant(m) !== "") etapes.push(`${termeFonction(m, false)} = ${cMoinsBCalculeLatex(m)}`);
  if (m.a !== 1) etapes.push(`${fonctionLatex(m.fonction)} = ${kLatex(k)}`);
  return etapes.join(" \\iff ");
}

/** Forme carré : « 4\sin^2\alpha - 3 = 0 \iff \sin^2\alpha = \frac{3}{4} ». */
export function chaineCarreLatex(e: ExerciceEquationsTransformer): string {
  if (e.forme.type !== "carre") return "";
  const f = e.forme;
  const carre = `${NOM[f.membre.fonction]}^2\\alpha = ${carreLatex(e)}`;
  if (f.nue) return carre;
  const m = f.membre;
  const etapes = [`${termeFonction(m, true)}${termeConstant(m)} = ${m.c}`];
  if (termeConstant(m) !== "") etapes.push(`${termeFonction(m, true)} = ${cMoinsBCalculeLatex(m)}`);
  if (m.a !== 1) etapes.push(carre);
  return etapes.join(" \\iff ");
}

/** Facteur affine du produit égalé à 0, isolé : « 2\cos\alpha - 1 = 0 \iff \cos\alpha = \frac{1}{2} ». */
export function chaineFacteurLatex(m: MembreAffine, k: ValeurK): string {
  return chaineIsolementLatex(m, k);
}

/** Expression de chaque candidat en fonction de α₀ (même ordre que `candidats`). */
function expressionsCandidats(b: EquationBase): [string, string] {
  const positif = b.k.signe >= 0;
  switch (b.fonction) {
    case "sin":
      return positif ? ["", "180^\\circ - "] : ["180^\\circ + ", "360^\\circ - "];
    case "cos":
      return positif ? ["", "360^\\circ - "] : ["180^\\circ - ", "180^\\circ + "];
    case "tan":
      return positif ? ["", "180^\\circ + "] : ["180^\\circ - ", "360^\\circ - "];
  }
}

/** Calcul des solutions d'une base : « \alpha = 30^\circ \text{ ou } \alpha = 180^\circ - 30^\circ = 150^\circ ». */
export function calculSolutionsLatex(b: EquationBase): string {
  const ref = angleLatex(referenceAffichee(b));
  const egal = b.k.decimal ? "\\approx" : "=";
  const exprs = expressionsCandidats(b);
  const arrondi = (x: number) => {
    const r = b.k.decimal ? Math.round(x * 10) / 10 : Math.round(x);
    return r >= 360 ? 0 : r;
  };
  const valeurs = candidats(b.fonction, b.reference ?? 0, b.k.signe >= 0).map(arrondi);
  if (valeurs[0] === valeurs[1]) {
    return `\\alpha ${egal} ${angleLatex(valeurs[0]!)}`;
  }
  return exprs
    .map((prefixe, i) => (prefixe === "" ? `\\alpha ${egal} ${ref}` : `\\alpha = ${prefixe}${ref} ${egal} ${angleLatex(valeurs[i]!)}`))
    .join(" \\quad\\text{ou}\\quad ");
}
