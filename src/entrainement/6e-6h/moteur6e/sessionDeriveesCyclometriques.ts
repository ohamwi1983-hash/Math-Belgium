/**
 * Couche B (6e) — moteur de session pour `6gen4`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionDeriveesCyclometriques.test.ts` pour la preuve avec des exercices factices définis
 * localement.
 */
import type { ExerciceDeriveesCyclometriques } from "../core6e/deriveesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import {
  verifierADeriveeFinale,
  verifierADeriveeU,
  verifierBDeriveeArc,
  verifierBDeriveeFinale,
  verifierBDeriveeU,
  verifierCDenominateur,
  verifierCDeriveeFinale,
  verifierCNumerateur,
  verifierDBrut,
  verifierDDenominateur,
  verifierDNumerateur,
  verifierDSimplifiee,
  verifierEDeriveeFinale,
  verifierEDeriveeInterne,
  verifierFBrute,
  verifierFSimplifiee,
  verifierGDeriveeFinale,
  verifierGDeriveeInterne,
} from "./verificationDeriveesCyclometriques";
import { phaseApres, phaseInitiale } from "./typesDeriveesCyclometriques";
import type { EtatSessionDeriveesCyclometriques, PhaseDeriveesCyclometriques, ResultatExerciceDeriveesCyclometriques } from "./typesDeriveesCyclometriques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceDeriveesCyclometriques,
): Pick<EtatSessionDeriveesCyclometriques, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionDeriveesCyclometriques(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceDeriveesCyclometriques,
): EtatSessionDeriveesCyclometriques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereCloture: null, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionDeriveesCyclometriques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionDeriveesCyclometriques): EtatSessionDeriveesCyclometriques {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDeriveesCyclometriques, resultat: ResultatExerciceDeriveesCyclometriques): EtatSessionDeriveesCyclometriques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceDeriveesCyclometriques, scores: Partial<Record<PhaseDeriveesCyclometriques, number>>): ResultatExerciceDeriveesCyclometriques {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreDeriveeU: scores.aDeriveeU as number, scoreDeriveeFinale: scores.aDeriveeFinale as number };
    case "B":
      return { famille: "B", exercice, scoreDeriveeU: scores.bDeriveeU as number, scoreDeriveeArc: scores.bDeriveeArc as number, scoreDeriveeFinale: scores.bDeriveeFinale as number };
    case "C":
      return {
        famille: "C",
        exercice,
        scoreNumerateur: scores.cNumerateur as number,
        scoreDenominateur: scores.cDenominateur as number,
        scoreDeriveeFinale: scores.cDeriveeFinale as number,
      };
    case "D":
      return {
        famille: "D",
        exercice,
        scoreNumerateur: scores.dNumerateur as number,
        scoreDenominateur: scores.dDenominateur as number,
        scoreBrut: scores.dBrut as number,
        scoreSimplifiee: scores.dSimplifiee as number,
      };
    case "E":
      return { famille: "E", exercice, scoreDeriveeInterne: scores.eDeriveeInterne as number, scoreDeriveeFinale: scores.eDeriveeFinale as number };
    case "F":
      return { famille: "F", exercice, scoreBrute: scores.fBrute as number, scoreSimplifiee: scores.fSimplifiee as number };
    case "G":
      return { famille: "G", exercice, scoreDeriveeInterne: scores.gDeriveeInterne as number, scoreDeriveeFinale: scores.gDeriveeFinale as number };
  }
}

function avancerPhase(
  etat: EtatSessionDeriveesCyclometriques,
  texte: string,
  verifier: (exercice: ExerciceDeriveesCyclometriques, texte: string) => boolean,
  phaseAttendue: PhaseDeriveesCyclometriques,
): EtatSessionDeriveesCyclometriques {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const derniereCloture = { phase: etat.phase, info: { niveauAide: etat.niveauAide, revele: etapeCourante.revelee } };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant({ ...etat, derniereCloture }, construireResultat(exercice, scoresPartiels));
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereCloture };
}

function garder<T extends ExerciceDeriveesCyclometriques["famille"]>(
  exercice: ExerciceDeriveesCyclometriques,
  famille: T,
): asserts exercice is Extract<ExerciceDeriveesCyclometriques, { famille: T }> {
  if (exercice.famille !== famille) throw new Error(`attendu famille "${famille}", trouvé "${exercice.famille}"`);
}

export function soumettreReponseADeriveeU(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "A");
      return verifierADeriveeU(e, r);
    },
    "aDeriveeU",
  );
}
export function soumettreReponseADeriveeFinale(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "A");
      return verifierADeriveeFinale(e, r);
    },
    "aDeriveeFinale",
  );
}

export function soumettreReponseBDeriveeU(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "B");
      return verifierBDeriveeU(e, r);
    },
    "bDeriveeU",
  );
}
export function soumettreReponseBDeriveeArc(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "B");
      return verifierBDeriveeArc(e, r);
    },
    "bDeriveeArc",
  );
}
export function soumettreReponseBDeriveeFinale(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "B");
      return verifierBDeriveeFinale(e, r);
    },
    "bDeriveeFinale",
  );
}

export function soumettreReponseCNumerateur(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "C");
      return verifierCNumerateur(e, r);
    },
    "cNumerateur",
  );
}
export function soumettreReponseCDenominateur(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "C");
      return verifierCDenominateur(e, r);
    },
    "cDenominateur",
  );
}
export function soumettreReponseCDeriveeFinale(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "C");
      return verifierCDeriveeFinale(e, r);
    },
    "cDeriveeFinale",
  );
}

export function soumettreReponseDNumerateur(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "D");
      return verifierDNumerateur(e, r);
    },
    "dNumerateur",
  );
}
export function soumettreReponseDDenominateur(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "D");
      return verifierDDenominateur(e, r);
    },
    "dDenominateur",
  );
}
export function soumettreReponseDBrut(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "D");
      return verifierDBrut(e, r);
    },
    "dBrut",
  );
}
export function soumettreReponseDSimplifiee(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "D");
      return verifierDSimplifiee(e, r);
    },
    "dSimplifiee",
  );
}

export function soumettreReponseEDeriveeInterne(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "E");
      return verifierEDeriveeInterne(e, r);
    },
    "eDeriveeInterne",
  );
}
export function soumettreReponseEDeriveeFinale(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "E");
      return verifierEDeriveeFinale(e, r);
    },
    "eDeriveeFinale",
  );
}

export function soumettreReponseFBrute(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "F");
      return verifierFBrute(e, r);
    },
    "fBrute",
  );
}
export function soumettreReponseFSimplifiee(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "F");
      return verifierFSimplifiee(e, r);
    },
    "fSimplifiee",
  );
}

export function soumettreReponseGDeriveeInterne(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "G");
      return verifierGDeriveeInterne(e, r);
    },
    "gDeriveeInterne",
  );
}
export function soumettreReponseGDeriveeFinale(etat: EtatSessionDeriveesCyclometriques, texte: string): EtatSessionDeriveesCyclometriques {
  return avancerPhase(
    etat,
    texte,
    (e, r) => {
      garder(e, "G");
      return verifierGDeriveeFinale(e, r);
    },
    "gDeriveeFinale",
  );
}
