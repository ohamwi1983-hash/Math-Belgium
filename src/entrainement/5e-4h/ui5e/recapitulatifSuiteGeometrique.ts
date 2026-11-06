import { formatTermesReponseAttendueSuiteGeometrique, LIBELLE_PHASE_SUITE_GEOMETRIQUE } from "./formatSuiteGeometrique";
import { ordreComplet } from "../moteur5e/typesSuiteGeometrique";
import type { EtatSessionSuiteGeometrique, PhaseSuiteGeometrique } from "../moteur5e/typesSuiteGeometrique";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen15 — même principe que 5gen14
 * (`recapitulatifSuiteArithmetique.ts`) : la valeur de chaque phase vient de
 * `formatTermesReponseAttendueSuiteGeometrique` (la réponse attendue de CETTE phase), jamais une
 * formule recalculée séparément.
 *
 * Seules certaines phases accumulent une valeur "confirmée" (`trouverQ`/`trouverU1(B1/B2)`/
 * `formuleGenerale(B1/B2)` pour la famille "principal" ; `calculerSn`/`poserEquationAlgebrique`/
 * `resoudreXAlgebrique` pour les familles "algebrique*" ; `poserEquationRangN` pour
 * "algebriqueRangN" — voir `formatTermesEtatActuel{Principal,Algebrique,RangN}Latex` dans
 * `ui5e/formatSuiteGeometrique.ts`) — les autres (termesProches, termeEloigne, sommeSn,
 * sommeInfinie, calculerTermesAlgebrique, resoudreRangN, chacun avec leurs variantes B1/B2) sont
 * toujours en fin de séquence et n'accumulent donc jamais : même comportement repris à l'identique.
 *
 * Icône (✓/✗) pilotée par `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à
 * la clôture de chaque phase (`sessionSuiteGeometrique.ts::soumettreEcran`).
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
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];
  const phasesAvecValeur = precedentes.filter((phase) => PHASES_AVEC_VALEUR_CONFIRMEE.includes(phase));

  // Valeur de CHAQUE phase calculée pour elle-même (même source que la réponse attendue) — l'ancien
  // appariement par position avec l'« état actuel » de l'écran courant décalait les lignes, puis
  // plantait l'appli (valeur `undefined`), dès qu'il y avait deux suites (q et −q) : l'état actuel
  // d'un écran de la 2e suite ne contient pas u₁ ni la formule de la 1re.
  return phasesAvecValeur.map((phase) => ({
    libelle: LIBELLE_PHASE_SUITE_GEOMETRIQUE[phase],
    estLatex: true,
    valeur: formatTermesReponseAttendueSuiteGeometrique(exercice, phase).join("\\text{ ou }"),
    revele: etat.revelesPartiels[phase] ?? false,
  }));
}
