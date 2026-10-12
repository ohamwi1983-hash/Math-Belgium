import type { EtatSessionProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatProprietesLogarithme";

/**
 * `6gen13` — `LIBELLE_PHASE` ET `formatReponseAttenduePhaseLatex` existent sous ces noms exacts
 * standards (vérifié par lecture directe), MAIS le score de l'écran 1 est tracké via le champ
 * UNIQUE `scoreEcran1Partiel` (`number | null`), jamais un dict `scoresPartiels` — normal, un seul
 * écran à mémoriser avant le final (2 écrans fixes au total). Au plus 1 entrée possible, affichée
 * dès que la phase "ecran2" est atteinte.
 */
export function calculerRecapitulatifProprietesLogarithme(etat: EtatSessionProprietesLogarithme): EntreeRecapitulatif[] {
  if (etat.phase !== "ecran2" || etat.scoreEcran1Partiel === null) return [];
  const valeurs = formatReponseAttenduePhaseLatex(etat.exerciceCourant, "ecran1");
  return [{ libelle: LIBELLE_PHASE.ecran1, estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele: etat.scoreEcran1Partiel === 0 }];
}

export function calculerSegmentsProgressionProprietesLogarithme(etat: EtatSessionProprietesLogarithme) {
  const segmentEcran1 =
    etat.phase === "ecran1" ? ("courante" as const) : etat.scoreEcran1Partiel === 0 ? ("revele" as const) : ("correcte" as const);
  return [segmentEcran1, etat.phase === "ecran2" ? ("courante" as const) : ("a-venir" as const)];
}
