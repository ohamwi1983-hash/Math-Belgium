import { nombreEtapesAlgebriques } from "../moteur6e/typesProprietesLogarithme";
import type { EtatSessionProprietesLogarithme } from "../moteur6e/typesProprietesLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libellePhase, formatReponseAttenduePhaseLatex } from "./formatProprietesLogarithme";

/**
 * `6gen13`, REFONTE TOTALE — `etat.scoresPartiels` est maintenant un TABLEAU (un score par écran
 * déjà clos, dans l'ordre), jamais un champ unique ni un dict par nom de phase : une entrée de
 * récapitulatif par écran déjà traversé. Même patron que `recapitulatifExponentiellesProblemes.ts`
 * (6gen12), adapté d'une séquence par famille FIXE à une séquence par EXERCICE (dépend de la
 * combinaison tirée, voir `nombreEtapesAlgebriques`).
 */
export function calculerRecapitulatifProprietesLogarithme(etat: EtatSessionProprietesLogarithme): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  return etat.scoresPartiels.map((_score, phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(exercice, phase);
    return { libelle: libellePhase(exercice, phase), estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele: etat.revelesPartiels[phase] };
  });
}

/** Une puce par écran RÉELLEMENT prévu pour l'exercice courant (nombre variable, voir
 * `moteur6e/typesProprietesLogarithme.ts::nombreEtapesAlgebriques`), jamais une séquence fixe commune. */
export function calculerSegmentsProgressionProprietesLogarithme(etat: EtatSessionProprietesLogarithme) {
  const total = nombreEtapesAlgebriques(etat.exerciceCourant);
  return Array.from({ length: total }, (_, i) => {
    if (i === etat.phase) return "courante" as const;
    if (i > etat.phase) return "a-venir" as const;
    return etat.revelesPartiels[i] ? ("revele" as const) : ("correcte" as const);
  });
}
