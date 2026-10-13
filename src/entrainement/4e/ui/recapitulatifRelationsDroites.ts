import type { EtatSessionRelationsDroites } from "../moteur/typesRelationsDroites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelVecteurChercheLatex, formatEtatActuelVecteurReferenceLatex } from "./formatRelationsDroites";

/**
 * Récapitulatif "Ce qu'on sait déjà" — séquence TOUJOURS linéaire et fixe, sans aucun saut
 * conditionnel (`extraction → construction → equation`, voir commentaire de
 * `PhaseRelationsDroites` dans `typesRelationsDroites.ts`). Réutilise TELLES QUELLES
 * `formatEtatActuelVecteurReferenceLatex`/`formatEtatActuelVecteurChercheLatex` (déjà écrites pour
 * l'ancien bloc "état actuel" des écrans "construction"/"equation"), toujours dérivées de
 * `exercice` lui-même (jamais de la saisie de l'élève).
 */
export function calculerRecapitulatifRelationsDroites(etat: EtatSessionRelationsDroites): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreExtractionExercice !== null) {
    entrees.push({
      libelle: "Vecteur de référence",
      estLatex: true,
      valeur: formatEtatActuelVecteurReferenceLatex(exercice),
      revele: etat.extractionRevele,
    });
  }

  if (etat.scoreConstructionExercice !== null) {
    entrees.push({
      libelle: "Point et vecteur cherchés",
      estLatex: true,
      valeur: formatEtatActuelVecteurChercheLatex(exercice),
      revele: etat.constructionRevele,
    });
  }

  return entrees;
}
