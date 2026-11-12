/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 5gen34 (extrema en contexte borné) et 5gen35 (vitesse et position) — méthode
 * `.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ».
 *
 * Mesures (5 000 tirages par variante, `scratchpad/5c5-R4/mesures.txt`) :
 * - 5gen34 : aucune instance ne raccourcit la résolution (toujours 2 ou 3 extremums locaux, deux
 *   bornes informatives, mêmes 6 étapes) : aucun cas particulier. `forme` = le cas croisé (maximum
 *   absolu à un extremum local ou à une borne × idem pour le minimum), imposé d'une série à l'autre.
 *   `calcul` : une quartique (3 racines de f', Horner, valeurs jusqu'à quelques milliers) exige la
 *   calculatrice ; une cubique (f' du second degré, valeurs entières modestes) se traite à la main.
 *   Les variantes « max local — min à une borne » et « max à une borne — min local » sont TOUJOURS
 *   des quartiques (37 % des tirages libres ; 23 polynômes distincts à la constante près dans
 *   chacune de ces deux variantes, 24 en « max local — min local »).
 * - 5gen35 : la vitesse initiale nulle (« s'élance », « démarre ») ramène l'équation s(t) = D à
 *   t² = k, sans discriminant : paramètre au choix « vitesse initiale », présent dans les deux
 *   variantes. Le type de départ est tiré à 50/50 et TOUS les contextes ont les deux récits
 *   (« s'élance / démarre » ⇔ b = 0, « déjà lancé » ⇔ b > 0) : b = 0 dans 49 à 51 % des tirages
 *   de chaque contexte. `forme` = variante (A : une course ; B : deux segments). `calcul` : A toujours exact
 *   (racines entières, conversion × 3,6) ; B exact seulement si t₂ = D₂ / v tombe juste au dixième.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import { evalPoly } from "./extremaBornes/index";

/** Cas croisé réellement obtenu : où sont atteints le maximum et le minimum absolus. */
function casCroise(e: ExerciceExtremaBornes): string {
  const valeursLocales = e.racinesFPrime.map((t) => evalPoly(e.coeffs, t));
  const bornes = [evalPoly(e.coeffs, 0), evalPoly(e.coeffs, e.T)];
  const max = Math.max(...bornes) > Math.max(...valeursLocales) ? "borne" : "local";
  const min = Math.min(...bornes) < Math.min(...valeursLocales) ? "borne" : "local";
  return `max-${max}-min-${min}`;
}

export function profilExtremaBornes(e: ExerciceExtremaBornes): ProfilInstance {
  return { casParticulier: null, forme: casCroise(e), calcul: e.degre === 4 ? "calculatrice" : "exacte" };
}

/** Variantes de 5gen34 toujours quartiques (calculatrice indispensable). */
export const VARIANTES_CALCULATRICE_EXTREMA_BORNES = ["max-local-min-borne", "max-borne-min-local"] as const;

export const PARAMETRES_VITESSE_POSITION = [{ id: "sans-vitesse-initiale", label: "Vitesse initiale non nulle (mobile déjà lancé)" }];

function auDixieme(v: number): boolean {
  return Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
}

export function profilVitessePosition(e: ExerciceVitessePosition): ProfilInstance {
  const v = e.a * e.tCible + e.b;
  const calcul = e.variante === "A" || auDixieme(e.D2 / v) ? "exacte" : "calculatrice";
  return { casParticulier: e.b === 0 ? "sans-vitesse-initiale" : null, forme: e.variante, calcul };
}
