import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceProblemesFonctionsReference } from "../../core/problemesFonctionsReference.types";

/**
 * Profil d'instance de gen68 (tirage équilibré des évaluations, voir
 * `.claude/rules/feuilles-evaluations.md`). `forme` = type de contexte (trajet, potager, aquarium,
 * thermostat, location, plaque) : la série A le fixe question par question, les autres séries
 * reproduisent le même contexte avec d'autres nombres.
 *
 * Aucun cas particulier : aucune instance ne raccourcit la résolution (la borne tombe toujours
 * strictement à l'intérieur du domaine du contexte, l'inéquation est toujours à résoudre et à
 * restreindre). Le sens de la question (« moins de », « au moins »…) n'en est pas un non plus :
 * c'est une variation d'énoncé, pas un raccourci. `calcul` absent : toutes les réponses sont des
 * entiers (la calculatrice n'est jamais requise).
 */
export function profilProblemesFonctionsReference(e: ExerciceProblemesFonctionsReference): ProfilInstance {
  return { casParticulier: null, forme: e.famille };
}
