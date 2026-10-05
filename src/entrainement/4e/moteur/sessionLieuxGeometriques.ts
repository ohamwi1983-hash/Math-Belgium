/**
 * Couche B — moteur de session pour "Lieux géométriques : intersection". N'importe jamais rien de
 * `src/generateurs/` — voir `sessionLieuxGeometriques.test.ts` pour la preuve avec un générateur
 * factice.
 *
 * **3 phases FIXES, toujours dans le même ordre** : `identification → equations → resolution` —
 * aucun saut conditionnel, contrairement à l'architecture précédente (`diagnostic`/`resolution`
 * avec saut si `nombrePoints===0`) : l'écran "resolution" est désormais TOUJOURS atteint, y compris
 * pour le sous-cas 0 point (l'élève y répond "Aucun", simplement aucun champ de point à saisir) —
 * même principe de séquence fixe que "Équation d'un cercle depuis un graphe"
 * (`sessionEquationCercle.ts`).
 *
 * Aide PROGRESSIVE par écran (2 niveaux chacun), pénalité ADDITIVE (-20 points/niveau) appliquée à
 * la clôture de l'écran concerné.
 */
import type { GenerateurExerciceLieuxGeometriques } from "../core/lieuxGeometriques.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionLieuxGeometriques, ResultatExerciceLieuxGeometriques } from "./typesLieuxGeometriques";
import {
  verifierEquations,
  verifierIdentification,
  verifierResolution,
  type ReponseEquations,
  type ReponseIdentification,
  type ReponseResolutionLieuxGeometriques,
} from "./verificationLieuxGeometriques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_IDENTIFICATION = 2;
export const NIVEAU_AIDE_MAX_EQUATIONS = 2;
export const NIVEAU_AIDE_MAX_RESOLUTION = 2;

function etatInitial(
  exercice: EtatSessionLieuxGeometriques["exerciceCourant"],
): Pick<
  EtatSessionLieuxGeometriques,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideIdentification"
  | "niveauAideEquations"
  | "niveauAideResolution"
  | "scoreIdentificationExercice"
  | "identificationRevele"
  | "scoreEquationsExercice"
  | "equationsRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: "identification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideIdentification: 0,
    niveauAideEquations: 0,
    niveauAideResolution: 0,
    scoreIdentificationExercice: null,
    identificationRevele: false,
    scoreEquationsExercice: null,
    equationsRevele: false,
  };
}

export function demarrerSessionLieuxGeometriques(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceLieuxGeometriques,
): EtatSessionLieuxGeometriques {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionLieuxGeometriques): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionLieuxGeometriques): EtatSessionLieuxGeometriques {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "identification") {
    if (etat.niveauAideIdentification >= NIVEAU_AIDE_MAX_IDENTIFICATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideIdentification: etat.niveauAideIdentification + 1 };
  }
  if (etat.phase === "equations") {
    if (etat.niveauAideEquations >= NIVEAU_AIDE_MAX_EQUATIONS) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideEquations: etat.niveauAideEquations + 1 };
  }
  if (etat.niveauAideResolution >= NIVEAU_AIDE_MAX_RESOLUTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideResolution: etat.niveauAideResolution + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLieuxGeometriques, resultat: ResultatExerciceLieuxGeometriques): EtatSessionLieuxGeometriques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatInitial(etat.generateur()),
  };
}

/** Écran "identification" — mène toujours à "equations". */
export function soumettreReponseIdentification(etat: EtatSessionLieuxGeometriques, reponse: ReponseIdentification): EtatSessionLieuxGeometriques {
  if (etat.terminee || etat.phase !== "identification") {
    throw new Error("soumettreReponseIdentification : la session n'est pas à l'étape identification");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseIdentification>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIdentification(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideIdentification);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equations",
    scoreIdentificationExercice: score,
    identificationRevele: etapeCourante.revelee,
  };
}

/** Écran "equations" — mène toujours à "resolution". */
export function soumettreReponseEquations(etat: EtatSessionLieuxGeometriques, reponse: ReponseEquations): EtatSessionLieuxGeometriques {
  if (etat.terminee || etat.phase !== "equations") {
    throw new Error("soumettreReponseEquations : la session n'est pas à l'étape equations");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseEquations>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEquations(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideEquations);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resolution",
    scoreEquationsExercice: score,
    equationsRevele: etapeCourante.revelee,
  };
}

/** Écran "resolution" (dernière phase, TOUJOURS atteinte y compris pour 0 point) — clôture
 * toujours l'exercice. */
export function soumettreReponseResolution(etat: EtatSessionLieuxGeometriques, reponse: ReponseResolutionLieuxGeometriques): EtatSessionLieuxGeometriques {
  if (etat.terminee || etat.phase !== "resolution") {
    throw new Error("soumettreReponseResolution : la session n'est pas à l'étape resolution");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseResolutionLieuxGeometriques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResolution(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideResolution);

  return cloturerExerciceOuSuivant(etat, {
    paire: exercice.paire,
    nombrePoints: exercice.nombrePoints,
    scoreIdentification: etat.scoreIdentificationExercice as number,
    identificationRevele: etat.identificationRevele,
    niveauAideIdentification: etat.niveauAideIdentification,
    scoreEquations: etat.scoreEquationsExercice as number,
    equationsRevele: etat.equationsRevele,
    niveauAideEquations: etat.niveauAideEquations,
    scoreResolution: score,
    resolutionRevele: etapeCourante.revelee,
    niveauAideResolution: etat.niveauAideResolution,
  });
}
