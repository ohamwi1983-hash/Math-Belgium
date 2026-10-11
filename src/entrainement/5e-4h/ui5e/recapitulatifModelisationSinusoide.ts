import type { EtatSessionModelisationSinusoide } from "../moteur5e/typesModelisationSinusoide";
import { ordreComplet } from "../moteur5e/typesModelisationSinusoide";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { LIBELLE_PHASE, formatTermesReponseAttendueModelisationSinusoide } from "./formatModelisationSinusoide";

/**
 * Construit le récapitulatif des écrans déjà confirmés de l'exercice en cours (5gen13). Le moteur
 * ne trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un booléen par phase) — on
 * retrouve donc le verdict par phase via l'heuristique `scoresPartiels[phase] === 0 ⟺ révélée`
 * (même principe que 5gen9/5gen11/5gen12). La séquence RÉELLE de phases dépend de la technique de
 * Phase 1 ET du type de Phase 2 tirés pour cette instance (`ordreComplet(exercice)`, jusqu'à 17
 * phases possibles — jamais un seul ordre générique, voir `moteur5e/typesModelisationSinusoide.ts`).
 * `formatTermesReponseAttendueModelisationSinusoide` est la réponse CORRECTE attendue pour une
 * phase donnée (déjà utilisée par `App5gen13.tsx` pour le panneau de révélation) — elle peut rendre
 * plusieurs fragments pour une même phase (ex. plusieurs solutions), d'où `valeurs` en plus de
 * `valeur` dès que la phase en produit plus d'un (même convention que
 * `recapitulatifEquationRationnelle.ts`/`recapitulatifProblemesContexte.ts`, `valeur` restant un
 * repli texte joint par `\quad`).
 *
 * NOTE D'ARCHITECTURE : l'ancien bloc "état actuel" maison partagé (`EtatActuelModelisation`,
 * `components5e/EtatActuelModelisation.tsx`, utilisé par les 8 composants d'écran de 5gen13) n'est
 * PAS retiré — hors du périmètre autorisé pour cette tâche (seulement `App5gen13.tsx` + ce nouveau
 * fichier, même principe que `recapitulatifProblemesContexte.ts`/5gen5). `RecapitulatifPanel` est
 * donc ajouté EN PLUS, juste avant l'écran en cours, sans retirer les anciens blocs
 * `etat-actuel-box` existants (qui continuent de s'afficher à l'intérieur de chaque écran,
 * inchangés).
 */
export function calculerRecapitulatifModelisationSinusoide(etat: EtatSessionModelisationSinusoide): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const phases = ordreComplet(exercice);

  const entrees: EntreeRecapitulatif[] = [];
  for (const phase of phases) {
    const score = etat.scoresPartiels[phase];
    if (score === undefined) continue;
    const termes = formatTermesReponseAttendueModelisationSinusoide(exercice, phase);
    if (termes.length === 0) continue;
    const revele = score === 0;
    if (termes.length === 1) {
      entrees.push({ libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: termes[0], revele });
    } else {
      entrees.push({ libelle: LIBELLE_PHASE[phase], estLatex: true, valeur: termes.join("\\quad"), valeurs: termes, revele });
    }
  }
  return entrees;
}
