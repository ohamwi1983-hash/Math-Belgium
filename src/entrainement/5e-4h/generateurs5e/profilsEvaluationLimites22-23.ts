/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`)
 * de 5gen22 (lecture graphique des limites et asymptotes) et 5gen23 (limites et asymptotes en
 * contexte) — méthode `.claude/rules/feuilles-evaluations.md`, section « Tirage équilibré ».
 *
 * Mesures (5 000 tirages par variante, `scratchpad/5c4-R2/mesures.txt`) :
 * - 5gen22 : la variante fixe déjà la structure (nombre d'AV, signes, comportement à l'infini, point
 *   isolé). Les seuls « cas » mesurables — asymptote horizontale y = 0, asymptote oblique passant par
 *   l'origine, asymptote verticale en x = 0 — ne RACCOURCISSENT pas la lecture (même travail pour
 *   lire y = 0 que y = 3) : aucun cas particulier. `forme` = la structure lue sur l'instance, pour
 *   qu'un tirage libre (sans variante) garde la même structure d'une série à l'autre. Valeurs entières
 *   lues sur un graphique : `calcul` sans objet.
 * - 5gen23 : aucun raccourci dans une famille (croissance ou régression, supérieur ou inférieur au
 *   seuil, sens de l'AV sont des VERDICTS : jamais filtrés). `calcul` : prix de revient et eau salée
 *   se résolvent à la main (limite entière lue sur la formule) ; club de loisirs exige toujours la
 *   calculatrice (second degré, conversions arrondies) ; population selon l'instance (f au centième
 *   faisable à la main dans 20 % des tirages).
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceLectureGraphiqueLimites } from "../core5e/lectureGraphiqueLimites.types";
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";

/** Structure d'un graphique de 5gen22, indépendante des nombres tirés. */
export function structureLectureGraphique(e: ExerciceLectureGraphiqueLimites): string {
  const vas = e.vas
    .map((va) =>
      va.pointIsoleGauche !== undefined || va.pointIsoleDroit !== undefined ? "point-isole" : va.signeGauche === va.signeDroit ? "identiques" : "opposes",
    )
    .sort()
    .join(",");
  const { infini } = e;
  const aLInfini =
    infini.type === "horizontale" ? (infini.limitePlusInfini === infini.limiteMoinsInfini ? "horizontale" : "horizontale-distincte") : infini.type;
  return `${e.vas.length}va[${vas}]-${aLInfini}`;
}

export function profilLectureGraphiqueLimites(e: ExerciceLectureGraphiqueLimites): ProfilInstance {
  return { casParticulier: null, forme: structureLectureGraphique(e) };
}

/** Famille de 5gen23 qui exige TOUJOURS la calculatrice (avertissement du panneau) : club de loisirs
 * (second degré à racines irrationnelles dans 99,7 % des tirages, conversions arrondies). */
export const FAMILLES_CALCULATRICE_LIMITES_CONTEXTE = ["clubLoisirs"] as const;

/** Population : f(x) = b + a/(x+p) s'évalue à la main quand a/(x+p) tombe juste au centième (20 % des
 * tirages, ex. 4/16 = 0,25) — calculatrice sinon. */
function populationExacte(e: Extract<ExerciceLimitesContexte, { famille: "population" }>): boolean {
  const v = (e.a / (e.anneeEval - e.anneeRef + e.p)) * 100;
  return Math.abs(v - Math.round(v)) < 1e-9;
}

export function profilLimitesContexte(e: ExerciceLimitesContexte): ProfilInstance {
  if (e.famille === "clubLoisirs") return { casParticulier: null, calcul: "calculatrice" };
  if (e.famille === "population") return { casParticulier: null, calcul: populationExacte(e) ? "exacte" : "calculatrice" };
  return { casParticulier: null, calcul: "exacte" };
}
