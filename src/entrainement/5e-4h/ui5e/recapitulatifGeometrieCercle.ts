import type { EtatSessionGeometrieCercle } from "../moteur5e/typesGeometrieCercle";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatValeurPhaseLatex, labelRecapPhase, phasesDuScenario } from "./formatGeometrieCercle";

/**
 * Construit le récapitulatif des écrans déjà confirmés de l'exercice en cours (5gen12). Le moteur
 * ne trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un booléen par phase) — on
 * retrouve donc le verdict par phase via l'heuristique `scoresPartiels[phase] === 0 ⟺ révélée`
 * (même principe que 5gen9/5gen11). La séquence de phases dépend du SCÉNARIO de l'exercice courant
 * (`phasesDuScenario`, 3 séquences structurellement disjointes — jamais un seul ordre générique,
 * voir `moteur5e/typesGeometrieCercle.ts`) ; `formatValeurPhaseLatex`/`labelRecapPhase` sont les
 * primitives déjà prévues côté présentation pour ce récapitulatif (voir le commentaire
 * `ui5e/formatGeometrieCercle.ts`, "Bloc 'état actuel' (écran...) + récapitulatif final").
 *
 * NOTE D'ARCHITECTURE : l'ancien bloc "état actuel" maison (`EtatActuelGeometrieCercle`, local à
 * `components5e/EtapeChampGeometrieCercle.tsx`, affiché SANS CONDITION) a depuis été retiré
 * (fonction + site d'appel) une fois devenu un doublon visuel avec `RecapitulatifPanel`, ajouté
 * juste avant l'écran en cours.
 */
export function calculerRecapitulatifGeometrieCercle(etat: EtatSessionGeometrieCercle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const phases = phasesDuScenario(exercice.scenario);

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of phases) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    entrees.push({
      libelle: labelRecapPhase(phase),
      estLatex: true,
      valeur: formatValeurPhaseLatex(exercice, phase),
      revele: score === 0,
    });
  }
  return entrees;
}
