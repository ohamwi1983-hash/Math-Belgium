import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceChoisirModele } from "./types";
import { uneSeuleTransformation } from "./modele";

/**
 * Profil d'instance de gen69 (tirage équilibré des évaluations, voir
 * `.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = situation + type de la question b) (prédire / résoudre) : la série A fixe la
 *   situation de chaque question, les autres séries la reproduisent avec d'autres nombres.
 * - Cas particulier : un modèle à UNE seule transformation (boîte à glaçon : ∛V + b ; gaz : k/V),
 *   qui se lit en une étape — il raccourcit la question a). Ce n'est jamais un verdict.
 * - `calcul` absent : toutes les réponses sont exactes (entiers ou décimaux simples), sans
 *   calculatrice.
 */
export function profilChoisirModele(e: ExerciceChoisirModele): ProfilInstance {
  return {
    casParticulier: uneSeuleTransformation(e) ? "une-transformation" : null,
    forme: `${e.contexte}/${e.question4.type}`,
  };
}

export const LIBELLE_CAS_CHOISIR_MODELE = "Inclure un cas particulier (modèle à une seule transformation : boîte à glaçon ou gaz)";
