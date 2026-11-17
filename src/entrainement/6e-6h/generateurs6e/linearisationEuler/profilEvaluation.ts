import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import { integraleReduiteAuTermeConstant, puissances } from "../../core6e/linearisationEuler";
import type { ExerciceLinearisation } from "../../core6e/linearisationEuler";

/**
 * Profil de tirage équilibré de `6gen93` « Linéariser avec les formules d'Euler »
 * (`.claude/rules/feuilles-evaluations.md`, « Tirage équilibré des évaluations »).
 *
 * - `forme` = famille de degré (fiche validée) : la variante (`degre2`, `degre3`, `degre4`) pour la
 *   linéarisation seule, `application:degN` pour l'application. La série A fixe le degré ; les
 *   autres séries reprennent ce degré avec une autre expression, une autre pulsation ou un autre
 *   intervalle. Ni cos/sin ni la pulsation n'entrent dans la forme : sinon une famille n'aurait
 *   plus qu'un ou deux exercices possibles et les séries se répéteraient.
 * - Cas particulier (application seulement) : `termes-trig-nuls` — tous les sinus/cosinus de la
 *   primitive prennent la même valeur aux deux bornes (cos²x sur [0 ; π/2], cos⁴x sur [0 ; π]…) :
 *   l'intégrale se réduit au terme constant a₀(b − a), sans valeur remarquable à combiner.
 * - Toutes les valeurs sont exactes et remarquables : pas de `calcul`.
 */
export function profilLinearisation(e: ExerciceLinearisation): ProfilInstance {
  if (e.variante === "application") {
    return { casParticulier: integraleReduiteAuTermeConstant(e) ? "termes-trig-nuls" : null, forme: `application:deg${puissances(e).n}` };
  }
  return { casParticulier: null, forme: e.variante };
}

export const LIBELLE_CAS_LINEARISATION = "Inclure un cas particulier (intégrale où les termes en sinus et cosinus s'éliminent entre les bornes : seul le terme constant compte)";
