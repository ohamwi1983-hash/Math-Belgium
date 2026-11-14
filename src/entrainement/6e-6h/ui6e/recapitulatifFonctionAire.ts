import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import { candidatsExtremums, natureEn } from "../moteur6e/modeleFonctionAire";
import { phasesPourExercice } from "../moteur6e/typesFonctionAire";
import type { EtatSessionFonctionAire } from "../moteur6e/typesFonctionAire";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleNature, libellePhase, nombreTexte, reponseAttendue } from "./formatFonctionAire";

/**
 * « Ce qu'on sait déjà » de `6gen78` : réponses confirmées des écrans clos (formules LaTeX ; la
 * nature des abscisses candidates, qui est du texte, en texte brut).
 */
export function calculerRecapitulatifFonctionAire(etat: EtatSessionFonctionAire): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const phases = phasesPourExercice(e);
  const index = phases.indexOf(etat.phase);
  return phases.slice(0, Math.max(0, index)).map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    if (phase === "nature") {
      const valeur = candidatsExtremums(e)
        .map((x) => `x = ${nombreTexte(x)} : ${libelleNature(natureEn(e, x))}`)
        .join(" ; ");
      return { libelle: libellePhase(e, phase), valeur, estLatex: false, revele };
    }
    const formules = reponseAttendue(e, phase)
      .filter((f) => f.type === "latex")
      .map((f) => f.valeur);
    return { libelle: libellePhase(e, phase), valeur: "", estLatex: true, revele, valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\;;` : x)) };
  });
}

export function calculerSegmentsProgressionFonctionAire(etat: EtatSessionFonctionAire, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const phases = phasesPourExercice(etat.exerciceCourant);
  const index = etat.terminee ? phases.length : phases.indexOf(etat.phase);
  return phases.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
