import type { EtatSessionRelationsDroites } from "../moteur/typesRelationsDroites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelVecteur2Latex, formatEtatActuelVecteurChercheLatex, formatEtatActuelVecteurReferenceLatex } from "./formatRelationsDroites";

/**
 * Récapitulatif "Ce qu'on sait déjà" — séquence TOUJOURS linéaire et fixe par famille, sans aucun
 * saut conditionnel (`SEQUENCES_RELATIONS_DROITES`, `typesRelationsDroites.ts`) : écran 1 clos →
 * vecteur de d (ou d₁) ; écran 2 clos → vecteur de d′ (construction) ou de d₂ (reconnaissance).
 * Toujours dérivé de `exercice` lui-même (jamais de la saisie de l'élève). `\displaystyle` : sans
 * lui, KaTeX compresse les vecteurs colonnes de la ligne inline à 13px (`.recap-item`).
 */
export function calculerRecapitulatifRelationsDroites(etat: EtatSessionRelationsDroites): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const reconnaissance = exercice.famille === "reconnaissance";
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreExtractionExercice !== null) {
    entrees.push({
      libelle: reconnaissance ? "Vecteur directeur de d₁" : "Vecteur directeur de d",
      estLatex: true,
      valeur: `\\displaystyle ${formatEtatActuelVecteurReferenceLatex(exercice)}`,
      revele: etat.extractionRevele,
    });
  }

  if (etat.scoreConstructionExercice !== null) {
    entrees.push({
      libelle: reconnaissance ? "Vecteur directeur de d₂" : "Point et vecteur directeur de d′",
      estLatex: true,
      valeur: `\\displaystyle ${reconnaissance ? formatEtatActuelVecteur2Latex(exercice) : formatEtatActuelVecteurChercheLatex(exercice)}`,
      revele: etat.constructionRevele,
    });
  }

  return entrees;
}
