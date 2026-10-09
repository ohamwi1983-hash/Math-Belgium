import type { ExerciceLimiteLogA, ExerciceLimiteLogB, ExerciceLimiteLogC, ExerciceLimiteLogD, ExerciceLimiteLogarithmique } from "../core6e/limitesLogarithmiques.types";
import type { PhaseLimiteLogarithmique, ResultatExerciceLimiteLogarithmique } from "../moteur6e/typesLimitesLogarithmiques";

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

interface TermeSigne {
  valeur: number;
  suffixe: string;
  /** Insère `\cdot` entre le coefficient et le suffixe (coefficient≠±1) — nécessaire pour un
   * terme du type `c·base^x` (ambigu sans séparateur), jamais pour `a·x^d` (déjà lisible collé,
   * convention KaTeX standard partout ailleurs sur la plateforme). */
  cdot?: boolean;
}

function formatSommeTermes(termes: TermeSigne[]): string {
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

/** Jamais d'exposant `^{1}` littéral. */
function formatPuissance(base: string, exposant: number): string {
  return exposant === 1 ? base : `${base}^{${exposant}}`;
}

const LABELS_CIBLE: Record<string, string> = { plus_infini: "+\\infty", moins_infini: "-\\infty", zero: "0" };

/** Exporté pour le récapitulatif final — contenu de chaque `LigneRecap` = la cible RÉELLEMENT
 * attendue de l'écran, jamais un score. */
export function formatCibleTexte(cible: { type: string; valeur?: number }): string {
  if (cible.type === "valeur") return String(cible.valeur);
  return LABELS_CIBLE[cible.type];
}

const LABELS_CATEGORIE: Record<string, string> = { log: "Logarithme", polynome: "Polynôme", exponentielle: "Exponentielle" };

export function formatCategorieLabel(categorie: string): string {
  return LABELS_CATEGORIE[categorie];
}

// ============================================================================
// Famille A
// ============================================================================

function formatFonctionA(exercice: ExerciceLimiteLogA): string {
  switch (exercice.sousType) {
    case "sous1": {
      const numerateur = formatSommeTermes([{ valeur: exercice.k, suffixe: "\\ln(x)" }]);
      const denominateur = formatSommeTermes([{ valeur: exercice.a, suffixe: formatPuissance("x", exercice.d) }, { valeur: exercice.b, suffixe: "" }]);
      return `\\frac{${numerateur}}{${denominateur}}`;
    }
    case "sous2": {
      const denominateur = formatSommeTermes([{ valeur: exercice.q, suffixe: formatPuissance("x", exercice.d) }]);
      return `\\frac{${exercice.base}^x}{${denominateur}}`;
    }
    case "sous3": {
      const numerateur = formatSommeTermes([{ valeur: exercice.p1, suffixe: `${formatPuissance("x", exercice.d1)}\\ln(x)` }]);
      const denominateur = formatSommeTermes([{ valeur: exercice.p2, suffixe: `${formatPuissance("x", exercice.d2)}\\log_{${exercice.base}}(x)` }]);
      return `\\frac{${numerateur}}{${denominateur}}`;
    }
    case "sous4": {
      const poly = formatSommeTermes([{ valeur: exercice.a, suffixe: formatPuissance("x", exercice.d) }, { valeur: exercice.c, suffixe: "" }]);
      return `\\frac{${poly} + \\log_{${exercice.base1}}(x)}{${poly} + \\log_{${exercice.base2}}(x)}`;
    }
    case "sous5": {
      const numerateur = formatSommeTermes([
        { valeur: exercice.a1, suffixe: formatPuissance("x", exercice.d1) },
        { valeur: exercice.c1, suffixe: `${exercice.base1}^x`, cdot: true },
      ]);
      const denominateur = formatSommeTermes([
        { valeur: exercice.a2, suffixe: formatPuissance("x", exercice.d2) },
        { valeur: exercice.c2, suffixe: `${exercice.base2}^x`, cdot: true },
      ]);
      return `\\frac{${numerateur}}{${denominateur}}`;
    }
  }
}

function formatDirectionA(exercice: ExerciceLimiteLogA): string {
  if (exercice.sousType === "sous2") return exercice.direction === "plus_infini" ? "x \\to +\\infty" : "x \\to -\\infty";
  return "x \\to +\\infty";
}

const CONSIGNE_A_DOMINANCE = "Identifie le terme dominant au numérateur et au dénominateur séparément (hiérarchie log ≪ polynôme ≪ exponentielle(base>1)).";
const CONSIGNE_A_CONCLURE = "À partir de la dominance CORRECTE de l'étape précédente, conclus la limite globale.";

function consigneA(phase: "aDominance" | "aConclure"): string {
  return phase === "aDominance" ? CONSIGNE_A_DOMINANCE : CONSIGNE_A_CONCLURE;
}

const RAPPEL_HIERARCHIE_LATEX = "\\ln(x) \\ll x^n \\ll \\text{base}^x \\ (\\text{base}>1)";

function aideA1(phase: "aDominance" | "aConclure"): AideAvecLatex {
  if (phase === "aDominance") {
    return {
      texte: "Rappel de la hiérarchie de croissance à l'infini (une exponentielle de base<1 est, elle, négligeable — elle tend vers 0) :",
      latex: RAPPEL_HIERARCHIE_LATEX,
    };
  }
  return { texte: "Compare la catégorie dominante du numérateur à celle du dénominateur (déjà confirmées à l'étape précédente) pour conclure.", latex: null };
}

function aideA2(phase: "aDominance" | "aConclure", exercice: ExerciceLimiteLogA): AideAvecLatex {
  if (phase === "aDominance") {
    return { texte: "Catégorie de CHAQUE terme de l'expression (comparaison finale non faite) :", latex: `\\text{num.} \\to ${formatCategorieLabel(exercice.dominanceNumerateur)},\\quad \\text{dénom.} \\to ${formatCategorieLabel(exercice.dominanceDenominateur)}` };
  }
  return { texte: "Dominance confirmée des deux côtés :", latex: `\\text{num.} \\to ${formatCategorieLabel(exercice.dominanceNumerateur)},\\quad \\text{dénom.} \\to ${formatCategorieLabel(exercice.dominanceDenominateur)}` };
}

// ============================================================================
// Famille B
// ============================================================================

function formatFonctionB(exercice: ExerciceLimiteLogB): string {
  if (exercice.sousType === "quotient") return `\\log_{\\left(\\frac{x}{${exercice.x0}}\\right)^{${exercice.k}}}\\left(${formatSommeTermes([{ valeur: exercice.m, suffixe: "x" }, { valeur: exercice.n, suffixe: "" }])}\\right)`;
  return `(x-${exercice.x0})\\cdot\\log_{\\frac{x}{${exercice.x0}}}(${exercice.k})`;
}

const CONSIGNE_B_REFORMULER_QUOTIENT = "Pose u=x/x0−1 et réécris l'expression en termes de ln(1+u)/u.";
const CONSIGNE_B_REFORMULER_PRODUIT = "Pose u=x/x0−1 et réécris l'expression en termes de u/ln(1+u).";
const CONSIGNE_B_CONCLURE = "Applique la limite de référence à la forme CORRECTE de l'étape précédente, puis conclus.";

function consigneB(phase: "bReformuler" | "bConclure", exercice: ExerciceLimiteLogB): string {
  if (phase === "bConclure") return CONSIGNE_B_CONCLURE;
  return exercice.sousType === "quotient" ? CONSIGNE_B_REFORMULER_QUOTIENT : CONSIGNE_B_REFORMULER_PRODUIT;
}

const FORMULE_REFERENCE_LATEX = "\\lim_{u \\to 0} \\frac{\\ln(1+u)}{u} = 1";
const TEXTE_REFERENCE = "Limite de référence (nouvelle dans ce chapitre, analogue logarithmique de sin(x)/x→1) :";

function aideB1(phase: "bReformuler" | "bConclure"): AideAvecLatex {
  if (phase === "bConclure") return { texte: TEXTE_REFERENCE, latex: FORMULE_REFERENCE_LATEX };
  return { texte: "Un logarithme dont la BASE et l'ARGUMENT tendent tous deux vers 1 en même temps est une forme 0/0 déguisée — la substitution u=x/x0−1 la révèle.", latex: null };
}

function aideB2(phase: "bReformuler" | "bConclure", exercice: ExerciceLimiteLogB): AideAvecLatex {
  if (phase === "bConclure") return { texte: TEXTE_REFERENCE, latex: FORMULE_REFERENCE_LATEX };
  if (exercice.sousType === "quotient") {
    return { texte: "Substitution amorcée (base et argument réécrits en u, non terminée) :", latex: `\\log_{(1+u)^{${exercice.k}}}\\left(1+${exercice.m * exercice.x0}u\\right)` };
  }
  return { texte: "Substitution amorcée (non terminée) :", latex: `${exercice.x0}\\cdot u \\cdot \\log_{1+u}(${exercice.k})` };
}

// ============================================================================
// Famille C
// ============================================================================

function formatFonctionC(exercice: ExerciceLimiteLogC): string {
  if (exercice.sousType === "c1") return `\\log_x(x+${exercice.c})`;
  if (exercice.sousType === "c2") return `x\\cdot ${exercice.base}^{\\frac{${exercice.coefC}}{x}}`;
  const denominateur = exercice.coefC === 1 ? "x^2" : `${exercice.coefC}x^2`;
  return `\\frac{${exercice.base}^x - ${exercice.base} + \\sin(x)}{\\ln(1+${denominateur})}`;
}

function formatDirectionC(exercice: ExerciceLimiteLogC): string {
  if (exercice.sousType === "c1") return exercice.direction === "droite" ? "x \\to 1^+" : "x \\to 1^-";
  if (exercice.sousType === "c2") return exercice.direction === "plus_infini" ? "x \\to +\\infty" : "x \\to -\\infty";
  return "x \\to 0";
}

const CONSIGNE_C_DIAGNOSTIC = "Évalue séparément le numérateur et le dénominateur (ou chaque facteur) AVANT toute technique de forme indéterminée.";
const CONSIGNE_C_CONCLURE = "À partir du diagnostic CORRECT de l'étape précédente, conclus la limite (détermine le signe si besoin).";

function consigneC(phase: "cDiagnostic" | "cConclure"): string {
  return phase === "cDiagnostic" ? CONSIGNE_C_DIAGNOSTIC : CONSIGNE_C_CONCLURE;
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
  optionsCategorielles: ("plus_infini" | "moins_infini" | "zero")[];
  autoriserValeurLibre: boolean;
  placeholderValeur: string;
}

export function configDiagnosticPartiesC(exercice: ExerciceLimiteLogC): { partie1: ConfigPartieDiagnostic; partie2: ConfigPartieDiagnostic } {
  if (exercice.sousType === "c2") {
    return {
      partie1: { label: "Facteur x →", optionsCategorielles: ["plus_infini", "moins_infini"], autoriserValeurLibre: false, placeholderValeur: "" },
      partie2: { label: `Facteur ${exercice.base}^(c/x) →`, optionsCategorielles: [], autoriserValeurLibre: true, placeholderValeur: "ex : 1" },
    };
  }
  return {
    partie1: { label: "Numérateur (valeur finie)", optionsCategorielles: [], autoriserValeurLibre: true, placeholderValeur: "ex : ln(3)" },
    partie2: { label: "Dénominateur →", optionsCategorielles: ["plus_infini", "moins_infini", "zero"], autoriserValeurLibre: false, placeholderValeur: "" },
  };
}

function aideC2(phase: "cDiagnostic" | "cConclure", exercice: ExerciceLimiteLogC): AideAvecLatex {
  const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
  if (phase === "cDiagnostic") return { texte: "Valeur/statut de chaque partie :", latex: `\\text{partie 1} \\to ${formatCibleTexte(cible1)},\\quad \\text{partie 2} \\to ${formatCibleTexte(cible2)}` };
  return { texte: "Diagnostic confirmé :", latex: `\\text{partie 1} \\to ${formatCibleTexte(cible1)},\\quad \\text{partie 2} \\to ${formatCibleTexte(cible2)}` };
}

// ============================================================================
// Famille D
// ============================================================================

function formatFonctionD(exercice: ExerciceLimiteLogD): string {
  return `\\left(\\cos(${exercice.k}x)\\right)^{\\frac{${exercice.c}}{x^2}}`;
}

const CONSIGNE_D_EXPOSANT = "Réécris f^g sous la forme e^(g·ln f), et isole la limite de l'exposant g(x)·ln(f(x)) à calculer.";
const CONSIGNE_D_LIMITE_EXPOSANT = "Calcule la limite de l'exposant CORRECT de l'étape précédente.";
const CONSIGNE_D_CONCLURE = "Conclus en exponentiant le résultat CORRECT de l'étape précédente.";

function consigneD(phase: "dExposant" | "dLimiteExposant" | "dConclure"): string {
  if (phase === "dExposant") return CONSIGNE_D_EXPOSANT;
  if (phase === "dLimiteExposant") return CONSIGNE_D_LIMITE_EXPOSANT;
  return CONSIGNE_D_CONCLURE;
}

function aideD1(phase: "dExposant" | "dLimiteExposant" | "dConclure"): AideAvecLatex {
  if (phase === "dExposant") return { texte: "Méthode générale pour toute forme indéterminée f^g (1^∞, 0^0, ∞^0) : réécris f^g = e^(g·ln f), puis étudie la limite de l'EXPOSANT.", latex: "f^g = e^{g\\cdot\\ln(f)}" };
  if (phase === "dLimiteExposant") return { texte: "Rappel de l'équivalent de ln(cos(u)) au voisinage de 0 :", latex: "\\ln(\\cos(u)) \\sim -\\frac{u^2}{2} \\quad (u \\to 0)" };
  return { texte: "Une fois la limite de l'exposant connue, il ne reste qu'à exponentier ce résultat.", latex: null };
}

function aideD2(phase: "dExposant" | "dLimiteExposant" | "dConclure", exercice: ExerciceLimiteLogD): AideAvecLatex {
  if (phase === "dExposant") return { texte: "Exposant à calculer (limite non calculée) :", latex: `\\frac{${exercice.c}}{x^2}\\cdot\\ln\\left(\\cos(${exercice.k}x)\\right)` };
  if (phase === "dLimiteExposant") return { texte: "Substitution amorcée (calcul final non fait) :", latex: `\\frac{${exercice.c}}{x^2}\\cdot\\left(-\\frac{(${exercice.k}x)^2}{2}\\right)` };
  return { texte: "Limite de l'exposant (déjà confirmée) :", latex: `${exercice.limiteExposant}` };
}

// ============================================================================
// Famille E — instance unique.
// ============================================================================

function formatFonctionE(): string {
  return "\\frac{3^x\\sin(x) - \\ln(1+x)}{x^4+4x^2}";
}

const CONSIGNE_E_DEVELOPPER = "Développe 3ˣ·sin(x) et ln(1+x) à l'ordre 2, puis exprime le numérateur développé.";
const CONSIGNE_E_SIMPLIFIER = "Simplifie le numérateur CORRECT de l'étape précédente (les termes d'ordre 1 s'annulent) et le dénominateur (x⁴+4x² ~ 4x²).";
const CONSIGNE_E_CONCLURE = "Conclus la valeur numérique à partir de la forme CORRECTE de l'étape précédente.";

function consigneE(phase: "eDevelopper" | "eSimplifier" | "eConclure"): string {
  if (phase === "eDevelopper") return CONSIGNE_E_DEVELOPPER;
  if (phase === "eSimplifier") return CONSIGNE_E_SIMPLIFIER;
  return CONSIGNE_E_CONCLURE;
}

function aideE1(phase: "eDevelopper" | "eSimplifier" | "eConclure"): AideAvecLatex {
  if (phase === "eDevelopper") {
    return {
      texte: "Rappel des développements limités à l'ordre 2 nécessaires :",
      latex: "\\begin{gathered} 3^x \\approx 1+x\\ln 3 \\\\ \\sin(x) \\approx x-\\frac{x^3}{6} \\\\ \\ln(1+x) \\approx x-\\frac{x^2}{2} \\end{gathered}",
    };
  }
  if (phase === "eSimplifier") return { texte: "Le dénominateur x⁴+4x² a un terme dominant clair au voisinage de 0.", latex: "x^4+4x^2 \\sim 4x^2 \\quad (x \\to 0)" };
  return { texte: "Le rapport simplifié à l'étape précédente est déjà une CONSTANTE (le facteur x² s'est simplifié) — il ne reste qu'à l'évaluer.", latex: null };
}

function aideE2(phase: "eDevelopper" | "eSimplifier" | "eConclure"): AideAvecLatex {
  if (phase === "eDevelopper") return { texte: "Numérateur et dénominateur affichés développés (simplification finale non faite) :", latex: "\\left(x+x^2\\ln 3\\right) - \\left(x-\\frac{x^2}{2}\\right)" };
  if (phase === "eSimplifier") return { texte: "Numérateur (déjà confirmé) et dénominateur substitués (non simplifié) :", latex: "\\frac{x^2\\left(\\ln 3+\\frac{1}{2}\\right)}{4x^2}" };
  return { texte: "Valeur du rapport simplifié (déjà confirmée) :", latex: "\\frac{\\ln 3+\\frac12}{4}" };
}

// ============================================================================
// Dispatch public.
// ============================================================================

/** Bloc de données affiché sur CHAQUE écran de l'exercice (spec : "consigne générale et bloc de
 * données... redondants sur chaque écran") — un unique bloc `\lim` combinant f(x) et la direction. */
export function formatLimiteEnonceLatex(exercice: ExerciceLimiteLogarithmique): string {
  switch (exercice.famille) {
    case "A":
      return `\\lim_{${formatDirectionA(exercice)}} \\left(${formatFonctionA(exercice)}\\right)`;
    case "B":
      return `\\lim_{x \\to ${exercice.x0}} \\left(${formatFonctionB(exercice)}\\right)`;
    case "C":
      return `\\lim_{${formatDirectionC(exercice)}} \\left(${formatFonctionC(exercice)}\\right)`;
    case "D":
      return `\\lim_{x \\to 0} ${formatFonctionD(exercice)}`;
    case "E":
      return `\\lim_{x \\to 0} ${formatFonctionE()}`;
  }
}

export function consigneEcran(phase: PhaseLimiteLogarithmique, exercice: ExerciceLimiteLogarithmique): string {
  switch (exercice.famille) {
    case "A":
      return consigneA(phase as "aDominance" | "aConclure");
    case "B":
      return consigneB(phase as "bReformuler" | "bConclure", exercice);
    case "C":
      return consigneC(phase as "cDiagnostic" | "cConclure");
    case "D":
      return consigneD(phase as "dExposant" | "dLimiteExposant" | "dConclure");
    case "E":
      return consigneE(phase as "eDevelopper" | "eSimplifier" | "eConclure");
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
      return aideD1(phase as "dExposant" | "dLimiteExposant" | "dConclure");
    case "E":
      return aideE1(phase as "eDevelopper" | "eSimplifier" | "eConclure");
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
      return aideD2(phase as "dExposant" | "dLimiteExposant" | "dConclure", exercice);
    case "E":
      return aideE2(phase as "eDevelopper" | "eSimplifier" | "eConclure");
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
      return [`\\text{num.} \\to ${formatCategorieLabel(exercice.dominanceNumerateur)},\\quad \\text{dénom.} \\to ${formatCategorieLabel(exercice.dominanceDenominateur)}`];
    case "B":
      if (phase === "bReformuler") return null;
      return [
        exercice.sousType === "quotient"
          ? `\\log_{(1+u)^{${exercice.k}}}\\left(1+${exercice.m * exercice.x0}u\\right)`
          : `${exercice.x0}\\cdot u \\cdot \\log_{1+u}(${exercice.k})`,
      ];
    case "C": {
      if (phase === "cDiagnostic") return null;
      const [cible1, cible2] = exercice.sousType === "c2" ? [exercice.partieFacteur1, exercice.partieFacteur2] : [exercice.partieNumerateur, exercice.partieDenominateur];
      return [`\\text{partie 1} \\to ${formatCibleTexte(cible1)},\\quad \\text{partie 2} \\to ${formatCibleTexte(cible2)}`];
    }
    case "D": {
      // Correctif transversal (même bug que 6gen1, voir CLAUDE.md/`docs/historique-6e.md`) :
      // `dConclure` (3e écran) ne montrait QUE la limite de l'exposant (écran 2), jamais l'exposant
      // lui-même (écran 1) — ACCUMULE désormais les deux, plus ancien en premier.
      if (phase === "dExposant") return null;
      const lignes = [`\\text{Exposant (étape 1) : } \\frac{${exercice.c}}{x^2}\\cdot\\ln\\left(\\cos(${exercice.k}x)\\right)`];
      if (phase === "dConclure") lignes.push(`\\text{Limite de l'exposant (étape 2) : } ${exercice.limiteExposant}`);
      return lignes;
    }
    case "E": {
      // Même correctif : `eConclure` (3e écran) ne montrait QUE la simplification (écran 2), jamais
      // le développement (écran 1).
      if (phase === "eDevelopper") return null;
      const lignes = ["\\text{Développé (étape 1) : } \\left(x+x^2\\ln 3\\right) - \\left(x-\\frac{x^2}{2}\\right)"];
      if (phase === "eConclure") lignes.push("\\text{Simplifié (étape 2) : } \\frac{\\ln 3+\\frac12}{4}");
      return lignes;
    }
  }
}

export interface TotalPointsRecap {
  points: number;
  maximum: number;
}

/**
 * Total de points du récapitulatif final — SOMME des scores déjà pénalisés (tentatives + aide) sur
 * chaque écran RÉELLEMENT traversé (2 ou 3 selon la famille), affiché EN COMPLÉMENT de la liste
 * colorée `LigneRecap`/`statutRecap` (jamais à sa place). Même patron que
 * `totalPointsLimiteExponentielle` (6gen6).
 */
export function totalPointsLimiteLogarithmique(resultat: ResultatExerciceLimiteLogarithmique): TotalPointsRecap {
  switch (resultat.famille) {
    case "A":
      return { points: resultat.scoreDominance + resultat.scoreConclure, maximum: 200 };
    case "B":
      return { points: resultat.scoreReformuler + resultat.scoreConclure, maximum: 200 };
    case "C":
      return { points: resultat.scoreDiagnostic + resultat.scoreConclure, maximum: 200 };
    case "D":
      return { points: resultat.scoreExposant + resultat.scoreLimiteExposant + resultat.scoreConclure, maximum: 300 };
    case "E":
      return { points: resultat.scoreDevelopper + resultat.scoreSimplifier + resultat.scoreConclure, maximum: 300 };
  }
}
