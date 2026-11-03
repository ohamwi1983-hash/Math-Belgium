import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionGraphiqueDeriveeLogarithme } from "../moteur6e/typesGraphiqueDeriveeLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";

const LETTRES = "ABCD";

/** Lettre du graphique correct (A→D, position dans `candidats`). */
export function lettreGraphiqueCorrect(etat: EtatSessionGraphiqueDeriveeLogarithme): string {
  return LETTRES[etat.exerciceCourant.indexCorrect] ?? String(etat.exerciceCourant.indexCorrect + 1);
}

/**
 * Récapitulatif MINIMAL pour `6gen20` — séquence FIXE "selection" → "derivee" : au plus 1 entrée
 * (le graphique de f' confirmé), affichée dès que la phase "derivee" est atteinte.
 */
export function calculerRecapitulatifGraphiqueDeriveeLogarithme(etat: EtatSessionGraphiqueDeriveeLogarithme): EntreeRecapitulatif[] {
  if (etat.phase !== "derivee" || etat.scoreSelectionPartiel === null) return [];
  return [{ libelle: "Graphique de f'", estLatex: false, valeur: `graphique ${lettreGraphiqueCorrect(etat)}`, revele: etat.selectionRevele }];
}

/** Puces pour `6gen20` : toujours 2 puces ("selection" puis "derivee"), séquence fixe. */
export function calculerSegmentsProgressionGraphiqueDeriveeLogarithme(etat: EtatSessionGraphiqueDeriveeLogarithme): EtatPuceProgression[] {
  const segmentSelection: EtatPuceProgression =
    etat.phase === "selection"
      ? "courante"
      : etat.selectionRevele
        ? "revele"
        : etat.selectionNiveauAide !== null && etat.selectionNiveauAide > 0
          ? "aide"
          : "correcte";
  return [segmentSelection, etat.phase === "derivee" ? "courante" : "a-venir"];
}
