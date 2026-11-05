import type { EtatSessionParametresSinusoideGraphique, PhaseParametresSinusoideGraphique } from "../moteur5e/typesParametresSinusoideGraphique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatChampParametreGraphiqueLatex } from "./formatParametresSinusoideGraphique";

/**
 * Construit le récapitulatif des paramètres déjà confirmés de l'exercice en cours (5gen9). Icône
 * (✓/✗) pilotée par `decalageRevele`/`amplitudeRevele`/`periodeRevele`/`frequenceRevele`, peuplés
 * depuis `etapeCourante.revelee` à la clôture de chaque phase
 * (`sessionParametresSinusoideGraphique.ts::soumettreReponseParametresSinusoideGraphique`). `phi`
 * (dernière phase) n'a volontairement
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
  const ajouter = (libelle: string, phase: PhaseParametresSinusoideGraphique, score: number | null, revele: boolean) => {
    if (score !== null) entrees.push({ libelle, estLatex: true, valeur: formatChampParametreGraphiqueLatex(exercice, phase), revele });
  };
  // Ordre de `ORDRE_PHASES_SINUSOIDE_GRAPHIQUE` (la dernière entrée est la phase qui vient de se clore).
  ajouter("Décalage vertical", "decalage", etat.scoreDecalagePartiel, etat.decalageRevele);
  ajouter("Amplitude", "amplitude", etat.scoreAmplitudePartiel, etat.amplitudeRevele);
  ajouter("Période", "periode", etat.scorePeriodePartiel, etat.periodeRevele);
  ajouter("Pulsation", "pulsation", etat.scorePulsationPartiel, etat.pulsationRevele);
  ajouter("Fréquence", "frequence", etat.scoreFrequencePartiel, etat.frequenceRevele);
  ajouter("Décalage horizontal", "phi", etat.scorePhiPartiel, etat.phiRevele);
  return entrees;
}
