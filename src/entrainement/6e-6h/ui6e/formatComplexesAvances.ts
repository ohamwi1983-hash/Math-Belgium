import type { AffixeSimple, ExerciceComplexesA, ExerciceComplexesAvances, ExerciceComplexesB, ExerciceComplexesBSimple, ExerciceComplexesC, ExerciceComplexesD, ExerciceComplexesDReelles, ExerciceComplexesE, NatureLieu } from "../core6e/complexesAvances.types";
import type { PhaseComplexesAvances } from "../moteur6e/typesComplexesAvances";
import { calculerArgument } from "../generateurs6e/formeTrigonometrique/familleA";
import { racineRationnelleLatex } from "../generateurs6e/complexesAvances/racineRationnelle";
import { pgcd } from "../generateurs6e/calculPrimitives/aleatoire";
import { ratioE, solutionsDModules } from "../moteur6e/verificationComplexesAvances";

/**
 * Couche ui (6e) — textes de consigne/aide + formatage LaTeX pour `6gen42`. Dispatch sur
 * `exercice.famille` PUIS `phase`, mirroir `formatFormeTrigonometrique.ts`/`formatTransformationsPlan.ts`
 * — jamais importé par un autre générateur (chaque générateur reste indépendant, CLAUDE.md).
 *
 * `calculerArgument` (`generateurs6e/formeTrigonometrique/familleA.ts`) réutilisé ICI (couche `ui6e/`
 * libre d'importer `generateurs6e/`, CLAUDE.md) UNIQUEMENT pour l'AFFICHAGE du récapitulatif famille
 * E (jamais côté `moteur6e/verificationComplexesAvances.ts`, qui reste `Math.atan2` brut — voir son
 * en-tête pour la justification de cette séparation stricte).
 *
 * **Vigilance signe orphelin / groupe LaTeX vide** (bug déjà rencontré et corrigé sur 6gen23/26/34/
 * 37/40, CLAUDE.md) — `affixeLatex`/`affixeLatexRationnel` ci-dessous sont les SEULES fonctions qui
 * assemblent un "a+bi" — assemblent TOUJOURS signe+magnitude ENSEMBLE, jamais un signe bare.
 * Couverture de régression : `formatComplexesAvances.test.ts`, "signe orphelin" — scanne le LaTeX
 * rendu sur de nombreux tirages aléatoires des 5 familles.
 */

/** Texte brut mêlé à du LaTeX inline court — même contrat que `ui/formatEquationDroite.ts`/
 * `ui6e/formatProprietesLogarithme.ts` (dupliqué ici à dessein, convention CLAUDE.md : un type aussi
 * petit ne justifie pas un module partagé) ; rendu via `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}
function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export type TypeChamp = "texte";

export interface ChampDef {
  type: TypeChamp;
  label: string;
  placeholder?: string;
}

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

export interface OptionQcm {
  id: string;
  /** Texte brut (historique des écrans, lecteurs d'écran). */
  label: string;
  /** Rendu KaTeX de l'option, prioritaire sur `label` à l'écran quand présent. */
  latex?: string;
}

const AUCUNE_AIDE: AideAvecLatex = { texte: "", latex: null };

/** Saisie illisible (parse_error) : message de syntaxe, AUCUNE tentative décomptée (audit 6e ch. 5). */
export const MESSAGE_SAISIE_ILLISIBLE = "Écriture non reconnue — vérifie ta saisie (parenthèses, opérateurs, virgule décimale). Aucune tentative n'est décomptée.";

// ============================================================================
// Assemblage "a+bi" — entier (affixeLatex) ou rationnel quelconque (affixeLatexRationnel).
// ============================================================================

export function affixeLatex(z: AffixeSimple): string {
  const { a, b } = z;
  if (a === 0 && b === 0) return "0";
  const aTexte = a === 0 ? "" : `${a}`;
  if (b === 0) return aTexte;
  const bSigne = b < 0 ? "-" : "+";
  const bMagnitude = Math.abs(b) === 1 ? "" : `${Math.abs(b)}`;
  if (a === 0) return `${b < 0 ? "-" : ""}${bMagnitude}i`;
  return `${aTexte}${bSigne}${bMagnitude}i`;
}

/** `x` (nombre décimal EXACTEMENT rationnel, dénominateur ≤12 — garanti par construction, voir
 * `generateurs6e/complexesAvances/familleB.ts`) → LaTeX fraction irréductible. */
function latexRationnel(x: number): string {
  if (Math.abs(x) < 1e-9) return "0";
  // Jusqu'à 200 : un rapport de 2 entiers de Gauss (famille E) peut avoir un dénominateur 32.
  for (let den = 1; den <= 200; den++) {
    const num = x * den;
    if (Math.abs(num - Math.round(num)) < 1e-6) {
      let n = Math.round(num);
      let d = den;
      let g = Math.abs(n);
      let b = d;
      while (b !== 0) [g, b] = [b, g % b];
      g = g || 1;
      n /= g;
      d /= g;
      if (d === 1) return `${n}`;
      return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`;
    }
  }
  /* c8 ignore next */
  return x.toFixed(4); // safety net — jamais atteint par construction (voir en-tête de fichier).
}

export function affixeLatexRationnel(a: number, b: number): string {
  if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) return "0";
  const aPart = Math.abs(a) < 1e-9 ? "" : latexRationnel(a);
  if (Math.abs(b) < 1e-9) return aPart;
  const bAbsLatex = latexRationnel(Math.abs(b));
  const bPart = bAbsLatex === "1" ? "i" : `${bAbsLatex}i`;
  const sign = b < 0 ? "-" : aPart === "" ? "" : "+";
  return `${aPart}${sign}${bPart}`;
}

// ============================================================================
// Petits formateurs LaTeX (équations attendues, audit 6e ch. 5 : plus de « équation en x,y »).
// ============================================================================

/** Fraction irréductible num/den (entiers, den > 0). */
function fractionLatex(num: number, den: number): string {
  if (num === 0) return "0";
  const g = pgcd(Math.abs(num), Math.abs(den)) || 1;
  const n = num / g;
  const d = den / g;
  if (d === 1) return `${n}`;
  return n < 0 ? `-\\frac{${-n}}{${d}}` : `\\frac{${n}}{${d}}`;
}

/** Somme de termes coef·variable (coefficients entiers), signes collés, coefficient 1 omis. */
function lineaire(termes: [number, string][]): string {
  let s = "";
  for (const [c, v] of termes) {
    if (c === 0) continue;
    const abs = Math.abs(c);
    const corps = v === "" ? `${abs}` : abs === 1 ? v : `${abs}${v}`;
    if (s === "") s = c < 0 ? `-${corps}` : corps;
    else s += c < 0 ? `-${corps}` : `+${corps}`;
  }
  return s === "" ? "0" : s;
}

/** c1·m + c0, écrit « 2−m » plutôt que « −m+2 ». */
function lineaireConstanteDabord(c1: number, variable: string, c0: number): string {
  return c1 < 0 && c0 > 0 ? lineaire([[c0, ""], [c1, variable]]) : lineaire([[c1, variable], [c0, ""]]);
}

/** « x−v » (v rationnel), « x » si v=0. */
function decale(variable: string, v: number): string {
  if (Math.abs(v) < 1e-12) return variable;
  return `${variable}${v > 0 ? "-" : "+"}${latexRationnel(Math.abs(v))}`;
}

function carreDecale(variable: string, v: number): string {
  if (Math.abs(v) < 1e-12) return `${variable}^2`;
  return `\\left(${decale(variable, v)}\\right)^2`;
}

/** Équation « ax+by+c=0 » de la droite (P1P2), coefficients entiers réduits, premier positif. */
function equationDroite(p1: AffixeSimple, p2: AffixeSimple): string {
  let a = p2.b - p1.b;
  let b = -(p2.a - p1.a);
  let c = -a * p1.a - b * p1.b;
  const g = pgcd(pgcd(Math.abs(a), Math.abs(b)), Math.abs(c)) || 1;
  a /= g;
  b /= g;
  c /= g;
  if (a < 0 || (a === 0 && b < 0)) {
    a = -a;
    b = -b;
    c = -c;
  }
  return `${lineaire([
    [a, "x"],
    [b, "y"],
    [c, ""],
  ])}=0`;
}

const TANGENTES: [number, string][] = [
  [0, "0"],
  [1 / Math.sqrt(3), "\\frac{\\sqrt{3}}{3}"],
  [1, "1"],
  [Math.sqrt(3), "\\sqrt{3}"],
];

/** Droite passant par a, de direction θ (angle remarquable). */
function equationDroiteDirection(a: AffixeSimple, theta: number): string {
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  if (Math.abs(s) < 1e-9) return `y=${a.b}`;
  if (Math.abs(c) < 1e-9) return `x=${a.a}`;
  const t = s / c;
  const trouve = TANGENTES.find(([v]) => Math.abs(Math.abs(t) - v) < 1e-9);
  const tAbs = trouve ? trouve[1] : Math.abs(t).toFixed(2).replace(".", "{,}");
  const facteur = decale("x", a.a);
  const gauche = decale("y", a.b);
  if (tAbs === "1") return `${gauche}=${t < 0 ? (facteur === "x" ? "-x" : `-\\left(${facteur}\\right)`) : facteur}`;
  const droite = facteur === "x" ? `${tAbs}\\,x` : `${tAbs}\\left(${facteur}\\right)`;
  return `${gauche}=${t < 0 ? "-" : ""}${droite}`;
}

/** −(coef)·variable, coef complexe entier : « −(2+i)z », « −3z », « +2iz ». */
function moinsCoefVariable(coef: AffixeSimple, variable: string): string {
  if (coef.a === 0 && coef.b === 0) return "";
  if (coef.b === 0) return lineaire([[-coef.a, variable]]).replace(/^(?!-)/, "+");
  if (coef.a === 0) {
    const abs = Math.abs(coef.b) === 1 ? "i" : `${Math.abs(coef.b)}i`;
    return `${coef.b > 0 ? "-" : "+"}${abs}${variable}`;
  }
  return `-\\left(${affixeLatex(coef)}\\right)${variable}`;
}

function tableauLignes(lignes: string[]): string {
  return lignes.length === 1 ? lignes[0] : `\\begin{array}{l}${lignes.join("\\\\ ")}\\end{array}`;
}

// ============================================================================
// Famille A.
// ============================================================================

export function consigneGeneraleA(e: ExerciceComplexesA): FragmentConsigne[] {
  void e;
  return [
    latex("z=a+bi"),
    texte(" est un nombre complexe non nul (a et b réels), d'argument "),
    latex("\\theta"),
    texte(". On cherche la condition sur a et b pour que "),
    latex("z^n"),
    texte(" soit un réel strictement supérieur à k (n et k sont donnés ci-dessous)."),
  ];
}

export function blocDonneesA(e: ExerciceComplexesA): string[] {
  return [`z=a+bi\\quad n=${e.n}\\quad k=${e.k}`];
}

export function consigneEcranA(phase: PhaseComplexesAvances): FragmentConsigne[] {
  if (phase === "aEcran1") return [texte("Quelle condition sur θ garantit que "), latex("z^n"), texte(" est un réel strictement positif, et pas seulement un réel ? (une seule tentative)")];
  if (phase === "aEcran2") return [texte("Traduis la condition confirmée sur θ en une condition sur a et b. (une seule tentative)")];
  return [texte("Ajoute la condition sur le module pour que "), latex("z^n"), texte(" dépasse strictement k : quelle est la condition complète ? (une seule tentative)")];
}

const SQRT3 = "\\sqrt{3}\\,a";

function lignesConditionAB(n: 3 | 4): string[] {
  if (n === 4) return ["a=0\\ \\text{ou}\\ b=0"];
  return ["(b=0\\text{ et }a>0)", `\\text{ou }(b=${SQRT3}\\text{ et }a<0)`, `\\text{ou }(b=-${SQRT3}\\text{ et }a<0)`];
}

const TEXTE_CONDITION_AB: Record<3 | 4, string> = {
  4: "a = 0 ou b = 0",
  3: "(b = 0 et a > 0) ou (b = √3·a et a < 0) ou (b = −√3·a et a < 0)",
};

function seuilLatex(e: ExerciceComplexesA): string {
  return `\\sqrt[${e.n}]{${e.k}}`;
}

export function optionsEcran1A(n: 3 | 4): OptionQcm[] {
  return [
    { id: "correct", label: `${n}θ ≡ 0 (mod 2π)`, latex: `${n}\\theta\\equiv 0\\pmod{2\\pi}` },
    { id: "trapReel", label: `${n}θ ≡ 0 (mod π)`, latex: `${n}\\theta\\equiv 0\\pmod{\\pi}` },
    { id: "distrSansN", label: "θ ≡ 0 (mod 2π)", latex: "\\theta\\equiv 0\\pmod{2\\pi}" },
    { id: "distrNegatif", label: `${n}θ ≡ π (mod 2π)`, latex: `${n}\\theta\\equiv \\pi\\pmod{2\\pi}` },
  ];
}

export function optionsEcran2A(n: 3 | 4): OptionQcm[] {
  if (n === 4) {
    return [
      { id: "correct", label: TEXTE_CONDITION_AB[4], latex: tableauLignes(lignesConditionAB(4)) },
      { id: "trapReel", label: "a = b ou a = −b", latex: "a=b\\ \\text{ou}\\ a=-b" },
      { id: "distr1", label: "a ≠ 0 et b ≠ 0", latex: "a\\neq 0\\ \\text{et}\\ b\\neq 0" },
      { id: "distr2", label: "a = 0 et b = 0", latex: "a=0\\ \\text{et}\\ b=0" },
    ];
  }
  return [
    { id: "correct", label: TEXTE_CONDITION_AB[3], latex: tableauLignes(lignesConditionAB(3)) },
    { id: "trapReel", label: "b = 0 ou b = √3·a ou b = −√3·a", latex: `b=0\\ \\text{ou}\\ b=${SQRT3}\\ \\text{ou}\\ b=-${SQRT3}` },
    { id: "distr1", label: "b = 0 et a > 0", latex: "b=0\\ \\text{et}\\ a>0" },
    { id: "distr2", label: "(b = 0 et a < 0) ou (b = √3·a et a > 0) ou (b = −√3·a et a > 0)", latex: tableauLignes(["(b=0\\text{ et }a<0)", `\\text{ou }(b=${SQRT3}\\text{ et }a>0)`, `\\text{ou }(b=-${SQRT3}\\text{ et }a>0)`]) },
  ];
}

function lignesConditionComplete(e: ExerciceComplexesA, comparaison: string): string[] {
  const cab = lignesConditionAB(e.n);
  const cabEntoure = cab.length === 1 ? [`(${cab[0]})`] : cab;
  return [...cabEntoure, `\\text{et }\\sqrt{a^2+b^2}${comparaison}`];
}

export function optionsEcran3A(e: ExerciceComplexesA): OptionQcm[] {
  const seuil = seuilLatex(e);
  const cab = TEXTE_CONDITION_AB[e.n];
  return [
    { id: "correct", label: `${cab}, et |z| > racine ${e.n}-ième de ${e.k}`, latex: tableauLignes(lignesConditionComplete(e, `>${seuil}`)) },
    { id: "distr1", label: `${cab}, et |z| < racine ${e.n}-ième de ${e.k}`, latex: tableauLignes(lignesConditionComplete(e, `<${seuil}`)) },
    { id: "distr2", label: `|z| > racine ${e.n}-ième de ${e.k}`, latex: `\\sqrt{a^2+b^2}>${seuil}` },
    { id: "distr3", label: `${cab}, et |z| > ${e.k}`, latex: tableauLignes(lignesConditionComplete(e, `>${e.k}`)) },
  ];
}

export function etatActuelA(phase: PhaseComplexesAvances): string[] | null {
  const conditionThetaConfirmee = "\\text{Condition sur }\\theta\\text{ confirmée}";
  if (phase === "aEcran2") return [conditionThetaConfirmee];
  if (phase === "aEcran3") return [conditionThetaConfirmee, "\\text{Condition sur }a\\text{ et }b\\text{ confirmée}"];
  return null;
}

export function niveauAideMaxA(phase: PhaseComplexesAvances): number {
  return phase === "aEcran1" ? 2 : 0;
}
export function aideNiveau1A(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return { texte: "L'argument de zⁿ est nθ. Un réel strictement positif a pour argument 0 (à 2π près), un réel strictement négatif a pour argument π.", latex: "\\arg\\left(z^n\\right)\\equiv n\\,\\arg z\\pmod{2\\pi}" };
}
export function aideNiveau2A(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "aEcran1") return AUCUNE_AIDE;
  return { texte: "zⁿ est réel lorsque nθ est un multiple de π — mais un multiple sur deux donne un réel négatif :", latex: "z^n\\in\\mathbb{R}\\iff n\\theta\\equiv 0\\pmod{\\pi}" };
}

// ============================================================================
// Famille B.
// ============================================================================

/** Condition des demi-droites : (z−a)+conj(z−a) = c|z−a| ou (z−a)−conj(z−a) = c·i·|z−a| (a = 0 :
 * z+z̄ = c|z|). `c` : symbole ou valeur LaTeX. */
function conditionDemiDroites(e: ExerciceComplexesBSimple, c: string): string {
  const origineO = e.p1.a === 0 && e.p1.b === 0;
  const w = origineO ? "z" : "(z-a)";
  const wb = origineO ? "\\bar z" : "\\overline{(z-a)}";
  const module = origineO ? "|z|" : "|z-a|";
  return e.forme === "imaginaire" ? `${w}-${wb}=${c}\\,i\\,${module}` : `${w}+${wb}=${c}\\,${module}`;
}

function angleTheta(e: ExerciceComplexesBSimple): string {
  return e.theta?.latex ?? "0";
}

export function consigneGeneraleB(e: ExerciceComplexesB): FragmentConsigne[] {
  if (e.sousType === "intersection") {
    return [
      texte("M est un point d'affixe "),
      latex("z=x+yi"),
      texte(" qui vérifie simultanément deux conditions : (1) "),
      latex("\\dfrac{z-q_1}{z-q_2}"),
      texte(" est un réel ; (2) "),
      latex("z\\cdot\\bar z=k"),
      texte(". Traduis chaque condition, identifie les deux lieux, puis trouve leurs points d'intersection."),
    ];
  }
  const fin = texte(". Détermine l'équation vérifiée par x et y, puis identifie la nature du lieu de M.");
  switch (e.sousType) {
    case "droite":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" (z ≠ p₂) tel que le rapport "), latex("\\dfrac{z-p_1}{z-p_2}"), texte(" est un réel"), fin];
    case "thales":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" (z ≠ p₂) tel que le rapport "), latex("\\dfrac{z-p_1}{z-p_2}"), texte(" est un imaginaire pur"), fin];
    case "apollonius":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" tel que "), latex("|z-p_1|=k\\,|z-p_2|"), texte(" (k ≠ 1 donné)"), fin];
    case "demiDroites": {
      const origineO = e.p1.a === 0 && e.p1.b === 0;
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(origineO ? " (z ≠ 0) tel que " : " (z ≠ a) tel que "), latex(conditionDemiDroites(e, "c")), texte(origineO ? " (c donné)" : " (a et c donnés)"), fin];
    }
    case "cercleO":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" tel que "), latex("z\\cdot\\bar z=k"), texte(" (k > 0 donné)"), fin];
    case "cercleA":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" tel que "), latex("|z-a|=k"), texte(" (a et k > 0 donnés)"), fin];
    case "argument":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" (z ≠ a) tel que "), latex("\\arg(z-a)\\equiv\\theta\\pmod{2\\pi}"), texte(" (a et θ donnés)"), fin];
    case "argumentPi":
      return [texte("M est un point d'affixe "), latex("z=x+yi"), texte(" (z ≠ a) tel que "), latex("\\arg(z-a)\\equiv\\theta\\pmod{\\pi}"), texte(" (a et θ donnés)"), fin];
  }
}

export function blocDonneesB(e: ExerciceComplexesB): string[] {
  if (e.sousType === "intersection") return [`q_1=${affixeLatex(e.q1)}\\quad q_2=${affixeLatex(e.q2)}\\quad k=${e.kCercleO}`];
  switch (e.sousType) {
    case "droite":
    case "thales":
      return [`p_1=${affixeLatex(e.p1)}\\quad p_2=${affixeLatex(e.p2)}`];
    case "apollonius":
      return [`p_1=${affixeLatex(e.p1)}\\quad p_2=${affixeLatex(e.p2)}\\quad k=${e.k}`];
    case "demiDroites":
      return e.p1.a === 0 && e.p1.b === 0 ? [`c=${e.cLatex}`] : [`a=${affixeLatex(e.p1)}\\quad c=${e.cLatex}`];
    case "cercleO":
      return [`k=${e.k}`];
    case "cercleA":
      return [`a=${affixeLatex(e.p1)}\\quad k=${e.k}`];
    case "argument":
    case "argumentPi":
      return [`a=${affixeLatex(e.p1)}\\quad \\theta=${angleTheta(e)}`];
  }
}

export function consigneEcranB(e: ExerciceComplexesB, phase: PhaseComplexesAvances): FragmentConsigne[] {
  if (e.sousType === "intersection") {
    if (phase === "bInterEcran1") return [texte("Traduis chacune des deux conditions par une équation en x et y (un champ par condition).")];
    if (phase === "bInterEcran2") return [texte("À partir des équations confirmées : la condition (1) donne une droite — donnes-en deux points ; la condition (2) donne un cercle — donne son centre et son rayon.")];
    return [texte("Résous le système des deux équations confirmées : donne les affixes des points d'intersection.")];
  }
  if (phase === "bEcran1") {
    if (e.sousType === "argument" || e.sousType === "argumentPi") {
      return [texte("Pose z = x + yi. La condition impose que "), latex("(z-a)\\,e^{-i\\theta}"), texte(" soit un réel : écris l'équation en x et y qui exprime que sa partie imaginaire est nulle.")];
    }
    return [texte("Pose z = x + yi et traduis la condition par une équation en x et y.")];
  }
  return [texte("À partir de l'équation confirmée et de toute la condition de départ (signe, point exclu…), identifie la nature du lieu, puis donne ses paramètres.")];
}

export function etatActuelB(e: ExerciceComplexesB, phase: PhaseComplexesAvances): string[] | null {
  if (e.sousType === "intersection") {
    const equationsConfirmees = "\\text{Les 2 équations confirmées}";
    if (phase === "bInterEcran2") return [equationsConfirmees];
    if (phase === "bInterEcran3") return [equationsConfirmees, "\\text{Droite et cercle confirmés}"];
    return null;
  }
  if (phase === "bEcran2") return ["\\text{Équation confirmée}"];
  return null;
}

export function niveauAideMaxB(e: ExerciceComplexesB, phase: PhaseComplexesAvances): number {
  if (e.sousType === "intersection") return 0;
  return phase === "bEcran1" ? 2 : 0;
}
export function aideNiveau1B(e: ExerciceComplexesB, phase: PhaseComplexesAvances): AideAvecLatex {
  if (e.sousType === "intersection" || phase !== "bEcran1") return AUCUNE_AIDE;
  return { texte: "Pose z = x + yi et remplace dans la condition. Un nombre est réel quand sa partie imaginaire est nulle, imaginaire pur quand sa partie réelle est nulle ; une égalité de modules s'élève au carré.", latex: "|x+yi|^2=x^2+y^2" };
}
/** Aide 2 : substitution amorcée, sans jamais nommer la nature du lieu (audit 6e ch. 5, point 11). */
const SUBSTITUTION_B: Record<ExerciceComplexesBSimple["sousType"], string> = {
  droite: "\\dfrac{z-p_1}{z-p_2}\\in\\mathbb{R}\\iff\\operatorname{Im}\\left[(z-p_1)\\,\\overline{(z-p_2)}\\right]=0",
  thales: "\\dfrac{z-p_1}{z-p_2}\\in i\\mathbb{R}\\iff\\operatorname{Re}\\left[(z-p_1)\\,\\overline{(z-p_2)}\\right]=0",
  apollonius: "|z-p_1|^2=k^2\\,|z-p_2|^2",
  demiDroites: "w+\\bar w=2\\operatorname{Re}w\\qquad w-\\bar w=2i\\operatorname{Im}w\\qquad|w|=\\sqrt{(\\operatorname{Re}w)^2+(\\operatorname{Im}w)^2}",
  cercleO: "z\\cdot\\bar z=(x+yi)(x-yi)",
  cercleA: "|z-a|^2=\\left(x-\\operatorname{Re}a\\right)^2+\\left(y-\\operatorname{Im}a\\right)^2",
  argument: "(z-a)\\,e^{-i\\theta}=\\left[(x-\\operatorname{Re}a)+(y-\\operatorname{Im}a)\\,i\\right](\\cos\\theta-i\\sin\\theta)",
  argumentPi: "(z-a)\\,e^{-i\\theta}=\\left[(x-\\operatorname{Re}a)+(y-\\operatorname{Im}a)\\,i\\right](\\cos\\theta-i\\sin\\theta)",
};
export function aideNiveau2B(e: ExerciceComplexesB, phase: PhaseComplexesAvances): AideAvecLatex {
  if (e.sousType === "intersection" || phase !== "bEcran1") return AUCUNE_AIDE;
  const texteAide = e.sousType === "demiDroites" ? "Note w = z − a (w = z si a = 0) : substitution amorcée (simplification non faite) :" : "Substitution amorcée (simplification non faite) :";
  return { texte: texteAide, latex: SUBSTITUTION_B[e.sousType] };
}

// Natures toujours proposées à l'écran "lieu structuré" (droite/cercle/demiDroite).
export const NATURES_DISPONIBLES: { id: NatureLieu; label: string }[] = [
  { id: "droite", label: "Droite" },
  { id: "cercle", label: "Cercle" },
  { id: "demiDroite", label: "Demi-droite(s)" },
];

function latexParamsLocus(e: ExerciceComplexesBSimple): string[] {
  const resultat = e.resultat;
  const pole = e.poleExclu ? [`\\text{Point exclu : }${affixeLatex(e.poleExclu)}`] : [];
  if (resultat.nature === "droite") return [`\\text{Droite passant par }${affixeLatex(resultat.point1)}\\text{ et }${affixeLatex(resultat.point2)}`, ...pole];
  if (resultat.nature === "cercle") return [`\\text{Cercle de centre }${affixeLatexRationnel(resultat.centre.a, resultat.centre.b)}\\text{, de rayon }${resultat.rayonLatex}`, ...pole];
  const angles = resultat.angles.length === 1 ? [`\\theta=${resultat.angles[0].latex}`] : resultat.angles.map((a, i) => `\\theta_{${i + 1}}=${a.latex}`);
  return [`\\text{Demi-droite(s) d'origine }${affixeLatex(resultat.origine)}\\text{ (exclue)}`, ...angles, ...pole];
}

/** Équation attendue à l'écran 1 (une forme possible — toute forme équivalente est acceptée). */
function equationAttendueB(e: ExerciceComplexesBSimple): string {
  const { p1, p2 } = e;
  switch (e.sousType) {
    case "droite":
      return equationDroite(p1, p2);
    case "thales": {
      const d2 = (p1.a - p2.a) ** 2 + (p1.b - p2.b) ** 2;
      return `${carreDecale("x", (p1.a + p2.a) / 2)}+${carreDecale("y", (p1.b + p2.b) / 2)}=${fractionLatex(d2, 4)}`;
    }
    case "apollonius": {
      const k = e.k as number;
      const den = 1 - k * k;
      const d2 = (p1.a - p2.a) ** 2 + (p1.b - p2.b) ** 2;
      return `${carreDecale("x", (p1.a - k * k * p2.a) / den)}+${carreDecale("y", (p1.b - k * k * p2.b) / den)}=${fractionLatex(k * k * d2, den * den)}`;
    }
    case "demiDroites": {
      const X = decale("x", p1.a);
      const Y = decale("y", p1.b);
      const lien = e.forme === "imaginaire" ? Y : X;
      if (e.c === 0) return `${lien}=0`;
      const gauche = lien.length === 1 ? `2${lien}` : `2\\left(${lien}\\right)`;
      return `${gauche}=${e.cLatex}\\sqrt{${carreDecale("x", p1.a)}+${carreDecale("y", p1.b)}}`;
    }
    case "cercleO":
      return `x^2+y^2=${e.k}`;
    case "cercleA":
      return `${carreDecale("x", p1.a)}+${carreDecale("y", p1.b)}=${(e.k as number) ** 2}`;
    case "argument":
    case "argumentPi":
      return equationDroiteDirection(p1, e.theta?.numerique ?? 0);
  }
}

// ============================================================================
// Famille C.
// ============================================================================

function pEtConjugue(e: ExerciceComplexesC): { p: AffixeSimple; pb: AffixeSimple } {
  return { p: { a: e.a, b: e.b }, pb: { a: e.a, b: -e.b } };
}

function transformationC(e: ExerciceComplexesC): string {
  return e.conjugue ? "z'=\\dfrac{z-p}{1-\\bar p z}" : "z'=\\dfrac{z-p}{1-p z}";
}

export function consigneGeneraleC(e: ExerciceComplexesC): FragmentConsigne[] {
  return [
    texte("z est un point du cercle unité ("),
    latex("|z|=1"),
    texte(", donc "),
    latex("z\\cdot\\bar z=1"),
    texte(") et "),
    latex(transformationC(e)),
    texte(", avec p donné ci-dessous. On note "),
    latex("\\bar z"),
    texte(" le conjugué de z (à taper « zb »). Le point d'affixe z' est-il lui aussi sur le cercle unité ? Développe le carré du module du numérateur, puis du dénominateur, sans poser z = x + yi, puis conclus."),
  ];
}

export function blocDonneesC(e: ExerciceComplexesC): string[] {
  const { p, pb } = pEtConjugue(e);
  return [`p=${affixeLatex(p)}\\quad \\bar p=${affixeLatex(pb)}`, transformationC(e)];
}

export function consigneEcranC(e: ExerciceComplexesC, phase: PhaseComplexesAvances): FragmentConsigne[] {
  if (phase === "cEcran1") return [texte("Développe "), latex("|z-p|^2=(z-p)(\\bar z-\\bar p)"), texte(" sans encore remplacer "), latex("z\\cdot\\bar z"), texte(" par 1 (expression en z et zb).")];
  if (phase === "cEcran2") {
    const produit = e.conjugue ? "|1-\\bar p z|^2=(1-\\bar p z)(1-p\\bar z)" : "|1-pz|^2=(1-pz)(1-\\bar p\\bar z)";
    return [texte("Développe "), latex(produit), texte(" sans encore remplacer "), latex("z\\cdot\\bar z"), texte(" par 1 (expression en z et zb).")];
  }
  return [texte("Remplace "), latex("z\\cdot\\bar z"), texte(" par 1 dans les deux développements confirmés et compare-les. Que peux-tu conclure sur "), latex("|z'|"), texte(" ? (une seule tentative)")];
}

export function etatActuelC(e: ExerciceComplexesC, phase: PhaseComplexesAvances): string[] | null {
  const numerateurConfirme = "|z-p|^2\\text{ développé}";
  if (phase === "cEcran2") return [numerateurConfirme];
  if (phase === "cEcran3") return [numerateurConfirme, e.conjugue ? "|1-\\bar p z|^2\\text{ développé}" : "|1-pz|^2\\text{ développé}"];
  return null;
}

/** Écran 3 : verdict qui dépend de l'exercice (vraie transformation ou contre-exemple). */
export function optionsConclusionC(): OptionQcm[] {
  return [
    // Texte brut (pas de KaTeX) : une phrase doit pouvoir passer à la ligne à 390 px.
    { id: "egaux", label: "Égaux pour tout z du cercle unité : |z'| = 1" },
    { id: "differents", label: "Différents en général : |z'| n'est pas toujours égal à 1" },
    { id: "indecidable", label: "On ne peut pas conclure sans poser z = x + yi" },
  ];
}

export function niveauAideMaxC(phase: PhaseComplexesAvances): number {
  return phase === "cEcran1" ? 2 : 0;
}
export function aideNiveau1C(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Pour tout complexe w, |w|² = w·w̄, et le conjugué d'une différence est la différence des conjugués :", latex: "|w|^2=w\\,\\bar w\\qquad\\overline{z-p}=\\bar z-\\bar p" };
}
export function aideNiveau2C(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "cEcran1") return AUCUNE_AIDE;
  return { texte: "Développement amorcé (distributivité, terme par terme) :", latex: "(z-p)(\\bar z-\\bar p)=z\\bar z-z\\bar p-\\cdots" };
}

// ============================================================================
// Famille D.
// ============================================================================

/** Équation de D_reelles avec les valeurs NUMÉRIQUES de A, P, m₀ et k (audit 6e ch. 5, point 1). */
export function equationDReelles(e: ExerciceComplexesDReelles): string {
  const A = e.x1 + e.x2;
  const P = e.x1 * e.x2;
  const imagZ = lineaireConstanteDabord(-1, "m", e.m0);
  const coefZ = A === 0 ? `(${imagZ})i` : `${-A}+(${imagZ})i`;
  const debut = `z^2+\\left(${coefZ}\\right)z`;
  let fin = "";
  if (e.k !== 0) {
    const imagC = lineaireConstanteDabord(e.k, "m", -e.k * e.m0);
    fin = P === 0 ? `+(${imagC})i` : `+\\left(${P}+(${imagC})i\\right)`;
  } else if (P !== 0) {
    fin = P > 0 ? `+${P}` : `${P}`;
  }
  // Sur 2 lignes quand le terme constant est complexe : d'un seul tenant, l'équation débordait de
  // son cadre à 390 px.
  if (e.k !== 0) return `\\begin{aligned}&${debut}\\\\ &\\qquad{}${fin}=0\\end{aligned}`;
  return `${debut}${fin}=0`;
}

export function consigneGeneraleD(e: ExerciceComplexesD): FragmentConsigne[] {
  switch (e.sousType) {
    case "ratio":
      return [
        texte("On cherche à résoudre "),
        latex("(z+c)^n=k\\cdot z^n"),
        texte(", ce qui équivaut à "),
        latex("\\left(\\dfrac{z+c}{z}\\right)^n=k"),
        texte(" (pour z ≠ 0). On pose "),
        latex("u=\\dfrac{z+c}{z}"),
        texte(" : trouve d'abord toutes les solutions u de "),
        latex("u^n=k"),
        texte(", puis calcule z à partir de la solution réelle "),
        latex("u=m"),
        texte("."),
      ];
    case "reelles":
      return [texte("L'équation ci-dessous, d'inconnue z, dépend d'un paramètre réel m. Trouve la valeur de m pour laquelle elle admet deux solutions réelles.")];
    case "coef":
      return [texte("L'équation "), latex("z^2+\\alpha z+\\beta=0"), texte(" a des coefficients α et β réels inconnus. On sait qu'elle admet la racine "), latex("z_0"), texte(" donnée. Retrouve α et β.")];
    case "modules":
      return [texte("Trouve les nombres complexes z tels que "), latex("|z|=\\left|\\dfrac{1}{z}\\right|"), texte(" et "), latex("|z|=|z-d|"), texte(" (d donné).")];
  }
}

export function blocDonneesD(e: ExerciceComplexesD): string[] {
  switch (e.sousType) {
    case "ratio":
      return [`n=${e.n}\\quad c=${e.c}\\quad k=${e.m}^{${e.n}}=${e.m ** e.n}`];
    case "reelles":
      return [equationDReelles(e)];
    case "coef":
      return [`z_0=${affixeLatex({ a: e.p, b: e.q })}`];
    case "modules": {
      // d = 2p/r (réel) ou 2qi/r (imaginaire pur), fraction irréductible.
      const num = 2 * (e.dImaginaire ? e.q : e.p);
      const g = pgcd(Math.abs(num), e.r);
      const valeur = fractionLatex(num / g, e.r / g);
      if (!e.dImaginaire) return [`d=${valeur}`];
      const signe = valeur.startsWith("-") ? "-" : "";
      const abs = valeur.replace(/^-/, "");
      return [`d=${signe}${abs.startsWith("\\frac") ? `${abs}\\,i` : `${abs}i`}`];
    }
  }
}

export function consigneEcranD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): FragmentConsigne[] {
  switch (e.sousType) {
    case "ratio":
      return phase === "dRatioEcran1"
        ? [texte(`Trouve les ${e.n} solutions u de `), latex("u^n=k"), texte(" (une ligne par solution).")]
        : [texte("Utilise la solution réelle confirmée "), latex("u=m"), texte(" pour calculer "), latex("z=\\dfrac{c}{u-1}"), texte(".")];
    case "reelles":
      if (phase === "dReellesEcran1") return [texte("Pose "), latex("z=x"), texte(" (x réel) et sépare l'équation en deux équations réelles en x et m : partie réelle = 0 et partie imaginaire = 0.")];
      if (phase === "dReellesEcran2") return [texte("À partir des deux équations confirmées, déduis la valeur de m pour laquelle elles ont deux racines x communes.")];
      return [texte("Donne les deux solutions réelles, pour la valeur de m confirmée.")];
    case "coef":
      return phase === "dCoefEcran1"
        ? [texte("Remplace z par "), latex("z_0"), texte(", développe et sépare en deux équations en α et β : partie réelle = 0 et partie imaginaire = 0.")]
        : [texte("Résous le système confirmé.")];
    case "modules":
      return phase === "dModulesEcran1"
        ? [texte("Déduis |z| de "), latex("|z|=\\left|\\dfrac{1}{z}\\right|"), texte(".")]
        : [texte("Utilise "), latex("|z|=1"), texte(" (confirmé) et "), latex("|z|=|z-d|"), texte(" pour trouver les solutions z (une ligne par solution).")];
  }
}

export function etatActuelD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): string[] | null {
  switch (e.sousType) {
    case "ratio":
      return phase === "dRatioEcran2" ? [`\\text{Les }${e.n}\\text{ solutions }u\\text{ confirmées}`] : null;
    case "reelles": {
      const equationsConfirmees = "\\text{Les 2 équations confirmées}";
      if (phase === "dReellesEcran2") return [equationsConfirmees];
      if (phase === "dReellesEcran3") return [equationsConfirmees, `m=${e.m0}\\text{ (confirmé)}`];
      return null;
    }
    case "coef":
      return phase === "dCoefEcran2" ? ["\\text{Les 2 équations confirmées}"] : null;
    case "modules":
      return phase === "dModulesEcran2" ? ["|z|=1\\text{ (confirmé)}"] : null;
  }
}

/** Placeholders HORS de l'espace des tirages, sans « * », « zb » ni « sqrt » (audit 6e ch. 5). */
export function champsD(e: ExerciceComplexesD, phase: PhaseComplexesAvances): ChampDef[] {
  switch (e.sousType) {
    case "ratio":
      return phase === "dRatioEcran2" ? [{ type: "texte", label: "z =", placeholder: "ex : 7/3" }] : [];
    case "reelles":
      if (phase === "dReellesEcran1")
        return [
          { type: "texte", label: "Partie réelle = 0 :", placeholder: "ex : x²+2x−1=0" },
          { type: "texte", label: "Partie imaginaire = 0 :", placeholder: "ex : 2mx−3=0" },
        ];
      if (phase === "dReellesEcran2") return [{ type: "texte", label: "m =", placeholder: "ex : 5/2" }];
      return [];
    case "coef":
      if (phase === "dCoefEcran1")
        return [
          { type: "texte", label: "Partie réelle = 0 :", placeholder: "ex : 3α+β−7=0" },
          { type: "texte", label: "Partie imaginaire = 0 :", placeholder: "ex : 2α+5=0" },
        ];
      return [
        { type: "texte", label: "α =", placeholder: "ex : 7" },
        { type: "texte", label: "β =", placeholder: "ex : 3" },
      ];
    case "modules":
      return phase === "dModulesEcran1" ? [{ type: "texte", label: "|z| =", placeholder: "ex : 3/2" }] : [];
  }
}

export function niveauAideMaxD(): number {
  return 0;
}

// ============================================================================
// Famille E.
// ============================================================================

export function consigneGeneraleE(): FragmentConsigne[] {
  return [texte("A, B, C et D sont quatre points donnés par leurs affixes. Détermine si les droites (AB) et (CD) sont parallèles, perpendiculaires, ou ni l'un ni l'autre, en étudiant l'argument du rapport "), latex("\\dfrac{z_D-z_C}{z_B-z_A}"), texte(".")];
}

/** Deux points par ligne : une seule ligne de 4 affixes débordait à 390 px. */
export function blocDonneesE(e: ExerciceComplexesE): string[] {
  return [`z_A=${affixeLatex(e.zA)}\\quad z_B=${affixeLatex(e.zB)}`, `z_C=${affixeLatex(e.zC)}\\quad z_D=${affixeLatex(e.zD)}`];
}

export function consigneEcranE(phase: PhaseComplexesAvances): FragmentConsigne[] {
  if (phase === "eEcran1") return [texte("Calcule le rapport "), latex("\\dfrac{z_D-z_C}{z_B-z_A}"), texte(" sous forme a + bi.")];
  if (phase === "eEcran2") return [texte("À partir du rapport confirmé, détermine son argument en radians : valeur exacte si c'est un angle remarquable, sinon valeur approchée à 0,01 près (calculatrice autorisée).")];
  return [texte("Conclus : les droites (AB) et (CD) sont-elles parallèles, perpendiculaires, ou ni l'un ni l'autre ? (une seule tentative)")];
}

export function etatActuelE(phase: PhaseComplexesAvances): string[] | null {
  const rapportConfirme = "\\text{Rapport confirmé}";
  if (phase === "eEcran2") return [rapportConfirme];
  if (phase === "eEcran3") return [rapportConfirme, "\\text{Argument confirmé}"];
  return null;
}

export function optionsStatutE(): OptionQcm[] {
  return [
    { id: "paralleles", label: "(AB) et (CD) sont parallèles" },
    { id: "perpendiculaires", label: "(AB) et (CD) sont perpendiculaires" },
    { id: "aucun", label: "Ni l'un ni l'autre" },
  ];
}

export function niveauAideMaxE(phase: PhaseComplexesAvances): number {
  return phase === "eEcran3" ? 2 : 0;
}
export function aideNiveau1E(phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "eEcran3") return AUCUNE_AIDE;
  return { texte: "(AB) et (CD) sont parallèles lorsque le rapport est réel (argument 0 ou π), perpendiculaires lorsqu'il est imaginaire pur (argument ±π/2).", latex: "\\dfrac{z_D-z_C}{z_B-z_A}\\in\\mathbb{R}\\iff(AB)\\parallel(CD)" };
}
export function aideNiveau2E(e: ExerciceComplexesE, phase: PhaseComplexesAvances): AideAvecLatex {
  if (phase !== "eEcran3") return AUCUNE_AIDE;
  const r = ratioE(e);
  return { texte: "Parties réelle et imaginaire du rapport confirmé (l'une des deux est-elle nulle ?) :", latex: `\\operatorname{Re}=${latexRationnel(r.re)}\\qquad\\operatorname{Im}=${latexRationnel(r.im)}` };
}

// ============================================================================
// Dispatch commun.
// ============================================================================

export function consigneGenerale(exercice: ExerciceComplexesAvances): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneGeneraleA(exercice);
    case "B":
      return consigneGeneraleB(exercice);
    case "C":
      return consigneGeneraleC(exercice);
    case "D":
      return consigneGeneraleD(exercice);
    case "E":
      return consigneGeneraleE();
  }
}

export function blocDonnees(exercice: ExerciceComplexesAvances): string[] {
  switch (exercice.famille) {
    case "A":
      return blocDonneesA(exercice);
    case "B":
      return blocDonneesB(exercice);
    case "C":
      return blocDonneesC(exercice);
    case "D":
      return blocDonneesD(exercice);
    case "E":
      return blocDonneesE(exercice);
  }
}

export function consigneEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneEcranA(phase);
    case "B":
      return consigneEcranB(exercice, phase);
    case "C":
      return consigneEcranC(exercice, phase);
    case "D":
      return consigneEcranD(exercice, phase);
    case "E":
      return consigneEcranE(phase);
  }
}

export function etatActuel(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(phase);
    case "B":
      return etatActuelB(exercice, phase);
    case "C":
      return etatActuelC(exercice, phase);
    case "D":
      return etatActuelD(exercice, phase);
    case "E":
      return etatActuelE(phase);
  }
}

/** Champs texte génériques — UNIQUEMENT pour les écrans NON dédiés (voir `App6gen42.tsx`).
 * Placeholders hors tirages, sans « * », « zb » ni « sqrt ». */
export function champsEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): ChampDef[] {
  switch (exercice.famille) {
    case "B":
      if (exercice.sousType === "intersection") {
        if (phase === "bInterEcran1")
          return [
            { type: "texte", label: "Condition (1), équation en x et y :", placeholder: "ex : 3x+5y=1,5" },
            { type: "texte", label: "Condition (2), équation en x et y :", placeholder: "ex : x²+y²=3" },
          ];
        if (phase === "bInterEcran2")
          return [
            { type: "texte", label: "Point 1 de la droite (a+bi) :", placeholder: "ex : 1/2+3i" },
            { type: "texte", label: "Point 2 de la droite (a+bi) :", placeholder: "ex : 5−i/3" },
            { type: "texte", label: "Centre du cercle (a+bi) :", placeholder: "ex : 2−3i" },
            { type: "texte", label: "Rayon du cercle :", placeholder: "ex : 2,5" },
          ];
        return [];
      }
      return phase === "bEcran1" ? [{ type: "texte", label: "Équation en x et y :", placeholder: "ex : 3x+5y=1,5" }] : [];
    case "C":
      return phase === "cEcran1" || phase === "cEcran2" ? [{ type: "texte", label: "Expression développée (en z et zb) :", placeholder: "ex : 5−2z" }] : [];
    case "D":
      return champsD(exercice, phase);
    case "E":
      if (phase === "eEcran1") return [{ type: "texte", label: "Rapport (a+bi) =", placeholder: "ex : 1/7+5i" }];
      if (phase === "eEcran2") return [{ type: "texte", label: "Argument (en radians) =", placeholder: "ex : 4pi/11" }];
      return [];
    default:
      return [];
  }
}

export function niveauAideMaxEcran(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): number {
  switch (exercice.famille) {
    case "A":
      return niveauAideMaxA(phase);
    case "B":
      return niveauAideMaxB(exercice, phase);
    case "C":
      return niveauAideMaxC(phase);
    case "D":
      return niveauAideMaxD();
    case "E":
      return niveauAideMaxE(phase);
  }
}

export function aideNiveau1(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau1A(phase);
    case "B":
      return aideNiveau1B(exercice, phase);
    case "C":
      return aideNiveau1C(phase);
    case "D":
      return AUCUNE_AIDE;
    case "E":
      return aideNiveau1E(phase);
  }
}

export function aideNiveau2(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideNiveau2A(phase);
    case "B":
      return aideNiveau2B(exercice, phase);
    case "C":
      return aideNiveau2C(phase);
    case "D":
      return AUCUNE_AIDE;
    case "E":
      return aideNiveau2E(exercice, phase);
  }
}

export const LIBELLE_PHASE: Record<PhaseComplexesAvances, string> = {
  aEcran1: "Étape 1 (condition sur θ)",
  aEcran2: "Étape 2 (condition sur a et b)",
  aEcran3: "Étape 3 (condition complète)",
  bEcran1: "Étape 1 (équation)",
  bEcran2: "Étape 2 (nature du lieu)",
  bInterEcran1: "Étape 1 (2 équations)",
  bInterEcran2: "Étape 2 (paramètres des 2 lieux)",
  bInterEcran3: "Étape 3 (points d'intersection)",
  cEcran1: "Étape 1 (|numérateur|²)",
  cEcran2: "Étape 2 (|dénominateur|²)",
  cEcran3: "Étape 3 (conclusion)",
  dRatioEcran1: "Étape 1 (racines de uⁿ = k)",
  dRatioEcran2: "Étape 2 (z depuis u réel)",
  dReellesEcran1: "Étape 1 (2 équations)",
  dReellesEcran2: "Étape 2 (valeur de m)",
  dReellesEcran3: "Étape 3 (solutions réelles)",
  dCoefEcran1: "Étape 1 (2 équations)",
  dCoefEcran2: "Étape 2 (α, β)",
  dModulesEcran1: "Étape 1 (|z|)",
  dModulesEcran2: "Étape 2 (solutions)",
  eEcran1: "Étape 1 (rapport)",
  eEcran2: "Étape 2 (argument)",
  eEcran3: "Étape 3 (conclusion)",
};

export const LIBELLE_FAMILLE: Record<ExerciceComplexesAvances["famille"], string> = {
  A: "A — Condition pour que zⁿ soit un réel positif",
  B: "B — Lieux géométriques",
  C: "C — Le cercle unité est-il préservé ?",
  D: "D — Équations avec paramètre(s)",
  E: "E — Parallélisme / perpendicularité",
};

function reponseA(exercice: ExerciceComplexesA, phase: PhaseComplexesAvances): string[] {
  if (phase === "aEcran1") return [`${exercice.n}\\theta\\equiv 0\\pmod{2\\pi}`];
  if (phase === "aEcran2") return [tableauLignes(lignesConditionAB(exercice.n))];
  return [tableauLignes(lignesConditionComplete(exercice, `>${seuilLatex(exercice)}`))];
}

function reponseB(exercice: ExerciceComplexesB, phase: PhaseComplexesAvances): string[] {
  if (exercice.sousType === "intersection") {
    if (phase === "bInterEcran1") return [`(1)\\ ${equationDroite(exercice.q1, exercice.q2)}`, `(2)\\ x^2+y^2=${exercice.kCercleO}`];
    if (phase === "bInterEcran2") return [`\\text{Droite passant par }${affixeLatex(exercice.q1)}\\text{ et }${affixeLatex(exercice.q2)}`, `\\text{Cercle de centre }0\\text{, de rayon }${racineRationnelleLatex(exercice.kCercleO, 1).latex}`];
    return [`${affixeLatex(exercice.q1)}\\quad\\text{et}\\quad ${affixeLatex(exercice.q2)}`];
  }
  if (phase === "bEcran1") return [equationAttendueB(exercice)];
  return latexParamsLocus(exercice);
}

function reponseC(exercice: ExerciceComplexesC, phase: PhaseComplexesAvances): string[] {
  const { p, pb } = pEtConjugue(exercice);
  const p2 = exercice.a * exercice.a + exercice.b * exercice.b;
  if (phase === "cEcran1") return [`z\\bar z${moinsCoefVariable(pb, "z")}${moinsCoefVariable(p, "\\bar z")}+${p2}`];
  if (phase === "cEcran2") {
    const [c1, c2] = exercice.conjugue ? [pb, p] : [p, pb];
    return [`1${moinsCoefVariable(c1, "z")}${moinsCoefVariable(c2, "\\bar z")}+${p2}\\,z\\bar z`];
  }
  return [exercice.conjugue ? "|z'|=1\\text{ pour tout }z\\text{ du cercle unité}" : "|z'|\\neq 1\\text{ en général}"];
}

function reponseD(exercice: ExerciceComplexesD, phase: PhaseComplexesAvances): string[] {
  switch (exercice.sousType) {
    case "ratio": {
      if (phase === "dRatioEcran1") {
        const racines: string[] = [];
        for (let k = 0; k < exercice.n; k++) {
          const angle = (2 * Math.PI * k) / exercice.n;
          const re = exercice.m * Math.cos(angle);
          const im = exercice.m * Math.sin(angle);
          // Partie imaginaire en m·√3/2 pour n = 3 ou 6 : écrite avec un radical, jamais en décimal.
          const imRationnelle = Math.abs(im * 2 - Math.round(im * 2)) < 1e-9;
          if (imRationnelle || Math.abs(im) < 1e-9) racines.push(affixeLatexRationnel(re, im));
          else {
            const coef = Math.round((Math.abs(im) * 2) / Math.sqrt(3));
            const imLatex = `${im < 0 ? "-" : "+"}${coef === 2 ? "" : `\\frac{${coef}}{2}`}\\sqrt{3}\\,i`;
            const reLatex = Math.abs(re) < 1e-9 ? "" : latexRationnel(re);
            racines.push(reLatex === "" ? imLatex.replace(/^\+/, "") : `${reLatex}${imLatex}`);
          }
        }
        return racines;
      }
      return [`z=${latexRationnel(exercice.c / (exercice.m - 1))}`];
    }
    case "reelles": {
      const A = exercice.x1 + exercice.x2;
      const P = exercice.x1 * exercice.x2;
      if (phase === "dReellesEcran1")
        return [
          `${lineaire([
            [1, "x^2"],
            [-A, "x"],
            [P, ""],
          ])}=0`,
          `\\left(${lineaireConstanteDabord(-1, "m", exercice.m0)}\\right)\\left(${decale("x", exercice.k)}\\right)=0`,
        ];
      if (phase === "dReellesEcran2") return [`m=${exercice.m0}`];
      return [`${exercice.x1}`, `${exercice.x2}`];
    }
    case "coef": {
      const { p, q } = exercice;
      if (phase === "dCoefEcran1") {
        const reel = `${lineaire([
          [p, "\\alpha"],
          [1, "\\beta"],
          [p * p - q * q, ""],
        ])}=0`;
        const imag = `${lineaire([
          [q, "\\alpha"],
          [2 * p * q, ""],
        ])}=0`;
        const simplifiee = `${lineaire([
          [1, "\\alpha"],
          [2 * p, ""],
        ])}=0`;
        return [reel, Math.abs(q) === 1 && q > 0 ? imag : `${imag}\\iff ${simplifiee}`];
      }
      return [`\\alpha=${-2 * p}\\quad\\beta=${p * p + q * q}`];
    }
    case "modules":
      if (phase === "dModulesEcran1") return ["|z|=1"];
      return solutionsDModules(exercice).map((z) => affixeLatexRationnel(z.re, z.im));
  }
}

/** Argument attendu : valeur exacte si remarquable, sinon décimale À VIRGULE (audit 6e ch. 5). */
function argumentLatexE(exercice: ExerciceComplexesE): string {
  const ratio = ratioE(exercice);
  const angle = calculerArgument(ratio.re, ratio.im);
  if (angle.q !== 1e6) return angle.latex;
  return `\\approx ${angle.numerique.toFixed(2).replace(".", "{,}")}`;
}

function reponseE(exercice: ExerciceComplexesE, phase: PhaseComplexesAvances): string[] {
  const ratio = ratioE(exercice);
  if (phase === "eEcran1") return [affixeLatexRationnel(ratio.re, ratio.im)];
  if (phase === "eEcran2") return [`\\arg=${argumentLatexE(exercice)}`.replace("=\\approx", "\\approx")];
  const libelles: Record<string, string> = { paralleles: "\\text{parallèles}", perpendiculaires: "\\text{perpendiculaires}", aucun: "\\text{ni parallèles ni perpendiculaires}" };
  return [libelles[exercice.statut]];
}

/** Récapitulatif final : affiche toujours la réponse CORRECTE connue de l'exercice — jamais
 * recalculée depuis la saisie élève. */
export function formatReponseAttenduePhaseLatex(exercice: ExerciceComplexesAvances, phase: PhaseComplexesAvances): string[] {
  switch (exercice.famille) {
    case "A":
      return reponseA(exercice, phase);
    case "B":
      return reponseB(exercice, phase);
    case "C":
      return reponseC(exercice, phase);
    case "D":
      return reponseD(exercice, phase);
    case "E":
      return reponseE(exercice, phase);
  }
}
