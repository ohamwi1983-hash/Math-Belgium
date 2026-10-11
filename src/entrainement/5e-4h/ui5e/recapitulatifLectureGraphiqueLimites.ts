import { ordreComplet } from "../moteur5e/typesLectureGraphiqueLimites";
import type { EtatSessionLectureGraphiqueLimites } from "../moteur5e/typesLectureGraphiqueLimites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE_LECTURE_GRAPHIQUE, formatReponseAttenduePhaseLatex } from "./formatLectureGraphiqueLimites";

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours (5gen22, "Limites et
 * asymptotes, lecture graphique") — une entrée par phase de `ordreComplet(etat.exerciceCourant)`
 * (séquence RÉELLE : "nommerAsymptotes" est SAUTÉE quand le tirage n'a aucune asymptote à nommer,
 * jamais un ordre fixe à 2 phases reconstitué à la main) dont le score est déjà connu
 * (`etat.scoresPartiels[phase] !== undefined`), dans l'ordre. Le moteur ne trackait, à l'origine,
 * que `derniereEtapeRevelee` (générique, pas un booléen par phase) — on retrouve donc le verdict
 * par phase via l'heuristique `scoresPartiels[phase] === 0 ⟺ révélée` (seul cas où
 * `soumettreEtapeTentatives` renvoie exactement 0, voir `moteur/etapeTentatives.ts` ; contrairement
 * aux autres générateurs 5e-4h de ce chantier, `soumettreEcran` ici ne soustrait AUCUNE pénalité
 * d'aide au score — 5gen22 n'a pas de mécanisme d'aide, `EtatSessionLectureGraphiqueLimites` n'a
 * pas de champ `niveauAide` — donc l'heuristique y est exacte, pas approximative).
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
      revele: score === 0,
    });
  }

  return entrees;
}
