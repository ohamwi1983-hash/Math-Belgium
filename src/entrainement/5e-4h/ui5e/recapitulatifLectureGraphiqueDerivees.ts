import { formatTermesParEcran, LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES } from "./formatLectureGraphiqueDerivees";
import type { EtatSessionLectureGraphiqueDerivees } from "../moteur5e/typesLectureGraphiqueDerivees";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen30 — une entrée par écran déjà clos (les écrans sans
 * objet n'apparaissent pas), avec la réponse ATTENDUE de cet écran (même formateur que la validation).
 * Icône ✓/✗ pilotée par `etat.revelesPartiels[écran]`.
 */
export function calculerRecapitulatifLectureGraphiqueDerivees(etat: EtatSessionLectureGraphiqueDerivees): EntreeRecapitulatif[] {
  return formatTermesParEcran(etat.exerciceCourant, etat.terminee ? "termine" : etat.phase).map(({ ecran, termes }) => ({
    libelle: LIBELLE_ECRAN_LECTURE_GRAPHIQUE_DERIVEES[ecran],
    estLatex: true,
    valeur: termes.join(" \\quad "),
    ...(termes.length > 1 ? { valeurs: termes } : {}),
    revele: etat.revelesPartiels[ecran] ?? false,
  }));
}
