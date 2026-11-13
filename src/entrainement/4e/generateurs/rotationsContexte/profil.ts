import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceRotationsContexte } from "../../core/rotationsContexte.types";
import { calculExact, solutionsTheta, thetaBrut, thetaDirect } from "../../moteur/modeleRotationsContexte";

/**
 * Profil d'instance de gen79 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà la situation (roue, horloge…) et le sens (direct / inverse).
 * - `forme` fixe, question par question, ce qui rend la question plus ou moins piégeuse : la
 *   conversion d'origine (position de départ + sens de rotation, ex. « 270-horaire »), et en plus
 *   — sens direct : θ₀ ± α sort de [0° ; 360°[ et doit être réduit (« reduction ») ou non (« sans-reduction ») ;
 *   — sens inverse : le nombre de solutions (« sol2 », « sol1 » pour le cas particulier).
 *   Exemple : « roue-direct:270-horaire:reduction ». Seuls les nombres changent entre les séries.
 * - `calcul` : « exacte » si les angles sont remarquables (sens direct : θ multiple de 30° ou 45° ;
 *   sens inverse : sin θ = ±1/2 ou ±1), « calculatrice » sinon.
 * - Cas particulier = sens inverse au point le plus haut ou le plus bas (sin θ = ±1) : UNE seule
 *   solution, la résolution raccourcit. Par défaut une évaluation n'en tire pas ; la case du
 *   panneau en met un, le même pour toutes les séries. Ce n'est pas un verdict : l'élève doit
 *   toujours trouver les instants, pas décider s'il y en a.
 */
export const LIBELLE_CAS_ROTATIONS_CONTEXTE =
  "Inclure un cas particulier (sens inverse : point le plus haut ou le plus bas, une seule solution)";

export function formeRotationsContexte(e: ExerciceRotationsContexte): string {
  const conversion = `${e.origine}-${e.rotation === 1 ? "trigo" : "horaire"}`;
  const suite = e.sens === "direct" ? (thetaBrut(e) === thetaDirect(e) ? "sans-reduction" : "reduction") : `sol${solutionsTheta(e).length}`;
  return `${e.situation}-${e.sens}:${conversion}:${suite}`;
}

export function profilRotationsContexte(e: ExerciceRotationsContexte): ProfilInstance {
  const unique = e.sens === "inverse" && solutionsTheta(e).length === 1;
  return {
    casParticulier: unique ? "une-solution" : null,
    // Le cas particulier (sin θ = ±1) n'a pas besoin de calculatrice mais ne s'y oppose pas : sans
    // `calcul`, il reste tirable que la calculatrice soit interdite ou autorisée.
    calcul: unique ? undefined : calculExact(e) ? "exacte" : "calculatrice",
    forme: formeRotationsContexte(e),
  };
}
