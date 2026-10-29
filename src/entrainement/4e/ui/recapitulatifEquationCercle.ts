import type { EtatSessionEquationCercle } from "../moteur/typesEquationCercle";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelCentreLatex, formatRayonLatex } from "./formatEquationCercle";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 3 phases FIXES ("centre" → "rayon" → "equation", voir
 * `moteur/typesEquationCercle.ts`), toujours traversées dans cet ordre par les deux variantes.
 * "Centre" réutilise TELLE QUELLE la fonction de formatage déjà écrite pour l'ancien bloc "état
 * actuel" de l'écran 2 (`EtapeRayonEquationCercle`). "Rayon" reprend le même format littéral
 * (`R = ...`) déjà utilisé par `AppEquationCercle` pour la réponse attendue de l'écran 2 — centre
 * et rayon sont deux phases distinctes avec leur propre `revele` (contrairement à l'ancien bloc
 * combiné `formatEtatActuelCentreRayonLatex` de l'écran 3, qui mélangeait les deux dans un seul
 * texte : chaque ligne du récapitulatif a besoin de sa propre icône ✓/✗).
 */
export function calculerRecapitulatifEquationCercle(etat: EtatSessionEquationCercle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreCentreExercice !== null) {
    entrees.push({ libelle: "Centre", estLatex: true, valeur: formatEtatActuelCentreLatex(exercice), revele: etat.centreRevele });
  }

  if (etat.scoreRayonExercice !== null) {
    entrees.push({ libelle: "Rayon", estLatex: true, valeur: `\\displaystyle R = ${formatRayonLatex(exercice)}`, revele: etat.rayonRevele });
  }

  return entrees;
}
