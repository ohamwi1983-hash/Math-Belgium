import type {
  ExerciceDomaineDeriveeA,
  ExerciceDomaineDeriveeB,
  ExerciceDomaineDeriveeC,
  ExerciceDomaineDeriveeD,
  ExerciceDomaineDeriveeE,
  ExerciceDomaineDeriveeExponentielle,
  ExerciceDomaineDeriveeF,
  FormeGA,
} from "../core6e/domaineDeriveeExponentielles.types";
import type { PhaseDomaineDeriveeExponentielle, ResultatExerciceDomaineDeriveeExponentielle } from "../moteur6e/typesDomaineDeriveeExponentielles";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen7`. Toute aide qui embarque un symbole LaTeX
 * est retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut (piège déjà
 * rencontré et corrigé sur `6gen9`, voir CLAUDE.md "Bug trouvé par Playwright, corrigé —
 * coefficient nul affiché tel quel").
 *
 * **Décision de conception — dispatch PAR FAMILLE**, même principe que `formatLimitesExponentielles.ts`
 * (`6gen6`) : chaque famille a sa propre fonction `aideXxxNiveau1`/`Niveau2`, le dispatcher public
 * ne fait que router vers la bonne fonction selon `exercice.famille`.
 */
export const CONSIGNE_GENERALE = "Détermine le domaine puis calcule la dérivée de la fonction suivante :";
export const CONSIGNE_DOMAINE = "Détermine le domaine de définition de cette fonction.";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient `±1` littéral, jamais de terme nul affiché, jamais de double signe —
 * même convention que `formatLimitesExponentielles.ts` (dupliquée plutôt que partagée, chaque
 * générateur du chantier reste indépendant). */
function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

/** Jamais d'exposant `^{1}` littéral. */
function formatPuissance(base: string, exposant: number): string {
  return exposant === 1 ? base : `${base}^{${exposant}}`;
}

/** Jamais de coefficient `1` littéral devant un suffixe (`1x`→`x`). */
function formatCoeff(k: number, suffixe: string): string {
  return k === 1 ? suffixe : `${k}${suffixe}`;
}

function formatBase(base: number, baseEstE: boolean): string {
  return baseEstE ? "e" : String(base);
}

function formatGA(g: FormeGA): string {
  return g.type === "affine" ? formatSommeTermes([{ valeur: g.m, suffixe: "x" }, { valeur: g.n, suffixe: "" }]) : formatPuissance("x", g.exposant);
}

// ============================================================================
// Famille A
// ============================================================================

function formatFonctionA(exercice: ExerciceDomaineDeriveeA): string {
  const b = formatBase(exercice.base, exercice.baseEstE);
  if (exercice.sousType === "direct") return `${b}^{${formatGA(exercice.g)}}`;
  const puissance = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  return `\\left(${b}^{${puissance}} - ${exercice.c}\\right)^2`;
}

function consigneA(phase: "aDomaine" | "aDerivee"): string {
  return phase === "aDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction.";
}

function aideANiveau1(phase: "aDomaine" | "aDerivee"): AideAvecLatex {
  if (phase === "aDomaine") return { texte: "Une exponentielle est toujours définie, quel que soit son exposant — aucune restriction ici.", latex: null };
  return { texte: "Rappel de la formule générique — attention, ln(e)=1 (cas particulier si la base est e) :", latex: "\\frac{d}{dx}\\left[\\text{base}^{u(x)}\\right] = u'(x)\\cdot\\text{base}^{u(x)}\\cdot\\ln(\\text{base})" };
}

function aideANiveau2(phase: "aDomaine" | "aDerivee", exercice: ExerciceDomaineDeriveeA): AideAvecLatex {
  if (phase === "aDomaine") return { texte: "Le domaine d'une exponentielle composée est toujours ℝ.", latex: "\\mathbb{R}" };
  const b = formatBase(exercice.base, exercice.baseEstE);
  if (exercice.sousType === "direct") {
    const gPrime = exercice.g.type === "affine" ? String(exercice.g.m) : `${exercice.g.exposant}${formatPuissance("x", exercice.g.exposant - 1)}`;
    return { texte: "Forme substituée (non simplifiée) :", latex: `\\left(${gPrime}\\right)\\cdot ${b}^{${formatGA(exercice.g)}}\\cdot\\ln(${b})` };
  }
  const puissance = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  return { texte: "Forme substituée (non simplifiée, u=le facteur entre parenthèses) :", latex: `2\\left(${b}^{${puissance}} - ${exercice.c}\\right)\\cdot ${exercice.m}\\cdot\\ln(${b})\\cdot ${b}^{${puissance}}` };
}

// ============================================================================
// Famille B
// ============================================================================

function formatFonctionB(exercice: ExerciceDomaineDeriveeB): string {
  const b = String(exercice.base);
  if (exercice.sousType === "racine") return `${b}^{\\sqrt{x^2-${exercice.k}^2}}`;
  const num = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  const den = formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }]);
  return `${b}^{\\frac{${num}}{${den}}}`;
}

function consigneB(phase: "bDomaine" | "bDerivee"): string {
  return phase === "bDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction (n'oublie pas la dérivée de l'exposant lui-même).";
}

function aideBNiveau1(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeB): AideAvecLatex {
  if (phase === "bDomaine") {
    return exercice.sousType === "racine"
      ? { texte: "La racine √(x²−k²) n'est définie que si son intérieur est ≥ 0.", latex: "x^2 - k^2 \\geq 0" }
      : { texte: "Une fraction n'est définie que si son dénominateur est non nul.", latex: "px + q \\neq 0" };
  }
  return {
    texte: "Il y a ICI deux dérivations imbriquées : l'exponentielle base^u, ET la dérivée de u elle-même (règle de la chaîne) — ne traite jamais base^u seule.",
    latex: "\\frac{d}{dx}\\left[\\text{base}^{u(x)}\\right] = u'(x)\\cdot\\text{base}^{u(x)}\\cdot\\ln(\\text{base})",
  };
}

function aideBNiveau2(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeB): AideAvecLatex {
  if (phase === "bDomaine") return { texte: "Valeur(s) qui annule(nt) le dénominateur / borne(s) de la racine :", latex: exercice.sousType === "racine" ? `k=${exercice.k}` : `-\\dfrac{q}{p}` };
  if (exercice.sousType === "racine") {
    const u = `\\sqrt{x^2-${exercice.k}^2}`;
    return { texte: "u et u', rappelés séparément (pas encore assemblés) :", latex: `\\begin{gathered} u(x) = ${u} \\\\ u'(x) = \\dfrac{x}{${u}} \\end{gathered}` };
  }
  const num = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  const den = formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }]);
  // Parenthèses autour de `num`/`den` UNIQUEMENT quand ils sont composés — jamais autour de la
  // variable nue "x", qui donnerait "(x)²"/"m(x)" superflu (audit transversal,
  // `promptauditparenthesessuperflues.md`).
  const numAtomique = exercice.m === 1 && exercice.n === 0;
  const denAtomique = exercice.p === 1 && exercice.q === 0;
  const numGroupe = numAtomique ? num : `(${num})`;
  const denGroupe = denAtomique ? den : `(${den})`;
  const denCarre = denAtomique ? `${den}^2` : `(${den})^2`;
  return {
    texte: "u et u' (règle du quotient), rappelés séparément (pas encore assemblés) :",
    latex: `\\begin{gathered} u(x) = \\dfrac{${num}}{${den}} \\\\ u'(x) = \\dfrac{${exercice.m}${denGroupe}-${exercice.p}${numGroupe}}{${denCarre}} \\end{gathered}`,
  };
}

// ============================================================================
// Famille C
// ============================================================================

/** Retourne les 2 facteurs u(x)/v(x) EN LATEX PUR (jamais un label "P(x)=..." embarqué DANS
 * l'expression — bug trouvé par Playwright, un tel label rendait littéralement une ÉGALITÉ comme
 * si elle était elle-même un facteur, ex. "f(x)=(P(x)=3x³-6x²)·e^P(x)") — cohérent avec les 2
 * autres sous-types, qui affichent déjà directement l'expression substituée. */
function nomsFacteursC(exercice: ExerciceDomaineDeriveeC): { u: string; v: string } {
  if (exercice.sousType === "d") {
    const p = formatSommeTermes([{ valeur: exercice.a, suffixe: "x^3" }, { valeur: exercice.b, suffixe: "x^2" }]);
    return { u: p, v: `e^{${p}}` };
  }
  if (exercice.sousType === "e") return { u: formatPuissance("x", exercice.r), v: "e^{\\sqrt{x}}" };
  return { u: `${exercice.base}^x-${exercice.c}`, v: exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)" };
}

/** u'(x)/v'(x) EN LATEX — pour le bloc « état actuel » de `cAssemblage` UNIQUEMENT (jamais pour la
 * vérité mathématique, portée par `moteur6e/verificationDomaineDeriveeExponentielles.ts::facteursC`,
 * dupliquée ici fidèlement — même principe que `facteursLatexC`, `formatDomaineDeriveeLogarithme.ts`
 * (6gen13), même chapitre). */
function deriveesFacteursC(exercice: ExerciceDomaineDeriveeC): { uPrime: string; vPrime: string } {
  if (exercice.sousType === "d") {
    const p = formatSommeTermes([{ valeur: exercice.a, suffixe: "x^3" }, { valeur: exercice.b, suffixe: "x^2" }]);
    const uPrime = formatSommeTermes([{ valeur: 3 * exercice.a, suffixe: "x^2" }, { valeur: 2 * exercice.b, suffixe: "x" }]);
    return { uPrime, vPrime: `(${uPrime})\\cdot e^{${p}}` };
  }
  if (exercice.sousType === "e") {
    const uPrime = exercice.r === 1 ? "1" : `${exercice.r}x`;
    return { uPrime, vPrime: "\\dfrac{1}{2\\sqrt{x}}\\cdot e^{\\sqrt{x}}" };
  }
  const uPrime = `\\ln(${exercice.base})\\cdot ${exercice.base}^x`;
  const vPrime = exercice.trig === "sin" ? "\\cos(x)" : "-\\sin(x)";
  return { uPrime, vPrime };
}

function formatFonctionC(exercice: ExerciceDomaineDeriveeC): string {
  const { u, v } = nomsFacteursC(exercice);
  return `\\left(${u}\\right)\\cdot ${v}`;
}

function consigneC(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): string {
  if (phase === "cDomaine") return CONSIGNE_DOMAINE;
  if (phase === "cFacteurs") return "Dérive chaque facteur SÉPARÉMENT (u'(x) et v'(x)).";
  return "Assemble via u'v+uv', à partir des dérivées CORRECTES de l'étape précédente.";
}

function aideCNiveau1(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): AideAvecLatex {
  if (phase === "cDomaine") return { texte: "Un produit d'exponentielle(s)/de fonctions déjà définies partout reste défini partout (ou hérite du domaine du facteur le plus restrictif).", latex: null };
  if (phase === "cFacteurs") return { texte: "Identifie u(x) et v(x) séparément à partir de f(x)=u(x)·v(x), puis dérive chacun indépendamment (chaîne si besoin).", latex: null };
  return { texte: "Rappel de la formule du produit (non substituée) :", latex: "(uv)' = u'v + uv'" };
}

function aideCNiveau2(phase: "cDomaine" | "cFacteurs" | "cAssemblage", exercice: ExerciceDomaineDeriveeC): AideAvecLatex {
  if (phase === "cDomaine") return { texte: "Domaine :", latex: exercice.sousType === "e" ? "[0\\,;\\,+\\infty[" : "\\mathbb{R}" };
  const { u, v } = nomsFacteursC(exercice);
  if (phase === "cFacteurs") return { texte: "u(x) et v(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} u(x) = ${u} \\\\ v(x) = ${v} \\end{gathered}` };
  return { texte: "u, v, u' et v' (déjà confirmés à l'étape précédente) :", latex: `u(x)=${u},\\ v(x)=${v}` };
}

// ============================================================================
// Famille D
// ============================================================================

function nomsNDdeD(exercice: ExerciceDomaineDeriveeD): { n: string; d: string } {
  const base = exercice.baseEstE ? "e" : String(exercice.base);
  if (exercice.sousType === "f") return { n: `${base}^x+${exercice.c}`, d: formatCoeff(exercice.k, "x") };
  if (exercice.sousType === "h") return { n: `${base}^x+${base}^{-x}`, d: `x^2+${exercice.c}` };
  if (exercice.sousType === "i") return { n: `${formatCoeff(exercice.k, "x^2")}`, d: `${base}^{${formatCoeff(exercice.m, "x")}}+${exercice.c}` };
  return { n: `${base}^{-x}-${base}^x`, d: `${base}^{2x}+1` };
}

function formatFonctionD(exercice: ExerciceDomaineDeriveeD): string {
  const { n, d } = nomsNDdeD(exercice);
  return `\\frac{${n}}{${d}}`;
}

/** N'(x)/D'(x) EN LATEX — pour le bloc « état actuel » de `dAssemblage` UNIQUEMENT, réplique
 * fidèlement `nDetDdeD` de `moteur6e/verificationDomaineDeriveeExponentielles.ts` (jamais la vérité
 * mathématique elle-même). */
function deriveesND(exercice: ExerciceDomaineDeriveeD): { nPrime: string; dPrime: string } {
  const base = exercice.baseEstE ? "e" : String(exercice.base);
  if (exercice.sousType === "f") return { nPrime: `\\ln(${base})\\cdot ${base}^x`, dPrime: `${exercice.k}` };
  if (exercice.sousType === "h") return { nPrime: `\\ln(${base})\\cdot(${base}^x-${base}^{-x})`, dPrime: "2x" };
  if (exercice.sousType === "i") return { nPrime: formatCoeff(2 * exercice.k, "x"), dPrime: `${exercice.m}\\cdot\\ln(${base})\\cdot ${base}^{${formatCoeff(exercice.m, "x")}}` };
  return { nPrime: `-\\ln(${base})\\cdot(${base}^{-x}+${base}^x)`, dPrime: `2\\ln(${base})\\cdot ${base}^{2x}` };
}

function consigneD(phase: "dDomaine" | "dND" | "dAssemblage"): string {
  if (phase === "dDomaine") return CONSIGNE_DOMAINE;
  if (phase === "dND") return "Dérive le numérateur N ET le dénominateur D SÉPARÉMENT (N'(x) et D'(x)).";
  return "Assemble via (N'D−ND')/D², à partir des valeurs N'/D' CORRECTES de l'étape précédente.";
}

function aideDNiveau1(phase: "dDomaine" | "dND" | "dAssemblage"): AideAvecLatex {
  if (phase === "dDomaine") return { texte: "Vérifie si le dénominateur peut s'annuler — ne conclus jamais ℝ par réflexe.", latex: null };
  if (phase === "dND") return { texte: "Identifie N(x) et D(x) séparément à partir de f(x)=N(x)/D(x), puis dérive chacun indépendamment.", latex: null };
  return { texte: "Rappel de la formule du quotient (non substituée) :", latex: "\\left(\\frac{N}{D}\\right)' = \\frac{N'D - ND'}{D^2}" };
}

function aideDNiveau2(phase: "dDomaine" | "dND" | "dAssemblage", exercice: ExerciceDomaineDeriveeD): AideAvecLatex {
  if (phase === "dDomaine") return { texte: "Résous D(x)=0 (ou vérifie qu'il ne s'annule jamais).", latex: null };
  const { n, d } = nomsNDdeD(exercice);
  if (phase === "dND") return { texte: "N(x) et D(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} N(x) = ${n} \\\\ D(x) = ${d} \\end{gathered}` };
  return { texte: "N, D, N' et D' (déjà confirmés à l'étape précédente) :", latex: `N(x)=${n},\\ D(x)=${d}` };
}

// ============================================================================
// Famille E
// ============================================================================

function formatFonctionEOrigine(exercice: ExerciceDomaineDeriveeE): string {
  if (exercice.sousType === "j") {
    const b = formatBase(exercice.base, exercice.baseEstE);
    return `\\frac{${b}^{${formatGA(exercice.g)}}}{${b}^{${formatGA(exercice.h)}}}`;
  }
  if (exercice.sousType === "m") {
    const b = formatBase(exercice.base, exercice.baseEstE);
    return `\\frac{${b}^x - 1}{${b}^x}`;
  }
  return `\\frac{${exercice.base1}^x - ${exercice.c}}{${exercice.base2}^x}`;
}

/** `[coeff x^3, coeff x^2, coeff x, constante]` d'une `FormeGA` — décomposition générique qui
 * permet de SOUSTRAIRE g(x)−h(x) terme à terme (jamais une simple concaténation textuelle
 * "g − h" non combinée, qui laisserait un double signe/coefficient non simplifié à l'écran). */
function coeffsGA(g: FormeGA): [number, number, number, number] {
  if (g.type === "affine") return [0, 0, g.m, g.n];
  return g.exposant === 2 ? [0, 1, 0, 0] : [1, 0, 0, 0];
}

/** g(x)−h(x), combiné terme à terme puis formaté via `formatSommeTermes` — pour le bloc « état
 * actuel » de `eDerivee` UNIQUEMENT (famille E, sous-type "j"). */
function formatGAMoinsGA(g: FormeGA, h: FormeGA): string {
  const [g3, g2, g1, g0] = coeffsGA(g);
  const [h3, h2, h1, h0] = coeffsGA(h);
  return formatSommeTermes([
    { valeur: g3 - h3, suffixe: "x^3" },
    { valeur: g2 - h2, suffixe: "x^2" },
    { valeur: g1 - h1, suffixe: "x" },
    { valeur: g0 - h0, suffixe: "" },
  ]);
}

/** Forme SIMPLIFIÉE de f(x) EN LATEX — pour le bloc « état actuel » de `eDerivee` UNIQUEMENT,
 * réplique fidèlement `formeSimplifieeE` de `moteur6e/verificationDomaineDeriveeExponentielles.ts`
 * (jamais la vérité mathématique elle-même, qui reste `verifierESimplifier`). */
function formeSimplifieeLatexE(exercice: ExerciceDomaineDeriveeE): string {
  if (exercice.sousType === "j") {
    const b = formatBase(exercice.base, exercice.baseEstE);
    return `${b}^{${formatGAMoinsGA(exercice.g, exercice.h)}}`;
  }
  if (exercice.sousType === "m") {
    const b = formatBase(exercice.base, exercice.baseEstE);
    return `1-${b}^{-x}`;
  }
  const { base1, base2, c } = exercice;
  const termeC = c === 1 ? `\\left(\\dfrac{1}{${base2}}\\right)^x` : `${c}\\cdot\\left(\\dfrac{1}{${base2}}\\right)^x`;
  return `\\left(\\dfrac{${base1}}{${base2}}\\right)^x-${termeC}`;
}

function consigneE(phase: "eDomaine" | "eSimplifier" | "eDerivee"): string {
  if (phase === "eDomaine") return CONSIGNE_DOMAINE;
  if (phase === "eSimplifier") return "Simplifie l'écriture de f(x) AVANT toute dérivation (utilise les propriétés des exposants).";
  return "Dérive la forme SIMPLIFIÉE et CORRECTE de l'étape précédente (dérivée directe, nettement plus simple).";
}

function texteProprieteE(exercice: ExerciceDomaineDeriveeE): string {
  if (exercice.sousType === "j") return "Propriété : a^m/a^n = a^(m-n) — soustrais les exposants, ne simplifie rien d'autre.";
  if (exercice.sousType === "m") return "Sépare la fraction en 2 termes : (A-B)/C = A/C - B/C.";
  return "Sépare la fraction en 2 termes, puis regroupe chaque puissance : a^x/b^x = (a/b)^x.";
}

function aideENiveau1(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Le domaine d'une exponentielle (et de tout quotient d'exponentielles, jamais nulles) est toujours ℝ.", latex: null };
  if (phase === "eSimplifier") return { texte: texteProprieteE(exercice), latex: null };
  return { texte: "La forme simplifiée est une simple exponentielle (ou somme de 2 exponentielles) — dérive-la directement, sans repasser par la règle du quotient.", latex: null };
}

function aideENiveau2(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Domaine :", latex: "\\mathbb{R}" };
  if (phase === "eSimplifier") {
    if (exercice.sousType === "j") return { texte: "Première étape (exposants pas encore combinés) :", latex: `${formatBase(exercice.base, exercice.baseEstE)}^{${formatGA(exercice.g)}-${formatGA(exercice.h)}}` };
    if (exercice.sousType === "m") return { texte: "Première étape (fraction séparée, pas encore simplifiée) :", latex: `\\frac{${formatBase(exercice.base, exercice.baseEstE)}^x}{${formatBase(exercice.base, exercice.baseEstE)}^x} - \\frac{1}{${formatBase(exercice.base, exercice.baseEstE)}^x}` };
    return { texte: "Première étape (fraction séparée, pas encore regroupée) :", latex: `\\frac{${exercice.base1}^x}{${exercice.base2}^x} - ${exercice.c}\\cdot\\frac{1}{${exercice.base2}^x}` };
  }
  return { texte: "Rappel de la dérivée d'une exponentielle simple :", latex: "\\frac{d}{dx}\\left[\\text{base}^{x}\\right] = \\ln(\\text{base})\\cdot\\text{base}^{x}" };
}

// ============================================================================
// Famille F
// ============================================================================

function formatFonctionF(exercice: ExerciceDomaineDeriveeF): string {
  const trigLatex = exercice.trig === "cos" ? "\\cos" : "\\arccos";
  return `${trigLatex}\\left(e^{x^2-${exercice.k}}\\right)`;
}

function consigneF(phase: "fDomaine" | "fDerivee"): string {
  return phase === "fDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction (chaîne à 3 niveaux : fonction extérieure, exponentielle, exposant).";
}

function aideFNiveau1(phase: "fDomaine" | "fDerivee", exercice: ExerciceDomaineDeriveeF): AideAvecLatex {
  if (phase === "fDomaine") {
    if (exercice.trig === "cos") return { texte: "cos est défini partout — aucune restriction ici.", latex: null };
    return {
      texte: "arccos(w) exige -1≤w≤1. Une exponentielle est TOUJOURS strictement positive — donc TOUJOURS > -1 : cette condition est automatique, seule w≤1 reste à résoudre.",
      latex: null,
    };
  }
  return { texte: "3 niveaux de chaîne à enchaîner, énumérés de l'extérieur vers l'intérieur (sans encore substituer) :", latex: "\\text{trig}(w),\\quad w=e^{v},\\quad v=x^2-k" };
}

function aideFNiveau2(phase: "fDomaine" | "fDerivee", exercice: ExerciceDomaineDeriveeF): AideAvecLatex {
  if (phase === "fDomaine") {
    if (exercice.trig === "cos") return { texte: "Domaine :", latex: "\\mathbb{R}" };
    return { texte: "Inéquation restante (non résolue) :", latex: `e^{x^2-${exercice.k}} \\leq 1` };
  }
  const w = `e^{x^2-${exercice.k}}`;
  const wPrime = `2x\\cdot ${w}`;
  return {
    texte: "Dérivée de chaque niveau séparément — assemblage final laissé à toi :",
    latex: `\\begin{gathered} w'(x) = ${wPrime} \\\\ \\text{trig}'(w) = ${exercice.trig === "cos" ? "-\\sin(w)" : "-\\dfrac{1}{\\sqrt{1-w^2}}"} \\end{gathered}`,
  };
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : "consigne générale et bloc de
 * données... redondants sur chaque écran"). */
export function formatFonctionLatex(exercice: ExerciceDomaineDeriveeExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return `f(x) = ${formatFonctionA(exercice)}`;
    case "B":
      return `f(x) = ${formatFonctionB(exercice)}`;
    case "C":
      return `f(x) = ${formatFonctionC(exercice)}`;
    case "D":
      return `f(x) = ${formatFonctionD(exercice)}`;
    case "E":
      return `f(x) = ${formatFonctionEOrigine(exercice)}`;
    case "F":
      return `f(x) = ${formatFonctionF(exercice)}`;
  }
}

/**
 * Bloc « état actuel » (`EtatActuelPanel`, convention CLAUDE.md) — `null` pour les familles A/B/F
 * (TOUS écrans) et pour le premier écran de chaque famille C/D/E, ainsi que pour "cFacteurs"/
 * "dND"/"eSimplifier" : conforme à la décision de conception explicite du contrat
 * (`core6e/domaineDeriveeExponentielles.types.ts`, "deux tâches INDÉPENDANTES, jamais une
 * cascade") — le domaine ne conditionne JAMAIS le contenu des écrans de dérivée, il n'y a donc
 * jamais rien à rappeler à leur sujet. Non-`null` UNIQUEMENT quand un écran de dérivée réutilise
 * réellement la vérité mathématique CONFIRMÉE d'un écran de dérivée antérieur, à l'intérieur de la
 * même famille : `cAssemblage` (u'(x)/v'(x) de `cFacteurs`), `dAssemblage` (N'(x)/D'(x) de `dND`),
 * `eDerivee` (forme simplifiée de `eSimplifier`) — même principe que `formatDomaineDeriveeLogarithme.ts`
 * (`6gen13`, structure domaine+dérivée identique, même chapitre).
 */
export function etatActuel(exercice: ExerciceDomaineDeriveeExponentielle, phase: PhaseDomaineDeriveeExponentielle): string[] | null {
  if (exercice.famille === "C" && phase === "cAssemblage") {
    const { uPrime, vPrime } = deriveesFacteursC(exercice);
    return [`u'(x) = ${uPrime}`, `v'(x) = ${vPrime}`];
  }
  if (exercice.famille === "D" && phase === "dAssemblage") {
    const { nPrime, dPrime } = deriveesND(exercice);
    return [`N'(x) = ${nPrime}`, `D'(x) = ${dPrime}`];
  }
  if (exercice.famille === "E" && phase === "eDerivee") {
    return [`f(x) = ${formeSimplifieeLatexE(exercice)}\\ \\text{(forme simplifiée confirmée)}`];
  }
  return null;
}

export function consigneEcran(phase: PhaseDomaineDeriveeExponentielle, exercice: ExerciceDomaineDeriveeExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aDomaine" | "aDerivee");
    case "B":
      return consigneB(phase as "bDomaine" | "bDerivee");
    case "C":
      return consigneC(phase as "cDomaine" | "cFacteurs" | "cAssemblage");
    case "D":
      return consigneD(phase as "dDomaine" | "dND" | "dAssemblage");
    case "E":
      return consigneE(phase as "eDomaine" | "eSimplifier" | "eDerivee");
    case "F":
      return consigneF(phase as "fDomaine" | "fDerivee");
  }
}

export function aideNiveau1(phase: PhaseDomaineDeriveeExponentielle, exercice: ExerciceDomaineDeriveeExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau1(phase as "aDomaine" | "aDerivee");
    case "B":
      return aideBNiveau1(phase as "bDomaine" | "bDerivee", exercice);
    case "C":
      return aideCNiveau1(phase as "cDomaine" | "cFacteurs" | "cAssemblage");
    case "D":
      return aideDNiveau1(phase as "dDomaine" | "dND" | "dAssemblage");
    case "E":
      return aideENiveau1(phase as "eDomaine" | "eSimplifier" | "eDerivee", exercice);
    case "F":
      return aideFNiveau1(phase as "fDomaine" | "fDerivee", exercice);
  }
}

export function aideNiveau2(phase: PhaseDomaineDeriveeExponentielle, exercice: ExerciceDomaineDeriveeExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau2(phase as "aDomaine" | "aDerivee", exercice);
    case "B":
      return aideBNiveau2(phase as "bDomaine" | "bDerivee", exercice);
    case "C":
      return aideCNiveau2(phase as "cDomaine" | "cFacteurs" | "cAssemblage", exercice);
    case "D":
      return aideDNiveau2(phase as "dDomaine" | "dND" | "dAssemblage", exercice);
    case "E":
      return aideENiveau2(phase as "eDomaine" | "eSimplifier" | "eDerivee", exercice);
    case "F":
      return aideFNiveau2(phase as "fDomaine" | "fDerivee", exercice);
  }
}

/** Labels des 2 champs des écrans "cFacteurs"/"dND" (dispatch par famille). */
export function labelsDeuxChamps(exercice: ExerciceDomaineDeriveeExponentielle): { a: string; b: string } {
  if (exercice.famille === "C") return { a: "u'(x) =", b: "v'(x) =" };
  return { a: "N'(x) =", b: "D'(x) =" };
}

export interface TotalPointsRecap {
  points: number;
  maximum: number;
}

/**
 * Total de points du récapitulatif final — SOMME des scores déjà pénalisés (tentatives + aide) sur
 * chaque écran RÉELLEMENT traversé (2 ou 3 selon la famille), affiché EN COMPLÉMENT de la liste
 * colorée `LigneRecap`/`statutRecap` (jamais à sa place, voir CLAUDE.md "récapitulatif final à plat,
 * coloré"). Même principe et même formule RÉELLE que `totalPointsLimiteExponentielle` (`6gen6`,
 * `formatLimitesExponentielles.ts`) — dupliqué ici plutôt que partagé (chaque générateur garde son
 * propre moteur/session, voir CLAUDE.md "architecture") : un écran correct au 2e essai sans aide
 * peut valoir 67/100 (VERT) plutôt que 100/100, intentionnel. Ne consulte JAMAIS
 * `details`/`revele`/`niveauAide` : deux informations INDÉPENDANTES du même écran (couleur vs
 * points, voir `DetailPhaseDomaineDeriveeExponentielle`) — un écran ORANGE (aidé, jamais révélé)
 * peut valoir exactement 0 point, tout comme un écran ROUGE (révélé) ; la somme reste correcte sans
 * distinction de cas.
 */
export function totalPointsDomaineDeriveeExponentielle(resultat: ResultatExerciceDomaineDeriveeExponentielle): TotalPointsRecap {
  switch (resultat.famille) {
    case "A":
    case "B":
    case "F":
      return { points: resultat.scoreDomaine + resultat.scoreDerivee, maximum: 200 };
    case "C":
      return { points: resultat.scoreDomaine + resultat.scoreFacteurs + resultat.scoreAssemblage, maximum: 300 };
    case "D":
      return { points: resultat.scoreDomaine + resultat.scoreND + resultat.scoreAssemblage, maximum: 300 };
    case "E":
      return { points: resultat.scoreDomaine + resultat.scoreSimplifier + resultat.scoreDerivee, maximum: 300 };
  }
}
