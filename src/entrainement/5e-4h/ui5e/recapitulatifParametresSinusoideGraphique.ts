import type { EtatSessionParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatChampParametreGraphiqueLatex } from "./formatParametresSinusoideGraphique";

/**
 * Construit le récapitulatif des paramètres déjà confirmés de l'exercice en cours (5gen9). Le
 * moteur ne trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un booléen par
 * phase) — on retrouve donc le verdict par phase via l'heuristique `scoreXxxPartiel === 0 ⟺
 * révélée` (seule information disponible, cohérente avec le reste du moteur qui calcule déjà le
 * score à 0 quand les tentatives sont épuisées sans bonne réponse, voir
 * `moteur5e/sessionParametresSinusoideGraphique.ts`). `phi` (dernière phase) n'a volontairement
 * pas de champ `scorePhiPartiel` — à ce stade l'exercice se termine, donc jamais affiché ici (même
 * raison que `formatTermesEtatActuelParametresSinusoideGraphiqueLatex`, qui s'arrête juste avant la
 * phase courante).
 *
 * NOTE D'ARCHITECTURE : l'ancien bloc "état actuel" maison (`EtatActuelParametresSinusoideGraphique`,
 * local à `components5e/EtapeParametreSinusoideGraphique.tsx`) n'est PAS retiré — hors du périmètre
 * autorisé pour cette tâche (seulement `App5gen9.tsx` + ce nouveau fichier, même principe que
 * `recapitulatifProblemesContexte.ts`/5gen5). `RecapitulatifPanel` est donc ajouté EN PLUS, juste
 * avant l'écran en cours, sans retirer l'ancien bloc `etat-actuel-box` existant (qui continue de
 * s'afficher à l'intérieur de l'écran, inchangé).
 */
export function calculerRecapitulatifParametresSinusoideGraphique(etat: EtatSessionParametresSinusoideGraphique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scoreDecalagePartiel !== null) {
    entrees.push({
      libelle: "Décalage vertical",
      estLatex: true,
      valeur: formatChampParametreGraphiqueLatex(exercice, "decalage"),
      revele: etat.scoreDecalagePartiel === 0,
    });
  }

  if (etat.scoreAmplitudePartiel !== null) {
    entrees.push({
      libelle: "Amplitude",
      estLatex: true,
      valeur: formatChampParametreGraphiqueLatex(exercice, "amplitude"),
      revele: etat.scoreAmplitudePartiel === 0,
    });
  }

  if (etat.scorePeriodePartiel !== null) {
    entrees.push({
      libelle: "Période",
      estLatex: true,
      valeur: formatChampParametreGraphiqueLatex(exercice, "periode"),
      revele: etat.scorePeriodePartiel === 0,
    });
  }

  if (etat.scoreFrequencePartiel !== null) {
    entrees.push({
      libelle: "Fréquence",
      estLatex: true,
      valeur: formatChampParametreGraphiqueLatex(exercice, "frequence"),
      revele: etat.scoreFrequencePartiel === 0,
    });
  }

  return entrees;
}
