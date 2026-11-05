import type { EtatSessionParametresSinusoide, PhaseParametresSinusoide } from "../moteur5e/typesParametresSinusoide";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatChampParametreLatex } from "./formatParametresSinusoide";

/**
 * Construit le récapitulatif des paramètres déjà confirmés de l'exercice en cours — reprend
 * EXACTEMENT les valeurs déjà affichées par l'ancien bloc "état actuel" maison
 * (`EtatActuelParametresSinusoide`, local à `EtapeParametreSinusoide.tsx`, alimenté par
 * `formatTermesEtatActuelParametresSinusoideLatex`/`formatChampParametreLatex`,
 * `ui5e/formatParametresSinusoide.ts`), seulement reformaté en une entrée par paramètre (libellé +
 * icône ✓/✗) plutôt qu'un flux unique de fragments KaTeX sans label.
 *
 * Icône (✓/✗) pilotée par `amplitudeRevele`/`phiRevele`/`periodeRevele`/`frequenceRevele`, peuplés
 * depuis `etapeCourante.revelee` à la clôture de chaque phase
 * (`sessionParametresSinusoide.ts::soumettreReponseParametresSinusoide`) — jusqu'au 2025-10,
 * reconstitués par l'heuristique `scoreXxxPartiel === 0`, corrigée pendant le balayage générique
 * (point A). "decalage" (5e et dernière phase) n'a pas de champ `scoreDecalagePartiel` dédié à la racine de
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
  const ajouter = (libelle: string, phase: PhaseParametresSinusoide, score: number | null, revele: boolean) => {
    if (score !== null) entrees.push({ libelle, estLatex: true, valeur: formatChampParametreLatex(exercice, phase), revele });
  };
  // Ordre de `ORDRE_PHASES_SINUSOIDE` (la dernière entrée est toujours la phase qui vient de se clore,
  // voir `App5gen8.tsx::ajouterHistorique`).
  ajouter("Amplitude", "amplitude", etat.scoreAmplitudePartiel, etat.amplitudeRevele);
  ajouter("Pulsation (ω)", "pulsation", etat.scorePulsationPartiel, etat.pulsationRevele);
  ajouter("Période (T)", "periode", etat.scorePeriodePartiel, etat.periodeRevele);
  ajouter("Fréquence", "frequence", etat.scoreFrequencePartiel, etat.frequenceRevele);
  ajouter("Déphasage (φ)", "dephasage", etat.scoreDephasagePartiel, etat.dephasageRevele);
  ajouter("Décalage horizontal (Φ)", "phi", etat.scorePhiPartiel, etat.phiRevele);
  return entrees;
}
