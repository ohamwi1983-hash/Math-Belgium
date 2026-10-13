import type { EtatSessionCaracteristiquesDroite } from "../moteur/typesCaracteristiquesDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelPointVecteurLatex } from "./formatCaracteristiquesDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 2 phases FIXES ("extraction" puis "caracteristiques",
 * voir `moteur/typesCaracteristiquesDroite.ts`) : seule "extraction" précède un écran suivant,
 * donc la seule entrée possible est celle de l'écran 1 (point et vecteur directeur), visible
 * uniquement pendant l'écran 2. Réutilise TELLE QUELLE la fonction de formatage déjà écrite pour
 * l'ancien bloc "état actuel" de l'écran 2.
 */
export function calculerRecapitulatifCaracteristiquesDroite(etat: EtatSessionCaracteristiquesDroite): EntreeRecapitulatif[] {
  if (etat.phase !== "caracteristiques") return [];

  return [
    {
      libelle: "Point et vecteur confirmés",
      estLatex: true,
      valeur: formatEtatActuelPointVecteurLatex(etat.exerciceCourant),
      revele: etat.extractionRevele,
    },
  ];
}
