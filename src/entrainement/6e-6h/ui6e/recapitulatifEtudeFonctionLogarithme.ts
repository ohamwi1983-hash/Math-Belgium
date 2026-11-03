import type { EtatSessionEtudeFonctionLogarithme } from "../moteur6e/typesEtudeFonctionLogarithme";
import { LIBELLE_PHASE_ETUDE_LOG, contenuRecapLatex, phasesVisitees } from "./formatEtudeFonctionLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif « Ce qu'on sait déjà » de `6gen21` — un écran clos par ligne, contenu
 * `contenuRecapLatex` (la même réponse attendue que la révélation et le corrigé exporté). `revele`
 * lu sur `etat.detailsPartiels[phase]`, capturé par le moteur à la clôture de l'écran.
 */
export function calculerRecapitulatifEtudeFonctionLogarithme(etat: EtatSessionEtudeFonctionLogarithme): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = phasesVisitees();
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));
  return precedentes.map((phase) => ({
    libelle: LIBELLE_PHASE_ETUDE_LOG[phase],
    estLatex: true,
    valeur: contenuRecapLatex(exercice, phase),
    revele: etat.detailsPartiels[phase]?.revele ?? false,
  }));
}

export function calculerSegmentsProgressionEtudeFonctionLogarithme(etat: EtatSessionEtudeFonctionLogarithme) {
  return phasesVisitees().map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    if (etat.scoresPartiels[phase] === undefined) return "a-venir" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail?.revele) return "revele" as const;
    return detail !== undefined && detail.niveauAide > 0 ? ("aide" as const) : ("correcte" as const);
  });
}
