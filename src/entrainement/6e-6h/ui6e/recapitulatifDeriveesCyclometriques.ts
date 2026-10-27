import type { ExerciceDeriveesCyclometriques } from "../core6e/deriveesCyclometriques.types";
import { phaseApres, phaseInitiale } from "../moteur6e/typesDeriveesCyclometriques";
import type { EtatSessionDeriveesCyclometriques, PhaseDeriveesCyclometriques } from "../moteur6e/typesDeriveesCyclometriques";
import type { EntreeRecapitulatif } from "./recapitulatif";
import type { AideAvecLatex } from "./formatDeriveesCyclometriques";
import {
  texteAideADeriveeFinaleNiveau2,
  texteAideADeriveeUNiveau2,
  texteAideBDeriveeArcNiveau2,
  texteAideBDeriveeFinaleNiveau2,
  texteAideBDeriveeUNiveau2,
  texteAideCDenominateurNiveau2,
  texteAideCDeriveeFinaleNiveau2,
  texteAideCNumerateurNiveau2,
  texteAideDBrutNiveau2,
  texteAideDDenominateurNiveau2,
  texteAideDNumerateurNiveau2,
  texteAideDSimplifieeNiveau2,
  texteAideEDeriveeFinaleNiveau2,
  texteAideEDeriveeInterneNiveau2,
  texteAideFBruteNiveau2,
  texteAideGDeriveeFinaleNiveau2,
  texteAideGDeriveeInterneNiveau2,
} from "./formatDeriveesCyclometriques";

/**
 * Récapitulatif "Ce qu'on sait déjà" pour `6gen4`. Aucun `etatActuel(exercice, phase)` générique
 * n'existe pour ce générateur (vérifié par lecture directe) — mais chaque écran expose déjà, via
 * `texteAideXxxNiveau2`, la valeur EXACTE substituée (non la saisie de l'élève) de l'étape qui le
 * précède : c'est ce que `App6gen4.tsx::ligneEtatActuel` réutilise déjà pour construire le bloc
 * "état actuel" de l'écran suivant (voir son commentaire). On reprend donc CE MÊME mapping
 * phase → `texteAideXxxNiveau2`, par écran plutôt que groupé, car l'association est ici fiable à
 * 100% (une fonction par phase, jamais un tableau cumulatif ambigu).
 *
 * Exception : "fSimplifiee" n'a pas de forme canonique unique (plusieurs écritures équivalentes
 * acceptées, voir `texteAideFSimplifieeNiveau2` qui ne renvoie qu'un texte d'orientation, jamais de
 * LaTeX) — on reprend alors EXACTEMENT le texte déjà affiché par `reponseAttenduePhase`
 * (`App6gen4.tsx`) pour cet écran, jamais une valeur LaTeX inventée.
 *
 * `revele` vient de `etat.revelesPartiels[phase]`, peuplé depuis `etapeCourante.revelee` à la
 * clôture (`sessionDeriveesCyclometriques.ts`) — jusqu'au 2025-10, déduit de
 * `scoresPartiels[phase] === 0`, corrigé pendant le balayage générique (point A) car non fiable
 * ici : la pénalité d'aide est soustraite APRÈS le score de tentatives, donc une réussite
 * fortement aidée pouvait tomber à exactement 0 (faux "révélé").
 */

function libellePourPhase(phase: PhaseDeriveesCyclometriques, exercice: ExerciceDeriveesCyclometriques): string {
  switch (phase) {
    case "aDeriveeU":
    case "bDeriveeU":
      return "u'(x)";
    case "aDeriveeFinale":
    case "bDeriveeFinale":
    case "cDeriveeFinale":
    case "eDeriveeFinale":
    case "gDeriveeFinale":
      return "f'(x)";
    case "bDeriveeArc":
      return "[arcfonction(v(x))]'";
    case "cNumerateur":
    case "dNumerateur":
      return "N'(x)";
    case "cDenominateur":
    case "dDenominateur":
      return "D'(x)";
    case "dBrut":
    case "fBrute":
      return "f'(x) (brut)";
    case "dSimplifiee":
    case "fSimplifiee":
      return "f'(x) (simplifié)";
    case "eDeriveeInterne":
      return "w'(x)";
    case "gDeriveeInterne":
      // Libellé dépendant du sous-cas (voir `App6gen4.tsx::ligneEtatActuel`, appel pour "gDeriveeFinale") :
      // "v'(x)" si sousCas="h" (v(x)=x²+c dérivé), "u'(x)" sinon (fraction interne u=k/(x+c)).
      return exercice.famille === "G" && exercice.sousCas === "h" ? "v'(x)" : "u'(x)";
  }
}

type FragmentsRecap = Pick<EntreeRecapitulatif, "valeur" | "estLatex">;

function depuisAide(aide: AideAvecLatex): FragmentsRecap {
  return { valeur: aide.latex ?? "", estLatex: aide.latex !== null };
}

const TEXTE_F_SIMPLIFIEE = "Forme simplifiée via l'identité trigonométrique adéquate (plusieurs écritures équivalentes acceptées).";

function valeurPourPhase(exercice: ExerciceDeriveesCyclometriques, phase: PhaseDeriveesCyclometriques): FragmentsRecap {
  switch (exercice.famille) {
    case "A":
      return depuisAide(phase === "aDeriveeU" ? texteAideADeriveeUNiveau2(exercice) : texteAideADeriveeFinaleNiveau2(exercice));
    case "B":
      if (phase === "bDeriveeU") return depuisAide(texteAideBDeriveeUNiveau2(exercice));
      if (phase === "bDeriveeArc") return depuisAide(texteAideBDeriveeArcNiveau2(exercice));
      return depuisAide(texteAideBDeriveeFinaleNiveau2(exercice));
    case "C":
      if (phase === "cNumerateur") return depuisAide(texteAideCNumerateurNiveau2(exercice));
      if (phase === "cDenominateur") return depuisAide(texteAideCDenominateurNiveau2(exercice));
      return depuisAide(texteAideCDeriveeFinaleNiveau2(exercice));
    case "D":
      if (phase === "dNumerateur") return depuisAide(texteAideDNumerateurNiveau2(exercice));
      if (phase === "dDenominateur") return depuisAide(texteAideDDenominateurNiveau2(exercice));
      if (phase === "dBrut") return depuisAide(texteAideDBrutNiveau2(exercice));
      return depuisAide(texteAideDSimplifieeNiveau2(exercice));
    case "E":
      return depuisAide(phase === "eDeriveeInterne" ? texteAideEDeriveeInterneNiveau2(exercice) : texteAideEDeriveeFinaleNiveau2(exercice));
    case "F":
      if (phase === "fBrute") return depuisAide(texteAideFBruteNiveau2(exercice));
      return { valeur: TEXTE_F_SIMPLIFIEE, estLatex: false };
    case "G":
      return depuisAide(phase === "gDeriveeInterne" ? texteAideGDeriveeInterneNiveau2(exercice) : texteAideGDeriveeFinaleNiveau2(exercice));
  }
}

function sequenceReelle(exercice: ExerciceDeriveesCyclometriques): PhaseDeriveesCyclometriques[] {
  const sequence: PhaseDeriveesCyclometriques[] = [];
  let phase: PhaseDeriveesCyclometriques | "termine" = phaseInitiale(exercice);
  while (phase !== "termine") {
    sequence.push(phase);
    phase = phaseApres(phase);
  }
  return sequence;
}

export function calculerRecapitulatifDeriveesCyclometriques(etat: EtatSessionDeriveesCyclometriques): EntreeRecapitulatif[] {
  const exercice = etat.exerciceCourant;
  const sequence = sequenceReelle(exercice);
  const precedentes = sequence.slice(0, sequence.indexOf(etat.phase));

  return precedentes.map((phase) => {
    const revele = etat.revelesPartiels[phase] ?? false;
    return { libelle: libellePourPhase(phase, exercice), revele, ...valeurPourPhase(exercice, phase) };
  });
}

/** Une puce par écran RÉELLEMENT traversé par la famille de l'exercice courant (`sequenceReelle`),
 * jamais une séquence fixe commune aux 7 familles. */
export function calculerSegmentsProgressionDeriveesCyclometriques(etat: EtatSessionDeriveesCyclometriques) {
  const sequence = sequenceReelle(etat.exerciceCourant);
  return sequence.map((phase) => {
    if (phase === etat.phase) return "courante" as const;
    const score = etat.scoresPartiels[phase];
    if (score === undefined) return "a-venir" as const;
    return etat.revelesPartiels[phase] ? ("revele" as const) : ("correcte" as const);
  });
}
