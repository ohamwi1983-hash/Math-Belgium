import { ordreComplet } from "../moteur5e/typesAsymptoteOblique";
import type { EtatSessionAsymptoteOblique } from "../moteur5e/typesAsymptoteOblique";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE_ASYMPTOTE_OBLIQUE, formatReponseAttenduePhaseLatex } from "./formatAsymptoteOblique";

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours (5gen21, "Asymptote
 * oblique") — une entrée par phase de `ordreComplet(etat.exerciceCourant)` (séquence RÉELLE,
 * propre à la variante du tirage — "divisionEuclidienne" ou "viaLimites", jamais un ordre fixe
 * reconstitué à la main) dont le score est déjà connu (`etat.scoresPartiels[phase] !==
 * undefined`), dans l'ordre. Le signal "révélé" vient de `etat.revelesPartiels[phase]`, peuplé
 * directement depuis `etapeCourante.revelee` à la clôture de chaque écran
 * (`sessionAsymptoteOblique.ts::soumettreEcran`) — jusqu'au 2025-10, ce récapitulatif le déduisait
 * de `scoresPartiels[phase] === 0`, une heuristique corrigée pendant le balayage générique
 * (point A) car non fiable ici : la pénalité d'aide (retirée depuis), soustraite APRÈS le score de tentatives,
 * pouvait amener une RÉUSSITE tardive fortement pénalisée à exactement 0 (faux "révélé").
 *
 * Chaque phase réutilise `formatReponseAttenduePhaseLatex` (même source que la validation inline
 * de `App5gen21.tsx`), jamais une valeur recalculée séparément. Plusieurs fragments LaTeX d'une
 * même phase (ex. "diviserEuclidienne" : Q(x) et R(x)) sont joints par `\quad` (même convention
 * que `recapitulatifEquationRationnelle.ts`, 4e).
 */
export function calculerRecapitulatifAsymptoteOblique(etat: EtatSessionAsymptoteOblique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const phase of ordreComplet(exercice)) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    entrees.push({
      libelle: LIBELLE_PHASE_ASYMPTOTE_OBLIQUE[phase],
      estLatex: true,
      valeur: formatReponseAttenduePhaseLatex(exercice, phase).join("\\quad"),
      revele: etat.revelesPartiels[phase] ?? false,
    });
  }

  return entrees;
}
