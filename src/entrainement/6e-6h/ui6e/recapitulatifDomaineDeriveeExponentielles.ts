import type { ExerciceDomaineDeriveeExponentielle } from "../core6e/domaineDeriveeExponentielles.types";
import { phaseApres, phaseInitiale } from "../moteur6e/typesDomaineDeriveeExponentielles";
import type { EtatSessionDomaineDeriveeExponentielle, PhaseDomaineDeriveeExponentielle } from "../moteur6e/typesDomaineDeriveeExponentielles";
import type { EntreeRecapitulatif } from "./recapitulatif";
import { formatEnsembleReelLatex } from "./formatEnsembleReel";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen7`. `etatActuel(exercice, phase)`
 * (`formatDomaineDeriveeExponentielles.ts`) existe mais est `null` pour LA PLUPART des écrans (voir
 * son commentaire : non-`null` UNIQUEMENT pour "cAssemblage"/"dAssemblage"/"eDerivee", et dans ce
 * cas il décrit l'étape PRÉCÉDENTE, pas l'écran lui-même) — PAS une source fiable, phase par phase,
 * de "la valeur confirmée de CET écran". La source fiable et COMPLÈTE (couvre les 15 phases) est
 * `reponseAttenduePhase` (`App6gen7.tsx`), déjà alignée sur l'ancien `ResultatPanelDomaineDeriveeExponentielle.tsx` —
 * repris ICI À L'IDENTIQUE : le domaine affiche sa vraie valeur confirmée (`exercice.domaine`),
 * tout écran de dérivée affiche un texte de confirmation générique (vérification par équivalence
 * numérique, jamais une forme canonique unique à afficher).
 *
 * `revele` — contrairement à 6gen3/6gen4/6gen14, `scoresPartiels[phase] === 0` N'EST PAS un proxy
 * fiable ici (voir le commentaire de `DetailPhaseDomaineDeriveeExponentielle`,
 * `typesDomaineDeriveeExponentielles.ts` : une pénalité d'aide peut par elle-même ramener le score
 * à 0 sans révélation). On utilise donc `detailsPartiels[phase].revele`, la source dédiée.
 */

const LIBELLE_PHASE: Record<PhaseDomaineDeriveeExponentielle, string> = {
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
};

const PHASES_DOMAINE = new Set<PhaseDomaineDeriveeExponentielle>(["aDomaine", "bDomaine", "cDomaine", "dDomaine", "eDomaine", "fDomaine"]);

const TEXTE_CONFIRMATION: Partial<Record<PhaseDomaineDeriveeExponentielle, string>> = {
  aDerivee: "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).",
  bDerivee: "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).",
  fDerivee: "Dérivée calculée directement, vérifiée par équivalence numérique avec f'(x).",
  cFacteurs: "u'(x) et v'(x), vérifiées séparément par équivalence numérique.",
  cAssemblage: "f'(x) assemblée, vérifiée par équivalence numérique.",
  dND: "N'(x) et D'(x), vérifiées séparément par équivalence numérique.",
  dAssemblage: "f'(x) assemblée via (N'D−ND')/D², vérifiée par équivalence numérique.",
  eSimplifier: "Forme simplifiée, équivalente à f(x) (jamais une recopie brute de l'énoncé).",
  eDerivee: "Dérivée de la forme simplifiée, vérifiée par équivalence numérique avec f'(x).",
};

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex">;

function valeurPourPhase(exercice: ExerciceDomaineDeriveeExponentielle, phase: PhaseDomaineDeriveeExponentielle): FragmentsRecap {
  if (PHASES_DOMAINE.has(phase)) return { valeur: formatEnsembleReelLatex(exercice.domaine), estLatex: true };
  return { valeur: TEXTE_CONFIRMATION[phase] as string, estLatex: false };
}

function sequenceReelle(exercice: ExerciceDomaineDeriveeExponentielle): PhaseDomaineDeriveeExponentielle[] {
  const sequence: PhaseDomaineDeriveeExponentielle[] = [];
  let phase: PhaseDomaineDeriveeExponentielle | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

export function calculerRecapitulatifDomaineDeriveeExponentielle(etat: EtatSessionDomaineDeriveeExponentielle): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceReelle(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.detailsPartiels[phase]?.revele ?? false;
    return { libelle: LIBELLE_PHASE[phase], revele, ...valeurPourPhase(exercice, phase) };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`sequenceReelle`). */
export function calculerSegmentsProgressionDomaineDeriveeExponentielle(etat: EtatSessionDomaineDeriveeExponentielle) {
  const sequence = sequenceReelle(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const detail = etat.detailsPartiels[phase];
    if (detail === undefined) return "a-venir" as const;
    return detail.revele ? ("revele" as const) : ("correcte" as const);
  });
}
