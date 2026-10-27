import type { EtatSessionExtremumsSinusoide } from "../moteur5e/typesExtremumsSinusoide";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatTermesEtatActuelExtremums } from "./formatExtremumsSinusoide";

/**
 * Construit le récapitulatif des étapes déjà confirmées de l'exercice en cours (5gen11). Icône
 * (✓/✗) pilotée par `poserEquationRevele`/`isolerXRevele`, peuplés depuis `etapeCourante.revelee`
 * à la clôture de chaque écran (`sessionExtremumsSinusoide.ts::soumettreEcran`). `solutions`
 * (dernière phase, bonus) n'a volontairement pas de champ
 * `scoreSolutionsPartiel` — à ce stade l'exercice se termine, donc jamais affiché ici (même raison
 * que `formatTermesEtatActuelExtremums`, qui s'arrête juste avant la phase courante).
 *
 * `formatTermesEtatActuelExtremums(exercice, "solutions")` renvoie TOUJOURS les 2 valeurs
 * (équation substituée, branche x) dérivées uniquement de `exercice` — on l'appelle une seule
 * fois et on filtre selon les scores partiels déjà trackés, jamais un second algorithme de rendu.
 *
 * NOTE D'ARCHITECTURE : les anciens blocs "état actuel" maison (`EtatActuelExtremums`, dupliqués
 * localement dans `components5e/EtapeParametreExtremum.tsx` et `EtapeSolutionsExtremum.tsx`,
 * affichés SANS CONDITION) ont depuis été retirés (fonctions + sites d'appel) une fois devenus un
 * doublon visuel avec `RecapitulatifPanel`, ajouté juste avant l'écran en cours.
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
      revele: etat.poserEquationRevele,
    });
  }

  if (etat.scoreIsolerXPartiel !== null) {
    entrees.push({
      libelle: "Solutions en x",
      estLatex: true,
      valeur: brancheX,
      revele: etat.isolerXRevele,
    });
  }

  return entrees;
}
