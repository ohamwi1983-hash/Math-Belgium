import type { ProfilInstance } from "../../../export/genererFeuilleExercices";
import type { ExerciceAireTriangleSinus } from "../../core/aireTriangleSinus.types";
import { angleCle, calculExact, demiPerimetre } from "../../moteur/modeleAireTriangleSinus";

/**
 * Profil d'instance de gen75 pour le TIRAGE ÉQUILIBRÉ des évaluations (`.claude/rules/
 * feuilles-evaluations.md`, « Tirage équilibré »).
 *
 * - La VARIANTE fixe la famille (aire, angle, côté, quadrilatère, Héron), donc le nombre et le type
 *   d'écrans.
 * - `forme` = la famille, plus ce qui allonge la résolution : quadrilatère avec angle ABC obtus ou
 *   aigu (signe du cosinus dans Al-Kashi) ; Héron avec un demi-périmètre entier ou non.
 * - Cas particulier = un ANGLE DROIT là où l'angle porte le sinus (sin 90° = 1 : le calcul se
 *   raccourcit ; famille `angle` : une seule amplitude, décision de l'utilisateur — les deux
 *   amplitudes sont la règle). Par défaut une évaluation n'en tire pas ; la case du panneau en
 *   met un, le même pour toutes les séries.
 * - `calcul` (absent pour un angle droit, voir plus bas) : 'exacte' quand l'angle est remarquable
 *   et l'aire de la forme k, k√2 ou k√3 (familles aire, angle, côté), ou quand l'aire de Héron est
 *   entière ; sinon 'calculatrice'. Le quadrilatère exige toujours la calculatrice (diagonale
 *   irrationnelle) : `calculatriceIndispensable: ["quadrilatere"]`.
 *
 * Mesures (20 000 tirages par variante) — aire, angle, côté : calculatrice ≈ 50 %, exacte ≈ 38 %,
 * angle droit ≈ 12 % ; quadrilatère : obtus ≈ 51 %, aigu ≈ 37 %, angle droit ≈ 12 % ; Héron :
 * p entier exacte ≈ 39 %, p entier calculatrice ≈ 31 %, p demi-entier ≈ 30 %. La combinaison
 * (forme, calcul, cas) la plus rare est attendue ≈ 2 300 fois en 20 000 essais : aucune bride.
 */
export const LIBELLE_CAS_AIRE_TRIANGLE = "Inclure un cas particulier (angle droit : sin 90° = 1)";

export function formeAireTriangleSinus(e: ExerciceAireTriangleSinus): string {
  if (e.famille === "quadrilatere") return `quadrilatere:${e.angleB > 90 ? "obtus" : "aigu"}`;
  if (e.famille === "heron") return `heron:${Number.isInteger(demiPerimetre(e)) ? "p-entier" : "p-demi"}`;
  return e.famille;
}

export function profilAireTriangleSinus(e: ExerciceAireTriangleSinus): ProfilInstance {
  const droit = angleCle(e) === 90;
  return {
    casParticulier: droit ? "angle-droit" : null,
    // Angle droit : `calcul` absent (sans objet), comme gen14–gen18 — sinon le cas coché serait
    // perdu dès que le professeur autorise la calculatrice (palier de repli « exercice complet »).
    calcul: droit ? undefined : calculExact(e) ? "exacte" : "calculatrice",
    forme: formeAireTriangleSinus(e),
  };
}
