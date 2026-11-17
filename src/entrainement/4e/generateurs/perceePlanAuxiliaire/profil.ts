import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExercicePercee } from "../../core/perceePlanAuxiliaire.types";

/**
 * Profil d'instance de gen102 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - `forme` = la variante seule (nature du plan α : face, plan diagonal, plan par trois points).
 *   Ce que l'élève doit DÉCIDER — le plan auxiliaire, les deux points communs, le point de percée,
 *   et donc aussi le nombre de points à construire ou la position du point de percée (dans ou hors
 *   du solide) — n'entre jamais dans `forme` : ces caractéristiques restent tirées au hasard dans
 *   chaque série. Variété mesurée (rapport du générateur) : des centaines d'énoncés distincts par
 *   variante, et par variante × cas, donc deux séries n'ont jamais le même exercice.
 * - Cas particulier « directe » : d est dans une face du solide et cette face coupe α suivant une
 *   droite qui passe par deux points nommés (le plan auxiliaire est la face, sa droite commune avec
 *   α se lit directement : rien à construire). C'est ce qui RACCOURCIT la résolution — pas un
 *   verdict, il n'y a rien à décider de plus. Par défaut, une évaluation ne tire donc que des
 *   instances où d ne se trouve pas ainsi dans une face « commode ».
 * - Pas de `calcul` : aucun calcul numérique dans ce chapitre.
 */
export function profilPercee(e: ExercicePercee): ProfilInstance {
  return { casParticulier: e.directe ? "directe" : null, forme: e.variante };
}

export const LIBELLE_CAS_PARTICULIER_PERCEE = "Construction directe : la droite est dans une face, qui coupe le plan suivant une droite déjà tracée";
