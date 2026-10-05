import type { CandidatSolution, ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import { diagnostiquerEnsembleValeurs } from "./equivalenceCyclometrique";
import { evaluerExpressionCyclometrique } from "./expressionCyclometrique";
import type { StatutVerification } from "../moteur/statutVerification";
import { verifierEnsembleReelGuide } from "./verificationEnsembleReel";

/**
 * Couche B (6e) — vérification pour `6gen3` (REFONTE). N'importe jamais rien de `generateurs6e/`
 * (voir `generateurs6e/equationsCyclometriques/session.integration.test.ts`).
 */
const TOLERANCE = 0.001;
const TRIG: Record<string, (x: number) => number> = { arcsin: Math.sin, arccos: Math.cos, arctan: Math.tan };

// ============================================================================
// Écran "ce" — condition d'existence, réutilise `verifierEnsembleReelGuide` (partagé 6gen1/6gen3).
// ============================================================================

export function verifierCE(exercice: ExerciceEquationsCyclometriques, reponse: EnsembleReelGuide): boolean {
  return verifierEnsembleReelGuide(reponse, exercice.ce);
}

// ============================================================================
// Écran "condition" — condition de compatibilité des codomaines des 2 arcfonctions (variante 4
// UNIQUEMENT, écran intercalaire entre "ce" et "equation" — voir `typesEquationsCyclometriques.ts`,
// `phaseApres` ne route JAMAIS vers cette phase pour les variantes 1/2/3). Réutilise le même
// comparateur structurel que "ce" (même type `EnsembleReelGuide`, même composant élève).
// ============================================================================

export function verifierCondition(exercice: ExerciceEquationsCyclometriques, reponse: EnsembleReelGuide): boolean {
  if (exercice.variante !== "arcfonctionsDifferentes") {
    throw new Error("verifierCondition : appelé hors variante 4 (ne devrait jamais arriver, voir phaseApres)");
  }
  return verifierEnsembleReelGuide(reponse, exercice.conditionParasite);
}

// ============================================================================
// Écran "equation" — équation non cyclométrique. Comparaison par ÉQUIVALENCE ALGÉBRIQUE
// (échantillonnage numérique, jamais de manipulation symbolique — convention de toute la
// plateforme, voir `moteur6e/equivalenceCyclometrique.ts`) : la différence gauche-droite soumise
// doit être PROPORTIONNELLE (facteur constant non nul, tolère un signe/une mise à l'échelle des 2
// membres) à la différence gauche-droite de référence, en plusieurs points d'échantillonnage —
// accepte donc naturellement un réarrangement ("u²+v²=1" pour "v²=1-u²") sans exiger une forme
// textuelle unique.
// ============================================================================

const POINTS_ECHANTILLON = [0.31, -0.72, 1.47, -1.83, 2.29, -0.14];

function referenceEquation(exercice: ExerciceEquationsCyclometriques): { gauche: (x: number) => number; droite: (x: number) => number } {
  switch (exercice.variante) {
    case "angleLineaire": {
      const { a, b } = exercice.arg;
      const T = TRIG[exercice.arcfonction](exercice.angle.numerique);
      return { gauche: (x) => a * x + b, droite: () => T };
    }
    case "memeArcfonction": {
      const { a: a1, b: b1 } = exercice.arg1;
      const { a: a2, b: b2 } = exercice.arg2;
      return { gauche: (x) => a1 * x + b1, droite: (x) => a2 * x + b2 };
    }
    case "angleQuadratique": {
      const { a, b, c } = exercice.arg;
      const T = TRIG[exercice.arcfonction](exercice.angle.numerique);
      return { gauche: (x) => a * x * x + b * x + c, droite: () => T };
    }
    case "arcfonctionsDifferentes": {
      const { a, b } = exercice.arg1;
      const { a: c, b: d } = exercice.arg2;
      const u = (x: number) => a * x + b;
      const v = (x: number) => c * x + d;
      if (exercice.sousCas === "asin_acos") return { gauche: (x) => v(x) ** 2, droite: (x) => 1 - u(x) ** 2 };
      if (exercice.sousCas === "asin_atan") return { gauche: (x) => v(x) ** 2 * (1 - u(x) ** 2), droite: (x) => u(x) ** 2 };
      return { gauche: (x) => u(x) ** 2 * (1 + v(x) ** 2), droite: () => 1 };
    }
  }
}

function diviserEquation(texte: string): { gauche: string; droite: string } | null {
  const parties = texte.split("=");
  if (parties.length !== 2) return null;
  return { gauche: parties[0], droite: parties[1] };
}

export function diagnostiquerEquation(exercice: ExerciceEquationsCyclometriques, texte: string): StatutVerification {
  const parties = diviserEquation(texte);
  if (parties === null) return "parse_error";

  const ref = referenceEquation(exercice);
  let evalGauche: (x: number) => number;
  let evalDroite: (x: number) => number;
  try {
    evalGauche = (x) => evaluerExpressionCyclometrique(parties.gauche, x);
    evalDroite = (x) => evaluerExpressionCyclometrique(parties.droite, x);
    // Force l'évaluation immédiate pour détecter une erreur de syntaxe tout de suite.
    evalGauche(0);
    evalDroite(0);
  } catch {
    return "parse_error";
  }

  let ratioReference: number | null = null;
  let comparables = 0;
  for (const x of POINTS_ECHANTILLON) {
    let soumisG: number;
    let soumisD: number;
    try {
      soumisG = evalGauche(x);
      soumisD = evalDroite(x);
    } catch {
      return "parse_error";
    }
    if (!Number.isFinite(soumisG) || !Number.isFinite(soumisD)) return "parse_error";
    const diffSoumis = soumisG - soumisD;
    const diffRef = ref.gauche(x) - ref.droite(x);
    if (Math.abs(diffRef) < 1e-6) continue; // point dégénéré (racine de référence), sauté.
    comparables++;
    const ratio = diffSoumis / diffRef;
    if (ratioReference === null) {
      if (Math.abs(ratio) < 1e-6) return "not_equivalent"; // proportionnalité à 0 = équation triviale, pas la même.
      ratioReference = ratio;
    } else if (Math.abs(ratio - ratioReference) > 1e-3) {
      return "not_equivalent";
    }
  }
  if (comparables < 3) return "parse_error";
  return "correct";
}

export function verifierEquation(exercice: ExerciceEquationsCyclometriques, texte: string): boolean {
  return diagnostiquerEquation(exercice, texte) === "correct";
}

// ============================================================================
// Écran "solutions" — ensemble ALGÉBRIQUE des racines (avant filtrage CE), add-as-needed.
// ============================================================================

export function verifierSolutions(exercice: ExerciceEquationsCyclometriques, textes: string[]): boolean {
  const cible = exercice.candidats.map((c) => c.x);
  return diagnostiquerEnsembleValeurs(textes, cible, TOLERANCE) === "correct";
}

// ============================================================================
// Écran "acceptRejet" — verdict accepter/rejeter par candidat, DANS L'ORDRE de `exercice.candidats`
// (déjà trié par x croissant, exactement ce que l'écran affiche).
// ============================================================================

export function verifierAcceptRejet(exercice: ExerciceEquationsCyclometriques, decisions: boolean[]): boolean {
  const attendu = exercice.candidats.map((c: CandidatSolution) => c.accepteAttendu);
  if (decisions.length !== attendu.length) return false;
  return decisions.every((d, i) => d === attendu[i]);
}
