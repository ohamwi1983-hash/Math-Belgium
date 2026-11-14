import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionIntegraleGraphique } from "../moteur6e/typesIntegraleGraphique";
import { PHASES_INTEGRALE_GRAPHIQUE } from "../moteur6e/typesIntegraleGraphique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatReponseAttenduePhaseLatex, libellePhase } from "./formatIntegraleGraphique";

/** « Ce qu'on sait déjà » de `6gen77` : valeurs confirmées des écrans clos (mêmes fonctions que la
 * validation et le corrigé). */
export function calculerRecapitulatifIntegraleGraphique(etat: EtatSessionIntegraleGraphique): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = PHASES_INTEGRALE_GRAPHIQUE.indexOf(etat.phase);
  return PHASES_INTEGRALE_GRAPHIQUE.slice(0, index).map((phase) => {
    const formules = formatReponseAttenduePhaseLatex(e, phase);
    return {
      libelle: libellePhase(e, phase),
      valeur: "",
      estLatex: true,
      revele: etat.revelesPartiels[phase] ?? false,
      valeurs: formules.map((x, i) => (i < formules.length - 1 ? `${x}\\;;` : x)),
    };
  });
}

export function calculerSegmentsProgressionIntegraleGraphique(etat: EtatSessionIntegraleGraphique, aideParPhase: Partial<Record<string, boolean>>): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_INTEGRALE_GRAPHIQUE.length : PHASES_INTEGRALE_GRAPHIQUE.indexOf(etat.phase);
  return PHASES_INTEGRALE_GRAPHIQUE.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return aideParPhase[phase] ? "aide" : "correcte";
  });
}
