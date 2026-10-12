import { phaseApres, phaseInitiale } from "../moteur6e/typesHyperboliques";
import type { EtatSessionHyperboliques, PhaseHyperboliques } from "../moteur6e/typesHyperboliques";
import type { EntreeRecapitulatif } from "./recapitulatif";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen19`. Reprend EXACTEMENT, phase par phase, le texte
 * de confirmation déjà affiché par `reponseAttenduePhase` (`App6gen19.tsx`, aligné sur l'ancien
 * `ResultatPanelHyperboliques.tsx`) — jamais une cible recalculée séparément. Les 8 phases sont
 * TOUTES des textes de confirmation génériques (jamais de forme LaTeX canonique affichée, même
 * principe que les écrans de dérivée de `6gen7`/`6gen16` : vérification par équivalence/relation
 * algébrique, pas de forme unique à afficher).
 *
 * La famille A n'a qu'UN SEUL écran ("aParite", `phaseApres` retourne directement `"termine"`) :
 * elle n'apparaît donc jamais dans ce récapitulatif (jamais de phase PRÉCÉDENTE à afficher), même
 * si son libellé/texte existe ci-dessous pour rester exhaustif par rapport au type `PhaseHyperboliques`.
 *
 * `revele` déduit de `detailsPartiels[phase].revele` — jamais `scoresPartiels[phase] === 0`, non
 * fiable ici (même convention documentée que `6gen7`/`6gen16`/`6gen17`, voir
 * `DetailPhaseHyperboliques`).
 */

const LIBELLE_PHASE: Record<PhaseHyperboliques, string> = {
  aParite: "Parité",
  bIsoler: "Inconnue isolée",
  bValeurs: "Valeur(s)",
  cDerivee: "f'(x)",
  cDeriveeSeconde: "f''(x)",
  cRelation: "Coefficient k²",
  dReecriture: "f(x) réécrite",
  dLimites: "Signes des limites",
};

const TEXTE_CONFIRMATION: Record<PhaseHyperboliques, string> = {
  aParite: "Parité déterminée en comparant f(−x) à f(x) et à −f(x).",
  bIsoler: "Inconnue isolée à partir de l'identité ch²(x0)−sh²(x0)=1.",
  bValeurs: "Calculée(s) à partir de l'expression confirmée à l'étape précédente.",
  cDerivee: "f'(x) calculée via sh'=ch et ch'=sh, avec la chaîne pour l'argument kx.",
  cDeriveeSeconde: "f''(x) calculée à partir de f'(x) confirmée à l'étape précédente.",
  cRelation: "Coefficient k² identifié à partir de f''(x) confirmée à l'étape précédente.",
  dReecriture: "f(x) réécrite en termes de eˣ et e⁻ˣ.",
  dLimites: "Signe de chaque limite déduit de la forme confirmée à l'étape précédente.",
};

function sequenceReelle(exercice: EtatSessionHyperboliques["exerciceCourant"]): PhaseHyperboliques[] {
  const sequence: PhaseHyperboliques[] = [];
  let phase: PhaseHyperboliques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

export function calculerRecapitulatifHyperboliques(etat: EtatSessionHyperboliques): EntreeRecapitulatif[] {
  const sequence = sequenceReelle(etat.exerciceCourant);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE[phase], revele, valeur: TEXTE_CONFIRMATION[phase], estLatex: false };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`sequenceReelle`). */
export function calculerSegmentsProgressionHyperboliques(etat: EtatSessionHyperboliques) {
  const sequence = sequenceReelle(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail === undefined) return "a-venir" as const;
    return detail.revele ? ("revele" as const) : ("correcte" as const);
  });
}
