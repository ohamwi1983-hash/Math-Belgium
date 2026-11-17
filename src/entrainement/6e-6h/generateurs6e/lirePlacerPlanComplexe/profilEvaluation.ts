/**
 * Profil d'instance de `6gen95` « Lire et placer dans le plan complexe » pour le TIRAGE ÉQUILIBRÉ des
 * évaluations (`.claude/rules/feuilles-evaluations.md`).
 *
 * - `forme` = la VARIANTE (famille d'opérations : symétries, rotation/homothétie, translations),
 *   c'est-à-dire le type des opérations demandées et le nombre de points à lire (1 ou 2). Les deux
 *   opérations PRÉCISES sont retirées dans la famille à chaque série : la transformation à nommer
 *   (choix fermé de l'écran « associer ») n'est jamais figée d'une série à l'autre — ce que l'élève
 *   doit décider n'entre pas dans `forme` (leçon du chantier). Une seule forme par variante :
 *   probabilité 1/3 en tirage libre, aucune bride nécessaire.
 * - Cas particulier « axe » : le point C est sur un axe (module entier lu directement, argument
 *   0, π/2, π ou −π/2) — il RACCOURCIT la dernière étape ; sinon C est sur une diagonale du
 *   quadrillage (module k√2 à simplifier, argument ±π/4 ou ±3π/4 selon le quadrant). Ce n'est pas
 *   un verdict (rien à décider). Tiré 1 fois sur 4, avant la boucle de rejet (mesuré : 24 à 26 % sur
 *   5 000 tirages par variante).
 * - Pas de `calcul` : toutes les instances sont exactes (coordonnées entières, √2, multiples de π/4).
 */
import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceLirePlacer } from "../../core6e/lirePlacerPlanComplexe.types";
import { cSurAxe } from "../../moteur6e/modeleLirePlacerPlanComplexe";

export const LIBELLE_CAS_LIRE_PLACER = "Point C sur un axe (module entier, argument immédiat)";

export function profilLirePlacer(e: ExerciceLirePlacer): ProfilInstance {
  return { casParticulier: cSurAxe(e.c) ? "axe" : null, forme: e.variante };
}
