import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceAssocierParaboles } from "../../core/associerParaboles.types";

/**
 * Profil d'instance de gen128 (tirage équilibré, même principe que 5gen53) : `forme` = la variante
 * (paramètre piège commun aux quatre équations) ; l'ASSOCIATION courbe ↔ équation est le verdict,
 * tirée au hasard dans chaque série. Le nom d'une variante dit quel paramètre piège change, jamais
 * quelle courbe va avec quelle équation : aucun groupe à verdict. Aucun cas particulier, pas de
 * `calcul` (tout est entier).
 */
export function profilAssocierParaboles(e: ExerciceAssocierParaboles): ProfilInstance {
  return { casParticulier: null, forme: e.variante };
}
