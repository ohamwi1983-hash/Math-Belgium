/**
 * Couche présentation (5e) — consignes/labels/aides pour 5gen21 ("Asymptote oblique"). 2 variantes,
 * 3 phases chacune (dont "conclureEquationAsymptote" PARTAGÉE) — `consignePhase`/`texteAideNiveau1`/
 * `texteAideNiveau2` dispatchent par phase (jamais besoin d'être variante-conscientes : chaque phase
 * n'appartient qu'à une seule variante, sauf la phase partagée, dont la cible ne dépend pas non plus
 * de la variante).
 */
import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import { ordreComplet } from "../moteur5e/typesAsymptoteOblique";
import type { PhaseAsymptoteOblique } from "../moteur5e/typesAsymptoteOblique";

// ============================================================================
// Seed déterministe (transversal 3, même principe que 5gen20) — dérivé des champs déjà stockés,
// jamais un nouveau champ.
// ============================================================================

function hashSeed(...nums: number[]): number {
  let h = 2166136261;
  for (const n of nums) {
    h ^= Math.trunc(n) + 0x9e3779b9;
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seedExercice(exercice: ExerciceAsymptoteOblique): number {
  return hashSeed(exercice.a, exercice.b, exercice.c, ...exercice.coeffsD);
}

/** PRNG déterministe (mulberry32) — utilisé UNIQUEMENT pour permuter l'ordre d'affichage des
 * termes, jamais pour une valeur mathématique. */
function ordreTermesVarie(coeffs: number[], seed: number): number[] {
  const degres: number[] = [];
  for (let d = coeffs.length - 1; d >= 0; d--) if (coeffs[d] !== 0) degres.push(d);
  let s = seed;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  for (let i = degres.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [degres[i], degres[j]] = [degres[j], degres[i]];
  }
  return degres;
}

// ============================================================================
// Fragments LaTeX/texte de bas niveau — polynômes.
// ============================================================================

function formatMonomeLatex(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const variable = degre === 0 ? "" : degre === 1 ? "x" : `x^{${degre}}`;
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${variable}`;
}

/** `coeffs[i]` = coefficient de x^i — `seed` permute l'ORDRE d'affichage des termes (transversal 3),
 * jamais leur valeur. */
function formatPolynomeLatex(coeffs: number[], seed: number): string {
  const ordre = ordreTermesVarie(coeffs, seed);
  let out = "";
  let premier = true;
  for (const d of ordre) {
    const frag = formatMonomeLatex(coeffs[d], d, premier);
    if (frag !== "") {
      out += frag;
      premier = false;
    }
  }
  return out === "" ? "0" : out;
}

/** Version TEXTE BRUT (pas de LaTeX — insérée dans une phrase de consigne en prose), exposants en
 * chiffres unicode ² ³ — même ordre varié (même seed) que la version LaTeX du même polynôme. */
function formatMonomeTexte(coeff: number, degre: number, premier: boolean): string {
  if (coeff === 0) return "";
  const abs = Math.abs(coeff);
  const signe = coeff < 0 ? "-" : premier ? "" : "+";
  const exposant = degre === 0 ? "" : degre === 1 ? "x" : degre === 2 ? "x²" : "x³";
  const coeffAffiche = abs === 1 && degre !== 0 ? "" : `${abs}`;
  return `${signe}${coeffAffiche}${exposant}`;
}

function formatPolynomeTexte(coeffs: number[], seed: number): string {
  const ordre = ordreTermesVarie(coeffs, seed);
  let out = "";
  let premier = true;
  for (const d of ordre) {
    const frag = formatMonomeTexte(coeffs[d], d, premier);
    if (frag !== "") {
      out += frag;
      premier = false;
    }
  }
  return out === "" ? "0" : out;
}

/** Quotient Q(x)=ax+b — TOUJOURS dans cet ordre fixe (2 termes seulement, jamais concerné par la
 * variation d'ordre du transversal 3, qui ne s'applique qu'au numérateur/dénominateur du bloc de
 * données). */
function formatQuotientLatex(a: number, b: number): string {
  return formatMonomeLatex(a, 1, true) + formatMonomeLatex(b, 0, false);
}

/** ax+b+c/D(x) — signe de `c` toujours distribué (jamais "+(-5)"), D(x) dans son ordre varié. */
function formatFormeDeveloppeeLatex(a: number, b: number, c: number, coeffsD: number[], seed: number): string {
  const dTexte = formatPolynomeLatex(coeffsD, seed);
  const fraction = c < 0 ? `-\\dfrac{${Math.abs(c)}}{${dTexte}}` : `+\\dfrac{${c}}{${dTexte}}`;
  return `${formatQuotientLatex(a, b)}${fraction}`;
}

// ============================================================================
// Consigne générale + bloc de données.
// ============================================================================

export function consigneGenerale(): string {
  return "Détermine l'équation de l'asymptote oblique de la fonction f(x) ci-dessous.";
}

/** La fonction SEULE (pas de "f(x)=" devant — déjà nommée par la consigne générale). */
export function formatTermesDonneesLatex(exercice: ExerciceAsymptoteOblique): string[] {
  const seed = seedExercice(exercice);
  return [`\\dfrac{${formatPolynomeLatex(exercice.coeffsP, seed)}}{${formatPolynomeLatex(exercice.coeffsD, seed + 1)}}`];
}

// ============================================================================
// Libellés/consignes par phase.
// ============================================================================

export const LIBELLE_PHASE_ASYMPTOTE_OBLIQUE: Record<PhaseAsymptoteOblique, string> = {
  diviserEuclidienne: "Division euclidienne",
  ecrireFormeDeveloppee: "Écrire f(x)",
  calculerCoefficientA: "Coefficient a",
  calculerCoefficientB: "Coefficient b",
  conclureEquationAsymptote: "Équation de l'asymptote",
};

export function labelPhase(phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "ecrireFormeDeveloppee":
      return "f(x)=";
    case "calculerCoefficientA":
      return "a=";
    case "calculerCoefficientB":
      return "b=";
    case "conclureEquationAsymptote":
      return "AO\\equiv";
    default:
      return "";
  }
}

/** Formule LaTeX affichée en mode DISPLAY (rendu empilé, notation de limite déjà corrigée sur
 * 5gen20) au-dessus du champ — UNIQUEMENT les 2 écrans "viaLimites" (chaîne vide sinon, aucun bloc
 * formule à afficher). */
export function formatFormulePhaseLatex(phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "calculerCoefficientA":
      return "a=\\lim_{x\\to\\pm\\infty}\\dfrac{f(x)}{x}";
    case "calculerCoefficientB":
      return "b=\\lim_{x\\to\\pm\\infty}\\left[f(x)-ax\\right]";
    default:
      return "";
  }
}

export function consignePhase(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "diviserEuclidienne": {
      const seed = seedExercice(exercice);
      const nTexte = formatPolynomeTexte(exercice.coeffsP, seed);
      const dTexte = formatPolynomeTexte(exercice.coeffsD, seed + 1);
      return `Effectue la division euclidienne de ${nTexte} par ${dTexte}. Détermine le quotient Q(x) et le reste R(x).`;
    }
    case "ecrireFormeDeveloppee":
      return "Écris f(x) sous la forme de Q(x)+R(x)/D(x).";
    case "calculerCoefficientA":
      return "Calcule le coefficient a.";
    case "calculerCoefficientB":
      return "Calcule le coefficient b.";
    case "conclureEquationAsymptote":
      return "Donne l'équation de l'asymptote oblique AO.";
  }
}

// ============================================================================
// Aides — niveau 1 (exemple/méthode), niveau 2 (résolution complète de l'exemple).
// ============================================================================

export function texteAideNiveau1(phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "diviserEuclidienne":
      return "Pose la division euclidienne de N(x) par D(x), comme une division de polynômes classique — le quotient Q(x) est toujours de degré 1, le reste R(x) est toujours une constante (son degré reste strictement inférieur à celui de D(x)).";
    case "ecrireFormeDeveloppee":
      return "f(x)=Q(x)+R(x)/D(x), directement à partir de la division précédente. Piège : une erreur de signe pendant la division se répercute ici.";
    case "calculerCoefficientA":
      return "Exemple avec une fonction différente : pour g(x)=(3x²-5x+1)/(x-2), calcule a=lim_{x→±∞} g(x)/x.";
    case "calculerCoefficientB":
      return "Exemple (suite) : pour la même fonction g(x)=(3x²-5x+1)/(x-2), avec a=3 déjà trouvé, calcule b=lim_{x→±∞} [g(x)-3x].";
    case "conclureEquationAsymptote":
      return "L'asymptote oblique est le quotient Q(x) SEUL — le reste R(x) disparaît à la limite, ne l'inclus jamais dans l'équation finale.";
  }
}

export function texteAideNiveau2(phase: PhaseAsymptoteOblique): string {
  switch (phase) {
    case "diviserEuclidienne":
      return "Exemple : (x²+5x+2)÷(x-1) donne Q(x)=x+6 et R(x)=8.";
    case "ecrireFormeDeveloppee":
      return "Exemple : avec Q(x)=x+6, R(x)=8, D(x)=x-1 : f(x)=x+6+8/(x-1).";
    case "calculerCoefficientA":
      return "g(x)/x=(3x²-5x+1)/(x(x-2)) — le rapport des termes dominants 3x²/x² donne a=3.";
    case "calculerCoefficientB":
      return "g(x)-3x=(3x²-5x+1)/(x-2)-3x=(3x²-5x+1-3x(x-2))/(x-2)=(x+1)/(x-2) — le rapport des termes dominants x/x donne b=1.";
    case "conclureEquationAsymptote":
      return "Exemple : avec quotient x+6 (reste ignoré), l'asymptote est AO≡x+6.";
  }
}

// ============================================================================
// Bloc "état actuel" — récapitule les valeurs déjà CONFIRMÉES plus tôt dans la séquence.
// ============================================================================

function formatQuotientResteConfirmesLatex(exo: ExerciceAsymptoteOblique): string[] {
  return [`Q(x)=${formatQuotientLatex(exo.a, exo.b)}`, `R(x)=${exo.c}`];
}
function formatFormeDeveloppeeConfirmeeLatex(exo: ExerciceAsymptoteOblique, seed: number): string {
  return `=${formatFormeDeveloppeeLatex(exo.a, exo.b, exo.c, exo.coeffsD, seed)}`;
}
function formatCoefficientAConfirmeLatex(exo: ExerciceAsymptoteOblique): string {
  return `a=${exo.a}`;
}
function formatCoefficientBConfirmeLatex(exo: ExerciceAsymptoteOblique): string {
  return `b=${exo.b}`;
}
function formatEquationAsymptoteConfirmeeLatex(exo: ExerciceAsymptoteOblique): string {
  return `AO\\equiv ${formatQuotientLatex(exo.a, exo.b)}`;
}

export function formatTermesEtatActuelLatex(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string[] | null {
  const seed = seedExercice(exercice);
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];

  const termes: string[] = [];
  for (const p of precedentes) {
    if (p === "diviserEuclidienne") termes.push(...formatQuotientResteConfirmesLatex(exercice));
    else if (p === "ecrireFormeDeveloppee") termes.push(formatFormeDeveloppeeConfirmeeLatex(exercice, seed));
    else if (p === "calculerCoefficientA") termes.push(formatCoefficientAConfirmeLatex(exercice));
    else if (p === "calculerCoefficientB") termes.push(formatCoefficientBConfirmeLatex(exercice));
    else if (p === "conclureEquationAsymptote") termes.push(formatEquationAsymptoteConfirmeeLatex(exercice));
  }
  return termes.length > 0 ? termes : null;
}

// ============================================================================
// Récapitulatif final — réponse ATTENDUE pour chaque écran RÉELLEMENT traversé.
// ============================================================================

export function formatReponseAttenduePhaseLatex(exercice: ExerciceAsymptoteOblique, phase: PhaseAsymptoteOblique): string[] {
  const seed = seedExercice(exercice);
  switch (phase) {
    case "diviserEuclidienne":
      return formatQuotientResteConfirmesLatex(exercice);
    case "ecrireFormeDeveloppee":
      return [formatFormeDeveloppeeConfirmeeLatex(exercice, seed)];
    case "calculerCoefficientA":
      return [formatCoefficientAConfirmeLatex(exercice)];
    case "calculerCoefficientB":
      return [formatCoefficientBConfirmeLatex(exercice)];
    case "conclureEquationAsymptote":
      return [formatEquationAsymptoteConfirmeeLatex(exercice)];
  }
}
