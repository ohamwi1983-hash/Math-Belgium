import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceConstruireSomme } from "../../core/construireSomme.types";

/**
 * Profil d'instance de gen83 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe déjà le type de question (somme, différence, combinaison, point, lecture).
 * - `forme` fixe ce qui change la longueur ou le piège, identique d'une série à l'autre :
 *   la méthode tirée (triangle / parallélogramme, opposé / origine commune, relation AM / MA), les
 *   signes des deux coefficients (« +- »…) et la présence d'un coefficient demi-entier (« d ») pour
 *   la combinaison et le point ; pour la lecture, le nombre de composantes négatives (0 à 4).
 *   Seuls les vecteurs et les points changent entre les séries.
 * - Cas particulier = vecteurs COLINÉAIRES (somme, différence, combinaison) : toute la construction
 *   reste sur une même droite, plus courte à mener. Par défaut une évaluation n'en tire pas.
 * - `calcul` absent : tout se construit sur le quadrillage, sans calculatrice.
 */
export const LIBELLE_CAS_CONSTRUIRE_SOMME = "Inclure un cas particulier (vecteurs colinéaires : toute la construction reste sur une même droite)";

function signe(k: number): string {
  return k < 0 ? "-" : "+";
}

export function formeConstruireSomme(e: ExerciceConstruireSomme): string {
  switch (e.variante) {
    case "somme":
    case "difference":
      return `${e.variante}:${e.methode}`;
    case "combinaison":
    case "point": {
      const demi = !Number.isInteger(e.k) || !Number.isInteger(e.l) ? "d" : "e";
      return `${e.variante}:${e.methode}:${signe(e.k)}${signe(e.l)}:${demi}`;
    }
    case "lecture": {
      const negatives = [e.u.x, e.u.y, e.v.x, e.v.y].filter((c) => c < 0).length;
      return `lecture:n${negatives}`;
    }
  }
}

export function profilConstruireSomme(e: ExerciceConstruireSomme): ProfilInstance {
  return { casParticulier: e.colineaires ? "colineaires" : null, forme: formeConstruireSomme(e) };
}
