import type { EtatSessionTriangleQuelconque } from "../moteur/typesTriangleQuelconque";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { libelleDonneeManquante, valeurAffichageDonneeManquante } from "./formatTriangleQuelconque";

/**
 * Récapitulatif de "Triangle quelconque" — même principe que le reste du projet (dérivé uniquement
 * des scores déjà trackés par le moteur, jamais de la saisie de l'élève) : vide sur l'écran 1
 * (rien à récapituler, toujours la première étape), une entrée "Donnée retrouvée" une fois l'écran
 * 1 clos (`scoreDonneeManquanteExercice !== null`), toujours la vraie valeur confirmée du triangle.
 */
export function calculerRecapitulatifTriangleQuelconque(etat: EtatSessionTriangleQuelconque): EntreeRecapitulatif[] {
  const entrees: EntreeRecapitulatif[] = [];
  if (etat.scoreDonneeManquanteExercice !== null) {
    entrees.push({
      libelle: `Donnée retrouvée (${libelleDonneeManquante(etat.exerciceCourant)})`,
      estLatex: false,
      valeur: valeurAffichageDonneeManquante(etat.exerciceCourant),
    });
  }
  return entrees;
}
