/**
 * Couche présentation (5e) — consignes/labels/formules pour 5gen11 ("Extremums d'une fonction
 * sinusoïdale"). Réutilise `formatRationnelPiLatex`/`formatCoefficientAmplitudeLatex`
 * (`ui5e/formatParametresSinusoide.ts`, module frère déjà partagé par 5gen8/9, import
 * présentation→présentation) — jamais un second algorithme de rendu de `RationnelPi`.
 */
import { reduireRationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";
import type { ExerciceExtremumsSinusoide, ModeExtremum, RationnelPi } from "../core5e/extremumsSinusoide.types";
import { valeurTrigVisee } from "../generateurs5e/extremumsSinusoide";
import { formatCoefficientAmplitudeLatex, formatRationnelPiLatex } from "./formatParametresSinusoide";

/** Coefficient de x — omet le "1" littéral (même convention que l'amplitude, déjà établie). */
function formatCoefficientDeXLatex(a: RationnelPi): string {
  const r = reduireRationnelPi(a);
  if (r.degrePi === 0 && r.numerateur === r.denominateur) return "";
  if (r.degrePi === 0 && r.numerateur === -r.denominateur) return "-";
  return formatRationnelPiLatex(a);
}

/** Terme "+bArg"/"-bArg" à l'intérieur de sin/cos(...), jamais affiché si bArg=0. */
function formatTermeBArgLatex(bArg: RationnelPi): string {
  const r = reduireRationnelPi(bArg);
  if (r.numerateur === 0) return "";
  const latex = formatRationnelPiLatex(r);
  return latex.startsWith("-") ? latex : `+${latex}`;
}

/** Décalage vertical, jamais affiché s'il est nul, jamais de double signe. */
function formatTermeDecalageLatex(b: number): string {
  if (b === 0) return "";
  return b > 0 ? `+${b}` : `${b}`;
}

/** L'argument complet "ax+bArg" (jamais "u") — réutilisé à la fois DANS sin/cos(...) du bloc de
 * données (`formatFonctionSourceLatex`) et comme membre gauche de l'équation d'extremum substituée
 * (`formatEquationSubstitueeLatex`, écran 1/2/3, B.1) : la même expression, jamais recalculée deux
 * fois différemment. */
function formatArgumentLatex(exercice: ExerciceExtremumsSinusoide): string {
  const coeffX = formatCoefficientDeXLatex(exercice.a);
  const termeBArg = formatTermeBArgLatex(exercice.bArg);
  // `\cdot` requis quand le coefficient se termine par une commande LaTeX (ex. "\pi") — sinon
  // "\pi"+"x" concatène en "\pix", une commande LaTeX invalide (bug trouvé par test KaTeX direct).
  const termeX = coeffX === "" ? "x" : coeffX === "-" ? "-x" : coeffX.includes("\\") ? `${coeffX}\\cdot x` : `${coeffX}x`;
  return `${termeX}${termeBArg}`;
}

/** A·sin/cos(ax+bArg)+b — forme développée (même patron que `formatFormuleDeveloppeeLatex`,
 * 5gen8), affichée dans le bloc de données, jamais utilisée pour le calcul. Sans préfixe "f(x) ="
 * (B.1 — retiré du bloc de données). */
export function formatFonctionSourceLatex(exercice: ExerciceExtremumsSinusoide): string {
  const coeffA = formatCoefficientAmplitudeLatex(exercice.amplitude);
  const nomFonction = exercice.fonction === "sin" ? "\\sin" : "\\cos";
  return `${coeffA}${nomFonction}(${formatArgumentLatex(exercice)})${formatTermeDecalageLatex(exercice.decalageVertical)}`;
}

/** L'équation d'extremum COMPLÈTE, argument substitué — "ax+bArg = constante+k·période" — jamais
 * la forme abstraite "u=..." (B.1, changement de comportement, pas seulement de texte : c'est cette
 * forme qui est désormais la réponse ATTENDUE à l'écran 1, voir
 * `moteur5e/verificationExtremumsSinusoide.ts::diagnostiquerPoserEquationExtremum`). Réutilisée
 * telle quelle par le bloc "état actuel" des écrans 2/3 (B.2). */
/** Terme « k·période » écrit comme au cours : « 2k\\pi », « k\\pi », « \\dfrac{2k\\pi}{3} », « 2k »,
 * « \\dfrac{k}{2} » — jamais « k\\cdot 2 ». La période est positive (signe sans effet, k ∈ ℤ). */
function formatTermeKLatex(periode: RationnelPi): string {
  const r = reduireRationnelPi(periode);
  const n = Math.abs(r.numerateur);
  const d = r.denominateur;
  const coeff = n === 1 ? "k" : `${n}k`;
  if (r.degrePi === 1) return d === 1 ? `${coeff}\\pi` : `\\dfrac{${coeff}\\pi}{${d}}`;
  if (r.degrePi === -1) return `\\dfrac{${coeff}}{${d === 1 ? "" : d}\\pi}`;
  return d === 1 ? coeff : `\\dfrac{${coeff}}{${d}}`;
}

/** « constante + k·période », la constante omise si nulle. */
function formatSerieLatex(branche: { constante: RationnelPi; periode: RationnelPi }): string {
  const terme = formatTermeKLatex(branche.periode);
  if (reduireRationnelPi(branche.constante).numerateur === 0) return terme;
  return `${formatRationnelPiLatex(branche.constante)} + ${terme}`;
}

export function formatEquationSubstitueeLatex(exercice: ExerciceExtremumsSinusoide): string {
  return `${formatArgumentLatex(exercice)} = ${formatSerieLatex(exercice.brancheU)}`;
}

/**
 * Bloc "état actuel" — récapitule les valeurs déjà CONFIRMÉES d'un écran à l'autre (jamais la
 * saisie brute de l'élève : toujours dérivée de `exercice`, puisqu'un écran n'est atteint qu'une
 * fois l'écran précédent réellement résolu, correctement ou par révélation — même convention que
 * `formatTermesEtatActuelCELatex`, 5gen1). Rien sur "poserEquation" (premier écran, rien encore
 * confirmé) ; l'équation d'extremum SUBSTITUÉE (B.1/B.2, jamais l'ancienne forme abstraite "u=...")
 * sur "isolerX" ; en plus la branche isolée en x sur "solutions" (accumulatif, jamais un
 * remplacement). Toujours symbolique (fractions de π), jamais décimal (B.3).
 */
export function formatTermesEtatActuelExtremums(exercice: ExerciceExtremumsSinusoide, phase: "poserEquation" | "isolerX" | "solutions"): string[] {
  if (phase === "poserEquation") return [];
  const termeEquation = formatEquationSubstitueeLatex(exercice);
  if (phase === "isolerX") return [termeEquation];
  return [termeEquation, `x = ${formatSerieLatex(exercice.brancheX)}`];
}

// ============================================================================
// Consignes.
// ============================================================================

/** Ce que l'on cherche, selon le mode (point 38) — « extremums », jamais « extrema » (vocabulaire du cours). */
const OBJET_MODE: Record<ModeExtremum, string> = {
  maximums: "ses maximums",
  minimums: "ses minimums",
  extremums: "tous ses extremums (maximums et minimums)",
};

/** Point 40 : l'intervalle final est annoncé dès l'énoncé. */
export function consigneGeneraleExtremums(exercice: ExerciceExtremumsSinusoide): string {
  return `Détermine où cette fonction atteint ${OBJET_MODE[exercice.mode]} : d'abord pour tout x réel (k désigne un entier), puis dans [0 ; 2π[.`;
}

const OBJET_MODE_COURT: Record<ModeExtremum, string> = {
  maximums: "des maximums",
  minimums: "des minimums",
  extremums: "des extremums",
};

export function consignePhaseExtremums(exercice: ExerciceExtremumsSinusoide, phase: "poserEquation" | "isolerX"): string {
  if (phase === "poserEquation") return `Écris l'équation qui donne les positions ${OBJET_MODE_COURT[exercice.mode]} (utilise « k » comme entier).`;
  return "Isole x : donne les solutions de cette équation en fonction de k.";
}

export function consigneSolutionsExtremums(exercice: ExerciceExtremumsSinusoide): string {
  return `Donne toutes les positions ${OBJET_MODE_COURT[exercice.mode]} dans [0 ; 2π[, chaque valeur une seule fois.`;
}

// ============================================================================
// Aides — écran "poserEquation" UNIQUEMENT (B.1 : aide niveau 2 retirée, écran "isolerX" n'a plus
// aucune aide — voir `moteur5e/sessionExtremumsSinusoide.ts::niveauAideMaxExtremums`).
// ============================================================================

/** "X" (jamais "u") et "série" (jamais "branche") — renommage B.1, le texte rappelle uniquement la
 * méthode (jamais de valeur substituée : le niveau 2, qui donnait la formule substituée, est
 * entièrement retiré). */
/** Aide de niveau 1 (point 35 : texte en phrase, formule en LaTeX). Pour un maximum ou un minimum
 * seul, la valeur visée (1 ou −1) dépend du SIGNE de l'amplitude. */
export function texteAideNiveau1Extremums(exercice: ExerciceExtremumsSinusoide): string {
  const f = exercice.fonction;
  if (exercice.mode === "extremums") return `Les extremums sont atteints quand ${f}(X) vaut 1 OU −1 : ces deux cas se réunissent en une seule série, de période π.`;
  const vise = valeurTrigVisee(exercice.mode, exercice.amplitude);
  const signe = exercice.amplitude.signe > 0 ? "positive" : "négative";
  const objet = exercice.mode === "maximums" ? "Les maximums" : "Les minimums";
  return `${objet} sont atteints quand ${f}(X) = ${vise === 1 ? "1" : "−1"} (l'amplitude est ${signe}) : une seule série, de période 2π.`;
}

export function latexAideNiveau1Extremums(exercice: ExerciceExtremumsSinusoide): string {
  const f = exercice.fonction === "sin" ? "\\sin" : "\\cos";
  if (exercice.mode === "extremums") return exercice.fonction === "sin" ? "\\sin X = \\pm 1 \\iff X = \\frac{\\pi}{2} + k\\pi" : "\\cos X = \\pm 1 \\iff X = k\\pi";
  const vise = valeurTrigVisee(exercice.mode, exercice.amplitude);
  if (exercice.fonction === "sin") return vise === 1 ? `${f} X = 1 \\iff X = \\frac{\\pi}{2} + 2k\\pi` : `${f} X = -1 \\iff X = -\\frac{\\pi}{2} + 2k\\pi`;
  return vise === 1 ? `${f} X = 1 \\iff X = 2k\\pi` : `${f} X = -1 \\iff X = \\pi + 2k\\pi`;
}

export const TEXTE_AIDE_SOLUTIONS_NIVEAU1 =
  "Donne à k des valeurs entières successives (…, −1, 0, 1, 2, …) dans la série de x obtenue à l'écran précédent, et garde les valeurs comprises dans [0 ; 2π[.";
export const TEXTE_AIDE_SOLUTIONS_NIVEAU2 = "Un premier point est déjà placé sur le cercle, à titre d'exemple — retrouve les autres de la même façon.";

/** Placeholder de l'écran "poserEquation" — équation complète, argument substitué (B.1, jamais la
 * forme abstraite "u=..."). Statique (même convention que l'ancien placeholder unique) : un exemple
 * générique, jamais dérivé de l'exercice tiré. */
export const PLACEHOLDER_POSER_EQUATION_EXTREMUMS = "ex : 7*x-3=pi/5+k*pi";
/** Placeholder de l'écran "isolerX" — "n" renommé "k" (B.1). */
export const PLACEHOLDER_ISOLER_X_EXTREMUMS = "ex : pi/5+k*2*pi/7";

/** Réponse finale révélée, lisible EN x (point 40 : elle n'était montrée que sur un cercle, les x
 * placés comme des angles) — fraction de π, ou fraction simple, quand la valeur en est une. */
export function formatSolutionsExtremumsLatex(solutions: number[]): string {
  const valeur = (v: number): string => {
    if (Math.abs(v) < 1e-9) return "0";
    for (let d = 1; d <= 48; d++) {
      const n = Math.round((v / Math.PI) * d);
      if (n !== 0 && Math.abs(v - (n * Math.PI) / d) < 1e-9) {
        let a = Math.abs(n);
        let b = d;
        while (b) [a, b] = [b, a % b];
        const num = n / a;
        const den = d / a;
        const numerateur = num === 1 ? "\\pi" : `${num}\\pi`;
        return den === 1 ? numerateur : `\\frac{${numerateur}}{${den}}`;
      }
    }
    // Valeur rationnelle sans π (période T entière : x = 3/2, 4…).
    for (let d = 1; d <= 48; d++) {
      const n = Math.round(v * d);
      if (Math.abs(v - n / d) < 1e-9) {
        let a = Math.abs(n);
        let b = d;
        while (b) [a, b] = [b, a % b];
        return d / a === 1 ? `${n / a}` : `\\frac{${n / a}}{${d / a}}`;
      }
    }
    return v.toFixed(2).replace(".", "{,}");
  };
  return `x \\in \\left\\{ ${solutions.map(valeur).join(" \\,;\\, ")} \\right\\}`;
}
