import { formatTermesEtatActuelSuiteGeometrique, LIBELLE_PHASE_SUITE_GEOMETRIQUE } from "./formatSuiteGeometrique";
import { ordreComplet } from "../moteur5e/typesSuiteGeometrique";
import type { EtatSessionSuiteGeometrique, PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen15 — même principe que 5gen14
 * (`recapitulatifSuiteArithmetique.ts`) : réutilise `formatTermesEtatActuelSuiteGeometrique` (déjà
 * utilisée par l'ancien bloc "état actuel", `components5e/EtatActuelSuiteGeometrique.tsx`) pour les
 * VALEURS, jamais une formule recalculée séparément.
 *
 * Seules certaines phases accumulent une valeur "confirmée" (`trouverQ`/`trouverU1(B1/B2)`/
 * `formuleGenerale(B1/B2)` pour la famille "principal" ; `calculerSn`/`poserEquationAlgebrique`/
 * `resoudreXAlgebrique` pour les familles "algebrique*" ; `poserEquationRangN` pour
 * "algebriqueRangN" — voir `formatTermesEtatActuel{Principal,Algebrique,RangN}Latex` dans
 * `ui5e/formatSuiteGeometrique.ts`) — les autres (termesProches, termeEloigne, sommeSn,
 * sommeInfinie, calculerTermesAlgebrique, resoudreRangN, chacun avec leurs variantes B1/B2) sont
 * toujours en fin de séquence et n'accumulent donc jamais : même comportement repris à l'identique.
 *
 * Heuristique de révélation : le moteur ne garde que `derniereEtapeRevelee` (générique, la toute
 * dernière phase close), jamais un booléen par phase — on utilise donc `scoresPartiels[phase] === 0`
 * comme heuristique d'icône (✓/✗), jamais consommée pour autre chose que l'affichage (même
 * convention que 5gen14).
 */
const PHASES_AVEC_VALEUR_CONFIRMEE: PhaseSuiteGeometrique[] = [
  "trouverQ",
  "trouverU1",
  "trouverU1B1",
  "trouverU1B2",
  "formuleGenerale",
  "formuleGeneraleB1",
  "formuleGeneraleB2",
  "calculerSn",
  "poserEquationAlgebrique",
  "resoudreXAlgebrique",
  "poserEquationRangN",
];

export function calculerRecapitulatifSuiteGeometrique(etat: EtatSessionSuiteGeometrique): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const valeurs = formatTermesEtatActuelSuiteGeometrique(exercice, etat.phase) ?? [];
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];
  const phasesAvecValeur = precedentes.filter((phase) => PHASES_AVEC_VALEUR_CONFIRMEE.includes(phase));

  return phasesAvecValeur.map((phase, i) => ({
    libelle: LIBELLE_PHASE_SUITE_GEOMETRIQUE[phase],
    estLatex: true,
    valeur: valeurs[i],
    revele: etat.scoresPartiels[phase] === 0,
  }));
}
