import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceDeplacementsSuccessifs } from "../../core/deplacementsSuccessifs.types";
import { estDiagonale, surUnAxe } from "../../moteur/modeleDeplacementsSuccessifs";
import { varianteDe } from "./index";

/**
 * Profil d'instance de gen86 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà la situation et le type de question (retour, dernier déplacement, grand
 *   pas répété), donc le nombre d'écrans.
 * - `forme` = situation + question + nombre de déplacements + présence d'un pas en diagonale (carte
 *   au trésor), ex. « tresor-retour:n4:diag ». Seuls les nombres et les directions changent entre
 *   les séries. Mesure (≥ 5 000 tirages par variante, voir le rapport du commit) : chaque forme
 *   complète sort avec une fréquence d'au moins 10 % de sa variante — des milliers de
 *   correspondances attendues en 20 000 essais, aucune bride nécessaire.
 * - `calcul` : 'exacte' si la distance est demandée en valeur exacte (racine), 'calculatrice' si
 *   elle est demandée arrondie (racine irrationnelle à évaluer).
 * - Cas particulier « sur-un-axe » : le vecteur dont on demande la norme (retour ou dernier
 *   déplacement) est porté par un axe — la distance se lit directement, sans Pythagore. Toujours
 *   exact : pas de `calcul` sur ce profil. Jamais pour le grand pas répété.
 */
export const LIBELLE_CAS_DEPLACEMENTS_SUCCESSIFS = "Inclure un cas particulier (arrivée sur un axe : distance entière lue directement)";

export function formeDeplacementsSuccessifs(e: ExerciceDeplacementsSuccessifs): string {
  const diag = e.deplacements.some((d) => estDiagonale(d.direction));
  return `${varianteDe(e)}:n${e.deplacements.length}:${diag ? "diag" : "axes"}`;
}

export function profilDeplacementsSuccessifs(e: ExerciceDeplacementsSuccessifs): ProfilInstance {
  if (surUnAxe(e)) return { casParticulier: "sur-un-axe", forme: formeDeplacementsSuccessifs(e) };
  return { casParticulier: null, calcul: e.precision === "exacte" ? "exacte" : "calculatrice", forme: formeDeplacementsSuccessifs(e) };
}
