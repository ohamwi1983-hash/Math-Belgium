import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionFormesReelles } from "../moteur6e/sessionAiresFormesReelles";
import { phasesExercice } from "../moteur6e/modeleAiresFormesReelles";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase } from "./formatAiresFormesReelles";

/**
 * « Ce qu'on sait déjà » de `6gen81` : valeurs confirmées des écrans clos (réponses du modèle de
 * corrigé — pour l'écran « modèle », le repère du corrigé, signalé dans le libellé, quel que soit
 * celui choisi par l'élève).
 */
export function calculerRecapitulatifFormesReelles(etat: EtatSessionFormesReelles): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesExercice(e);
  const fin = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, fin).map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(e, phase);
    const libre = phase === "modeliser" && e.modele === "retrouver" && e.situation !== "parcelle";
    return {
      libelle: libre ? `${libellePhase(e, phase)} (${e.situation === "mur" || e.situation === "section" ? (e.repere === "pied" ? "origine au pied gauche" : "origine au milieu") : ""})` : libellePhase(e, phase),
      valeur: "",
      estLatex: true,
      revele: etat.revelesPartiels[phase] ?? false,
      valeurs: valeurs.map((x, i) => (i < valeurs.length - 1 ? `${x}\\;;` : x)),
    };
  });
}

export function calculerSegmentsProgressionFormesReelles(etat: EtatSessionFormesReelles): EtatPuceProgression[] {
  const phases = phasesExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
