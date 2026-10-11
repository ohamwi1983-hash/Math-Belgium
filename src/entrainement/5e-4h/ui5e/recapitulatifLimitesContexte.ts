import { ordreComplet } from "../moteur5e/typesLimitesContexte";
import type { EtatSessionLimitesContexte } from "../moteur5e/typesLimitesContexte";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { estPhaseQCM, formatReponseAttendueTexte, formatReponseAttenduePhaseLatex, labelPhase } from "./formatLimitesContexte";

/**
 * Construit le récapitulatif des phases déjà closes de l'exercice en cours (5gen23, "Limites et
 * asymptotes en contexte") — une entrée par phase de `ordreComplet(etat.exerciceCourant)`
 * (séquence RÉELLE, propre à la famille du tirage — 4 familles fixes, jamais un ordre reconstitué
 * à la main) dont le score est déjà connu (`etat.scoresPartiels[phase] !== undefined`), dans
 * l'ordre. Le moteur ne trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un
 * booléen par phase) — on retrouve donc le verdict par phase via l'heuristique
 * `scoresPartiels[phase] === 0 ⟺ révélée` (seul cas où `soumettreEtapeTentatives` renvoie
 * exactement 0, voir `moteur/etapeTentatives.ts` ; `soumettreEcran` y soustrait ensuite la
 * pénalité d'aide avant stockage, donc ce 0 peut aussi provenir d'une réussite tardive fortement
 * pénalisée par l'aide — même heuristique qu'ailleurs sur la plateforme, pas une garantie
 * absolue).
 *
 * Même distinction QCM/LaTeX que `reponseAttendueLimitesContexte` dans `App5gen23.tsx` :
 * "interpreter"/"vaSens" (`estPhaseQCM`) affichent le texte de l'option correcte
 * (`formatReponseAttendueTexte`, texte brut), les autres phases réutilisent
 * `formatReponseAttenduePhaseLatex` (même source que la validation inline) — plusieurs fragments
 * d'une même phase joints par `\quad` (même convention que `recapitulatifEquationRationnelle.ts`,
 * 4e). Le libellé vient de `labelPhase(exercice, phase)`, seule source déjà partagée avec la
 * consigne d'écran.
 */
export function calculerRecapitulatifLimitesContexte(etat: EtatSessionLimitesContexte): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const entrees: EntreeRecapitulatif[] = [];

  for (const phase of ordreComplet(exercice)) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    const revele = score === 0;
    const libelle = labelPhase(exercice, phase);

    if (estPhaseQCM(phase)) {
      entrees.push({ libelle, estLatex: false, valeur: formatReponseAttendueTexte(exercice, phase) ?? "", revele });
      continue;
    }

    entrees.push({ libelle, estLatex: true, valeur: formatReponseAttenduePhaseLatex(exercice, phase).join("\\quad"), revele });
  }

  return entrees;
}
