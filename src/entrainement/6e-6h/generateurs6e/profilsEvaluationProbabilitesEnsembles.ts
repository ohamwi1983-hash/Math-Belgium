/**
 * Profil d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 6gen30 (« Probabilités et ensembles ») — méthode `.claude/rules/feuilles-evaluations.md`,
 * section « Tirage équilibré ».
 *
 * Décisions :
 * - Les VERDICTS (incompatibles / indépendants / ni l'un ni l'autre ; >, <, = pour les
 *   conditionnelles ; indépendants ou non) ne sont JAMAIS des cas particuliers : la question est de
 *   décider, filtrer une issue rendrait la réponse prévisible (règle « un verdict n'est jamais un cas
 *   particulier »). Une paire indépendante n'est donc pas un cas particulier ici.
 * - Cas particuliers (ce qui RACCOURCIT la résolution) :
 *   - famille A, « lecture-directe » : la probabilité de l'étape 2 est P(A∩B̄) ou P(Ā∩B), une case du
 *     tableau déjà complété à l'étape 1 (aucun calcul nouveau) — une évaluation par défaut demande une
 *     probabilité conditionnelle ;
 *   - famille B, « intersection-vide » : A et B ne peuvent pas se produire ensemble ; P(A∩B) = 0 et
 *     P(A|B) = 0 se règlent en une ligne.
 * - `calcul` absent : toutes les valeurs sont des fractions exactes d'effectifs entiers, aucune
 *   instance n'exige la calculatrice (convention de `profilsEvaluationComplexes34-36.ts`).
 * - `forme` absent : la structure (troisième donnée, sous-type de l'étape 3, cartes ou dés, union ou
 *   intersection) est entièrement fixée par la VARIANTE, donc déjà identique d'une série à l'autre.
 *
 * Mesure (lot refonte 6gen30, 10 000 tirages libres) : voir le rapport — environ 25 % de
 * « lecture-directe » (2 demandes sur 4 de la famille A, soit 1 sur 4 au total) et une petite part
 * d'« intersection-vide » en famille B.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceProbabilitesEnsembles } from "../core6e/probabilitesEnsembles.types";

export const LIBELLE_CAS_PROBABILITES_ENSEMBLES = "Inclure un cas particulier (probabilité lue directement dans le tableau, ou deux événements qui ne peuvent pas se produire ensemble)";

export function profilProbabilitesEnsembles(e: ExerciceProbabilitesEnsembles): ProfilInstance {
  if (e.famille === "A") return { casParticulier: e.demandeEcran2 === "AetBbar" || e.demandeEcran2 === "AbaretB" ? "lecture-directe" : null };
  return { casParticulier: e.countAetB === 0 ? "intersection-vide" : null };
}
