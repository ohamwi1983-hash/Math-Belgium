import { ordreComplet } from "../moteur5e/typesLectureGraphiqueLimites";
import type { EtatSessionLectureGraphiqueLimites } from "../moteur5e/typesLectureGraphiqueLimites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE_LECTURE_GRAPHIQUE, formatReponseAttenduePhaseLatex } from "./formatLectureGraphiqueLimites";

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours (5gen22, "Limites et
 * asymptotes, lecture graphique") — une entrée par phase de `ordreComplet(etat.exerciceCourant)`
 * (séquence RÉELLE : "nommerAsymptotes" est SAUTÉE quand le tirage n'a aucune asymptote à nommer,
 * jamais un ordre fixe à 2 phases reconstitué à la main) dont le score est déjà connu
 * (`etat.scoresPartiels[phase] !== undefined`), dans l'ordre. Icône (✓/✗) pilotée par
 * `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la clôture de chaque
 * écran (`sessionLectureGraphiqueLimites.ts::soumettreEcran`).
 *
 * Chaque phase réutilise `formatReponseAttenduePhaseLatex` (même source que la validation inline
 * de `App5gen22.tsx`), jamais une valeur recalculée séparément. Les fragments multiples (un par
 * slot de comportement/asymptote) sont joints par `\quad` (même convention que
 * `recapitulatifEquationRationnelle.ts`, 4e).
 */
export function calculerRecapitulatifLectureGraphiqueLimites(etat: EtatSessionLectureGraphiqueLimites): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const phase of ordreComplet(exercice)) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    entrees.push({
      libelle: LIBELLE_PHASE_LECTURE_GRAPHIQUE[phase],
      estLatex: true,
      valeur: formatReponseAttenduePhaseLatex(exercice, phase).join("\\quad"),
      revele: etat.revelesPartiels[phase] ?? false,
    });
  }

  return entrees;
}
