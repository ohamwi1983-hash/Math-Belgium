import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { phasesPourExercice } from "../moteur6e/typesGrandsNombresLog";
import type { EtatSessionGrandsNombres } from "../moteur6e/typesGrandsNombresLog";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libellePhase, reponseRecap } from "./formatGrandsNombresLog";

/** « Ce qu'on sait déjà » de `6gen92` : valeurs confirmées des écrans clos, jamais la saisie de l'élève. */
export function calculerRecapitulatifGrandsNombres(etat: EtatSessionGrandsNombres): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    const r = reponseRecap(e, phase);
    if ("texte" in r) return { libelle: libellePhase(phase), valeur: r.texte, estLatex: false, revele };
    return { libelle: libellePhase(phase), valeur: "", estLatex: true, revele, valeurs: r.latex.map((x, i) => (i < r.latex.length - 1 ? `${x}\;;` : x)) };
  });
}

/** Une puce par écran. */
export function calculerSegmentsProgressionGrandsNombres(etat: EtatSessionGrandsNombres, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
