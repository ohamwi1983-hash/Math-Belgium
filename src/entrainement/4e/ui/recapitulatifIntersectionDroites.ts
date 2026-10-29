import type { EtatSessionIntersectionDroites } from "../moteur/typesIntersectionDroites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_CONCLUSION } from "./formatIntersectionDroites";

/**
 * Récapitulatif "Ce qu'on sait déjà" de "Intersection entre deux droites" (audit chapitre 7, point
 * 8 — l'écran du point d'intersection n'en avait pas). Une seule entrée possible : la position
 * relative CONFIRMÉE, dès que le diagnostic est clos (`scoreDiagnosticExercice !== null`) — toujours
 * la vraie conclusion de l'exercice, jamais le choix de l'élève.
 */
export function calculerRecapitulatifIntersectionDroites(etat: EtatSessionIntersectionDroites): EntreeRecapitulatif[] {
  if (etat.scoreDiagnosticExercice === null) return [];
  return [
    {
      libelle: "Position relative",
      estLatex: false,
      valeur: LIBELLE_CONCLUSION[etat.exerciceCourant.conclusion],
      revele: etat.diagnosticRevele,
    },
  ];
}
