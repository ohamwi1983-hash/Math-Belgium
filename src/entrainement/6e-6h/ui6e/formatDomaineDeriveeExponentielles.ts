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
import type { PhaseDomaineDeriveeExponentielle } from "../moteur6e/typesDomaineDeriveeExponentielles";

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

function consigneA(phase: "aDomaine" | "aDerivee"): FragmentConsigne[] {
  return [texte(phase === "aDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction.")];
}

function aideANiveau1(phase: "aDomaine" | "aDerivee"): AideAvecLatex {
  if (phase === "aDomaine") return { texte: "Une exponentielle est définie quel que soit son exposant : cherche seulement une racine, un dénominateur ou un logarithme dans l'expression.", latex: null };
  return { texte: "Dérivée d'une exponentielle composée (règle de la chaîne ; pour la base e, $\\ln e = 1$) :", latex: "\\left(a^{u(x)}\\right)'=u'(x)\\cdot\\ln a\\cdot a^{u(x)}\\qquad \\left(e^{u(x)}\\right)'=u'(x)\\cdot e^{u(x)}" };
}

function aideANiveau2(phase: "aDomaine" | "aDerivee", exercice: ExerciceDomaineDeriveeA): AideAvecLatex {
  if (phase === "aDomaine") return { texte: "Ici, l'expression ne contient ni racine, ni dénominateur, ni logarithme.", latex: null };
  const b = formatBase(exercice.base, exercice.baseEstE);
  if (exercice.sousType === "direct") {
    return { texte: "Ici, l'exposant est :", latex: `u(x)=${formatGA(exercice.g)}` };
  }
  const puissance = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  return { texte: "Ici, f est le carré d'une différence : dérive d'abord le carré, puis la puissance (règle de la chaîne) :", latex: `\\left(v^{2}\\right)'=2v\\cdot v',\\qquad v(x)=${b}^{${puissance}}-${exercice.c}` };
}

// ============================================================================
// Famille B
// ============================================================================

function formatFonctionB(exercice: ExerciceDomaineDeriveeB): string {
  const b = String(exercice.base);
  if (exercice.sousType === "racine") return `${b}^{\\sqrt{x^2-${exercice.k * exercice.k}}}`;
  const num = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  const den = formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }]);
  return `${b}^{\\frac{${num}}{${den}}}`;
}

function consigneB(phase: "bDomaine" | "bDerivee"): FragmentConsigne[] {
  return [texte(phase === "bDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction (n'oublie pas la dérivée de l'exposant lui-même).")];
}

function aideBNiveau1(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeB): AideAvecLatex {
  if (phase === "bDomaine") {
    return exercice.sousType === "racine"
      ? { texte: "Une racine carrée n'est définie que si son radicande est positif ou nul :", latex: `x^2-${exercice.k * exercice.k}\\geq 0` }
      : { texte: "Une fraction n'est définie que si son dénominateur est non nul :", latex: `${formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }])}\\neq 0` };
  }
  return {
    texte: "Deux dérivations s'enchaînent : celle de l'exponentielle et celle de son exposant u (règle de la chaîne) :",
    latex: "\\left(a^{u(x)}\\right)'=u'(x)\\cdot\\ln a\\cdot a^{u(x)}",
  };
}

function aideBNiveau2(phase: "bDomaine" | "bDerivee", exercice: ExerciceDomaineDeriveeB): AideAvecLatex {
  if (phase === "bDomaine")
    return exercice.sousType === "racine"
      ? { texte: "Inéquation à résoudre (on isole le carré) :", latex: `x^2\\geq ${exercice.k * exercice.k}` }
      : { texte: "Valeur qui annule le dénominateur, à exclure :", latex: `${formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }])}=0` };
  if (exercice.sousType === "racine") {
    const u = `\\sqrt{x^2-${exercice.k * exercice.k}}`;
    return { texte: "Ici, l'exposant est une racine carrée ; sa dérivée suit la règle :", latex: `u(x)=${u},\\qquad \\left(\\sqrt{v}\\right)'=\\dfrac{v'}{2\\sqrt{v}}` };
  }
  const num = formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }]);
  const den = formatSommeTermes([{ valeur: exercice.p, suffixe: "x" }, { valeur: exercice.q, suffixe: "" }]);
  return {
    texte: "Ici, l'exposant est un quotient ; sa dérivée suit la règle du quotient :",
    latex: `u(x)=\\dfrac{${num}}{${den}},\\qquad \\left(\\dfrac{N}{D}\\right)'=\\dfrac{N'D-ND'}{D^{2}}`,
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
  // Parenthèses seulement autour d'un facteur composé (jamais « (x^{2})\\cdot e^{\\sqrt{x}} »).
  return `${/[+-]/.test(u) ? `\\left(${u}\\right)` : u}\\cdot ${v}`;
}

function consigneC(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): FragmentConsigne[] {
  if (phase === "cDomaine") return [texte(CONSIGNE_DOMAINE)];
  if (phase === "cFacteurs") return [texte("Dérive chaque facteur séparément : "), latex("u'(x)"), texte(" et "), latex("v'(x)"), texte(".")];
  return [texte("Assemble la dérivée du produit avec "), latex("u'v+uv'"), texte(".")];
}

function aideCNiveau1(phase: "cDomaine" | "cFacteurs" | "cAssemblage"): AideAvecLatex {
  if (phase === "cDomaine") return { texte: "Un produit est défini là où chacun de ses facteurs l'est : cherche une racine, un dénominateur ou un logarithme dans chaque facteur.", latex: null };
  if (phase === "cFacteurs") return { texte: "Écris f comme un produit de deux facteurs, puis dérive chacun (règle de la chaîne si besoin) :", latex: "f(x)=u(x)\\cdot v(x)" };
  return { texte: "Rappel de la formule du produit (non substituée) :", latex: "(uv)' = u'v + uv'" };
}

function aideCNiveau2(phase: "cDomaine" | "cFacteurs" | "cAssemblage", exercice: ExerciceDomaineDeriveeC): AideAvecLatex {
  if (phase === "cDomaine") return exercice.sousType === "e" ? { texte: "Ici, une racine carrée apparaît dans l'exposant : son radicande doit être positif ou nul :", latex: "x\\geq 0" } : { texte: "Ici, chacun des deux facteurs est défini pour tout réel.", latex: null };
  const { u, v } = nomsFacteursC(exercice);
  if (phase === "cFacteurs") return { texte: "u(x) et v(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} u(x) = ${u} \\\\ v(x) = ${v} \\end{gathered}` };
  return { texte: "Ici, les deux facteurs sont :", latex: `u(x)=${u},\\qquad v(x)=${v}` };
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

function consigneD(phase: "dDomaine" | "dND" | "dAssemblage"): FragmentConsigne[] {
  if (phase === "dDomaine") return [texte(CONSIGNE_DOMAINE)];
  if (phase === "dND") return [texte("Dérive séparément le numérateur et le dénominateur : "), latex("N'(x)"), texte(" et "), latex("D'(x)"), texte(".")];
  return [texte("Assemble la dérivée du quotient avec "), latex("\\dfrac{N'D-ND'}{D^{2}}"), texte(".")];
}

function aideDNiveau1(phase: "dDomaine" | "dND" | "dAssemblage"): AideAvecLatex {
  if (phase === "dDomaine") return { texte: "Un quotient est défini là où son dénominateur ne s'annule pas : cherche si le dénominateur peut valoir 0.", latex: null };
  if (phase === "dND") return { texte: "Écris f comme un quotient, puis dérive le numérateur et le dénominateur séparément :", latex: "f(x)=\\dfrac{N(x)}{D(x)}" };
  return { texte: "Rappel de la formule du quotient (non substituée) :", latex: "\\left(\\frac{N}{D}\\right)' = \\frac{N'D - ND'}{D^2}" };
}

function aideDNiveau2(phase: "dDomaine" | "dND" | "dAssemblage", exercice: ExerciceDomaineDeriveeD): AideAvecLatex {
  if (phase === "dDomaine") return { texte: "Résous l'équation « dénominateur = 0 », ou montre qu'elle n'a pas de solution :", latex: "D(x)=0" };
  const { n, d } = nomsNDdeD(exercice);
  if (phase === "dND") return { texte: "N(x) et D(x), pour t'aider à identifier ce que tu dois dériver :", latex: `\\begin{gathered} N(x) = ${n} \\\\ D(x) = ${d} \\end{gathered}` };
  return { texte: "Ici, le numérateur et le dénominateur sont :", latex: `N(x)=${n},\\qquad D(x)=${d}` };
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

function consigneE(phase: "eDomaine" | "eSimplifier" | "eDerivee"): FragmentConsigne[] {
  if (phase === "eDomaine") return [texte(CONSIGNE_DOMAINE)];
  if (phase === "eSimplifier") return [texte("Avant de dériver, simplifie l'écriture de f(x) avec les propriétés des puissances.")];
  return [texte("Dérive la forme simplifiée de f(x).")];
}

function texteProprieteE(exercice: ExerciceDomaineDeriveeE): string {
  if (exercice.sousType === "j") return "Le quotient de deux puissances de même base est une puissance dont l'exposant est la différence des exposants :";
  if (exercice.sousType === "m") return "Sépare la fraction en deux termes de même dénominateur :";
  return "Sépare la fraction en deux termes, puis regroupe chaque quotient de puissances de même exposant :";
}

function aideENiveau1(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Un quotient est défini là où son dénominateur ne s'annule pas ; une exponentielle ne s'annule jamais :", latex: "a^{x}>0" };
  if (phase === "eSimplifier") {
    const latexProprieteE: Record<ExerciceDomaineDeriveeE["sousType"], string> = {
      j: "\\dfrac{a^m}{a^n}=a^{m-n}",
      m: "\\dfrac{A-B}{C}=\\dfrac{A}{C}-\\dfrac{B}{C}",
      n: "\\dfrac{a^x}{b^x}=\\left(\\dfrac{a}{b}\\right)^x",
    };
    return { texte: texteProprieteE(exercice), latex: latexProprieteE[exercice.sousType] };
  }
  return { texte: "La forme simplifiée est une exponentielle, ou une somme d'exponentielles : dérive-la terme par terme, sans règle du quotient.", latex: null };
}

function aideENiveau2(phase: "eDomaine" | "eSimplifier" | "eDerivee", exercice: ExerciceDomaineDeriveeE): AideAvecLatex {
  if (phase === "eDomaine") return { texte: "Ici, le dénominateur est une exponentielle (ou en contient une) : vérifie s'il peut valoir 0.", latex: null };
  if (phase === "eSimplifier") {
    if (exercice.sousType === "j") return { texte: "Première étape (exposants pas encore combinés) :", latex: `${formatBase(exercice.base, exercice.baseEstE)}^{${formatGA(exercice.g)}-${formatGA(exercice.h)}}` };
    if (exercice.sousType === "m") return { texte: "Première étape (fraction séparée, pas encore simplifiée) :", latex: `\\frac{${formatBase(exercice.base, exercice.baseEstE)}^x}{${formatBase(exercice.base, exercice.baseEstE)}^x} - \\frac{1}{${formatBase(exercice.base, exercice.baseEstE)}^x}` };
    return { texte: "Première étape (fraction séparée, pas encore regroupée) :", latex: `\\frac{${exercice.base1}^x}{${exercice.base2}^x} - ${exercice.c}\\cdot\\frac{1}{${exercice.base2}^x}` };
  }
  return { texte: "Dérivée d'une exponentielle :", latex: "\\left(a^{u(x)}\\right)'=u'(x)\\cdot\\ln a\\cdot a^{u(x)}\\qquad \\left(e^{u(x)}\\right)'=u'(x)\\cdot e^{u(x)}" };
}

// ============================================================================
// Famille F
// ============================================================================

function formatFonctionF(exercice: ExerciceDomaineDeriveeF): string {
  const trigLatex = exercice.trig === "cos" ? "\\cos" : "\\arccos";
  return `${trigLatex}\\left(e^{x^2-${exercice.k}}\\right)`;
}

function consigneF(phase: "fDomaine" | "fDerivee"): FragmentConsigne[] {
  return [texte(phase === "fDomaine" ? CONSIGNE_DOMAINE : "Calcule la dérivée de cette fonction : trois fonctions s'enchaînent (la fonction extérieure, l'exponentielle, son exposant).")];
}

function aideFNiveau1(phase: "fDomaine" | "fDerivee", exercice: ExerciceDomaineDeriveeF): AideAvecLatex {
  if (phase === "fDomaine") {
    if (exercice.trig === "cos") return { texte: "Le cosinus est défini pour tout réel ; une exponentielle aussi.", latex: null };
    return {
      texte: "$\\arccos(w)$ n'existe que si w est compris entre −1 et 1 ; une exponentielle est toujours strictement positive, donc seule la condition $w\\leq 1$ reste à résoudre :",
      latex: "-1\\leq w\\leq 1",
    };
  }
  return { texte: "Applique la règle de la chaîne deux fois, de l'extérieur vers l'intérieur :", latex: "\\bigl(g(w(x))\\bigr)'=g'(w(x))\\cdot w'(x),\\qquad w(x)=e^{v(x)}" };
}

function aideFNiveau2(phase: "fDomaine" | "fDerivee", exercice: ExerciceDomaineDeriveeF): AideAvecLatex {
  if (phase === "fDomaine") {
    if (exercice.trig === "cos") return { texte: "Ici, aucune racine, aucun dénominateur, aucun logarithme : rien n'est exclu.", latex: null };
    return { texte: "Inéquation restante (non résolue) :", latex: `e^{x^2-${exercice.k}} \\leq 1` };
  }
  const w = `e^{x^2-${exercice.k}}`;
  const wPrime = `2x\\cdot ${w}`;
  return {
    texte: "Ici, chaque fonction se dérive ainsi (assemble ensuite) :",
    latex: `w(x)=${w},\\quad w'(x)=${wPrime},\\quad ${exercice.trig === "cos" ? "(\\cos w)'=-\\sin w\\cdot w'" : "(\\arccos w)'=-\\dfrac{w'}{\\sqrt{1-w^{2}}}"}`,
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

export function consigneEcran(phase: PhaseDomaineDeriveeExponentielle, exercice: ExerciceDomaineDeriveeExponentielle): FragmentConsigne[] {
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

