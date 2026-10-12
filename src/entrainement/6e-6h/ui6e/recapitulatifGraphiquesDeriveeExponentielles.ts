import type { EtatPuceProgression } from "../../components/ProgressionPuces";
import type { EtatSessionGraphiqueDeriveeExponentielle } from "../moteur6e/typesGraphiquesDeriveeExponentielles";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatDeriveeCorrecteLatex } from "./formatGraphiquesDeriveeExponentielles";

/**
 * Récapitulatif MINIMAL pour `6gen8` — au plus 1 écran à mémoriser ("derivee", familles B/D
 * uniquement : les familles A/C passent directement à la phase "selection" sans jamais traverser
 * "derivee", `scoreDeriveePartiel` reste alors `null` pour tout l'exercice — voir
 * `typesGraphiquesDeriveeExponentielles.ts`). Pas de `LIBELLE_PHASE`/dispatcher générique ici : au
 * plus 1 entrée possible, condition directe sur `etat.phase === "selection" &&
 * etat.scoreDeriveePartiel !== null`.
 */
export function calculerRecapitulatifGraphiquesDeriveeExponentielles(etat: EtatSessionGraphiqueDeriveeExponentielle): EntreeRecapitulatif[] {
  if (etat.phase !== "selection" || etat.scoreDeriveePartiel === null) return [];
  const valeur = formatDeriveeCorrecteLatex(etat.exerciceCourant);
  if (valeur === null) return [];
  return [{ libelle: "Dérivée", estLatex: true, valeur, revele: etat.scoreDeriveePartiel === 0 }];
}

/** Puces pour `6gen8` : 1 puce ("derivee") si et seulement si la famille de l'exercice courant
 * traverse réellement cet écran (en cours, OU déjà close avec `scoreDeriveePartiel !== null`),
 * jamais pour les familles A/C qui passent directement à "selection". */
export function calculerSegmentsProgressionGraphiquesDeriveeExponentielles(etat: EtatSessionGraphiqueDeriveeExponentielle): EtatPuceProgression[] {
  const segments: EtatPuceProgression[] = [];
  if (etat.phase === "derivee") {
    segments.push("courante");
  } else if (etat.scoreDeriveePartiel !== null) {
    segments.push(etat.scoreDeriveePartiel === 0 ? "revele" : "correcte");
  }
  segments.push(etat.phase === "selection" ? "courante" : "a-venir");
  return segments;
}
