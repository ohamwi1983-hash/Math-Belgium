/**
 * Profil d'instance de `6gen98` « Régions du plan complexe » pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = le TYPE de condition (la variante : disque, demi-plan, médiatrice, secteur ; pour une
 *   intersection, `intersection-cercle-demiplan` ou `intersection-quadrant`). Les séries B, C…
 *   reprennent le même type avec d'autres nombres. Ce que l'élève DÉCIDE n'y entre pas : le côté
 *   de la région (intérieur/extérieur, ≥/≤, plus proche de A ou de B, petit ou grand secteur), le
 *   bord inclus ou exclu et, pour un demi-plan, Re ou Im (droite verticale ou horizontale) sont
 *   retirés à chaque série — tirés 1 fois sur 2 avant la boucle de rejet. Fréquences (tirage par
 *   variante) : 1 pour les quatre variantes simples, 1/2 pour chaque sous-type d'intersection.
 * - Cas particulier « origine » (variantes à une condition) : la condition est centrée en O —
 *   |z| ≤ r, Re(z) ≥ k, |z − a| < |z|, arg z —, la lecture des éléments est immédiate. Ce n'est pas
 *   un verdict. Tiré 1 fois sur 6, avant la boucle de rejet.
 * - Pas de `calcul` : toutes les instances sont exactes (données entières, angles multiples de π/4).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceRegions } from "../../core6e/regionsPlanComplexe.types";
import { conditionEnO } from "../../moteur6e/modeleRegionsPlanComplexe";

export const LIBELLE_CAS_REGIONS = "Inclure un cas particulier (condition centrée en O : |z| ≤ r, Re(z) ≥ k, |z − a| < |z| ou arg z)";

export function profilRegions(e: ExerciceRegions): ProfilInstance {
  if (e.variante === "intersection") return { casParticulier: null, forme: `intersection-${e.sousType}` };
  return { casParticulier: conditionEnO(e.conditions[0]) ? "origine" : null, forme: e.variante };
}
