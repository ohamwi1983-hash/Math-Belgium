import type { ExerciceDomaineDeriveeLogarithme } from "../core6e/domaineDeriveeLogarithme.types";
import { phaseApres, phaseInitiale } from "../moteur6e/typesDomaineDeriveeLogarithme";
import type { EtatSessionDomaineDeriveeLogarithme, PhaseDomaineDeriveeLogarithme } from "../moteur6e/typesDomaineDeriveeLogarithme";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen16`. Même situation que `6gen7`
 * (`recapitulatifDomaineDeriveeExponentielles.ts`) : `etatActuel(exercice, phase)`
 * (`formatDomaineDeriveeLogarithme.ts`) n'est pas une source fiable phase par phase (non-`null`
 * seulement pour quelques écrans d'assemblage, et décrit alors l'étape PRÉCÉDENTE). La source
 * fiable et COMPLÈTE (couvre les 18 phases, familles A à G) est `reponseAttenduePhase`
 * (`App6gen16.tsx`), déjà alignée sur l'ancien `ResultatPanelDomaineDeriveeLogarithme.tsx` — reprise
 * ICI À L'IDENTIQUE.
 *
 * `revele` déduit de `detailsPartiels[phase].revele` (jamais `scoresPartiels[phase] === 0`, non
 * fiable ici — même convention et même raison que `6gen7`, voir
 * `DetailPhaseDomaineDeriveeLogarithme`).
 */

const LIBELLE_PHASE: Record<PhaseDomaineDeriveeLogarithme, string> = {
  aDomaine: "Domaine",
  aDerivee: "Dérivée",
  bDomaine: "Domaine",
  bDerivee: "Dérivée",
  cDomaine: "Domaine",
  cFacteurs: "u'(x) et v'(x)",
  cAssemblage: "Dérivée assemblée",
  dDomaine: "Domaine",
  dND: "N'(x) et D'(x)",
  dAssemblage: "Dérivée assemblée",
  eDomaine: "Domaine",
  eSimplifier: "Forme simplifiée",
  eDerivee: "Dérivée",
  fDomaine: "Domaine",
  fDerivee: "Dérivée",
  gIdentifier: "u(x) et v(x)",
  gFPrimeSurF: "f'/f",
  gIsoler: "f'(x) isolée",
};

const PHASES_DOMAINE = new Set<PhaseDomaineDeriveeLogarithme>(["aDomaine", "bDomaine", "cDomaine", "dDomaine", "eDomaine", "fDomaine"]);

const TEXTE_CONFIRMATION: Partial<Record<PhaseDomaineDeriveeLogarithme, string>> = {
  aDerivee: "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).",
  bDerivee: "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).",
  fDerivee: "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).",
  cFacteurs: "u'(x) et v'(x), vérifiées séparément par équivalence numérique.",
  cAssemblage: "f'(x) assemblée, vérifiée par équivalence numérique.",
  dND: "N'(x) et D'(x), vérifiées séparément par équivalence numérique.",
  dAssemblage: "f'(x) assemblée via (N'D−ND')/D², vérifiée par équivalence numérique.",
  eSimplifier: "Forme simplifiée via les propriétés du log, jamais une recopie brute de l'énoncé.",
  eDerivee: "Dérivée de la forme simplifiée, vérifiée par équivalence numérique avec f'(x).",
  gIdentifier: "u(x) et v(x) identifiés (simplification préalable si nécessaire).",
  gFPrimeSurF: "f'/f = v'·ln(u) + v·u'/u, par dérivation logarithmique implicite.",
  gIsoler: "f' isolée en multipliant par f=u^v.",
};

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex">;

function valeurPourPhase(exercice: ExerciceDomaineDeriveeLogarithme, phase: PhaseDomaineDeriveeLogarithme): FragmentsRecap {
  if (PHASES_DOMAINE.has(phase) && exercice.famille !== "G") return { valeur: formatEnsembleReelLatex(exercice.domaine), estLatex: true };
  return { valeur: TEXTE_CONFIRMATION[phase] as string, estLatex: false };
}

function sequenceReelle(exercice: ExerciceDomaineDeriveeLogarithme): PhaseDomaineDeriveeLogarithme[] {
  const sequence: PhaseDomaineDeriveeLogarithme[] = [];
  let phase: PhaseDomaineDeriveeLogarithme | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

export function calculerRecapitulatifDomaineDeriveeLogarithme(etat: EtatSessionDomaineDeriveeLogarithme): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceReelle(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE[phase], revele, ...valeurPourPhase(exercice, phase) };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`sequenceReelle`). */
export function calculerSegmentsProgressionDomaineDeriveeLogarithme(etat: EtatSessionDomaineDeriveeLogarithme) {
  const sequence = sequenceReelle(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail === undefined) return "a-venir" as const;
    return detail.revele ? ("revele" as const) : ("correcte" as const);
  });
}
