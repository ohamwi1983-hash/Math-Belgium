import { formatTermesEtatActuelConvergence, LIBELLE_PHASE_CONVERGENCE_SUITE } from "./formatConvergenceSuites";
import { ordreComplet } from "../moteur5e/typesConvergenceSuites";
import type { EtatSessionConvergenceSuite, PhaseConvergenceSuite } from "../moteur5e/typesConvergenceSuites";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour 5gen16 — même principe que 5gen14/5gen15. Réutilise
 * `formatTermesEtatActuelConvergence` (déjà utilisée par l'ancienne fonction locale
 * `EtatActuelConvergence` de `components5e/EtapeClassificationConvergence.tsx`) pour la VALEUR,
 * jamais recalculée séparément.
 *
 * Séquences très courtes (1 écran pour "arithmetique"/"geometrique", 2 pour "quelconque") — seule
 * la phase "diviserQuelconque" accumule une valeur "confirmée" (l'expression déjà simplifiée),
 * jamais atteinte pour les 2 autres variantes ni pour "diviserQuelconque" lui-même (premier écran
 * de sa séquence) : même comportement repris ici à l'identique.
 *
 * Heuristique de révélation : le moteur ne garde que `derniereEtapeRevelee` (générique), jamais un
 * booléen par phase — `scoresPartiels[phase] === 0` pilote donc l'icône (✓/✗), même convention que
 * 5gen14/5gen15.
 */
const PHASES_AVEC_VALEUR_CONFIRMEE: PhaseConvergenceSuite[] = ["diviserQuelconque"];

export function calculerRecapitulatifConvergenceSuite(etat: EtatSessionConvergenceSuite): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const valeurs = formatTermesEtatActuelConvergence(exercice, etat.phase);
  const ordre = ordreComplet(exercice);
  const index = ordre.indexOf(etat.phase);
  const precedentes = index > 0 ? ordre.slice(0, index) : [];
  const phasesAvecValeur = precedentes.filter((phase) => PHASES_AVEC_VALEUR_CONFIRMEE.includes(phase));

  return phasesAvecValeur.map((phase, i) => ({
    libelle: LIBELLE_PHASE_CONVERGENCE_SUITE[phase],
    estLatex: true,
    valeur: valeurs[i],
    revele: etat.scoresPartiels[phase] === 0,
  }));
}
