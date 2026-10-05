import type { ExerciceLimiteA, ExerciceLimiteB, ExerciceLimiteC, ExerciceLimiteExponentielle, ExerciceLimiteH, ExerciceLimiteI, ExerciceLimiteJ, ExerciceLimiteK, ExerciceLimiteL, ExerciceLimiteN } from "../core6e/limitesExponentielles.types";
import type { PhaseLimiteExponentielle, ResultatExerciceLimiteExponentielle } from "../moteur6e/typesLimitesExponentielles";
import { fusionnerOperateurSigne } from "./formatOperateurSigne";

/**
 * Textes de consigne/aide + formatage LaTeX pour `6gen6`. Toute aide qui embarque un symbole LaTeX
 * est retournée en `AideAvecLatex {texte, latex}` — jamais interpolée en texte brut (piège déjà
 * rencontré et corrigé sur `6gen9`, voir CLAUDE.md "Bug trouvé par Playwright, corrigé —
 * coefficient nul affiché tel quel").
 *
 * **Décision de conception — dispatch PAR FAMILLE, pas par phase seule** : les phases sont
 * préfixées par famille (`aExposant`, `bExponentielle`...) et n'ont jamais de sens hors de leur
 * famille — plutôt qu'un unique `switch(phase)` mêlant les 7 familles avec des replis `exercice.
 * famille===X?...:...` sur chaque branche (fragile, difficile à relire), chaque famille a sa
 * propre fonction `aideXxx1`/`aideXxx2` prenant directement `Exercice<Famille>` typé — le
 * dispatcher public (`aideNiveau1`/`aideNiveau2`) ne fait que router vers la bonne fonction.
 */
export const CONSIGNE_GENERALE = "Calcule la limite suivante :";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface TermeSigne {
  valeur: number;
  suffixe: string;
}

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

/** Exporté pour le récapitulatif final (`ResultatPanelLimiteExponentielle.tsx`) — contenu de
 * chaque `LigneRecap` = la cible RÉELLEMENT attendue de l'écran, jamais un score. */
export function formatCibleTexte(cible: { type: string; valeur?: number }): string {
  if (cible.type === "plus_infini") return "+\\infty";
  if (cible.type === "moins_infini") return "-\\infty";
  if (cible.type === "zero") return "0";
  return String(cible.valeur);
}

/** Jamais d'exposant `^{1}` littéral (`d`/`p`/`r`/`s` peuvent tous valoir 1 selon la famille) —
 * même principe que l'absence de coefficient `±1` littéral déjà appliquée partout ailleurs sur la
 * plateforme via `formatSommeTermes`. Bug trouvé par Playwright (familles A/C, capture "x^1"
 * affiché tel quel), corrigé puis étendu par précaution à toute autre puissance variable de x du
 * fichier (familles B/D). */
function formatPuissance(base: string, exposant: number): string {
  return exposant === 1 ? base : `${base}^{${exposant}}`;
}

// ============================================================================
// Famille A
// ============================================================================

function formatGDeXLatex(exercice: ExerciceLimiteA & { sousCas: "puissance" }): string {
  if (exercice.gAffine !== null) return formatSommeTermes([{ valeur: exercice.gAffine.m, suffixe: "x" }, { valeur: exercice.gAffine.n, suffixe: "" }]);
  return exercice.gCarreSigne === 1 ? "x^2" : "-x^2";
}

function formatFonctionA(exercice: ExerciceLimiteA): string {
  if (exercice.sousCas === "puissance") return `${exercice.base}^{${formatGDeXLatex(exercice)}}`;
  const nDeX = formatSommeTermes([{ valeur: exercice.a, suffixe: "x" }, { valeur: exercice.b, suffixe: "" }]);
  return `e^{\\frac{${nDeX}}{${formatPuissance("x", exercice.s)}}}`;
}

function formatDirectionA(exercice: ExerciceLimiteA): string {
  if (exercice.sousCas === "puissance") return exercice.direction === "plus_infini" ? "x \\to +\\infty" : "x \\to -\\infty";
  return exercice.directionZero === "zero_plus" ? "x \\to 0^+" : "x \\to 0^-";
}

function consigneA(phase: "aExposant" | "aGlobale"): string {
  return phase === "aExposant" ? "Détermine la limite de l'exposant (ou de la fraction interne)." : "À partir de la limite CORRECTE de l'exposant, conclus la limite globale (règle base>1 / base<1).";
}

function aideA1(phase: "aExposant" | "aGlobale"): AideAvecLatex {
  if (phase === "aExposant") return { texte: "Étudie séparément le signe/la croissance de l'exposant (ou de la fraction interne) selon la direction demandée.", latex: null };
  return {
    texte: "Rappel des deux règles génériques (sans dire laquelle s'applique ici) :",
    latex: "\\begin{gathered} \\text{base}>1,\\ \\text{exposant}\\to+\\infty \\Rightarrow +\\infty \\\\ \\text{base}<1,\\ \\text{exposant}\\to+\\infty \\Rightarrow 0 \\end{gathered}",
  };
}

function aideA2(phase: "aExposant" | "aGlobale", exercice: ExerciceLimiteA): AideAvecLatex {
  const baseNumerique = exercice.sousCas === "puissance" ? String(exercice.base) : "e";
  if (phase === "aExposant") {
    return { texte: "Forme de l'exposant et direction :", latex: `${formatDirectionA(exercice)}` };
  }
  return { texte: "Base et signe de la limite de l'exposant (déjà confirmée à l'étape précédente) :", latex: `\\text{base} = ${baseNumerique},\\quad \\text{exposant} \\to ${formatCibleTexte(exercice.limiteExposant)}` };
}

/** Bloc "état actuel" (`aGlobale` seulement — `aExposant` est le premier écran de la famille, rien
 * à rappeler) : la limite de l'exposant CONFIRMÉE à l'écran précédent, jamais la saisie brute de
 * l'élève (même donnée `exercice.limiteExposant` que `verifierAExposant`/`aideA2`). */
function etatActuelA(exercice: ExerciceLimiteA, phase: "aExposant" | "aGlobale"): string[] | null {
  if (phase === "aExposant") return null;
  return [`\\text{exposant} \\to ${formatCibleTexte(exercice.limiteExposant)}\\ \\text{(étape 1)}`];
}

// ============================================================================
// Famille B
// ============================================================================

function formatFonctionB(exercice: ExerciceLimiteB): string {
  const poly = formatSommeTermes([{ valeur: exercice.q, suffixe: formatPuissance("x", exercice.d) }, { valeur: exercice.r, suffixe: "" }]);
  const exposant = formatSommeTermes([{ valeur: 1, suffixe: "x^2" }, { valeur: exercice.p, suffixe: "" }]);
  return `${exercice.base}^{${exposant}} ${fusionnerOperateurSigne("+", poly)}`;
}

function formatDirectionB(exercice: ExerciceLimiteB): string {
  return exercice.direction === "plus_infini" ? "x \\to +\\infty" : "x \\to -\\infty";
}

function consigneB(phase: "bExponentielle" | "bPolynomiale" | "bGlobale"): string {
  if (phase === "bExponentielle") return "Détermine la limite du terme exponentiel seul.";
  if (phase === "bPolynomiale") return "Détermine la limite du terme polynomial seul.";
  return "À partir des deux limites CORRECTES précédentes, conclus la limite globale.";
}

function memeSigneB(exercice: ExerciceLimiteB): boolean {
  // "même signe" n'est pertinent que si le terme exponentiel diverge (base>1) — sinon il est
  // négligeable et la somme suit simplement le polynôme (jamais un vrai conflit de signe).
  if (!exercice.baseSuperieureA1) return true;
  return exercice.limiteExponentielle.type === exercice.limitePolynomiale.type;
}

function aideB1(phase: "bExponentielle" | "bPolynomiale" | "bGlobale", exercice: ExerciceLimiteB): AideAvecLatex {
  if (phase === "bExponentielle") return { texte: "x²+p → +∞ quelle que soit la direction (x² domine toujours). Applique ensuite la règle base>1/base<1.", latex: null };
  if (phase === "bPolynomiale") return { texte: "d est impair : x^d change de signe selon que x→+∞ ou x→−∞. Regarde le signe de q·x^d.", latex: null };
  if (memeSigneB(exercice)) return { texte: "Les deux termes ont le même signe à l'infini (ou le terme exponentiel est négligeable) : la somme suit directement ce signe.", latex: null };
  return { texte: "Les deux termes ont des signes opposés (forme ∞−∞) : une exponentielle qui diverge l'emporte TOUJOURS sur n'importe quelle puissance de x, quel que soit son degré.", latex: null };
}

function aideB2(phase: "bExponentielle" | "bPolynomiale" | "bGlobale", exercice: ExerciceLimiteB): AideAvecLatex {
  if (phase === "bExponentielle") return { texte: "Base et exposant substitués :", latex: `\\text{base}=${exercice.base},\\quad x^2+p \\to +\\infty` };
  if (phase === "bPolynomiale") return { texte: "Terme polynomial substitué :", latex: formatSommeTermes([{ valeur: exercice.q, suffixe: formatPuissance("x", exercice.d) }, { valeur: exercice.r, suffixe: "" }]) };
  return { texte: "Réécris le terme exponentiel comme un rapport, pour rendre la comparaison de croissance visible :", latex: "a^{u(x)} = \\frac{1}{a^{-u(x)}}" };
}

/** Bloc "état actuel" — ACCUMULE (plus ancien en premier, jamais un remplacement) : `bPolynomiale`
 * rappelle la limite exponentielle confirmée à l'écran 1 ; `bGlobale` y ajoute la limite
 * polynomiale confirmée à l'écran 2 — jamais seulement le dernier écran (piège documenté ailleurs
 * sur ce chapitre, voir `formatExponentiellesProblemes.ts::etatActuelB`). */
function etatActuelB(exercice: ExerciceLimiteB, phase: "bExponentielle" | "bPolynomiale" | "bGlobale"): string[] | null {
  if (phase === "bExponentielle") return null;
  const exponentielle = `\\text{terme exponentiel} \\to ${formatCibleTexte(exercice.limiteExponentielle)}\\ \\text{(étape 1)}`;
  if (phase === "bPolynomiale") return [exponentielle];
  const polynomiale = `\\text{terme polynomial} \\to ${formatCibleTexte(exercice.limitePolynomiale)}\\ \\text{(étape 2)}`;
  return [exponentielle, polynomiale];
}

// ============================================================================
// Famille C
// ============================================================================

function formatFonctionC(exercice: ExerciceLimiteC): string {
  return `${formatPuissance("x", exercice.r)} \\cdot e^{-${formatPuissance("x", exercice.s)}}`;
}

function consigneC(phase: "cFacteurs" | "cGlobale"): string {
  return phase === "cFacteurs" ? "Détermine la limite de chacun des deux facteurs séparément." : "Conclus la limite du produit (réécris-le mentalement en quotient pour comparer les vitesses de croissance).";
}

function aideC1(phase: "cFacteurs" | "cGlobale"): AideAvecLatex {
  if (phase === "cFacteurs") return { texte: "x^r (r>0) diverge vers +∞. Attention au signe de l'exposant dans e^(−x^s) : −x^s → −∞ quand x→+∞, donc e^(−x^s) → 0.", latex: null };
  return { texte: "Réécris mentalement le produit x^r·e^(−x^s) comme un quotient x^r / e^(x^s), pour rendre la comparaison de croissance visible.", latex: null };
}

function aideC2(phase: "cFacteurs" | "cGlobale", exercice: ExerciceLimiteC): AideAvecLatex {
  if (phase === "cFacteurs") return { texte: "Rappel : r et s sont tous deux STRICTEMENT POSITIFS.", latex: `r=${exercice.r},\\ s=${exercice.s}` };
  return { texte: "L'exponentielle au dénominateur croît plus vite que n'importe quelle puissance de x au numérateur — le quotient tend donc vers 0.", latex: `\\frac{${formatPuissance("x", exercice.r)}}{e^{${formatPuissance("x", exercice.s)}}} \\to 0` };
}

/** Bloc "état actuel" (`cGlobale` seulement) — les 2 limites de facteurs sont confirmées EN UNE
 * FOIS à l'écran combiné "facteurs" (spec : "Champ : 2 valeurs"), donc toutes deux tagées "écran 1"
 * plutôt qu'une accumulation à 2 pas. */
function etatActuelC(exercice: ExerciceLimiteC, phase: "cFacteurs" | "cGlobale"): string[] | null {
  if (phase === "cFacteurs") return null;
  return [`x^r \\to ${formatCibleTexte(exercice.limiteFacteur1)}\\ \\text{(étape 1)}`, `e^{-x^s} \\to ${formatCibleTexte(exercice.limiteFacteur2)}\\ \\text{(étape 1)}`];
}

// ============================================================================
// Famille G — instance unique
// ============================================================================

function formatFonctionG(): string {
  return "\\frac{1}{\\cos(x)} + \\frac{1}{1 - e^{\\frac{\\pi}{2}-x}}";
}

function consigneG(phase: "gCombiner" | "gOrdre1" | "gConclure"): string {
  if (phase === "gCombiner") return "Combine les deux termes en une seule fraction (dénominateur commun).";
  if (phase === "gOrdre1") return "Un développement à l'ordre 1 (en u=π/2−x) suffit-il à conclure la limite ?";
  return "Pousse le développement au second ordre, puis conclus la valeur exacte de la limite.";
}

function aideG1(phase: "gCombiner" | "gOrdre1" | "gConclure"): AideAvecLatex {
  if (phase === "gCombiner") return { texte: "Mets les deux fractions au même dénominateur commun cos(x)·(1−e^(π/2−x)), puis additionne les numérateurs — ne simplifie rien d'autre à cette étape.", latex: null };
  if (phase === "gOrdre1") {
    return {
      texte: "Pose u=π/2−x (x→π/2 ⟺ u→0). Développements limités à l'ordre 1 :",
      latex: "\\begin{gathered} \\cos(x) = \\cos\\left(\\frac{\\pi}{2}-u\\right) = \\sin(u) \\approx u \\\\ 1-e^{\\frac{\\pi}{2}-x} = 1-e^u \\approx -u \\end{gathered}",
    };
  }
  return {
    texte: "Développements limités à l'ordre 2 (u=π/2−x→0) :",
    latex: "\\begin{gathered} \\sin(u) \\approx u - \\frac{u^3}{6} \\\\ 1-e^u \\approx -u-\\frac{u^2}{2}-\\frac{u^3}{6} \\end{gathered}",
  };
}

function aideG2(phase: "gCombiner" | "gOrdre1" | "gConclure"): AideAvecLatex {
  if (phase === "gCombiner") return { texte: "Numérateur combiné :", latex: "\\left(1-e^{\\frac{\\pi}{2}-x}\\right) + \\cos(x)" };
  if (phase === "gOrdre1") return { texte: "À l'ordre 1, les DEUX termes se comportent comme 1/u et −1/u : ils s'annulent EXACTEMENT — il faut pousser plus loin.", latex: "\\frac{1}{u} + \\frac{1}{-u} = 0" };
  return { texte: "Numérateur et dénominateur substitués (non simplifiés) :", latex: "\\frac{1}{u-\\frac{u^3}{6}} + \\frac{1}{-u-\\frac{u^2}{2}-\\frac{u^3}{6}}" };
}

/** Forme canonique complète attendue à l'écran "combiner" (numérateur combiné, voir `aideG2`
 * ci-dessus, SUR le dénominateur commun annoncé par `aideG1`) — instance unique, aucun paramètre. */
function formatFormeCombineeG(): string {
  return "\\frac{\\left(1-e^{\\frac{\\pi}{2}-x}\\right) + \\cos(x)}{\\cos(x)\\left(1-e^{\\frac{\\pi}{2}-x}\\right)}";
}

/** Bloc "état actuel" — ACCUMULE (plus ancien en premier) : `gOrdre1` rappelle la forme combinée
 * confirmée à l'écran 1 ; `gConclure` y ajoute le constat "ordre 1 insuffisant" confirmé à l'écran
 * 2 (réponse TOUJOURS "Non" pour cette instance unique, voir `verifierGOrdre1`) — jamais seulement
 * le dernier écran. */
function etatActuelG(phase: "gCombiner" | "gOrdre1" | "gConclure"): string[] | null {
  if (phase === "gCombiner") return null;
  const combinee = `${formatFormeCombineeG()}\\ \\text{(étape 1)}`;
  if (phase === "gOrdre1") return [combinee];
  const ordre1 = "\\text{Ordre 1 seul} \\Rightarrow \\text{insuffisant (les termes s'annulent)}\\ \\text{(étape 2)}";
  return [combinee, ordre1];
}

// ============================================================================
// Famille H — L'Hôpital, 0/0 pur exponentiel (4 écrans : forme, numérateur, dénominateur,
// conclure). f(x) = (e^(kx) − 1) / (m·x), x→0.
// ============================================================================

function formatKx(k: number): string {
  if (k === 1) return "x";
  if (k === -1) return "-x";
  return `${k}x`;
}

/** Point de limite affiché tel quel dans `\lim_{x \to ...}` (H/I/J/K) — un entier signé, "0" dans
 * le cas classique. */
function formatPointLimite(x0: number): string {
  return `${x0}`;
}

/** "x" si x0=0 (cas classique, affichage inchangé), sinon "(x-x0)"/"(x+|x0|)" — réutilisé par
 * `formatKFoisDecalage`. */
function formatDecalageX(x0: number): string {
  if (x0 === 0) return "x";
  return x0 > 0 ? `(x-${x0})` : `(x+${-x0})`;
}

/** Généralise `formatKx` à un point de limite quelconque (H/I/J/K) — "kx" si x0=0 (identique à
 * `formatKx`), sinon "k(x-x0)"/"k(x+|x0|)" avec le même traitement des coefficients ±1. */
function formatKFoisDecalage(k: number, x0: number): string {
  if (x0 === 0) return formatKx(k);
  const dec = formatDecalageX(x0);
  if (k === 1) return dec;
  if (k === -1) return `-${dec}`;
  return `${k}${dec}`;
}

function formatPartieExponentielleH(exercice: ExerciceLimiteH): string {
  return `${exercice.base}^{${formatKFoisDecalage(exercice.k, exercice.x0)}} - 1`;
}

function formatFonctionH(exercice: ExerciceLimiteH): string {
  const exp = formatPartieExponentielleH(exercice);
  const poly = formatKFoisDecalage(exercice.m, exercice.x0);
  return exercice.expAuNumerateur ? `\\frac{${exp}}{${poly}}` : `\\frac{${poly}}{${exp}}`;
}

/** Forme canonique de la dérivée de la partie exponentielle, k·ln(base)·base^(k(x-x0)) —
 * réutilisée par `aideH2` ET `etatActuelH` (même principe que les formes canoniques des autres
 * familles) : jamais de coefficient ±1 littéral. */
function formatDeriveePartieExponentielleH(exercice: ExerciceLimiteH): string {
  const { base, k, x0 } = exercice;
  const kx = formatKFoisDecalage(k, x0);
  const coef = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  return `${coef}\\ln(${base})\\cdot ${base}^{${kx}}`;
}

function consigneH(phase: "hForme" | "hNumerateur" | "hDenominateur" | "hConclure", exercice: ExerciceLimiteH): string {
  if (phase === "hForme") return `Quelle est la forme indéterminée de cette limite en x=${formatPointLimite(exercice.x0)} ?`;
  if (phase === "hNumerateur") return "Dérive le numérateur f(x) (avant application de la règle de L'Hôpital).";
  if (phase === "hDenominateur") return "Dérive le dénominateur g(x).";
  return `Applique la règle de L'Hôpital : calcule la limite du rapport des dérivées en x=${formatPointLimite(exercice.x0)}.`;
}

function aideH1(phase: "hForme" | "hNumerateur" | "hDenominateur" | "hConclure", exercice: ExerciceLimiteH): AideAvecLatex {
  if (phase === "hForme") return { texte: `Évalue séparément le numérateur et le dénominateur en x=${formatPointLimite(exercice.x0)}.`, latex: null };
  if (phase === "hConclure") {
    return {
      texte: "Règle de L'Hôpital — si f(x)→0 et g(x)→0, alors (sous conditions) la limite du quotient est celle du quotient des dérivées :",
      latex: "\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}",
    };
  }
  const positionExponentielle = (phase === "hNumerateur") === exercice.expAuNumerateur;
  if (positionExponentielle) return { texte: "Rappel : la dérivée de a^(u(x)) est u'(x)·ln(a)·a^(u(x)).", latex: "\\left(a^{u(x)}\\right)' = u'(x)\\cdot\\ln(a)\\cdot a^{u(x)}" };
  return { texte: "L'autre partie est une fonction affine (du premier degré) — rappelle-toi sa règle de dérivation.", latex: "(ax)' = a" };
}

function aideH2(phase: "hForme" | "hNumerateur" | "hDenominateur" | "hConclure", exercice: ExerciceLimiteH): AideAvecLatex {
  const deriveeExp = formatDeriveePartieExponentielleH(exercice);
  if (phase === "hForme") return { texte: `Numérateur et dénominateur substitués en x=${formatPointLimite(exercice.x0)} :`, latex: `${exercice.base}^{0}-1 = 0,\\quad ${exercice.m}\\cdot 0 = 0` };
  const positionExponentielle = (phase === "hNumerateur") === exercice.expAuNumerateur;
  if (phase === "hNumerateur" || phase === "hDenominateur") {
    return { texte: `Forme attendue (dérivée du ${phase === "hNumerateur" ? "numérateur" : "dénominateur"}) :`, latex: positionExponentielle ? deriveeExp : `${exercice.m}` };
  }
  const num = exercice.expAuNumerateur ? deriveeExp : `${exercice.m}`;
  const den = exercice.expAuNumerateur ? `${exercice.m}` : deriveeExp;
  return { texte: `Dérivées substituées en x=${formatPointLimite(exercice.x0)} (non simplifiées) :`, latex: `\\frac{${num}}{${den}}\\bigg|_{x=${formatPointLimite(exercice.x0)}}` };
}

/** Bloc "état actuel" — ACCUMULE (plus ancien en premier) : `hNumerateur` rappelle la forme 0/0
 * confirmée à l'écran 1 ; `hDenominateur` y ajoute la dérivée du numérateur confirmée à l'écran 2 ;
 * `hConclure` y ajoute la dérivée du dénominateur confirmée à l'écran 3. */
function etatActuelH(exercice: ExerciceLimiteH, phase: "hForme" | "hNumerateur" | "hDenominateur" | "hConclure"): string[] | null {
  if (phase === "hForme") return null;
  const deriveeExp = formatDeriveePartieExponentielleH(exercice);
  const deriveeNumerateur = exercice.expAuNumerateur ? deriveeExp : `${exercice.m}`;
  const deriveeDenominateur = exercice.expAuNumerateur ? `${exercice.m}` : deriveeExp;
  const forme = "\\text{Forme} : \\dfrac{0}{0}\\ \\text{(étape 1)}";
  if (phase === "hNumerateur") return [forme];
  const numerateur = `f'(x) = ${deriveeNumerateur}\\ \\text{(étape 2)}`;
  if (phase === "hDenominateur") return [forme, numerateur];
  const denominateur = `g'(x) = ${deriveeDenominateur}\\ \\text{(étape 3)}`;
  return [forme, numerateur, denominateur];
}

// ============================================================================
// Famille I — L'Hôpital, 0/0 mixte trigonométrique (4 écrans : forme, numérateur, dénominateur,
// conclure). f(x) = sin(kx) / (e^(mx) − 1), x→0.
// ============================================================================

function formatSinI(exercice: ExerciceLimiteI): string {
  return `\\sin(${formatKFoisDecalage(exercice.k, exercice.x0)})`;
}

function formatPartieExponentielleI(exercice: ExerciceLimiteI): string {
  return `${exercice.base}^{${formatKFoisDecalage(exercice.m, exercice.x0)}} - 1`;
}

function formatFonctionI(exercice: ExerciceLimiteI): string {
  const sin = formatSinI(exercice);
  const exp = formatPartieExponentielleI(exercice);
  return exercice.sinAuNumerateur ? `\\frac{${sin}}{${exp}}` : `\\frac{${exp}}{${sin}}`;
}

/** Forme canonique de d/dx[sin(k(x-x0))] = k·cos(k(x-x0)) — jamais de coefficient ±1 littéral. */
function formatDeriveeSinI(exercice: ExerciceLimiteI): string {
  const kx = formatKFoisDecalage(exercice.k, exercice.x0);
  const k = exercice.k;
  if (k === 1) return `\\cos(${kx})`;
  if (k === -1) return `-\\cos(${kx})`;
  return `${k}\\cos(${kx})`;
}

/** Forme canonique de d/dx[a^(m(x-x0))-1] = m·ln(a)·a^(m(x-x0)) — jamais de coefficient ±1
 * littéral. */
function formatDeriveePartieExponentielleI(exercice: ExerciceLimiteI): string {
  const { base, m, x0 } = exercice;
  const mx = formatKFoisDecalage(m, x0);
  const coef = m === 1 ? "" : m === -1 ? "-" : `${m}`;
  return `${coef}\\ln(${base})\\cdot ${base}^{${mx}}`;
}

function consigneI(phase: "iForme" | "iNumerateur" | "iDenominateur" | "iConclure", exercice: ExerciceLimiteI): string {
  if (phase === "iForme") return `Quelle est la forme indéterminée de cette limite en x=${formatPointLimite(exercice.x0)} ?`;
  if (phase === "iNumerateur") return "Dérive le numérateur f(x) (avant application de la règle de L'Hôpital).";
  if (phase === "iDenominateur") return "Dérive le dénominateur g(x).";
  return `Applique la règle de L'Hôpital : calcule la limite du rapport des dérivées en x=${formatPointLimite(exercice.x0)}.`;
}

function aideI1(phase: "iForme" | "iNumerateur" | "iDenominateur" | "iConclure", exercice: ExerciceLimiteI): AideAvecLatex {
  if (phase === "iForme") return { texte: `Évalue séparément le numérateur et le dénominateur en x=${formatPointLimite(exercice.x0)}.`, latex: null };
  if (phase === "iConclure") {
    return {
      texte: "Règle de L'Hôpital — si f(x)→0 et g(x)→0, alors (sous conditions) la limite du quotient est celle du quotient des dérivées :",
      latex: "\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}",
    };
  }
  const positionSin = (phase === "iNumerateur") === exercice.sinAuNumerateur;
  if (positionSin) return { texte: "Rappel : la dérivée de sin(u(x)) est u'(x)·cos(u(x)).", latex: "(\\sin(u(x)))' = u'(x)\\cdot\\cos(u(x))" };
  return { texte: "Rappel : la dérivée de a^(u(x)) est u'(x)·ln(a)·a^(u(x)).", latex: "\\left(a^{u(x)}\\right)' = u'(x)\\cdot\\ln(a)\\cdot a^{u(x)}" };
}

function aideI2(phase: "iForme" | "iNumerateur" | "iDenominateur" | "iConclure", exercice: ExerciceLimiteI): AideAvecLatex {
  if (phase === "iForme") return { texte: `Numérateur et dénominateur substitués en x=${formatPointLimite(exercice.x0)} :`, latex: `\\sin(0) = 0,\\quad ${exercice.base}^{0}-1 = 0` };
  const deriveeSin = formatDeriveeSinI(exercice);
  const deriveeExp = formatDeriveePartieExponentielleI(exercice);
  const deriveeNumerateur = exercice.sinAuNumerateur ? deriveeSin : deriveeExp;
  const deriveeDenominateur = exercice.sinAuNumerateur ? deriveeExp : deriveeSin;
  if (phase === "iNumerateur") return { texte: "Forme attendue (dérivée du numérateur) :", latex: deriveeNumerateur };
  if (phase === "iDenominateur") return { texte: "Forme attendue (dérivée du dénominateur) :", latex: deriveeDenominateur };
  return {
    texte: `Dérivées substituées en x=${formatPointLimite(exercice.x0)} (non simplifiées) :`,
    latex: `\\dfrac{${deriveeNumerateur}}{${deriveeDenominateur}}\\bigg|_{x=${formatPointLimite(exercice.x0)}}`,
  };
}

/** Bloc "état actuel" — ACCUMULE (plus ancien en premier), même principe que `etatActuelH`. */
function etatActuelI(exercice: ExerciceLimiteI, phase: "iForme" | "iNumerateur" | "iDenominateur" | "iConclure"): string[] | null {
  if (phase === "iForme") return null;
  const deriveeSin = formatDeriveeSinI(exercice);
  const deriveeExp = formatDeriveePartieExponentielleI(exercice);
  const deriveeNumerateur = exercice.sinAuNumerateur ? deriveeSin : deriveeExp;
  const deriveeDenominateur = exercice.sinAuNumerateur ? deriveeExp : deriveeSin;
  const forme = "\\text{Forme} : \\dfrac{0}{0}\\ \\text{(étape 1)}";
  if (phase === "iNumerateur") return [forme];
  const numerateur = `f'(x) = ${deriveeNumerateur}\\ \\text{(étape 2)}`;
  if (phase === "iDenominateur") return [forme, numerateur];
  const denominateur = `g'(x) = ${deriveeDenominateur}\\ \\text{(étape 3)}`;
  return [forme, numerateur, denominateur];
}

// ============================================================================
// Famille J — L'Hôpital, 0/0 mixte arcfonction (4 écrans : forme, numérateur, dénominateur,
// conclure). f(x) = arctan(kx) / (e^(mx) − 1), x→0.
// ============================================================================

function formatArcFnJ(exercice: ExerciceLimiteJ): string {
  const nom = exercice.arcFn === "arctan" ? "\\arctan" : "\\arcsin";
  return `${nom}(${formatKFoisDecalage(exercice.k, exercice.x0)})`;
}

function formatPartieExponentielleJ(exercice: ExerciceLimiteJ): string {
  return `${exercice.base}^{${formatKFoisDecalage(exercice.m, exercice.x0)}} - 1`;
}

function formatFonctionJ(exercice: ExerciceLimiteJ): string {
  const arc = formatArcFnJ(exercice);
  const exp = formatPartieExponentielleJ(exercice);
  return exercice.arcAuNumerateur ? `\\frac{${arc}}{${exp}}` : `\\frac{${exp}}{${arc}}`;
}

/** Forme canonique de d/dx[arctan(k(x-x0))] = k/(1+(k(x-x0))²), d/dx[arcsin(k(x-x0))] =
 * k/√(1-(k(x-x0))²). */
function formatDeriveeArcFnJ(exercice: ExerciceLimiteJ): string {
  const kx = formatKFoisDecalage(exercice.k, exercice.x0);
  const radical = exercice.arcFn === "arctan" ? `1+\\left(${kx}\\right)^2` : `\\sqrt{1-\\left(${kx}\\right)^2}`;
  return `\\dfrac{${exercice.k}}{${radical}}`;
}

/** Forme canonique de d/dx[a^(m(x-x0))-1] = m·ln(a)·a^(m(x-x0)) — jamais de coefficient ±1
 * littéral. */
function formatDeriveePartieExponentielleJ(exercice: ExerciceLimiteJ): string {
  const { base, m, x0 } = exercice;
  const mx = formatKFoisDecalage(m, x0);
  const coef = m === 1 ? "" : m === -1 ? "-" : `${m}`;
  return `${coef}\\ln(${base})\\cdot ${base}^{${mx}}`;
}

function consigneJ(phase: "jForme" | "jNumerateur" | "jDenominateur" | "jConclure", exercice: ExerciceLimiteJ): string {
  if (phase === "jForme") return `Quelle est la forme indéterminée de cette limite en x=${formatPointLimite(exercice.x0)} ?`;
  if (phase === "jNumerateur") return "Dérive le numérateur f(x) (avant application de la règle de L'Hôpital).";
  if (phase === "jDenominateur") return "Dérive le dénominateur g(x).";
  return `Applique la règle de L'Hôpital : calcule la limite du rapport des dérivées en x=${formatPointLimite(exercice.x0)}.`;
}

function aideJ1(phase: "jForme" | "jNumerateur" | "jDenominateur" | "jConclure", exercice: ExerciceLimiteJ): AideAvecLatex {
  if (phase === "jForme") return { texte: `Évalue séparément le numérateur et le dénominateur en x=${formatPointLimite(exercice.x0)}.`, latex: null };
  if (phase === "jConclure") {
    return {
      texte: "Règle de L'Hôpital — si f(x)→0 et g(x)→0, alors (sous conditions) la limite du quotient est celle du quotient des dérivées :",
      latex: "\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f'(x)}{g'(x)}",
    };
  }
  const positionArc = (phase === "jNumerateur") === exercice.arcAuNumerateur;
  if (positionArc) {
    if (exercice.arcFn === "arctan") return { texte: "Rappel : la dérivée de arctan(u(x)) est u'(x)/(1+u(x)²).", latex: "(\\arctan(u(x)))' = \\dfrac{u'(x)}{1+u(x)^2}" };
    return { texte: "Rappel : la dérivée de arcsin(u(x)) est u'(x)/√(1-u(x)²).", latex: "(\\arcsin(u(x)))' = \\dfrac{u'(x)}{\\sqrt{1-u(x)^2}}" };
  }
  return { texte: "Rappel : la dérivée de a^(u(x)) est u'(x)·ln(a)·a^(u(x)).", latex: "\\left(a^{u(x)}\\right)' = u'(x)\\cdot\\ln(a)\\cdot a^{u(x)}" };
}

function aideJ2(phase: "jForme" | "jNumerateur" | "jDenominateur" | "jConclure", exercice: ExerciceLimiteJ): AideAvecLatex {
  if (phase === "jForme") {
    const arcNom = exercice.arcFn === "arctan" ? "\\arctan" : "\\arcsin";
    return { texte: `Numérateur et dénominateur substitués en x=${formatPointLimite(exercice.x0)} :`, latex: `${arcNom}(0) = 0,\\quad ${exercice.base}^{0}-1 = 0` };
  }
  const deriveeArc = formatDeriveeArcFnJ(exercice);
  const deriveeExp = formatDeriveePartieExponentielleJ(exercice);
  const deriveeNumerateur = exercice.arcAuNumerateur ? deriveeArc : deriveeExp;
  const deriveeDenominateur = exercice.arcAuNumerateur ? deriveeExp : deriveeArc;
  if (phase === "jNumerateur") return { texte: "Forme attendue (dérivée du numérateur) :", latex: deriveeNumerateur };
  if (phase === "jDenominateur") return { texte: "Forme attendue (dérivée du dénominateur) :", latex: deriveeDenominateur };
  return {
    texte: `Dérivées substituées en x=${formatPointLimite(exercice.x0)} (non simplifiées) :`,
    latex: `\\dfrac{${deriveeNumerateur}}{${deriveeDenominateur}}\\bigg|_{x=${formatPointLimite(exercice.x0)}}`,
  };
}

/** Bloc "état actuel" — ACCUMULE (plus ancien en premier), même principe que `etatActuelH`/`etatActuelI`. */
function etatActuelJ(exercice: ExerciceLimiteJ, phase: "jForme" | "jNumerateur" | "jDenominateur" | "jConclure"): string[] | null {
  if (phase === "jForme") return null;
  const deriveeArc = formatDeriveeArcFnJ(exercice);
  const deriveeExp = formatDeriveePartieExponentielleJ(exercice);
  const deriveeNumerateur = exercice.arcAuNumerateur ? deriveeArc : deriveeExp;
  const deriveeDenominateur = exercice.arcAuNumerateur ? deriveeExp : deriveeArc;
  const forme = "\\text{Forme} : \\dfrac{0}{0}\\ \\text{(étape 1)}";
  if (phase === "jNumerateur") return [forme];
  const numerateur = `f'(x) = ${deriveeNumerateur}\\ \\text{(étape 2)}`;
  if (phase === "jDenominateur") return [forme, numerateur];
  const denominateur = `g'(x) = ${deriveeDenominateur}\\ \\text{(étape 3)}`;
  return [forme, numerateur, denominateur];
}

// ============================================================================
// Famille K — L'Hôpital, DEUX applications (6 écrans : forme, numérateur1, dénominateur1,
// numérateur2, dénominateur2, conclure). f(x) = (e^(kx) − 1 − kx) / (m·x²), x→0.
// ============================================================================

/** N(x) = a^(k(x-x0)) − 1 − k(x-x0)·ln(a). */
function formatPartieExponentielleK(exercice: ExerciceLimiteK): string {
  const { base, k, x0 } = exercice;
  const kx = formatKFoisDecalage(k, x0);
  const decalageSuffixe = x0 === 0 ? `x\\ln(${base})` : `${formatDecalageX(x0)}\\ln(${base})`;
  const reste = fusionnerOperateurSigne("+", formatSommeTermes([{ valeur: -1, suffixe: "" }, { valeur: -k, suffixe: decalageSuffixe }]));
  return `${base}^{${kx}} ${reste}`;
}

function formatFonctionK(exercice: ExerciceLimiteK): string {
  const exp = formatPartieExponentielleK(exercice);
  const decalageCarre = exercice.x0 === 0 ? "x^2" : `${formatDecalageX(exercice.x0)}^2`;
  const poly = `${exercice.m}${decalageCarre}`;
  return exercice.expAuNumerateur ? `\\frac{${exp}}{${poly}}` : `\\frac{${poly}}{${exp}}`;
}

/** N'(x) = k·ln(a)·(a^(k(x-x0))-1) — jamais de coefficient ±1 littéral. */
function formatDerivee1ExpK(exercice: ExerciceLimiteK): string {
  const { base, k, x0 } = exercice;
  const corps = `\\left(${base}^{${formatKFoisDecalage(k, x0)}}-1\\right)`;
  const coef = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  return `${coef}\\ln(${base})\\cdot ${corps}`;
}

/** D'(x) = 2m(x-x0) — 2m est toujours pair (m≠0 entier), jamais ±1, `formatKFoisDecalage` reste
 * valable tel quel. */
function formatDerivee1PolyK(exercice: ExerciceLimiteK): string {
  return formatKFoisDecalage(2 * exercice.m, exercice.x0);
}

/** N''(x) = k²·ln(a)²·a^(k(x-x0)) — k² toujours ≥1, jamais de coefficient littéral si k²=1. */
function formatDerivee2ExpK(exercice: ExerciceLimiteK): string {
  const { base, k, x0 } = exercice;
  const kx = formatKFoisDecalage(k, x0);
  const k2 = k * k;
  const coef = k2 === 1 ? "" : `${k2}`;
  return `${coef}\\ln(${base})^2\\cdot ${base}^{${kx}}`;
}

function consigneK(phase: "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure", exercice: ExerciceLimiteK): string {
  if (phase === "kForme") return `Quelle est la forme indéterminée de cette limite en x=${formatPointLimite(exercice.x0)} ?`;
  if (phase === "kNumerateur1") return "Dérive une première fois le numérateur f(x).";
  if (phase === "kDenominateur1") return "Dérive une première fois le dénominateur g(x).";
  if (phase === "kNumerateur2") return `Le rapport des dérivées précédentes est ENCORE une forme indéterminée 0/0 en x=${formatPointLimite(exercice.x0)} — dérive le numérateur UNE SECONDE FOIS.`;
  if (phase === "kDenominateur2") return "Dérive le dénominateur une seconde fois.";
  return `Applique la règle de L'Hôpital (2 applications) : calcule la limite du rapport des dérivées secondes en x=${formatPointLimite(exercice.x0)}.`;
}

function aideK1(phase: "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure", exercice: ExerciceLimiteK): AideAvecLatex {
  if (phase === "kForme") return { texte: `Évalue séparément le numérateur et le dénominateur en x=${formatPointLimite(exercice.x0)}.`, latex: null };
  if (phase === "kConclure") {
    return {
      texte: "Règle de L'Hôpital, appliquée une SECONDE fois — la limite du quotient des dérivées secondes :",
      latex: "\\lim \\frac{f(x)}{g(x)} = \\lim \\frac{f''(x)}{g''(x)}",
    };
  }
  const positionExponentielle = (phase === "kNumerateur1" || phase === "kNumerateur2") === exercice.expAuNumerateur;
  if (phase === "kNumerateur1" || phase === "kDenominateur1") {
    if (positionExponentielle) return { texte: "Rappel : la dérivée de a^(u(x)) est u'(x)·ln(a)·a^(u(x)) ; la dérivée de u(x)·ln(a) est u'(x)·ln(a).", latex: null };
    return { texte: "Rappel : la dérivée de m(x-x0)² est 2m(x-x0).", latex: "(m(x-x_0)^2)' = 2m(x-x_0)" };
  }
  if (positionExponentielle) return { texte: `Vérifie : cette partie de l'écran précédent s'annule-t-elle bien en x=${formatPointLimite(exercice.x0)} ? Si oui, redérive-la (même règle a^(u(x)) que précédemment).`, latex: null };
  return { texte: "Rappel : la dérivée de 2m(x-x0) est la constante 2m.", latex: "(2m(x-x_0))' = 2m" };
}

function aideK2(phase: "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure", exercice: ExerciceLimiteK): AideAvecLatex {
  if (phase === "kForme") return { texte: `Numérateur et dénominateur substitués en x=${formatPointLimite(exercice.x0)} :`, latex: `${exercice.base}^{0}-1-0 = 0,\\quad ${exercice.m}\\cdot 0^2 = 0` };
  const derivee1Exp = formatDerivee1ExpK(exercice);
  const derivee1Poly = formatDerivee1PolyK(exercice);
  const derivee1Numerateur = exercice.expAuNumerateur ? derivee1Exp : derivee1Poly;
  const derivee1Denominateur = exercice.expAuNumerateur ? derivee1Poly : derivee1Exp;
  if (phase === "kNumerateur1") return { texte: "Forme attendue (dérivée première du numérateur) :", latex: derivee1Numerateur };
  if (phase === "kDenominateur1") return { texte: "Forme attendue (dérivée première du dénominateur) :", latex: derivee1Denominateur };
  const derivee2Exp = formatDerivee2ExpK(exercice);
  const derivee2PolyConstant = `${2 * exercice.m}`;
  const derivee2Numerateur = exercice.expAuNumerateur ? derivee2Exp : derivee2PolyConstant;
  const derivee2Denominateur = exercice.expAuNumerateur ? derivee2PolyConstant : derivee2Exp;
  if (phase === "kNumerateur2") return { texte: "Forme attendue (dérivée seconde du numérateur) :", latex: derivee2Numerateur };
  if (phase === "kDenominateur2") return { texte: "Forme attendue (dérivée seconde du dénominateur) :", latex: derivee2Denominateur };
  return {
    texte: `Dérivées secondes substituées en x=${formatPointLimite(exercice.x0)} (non simplifiées) :`,
    latex: `\\dfrac{${derivee2Numerateur}}{${derivee2Denominateur}}\\bigg|_{x=${formatPointLimite(exercice.x0)}}`,
  };
}

/** Bloc "état actuel" — ACCUMULE (plus ancien en premier) les 5 écrans précédents, même principe
 * que les autres familles L'Hôpital. */
function etatActuelK(exercice: ExerciceLimiteK, phase: "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure"): string[] | null {
  if (phase === "kForme") return null;
  const derivee1Exp = formatDerivee1ExpK(exercice);
  const derivee1Poly = formatDerivee1PolyK(exercice);
  const derivee1Numerateur = exercice.expAuNumerateur ? derivee1Exp : derivee1Poly;
  const derivee1Denominateur = exercice.expAuNumerateur ? derivee1Poly : derivee1Exp;
  const derivee2Exp = formatDerivee2ExpK(exercice);
  const derivee2PolyConstant = `${2 * exercice.m}`;
  const derivee2Numerateur = exercice.expAuNumerateur ? derivee2Exp : derivee2PolyConstant;
  const derivee2Denominateur = exercice.expAuNumerateur ? derivee2PolyConstant : derivee2Exp;
  const forme = "\\text{Forme} : \\dfrac{0}{0}\\ \\text{(étape 1)}";
  if (phase === "kNumerateur1") return [forme];
  const n1 = `f'(x) = ${derivee1Numerateur}\\ \\text{(étape 2)}`;
  if (phase === "kDenominateur1") return [forme, n1];
  const d1 = `g'(x) = ${derivee1Denominateur}\\ \\text{(étape 3)}`;
  if (phase === "kNumerateur2") return [forme, n1, d1];
  const n2 = `f''(x) = ${derivee2Numerateur}\\ \\text{(étape 4)}`;
  if (phase === "kDenominateur2") return [forme, n1, d1, n2];
  const d2 = `g''(x) = ${derivee2Denominateur}\\ \\text{(étape 5)}`;
  return [forme, n1, d1, n2, d2];
}

// ============================================================================
// Famille L — FI 1^∞ via pivot e (2 écrans : reformuler, conclure), dispatch par sous-type.
// ============================================================================

function formatBaseL1(k: number): string {
  return k >= 0 ? `1+\\dfrac{${k}}{x}` : `1-\\dfrac{${Math.abs(k)}}{x}`;
}

function formatBaseL2(k: number): string {
  if (k === 1) return "1+x";
  if (k === -1) return "1-x";
  return k >= 0 ? `1+${k}x` : `1-${Math.abs(k)}x`;
}

function formatFonctionL(exercice: ExerciceLimiteL): string {
  const { k, m } = exercice;
  if (exercice.sousType === "L1") return `\\left(${formatBaseL1(k)}\\right)^{${formatKx(m)}}`;
  return `\\left(${formatBaseL2(k)}\\right)^{\\frac{${m}}{x}}`;
}

function formatDirectionL(exercice: ExerciceLimiteL): string {
  return exercice.sousType === "L1" ? "x \\to +\\infty" : "x \\to 0";
}

function consigneL(phase: "lReformuler" | "lConclure", exercice: ExerciceLimiteL): string {
  if (phase === "lConclure") return "Applique le résultat du pivot (1+1/u)^u → e, puis conclus la valeur exacte de la limite.";
  if (exercice.sousType === "L1") {
    const kDiv = exercice.k >= 0 ? `${exercice.k}` : `(${exercice.k})`;
    return `Pose u = x/${kDiv} et réexprime f entièrement en fonction de u.`;
  }
  return `Pose t = ${exercice.k}x et réexprime f entièrement en fonction de t.`;
}

function aideL1(phase: "lReformuler" | "lConclure", exercice: ExerciceLimiteL): AideAvecLatex {
  if (phase === "lReformuler") {
    const variable = exercice.sousType === "L1" ? "u" : "t";
    return { texte: `Remplace x par son expression en fonction de ${variable}, puis simplifie l'exposant en isolant la puissance ${variable}.`, latex: null };
  }
  return { texte: "Résultat du pivot (vrai quelle que soit la direction, +∞ ou −∞ ou 0) :", latex: "\\left(1+\\dfrac{1}{u}\\right)^{u} \\to e" };
}

/** Forme canonique attendue après reformulation COMPLÈTE — réutilisée par `aideL2` ET `etatActuelL`,
 * même principe que les formes canoniques des autres familles. */
function formatFormeReformuleeL(exercice: ExerciceLimiteL): string {
  const km = exercice.k * exercice.m;
  if (exercice.sousType === "L1") return `\\left[\\left(1+\\dfrac{1}{u}\\right)^{u}\\right]^{${km}}`;
  return `\\left[\\left(1+t\\right)^{1/t}\\right]^{${km}}`;
}

function aideL2(phase: "lReformuler" | "lConclure", exercice: ExerciceLimiteL): AideAvecLatex {
  if (phase === "lReformuler") return { texte: "Forme attendue après reformulation :", latex: formatFormeReformuleeL(exercice) };
  return { texte: "La puissance du pivot substituée par continuité :", latex: `e^{${exercice.k * exercice.m}}` };
}

/** Bloc "état actuel" (`lConclure` seulement) — la forme reformulée canonique confirmée à l'écran
 * "reformuler" précédent, même principe que les anciennes familles E/F. */
function etatActuelL(exercice: ExerciceLimiteL, phase: "lReformuler" | "lConclure"): string[] | null {
  if (phase === "lReformuler") return null;
  return [`${formatFormeReformuleeL(exercice)}\\ \\text{(étape 1)}`];
}

// ============================================================================
// Famille N — FI ∞^0/0^0 via loi des puissances (2 écrans : combiner, conclure).
// f(x) = (base^(k/x))^(mx+x²), x→0, base quelconque.
// ============================================================================

function formatFonctionN(exercice: ExerciceLimiteN): string {
  const { base, k, m } = exercice;
  const exposantExterne = formatSommeTermes([{ valeur: m, suffixe: "x" }, { valeur: 1, suffixe: "x^2" }]);
  return `\\left(${base}^{\\frac{${k}}{x}}\\right)^{${exposantExterne}}`;
}

/** Forme canonique attendue après combinaison (loi des puissances) — réutilisée par `aideN2` ET
 * `etatActuelN`, même principe que les formes canoniques des autres familles. */
function formatFormeCombineeN(exercice: ExerciceLimiteN): string {
  const { base, k, m } = exercice;
  const reste = fusionnerOperateurSigne("+", formatSommeTermes([{ valeur: k, suffixe: "x" }]));
  return `${base}^{${k * m} ${reste}}`;
}

function consigneN(phase: "nCombiner" | "nConclure"): string {
  if (phase === "nCombiner") return "Réécris f(x) en une seule puissance, à l'aide de la loi des puissances (aᵖ)^q = a^(pq).";
  return "Utilise la continuité de l'exponentielle pour conclure la valeur exacte de la limite.";
}

function aideN1(phase: "nCombiner" | "nConclure"): AideAvecLatex {
  if (phase === "nCombiner") return { texte: "Rappel de la loi des puissances :", latex: "(a^p)^q = a^{pq}" };
  return { texte: "Simplifie l'exposant combiné en x=0 (le terme en x s'annule) — ce n'est plus une forme indéterminée.", latex: null };
}

function aideN2(phase: "nCombiner" | "nConclure", exercice: ExerciceLimiteN): AideAvecLatex {
  if (phase === "nCombiner") return { texte: "Forme attendue après combinaison :", latex: formatFormeCombineeN(exercice) };
  return { texte: "Exposant substitué en x=0 (non simplifié) :", latex: `${exercice.base}^{${exercice.k * exercice.m} + ${exercice.k}\\cdot 0}` };
}

/** Bloc "état actuel" (`nConclure` seulement) — la forme combinée canonique confirmée à l'écran
 * "combiner" précédent, même principe que les anciennes familles E/F. */
function etatActuelN(exercice: ExerciceLimiteN, phase: "nCombiner" | "nConclure"): string[] | null {
  if (phase === "nCombiner") return null;
  return [`${formatFormeCombineeN(exercice)}\\ \\text{(étape 1)}`];
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : "consigne générale et bloc de
 * données... redondants sur chaque écran") — un unique bloc `\lim` combinant f(x) et la direction. */
export function formatLimiteEnonceLatex(exercice: ExerciceLimiteExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return `\\lim_{${formatDirectionA(exercice)}} \\left(${formatFonctionA(exercice)}\\right)`;
    case "B":
      return `\\lim_{${formatDirectionB(exercice)}} \\left(${formatFonctionB(exercice)}\\right)`;
    case "C":
      return `\\lim_{x \\to +\\infty} \\left(${formatFonctionC(exercice)}\\right)`;
    case "G":
      return `\\lim_{x \\to \\frac{\\pi}{2}} \\left(${formatFonctionG()}\\right)`;
    case "H":
      return `\\lim_{x \\to ${formatPointLimite(exercice.x0)}} ${formatFonctionH(exercice)}`;
    case "I":
      return `\\lim_{x \\to ${formatPointLimite(exercice.x0)}} ${formatFonctionI(exercice)}`;
    case "J":
      return `\\lim_{x \\to ${formatPointLimite(exercice.x0)}} ${formatFonctionJ(exercice)}`;
    case "K":
      return `\\lim_{x \\to ${formatPointLimite(exercice.x0)}} ${formatFonctionK(exercice)}`;
    case "L":
      return `\\lim_{${formatDirectionL(exercice)}} ${formatFonctionL(exercice)}`;
    case "N":
      return `\\lim_{x \\to 0} ${formatFonctionN(exercice)}`;
  }
}

export function consigneEcran(phase: PhaseLimiteExponentielle, exercice: ExerciceLimiteExponentielle): string {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aExposant" | "aGlobale");
    case "B":
      return consigneB(phase as "bExponentielle" | "bPolynomiale" | "bGlobale");
    case "C":
      return consigneC(phase as "cFacteurs" | "cGlobale");
    case "G":
      return consigneG(phase as "gCombiner" | "gOrdre1" | "gConclure");
    case "H":
      return consigneH(phase as "hForme" | "hNumerateur" | "hDenominateur" | "hConclure", exercice);
    case "I":
      return consigneI(phase as "iForme" | "iNumerateur" | "iDenominateur" | "iConclure", exercice);
    case "J":
      return consigneJ(phase as "jForme" | "jNumerateur" | "jDenominateur" | "jConclure", exercice);
    case "K":
      return consigneK(phase as "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure", exercice);
    case "L":
      return consigneL(phase as "lReformuler" | "lConclure", exercice);
    case "N":
      return consigneN(phase as "nCombiner" | "nConclure");
  }
}

/** Bloc "état actuel" — `null` sur le premier écran de chaque famille (rien à rappeler encore), un
 * tableau de fragments LaTeX ACCUMULÉS depuis le premier écran de la famille sinon (convention
 * CLAUDE.md : structure d'écran consigne générale → bloc données → bloc "état actuel" → bloc de
 * travail). Corrige l'audit "état actuel cumulatif" qui avait raté ce générateur : aucun des 4
 * composants d'écran (`EtapeChampLimiteExpo`/`EtapeFacteursC`/`EtapeOrdre1G`/`EtapeReponseLimite`)
 * ne référençait `etatActuel` avant ce correctif. */
export function etatActuel(exercice: ExerciceLimiteExponentielle, phase: PhaseLimiteExponentielle): string[] | null {
  switch (exercice.famille) {
    case "A":
      return etatActuelA(exercice, phase as "aExposant" | "aGlobale");
    case "B":
      return etatActuelB(exercice, phase as "bExponentielle" | "bPolynomiale" | "bGlobale");
    case "C":
      return etatActuelC(exercice, phase as "cFacteurs" | "cGlobale");
    case "G":
      return etatActuelG(phase as "gCombiner" | "gOrdre1" | "gConclure");
    case "H":
      return etatActuelH(exercice, phase as "hForme" | "hNumerateur" | "hDenominateur" | "hConclure");
    case "I":
      return etatActuelI(exercice, phase as "iForme" | "iNumerateur" | "iDenominateur" | "iConclure");
    case "J":
      return etatActuelJ(exercice, phase as "jForme" | "jNumerateur" | "jDenominateur" | "jConclure");
    case "K":
      return etatActuelK(exercice, phase as "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure");
    case "L":
      return etatActuelL(exercice, phase as "lReformuler" | "lConclure");
    case "N":
      return etatActuelN(exercice, phase as "nCombiner" | "nConclure");
  }
}

export function aideNiveau1(phase: PhaseLimiteExponentielle, exercice: ExerciceLimiteExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA1(phase as "aExposant" | "aGlobale");
    case "B":
      return aideB1(phase as "bExponentielle" | "bPolynomiale" | "bGlobale", exercice);
    case "C":
      return aideC1(phase as "cFacteurs" | "cGlobale");
    case "G":
      return aideG1(phase as "gCombiner" | "gOrdre1" | "gConclure");
    case "H":
      return aideH1(phase as "hForme" | "hNumerateur" | "hDenominateur" | "hConclure", exercice);
    case "I":
      return aideI1(phase as "iForme" | "iNumerateur" | "iDenominateur" | "iConclure", exercice);
    case "J":
      return aideJ1(phase as "jForme" | "jNumerateur" | "jDenominateur" | "jConclure", exercice);
    case "K":
      return aideK1(phase as "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure", exercice);
    case "L":
      return aideL1(phase as "lReformuler" | "lConclure", exercice);
    case "N":
      return aideN1(phase as "nCombiner" | "nConclure");
  }
}

export function aideNiveau2(phase: PhaseLimiteExponentielle, exercice: ExerciceLimiteExponentielle): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return aideA2(phase as "aExposant" | "aGlobale", exercice);
    case "B":
      return aideB2(phase as "bExponentielle" | "bPolynomiale" | "bGlobale", exercice);
    case "C":
      return aideC2(phase as "cFacteurs" | "cGlobale", exercice);
    case "G":
      return aideG2(phase as "gCombiner" | "gOrdre1" | "gConclure");
    case "H":
      return aideH2(phase as "hForme" | "hNumerateur" | "hDenominateur" | "hConclure", exercice);
    case "I":
      return aideI2(phase as "iForme" | "iNumerateur" | "iDenominateur" | "iConclure", exercice);
    case "J":
      return aideJ2(phase as "jForme" | "jNumerateur" | "jDenominateur" | "jConclure", exercice);
    case "K":
      return aideK2(phase as "kForme" | "kNumerateur1" | "kDenominateur1" | "kNumerateur2" | "kDenominateur2" | "kConclure", exercice);
    case "L":
      return aideL2(phase as "lReformuler" | "lConclure", exercice);
    case "N":
      return aideN2(phase as "nCombiner" | "nConclure", exercice);
  }
}

export interface TotalPointsRecap {
  points: number;
  maximum: number;
}

/**
 * Total de points du récapitulatif final — SOMME des scores déjà pénalisés (tentatives + aide) sur
 * chaque écran RÉELLEMENT traversé (2 ou 3 selon la famille), affiché EN COMPLÉMENT de la liste
 * colorée `LigneRecap`/`statutRecap` (jamais à sa place, voir CLAUDE.md "récapitulatif final à plat,
 * coloré"). Utilise la formule RÉELLE déjà calculée par `avancerPhase`
 * (`moteur6e/sessionLimitesExponentielles.ts`, 100 de base − pénalité/tentative − 20 pts/niveau
 * d'aide, clampée à 0, forcée à 0 exactement sur révélation) — jamais une formule à 3 paliers
 * simplifiée : un écran correct au 2e essai sans aide peut donc valoir 67/100 (VERT au
 * récapitulatif) plutôt que 100/100, intentionnel (voir décision utilisateur). Ne consulte JAMAIS
 * `details`/`revele`/`niveauAide` : ce sont deux informations INDÉPENDANTES du même écran (couleur
 * vs points), piège documenté dans `typesLimitesExponentielles.ts` (`DetailPhaseLimiteExponentielle`)
 * — un écran affiché ORANGE (aidé, jamais révélé) peut valoir exactement 0 point, tout comme un
 * écran ROUGE (révélé) ; la somme reste correcte dans les deux cas sans distinction de cas.
 */
export function totalPointsLimiteExponentielle(resultat: ResultatExerciceLimiteExponentielle): TotalPointsRecap {
  switch (resultat.famille) {
    case "A":
      return { points: resultat.scoreExposant + resultat.scoreGlobale, maximum: 200 };
    case "B":
      return { points: resultat.scoreExponentielle + resultat.scorePolynomiale + resultat.scoreGlobale, maximum: 300 };
    case "C":
      return { points: resultat.scoreFacteurs + resultat.scoreGlobale, maximum: 200 };
    case "G":
      return { points: resultat.scoreCombiner + resultat.scoreOrdre1 + resultat.scoreConclure, maximum: 300 };
    case "H":
      return { points: resultat.scoreForme + resultat.scoreNumerateur + resultat.scoreDenominateur + resultat.scoreConclure, maximum: 400 };
    case "I":
      return { points: resultat.scoreForme + resultat.scoreNumerateur + resultat.scoreDenominateur + resultat.scoreConclure, maximum: 400 };
    case "J":
      return { points: resultat.scoreForme + resultat.scoreNumerateur + resultat.scoreDenominateur + resultat.scoreConclure, maximum: 400 };
    case "K":
      return {
        points: resultat.scoreForme + resultat.scoreNumerateur1 + resultat.scoreDenominateur1 + resultat.scoreNumerateur2 + resultat.scoreDenominateur2 + resultat.scoreConclure,
        maximum: 600,
      };
    case "L":
      return { points: resultat.scoreReformuler + resultat.scoreConclure, maximum: 200 };
    case "N":
      return { points: resultat.scoreCombiner + resultat.scoreConclure, maximum: 200 };
  }
}
