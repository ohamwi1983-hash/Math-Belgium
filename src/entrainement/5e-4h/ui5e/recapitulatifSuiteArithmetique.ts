import { formatTermesEtatActuelLatex, LIBELLE_PHASE_SUITE_ARITHMETIQUE } from "./formatSuiteArithmetique";
import { ordreComplet } from "../moteur5e/typesSuiteArithmetique";
import type { EtatSessionSuiteArithmetique, PhaseSuiteArithmetique } from "../moteur5e/typesSuiteArithmetique";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen14 — reprend EXACTEMENT les mêmes valeurs que
 * l'ancien bloc "état actuel" (`components5e/EtatActuelSuiteArithmetique.tsx`, qui appelle
 * `formatTermesEtatActuelLatex` avec la phase courante) : on réutilise ici cette même fonction,
 * jamais une formule recalculée séparément.
 *
 * Seules 7 des 13 phases accumulent une valeur "confirmée" dans `formatTermesEtatActuelLatex`
 * (`trouverR`/`trouverU1`/`formuleGenerale`/`calculerSn`/`poserEquationAlgebrique`/
 * `resoudreXAlgebrique`/`poserEquationRangN`) — les 6 autres (`termesProches`/`termeEloigne`/
 * `sommeSn`/`coherenceJugement`/`calculerTermesAlgebrique`/`resoudreRangN`) sont toujours en fin de
 * séquence (`ordreComplet`) et n'y sont donc jamais "précédentes" : même comportement repris ici
 * à l'identique (zéro ligne de récap pour elles), pas une régression introduite par ce fichier.
 *
 * `formatTermesEtatActuelLatex` retourne un tableau de valeurs dans l'ordre des phases
 * "précédentes" qui ont un formateur (silencieusement ignorées sinon) — on reconstruit donc ici la
 * même liste filtrée (`PHASES_AVEC_VALEUR_CONFIRMEE`) pour zipper chaque valeur avec son libellé
 * (`LIBELLE_PHASE_SUITE_ARITHMETIQUE`) dans le même ordre.
 *
 * Heuristique de révélation (A.5/`App5genXX.tsx` round "RecapitulatifPanel") : le moteur ne garde
 * qu'un booléen générique `derniereEtapeRevelee` (la toute dernière phase close), jamais un
 * booléen par phase — on utilise donc `scoresPartiels[phase] === 0` comme heuristique d'icône
 * (✓/✗), jamais consommée pour autre chose que l'affichage.
 */
const PHASES_AVEC_VALEUR_CONFIRMEE: PhaseSuiteArithmetique[] = [
  "trouverR",
  "trouverU1",
  "formuleGenerale",
  "calculerSn",
  "poserEquationAlgebrique",
  "resoudreXAlgebrique",
  "poserEquationRangN",
];

export function calculerRecapitulatifSuiteArithmetique(etat: EtatSessionSuiteArithmetique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const valeurs = formatTermesEtatActuelLatex(exercice, etat.phase) ?? [];
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];
  const phasesAvecValeur = precedentes.filter((phase) => PHASES_AVEC_VALEUR_CONFIRMEE.includes(phase));

  return phasesAvecValeur.map((phase, i) => ({
    libelle: LIBELLE_PHASE_SUITE_ARITHMETIQUE[phase],
    estLatex: true,
    valeur: valeurs[i],
    revele: etat.scoresPartiels[phase] === 0,
  }));
}
