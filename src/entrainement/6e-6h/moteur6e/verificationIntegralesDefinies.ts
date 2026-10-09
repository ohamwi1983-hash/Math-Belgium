import type { ExerciceIntegraleMoyenne, ExerciceIntegraleParametre, ExerciceIntegraleSimple, ExerciceIntegralesDefinies } from "../core6e/integralesDefinies.types";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerEnsembleValeurs, diagnostiquerEquationDifference, diagnostiquerValeur } from "./equivalenceExponentielle";
import type { PhaseCalculPrimitives } from "./typesCalculPrimitives";
import { phasesPourExercice as phasesPourExercicePrimitive } from "./typesCalculPrimitives";
import type { PhaseIntegralesDefinies } from "./typesIntegralesDefinies";
import { diagnostiquerEcran as diagnostiquerEcranPrimitive } from "./verificationCalculPrimitives";

/**
 * Couche B (6e) — vérification pour `6gen25`. N'importe JAMAIS rien de `src/generateurs6e/` (règle
 * non négociable, CLAUDE.md) — voir `verificationIntegralesDefinies.test.ts` (fixtures locales
 * factices) et `generateurs6e/integralesDefinies/session.integration.test.ts` (seul fichier
 * autorisé Couche A + Couche B) pour la preuve.
 *
 * **Écrans EMPRUNTÉS** (calcul de la primitive, familles A/B/C/G) : délégués TELS QUELS à
 * `verificationCalculPrimitives.ts` (`diagnostiquerEcran`, 6gen23) — jamais réimplémentés (voir
 * `diagnostiquerEcran` ci-dessous, dispatcher générique). **Écrans PROPRES à 6gen25** : 4 nouvelles
 * fonctions ci-dessous, réutilisant les briques génériques déjà partagées du chapitre
 * (`diagnostiquerValeur`/`diagnostiquerEquationDifference`/`diagnostiquerEnsembleValeurs` de
 * `equivalenceExponentielle.ts` — jamais un solveur symbolique dédié, voir clarification 2 du
 * prompt d'origine).
 */

const TOLERANCE = 0.01;

function valeurIntegrale(exercice: ExerciceIntegraleSimple | ExerciceIntegraleMoyenne): number {
  return exercice.primitive.primitiveReference(exercice.b) - exercice.primitive.primitiveReference(exercice.a);
}

/** Écran "finalIntegrale" (scénarios `simple`/`moyenne`) — valeurs[0] = F(b)−F(a). */
export function diagnostiquerFinalIntegrale(exercice: ExerciceIntegraleSimple | ExerciceIntegraleMoyenne, valeurs: string[]): StatutVerification {
  return diagnostiquerValeur(valeurs[0], valeurIntegrale(exercice), TOLERANCE);
}
export function verifierFinalIntegrale(exercice: ExerciceIntegraleSimple | ExerciceIntegraleMoyenne, valeurs: string[]): boolean {
  return diagnostiquerFinalIntegrale(exercice, valeurs) === "correct";
}

/** Écran "valeurMoyenne" (scénario `moyenne` seulement) — valeurs[0] = (F(b)−F(a))/(b−a), à partir
 * de l'intégrale CORRECTE de l'écran précédent (jamais recalculée depuis la saisie élève). */
export function diagnostiquerValeurMoyenne(exercice: ExerciceIntegraleMoyenne, valeurs: string[]): StatutVerification {
  const moyenne = valeurIntegrale(exercice) / (exercice.b - exercice.a);
  return diagnostiquerValeur(valeurs[0], moyenne, TOLERANCE);
}
export function verifierValeurMoyenne(exercice: ExerciceIntegraleMoyenne, valeurs: string[]): boolean {
  return diagnostiquerValeurMoyenne(exercice, valeurs) === "correct";
}

const CANDIDATS_M = [-6, -5, -4, -3, -2, -1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3, 4, 5, 6];

/** Différence gauche−droite ATTENDUE de l'équation "F(...)−F(...) = cible" en fonction de m —
 * réutilisée par `diagnostiquerEquationDifference` (accepte tout déplacement de terme légitime,
 * comme "F(m)-F(fixe)=cible" aussi bien que "F(m)=cible+F(fixe)" — voir en-tête de cette fonction
 * dans `equivalenceExponentielle.ts`). */
function differenceReferencePoserEquationM(exercice: ExerciceIntegraleParametre): (m: number) => number {
  const F = exercice.primitive.primitiveReference;
  const fixe = F(exercice.borneFixe);
  return (m: number) => (exercice.mEstBorneSuperieure ? F(m) - fixe : fixe - F(m)) - exercice.cible.numerique;
}

/** Écran "poserEquationM" (scénario `parametre` seulement) — valeurs[0] = équation TEXTE en m
 * ("F(m)-F(fixe)=cible" ou toute réécriture algébriquement équivalente). */
export function diagnostiquerPoserEquationM(exercice: ExerciceIntegraleParametre, valeurs: string[]): StatutVerification {
  const points = [...CANDIDATS_M, exercice.m];
  return diagnostiquerEquationDifference(valeurs[0], "m", differenceReferencePoserEquationM(exercice), points, TOLERANCE);
}
export function verifierPoserEquationM(exercice: ExerciceIntegraleParametre, valeurs: string[]): boolean {
  return diagnostiquerPoserEquationM(exercice, valeurs) === "correct";
}

/** Écran "resoudreM" (scénario `parametre` seulement) — add-as-needed, `valeurs` = liste de textes
 * numériques (1 ou 2 selon `exercice.solutionsM.length`), ordre indifférent. */
export function diagnostiquerResoudreM(exercice: ExerciceIntegraleParametre, valeurs: string[]): StatutVerification {
  return diagnostiquerEnsembleValeurs(valeurs, exercice.solutionsM, TOLERANCE);
}
export function verifierResoudreM(exercice: ExerciceIntegraleParametre, valeurs: string[]): boolean {
  return diagnostiquerResoudreM(exercice, valeurs) === "correct";
}

// ============================================================================
// Dispatcher générique (mirroir de `verificationCalculPrimitives.ts`).
// ============================================================================

/** UNE SEULE fonction de vérification par écran — délègue les écrans EMPRUNTÉS (famille de
 * primitive) tels quels à 6gen23, dispatch localement les 4 écrans PROPRES à 6gen25. */
export function diagnostiquerEcran(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies, valeurs: string[]): StatutVerification {
  const chainePrimitive = phasesPourExercicePrimitive(exercice.primitive);
  if (chainePrimitive.includes(phase as PhaseCalculPrimitives)) {
    return diagnostiquerEcranPrimitive(exercice.primitive, phase as PhaseCalculPrimitives, valeurs);
  }
  switch (phase) {
    case "finalIntegrale":
      return diagnostiquerFinalIntegrale(exercice as ExerciceIntegraleSimple | ExerciceIntegraleMoyenne, valeurs);
    case "valeurMoyenne":
      return diagnostiquerValeurMoyenne(exercice as ExerciceIntegraleMoyenne, valeurs);
    case "poserEquationM":
      return diagnostiquerPoserEquationM(exercice as ExerciceIntegraleParametre, valeurs);
    case "resoudreM":
      return diagnostiquerResoudreM(exercice as ExerciceIntegraleParametre, valeurs);
    default:
      return "parse_error";
  }
}

export function verifierEcran(exercice: ExerciceIntegralesDefinies, phase: PhaseIntegralesDefinies, valeurs: string[]): boolean {
  return diagnostiquerEcran(exercice, phase, valeurs) === "correct";
}
