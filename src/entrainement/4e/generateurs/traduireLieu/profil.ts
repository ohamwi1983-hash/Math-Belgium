import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceTraduireLieu } from "../../core/traduireLieu.types";
import { parametresParabole } from "../../ui/formatTraduireLieu";

/**
 * Profil d'instance de gen131 (tirage équilibré des évaluations).
 * - `forme` = la variante, plus ce qui change le nombre ou le type d'étapes : deux parallèles écrites
 *   avec les mêmes coefficients ou d₂ multipliée (étape « ramener ») ; parabole d'axe vertical ou
 *   horizontal, p positif ou négatif (piège du signe).
 * - Cas particulier `parallele-axe` : la droite d (distance-droite) ou les deux parallèles sont
 *   horizontales ou verticales — la distance se lit comme un écart de coordonnées (raccourci du § 6),
 *   un écran de moins pour la distance. Ce n'est jamais un verdict : la nature du lieu est fixée par
 *   la phrase de l'énoncé, l'élève construit l'équation.
 * - Pas de `calcul` : tout est exact.
 */
export function profilTraduireLieu(e: ExerciceTraduireLieu): ProfilInstance {
  switch (e.variante) {
    case "distance-droite":
      return { casParticulier: e.type === "oblique" ? null : "parallele-axe", forme: e.variante };
    case "deux-paralleles":
      return { casParticulier: e.a === 0 || e.b === 0 ? "parallele-axe" : null, forme: `${e.variante}|${e.k === 1 ? "memes" : "multipliee"}` };
    case "parabole":
      return { casParticulier: null, forme: `${e.variante}|${e.axe}|${parametresParabole(e).p < 0 ? "negatif" : "positif"}` };
    default:
      return { casParticulier: null, forme: e.variante };
  }
}

export const LIBELLE_CAS_PARTICULIER = "Droite(s) parallèle(s) à un axe (distance lue comme un écart de coordonnées)";
