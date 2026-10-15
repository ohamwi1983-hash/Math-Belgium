import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionGraphiqueDeriveeLogarithme } from "../moteur6e/typesGraphiqueDeriveeLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatDeriveeCorrecteLatex } from "./formatGraphiqueDeriveeLogarithme";

/**
 * Récapitulatif MINIMAL pour `6gen20` — séquence FIXE "derivee" → "selection" (les 3 familles
 * A/B/C traversent TOUJOURS les 2 écrans, contrairement à `6gen8`) : au plus 1 entrée possible
 * ("derivee"), affichée dès que la phase "selection" est atteinte.
 */
export function calculerRecapitulatifGraphiqueDeriveeLogarithme(etat: EtatSessionGraphiqueDeriveeLogarithme): EntreeRecapitulatif[] {
  if (etat.phase !== "selection" || etat.scoreDeriveePartiel === null) return [];
  const valeur = formatDeriveeCorrecteLatex(etat.exerciceCourant);
  return [{ libelle: "Dérivée", estLatex: true, valeur, revele: etat.scoreDeriveePartiel === 0 }];
}

/** Puces pour `6gen20` : toujours 2 puces ("derivee" puis "selection"), séquence fixe. */
export function calculerSegmentsProgressionGraphiqueDeriveeLogarithme(etat: EtatSessionGraphiqueDeriveeLogarithme): EtatPuceProgression[] {
  const segmentDerivee: EtatPuceProgression =
    etat.phase === "derivee"
      ? "courante"
      : etat.scoreDeriveePartiel === 0
        ? "revele"
        : etat.deriveeNiveauAide !== null && etat.deriveeNiveauAide > 0
          ? "aide"
          : "correcte";
  return [segmentDerivee, etat.phase === "selection" ? "courante" : "a-venir"];
}
