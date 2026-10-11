import type { EtatSessionParametresSinusoide } from "../moteur5e/typesParametresSinusoide";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatAmplitudeAbsolueLatex, formatFrequenceLatex, formatRationnelPiLatex } from "./formatParametresSinusoide";

/**
 * Construit le récapitulatif des paramètres déjà confirmés de l'exercice en cours — reprend
 * EXACTEMENT les valeurs déjà affichées par l'ancien bloc "état actuel" maison
 * (`EtatActuelParametresSinusoide`, local à `EtapeParametreSinusoide.tsx`, alimenté par
 * `formatTermesEtatActuelParametresSinusoideLatex`/`formatChampParametreLatex`,
 * `ui5e/formatParametresSinusoide.ts`), seulement reformaté en une entrée par paramètre (libellé +
 * icône ✓/✗) plutôt qu'un flux unique de fragments KaTeX sans label.
 *
 * ATTENTION — ce générateur n'a PAS de booléen `xxxRevele` dédié par phase (contrairement aux 4
 * autres cibles de cette tâche) : `EtatSessionParametresSinusoide` ne garde que
 * `derniereEtapeRevelee`, le booléen générique de la DERNIÈRE phase close uniquement (voir
 * `moteur5e/typesParametresSinusoide.ts`). Pour les phases closes plus tôt, la révélation est
 * donc reconstituée par l'HEURISTIQUE `scoreXxxPartiel === 0` (un échec de révélation fait TOUJOURS
 * tomber le score à exactement 0 — `moteur/etapeTentatives.ts` — mais une réussite très pénalisée
 * par les aides peut, dans de rares cas, tomber à 0 également ; cette imprécision est assumée,
 * signalée explicitement par la consigne de cette tâche, pas une régression introduite ici).
 * "decalage" (5e et dernière phase) n'a pas de champ `scoreDecalagePartiel` dédié à la racine de
 * l'état (toujours la phase COURANTE tant que l'exercice est en cours, jamais "déjà close") —
 * jamais montrée dans ce récapitulatif, même principe que les autres générateurs de cette tâche.
 *
 * NOTE D'ARCHITECTURE (à signaler) : `EtapeParametreSinusoide.tsx` calcule et affiche LUI-MÊME ce
 * bloc en interne (jamais une prop reçue depuis `App5gen8.tsx`) — remplacer son appel local aurait
 * exigé de modifier ce fichier, hors du périmètre autorisé pour cette tâche (seulement
 * `App5gen8.tsx` + ce nouveau fichier). `RecapitulatifPanel` est donc ajouté EN PLUS, juste avant
 * l'écran en cours, sans retirer l'ancien bloc `etat-actuel-box` existant.
 */
export function calculerRecapitulatifParametresSinusoide(etat: EtatSessionParametresSinusoide): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreAmplitudePartiel !== null) {
    entrees.push({ libelle: "Amplitude (A)", estLatex: true, valeur: `|A| = ${formatAmplitudeAbsolueLatex(exercice.A)}`, revele: etat.scoreAmplitudePartiel === 0 });
  }
  if (etat.scorePhiPartiel !== null) {
    entrees.push({ libelle: "Déphasage (Φ)", estLatex: true, valeur: `\\Phi = ${formatRationnelPiLatex(exercice.phi)}`, revele: etat.scorePhiPartiel === 0 });
  }
  if (etat.scorePeriodePartiel !== null) {
    entrees.push({ libelle: "Période (T)", estLatex: true, valeur: `T = ${formatRationnelPiLatex(exercice.T)}`, revele: etat.scorePeriodePartiel === 0 });
  }
  if (etat.scoreFrequencePartiel !== null) {
    entrees.push({ libelle: "Fréquence (f)", estLatex: true, valeur: `f = ${formatFrequenceLatex(exercice)}`, revele: etat.scoreFrequencePartiel === 0 });
  }

  return entrees;
}
