import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import { quadrant, type ExerciceAnglesRadians } from "../../moteur5e/modeleAnglesRadians";

/**
 * Profil d'instance de 5gen51 (tirage équilibré), même principe que gen122 (4e) :
 * - `forme` = la variante (retirer ou ajouter des tours) : la série B garde le sens de la série A ;
 * - cas particulier = M dans le premier quadrant (3/16 des tirages) : aucun signe à chercher, l'angle
 *   réduit est son propre angle de référence — la lecture se raccourcit ;
 * - un angle sur un axe n'est PAS un cas particulier : « sur un axe » est un verdict de l'écran 2 et
 *   « tan θ n'existe pas » un verdict de l'écran 4 (décision de l'utilisateur : un verdict n'est
 *   jamais un cas particulier) ;
 * - `calcul: 'exacte'` (revue des profils, 24/11/2026) : la consigne finit par « donne les valeurs
 *   exactes de cos θ, sin θ et tan θ », que la calculatrice donne directement (comme cos 210°) — jamais
 *   tiré « calculatrice autorisée ».
 */
export function profilAnglesRadians(e: ExerciceAnglesRadians): ProfilInstance {
  return { casParticulier: quadrant(e) === "I" ? "quadrant-I" : null, calcul: "exacte", forme: e.variante };
}

export const LIBELLE_CAS_ANGLES_RADIANS = "Inclure un cas particulier (point image dans le premier quadrant : aucun signe à chercher)";
