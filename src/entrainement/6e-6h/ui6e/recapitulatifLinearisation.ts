import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { estPhaseChoix, phasesPourExercice } from "../moteur6e/typesLinearisation";
import type { EtatSessionLinearisation } from "../moteur6e/typesLinearisation";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase, reponseChoix } from "./formatLinearisation";

/**
 * « Ce qu'on sait déjà » de `6gen89` : valeurs confirmées des écrans clos (la représentation juste
 * pour le choix), jamais la saisie de l'élève.
 */
export function calculerRecapitulatifLinearisation(etat: EtatSessionLinearisation): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.slice(0, index).map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    if (estPhaseChoix(phase)) {
      const fr = reponseChoix(e);
      // Texte brut : les symboles LaTeX de l'option (ln(y), x) sont repris tels quels en Unicode.
      const texte = fr.map((f) => (f.type === "texte" ? f.valeur : f.valeur.replace(/\\ln\((.*?)\)/g, "ln($1)"))).join("");
      return { libelle: libellePhase(e, phase), valeur: texte, estLatex: false, revele };
    }
    const formules = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: libellePhase(e, phase), valeur: "", estLatex: true, revele, valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\;;` : x)) };
  });
}

/** Une puce par écran. */
export function calculerSegmentsProgressionLinearisation(etat: EtatSessionLinearisation, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
