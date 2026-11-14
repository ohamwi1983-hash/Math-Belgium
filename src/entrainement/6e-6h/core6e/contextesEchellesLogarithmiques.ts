import type { IdVarianteEchelles } from "./echellesLogarithmiques.types";

/**
 * Couche core (6e) — contextes narratifs de `6gen90` « Échelles logarithmiques ». Partagés par le
 * tirage (`generateurs6e/echellesLogarithmiques/`, plages de valeurs plausibles) et les textes
 * (`ui6e/formatEchellesLogarithmiques.ts`). Ordres de grandeur réalistes : tondeuse vers 85 dB,
 * conversation de classe vers 55 dB, concert au-delà de 100 dB ; pH du citron vers 2,2, du lait
 * vers 6,6 ; magnitudes de séismes de 3 à 9 ; magnitudes apparentes d'étoiles de −1,5 à 6,5.
 */

/** Une source sonore : nom avec article indéfini, pluriel, plage du niveau (dB, entiers). */
export interface SourceSonore {
  nom: string;
  pluriel: string;
  plage: [number, number];
}

/** `db-sources` : n sources identiques fonctionnent ensemble. */
export const CONTEXTES_SOURCES: SourceSonore[] = [
  { nom: "Une tondeuse à gazon", pluriel: "tondeuses", plage: [82, 90] },
  { nom: "Un aspirateur", pluriel: "aspirateurs", plage: [68, 76] },
  { nom: "Un ventilateur de bureau", pluriel: "ventilateurs", plage: [42, 52] },
  { nom: "Une imprimante", pluriel: "imprimantes", plage: [50, 58] },
  { nom: "Un scooter au ralenti", pluriel: "scooters", plage: [75, 82] },
];

/** `db-reduire` : une protection divise l'intensité par k. */
export const CONTEXTES_REDUIRE: { protection: string; bruit: string; plage: [number, number] }[] = [
  { protection: "Un double vitrage", bruit: "du bruit de la rue, qui atteint devant la fenêtre", plage: [70, 80] },
  { protection: "Un casque antibruit", bruit: "d'une tronçonneuse, qui produit", plage: [100, 110] },
  { protection: "Un mur antibruit", bruit: "d'une autoroute, qui atteint sans protection", plage: [75, 85] },
];

/** `db-combien` : combien de sources identiques pour atteindre un niveau. */
export const CONTEXTES_COMBIEN: SourceSonore[] = [
  { nom: "Un violon", pluriel: "violons", plage: [60, 68] },
  { nom: "Un choriste", pluriel: "choristes", plage: [55, 65] },
  { nom: "Un grillon", pluriel: "grillons", plage: [40, 50] },
];

/** `db-comparer` : lieux de mesure, du plus calme au plus bruyant. */
export const CONTEXTES_COMPARER_DB: { lieu: string; plage: [number, number] }[] = [
  { lieu: "dans une bibliothèque", plage: [30, 40] },
  { lieu: "dans une salle de classe", plage: [50, 60] },
  { lieu: "dans une rue animée", plage: [68, 78] },
  { lieu: "près d'un chantier", plage: [85, 95] },
  { lieu: "au premier rang d'un concert", plage: [100, 110] },
];

/** Séismes : régions (le contexte et le second contexte sont distincts). */
export const REGIONS_SEISMES: string[] = ["dans les Alpes", "en Italie", "au Japon", "en Islande", "au Chili", "en Grèce"];

/** `ph-comparer` : substances et plage de pH (en dixièmes). */
export const CONTEXTES_COMPARER_PH: { nom: string; plage: [number, number] }[] = [
  { nom: "le jus de citron", plage: [20, 25] },
  { nom: "le vinaigre", plage: [25, 30] },
  { nom: "un soda au cola", plage: [25, 32] },
  { nom: "le jus d'orange", plage: [33, 40] },
  { nom: "le jus de tomate", plage: [41, 46] },
  { nom: "le café", plage: [48, 52] },
  { nom: "l'eau de pluie", plage: [54, 58] },
  { nom: "le lait", plage: [64, 68] },
];

/** `ph-diluer` : acides forts (diluer k fois divise la concentration en ions H₃O⁺ par k). */
export const CONTEXTES_DILUER: string[] = ["une solution d'acide chlorhydrique", "une solution d'acide nitrique"];

/** Étoiles : situation d'observation. */
export const CONTEXTES_ETOILES: string[] = ["Un astronome amateur observe deux étoiles A et B.", "Sur une photo du ciel nocturne, on repère deux étoiles A et B."];

export const NB_CONTEXTES: Record<IdVarianteEchelles, number> = {
  "db-sources": CONTEXTES_SOURCES.length,
  "db-reduire": CONTEXTES_REDUIRE.length,
  "db-combien": CONTEXTES_COMBIEN.length,
  "db-comparer": CONTEXTES_COMPARER_DB.length,
  "seisme-amplitude": REGIONS_SEISMES.length,
  "seisme-energie": REGIONS_SEISMES.length,
  "seisme-magnitude": REGIONS_SEISMES.length,
  "ph-comparer": CONTEXTES_COMPARER_PH.length,
  "ph-diluer": CONTEXTES_DILUER.length,
  "etoiles-eclat": CONTEXTES_ETOILES.length,
  "etoiles-magnitude": CONTEXTES_ETOILES.length,
};
