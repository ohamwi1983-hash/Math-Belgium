import type { CibleLimiteLog, ExerciceLimiteLogA, ExerciceLimiteLogB, ExerciceLimiteLogC, ExerciceLimiteLogD, ExerciceLimiteLogarithmique } from "../core6e/limitesLogarithmiques.types";
import type { PhaseLimiteLogarithmique } from "../moteur6e/typesLimitesLogarithmiques";
import {
  CHOIX_FORME_LATEX,
  cibleLatexD,
  fLatexD,
  formeExacteLatexD,
  gLatexD,
  limD,
  lnUnPlusULatexD,
  parSigne,
  produitBrutLatexD,
  puissanceLatexD,
  uLatexD,
} from "./formatLimitesPuissances";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen17`. Toute aide qui embarque un symbole
 * LaTeX est retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut (piège
 * documenté dans CLAUDE.md, "coefficient nul affiché tel quel").
 *
 * **Dispatch PAR FAMILLE** (même principe que `formatLimitesExponentielles.ts`, 6gen6) : chaque
 * famille a sa propre fonction `aideXxx1`/`aideXxx2`, le dispatcher public (`aideNiveau1`/
 * `aideNiveau2`) ne fait que router.
 */
export const CONSIGNE_GENERALE = "Calcule la limite suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Fragment de consigne mixant prose française et LaTeX inline — jamais de phrase française
 * entière passée à KaTeX (piège documenté, "libellé français brut en mode maths"). Rendu via
 * `components/RenduFragments.tsx`. */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export interface TermeSigne {
  valeur: number;
  suffixe: string;
  /** Insère `\cdot` entre le coefficient et le suffixe (coefficient≠±1) — nécessaire pour un
   * terme du type `c·base^x` (ambigu sans séparateur), jamais pour `a·x^d` (déjà lisible collé,
   * convention KaTeX standard partout ailleurs sur la plateforme). */
  cdot?: boolean;
}

export function formatSommeTermes(termes: TermeSigne[]): string {
  const nonNuls = termes.filter((t) => t.valeur !== 0);
  if (nonNuls.length === 0) return "0";
  return nonNuls
    .map((t, i) => {
      const abs = Math.abs(t.valeur);
      const corps = t.suffixe === "" ? `${abs}` : abs === 1 ? t.suffixe : t.cdot ? `${abs}\\cdot ${t.suffixe}` : `${abs}${t.suffixe}`;
      if (i === 0) return t.valeur < 0 ? `-${corps}` : corps;
      return `${t.valeur < 0 ? "-" : "+"} ${corps}`;
    })
    .join(" ");
}

/** Base décimale (ex. 0,2) avec la virgule française — jamais `0.2`. */
export function formatBaseDecimale(base: number): string {
  return String(base).replace(".", "{,}");
}

/** Jamais d'exposant `^{1}` littéral. */
export function formatPuissance(base: string, exposant: number): string {
  return exposant === 1 ? base : `${base}^{${exposant}}`;
}

const LABELS_CIBLE: Record<string, string> = { plus_infini: "+\\infty", moins_infini: "-\\infty", zero: "0" };

/** Exporté pour le récapitulatif final — contenu de chaque `LigneRecap` = la cible RÉELLEMENT
 * attendue de l'écran, jamais un score. Une valeur finie s'affiche sous sa forme EXACTE
 * (`cible.latex`, ex. `\dfrac{\ln(5)}{2}`), jamais un flottant brut. */
export function formatCibleTexte(cible: CibleLimiteLog): string {
  if (cible.type === "valeur") return cible.latex;
  return LABELS_CIBLE[cible.type];
}

/** `1+ku` sans double signe (jamais `1+-3u`). */
export function formatUnPlusKU(coefficient: number): string {
  if (coefficient === 0) return "1";
  const abs = Math.abs(coefficient);
  const corps = abs === 1 ? "u" : `${abs}u`;
  return coefficient > 0 ? `1+${corps}` : `1-${corps}`;
}

/** `ku` sans coefficient 1 visible. */
export function formatKU(coefficient: number): string {
  if (coefficient === 1) return "u";
  if (coefficient === -1) return "-u";
  return `${coefficient}u`;
}

const LABELS_CATEGORIE: Record<string, string> = { log: "Logarithme", polynome: "Polynôme", exponentielle: "Exponentielle" };

export function formatCategorieLabel(categorie: string): string {
  return LABELS_CATEGORIE[categorie];
}

// ============================================================================
// Famille A
// ============================================================================

export function formatFonctionA(exercice: ExerciceLimiteLogA): string {
  switch (exercice.sousType) {
    case "sous1": {
      const numerateur = formatSommeTermes([{ valeur: exercice.k, suffixe: "\\ln(x)" }]);
      const denominateur = formatSommeTermes([{ valeur: exercice.a, suffixe: formatPuissance("x", exercice.d) }, { valeur: exercice.b, suffixe: "" }]);
      return `\\frac{${numerateur}}{${denominateur}}`;
    }
    case "sous2": {
      const puissance = formatSommeTermes([{ valeur: exercice.q, suffixe: formatPuissance("x", exercice.d) }]);
      return exercice.orientation === "expSurPoly" ? `\\frac{${exercice.base}^x}{${puissance}}` : `\\frac{${puissance}}{${exercice.base}^x}`;
    }
    case "sous3": {
      const numerateur = formatSommeTermes([{ valeur: exercice.p1, suffixe: "\\ln(x)" }, { valeur: exercice.c1, suffixe: "" }]);
      const denominateur = formatSommeTermes([{ valeur: exercice.p2, suffixe: `\\log_{${exercice.base}}(x)` }, { valeur: exercice.c2, suffixe: "" }]);
      return `\\frac{${numerateur}}{${denominateur}}`;
    }
    case "sous4": {
      const poly = formatSommeTermes([{ valeur: exercice.a, suffixe: formatPuissance("x", exercice.d) }, { valeur: exercice.c, suffixe: "" }]);
      return `\\frac{${poly} + \\log_{${exercice.base1}}(x)}{${poly} + \\log_{${exercice.base2}}(x)}`;
    }
    case "sous5": {
      const numerateur = formatSommeTermes([
        { valeur: exercice.a1, suffixe: formatPuissance("x", exercice.d1) },
        { valeur: exercice.c1, suffixe: `${formatBaseDecimale(exercice.base1)}^x`, cdot: true },
      ]);
      const denominateur = formatSommeTermes([
        { valeur: exercice.a2, suffixe: formatPuissance("x", exercice.d2) },
        { valeur: exercice.c2, suffixe: `${exercice.base2}^x`, cdot: true },
      ]);
      return `\\frac{${numerateur}}{${denominateur}}`;
    }
  }
}

function formatDirectionA(): string {
  return "x \\to +\\infty";
}

function consigneA(phase: "aDominance" | "aConclure"): FragmentConsigne[] {
  if (phase === "aDominance") {
    return [
      texte("Identifie le terme dominant au numérateur et au dénominateur séparément (hiérarchie "),
      latex("\\ln(x) \\ll x^n \\ll b^x"),
      texte(", pour une exponentielle de la forme "),
      latex("b^x"),
      texte(" avec "),
      latex("b > 1"),
      texte(")."),
    ];
  }
  return [texte("À partir de la dominance de l'étape précédente, conclus la limite (valeur exacte si elle est finie).")];
}

const RAPPEL_HIERARCHIE_LATEX = "\\ln(x) \\ll x^n \\ll b^x \\quad (b > 1)";

function aideA1(phase: "aDominance" | "aConclure"): AideAvecLatex {
  if (phase === "aDominance") {
    return {
      texte: "Rappel de la hiérarchie de croissance à l'infini (une exponentielle de base inférieure à 1 est, elle, négligeable — elle tend vers 0) :",
      latex: RAPPEL_HIERARCHIE_LATEX,
    };
  }
  return { texte: "Compare la catégorie dominante du numérateur à celle du dénominateur (déjà confirmées à l'étape précédente) pour conclure.", latex: null };
}

/** Aide 2 de la famille A — jamais les catégories elles-mêmes (écran dominance) ni la limite
 * (écran conclure) : pour la dominance, la liste des termes à comparer et leur comportement de
 * référence ; pour la conclusion, la forme factorisée par les termes dominants, non simplifiée. */
function aideA2(phase: "aDominance" | "aConclure", exercice: ExerciceLimiteLogA): AideAvecLatex {
  if (phase === "aDominance") {
    return {
      texte: "Comportement de chaque type de terme quand x → +∞ (à appliquer à chaque terme de l'expression) :",
      latex: "\\begin{gathered} \\ln(x),\\ \\log_b(x) \\to +\\infty \\text{ (très lentement)} \\\\ x^n \\to +\\infty \\\\ b^x \\to +\\infty \\text{ si } b>1,\\quad b^x \\to 0 \\text{ si } 0<b<1 \\end{gathered}",
    };
  }
  return { texte: "Mets en évidence le terme dominant en haut et en bas (calcul final non fait) :", latex: formeFactoriseeA(exercice) };
}

/** Coefficient écrit devant une expression : « 1 » omis, « -1 » réduit au signe, sinon « k\cdot ». */
export function coefDevantLatex(k: number, expr: string): string {
  if (k === 1) return expr;
  if (k === -1) return `-${expr}`;
  return `${k}\\cdot ${expr}`;
}

/** « \frac{n}{den} » avec le signe sorti (« -\frac{3}{2} », jamais « \frac{-3}{2} »). */
export function fractionSigneeLatex(n: number, den: string): string {
  return `${n < 0 ? "-" : ""}\\frac{${Math.abs(n)}}{${den}}`;
}

/** p·ln(b)/q NON réduite, signe sorti (« -\dfrac{2\ln(3)}{4} », « 2\ln(3) » si |q| = 1) — jamais
 * « \dfrac{2\ln 3}{-1} » ni « \dfrac{-1\ln(4)}{-2} ». */
export function multipleLnNonReduitLatex(p: number, q: number, base: number): string {
  const signe = p * q < 0 ? "-" : "";
  const corps = `${Math.abs(p) === 1 ? "" : Math.abs(p)}\\ln(${base})`;
  return Math.abs(q) === 1 ? `${signe}${corps}` : `${signe}\\dfrac{${corps}}{${Math.abs(q)}}`;
}

/** « \log_b(x) − 4 » (constante après le logarithme, jamais « -4 + \log_b(x) »). */
export function logPlusConstanteLatex(base: number, c: number): string {
  return `\\log_{${base}}(x)${c === 0 ? "" : c < 0 ? ` - ${-c}` : ` + ${c}`}`;
}

/** ` + \frac{n}{d}` / ` - \frac{|n|}{d}` / rien si n = 0 — jamais `+ \frac{-3}{x}`. */
function plusFraction(numerateur: number, denominateur: string): string {
  if (numerateur === 0) return "";
  return `${numerateur < 0 ? " - " : " + "}\\frac{${Math.abs(numerateur)}}{${denominateur}}`;
}

export function formeFactoriseeA(exercice: ExerciceLimiteLogA): string {
  switch (exercice.sousType) {
    case "sous1":
      return `${exercice.k < 0 ? "-" : ""}\\frac{\\ln(x)}{${formatPuissance("x", exercice.d)}} \\cdot \\frac{${Math.abs(exercice.k)}}{${exercice.a}${plusFraction(exercice.b, formatPuissance("x", exercice.d))}}`;
    case "sous2":
      if (exercice.orientation === "expSurPoly") {
        const facteur = exercice.q === 1 ? "" : ` \\cdot \\frac{1}{${exercice.q}}`;
        return `\\frac{${exercice.base}^x}{${formatPuissance("x", exercice.d)}}${facteur}`;
      }
      return `${exercice.q === 1 ? "" : `${exercice.q} \\cdot `}\\frac{${formatPuissance("x", exercice.d)}}{${exercice.base}^x}`;
    case "sous3":
      return `\\frac{\\ln(x)\\left(${exercice.p1}${plusFraction(exercice.c1, "\\ln(x)")}\\right)}{\\ln(x)\\left(${fractionSigneeLatex(exercice.p2, `\\ln(${exercice.base})`)}${plusFraction(exercice.c2, "\\ln(x)")}\\right)}`;
    case "sous4": {
      const px = formatSommeTermes([{ valeur: exercice.a, suffixe: formatPuissance("x", exercice.d) }]);
      const reste = (base: number) => logPlusConstanteLatex(base, exercice.c);
      return `\\frac{${px}\\left(1 + \\frac{${reste(exercice.base1)}}{${px}}\\right)}{${px}\\left(1 + \\frac{${reste(exercice.base2)}}{${px}}\\right)}`;
    }
    case "sous5": {
      const px1 = formatPuissance("x", exercice.d1);
      const px2 = formatPuissance("x", exercice.d2);
      const terme1 = formatSommeTermes([{ valeur: Math.abs(exercice.c1), suffixe: `${formatBaseDecimale(exercice.base1)}^x`, cdot: true }]);
      const terme2 = formatSommeTermes([{ valeur: Math.abs(exercice.a2), suffixe: px2 }]);
      return `\\frac{${px1}}{${exercice.base2}^x} \\cdot \\frac{${exercice.a1} ${exercice.c1 < 0 ? "-" : "+"} \\frac{${terme1}}{${px1}}}{${exercice.c2} ${exercice.a2 < 0 ? "-" : "+"} \\frac{${terme2}}{${exercice.base2}^x}}`;
    }
  }
}

// ============================================================================
// Famille B
// ============================================================================

/** Base `x/x0` simplifiée (jamais `x/1`), éventuellement élevée à `k` (jamais `^1`). */
export function formatBaseB(x0: number, k: number): string {
  const quotient = x0 === 1 ? "x" : `\\frac{x}{${x0}}`;
  if (k === 1) return quotient;
  return x0 === 1 ? `x^{${k}}` : `\\left(${quotient}\\right)^{${k}}`;
}

export function formatFonctionB(exercice: ExerciceLimiteLogB): string {
  if (exercice.sousType === "quotient") return `\\log_{${formatBaseB(exercice.x0, exercice.k)}}\\left(${formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }])}\\right)`;
  return `(x-${exercice.x0})\\cdot\\log_{${formatBaseB(exercice.x0, 1)}}(${exercice.k})`;
}

/** Forme reformulée de référence en u (une des formes équivalentes acceptées) — affichée comme
 * réponse attendue, dans le récapitulatif et le corrigé. */
export function formatReformulationBLatex(exercice: ExerciceLimiteLogB): string {
  if (exercice.sousType === "quotient") {
    const k = exercice.k === 1 ? "" : `${exercice.k}`;
    return `\\dfrac{\\ln\\left(${formatUnPlusKU(exercice.m * exercice.x0)}\\right)}{${k}\\ln(1+u)}`;
  }
  return `\\dfrac{${formatKU(exercice.x0)}\\ln(${exercice.k})}{\\ln(1+u)}`;
}

function consigneB(phase: "bReformuler" | "bConclure", exercice: ExerciceLimiteLogB): FragmentConsigne[] {
  if (phase === "bConclure") return [texte("Applique la limite de référence à la forme CORRECTE de l'étape précédente, puis conclus.")];
  if (exercice.sousType === "quotient") {
    return [texte("Pose "), latex("u=\\dfrac{x}{x_0}-1"), texte(" et réécris l'expression en termes de "), latex("\\dfrac{\\ln(1+u)}{u}"), texte(".")];
  }
  return [texte("Pose "), latex("u=\\dfrac{x}{x_0}-1"), texte(" et réécris l'expression en termes de "), latex("\\dfrac{u}{\\ln(1+u)}"), texte(".")];
}

const FORMULE_REFERENCE_LATEX = "\\lim_{u \\to 0} \\frac{\\ln(1+u)}{u} = 1";
const TEXTE_REFERENCE = "Limite de référence (nouvelle dans ce chapitre, analogue logarithmique de sin(x)/x→1) :";

function aideB1(phase: "bReformuler" | "bConclure"): AideAvecLatex {
  if (phase === "bConclure") return { texte: TEXTE_REFERENCE, latex: FORMULE_REFERENCE_LATEX };
  return { texte: "Un logarithme dont la BASE et l'ARGUMENT tendent tous deux vers 1 en même temps est une forme 0/0 déguisée — la substitution ci-dessous la révèle :", latex: "u=\\dfrac{x}{x_0}-1" };
}

function aideB2(phase: "bReformuler" | "bConclure", exercice: ExerciceLimiteLogB): AideAvecLatex {
  if (phase === "bConclure") {
    if (exercice.sousType === "quotient") {
      const c = exercice.m * exercice.x0;
      return { texte: "Fais apparaître la limite de référence en haut et en bas (calcul final non fait) :", latex: `\\dfrac{${coefDevantLatex(c, `\\dfrac{\\ln(${formatUnPlusKU(c)})}{${formatKU(c)}}`)}}{${coefDevantLatex(exercice.k, "\\dfrac{\\ln(1+u)}{u}")}}` };
    }
    return { texte: "Fais apparaître la limite de référence (calcul final non fait) :", latex: `${exercice.x0 === 1 ? "" : exercice.x0}\\ln(${exercice.k})\\cdot\\dfrac{u}{\\ln(1+u)}` };
  }
  if (exercice.sousType === "quotient") {
    return { texte: "Substitution amorcée (base et argument réécrits en u, non terminée) :", latex: `\\log_{${exercice.k === 1 ? "1+u" : `(1+u)^{${exercice.k}}`}}\\left(${formatUnPlusKU(exercice.m * exercice.x0)}\\right)` };
  }
  return { texte: "Substitution amorcée (non terminée) :", latex: `${formatKU(exercice.x0)} \\cdot \\log_{1+u}(${exercice.k})` };
}

// ============================================================================
// Famille C
// ============================================================================

export function formatFonctionC(exercice: ExerciceLimiteLogC): string {
  if (exercice.sousType === "c1") return `\\log_x(x+${exercice.c})`;
  if (exercice.sousType === "c2") return `x\\cdot ${exercice.base}^{\\frac{${exercice.coefC}}{x}}`;
  const denominateur = exercice.coefC === 1 ? "x^2" : `${exercice.coefC}x^2`;
  const constante = exercice.q < 0 ? `- ${-exercice.q}` : `+ ${exercice.q}`;
  return `\\frac{${exercice.base}^x ${constante} + \\sin(x)}{\\ln(1+${denominateur})}`;
}

export function formatDirectionC(exercice: ExerciceLimiteLogC): string {
  if (exercice.sousType === "c1") return exercice.direction === "droite" ? "x \\to 1^+" : "x \\to 1^-";
  if (exercice.sousType === "c2") return exercice.direction === "plus_infini" ? "x \\to +\\infty" : "x \\to -\\infty";
  return "x \\to 0";
}

function consigneC(phase: "cDiagnostic" | "cConclure"): FragmentConsigne[] {
  if (phase === "cDiagnostic") return [texte("Évalue séparément le numérateur et le dénominateur (ou chaque facteur) AVANT toute technique de forme indéterminée.")];
  return [texte("À partir du diagnostic de l'étape précédente, conclus la limite (détermine le signe si besoin).")];
}

function aideC1(phase: "cDiagnostic" | "cConclure"): AideAvecLatex {
  if (phase === "cDiagnostic") return { texte: "Réflexe à avoir SYSTÉMATIQUEMENT avant d'invoquer une technique de forme indéterminée : évalue chaque partie séparément, elle n'est peut-être pas indéterminée du tout.", latex: null };
  return { texte: "Utilise le signe et le statut de chaque partie (confirmés à l'étape précédente) pour conclure — au besoin, distingue l'approche à gauche/à droite.", latex: null };
}

/** Configuration d'UNE partie de l'écran "cDiagnostic" — chaque sous-type de famille C n'expose que
 * le sous-ensemble d'options pertinent (ex. le numérateur de c1/c3 n'est JAMAIS infini/nul, seul un
 * champ "Valeur" a un sens ; le dénominateur, lui, n'est JAMAIS une valeur finie). Consommé par
 * `components6e/EtapeDiagnosticC.tsx`. */
export interface ConfigPartieDiagnostic {
  label: string;
  /** Libellé avec formule (texte + LaTeX), prioritaire sur `label` quand il existe — jamais une
   * formule écrite au clavier dans `label` (« b^(c/x) »). */
  labelFragments?: FragmentConsigne[];
  optionsCategorielles: ("plus_infini" | "moins_infini" | "zero")[];
  autoriserValeurLibre: boolean;
  placeholderValeur: string;
  /** Valeurs finies proposées en BOUTONS (sans champ), ex. « 1 » pour la base d'une puissance
   * (famille D) — additif : absent pour les familles A–C. Chaque entrée est le texte soumis, rendu en
   * KaTeX sur le bouton. */
  optionsValeurs?: string[];
}

export function configDiagnosticPartiesC(exercice: ExerciceLimiteLogC): { partie1: ConfigPartieDiagnostic; partie2: ConfigPartieDiagnostic } {
  if (exercice.sousType === "c2") {
    return {
      partie1: { label: "Facteur x →", optionsCategorielles: ["plus_infini", "moins_infini"], autoriserValeurLibre: false, placeholderValeur: "" },
      partie2: {
        label: "Facteur exponentiel →",
        labelFragments: [texte("Facteur "), latex(`${exercice.base}^{\\frac{${exercice.coefC}}{x}}`), texte(" →")],
        optionsCategorielles: [],
        autoriserValeurLibre: true,
        placeholderValeur: "ex : 5/7",
      },
    };
  }
  return {
    partie1: { label: "Numérateur (valeur finie)", optionsCategorielles: [], autoriserValeurLibre: true, placeholderValeur: "ex : 3*ln(7)" },
    partie2: { label: "Dénominateur →", optionsCategorielles: ["plus_infini", "moins_infini", "zero"], autoriserValeurLibre: false, placeholderValeur: "" },
  };
}

/** Aide 2 de la famille C — la démarche appliquée à l'exercice, jamais les valeurs elles-mêmes. */
function aideC2(phase: "cDiagnostic" | "cConclure", exercice: ExerciceLimiteLogC): AideAvecLatex {
  if (phase === "cDiagnostic") {
    if (exercice.sousType === "c1") return { texte: "Remplace x par 1 dans le numérateur ln(x+c). Pour le dénominateur ln(x), rappelle-toi que ln(1)=0 et regarde de quel côté de 1 on arrive.", latex: "\\log_x(x+c) = \\dfrac{\\ln(x+c)}{\\ln(x)}" };
    if (exercice.sousType === "c2") return { texte: "L'exposant tend vers 0 quand x devient infini : que vaut alors la puissance ?", latex: `${exercice.base}^{\\frac{${exercice.coefC}}{x}} = ${exercice.base}^{\\,\\square}\\ \\text{avec } \\square \\to 0` };
    return { texte: "Remplace x par 0 dans le numérateur (base⁰ = 1 et sin(0) = 0). Le dénominateur ln(1+cx²) tend vers ln(1).", latex: null };
  }
  return { texte: "Règle des signes : une constante non nulle divisée par un nombre qui tend vers 0 tend vers l'infini, avec le signe du quotient ; l'infini multiplié par une constante positive reste un infini de même signe.", latex: null };
}

// ============================================================================
// Famille D — puissances f(x)^{g(x)} (écritures : `formatLimitesPuissances.ts`)
// ============================================================================

/** Écran 1 de la famille D : limite de la base (0, 1, +∞ en boutons) et de l'exposant (+∞, −∞, 0). */
export function configFormePartiesD(): { partie1: ConfigPartieDiagnostic; partie2: ConfigPartieDiagnostic } {
  return {
    partie1: { label: "Base f(x) →", optionsCategorielles: ["zero", "plus_infini"], autoriserValeurLibre: false, placeholderValeur: "", optionsValeurs: ["1"] },
    partie2: { label: "Exposant g(x) →", optionsCategorielles: ["plus_infini", "moins_infini", "zero"], autoriserValeurLibre: false, placeholderValeur: "" },
  };
}

/** Choix fermé du type de forme (écran 1) : les trois formes indéterminées + « pas indéterminée »
 * (distracteur du réflexe « 1^∞ = 1 »). */
export const OPTIONS_FORME_D: { id: string; latex?: string; texte?: string }[] = [...CHOIX_FORME_LATEX, { id: "determinee", texte: "Pas indéterminée" }];

export function libelleChoixFormeD(id: string): string {
  return CHOIX_FORME_LATEX.find((c) => c.id === id)?.latex ?? "\\text{pas indéterminée}";
}

const TEXTE_REFERENCE_D = "Le produit est une forme « l'infini fois 0 » : fais apparaître la limite de référence du cours (point 5), où u tend vers 0 :";

function consigneD(phase: "dForme" | "dExposant" | "dConclure"): FragmentConsigne[] {
  if (phase === "dForme") return [texte("Détermine la limite de la base et celle de l'exposant, puis le type de forme obtenu.")];
  if (phase === "dExposant") {
    return [texte("La base est strictement positive, donc "), latex("f(x)^{g(x)}=e^{g(x)\\ln f(x)}"), texte(". Calcule la limite de l'exposant "), latex("g(x)\\ln f(x)"), texte(" (valeur exacte si elle est finie).")];
  }
  return [texte("Conclus : donne la limite de départ (valeur exacte, par exemple "), latex("e^{-6}"), texte(").")];
}

function aideD1(phase: "dForme" | "dExposant" | "dConclure", exercice: ExerciceLimiteLogD): AideAvecLatex {
  if (phase === "dForme") {
    return { texte: "Évalue séparément la base et l'exposant. Trois formes de puissance sont indéterminées (une base qui tend vers 1 n'est jamais exactement 1) :", latex: "1^{\\pm\\infty},\\qquad 0^{0},\\qquad (+\\infty)^{0}" };
  }
  if (phase === "dConclure") {
    return { texte: "L'exponentielle est continue : la limite de la puissance se déduit de la limite L de l'exposant (confirmée à l'étape précédente) :", latex: `${limD(exercice)} f(x)^{g(x)}=${limD(exercice)} e^{g(x)\\ln f(x)}` };
  }
  switch (exercice.sousType) {
    case "d1":
    case "d2":
    case "d3":
      return { texte: TEXTE_REFERENCE_D, latex: `\\lim_{u\\to 0}\\dfrac{\\ln(1+u)}{u}=1,\\qquad u=${uLatexD(exercice)}` };
    case "d4":
    case "d6":
      return exercice.exposant === "surLn"
        ? { texte: "Écris le logarithme de la base : il se simplifie avec le dénominateur de l'exposant. Rappel :", latex: "\\ln x\\neq 0 \\text{ pour } x\\neq 1" }
        : { texte: "Le produit est une forme « 0 fois l'infini » : utilise une croissance comparée du cours (point 5) :", latex: exercice.sousType === "d4" ? "\\lim_{x\\to 0^+} x\\ln x=0" : "\\lim_{x\\to +\\infty}\\dfrac{\\ln x}{x^{k}}=0\\ (k>0)" };
    case "d5":
    case "d7":
      return { texte: "Le logarithme défait l'exponentielle de la base :", latex: "\\ln\\left(e^{u}\\right)=u" };
  }
}

function aideD2(phase: "dForme" | "dExposant" | "dConclure", exercice: ExerciceLimiteLogD): AideAvecLatex {
  if (phase === "dConclure") {
    return { texte: "Trois cas, selon la limite L de l'exposant :", latex: "\\begin{gathered} L \\text{ fini} \\;\\Rightarrow\\; e^{L} \\\\ L=+\\infty \\;\\Rightarrow\\; +\\infty \\\\ L=-\\infty \\;\\Rightarrow\\; 0 \\end{gathered}" };
  }
  if (phase === "dForme") {
    switch (exercice.sousType) {
      case "d1":
        return { texte: "Pour la base, regarde la fraction ; pour l'exposant, le signe de son coefficient et le côté vers lequel tend x :", latex: `${uLatexD(exercice)}\\to 0` };
      case "d2":
        return { texte: "Pour la base, divise le numérateur et le dénominateur par x ; pour l'exposant, regarde son signe :", latex: `${fLatexD(exercice)}=\\dfrac{1${exercice.b === 0 ? "" : `${exercice.b > 0 ? "+" : "-"}\\frac{${Math.abs(exercice.b)}}{x}`}}{1${exercice.c === 0 ? "" : `${exercice.c > 0 ? "+" : "-"}\\frac{${Math.abs(exercice.c)}}{x}`}}` };
      case "d3":
        return { texte: "Remplace x par 0 dans la base. Dans l'exposant, un nombre non nul divisé par une quantité qui tend vers 0 devient infini : regarde les signes.", latex: null };
      case "d4":
      case "d5":
        return { texte: "Limites utiles quand x tend vers 0 par valeurs positives :", latex: exercice.sousType === "d4" ? "\\lim_{x\\to 0^+}\\ln x=-\\infty" : "\\lim_{t\\to -\\infty} e^{t}=0" };
      case "d6":
      case "d7":
        return { texte: "Limites utiles quand x tend vers l'infini :", latex: exercice.sousType === "d6" ? "\\lim_{x\\to +\\infty}\\ln x=+\\infty" : "\\lim_{t\\to +\\infty} e^{t}=+\\infty" };
    }
  }
  // Écran 2 : l'expression écrite avec les fonctions de l'exercice, transformée mais NON simplifiée.
  const u = uLatexD(exercice);
  if (u !== null) {
    return { texte: "Produit écrit avec les fonctions de l'exercice, puis multiplié et divisé par u (calcul final non fait) :", latex: `g(x)\\ln f(x)=${gLatexD(exercice)}\\cdot ${parSigne(u)}\\cdot\\dfrac{${lnUnPlusULatexD(exercice)}}{${u}}` };
  }
  return { texte: "Produit écrit avec les fonctions de l'exercice (calcul final non fait) :", latex: `g(x)\\ln f(x)=${produitBrutLatexD(exercice)}` };
}

function etatActuelD(phase: "dForme" | "dExposant" | "dConclure", exercice: ExerciceLimiteLogD): string[] | null {
  if (phase === "dForme") return null;
  if (phase === "dExposant") {
    return [`f(x)=${fLatexD(exercice)}\\to ${cibleLatexD(exercice.limiteBase)},\\quad g(x)=${gLatexD(exercice)}\\to ${cibleLatexD(exercice.limiteExposant)}`, `\\text{forme } ${formeExacteLatexD(exercice)}`];
  }
  return [`${limD(exercice)} g(x)\\ln f(x)=${cibleLatexD(exercice.limiteProduit)}`];
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : "consigne générale et bloc de
 * données... redondants sur chaque écran") — un unique bloc `\lim` combinant f(x) et la direction. */
export function formatLimiteEnonceLatex(exercice: ExerciceLimiteLogarithmique): string {
  switch (exercice.famille) {
    case "A":
      return `\\lim_{${formatDirectionA()}} \\left(${formatFonctionA(exercice)}\\right)`;
    case "B":
      return `\\lim_{x \\to ${exercice.x0}} \\left(${formatFonctionB(exercice)}\\right)`;
    case "C":
      return `\\lim_{${formatDirectionC(exercice)}} \\left(${formatFonctionC(exercice)}\\right)`;
    case "D":
      return `${limD(exercice)} ${puissanceLatexD(exercice)}`;
  }
}

export function consigneEcran(phase: PhaseLimiteLogarithmique, exercice: ExerciceLimiteLogarithmique): FragmentConsigne[] {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aDominance" | "aConclure");
    case "B":
      return consigneB(phase as "bReformuler" | "bConclure", exercice);
    case "C":
      return consigneC(phase as "cDiagnostic" | "cConclure");
    case "D":
      return consigneD(phase as "dForme" | "dExposant" | "dConclure");
  }
}

export function aideNiveau1(phase: PhaseLimiteLogarithmique, exercice: ExerciceLimiteLogarithmique): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(phase as "aDominance" | "aConclure");
    case "B":
      return aideB1(phase as "bReformuler" | "bConclure");
    case "C":
      return aideC1(phase as "cDiagnostic" | "cConclure");
    case "D":
      return aideD1(phase as "dForme" | "dExposant" | "dConclure", exercice);
  }
}

export function aideNiveau2(phase: PhaseLimiteLogarithmique, exercice: ExerciceLimiteLogarithmique): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(phase as "aDominance" | "aConclure", exercice);
    case "B":
      return aideB2(phase as "bReformuler" | "bConclure", exercice);
    case "C":
      return aideC2(phase as "cDiagnostic" | "cConclure", exercice);
    case "D":
      return aideD2(phase as "dForme" | "dExposant" | "dConclure", exercice);
  }
}

// ============================================================================
// Bloc "état actuel" — écrans ≥2 uniquement (CLAUDE.md : consigne générale → bloc données → bloc
// "état actuel" → bloc de travail). Dérivé UNIQUEMENT de l'exercice (jamais de la saisie brute de
// l'élève) : reprend le fait déjà CONFIRMÉ de l'écran précédent — dominance (A), reformulation de
// référence en u (B, même formule que `referenceBReformuler`, `moteur6e/
// verificationLimitesLogarithmiques.ts` — une des formes équivalentes acceptées, la vérification
// reste par échantillonnage numérique donc aucune forme n'est LA seule correcte), diagnostic (C),
// exposant/limite de l'exposant (D), numérateur développé/simplifié (E, instance unique). `null`
// sur le tout premier écran de chaque famille. Même convention que `etatActuel` de 6gen13/6gen16.
// ============================================================================

export function etatActuel(phase: PhaseLimiteLogarithmique, exercice: ExerciceLimiteLogarithmique): string[] | null {
  switch (exercice.famille) {
    case "A":
      if (phase === "aDominance") return null;
      return [`\\text{num.} \\to \\text{${formatCategorieLabel(exercice.dominanceNumerateur)}},\\quad \\text{dénom.} \\to \\text{${formatCategorieLabel(exercice.dominanceDenominateur)}}`];
    case "B":
      if (phase === "bReformuler") return null;
      return [`f = ${formatReformulationBLatex(exercice)}`];
    case "C": {
      if (phase === "cDiagnostic") return null;
      const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
      return [`\\text{partie 1} \\to ${formatCibleTexte(cible1)},\\quad \\text{partie 2} \\to ${formatCibleTexte(cible2)}`];
    }
    case "D":
      return etatActuelD(phase as "dForme" | "dExposant" | "dConclure", exercice);
  }
}
