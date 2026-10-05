/**
 * Couche présentation (5e) — consignes/labels/formules pour 5gen11 ("Extremums d'une fonction
 * sinusoïdale"). Réutilise `formatRationnelPiLatex`/`formatCoefficientAmplitudeLatex`
 * (`ui5e/formatParametresSinusoide.ts`, module frère déjà partagé par 5gen8/9, import
 * présentation→présentation) — jamais un second algorithme de rendu de `RationnelPi`.
 */
import { reduireRationnelPi } from "../generateurs5e/parametresSinusoide/rationnelPi";
import type { ExerciceExtremumsSinusoide, FonctionExtremum, RationnelPi } from "../core5e/extremumsSinusoide.types";
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
export function formatEquationSubstitueeLatex(exercice: ExerciceExtremumsSinusoide): string {
  const constanteReduite = reduireRationnelPi(exercice.brancheU.constante);
  const periode = formatRationnelPiLatex(exercice.brancheU.periode);
  if (constanteReduite.numerateur === 0) return `${formatArgumentLatex(exercice)} = k\\cdot ${periode}`;
  const constante = formatRationnelPiLatex(exercice.brancheU.constante);
  return `${formatArgumentLatex(exercice)} = ${constante} + k\\cdot ${periode}`;
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
  const constanteX = formatRationnelPiLatex(exercice.brancheX.constante);
  const periodeX = formatRationnelPiLatex(exercice.brancheX.periode);
  const termeX = `x = ${constanteX} + k\\cdot ${periodeX}`;
  return [termeEquation, termeX];
}

// ============================================================================
// Consignes.
// ============================================================================

export const CONSIGNE_GENERALE_EXTREMUMS = "Détermine où cette fonction atteint un extremum (maximum ou minimum).";

const CONSIGNES_PHASE: Record<"poserEquation" | "isolerX", string> = {
  poserEquation: "Écris l'équation qui permet de déterminer les extrema (utilise « k » comme entier libre).",
  isolerX: "Donne les solutions de cette équation en fonction de k.",
};

export function consignePhaseExtremums(phase: "poserEquation" | "isolerX"): string {
  return CONSIGNES_PHASE[phase];
}

export const TEXTE_CONSIGNE_SOLUTIONS = "Liste toutes les positions d'extremum distinctes dans [0;2π[ (une valeur par point).";

// ============================================================================
// Aides — écran "poserEquation" UNIQUEMENT (B.1 : aide niveau 2 retirée, écran "isolerX" n'a plus
// aucune aide — voir `moteur5e/sessionExtremumsSinusoide.ts::niveauAideMaxExtremums`).
// ============================================================================

/** "X" (jamais "u") et "série" (jamais "branche") — renommage B.1, le texte rappelle uniquement la
 * méthode (jamais de valeur substituée : le niveau 2, qui donnait la formule substituée, est
 * entièrement retiré). */
export function texteAideNiveau1Extremums(fonction: FonctionExtremum): string {
  return fonction === "sin"
    ? "sin(X)=±1 ⟺ X=π/2+k·π — UNE SEULE série fusionnée, de période π (jamais 2π : ce cas est distinct du cas spécial sin(X)=1 seul, qui aurait 2 séries de période 2π)."
    : "cos(X)=±1 ⟺ X=k·π — UNE SEULE série fusionnée, de période π (jamais 2π : ce cas est distinct du cas spécial cos(X)=1 seul, qui aurait 2 séries de période 2π).";
}

export const TEXTE_AIDE_SOLUTIONS_NIVEAU1 =
  "Balaie k (entier relatif) dans la branche x=constante+k·période obtenue à l'écran précédent, et ne garde que les valeurs qui tombent dans [0;2π[.";
export const TEXTE_AIDE_SOLUTIONS_NIVEAU2 = "Un premier point est déjà placé sur le cercle, à titre d'exemple — retrouve les autres de la même façon.";

/** Placeholder de l'écran "poserEquation" — équation complète, argument substitué (B.1, jamais la
 * forme abstraite "u=..."). Statique (même convention que l'ancien placeholder unique) : un exemple
 * générique, jamais dérivé de l'exercice tiré. */
export const PLACEHOLDER_POSER_EQUATION_EXTREMUMS = "ex : 2*x-3=k*pi";
/** Placeholder de l'écran "isolerX" — "n" renommé "k" (B.1). */
export const PLACEHOLDER_ISOLER_X_EXTREMUMS = "ex : pi/12+k*pi/2";
