import type { EtatSessionFonctionReference } from "../moteur/typesFonctionsReference";
import { libelleFamille } from "./famillesReferenceLabels";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif affiché sur l'écran "exercice" (spec section 0 : "réutilise... le récapitulatif
 * persistant") — même principe que recapitulatif.ts (exercice 1) : s'appuie uniquement sur
 * `scoreReconnaissanceExercice !== null` (déjà tracké par le moteur), affiche toujours la vraie
 * famille (`exerciceCourant.famille`, jamais la saisie erronée de l'élève), vide sur l'écran de
 * reconnaissance lui-même (qui n'a rien à récapituler).
 */
export function calculerRecapitulatifFonctionReference(etat: EtatSessionFonctionReference): EntreeRecapitulatif[] {
  if (etat.scoreReconnaissanceExercice === null) return [];
  return [{ libelle: "Famille", estLatex: false, valeur: libelleFamille(etat.exerciceCourant.famille) }];
}
