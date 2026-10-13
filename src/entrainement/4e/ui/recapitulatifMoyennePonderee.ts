import type { EtatSessionMoyennePonderee } from "../moteur/typesMoyennePonderee";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelSommesLatex } from "./formatMoyennePonderee";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 3 phases FIXES au plus (`centres` → `sommes` → `quotient`,
 * `quotient` toujours terminale, voir `moteur/typesMoyennePonderee.ts`). Seule "sommes" précède un
 * écran suivant ET avait un ancien bloc "état actuel" à reprendre (celui de
 * `EtapeQuotientMoyennePonderee.tsx`, PARTAGÉ avec `AppExerciceSynthese` — même sémantique dans les
 * 2 Apps : "sommes" précède toujours immédiatement "quotient"). "centres" n'a jamais eu de rappel
 * nulle part (`EtapeSommesMoyennePonderee.tsx` n'a pas de bloc "état actuel"), donc aucune entrée
 * ici non plus — rien à inventer.
 */
export function calculerRecapitulatifMoyennePonderee(etat: EtatSessionMoyennePonderee): EntreeRecapitulatif[] {
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreSommesExercice !== null) {
    entrees.push({
      libelle: "Sommes confirmées",
      estLatex: true,
      valeur: formatEtatActuelSommesLatex(etat.exerciceCourant),
      revele: etat.sommesRevele,
    });
  }

  return entrees;
}
