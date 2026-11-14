import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionAccumulerGrandeur } from "../moteur6e/typesAccumulerGrandeur";
import { PHASES_ACCUMULER_GRANDEUR } from "../moteur6e/typesAccumulerGrandeur";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatReponseAttenduePhaseLatex } from "./formatAccumulerGrandeur";

/** « Ce qu'on sait déjà » de `6gen80` : la réponse confirmée de chaque écran déjà clos. */
export function calculerRecapitulatifAccumulerGrandeur(etat: EtatSessionAccumulerGrandeur): EntreeRecapitulatif[] {
  const e = etat.exerciceCourant;
  const index = PHASES_ACCUMULER_GRANDEUR.indexOf(etat.phase);
  return PHASES_ACCUMULER_GRANDEUR.slice(0, index).map((phase) => {
    const valeurs = formatReponseAttenduePhaseLatex(e, phase);
    return { libelle: LIBELLE_PHASE[phase], valeur: valeurs.join(" "), estLatex: true, revele: etat.revelesPartiels[phase] ?? false, valeurs };
  });
}

/** Une puce par écran (chaîne fixe de 5). */
export function calculerSegmentsProgressionAccumulerGrandeur(etat: EtatSessionAccumulerGrandeur): EtatPuceProgression[] {
  const index = etat.terminee ? PHASES_ACCUMULER_GRANDEUR.length : PHASES_ACCUMULER_GRANDEUR.indexOf(etat.phase);
  return PHASES_ACCUMULER_GRANDEUR.map((phase, i) => {
    if (i > index) return "a-venir";
    if (i === index) return "courante";
    if (etat.revelesPartiels[phase]) return "revele";
    return etat.aidePartiels[phase] ? "aide" : "correcte";
  });
}
