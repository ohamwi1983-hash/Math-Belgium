import { ordreComplet } from "../moteur5e/typesLimites";
import type { EtatSessionLimite } from "../moteur5e/typesLimites";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_FAMILLE_LIMITE, LIBELLE_PHASE_LIMITE, formatReponseAttenduePhaseLatex } from "./formatLimites";

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours (5gen20, "Limites,
 * reconnaissance et calcul") — une entrée par phase de `ordreComplet(etat.exerciceCourant)`
 * (séquence RÉELLE, propre à la famille du tirage — 4 familles structurellement disjointes,
 * jamais un ordre fixe reconstitué à la main) dont le score est déjà connu
 * (`etat.scoresPartiels[phase] !== undefined`), dans l'ordre. Le moteur ne trackait, à l'origine,
 * que `derniereEtapeRevelee` (générique, pas un booléen par phase) — on retrouve donc le verdict
 * par phase via l'heuristique `scoresPartiels[phase] === 0 ⟺ révélée` (seul cas où
 * `soumettreEtapeTentatives` renvoie exactement 0, voir `moteur/etapeTentatives.ts` ;
 * aucune pénalité d'aide n'étant plus appliquée, une réussite vaut toujours
 * `pointsDeBase` : l'équivalence est exacte).
 *
 * "reconnaissance" affiche le libellé de la VRAIE famille (jamais la réponse de l'élève — même
 * convention que `reponseAttendueLimite` dans `App5gen20.tsx`), les phases suivantes réutilisent
 * `formatReponseAttenduePhaseLatex` (même source que la validation inline), jamais une valeur
 * recalculée séparément. Plusieurs fragments LaTeX d'une même phase sont joints par `\quad` (même
 * convention que `recapitulatifEquationRationnelle.ts`, 4e).
 */
export function calculerRecapitulatifLimite(etat: EtatSessionLimite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const phase of ordreComplet(exercice)) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    const revele = score === 0;

    if (phase === "reconnaissance") {
      entrees.push({
        libelle: LIBELLE_PHASE_LIMITE.reconnaissance,
        estLatex: false,
        valeur: LIBELLE_FAMILLE_LIMITE[exercice.famille] ?? exercice.famille,
        revele,
      });
      continue;
    }

    entrees.push({
      libelle: LIBELLE_PHASE_LIMITE[phase],
      estLatex: true,
      valeur: formatReponseAttenduePhaseLatex(exercice, phase).join("\\quad"),
      revele,
    });
  }

  return entrees;
}
