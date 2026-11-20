import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceAssocierCourbes } from "../../moteur5e/modeleAssocierCourbes";

/**
 * Profil d'instance de 5gen53 (tirage équilibré) : `forme` = la variante (le paramètre piège commun
 * aux quatre expressions) ; l'association (ordre des courbes) est le verdict, tiré au hasard dans
 * chaque série — le nom de la variante ne la donne jamais, pas de groupe à verdict. Aucun cas
 * particulier, pas de `calcul` (lecture graphique exacte).
 */
export function profilAssocierCourbes(e: ExerciceAssocierCourbes): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
