import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionEchelles } from "../moteur6e/typesEchellesLogarithmiques";
import { PHASES_ECHELLES } from "../moteur6e/typesEchellesLogarithmiques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatEchellesLogarithmiques";

/** « Ce qu'on sait déjà » de `6gen90` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifEchelles(etat: EtatSessionEchelles): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = PHASES_ECHELLES.indexOf(etat.phase);
  return PHASES_ECHELLES.slice(0, index).map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: LIBELLE_PHASE[phase], valeur: valeurs.join(" "), estLatex: true, revele: etat.revelesPartiels[phase] ?? false, valeurs };
  });
}

/** Une puce par écran (chaîne fixe de 3). */
export function calculerSegmentsProgressionEchelles(etat: EtatSessionEchelles): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_ECHELLES.length : PHASES_ECHELLES.indexOf(etat.phase);
  return PHASES_ECHELLES.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
