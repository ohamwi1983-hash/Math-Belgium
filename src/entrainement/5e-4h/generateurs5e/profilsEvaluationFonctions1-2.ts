/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen1 (domaine de définition) et 5gen2
 * (décomposition), chapitre 1 de 5e.
 *
 * `calcul` absent (sans objet) : toutes les valeurs sont exactes par construction ; avec `'exacte'`,
 * une évaluation « calculatrice autorisée » ne trouverait aucune instance conforme (même convention
 * que `profilsEvaluationLogarithmes.ts` / `profilsEvaluationComplexes34-36.ts`).
 *
 * 5gen1 — `forme` = famille (structure √N/D ou N/√D distinguée pour « racine sur fraction »).
 * Cas particuliers (ils RACCOURCISSENT la résolution, proposés seulement par la case) :
 *   - « pas-de-ce » : famille « pas de CE » (racine d'indice impair seule, valeur absolue) ;
 *   - « condition-toujours-vraie » : un dénominateur ou un radicande qui ne s'annule / ne change
 *     jamais de signe (Δ < 0…) — la condition s'écrit mais n'exclut rien.
 *
 * 5gen2 — `forme` = nombre de couches. Aucun cas particulier : une décomposition se fait toujours
 * en entier.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceDomaineDefinition } from "../core5e/domaineDefinition.types";
import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";

export const LIBELLE_CAS_DOMAINE_DEFINITION =
  "Inclure un cas particulier (pas de condition d'existence, ou condition toujours vraie)";

export function profilDomaineDefinition(e: ExerciceDomaineDefinition): ProfilInstance {
  const forme = e.famille === "racineSurFraction" ? `racineSurFraction-${e.structure}` : e.famille;
  const casParticulier = e.famille === "pasDeCE" ? "pas-de-ce" : e.aucuneCE ? "condition-toujours-vraie" : null;
  return { casParticulier, forme };
}

export function profilDecompositionFonction(e: ExerciceDecompositionFonction): ProfilInstance {
  return { casParticulier: null, forme: `${e.couches.length}-couches` };
}
