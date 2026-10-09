import type { ExerciceExtF } from "../../core6e/extensionsBinomialeNormaleBayes.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération famille F ("Reconstruire une loi depuis des % croisés + espérance
 * appliquée") pour `6gen52`. RÉUTILISE la RAISONNEMENT (pas le code, structure de données trop
 * différente — voir en-tête `familleD.ts` pour la même discussion) de :
 * - `generateurs6e/independanceBayes/familleB.ts` (`6gen32` famille B, "reconstruire un tableau
 *   depuis des % partiels") — écran 1 : `pourcentage3=100-pourcentage1-pourcentage2` déduit PAR
 *   DIFFÉRENCE, jamais stocké (recalculé à chaque appel, `moteur6e/verificationExtensionsBinomiale
 *   NormaleBayes.ts`) ;
 * - `generateurs6e/variablesDiscretesEsperance/familleB.ts` (`6gen49` famille B, "construire une loi
 *   + calculer E(X)") — écrans 2-3 : même structure (valeur, probabilité) par ligne puis
 *   `E(X)=Σxᵢ·pᵢ`.
 *
 * `pourcentage1`/`pourcentage2` DONNÉS (options 1 et 2 d'une offre tarifaire à 3 options),
 * `pourcentage3` déduit ; `valeurs[i]` (montants/prix) DÉJÀ connus du contexte (affichés en
 * données) ; `population` — taille de la population sur laquelle appliquer `E(X)` (écran 4).
 */

const CANDIDATS_POURCENTAGE: readonly number[] = [15, 20, 25, 30, 35, 40];
const CANDIDATS_POPULATION: readonly number[] = [200, 300, 400, 500, 600, 800, 1000];

interface GabaritContexteF {
  texte: string;
  labels: [string, string, string];
  valeurs: [number, number, number];
}

function gabaritsContexteF(): GabaritContexteF[] {
  const prixBasique = tirerEntier(10, 20);
  const prixStandard = prixBasique + tirerEntier(10, 20);
  const prixPremium = prixStandard + tirerEntier(10, 25);
  const forfaitEco = tirerEntier(20, 35);
  const forfaitConfort = forfaitEco + tirerEntier(15, 25);
  const forfaitLuxe = forfaitConfort + tirerEntier(20, 40);
  return [
    { texte: "Une salle de sport propose 3 formules d'abonnement mensuel.", labels: ["Basique", "Standard", "Premium"], valeurs: [prixBasique, prixStandard, prixPremium] },
    { texte: "Une compagnie de transport propose 3 forfaits mensuels.", labels: ["Éco", "Confort", "Luxe"], valeurs: [forfaitEco, forfaitConfort, forfaitLuxe] },
  ];
}

/** Construction déterministe (`pourcentage1`/`pourcentage2`/`population` fixés) — utilisée par
 * `CATALOGUE_VARIANTES`/`construireAvecVarianteId`. `pourcentage1+pourcentage2` reste TOUJOURS
 * strictement inférieur à 100 (contrainte imposée par l'appelant — `construireFamilleF` la respecte
 * par construction, voir plage `CANDIDATS_POURCENTAGE`, somme max 40+40=80). */
export function construireAvecValeurs(pourcentage1: number, pourcentage2: number, population: number, gabarit?: GabaritContexteF): ExerciceExtF {
  const g = gabarit ?? tirerParmi(gabaritsContexteF());
  return { famille: "F", contexte: { texte: g.texte }, labels: g.labels, valeurs: g.valeurs, pourcentage1, pourcentage2, population };
}

/** `pourcentage1`/`pourcentage2` ∈ [15,40] (`CANDIDATS_POURCENTAGE`) : leur somme reste TOUJOURS
 * ≤80, donc `pourcentage3=100-pourcentage1-pourcentage2` reste TOUJOURS ≥20 — aucun retirage
 * nécessaire (contrairement à `familleD.ts`/`6gen32`, où un retirage borné protège contre une
 * catégorie dégénérée). */
export function construireFamilleF(): ExerciceExtF {
  const pourcentage1 = tirerParmi(CANDIDATS_POURCENTAGE);
  const pourcentage2 = tirerParmi(CANDIDATS_POURCENTAGE);
  const population = tirerParmi(CANDIDATS_POPULATION);
  return construireAvecValeurs(pourcentage1, pourcentage2, population);
}
