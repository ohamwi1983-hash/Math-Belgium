import type { ExerciceRelationGeneraleRV } from "../core/relationVectorielle.types";
import type { EtatSessionRelationVectorielle } from "../moteur/typesRelationVectorielle";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatTraductionAttendueLatex } from "./formatRelationVectorielle";

/**
 * Récapitulatif de "Point à partir d'une relation vectorielle" (version guidée) — même principe que
 * le reste du projet (dérivé uniquement des scores déjà trackés par le moteur, jamais de la saisie
 * de l'élève) : vide tant que l'étape "traduction" n'a pas eu lieu — jamais atteinte pour la
 * variante `translation`, qui n'a pas cette étape, donc toujours vide dans ce cas — une entrée une
 * fois close, toujours la vraie relation confirmée (`formatTraductionAttendueLatex`, la même source
 * que la révélation du panneau de résultat, jamais un second calcul indépendant). Affiché sur
 * l'écran "coordonnees" des exercices `relationGenerale` uniquement.
 */
export function calculerRecapitulatifRelationVectorielle(etat: EtatSessionRelationVectorielle): EntreeRecapitulatif[] {
  if (etat.scoreTraductionExercice === null) return [];
  const exercice = etat.exerciceCourant as ExerciceRelationGeneraleRV;

  return [
    {
      libelle: "Traduction en coordonnées",
      estLatex: true,
      valeur: formatTraductionAttendueLatex(exercice),
    },
  ];
}
