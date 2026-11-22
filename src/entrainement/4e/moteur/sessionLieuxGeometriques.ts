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
 * Aide PROGRESSIVE par écran (2 niveaux chacun).
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
  | "naturesFigees"
  | "choixResolutionFige"
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
    naturesFigees: null,
    choixResolutionFige: null,
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
  };
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

  // Nature des deux lieux : choix fermé jugé à la PREMIÈRE validation, puis figé. Faux : il est
  // révélé et figé SANS consommer de tentative (les caractéristiques, saisies pour une autre nature,
  // restent à donner avec leurs trois tentatives).
  if (etat.naturesFigees === null) {
    const correct = naturesCorrectes(exercice, reponse);
    if (!correct) return { ...etat, naturesFigees: { correct: false } };
  }
  const naturesFigees = etat.naturesFigees ?? { correct: true };

  const etapeCourante = soumettreEtapeTentatives<ReponseIdentification>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIdentification(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante, naturesFigees };
  }

  const score = naturesFigees.correct ? (etapeCourante.score as number) : 0;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equations",
    scoreIdentificationExercice: score,
    identificationRevele: etapeCourante.revelee || !naturesFigees.correct,
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

  const score = etapeCourante.score as number;

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
  const bon = exercice.nombrePoints !== 0;

  // « Aucun / Au moins un » : choix fermé jugé à la PREMIÈRE validation, puis figé (G3). Faux :
  // révélé ; s'il y a des points, ils restent à donner avec leurs trois tentatives (le choix faux
  // n'en consomme aucune) ; s'il n'y en a pas, l'écran est clos (révélé).
  if (etat.choixResolutionFige === null && reponse.auMoinsUn !== bon) {
    const choixResolutionFige = { choisi: reponse.auMoinsUn, correct: false };
    if (bon) return { ...etat, choixResolutionFige };
    return cloturerResolution({ ...etat, choixResolutionFige }, 0, true);
  }
  const choixResolutionFige = etat.choixResolutionFige ?? { choisi: reponse.auMoinsUn, correct: true };

  const etapeCourante = soumettreEtapeTentatives<ReponseResolutionLieuxGeometriques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierResolution(exercice, { ...r, auMoinsUn: bon }),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante, choixResolutionFige };
  }

  return cloturerResolution(
    { ...etat, choixResolutionFige },
    choixResolutionFige.correct ? (etapeCourante.score as number) : 0,
    etapeCourante.revelee || !choixResolutionFige.correct,
  );
}

function naturesCorrectes(exercice: EtatSessionLieuxGeometriques["exerciceCourant"], reponse: ReponseIdentification): boolean {
  const t1 = exercice.lieu1.type;
  const t2 = exercice.lieu2.type;
  return (reponse.lieu1.type === t1 && reponse.lieu2.type === t2) || (reponse.lieu1.type === t2 && reponse.lieu2.type === t1);
}

function cloturerResolution(etat: EtatSessionLieuxGeometriques, score: number, revele: boolean): EtatSessionLieuxGeometriques {
  const exercice = etat.exerciceCourant;

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
    resolutionRevele: revele,
    niveauAideResolution: etat.niveauAideResolution,
  });
}
