import type { EtatSessionCaracteristiquesDroite } from "../moteur/typesCaracteristiquesDroite";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEtatActuelPointVecteurLatex } from "./formatCaracteristiquesDroite";

/**
 * Récapitulatif "Ce qu'on sait déjà" — 2 phases FIXES ("extraction" puis "caracteristiques",
 * voir `moteur/typesCaracteristiquesDroite.ts`) : seule "extraction" précède un écran suivant,
 * donc la seule entrée possible est celle de l'écran 1 (point et vecteur directeur), visible
 * uniquement pendant l'écran 2. Réutilise TELLE QUELLE la fonction de formatage déjà écrite pour
 * l'ancien bloc "état actuel" de l'écran 2. Le point et le vecteur affichés sont les CANONIQUES
 * (ceux que les aides de l'écran 2 substituent), pas forcément ceux saisis par l'élève — tout autre
 * point/multiple non nul ayant été accepté, le libellé ne prétend pas que ce sont « ses » valeurs
 * (audit chapitre 7, gen46 point 10). `\displaystyle` : sans lui, KaTeX compresse le vecteur
 * colonne de la ligne inline à 13px (`.recap-item`).
 */
export function calculerRecapitulatifCaracteristiquesDroite(etat: EtatSessionCaracteristiquesDroite): EntreeRecapitulatif[] {
  if (etat.phase !== "caracteristiques") return [];

  return [
    {
      libelle: "Un point et un vecteur directeur de la droite",
      estLatex: true,
      valeur: `\\displaystyle ${formatEtatActuelPointVecteurLatex(etat.exerciceCourant)}`,
      revele: etat.extractionRevele,
    },
  ];
}
