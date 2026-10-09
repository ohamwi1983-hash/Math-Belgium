import type { ExerciceMethodeGeneratrices } from "../core6e/methodeGeneratrices.types";
import { evaluerExpressionExponentielle, separerEquationTexte } from "./equivalenceExponentielle";
import type { StatutVerification } from "../moteur/statutVerification";
import type { PhaseMethodeGeneratrices } from "./typesMethodeGeneratrices";

/**
 * Couche B (6e) — vérification pour `6gen57`. N'importe JAMAIS rien de `src/generateurs6e/` (règle
 * non négociable CLAUDE.md) — voir `generateurs6e/methodeGeneratrices/session.integration.test.ts`
 * pour le seul fichier autorisé Couche A + Couche B ensemble.
 *
 * **Vérificateur générique, RÉUTILISABLE pour tout futur générateur de lieux géométriques par
 * élimination de paramètre** : `diagnostiquerEquationEchelle` compare une équation TEXTE saisie par
 * l'élève à une équation de référence — déjà pré-calculée par la Couche A, valeurs numériques
 * substituées — en vérifiant qu'elles sont PROPORTIONNELLES (même lieu géométrique, quel que soit le
 * facteur d'échelle/la façon dont les termes sont réarrangés d'un côté ou l'autre du "="), jamais une
 * égalité terme à terme stricte. Réutilise `evaluerExpressionExponentielle`/`separerEquationTexte`
 * (`moteur6e/equivalenceExponentielle.ts`, chapitre 2) — réutilisation intra-chantier moteur→moteur,
 * explicitement autorisée par l'architecture (CLAUDE.md).
 *
 * Cette famille de générateurs n'a, structurellement, JAMAIS besoin de connaître `famille`/`donnees`
 * pour vérifier une réponse : les 5 écrans comparent toujours les MÊMES champs génériques
 * (`generatrice1`/`generatrice2`/`elimineBrut`/`elimineFactorise`/`morceaux`/`equationLieuPropre`/
 * `idRestrictionCorrecte`) — voir en-tête `core6e/methodeGeneratrices.types.ts`.
 */

const TOLERANCE_DEFAUT = 1e-6;
const NOMBRE_ECHANTILLONS = 10;

function combinerStatuts(...statuts: StatutVerification[]): StatutVerification {
  if (statuts.some((s) => s === "parse_error")) return "parse_error";
  if (statuts.some((s) => s === "not_equivalent")) return "not_equivalent";
  return "correct";
}

/** Échantillon aléatoire pour une liste de variables — `alpha` reçoit une plage RESTREINTE (évite
 * les asymptotes de `tan(alpha)`/`tan(2*alpha)`, famille C) ; `x`/`y` une plage généreuse mais NON
 * NULLE (évite les coïncidences accidentelles avec un facteur `x=0`/`y=0` du lieu lui-même). */
function echantillon(variables: string[]): Record<string, number> {
  const point: Record<string, number> = {};
  for (const v of variables) {
    const signe = Math.random() < 0.5 ? -1 : 1;
    point[v] = v === "alpha" ? signe * (0.1 + Math.random() * 0.3) : signe * (0.6 + Math.random() * 3.1);
  }
  return point;
}

function echantillons(variables: string[], n = NOMBRE_ECHANTILLONS): Record<string, number>[] {
  return Array.from({ length: n }, () => echantillon(variables));
}

/** Compare `texteEtudiant` à `texteReference` (déjà connue, correcte, produite par la Couche A) —
 * PROPORTIONNELLES à un facteur multiplicatif non nul près, jamais une égalité stricte terme à
 * terme (2 écritures valides d'une même équation ne partagent pas forcément le même facteur
 * d'échelle ni le même membre "0"). */
export function diagnostiquerEquationEchelle(texteEtudiant: string, texteReference: string, variables: string[], tolerance: number = TOLERANCE_DEFAUT): StatutVerification {
  const separeEtudiant = separerEquationTexte(texteEtudiant);
  if (!separeEtudiant) return "parse_error";
  const separeReference = separerEquationTexte(texteReference);
  /* c8 ignore next 3 */
  if (!separeReference) {
    throw new Error(`diagnostiquerEquationEchelle : texteReference invalide (bug interne côté Couche A) : "${texteReference}"`);
  }

  let ratio: number | null = null;
  for (const point of echantillons(variables)) {
    let gaucheEtudiant: number;
    let droiteEtudiant: number;
    try {
      gaucheEtudiant = evaluerExpressionExponentielle(separeEtudiant.gauche, point);
      droiteEtudiant = evaluerExpressionExponentielle(separeEtudiant.droite, point);
    } catch {
      return "parse_error";
    }
    const diffEtudiant = gaucheEtudiant - droiteEtudiant;
    if (!Number.isFinite(diffEtudiant)) return "not_equivalent";

    const diffReference = evaluerExpressionExponentielle(separeReference.gauche, point) - evaluerExpressionExponentielle(separeReference.droite, point);

    if (ratio === null) {
      if (Math.abs(diffReference) < 1e-9) continue; // échantillon dégénéré pour CETTE référence, on en tire un autre
      ratio = diffEtudiant / diffReference;
      if (Math.abs(ratio) < 1e-9) return "not_equivalent"; // l'équation étudiante est identiquement nulle, la référence ne l'est pas
      continue;
    }
    if (Math.abs(diffEtudiant - ratio * diffReference) > tolerance * (1 + Math.abs(diffReference))) return "not_equivalent";
  }
  /* c8 ignore next 1 */
  if (ratio === null) return "not_equivalent";
  return "correct";
}

function diagnostiquerChoix(valeur: string | undefined, attendu: string): StatutVerification {
  return valeur === attendu ? "correct" : "not_equivalent";
}

export function diagnostiquerEcran(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices, valeurs: string[]): StatutVerification {
  switch (phase) {
    case "ecran1": {
      const s1 = diagnostiquerEquationEchelle(valeurs[0] ?? "", exercice.generatrice1, ["x", "y", "alpha"]);
      const s2 = diagnostiquerEquationEchelle(valeurs[1] ?? "", exercice.generatrice2, ["x", "y", "alpha"]);
      return combinerStatuts(s1, s2);
    }
    case "ecran2":
      return diagnostiquerEquationEchelle(valeurs[0] ?? "", exercice.elimineBrut, ["x", "y"]);
    case "ecran3":
      return diagnostiquerEquationEchelle(valeurs[0] ?? "", exercice.elimineFactorise, ["x", "y"]);
    case "ecran4": {
      const statuts = exercice.morceaux.map((m, i) => diagnostiquerChoix(valeurs[i], m.statut));
      return combinerStatuts(...statuts);
    }
    case "ecran5": {
      const sEquation = diagnostiquerEquationEchelle(valeurs[0] ?? "", exercice.equationLieuPropre, ["x", "y"]);
      const sRestriction = diagnostiquerChoix(valeurs[1], exercice.idRestrictionCorrecte);
      return combinerStatuts(sEquation, sRestriction);
    }
  }
}

export function verifierEcran(exercice: ExerciceMethodeGeneratrices, phase: PhaseMethodeGeneratrices, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
