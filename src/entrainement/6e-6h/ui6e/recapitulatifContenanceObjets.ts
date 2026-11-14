import type { EtatSessionContenance, PhaseContenance } from "../moteur6e/typesContenanceObjets";
import { PHASES_CONTENANCE } from "../moteur6e/typesContenanceObjets";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase } from "./formatContenanceObjets";

/** Récapitulatif des écrans déjà clos (réponses CORRECTES connues de l'exercice, jamais la saisie). */
export function calculerRecapitulatifContenance(etat: EtatSessionContenance): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const precedentes = PHASES_CONTENANCE.slice(0, PHASES_CONTENANCE.indexOf(etat.phase));
  return precedentes.map((phase: PhaseContenance) => {
    const valeurs = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: libellePhase(e, phase), estLatex: true, valeur: valeurs.join(" \\quad "), valeurs, revele: etat.revelesPartiels[phase] ?? false };
  });
}

/** Une puce par écran. */
export function calculerSegmentsProgressionContenance(etat: EtatSessionContenance) {
  return PHASES_CONTENANCE.map((phase) => {
    const revele = etat.revelesPartiels[phase];
    if (revele === undefined) return phase === etat.phase ? ("courante" as const) : ("a-venir" as const);
    if (revele) return "revele" as const;
    return etat.aidePartiels[phase] ? ("aide" as const) : ("correcte" as const);
  });
}
