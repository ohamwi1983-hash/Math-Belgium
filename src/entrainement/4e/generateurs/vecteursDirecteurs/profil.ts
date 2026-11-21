import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceVecteursDirecteurs } from "../../core/vecteursDirecteurs.types";

/**
 * Profil d'instance de gen129 (tirage équilibré).
 * - `forme` = la variante, plus le type du coefficient m de l'écran (c) (entier / fraction : une
 *   étape « sans fraction » de plus) ; variante horizontale-verticale : la variante seule.
 * - Le NOMBRE de vecteurs directeurs parmi les cinq de l'écran (b) (2 ou 3) est la réponse : tiré à
 *   pile ou face dans chaque série, jamais dans `forme`, jamais un cas particulier.
 * - Aucun cas particulier (rien ne raccourcit la résolution), pas de `calcul` : tout est exact.
 */
export function profilVecteursDirecteurs(e: ExerciceVecteursDirecteurs): ProfilInstance {
  if (e.g.type !== "affine") return { casParticulier: null, forme: e.variante };
  return { casParticulier: null, forme: `${e.variante}|${e.g.den === 1 ? "entier" : "fraction"}` };
}
