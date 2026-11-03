import type {
  ExerciceDomaineDeriveeLogA,
  ExerciceDomaineDeriveeLogB,
  ExerciceDomaineDeriveeLogC,
  ExerciceDomaineDeriveeLogD,
  ExerciceDomaineDeriveeLogE,
  ExerciceDomaineDeriveeLogF,
  ExerciceDomaineDeriveeLogG,
  ExerciceDomaineDeriveeLogarithme,
} from "../core6e/domaineDeriveeLogarithme.types";
import type { PhaseDomaineDeriveeLogarithme } from "../moteur6e/typesDomaineDeriveeLogarithme";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen16`. Toute aide qui embarque un symbole
 * LaTeX est retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut (piège
 * déjà rencontré ailleurs sur ce chantier, voir CLAUDE.md). Structure calquée sur
 * `formatExponentiellesProblemes.ts` (`6gen12`, le plus récent des générateurs 6e) :
 * `consigneGenerale`/`blocDonnees`/`etatActuel` séparés (structure d'écran imposée par CLAUDE.md :
 * consigne générale → bloc données → bloc "état actuel" → bloc de travail).
 */
export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

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

const CONSIGNE_DOMAINE = "Détermine le domaine de définition de cette fonction.";

export function consigneGenerale(exercice: ExerciceDomaineDeriveeLogarithme): FragmentConsigne[] {
  if (exercice.famille === "G") return [texte("Dérive la fonction suivante par dérivation logarithmique implicite ("), latex("f(x)=u(x)^{v(x)}"), texte(") :")];
  return [texte("Détermine le domaine puis calcule la dérivée de la fonction suivante :")];
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

/** Jamais de coefficient `±1` littéral, jamais de terme nul affiché, jamais de double signe —
 * même convention que `formatDomaineDeriveeExponentielles.ts` (6gen7). */
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

function formatBase(base: number, baseEstE: boolean): string {
  return baseEstE ? "e" : String(base);
}

/** log_base(u) — `\ln(u)` si base=e, `\log_{base}(u)` sinon. */
function formatLog(u: string, base: number, baseEstE: boolean): string {
  return baseEstE ? `\\ln(${u})` : `\\log_{${base}}(${u})`;
}

/** `x-p` / `x+|p|` / `x` selon le signe de `p` — jamais `x+-3` ni `x-0`. */
function formatXMoins(p: number): string {
  if (p === 0) return "x";
  return p > 0 ? `x-${p}` : `x+${-p}`;
}

/** `mx+n` affiché (jamais de coefficient ±1 littéral ni de terme nul). */
function formatAffine(m: number, n: number): string {
  return formatSommeTermes([
    { valeur: m, suffixe: "x" },
    { valeur: n, suffixe: "" },
  ]);
}

/** `k·x` affiché — `x` si k=1. */
function formatKx(k: number): string {
  return k === 1 ? "x" : `${k}x`;
}

/** Fraction LaTeX `num/den` précédée de son signe : `-\dfrac{3}{…}` plutôt que `\dfrac{-3}{…}`. */
function fractionSignee(numerateur: number, reste: string, denominateur: string): string {
  const abs = Math.abs(numerateur);
  const corps = `\\dfrac{${abs === 1 && reste !== "" ? "" : abs}${reste}}{${denominateur}}`;
  return numerateur < 0 ? `-${corps}` : corps;
}

/** `· ln(base)` dans un dénominateur — rien si la base est e (ln(e)=1, audit 6e ch. 3, point 28 :
 * le corrigé affichait « ·ln(e) »). */
function facteurLnBase(base: number, baseEstE: boolean): string {
  return baseEstE ? "" : `\\ln(${base})`;
}

// ============================================================================
// Famille A
// ============================================================================

function formatFonctionA(exercice: ExerciceDomaineDeriveeLogA): string {
  const { base, baseEstE } = exercice;
  if (exercice.sousType === "puissance") return formatLog(`${exercice.k}^x`, base, baseEstE);
  if (exercice.sousType === "carre") return formatLog(`x^2+${exercice.c}`, base, baseEstE);
  return formatLog(formatAffine(exercice.m, exercice.n), base, baseEstE);
}

function argumentA(exercice: ExerciceDomaineDeriveeLogA): { u: string; uPrime: string } {
  if (exercice.sousType === "puissance") return { u: `${exercice.k}^x`, uPrime: `\\ln(${exercice.k})\\cdot ${exercice.k}^x` };
  if (exercice.sousType === "carre") return { u: `x^2+${exercice.c}`, uPrime: "2x" };
  return { u: formatAffine(exercice.m, exercice.n), uPrime: `${exercice.m}` };
}

function deriveeLatexA(exercice: ExerciceDomaineDeriveeLogA): string {
  const lnB = facteurLnBase(exercice.base, exercice.baseEstE);
  if (exercice.sousType === "puissance") return exercice.baseEstE ? `\\ln(${exercice.k})` : `\\dfrac{\\ln(${exercice.k})}{\\ln(${exercice.base})}`;
  if (exercice.sousType === "carre") return lnB === "" ? `\\dfrac{2x}{x^2+${exercice.c}}` : `\\dfrac{2x}{(x^2+${exercice.c})${lnB}}`;
  const arg = formatAffine(exercice.m, exercice.n);
  return fractionSignee(exercice.m, "", lnB === "" ? arg : `(${arg})${lnB}`);
}

function consigneA(phase: "aDomaine" | "aDerivee"): FragmentConsigne[] {
  return [texte(phase === "aDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction.")];
}

function aideANiveau1(phase: "aDomaine" | "aDerivee"): AideAvecLatex {
  if (phase === "aDomaine") return { texte: "Un logarithme n'est défini que si son argument est strictement positif.", latex: null };
  return { texte: "Rappel de la formule générique (attention, ln(e)=1 si la base est e) :", latex: "\\frac{d}{dx}\\left[\\log_{\\text{base}}(u)\\right] = \\frac{u'(x)}{u(x)\\cdot\\ln(\\text{base})}" };
}

/** Audit 6e ch. 3, point 9 : l'aide 2 de la dérivée était la dérivée complète (acceptée telle
 * quelle) et celle du domaine affichait « ℝ » — elles s'arrêtent désormais avant la réponse. */
function aideANiveau2(phase: "aDomaine" | "aDerivee", exercice: ExerciceDomaineDeriveeLogA): AideAvecLatex {
  const { u, uPrime } = argumentA(exercice);
  if (phase === "aDomaine") return { texte: "Inéquation à étudier (non résolue) — pour quels x l'argument est-il strictement positif ?", latex: `${u} > 0` };
  return { texte: `Argument et sa dérivée (base ${formatBase(exercice.base, exercice.baseEstE)}) — il reste à les placer dans la formule :`, latex: `u(x) = ${u},\\qquad u'(x) = ${uPrime}` };
}

// ============================================================================
// Famille B
// ============================================================================

function formatFonctionB(exercice: ExerciceDomaineDeriveeLogB): string {
  if (exercice.sousType === "doubleContrainte") return `\\sqrt{1-${formatLog(formatAffine(exercice.m, exercice.n), exercice.base, false)}}`;
  if (exercice.sousType === "racineInterne") return formatLog("\\sqrt{1-x^2}", exercice.base, false);
  if (exercice.sousType === "quadratique") return formatLog(`x^2-${exercice.k}^2`, exercice.base, false);
  return formatLog(`\\sqrt{${formatXMoins(exercice.p)}}`, exercice.base, false);
}

function deriveeLatexB(exercice: ExerciceDomaineDeriveeLogB): string {
  const b = exercice.base;
  if (exercice.sousType === "doubleContrainte") {
    const arg = formatAffine(exercice.m, exercice.n);
    return fractionSignee(-exercice.m, "", `2(${arg})\\ln(${b})\\sqrt{1-\\log_{${b}}(${arg})}`);
  }
  if (exercice.sousType === "racineInterne") return `-\\dfrac{x}{(1-x^2)\\ln(${b})}`;
  if (exercice.sousType === "quadratique") return `\\dfrac{2x}{(x^2-${exercice.k * exercice.k})\\ln(${b})}`;
  return `\\dfrac{1}{2(${formatXMoins(exercice.p)})\\ln(${b})}`;
}

function consigneB(phase: "bDomaine" | "bDerivee"): FragmentConsigne[] {
  return [texte(phase === "bDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction.")];
}

function aideBNiveau1(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeLogB): AideAvecLatex {
  if (phase === "bDomaine") {
    if (exercice.sousType === "doubleContrainte") return { texte: "Attention : il y a ICI DEUX conditions à croiser, pas une seule (l'argument du log ET le radicande).", latex: null };
    if (exercice.sousType === "racineInterne") return { texte: "L'argument du log (une racine) doit être strictement positif, et son intérieur doit être ≥ 0.", latex: null };
    if (exercice.sousType === "quadratique") return { texte: "L'argument du log doit être strictement positif — résous une inéquation quadratique.", latex: null };
    return { texte: "L'argument du log est une racine : elle doit exister ET être strictement positive.", latex: null };
  }
  return { texte: "Rappel de la formule générique — attention à la chaîne (dérivée de l'intérieur en plus) :", latex: "\\frac{d}{dx}\\left[\\log_{\\text{base}}(u)\\right] = \\frac{u'(x)}{u(x)\\cdot\\ln(\\text{base})}" };
}

function aideBNiveau2(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeLogB): AideAvecLatex {
  if (phase === "bDomaine") {
    if (exercice.sousType === "doubleContrainte") {
      const arg = formatAffine(exercice.m, exercice.n);
      return { texte: "Les deux inéquations, affichées séparément (intersection non faite) :", latex: `\\begin{gathered} ${arg} > 0 \\\\ ${arg} \\leq ${exercice.base} \\end{gathered}` };
    }
    if (exercice.sousType === "racineInterne") return { texte: "Conditions séparées :", latex: "\\begin{gathered} 1-x^2 \\geq 0 \\\\ \\sqrt{1-x^2} > 0 \\end{gathered}" };
    if (exercice.sousType === "quadratique") return { texte: "Inéquation à résoudre :", latex: `x^2-${exercice.k}^2 > 0` };
    return { texte: "Les deux conditions (à combiner) :", latex: `\\begin{gathered} ${formatXMoins(exercice.p)} \\geq 0 \\\\ \\sqrt{${formatXMoins(exercice.p)}} > 0 \\end{gathered}` };
  }
  const b = exercice.base;
  if (exercice.sousType === "doubleContrainte") {
    const arg = formatAffine(exercice.m, exercice.n);
    return { texte: "Fonction intérieure et sa dérivée (règle de la chaîne, pas encore assemblées) :", latex: `w(x) = 1-\\log_{${b}}(${arg}),\\qquad w'(x) = ${fractionSignee(-exercice.m, "", `(${arg})\\ln(${b})`)}` };
  }
  if (exercice.sousType === "racineInterne") return { texte: "Argument et sa dérivée — il reste à les placer dans la formule :", latex: `u(x) = \\sqrt{1-x^2},\\qquad u'(x) = -\\dfrac{x}{\\sqrt{1-x^2}}` };
  if (exercice.sousType === "quadratique") return { texte: "Argument et sa dérivée — il reste à les placer dans la formule :", latex: `u(x) = x^2-${exercice.k}^2,\\qquad u'(x) = 2x` };
  return { texte: "Argument et sa dérivée — il reste à les placer dans la formule :", latex: `u(x) = \\sqrt{${formatXMoins(exercice.p)}},\\qquad u'(x) = \\dfrac{1}{2\\sqrt{${formatXMoins(exercice.p)}}}` };
}

// ============================================================================
// Famille C
// ============================================================================

function facteursLatexC(exercice: ExerciceDomaineDeriveeLogC): { u: string; uPrime: string; v: string; vPrime: string } {
  if (exercice.sousType === "produitLn") return { u: `${exercice.k}x`, uPrime: `${exercice.k}`, v: "\\ln(x)", vPrime: "\\dfrac{1}{x}" };
  if (exercice.sousType === "trigLn") {
    const trig = exercice.trig === "sin" ? "\\sin(x)" : "\\cos(x)";
    const trigPrime = exercice.trig === "sin" ? "\\cos(x)" : "-\\sin(x)";
    const trig2 = exercice.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)";
    const trig2Prime = exercice.trig2 === "sin" ? "\\cos(x)" : "-\\sin(x)";
    return { u: trig, uPrime: trigPrime, v: `\\ln(2+${trig2})`, vPrime: `\\dfrac{${trig2Prime}}{2+${trig2}}` };
  }
  if (exercice.sousType === "expoLn") {
    const b = formatBase(exercice.base, exercice.baseEstE);
    const uPrime = exercice.baseEstE ? "e^x" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x`;
    return { u: `${b}^x`, uPrime, v: "\\ln(x)", vPrime: "\\dfrac{1}{x}" };
  }
  if (exercice.sousType === "carreLn") {
    const arg = formatAffine(exercice.m, exercice.n);
    return { u: "x^2", uPrime: "2x", v: `\\ln(${arg})`, vPrime: fractionSignee(exercice.m, "", arg) };
  }
  const { k } = exercice;
  return { u: "\\ln(x)", uPrime: "\\dfrac{1}{x}", v: `\\sqrt{x^2-${k}^2}`, vPrime: `\\dfrac{x}{\\sqrt{x^2-${k}^2}}` };
}

function formatFonctionC(exercice: ExerciceDomaineDeriveeLogC): string {
  const { u, v } = facteursLatexC(exercice);
  return `(${u})\\cdot ${v}`;
}

/** f'(x)=u'v+uv', déjà simplifiée quand c'est immédiat (kx·1/x = k...). */
function deriveeLatexC(exercice: ExerciceDomaineDeriveeLogC): string {
  switch (exercice.sousType) {
    case "produitLn":
      return `${exercice.k}\\ln(x)+${exercice.k}`;
    case "trigLn": {
      const { uPrime, u } = facteursLatexC(exercice);
      const trig2 = exercice.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)";
      const second = exercice.trig2 === "sin" ? `+\\dfrac{${u}\\cos(x)}{2+${trig2}}` : `-\\dfrac{${u}\\sin(x)}{2+${trig2}}`;
      return `${uPrime}\\ln(2+${trig2})${second}`;
    }
    case "expoLn":
      return exercice.baseEstE ? "e^x\\ln(x)+\\dfrac{e^x}{x}" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x\\ln(x)+\\dfrac{${exercice.base}^x}{x}`;
    case "carreLn": {
      const arg = formatAffine(exercice.m, exercice.n);
      const second = fractionSignee(exercice.m, "x^2", arg);
      return `2x\\ln(${arg})${second.startsWith("-") ? "" : "+"}${second}`;
    }
    case "lnRacine":
      return `\\dfrac{\\sqrt{x^2-${exercice.k}^2}}{x}+\\dfrac{x\\ln(x)}{\\sqrt{x^2-${exercice.k}^2}}`;
  }
}

function consigneC(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): FragmentConsigne[] {
  if (phase === "cDomaine") return [texte(CONSIGNE_DOMAINE)];
  if (phase === "cFacteurs") return [texte("Dérive chaque facteur SÉPARÉMENT ("), latex("u'(x)"), texte(" et "), latex("v'(x)"), texte(").")];
  return [texte("Assemble via "), latex("u'v+uv'"), texte(", à partir des dérivées CORRECTES de l'étape précédente.")];
}

function aideCNiveau1(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): AideAvecLatex {
  if (phase === "cDomaine") return { texte: "Un produit de fonctions hérite des conditions de CHACUN de ses facteurs.", latex: null };
  if (phase === "cFacteurs") return { texte: "Identifie u(x) et v(x) séparément à partir de f(x)=u(x)·v(x), puis dérive chacun indépendamment.", latex: "f(x)=u(x)\\cdot v(x)" };
  return { texte: "Rappel de la formule du produit (non substituée) :", latex: "(uv)' = u'v + uv'" };
}

/** Sous-expressions qui imposent une condition — jamais le domaine lui-même (audit 6e ch. 3,
 * point 9 : l'aide 2 affichait « x>0 », la réponse). */
function conditionsDomaineC(exercice: ExerciceDomaineDeriveeLogC): string {
  switch (exercice.sousType) {
    case "produitLn":
    case "expoLn":
      return "\\ln(x)\\ :\\ \\text{argument} > 0";
    case "trigLn":
      return `\\ln\\left(2+${exercice.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)"}\\right)\\ :\\ \\text{encadre } ${exercice.trig2 === "sin" ? "\\sin(x)" : "\\cos(x)"}`;
    case "carreLn":
      return `\\ln(${formatAffine(exercice.m, exercice.n)})\\ :\\ \\text{argument} > 0`;
    case "lnRacine":
      return `\\begin{gathered} \\ln(x)\\ :\\ \\text{argument} > 0 \\\\ \\sqrt{x^2-${exercice.k}^2}\\ :\\ \\text{radicande} \\geq 0 \\end{gathered}`;
  }
}

function aideCNiveau2(phase: "cDomaine" | "cFacteurs" | "cAssemblage", exercice: ExerciceDomaineDeriveeLogC): AideAvecLatex {
  const { u, uPrime, v, vPrime } = facteursLatexC(exercice);
  if (phase === "cDomaine") return { texte: "Sous-expressions qui imposent une condition (à résoudre puis croiser) :", latex: conditionsDomaineC(exercice) };
  if (phase === "cFacteurs") return { texte: "u(x) et v(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} u(x) = ${u} \\\\ v(x) = ${v} \\end{gathered}` };
  return { texte: "u, v, u' et v' (déjà confirmés à l'étape précédente) :", latex: `u=${u},\\ v=${v},\\ u'=${uPrime},\\ v'=${vPrime}` };
}

// ============================================================================
// Famille D
// ============================================================================

function nDLatexD(exercice: ExerciceDomaineDeriveeLogD): { n: string; nPrime: string; d: string; dPrime: string } {
  if (exercice.sousType === "sommeLog") {
    const n = exercice.baseEstE ? "x+\\ln(x)" : `x+\\log_{${exercice.base}}(x)`;
    const nPrime = exercice.baseEstE ? "1+\\dfrac{1}{x}" : `1+\\dfrac{1}{x\\ln(${exercice.base})}`;
    return { n: `${n}`, nPrime, d: "x", dPrime: "1" };
  }
  if (exercice.sousType === "lnSurKx") return { n: "\\ln(x)", nPrime: "\\dfrac{1}{x}", d: `${exercice.k}x`, dPrime: `${exercice.k}` };
  const b = formatBase(exercice.base, exercice.baseEstE);
  const n = `${b}^x+x`;
  const nPrime = exercice.baseEstE ? "e^x+1" : `\\ln(${exercice.base})\\cdot ${exercice.base}^x+1`;
  return { n, nPrime, d: "\\ln(x)", dPrime: "\\dfrac{1}{x}" };
}

function formatFonctionD(exercice: ExerciceDomaineDeriveeLogD): string {
  const { n, d } = nDLatexD(exercice);
  return `\\frac{${n}}{${d}}`;
}

/** f'(x)=(N'D−ND')/D², simplifiée quand c'est immédiat. */
function deriveeLatexD(exercice: ExerciceDomaineDeriveeLogD): string {
  if (exercice.sousType === "sommeLog") return exercice.baseEstE ? "\\dfrac{1-\\ln(x)}{x^2}" : `\\dfrac{1-\\ln(x)}{x^2\\ln(${exercice.base})}`;
  if (exercice.sousType === "lnSurKx") return `\\dfrac{1-\\ln(x)}{${exercice.k}x^2}`;
  const { n, nPrime } = nDLatexD(exercice);
  return `\\dfrac{\\left(${nPrime}\\right)\\ln(x)-\\dfrac{${n}}{x}}{\\left(\\ln(x)\\right)^2}`;
}

function consigneD(phase: "dDomaine" | "dND" | "dAssemblage"): FragmentConsigne[] {
  if (phase === "dDomaine") return [texte(CONSIGNE_DOMAINE)];
  if (phase === "dND") return [texte("Dérive le numérateur N ET le dénominateur D SÉPARÉMENT ("), latex("N'(x)"), texte(" et "), latex("D'(x)"), texte(").")];
  return [texte("Assemble via "), latex("(N'D-ND')/D^2"), texte(", à partir des valeurs "), latex("N'/D'"), texte(" CORRECTES de l'étape précédente.")];
}

function aideDNiveau1(phase: "dDomaine" | "dND" | "dAssemblage", exercice: ExerciceDomaineDeriveeLogD): AideAvecLatex {
  if (phase === "dDomaine") {
    if (exercice.sousType === "expoSurLn") return { texte: "Le dénominateur d'une fraction doit être non nul — vérifie si l'expression du dénominateur peut s'annuler, même si elle 'a l'air' toujours définie.", latex: null };
    return { texte: "N'oublie pas la condition du logarithme (argument strictement positif), ni celle du dénominateur.", latex: null };
  }
  if (phase === "dND") return { texte: "Identifie N(x) et D(x) séparément à partir de f(x)=N(x)/D(x), puis dérive chacun indépendamment.", latex: "f(x)=\\dfrac{N(x)}{D(x)}" };
  return { texte: "Rappel de la formule du quotient (non substituée) :", latex: "\\left(\\frac{N}{D}\\right)' = \\frac{N'D - ND'}{D^2}" };
}

function aideDNiveau2(phase: "dDomaine" | "dND" | "dAssemblage", exercice: ExerciceDomaineDeriveeLogD): AideAvecLatex {
  const { n, nPrime, d, dPrime } = nDLatexD(exercice);
  if (phase === "dDomaine") {
    if (exercice.sousType === "expoSurLn") return { texte: "Conditions à croiser (non résolues) :", latex: "\\begin{gathered} x > 0 \\\\ \\ln(x) \\neq 0 \\end{gathered}" };
    return { texte: "Conditions à croiser (non résolues) :", latex: `\\begin{gathered} \\text{argument du log} > 0 \\\\ ${d} \\neq 0 \\end{gathered}` };
  }
  if (phase === "dND") return { texte: "N(x) et D(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} N(x) = ${n} \\\\ D(x) = ${d} \\end{gathered}` };
  return { texte: "N, D, N' et D' (déjà confirmés à l'étape précédente) :", latex: `N=${n},\\ D=${d},\\ N'=${nPrime},\\ D'=${dPrime}` };
}

// ============================================================================
// Famille E
// ============================================================================

function formatFonctionEOrigine(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "\\ln\\left((e^x-1)^2\\right)";
    case "quotientDifference":
      return `\\ln\\left(\\dfrac{${formatAffine(exercice.m, exercice.n)}}{${formatAffine(exercice.p, exercice.q)}}\\right)`;
    case "puissanceSimple":
      return "\\ln(\\sqrt{x})";
    case "combinaison":
      return "(\\ln x)^3-\\ln(x^3)";
    case "valeurAbsolueQuadratique":
      return `\\ln\\left((x^2-${exercice.k}^2)^2\\right)`;
    case "dejaSimplifie":
      return "\\ln(x^x)";
  }
}

function formeSimplifieeLatexE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "2\\ln\\left|e^x-1\\right|";
    case "quotientDifference":
      return `\\ln(${formatAffine(exercice.m, exercice.n)})-\\ln(${formatAffine(exercice.p, exercice.q)})`;
    case "puissanceSimple":
      return "\\dfrac{1}{2}\\ln(x)";
    case "combinaison":
      return "(\\ln x)^3-3\\ln(x)";
    case "valeurAbsolueQuadratique":
      return `2\\ln\\left|x^2-${exercice.k}^2\\right|`;
    case "dejaSimplifie":
      return "x\\ln(x)";
  }
}

function deriveeSimplifieeLatexE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "\\dfrac{2e^x}{e^x-1}";
    case "quotientDifference": {
      const premier = fractionSignee(exercice.m, "", formatAffine(exercice.m, exercice.n));
      const second = fractionSignee(-exercice.p, "", formatAffine(exercice.p, exercice.q));
      return `${premier}${second.startsWith("-") ? "" : "+"}${second}`;
    }
    case "puissanceSimple":
      return "\\dfrac{1}{2x}";
    case "combinaison":
      return "\\dfrac{3(\\ln x)^2}{x}-\\dfrac{3}{x}";
    case "valeurAbsolueQuadratique":
      return `\\dfrac{4x}{x^2-${exercice.k * exercice.k}}`;
    case "dejaSimplifie":
      return "\\ln(x)+1";
  }
}

function consigneE(phase: "eDomaine" | "eSimplifier" | "eDerivee"): FragmentConsigne[] {
  if (phase === "eDomaine") return [texte("Détermine le domaine de définition de cette fonction ORIGINALE (avant toute simplification).")];
  if (phase === "eSimplifier") return [texte("Simplifie l'écriture de f(x) à l'aide des propriétés du logarithme (puissance, quotient, produit).")];
  return [texte("Dérive la forme SIMPLIFIÉE et CORRECTE de l'étape précédente (nettement plus simple qu'une dérivation directe).")];
}

function texteProprieteE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
    case "valeurAbsolueQuadratique":
      return "Propriété de la puissance : ln(u²) = 2ln|u| — ATTENTION, la valeur absolue est indispensable (u peut être négatif).";
    case "quotientDifference":
      return "Propriété du quotient : ln(a/b) = ln(a)−ln(b) — valable seulement si a ET b sont positifs SÉPARÉMENT (pas juste leur quotient).";
    case "puissanceSimple":
      return "Propriété de la puissance : ln(√x) = ln(x^(1/2)).";
    case "combinaison":
      return "Propriété de la puissance : ln(x³) = 3ln(x) — n'affecte QUE ce terme, (ln x)³ reste inchangé (ce n'est pas ln d'une puissance).";
    case "dejaSimplifie":
      return "Propriété de la puissance : ln(x^x) = x·ln(x), même si x est lui-même l'exposant.";
  }
}

function aideENiveau1(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeLogE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Calcule le domaine sur l'expression ORIGINALE — n'anticipe pas la simplification.", latex: null };
  if (phase === "eSimplifier") {
    const latexProprieteE: Record<ExerciceDomaineDeriveeLogE["sousType"], string> = {
      puissanceAbs: "\\ln(u^2)=2\\ln|u|",
      valeurAbsolueQuadratique: "\\ln(u^2)=2\\ln|u|",
      quotientDifference: "\\ln\\left(\\dfrac{a}{b}\\right)=\\ln(a)-\\ln(b)",
      puissanceSimple: "\\ln\\left(x^{r}\\right)=r\\ln(x)",
      combinaison: "\\ln(x^3)=3\\ln(x)",
      dejaSimplifie: "\\ln(x^x)=x\\cdot\\ln(x)",
    };
    return { texte: texteProprieteE(exercice), latex: latexProprieteE[exercice.sousType] };
  }
  return { texte: "La forme simplifiée est nettement plus simple à dériver — dérive-la directement, terme à terme.", latex: "\\left(\\ln u\\right)' = \\dfrac{u'}{u}" };
}

/** Condition(s) du domaine de l'expression ORIGINALE, non résolues (audit 6e ch. 3, point 9 : l'aide
 * donnait le domaine, et renvoyait à un « bloc données » qui ne le contient pas). */
function conditionsDomaineE(exercice: ExerciceDomaineDeriveeLogE): string {
  switch (exercice.sousType) {
    case "puissanceAbs":
      return "(e^x-1)^2 > 0";
    case "quotientDifference":
      return `\\dfrac{${formatAffine(exercice.m, exercice.n)}}{${formatAffine(exercice.p, exercice.q)}} > 0`;
    case "puissanceSimple":
      return "x \\geq 0 \\quad\\text{et}\\quad \\sqrt{x} > 0";
    case "combinaison":
      return "x > 0 \\quad\\text{et}\\quad x^3 > 0";
    case "valeurAbsolueQuadratique":
      return `(x^2-${exercice.k}^2)^2 > 0`;
    case "dejaSimplifie":
      return "x^x \\text{ (base } x \\text{ réelle quelconque : base } > 0\\text{)} \\quad\\text{et}\\quad x^x > 0";
  }
}

function aideENiveau2(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeLogE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Condition(s) à résoudre sur l'expression originale :", latex: conditionsDomaineE(exercice) };
  if (phase === "eSimplifier") {
    switch (exercice.sousType) {
      case "puissanceAbs":
        return { texte: "Première étape (puissance descendue, valeur absolue pas encore ajoutée) :", latex: "2\\ln(e^x-1)\\ \\text{(FAUX, il manque la valeur absolue)}" };
      case "valeurAbsolueQuadratique":
        return { texte: "Première étape (puissance descendue, valeur absolue pas encore ajoutée) :", latex: `2\\ln(x^2-${exercice.k}^2)\\ \\text{(FAUX, il manque la valeur absolue)}` };
      case "quotientDifference":
        return { texte: "Première étape (quotient séparé, pas encore les 2 termes finaux) :", latex: "\\ln(\\text{numérateur})-\\ln(\\text{dénominateur})" };
      case "puissanceSimple":
        return { texte: "Première étape (exposant pas encore descendu) :", latex: "\\ln(x^{1/2})" };
      case "combinaison":
        // Audit 6e ch. 3, point 9 : l'aide affichait la forme simplifiée complète (la réponse).
        return { texte: "Seul le second terme se simplifie — le premier reste tel quel :", latex: "(\\ln x)^3 - \\ln(x^3) = (\\ln x)^3 - \\,?\\cdot\\ln(x)" };
      case "dejaSimplifie":
        return { texte: "L'exposant x « descend » devant le logarithme, comme un exposant numérique.", latex: "\\ln(x^x) = \\,?\\cdot\\ln(x)" };
    }
  }
  return { texte: "Forme à dériver (simplifiée, confirmée à l'étape précédente) — dérive chaque terme séparément :", latex: formeSimplifieeLatexE(exercice) };
}

// ============================================================================
// Famille F
// ============================================================================

function formatFonctionF(exercice: ExerciceDomaineDeriveeLogF): string {
  switch (exercice.sousType) {
    case "lnSurSin":
      return `\\dfrac{\\ln(${exercice.a}+\\sin(e^x))}{${exercice.a}+\\sin(e^x)}`;
    case "arcsinLog":
      return `\\arcsin\\left(${formatLog(`${exercice.k}^x`, exercice.base, false)}\\right)`;
    case "arcsinLogX":
      return `\\arcsin\\left(\\log_{${exercice.base}}(x)\\right)`;
    case "arctanLog":
      return `\\dfrac{\\arctan(${formatKx(exercice.k)})}{1-\\log_{${exercice.base}}(x)}`;
  }
}

function deriveeLatexF(exercice: ExerciceDomaineDeriveeLogF): string {
  switch (exercice.sousType) {
    case "lnSurSin":
      return `\\dfrac{e^x\\cos(e^x)\\left(1-\\ln(${exercice.a}+\\sin(e^x))\\right)}{\\left(${exercice.a}+\\sin(e^x)\\right)^2}`;
    case "arcsinLog":
      return `\\dfrac{${exercice.p}}{\\sqrt{1-${exercice.p * exercice.p}x^2}}`;
    case "arcsinLogX":
      return `\\dfrac{1}{x\\ln(${exercice.base})\\sqrt{1-\\left(\\log_{${exercice.base}}(x)\\right)^2}}`;
    case "arctanLog": {
      const { k, base } = exercice;
      const kCarreX2 = k === 1 ? "x^2" : `${k * k}x^2`;
      return `\\dfrac{\\dfrac{${k}\\left(1-\\log_{${base}}(x)\\right)}{1+${kCarreX2}}+\\dfrac{\\arctan(${formatKx(k)})}{x\\ln(${base})}}{\\left(1-\\log_{${base}}(x)\\right)^2}`;
    }
  }
}

function consigneF(phase: "fDomaine" | "fDerivee"): FragmentConsigne[] {
  return [texte(phase === "fDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction (chaîne à plusieurs niveaux).")];
}

function aideFNiveau1(phase: "fDomaine" | "fDerivee"): AideAvecLatex {
  if (phase === "fDomaine") return { texte: "Énumère séparément chaque sous-expression qui impose une condition de domaine avant de les croiser.", latex: null };
  return { texte: "Plusieurs niveaux de chaîne — dérive de l'extérieur vers l'intérieur, avec les formules des chapitres précédents.", latex: "\\left(\\arcsin u\\right)' = \\dfrac{u'}{\\sqrt{1-u^2}}\\qquad \\left(\\arctan u\\right)' = \\dfrac{u'}{1+u^2}\\qquad \\left(\\log_b u\\right)' = \\dfrac{u'}{u\\ln b}" };
}

function aideFNiveau2(phase: "fDomaine" | "fDerivee", exercice: ExerciceDomaineDeriveeLogF): AideAvecLatex {
  if (phase === "fDomaine") {
    if (exercice.sousType === "lnSurSin") return { texte: "Encadre le sinus pour savoir si l'argument du log (et le dénominateur) peut s'annuler ou devenir négatif :", latex: `-1 \\leq \\sin(e^x) \\leq 1` };
    if (exercice.sousType === "arcsinLog") return { texte: "Condition (non résolue) :", latex: `-1 \\leq \\log_{${exercice.base}}(${exercice.k}^x) \\leq 1` };
    if (exercice.sousType === "arcsinLogX") return { texte: "Conditions à croiser (non résolues) :", latex: `\\begin{gathered} x > 0 \\\\ -1 \\leq \\log_{${exercice.base}}(x) \\leq 1 \\end{gathered}` };
    return { texte: "Conditions individuelles (intersection non faite) :", latex: `\\begin{gathered} x > 0 \\\\ 1-\\log_{${exercice.base}}(x) \\neq 0 \\end{gathered}` };
  }
  // Audit 6e ch. 3, point 27 : cette aide annonçait « Dérivées de chaque niveau » sans rien afficher.
  switch (exercice.sousType) {
    case "lnSurSin":
      return { texte: "Quotient N/D avec N = ln(D) — dérivées séparées (assemblage laissé à toi) :", latex: `D(x) = ${exercice.a}+\\sin(e^x),\\quad D'(x) = e^x\\cos(e^x),\\quad N'(x) = \\dfrac{D'(x)}{D(x)}` };
    case "arcsinLog":
      return { texte: `Simplifie d'abord l'argument (${exercice.k} est une puissance de ${exercice.base}) :`, latex: `\\log_{${exercice.base}}(${exercice.k}^x) = x\\cdot\\log_{${exercice.base}}(${exercice.k}) = \\,?\\cdot x` };
    case "arcsinLogX":
      return { texte: "Fonction intérieure et sa dérivée (assemblage laissé à toi) :", latex: `u(x) = \\log_{${exercice.base}}(x),\\qquad u'(x) = \\dfrac{1}{x\\ln(${exercice.base})}` };
    case "arctanLog":
      return { texte: "Numérateur et dénominateur, chacun dérivé séparément (assemblage via (N'D−ND')/D² laissé à toi) :", latex: `N' = \\dfrac{${exercice.k}}{1+${exercice.k === 1 ? "x^2" : `${exercice.k * exercice.k}x^2`}},\\qquad D = 1-\\log_{${exercice.base}}(x),\\qquad D' = -\\dfrac{1}{x\\ln(${exercice.base})}` };
  }
}

// ============================================================================
// Famille G
// ============================================================================

interface UVLatexG {
  u: string;
  v: string;
  uPrime: string;
  vPrime: string;
}

/** Coefficient affiché devant une expression — rien si 1. */
function coef(a: number): string {
  return a === 1 ? "" : String(a);
}

function uvLatexG(exercice: ExerciceDomaineDeriveeLogG): UVLatexG {
  const { a } = exercice;
  switch (exercice.variante) {
    case "xx":
      return { u: "x", v: formatKx(a), uPrime: "1", vPrime: String(a) };
    case "xSinx":
      return { u: "x", v: `\\sin(${formatKx(a)})`, uPrime: "1", vPrime: `${coef(a)}\\cos(${formatKx(a)})` };
    case "cosTan":
      return { u: "\\cos(x)", v: `${coef(a)}\\tan(x)`, uPrime: "-\\sin(x)", vPrime: `\\dfrac{${a}}{\\cos^2(x)}` };
    case "unSurXPuissanceX":
      return { u: `1+\\dfrac{${a}}{x}`, v: "x", uPrime: `-\\dfrac{${a}}{x^2}`, vPrime: "1" };
    case "sinXInvX":
      return { u: "\\sin(x)", v: `\\dfrac{${a}}{x}`, uPrime: "\\cos(x)", vPrime: `-\\dfrac{${a}}{x^2}` };
    case "racineXPuissanceX":
    case "xRacineXPuissanceX":
      return { u: "x", v: "1+\\dfrac{x}{2}", uPrime: "1", vPrime: "\\dfrac{1}{2}" };
    case "produit":
      return { u: "x", v: `-(x+${a})`, uPrime: "1", vPrime: "-1" };
    case "xLnx":
      return { u: "x", v: "\\ln(x)", uPrime: "1", vPrime: "\\dfrac{1}{x}" };
    case "affinePuissanceX":
      return { u: `x+${a}`, v: "x", uPrime: "1", vPrime: "1" };
  }
}

/** `u^{v}` — base entre parenthèses sauf si c'est la seule lettre x. */
function puissanceUV(u: string, v: string): string {
  const exposant = v.replace(/\\dfrac/g, "\\frac");
  return u === "x" ? `x^{${exposant}}` : `\\left(${u}\\right)^{${exposant}}`;
}

function formatFonctionG(exercice: ExerciceDomaineDeriveeLogG): string {
  const { a } = exercice;
  switch (exercice.variante) {
    case "xx":
      return a === 1 ? "x^x" : `x^{${a}x}`;
    case "xSinx":
      return `x^{\\sin(${formatKx(a)})}`;
    case "cosTan":
      return `(\\cos x)^{${coef(a)}\\tan x}`;
    case "unSurXPuissanceX":
      return `\\left(1+\\dfrac{${a}}{x}\\right)^x`;
    case "sinXInvX":
      return `(\\sin x)^{\\frac{${a}}{x}}`;
    case "racineXPuissanceX":
      return "x\\cdot(\\sqrt{x})^x";
    case "xRacineXPuissanceX":
      return "x\\cdot\\sqrt{x^x}";
    case "produit":
      return `\\dfrac{x+${a}}{x^{x+${a}}}`;
    case "xLnx":
      return "x^{\\ln x}";
    case "affinePuissanceX":
      return `(x+${a})^x`;
  }
}

/** f'/f simplifiée, pour f ENTIÈRE (produit : le terme 1/(x+a) en plus). */
function fPrimeSurFLatexG(exercice: ExerciceDomaineDeriveeLogG): string {
  const { a } = exercice;
  switch (exercice.variante) {
    case "xx":
      return `${coef(a)}\\ln(x)+${a}`;
    case "xSinx":
      return `${coef(a)}\\cos(${formatKx(a)})\\ln(x)+\\dfrac{\\sin(${formatKx(a)})}{x}`;
    case "cosTan":
      return `\\dfrac{${coef(a)}\\ln(\\cos x)}{\\cos^2 x}-${coef(a)}\\tan^2 x`;
    case "unSurXPuissanceX":
      return `\\ln\\left(1+\\dfrac{${a}}{x}\\right)-\\dfrac{${a}}{x+${a}}`;
    case "sinXInvX":
      return `-\\dfrac{${coef(a)}\\ln(\\sin x)}{x^2}+\\dfrac{${coef(a)}\\cos x}{x\\sin x}`;
    case "racineXPuissanceX":
    case "xRacineXPuissanceX":
      return "\\dfrac{\\ln(x)}{2}+\\dfrac{1}{x}+\\dfrac{1}{2}";
    case "produit":
      return `\\dfrac{1}{x+${a}}-\\ln(x)-\\dfrac{x+${a}}{x}`;
    case "xLnx":
      return "\\dfrac{2\\ln(x)}{x}";
    case "affinePuissanceX":
      return `\\ln(x+${a})+\\dfrac{x}{x+${a}}`;
  }
}

/** f réécrite sous sa forme la plus simple (une seule puissance pour les 2 variantes « à
 * simplifier », f d'origine pour le produit). */
function fSimplifieeLatexG(exercice: ExerciceDomaineDeriveeLogG): string {
  if (exercice.variante === "racineXPuissanceX" || exercice.variante === "xRacineXPuissanceX") return "x^{1+\\frac{x}{2}}";
  return formatFonctionG(exercice);
}

function consigneG(phase: "gIdentifier" | "gFPrimeSurF" | "gIsoler", exercice: ExerciceDomaineDeriveeLogG): FragmentConsigne[] {
  if (phase === "gIdentifier") {
    // Audit 6e ch. 3, point 25 : pour la variante « produit », f n'est PAS de la forme u^v — l'écran
    // le dit désormais et ne demande que la partie puissance.
    if (exercice.variante === "produit") return [texte("Écris f(x) comme produit "), latex(`(x+${exercice.a})\\cdot u(x)^{v(x)}`), texte(" : donne la partie puissance "), latex("u(x)^{v(x)}"), texte(" (une seule base, un seul exposant).")];
    return [texte("Reconnais la structure "), latex("u(x)^{v(x)}"), texte(" de cette fonction (simplifie d'abord si nécessaire pour ramener à une seule base élevée à un seul exposant).")];
  }
  if (phase === "gFPrimeSurF") {
    if (exercice.variante === "produit") return [texte("Prends le ln des deux membres ("), latex(`\\ln f = \\ln(x+${exercice.a}) + v\\cdot\\ln u`), texte(") et dérive implicitement : exprime "), latex("f'/f"), texte(" pour f entière.")];
    return [texte("Prends le ln des deux membres et dérive implicitement : exprime "), latex("f'/f"), texte(" à partir de la forme "), latex("u^v"), texte(" CORRECTE de l'étape précédente.")];
  }
  return [texte("Isole f' en multipliant "), latex("f'/f"), texte(" par f.")];
}

function aideGNiveau1(phase: "gIdentifier" | "gFPrimeSurF" | "gIsoler"): AideAvecLatex {
  if (phase === "gIdentifier") return { texte: "Cherche à ramener f(x) à une SEULE base variable élevée à un SEUL exposant variable (utilise les propriétés des puissances si besoin).", latex: null };
  if (phase === "gFPrimeSurF") return { texte: "Méthode complète : ln f = v·ln u, puis dérive les deux membres — le membre de gauche donne f'/f par dérivation implicite.", latex: "\\ln f = v\\cdot\\ln u \\;\\Rightarrow\\; \\dfrac{f'}{f} = v'\\ln u + v\\dfrac{u'}{u}" };
  return { texte: "Il faut multiplier f'/f par f pour isoler f'.", latex: "f' = f\\cdot\\dfrac{f'}{f}" };
}

function aideGNiveau2(phase: "gIdentifier" | "gFPrimeSurF" | "gIsoler", exercice: ExerciceDomaineDeriveeLogG): AideAvecLatex {
  const { u, v, uPrime, vPrime } = uvLatexG(exercice);
  if (phase === "gIdentifier") {
    // Audit 6e ch. 3, point 9 : l'aide donnait u ET v, donc la réponse.
    if (exercice.variante === "racineXPuissanceX") return { texte: "Écris chaque facteur comme une puissance de x, puis additionne les exposants :", latex: "x = x^1,\\qquad (\\sqrt{x})^x = \\left(x^{1/2}\\right)^x = x^{?}" };
    if (exercice.variante === "xRacineXPuissanceX") return { texte: "Écris chaque facteur comme une puissance de x, puis additionne les exposants :", latex: "x = x^1,\\qquad \\sqrt{x^x} = \\left(x^{x}\\right)^{1/2} = x^{?}" };
    return { texte: "La base (à ne pas confondre avec l'exposant) :", latex: `u(x) = ${u}` };
  }
  if (phase === "gFPrimeSurF") return { texte: "u, v et leurs dérivées — il reste à les placer dans v'·ln u + v·u'/u :", latex: `u=${u},\\ u'=${uPrime},\\qquad v=${v},\\ v'=${vPrime}` };
  return { texte: "f et f'/f côte à côte, multiplication non faite :", latex: `f = ${fSimplifieeLatexG(exercice)},\\qquad \\dfrac{f'}{f} = ${fPrimeSurFLatexG(exercice)}` };
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : "consigne générale et bloc de
 * données... redondants sur chaque écran", "traçabilité des coefficients"). */
export function blocDonnees(exercice: ExerciceDomaineDeriveeLogarithme): string[] {
  switch (exercice.famille) {
    case "A":
      return [`f(x) = ${formatFonctionA(exercice)}`];
    case "B":
      return [`f(x) = ${formatFonctionB(exercice)}`];
    case "C":
      return [`f(x) = ${formatFonctionC(exercice)}`];
    case "D":
      return [`f(x) = ${formatFonctionD(exercice)}`];
    case "E":
      return [`f(x) = ${formatFonctionEOrigine(exercice)}`];
    case "F":
      return [`f(x) = ${formatFonctionF(exercice)}`];
    case "G":
      return [`f(x) = ${formatFonctionG(exercice)}`];
  }
}

/** Partie puissance u^v attendue à l'écran `gIdentifier` (forme réduite, une seule puissance). */
function formeUVLatexG(exercice: ExerciceDomaineDeriveeLogG): string {
  const { u, v } = uvLatexG(exercice);
  return puissanceUV(u, v);
}

/**
 * Réponse attendue EXACTE de chaque écran, en LaTeX — affichée après un échec (révélation, fiche de
 * consultation) et dans le corrigé exporté (audit 6e ch. 3, points 6 et 28 : la révélation était
 * une phrase générique, le corrigé contenait « ·ln(e) », « (1)·ln(…) » ou des formes non
 * simplifiées). Les dérivées sont données sous une forme simplifiée lisible ; toute forme
 * équivalente reste acceptée par le moteur. `null` pour un écran de domaine (le domaine se formate
 * via `formatEnsembleReelLatex(exercice.domaine)` côté appelant).
 */
export function reponseAttendueLatex(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): string | null {
  switch (exercice.famille) {
    case "A":
      return phase === "aDerivee" ? `f'(x) = ${deriveeLatexA(exercice)}` : null;
    case "B":
      return phase === "bDerivee" ? `f'(x) = ${deriveeLatexB(exercice)}` : null;
    case "C": {
      const { uPrime, vPrime } = facteursLatexC(exercice);
      if (phase === "cFacteurs") return `u'(x) = ${uPrime},\\qquad v'(x) = ${vPrime}`;
      return phase === "cAssemblage" ? `f'(x) = ${deriveeLatexC(exercice)}` : null;
    }
    case "D": {
      const { nPrime, dPrime } = nDLatexD(exercice);
      if (phase === "dND") return `N'(x) = ${nPrime},\\qquad D'(x) = ${dPrime}`;
      return phase === "dAssemblage" ? `f'(x) = ${deriveeLatexD(exercice)}` : null;
    }
    case "E":
      if (phase === "eSimplifier") return `f(x) = ${formeSimplifieeLatexE(exercice)}`;
      return phase === "eDerivee" ? `f'(x) = ${deriveeSimplifieeLatexE(exercice)}` : null;
    case "F":
      return phase === "fDerivee" ? `f'(x) = ${deriveeLatexF(exercice)}` : null;
    case "G":
      if (phase === "gIdentifier") return exercice.variante === "produit" ? `f(x) = (x+${exercice.a})\\cdot ${formeUVLatexG(exercice)}` : `f(x) = ${formeUVLatexG(exercice)}`;
      if (phase === "gFPrimeSurF") return `\\dfrac{f'(x)}{f(x)} = ${fPrimeSurFLatexG(exercice)}`;
      return phase === "gIsoler" ? `f'(x) = ${fSimplifieeLatexG(exercice)}\\cdot\\left(${fPrimeSurFLatexG(exercice)}\\right)` : null;
  }
}

/** État actuel — `null` sur tout écran dont la vérification ne dépend PAS d'un écran précédent
 * (domaine et dérivée sont deux tâches indépendantes pour A/B/F ; famille E : domaine calculé sur
 * l'expression ORIGINALE, indépendant de la simplification qui suit). Non-`null` uniquement quand
 * l'écran réutilise réellement la vérité mathématique confirmée d'un écran antérieur (C
 * assemblage, D assemblage, E dérivée, G écrans 2 et 3) — `gIsoler` (écran 3) cumule les DEUX
 * faits déjà confirmés (structure u^v de `gIdentifier` ET f'/f de `gFPrimeSurF`, du plus ancien au
 * plus récent), jamais seulement le dernier, puisque l'isolation de f' a réellement besoin des
 * deux. */
export function etatActuel(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): string[] | null {
  if (exercice.famille === "C" && phase === "cAssemblage") {
    const { uPrime, vPrime } = facteursLatexC(exercice);
    return [`u'(x) = ${uPrime}`, `v'(x) = ${vPrime}`];
  }
  if (exercice.famille === "D" && phase === "dAssemblage") {
    const { nPrime, dPrime } = nDLatexD(exercice);
    return [`N'(x) = ${nPrime}`, `D'(x) = ${dPrime}`];
  }
  if (exercice.famille === "E" && phase === "eDerivee") {
    return [`f(x) = ${formeSimplifieeLatexE(exercice)}\\ \\text{(forme simplifiée confirmée)}`];
  }
  if (exercice.famille === "G" && phase === "gFPrimeSurF") {
    return [`u^v = ${formeUVLatexG(exercice)}\\ \\text{(structure confirmée)}`];
  }
  if (exercice.famille === "G" && phase === "gIsoler") {
    return [`u^v = ${formeUVLatexG(exercice)}\\ \\text{(structure confirmée)}`, `\\dfrac{f'}{f} = ${fPrimeSurFLatexG(exercice)}\\ \\text{(confirmé)}`];
  }
  return null;
}

export function consigneEcran(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): FragmentConsigne[] {
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
    case "G":
      return consigneG(phase as "gIdentifier" | "gFPrimeSurF" | "gIsoler", exercice);
  }
}

export function aideNiveau1(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideANiveau1(phase as "aDomaine" | "aDerivee");
    case "B":
      return aideBNiveau1(phase as "bDomaine" | "bDerivee", exercice);
    case "C":
      return aideCNiveau1(phase as "cDomaine" | "cFacteurs" | "cAssemblage");
    case "D":
      return aideDNiveau1(phase as "dDomaine" | "dND" | "dAssemblage", exercice);
    case "E":
      return aideENiveau1(phase as "eDomaine" | "eSimplifier" | "eDerivee", exercice);
    case "F":
      return aideFNiveau1(phase as "fDomaine" | "fDerivee");
    case "G":
      return aideGNiveau1(phase as "gIdentifier" | "gFPrimeSurF" | "gIsoler");
  }
}

export function aideNiveau2(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): AideAvecLatex {
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
    case "G":
      return aideGNiveau2(phase as "gIdentifier" | "gFPrimeSurF" | "gIsoler", exercice);
  }
}

/** Labels des 2 champs des écrans "cFacteurs"/"dND" (dispatch par famille). */
export function labelsDeuxChamps(exercice: ExerciceDomaineDeriveeLogarithme): { a: string; b: string } {
  if (exercice.famille === "C") return { a: "u'(x) =", b: "v'(x) =" };
  return { a: "N'(x) =", b: "D'(x) =" };
}
