import type { EtatSessionExtremumsSinusoide } from "../moteur5e/typesExtremumsSinusoide";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatTermesEtatActuelExtremums } from "./formatExtremumsSinusoide";

/**
 * Construit le récapitulatif des étapes déjà confirmées de l'exercice en cours (5gen11). Le moteur
 * ne trackait, à l'origine, que `derniereEtapeRevelee` (générique, pas un booléen par phase) — on
 * retrouve donc le verdict par phase via l'heuristique `scoreXxxPartiel === 0 ⟺ révélée` (même
 * principe que 5gen9). `solutions` (dernière phase, bonus) n'a volontairement pas de champ
 * `scoreSolutionsPartiel` — à ce stade l'exercice se termine, donc jamais affiché ici (même raison
 * que `formatTermesEtatActuelExtremums`, qui s'arrête juste avant la phase courante).
 *
 * `formatTermesEtatActuelExtremums(exercice, "solutions")` renvoie TOUJOURS les 2 valeurs
 * (équation substituée, branche x) dérivées uniquement de `exercice` — on l'appelle une seule
 * fois et on filtre selon les scores partiels déjà trackés, jamais un second algorithme de rendu.
 *
 * NOTE D'ARCHITECTURE : les anciens blocs "état actuel" maison (`EtatActuelExtremums`, dupliqués
 * localement dans `components5e/EtapeParametreExtremum.tsx` et `EtapeSolutionsExtremum.tsx`) ne
 * sont PAS retirés — hors du périmètre autorisé pour cette tâche (seulement `App5gen11.tsx` + ce
 * nouveau fichier, même principe que `recapitulatifProblemesContexte.ts`/5gen5). `RecapitulatifPanel`
 * est donc ajouté EN PLUS, juste avant l'écran en cours, sans retirer les anciens blocs
 * `etat-actuel-box` existants (qui continuent de s'afficher à l'intérieur de chaque écran,
 * inchangés).
 */
export function calculerRecapitulatifExtremumsSinusoide(etat: EtatSessionExtremumsSinusoide): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const [equationSubstituee, brancheX] = formatTermesEtatActuelExtremums(exercice, "solutions");
  const entrees: EntreeRecapitulatif[] = [];

  if (etat.scorePoserEquationPartiel !== null) {
    entrees.push({
      libelle: "Équation d'extremum",
      estLatex: true,
      valeur: equationSubstituee,
      revele: etat.scorePoserEquationPartiel === 0,
    });
  }

  if (etat.scoreIsolerXPartiel !== null) {
    entrees.push({
      libelle: "Solutions en x",
      estLatex: true,
      valeur: brancheX,
      revele: etat.scoreIsolerXPartiel === 0,
    });
  }

  return entrees;
}
