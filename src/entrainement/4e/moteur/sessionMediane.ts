/**
 * Couche B — moteur de session pour "Paramètres de position" (chapitre 5, quatrième générateur,
 * renommé depuis "Médiane" — voir `core/mediane.types.ts`). N'importe jamais rien de
 * `src/generateurs/` — voir `sessionMediane.test.ts` pour la preuve avec un générateur factice,
 * même principe que les 32 autres moteurs.
 *
 * `phaseInitiale` décide de la phase de départ selon la variante — `"mediane"` (première d'une
 * séquence à 4 écrans, `q1 → q3 → minMaxMode`, ce dernier terminal) pour "discrete", `"polygone"`
 * (première d'une séquence à 5 écrans, `lectureMediane → lectureQ1 → lectureQ3 → synthese`, ce
 * dernier terminal) pour "classes" — `promptgen33modifications.md`, `promptgen33modifications2.md`,
 * puis `promptgen33ajustements.md` (point 1, réordonne les 3 écrans de lecture : Q2/médiane
 * d'abord, jamais recalculée différemment — seul l'ORDRE des transitions change ci-dessous, les 3
 * noms de phase eux-mêmes restent inchangés).
 */
import type { ExerciceMediane, GenerateurExerciceMediane } from "../core/mediane.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { EtatEtapeTentatives, ReglagesEtape } from "./etapeTentatives";
import type { ParametreLecture, PointPolygone, ReponseMediane, ReponseMinMaxMode, ReponseQ1, ReponseQ3, ReponseSynthese } from "./verificationMediane";
import { verifierLecture, verifierMediane, verifierMinMaxMode, verifierPolygone, verifierQ1, verifierQ3, verifierSynthese } from "./verificationMediane";
import type { EtatSessionMediane, PhaseMediane, ResultatExerciceMediane } from "./typesMediane";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_MEDIANE = 2;
export const NIVEAU_AIDE_MAX_Q1 = 2;
export const NIVEAU_AIDE_MAX_Q3 = 2;
export const NIVEAU_AIDE_MAX_MIN_MAX_MODE = 2;
export const NIVEAU_AIDE_MAX_POLYGONE = 1;
/** 4 (au lieu de 2) depuis `promptgen33gen35aidesinterpolation.md` — aide 3 (les 2 points
 * d'encadrement surlignés en orange sur le graphe) et aide 4 (la formule d'interpolation elle-même),
 * ajoutées SANS toucher aux aides 1/2 existantes. Pénalité additive `-20 pts/niveau` inchangée
 * (`PENALITE_PAR_NIVEAU_AIDE`, générique — aucune autre modification nécessaire dans ce fichier). */
export const NIVEAU_AIDE_MAX_LECTURE_Q1 = 4;
export const NIVEAU_AIDE_MAX_LECTURE_MEDIANE = 4;
export const NIVEAU_AIDE_MAX_LECTURE_Q3 = 4;
export const NIVEAU_AIDE_MAX_SYNTHESE = 2;

function phaseInitiale(exercice: ExerciceMediane): PhaseMediane {
  return exercice.variante === "discrete" ? "mediane" : "polygone";
}

const ETAT_TRANSITOIRE_INITIAL = {
  niveauAideMediane: 0,
  niveauAideQ1: 0,
  niveauAideQ3: 0,
  niveauAideMinMaxMode: 0,
  niveauAidePolygone: 0,
  niveauAideLectureQ1: 0,
  niveauAideLectureMediane: 0,
  niveauAideLectureQ3: 0,
  niveauAideSynthese: 0,
  scoreMedianeExercice: null,
  medianeRevele: false,
  scoreQ1Exercice: null,
  q1Revele: false,
  scoreQ3Exercice: null,
  q3Revele: false,
  scorePolygoneExercice: null,
  polygoneRevele: false,
  scoreLectureQ1Exercice: null,
  lectureQ1Revele: false,
  scoreLectureMedianeExercice: null,
  lectureMedianeRevele: false,
  scoreLectureQ3Exercice: null,
  lectureQ3Revele: false,
} as const;

export function demarrerSessionMediane(reglages: ReglagesSession, generateur: GenerateurExerciceMediane): EtatSessionMediane {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionMediane): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée ou si le
 * niveau maximal est déjà atteint (tous les écrans de ce générateur ont désormais au moins une
 * aide, contrairement à l'ancien écran "calculFinal", retiré). */
export function activerAideSuivante(etat: EtatSessionMediane): EtatSessionMediane {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "mediane") {
    if (etat.niveauAideMediane >= NIVEAU_AIDE_MAX_MEDIANE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideMediane: etat.niveauAideMediane + 1 };
  }
  if (etat.phase === "q1") {
    if (etat.niveauAideQ1 >= NIVEAU_AIDE_MAX_Q1) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideQ1: etat.niveauAideQ1 + 1 };
  }
  if (etat.phase === "q3") {
    if (etat.niveauAideQ3 >= NIVEAU_AIDE_MAX_Q3) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideQ3: etat.niveauAideQ3 + 1 };
  }
  if (etat.phase === "minMaxMode") {
    if (etat.niveauAideMinMaxMode >= NIVEAU_AIDE_MAX_MIN_MAX_MODE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideMinMaxMode: etat.niveauAideMinMaxMode + 1 };
  }
  if (etat.phase === "polygone") {
    if (etat.niveauAidePolygone >= NIVEAU_AIDE_MAX_POLYGONE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAidePolygone: etat.niveauAidePolygone + 1 };
  }
  if (etat.phase === "lectureQ1") {
    if (etat.niveauAideLectureQ1 >= NIVEAU_AIDE_MAX_LECTURE_Q1) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideLectureQ1: etat.niveauAideLectureQ1 + 1 };
  }
  if (etat.phase === "lectureMediane") {
    if (etat.niveauAideLectureMediane >= NIVEAU_AIDE_MAX_LECTURE_MEDIANE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideLectureMediane: etat.niveauAideLectureMediane + 1 };
  }
  if (etat.phase === "lectureQ3") {
    if (etat.niveauAideLectureQ3 >= NIVEAU_AIDE_MAX_LECTURE_Q3) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideLectureQ3: etat.niveauAideLectureQ3 + 1 };
  }
  if (etat.niveauAideSynthese >= NIVEAU_AIDE_MAX_SYNTHESE) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideSynthese: etat.niveauAideSynthese + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionMediane, resultat: ResultatExerciceMediane): EtatSessionMediane {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const exerciceCourant = etat.generateur();
  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_INITIAL,
  };
}

/** Première étape de la variante "discrete" — mène toujours à "q1" (jamais terminale). */
export function soumettreReponseMediane(etat: EtatSessionMediane, reponse: ReponseMediane): EtatSessionMediane {
  if (etat.terminee || etat.phase !== "mediane") {
    throw new Error("soumettreReponseMediane : la session n'est pas à l'étape mediane");
  }
  const exerciceCourant = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseMediane>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierMediane(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideMediane);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "q1",
    scoreMedianeExercice: score,
    medianeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseQ1(etat: EtatSessionMediane, reponse: ReponseQ1): EtatSessionMediane {
  if (etat.terminee || etat.phase !== "q1") {
    throw new Error("soumettreReponseQ1 : la session n'est pas à l'étape q1");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "discrete") {
    throw new Error("soumettreReponseQ1 : l'écran q1 n'existe que pour la variante discrete");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseQ1>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierQ1(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideQ1);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "q3",
    scoreQ1Exercice: score,
    q1Revele: etapeCourante.revelee,
  };
}

export function soumettreReponseQ3(etat: EtatSessionMediane, reponse: ReponseQ3): EtatSessionMediane {
  if (etat.terminee || etat.phase !== "q3") {
    throw new Error("soumettreReponseQ3 : la session n'est pas à l'étape q3");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "discrete") {
    throw new Error("soumettreReponseQ3 : l'écran q3 n'existe que pour la variante discrete");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseQ3>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierQ3(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideQ3);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "minMaxMode",
    scoreQ3Exercice: score,
    q3Revele: etapeCourante.revelee,
  };
}

/** Dernière phase de la variante "discrete" — toujours terminale. */
export function soumettreReponseMinMaxMode(etat: EtatSessionMediane, reponse: ReponseMinMaxMode): EtatSessionMediane {
  if (etat.terminee || etat.phase !== "minMaxMode") {
    throw new Error("soumettreReponseMinMaxMode : la session n'est pas à l'étape minMaxMode");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "discrete") {
    throw new Error("soumettreReponseMinMaxMode : l'écran minMaxMode n'existe que pour la variante discrete");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseMinMaxMode>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierMinMaxMode(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideMinMaxMode);

  return cloturerExerciceOuSuivant(etat, {
    variante: "discrete",
    scoreMediane: etat.scoreMedianeExercice,
    medianeRevele: etat.medianeRevele,
    niveauAideMediane: etat.niveauAideMediane,
    scoreQ1: etat.scoreQ1Exercice,
    q1Revele: etat.q1Revele,
    niveauAideQ1: etat.niveauAideQ1,
    scoreQ3: etat.scoreQ3Exercice,
    q3Revele: etat.q3Revele,
    niveauAideQ3: etat.niveauAideQ3,
    scoreMinMaxMode: score,
    minMaxModeRevele: etapeCourante.revelee,
    niveauAideMinMaxMode: etat.niveauAideMinMaxMode,
    scorePolygone: null,
    polygoneRevele: false,
    niveauAidePolygone: 0,
    scoreLectureQ1: null,
    lectureQ1Revele: false,
    niveauAideLectureQ1: 0,
    scoreLectureMediane: null,
    lectureMedianeRevele: false,
    niveauAideLectureMediane: 0,
    scoreLectureQ3: null,
    lectureQ3Revele: false,
    niveauAideLectureQ3: 0,
    scoreSynthese: null,
    syntheseRevele: false,
    niveauAideSynthese: 0,
  });
}

/** Première étape de la variante "classes" — remplace "identificationClasse", mène toujours à
 * "lectureMediane" (`promptgen33ajustements.md`, point 1 : Q2 lu en premier). Aucune saisie
 * libre : un point par classe (`PointPolygone`). */
export function soumettreReponsePolygone(etat: EtatSessionMediane, points: PointPolygone[]): EtatSessionMediane {
  if (etat.terminee || etat.phase !== "polygone") {
    throw new Error("soumettreReponsePolygone : la session n'est pas à l'étape polygone");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "classes") {
    throw new Error("soumettreReponsePolygone : l'écran polygone n'existe que pour la variante classes");
  }

  const etapeCourante = soumettreEtapeTentatives<PointPolygone[]>(etat.etapeCourante, points, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPolygone(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePolygone);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "lectureMediane",
    scorePolygoneExercice: score,
    polygoneRevele: etapeCourante.revelee,
  };
}

/** Facteur commun aux 3 écrans de lecture graphique (`lectureQ1`/`lectureMediane`/`lectureQ3`) —
 * un seul champ, tolérance ±0,1 (voir `verificationMediane.ts`). */
function soumettreReponseLecture(
  etat: EtatSessionMediane,
  phaseAttendue: "lectureQ1" | "lectureMediane" | "lectureQ3",
  parametre: ParametreLecture,
  texte: string,
): { etapeCourante: EtatEtapeTentatives; niveauAide: number } {
  if (etat.terminee || etat.phase !== phaseAttendue) {
    throw new Error(`soumettreReponseLecture : la session n'est pas à l'étape ${phaseAttendue}`);
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "classes") {
    throw new Error(`soumettreReponseLecture : l'écran ${phaseAttendue} n'existe que pour la variante classes`);
  }

  const niveauAide = phaseAttendue === "lectureQ1" ? etat.niveauAideLectureQ1 : phaseAttendue === "lectureMediane" ? etat.niveauAideLectureMediane : etat.niveauAideLectureQ3;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierLecture(exerciceCourant, parametre, r),
    revelerReponse: () => {},
  });

  return { etapeCourante, niveauAide };
}

/** `promptgen33ajustements.md`, point 1 — Q2/médiane lue en premier (jamais Q1). */
export function soumettreReponseLectureMediane(etat: EtatSessionMediane, texte: string): EtatSessionMediane {
  const { etapeCourante, niveauAide } = soumettreReponseLecture(etat, "lectureMediane", "mediane", texte);
  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "lectureQ1",
    scoreLectureMedianeExercice: score,
    lectureMedianeRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseLectureQ1(etat: EtatSessionMediane, texte: string): EtatSessionMediane {
  const { etapeCourante, niveauAide } = soumettreReponseLecture(etat, "lectureQ1", "q1", texte);
  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "lectureQ3",
    scoreLectureQ1Exercice: score,
    lectureQ1Revele: etapeCourante.revelee,
  };
}

export function soumettreReponseLectureQ3(etat: EtatSessionMediane, texte: string): EtatSessionMediane {
  const { etapeCourante, niveauAide } = soumettreReponseLecture(etat, "lectureQ3", "q3", texte);
  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, niveauAide);
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "synthese",
    scoreLectureQ3Exercice: score,
    lectureQ3Revele: etapeCourante.revelee,
  };
}

/** Dernière phase de la variante "classes" — toujours terminale (remplace "calculFinal"). */
export function soumettreReponseSynthese(etat: EtatSessionMediane, reponse: ReponseSynthese): EtatSessionMediane {
  if (etat.terminee || etat.phase !== "synthese") {
    throw new Error("soumettreReponseSynthese : la session n'est pas à l'étape synthese");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "classes") {
    throw new Error("soumettreReponseSynthese : l'écran synthese n'existe que pour la variante classes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseSynthese>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSynthese(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSynthese);

  return cloturerExerciceOuSuivant(etat, {
    variante: "classes",
    scoreMediane: null,
    medianeRevele: false,
    niveauAideMediane: 0,
    scoreQ1: null,
    q1Revele: false,
    niveauAideQ1: 0,
    scoreQ3: null,
    q3Revele: false,
    niveauAideQ3: 0,
    scoreMinMaxMode: null,
    minMaxModeRevele: false,
    niveauAideMinMaxMode: 0,
    scorePolygone: etat.scorePolygoneExercice,
    polygoneRevele: etat.polygoneRevele,
    niveauAidePolygone: etat.niveauAidePolygone,
    scoreLectureQ1: etat.scoreLectureQ1Exercice,
    lectureQ1Revele: etat.lectureQ1Revele,
    niveauAideLectureQ1: etat.niveauAideLectureQ1,
    scoreLectureMediane: etat.scoreLectureMedianeExercice,
    lectureMedianeRevele: etat.lectureMedianeRevele,
    niveauAideLectureMediane: etat.niveauAideLectureMediane,
    scoreLectureQ3: etat.scoreLectureQ3Exercice,
    lectureQ3Revele: etat.lectureQ3Revele,
    niveauAideLectureQ3: etat.niveauAideLectureQ3,
    scoreSynthese: score,
    syntheseRevele: etapeCourante.revelee,
    niveauAideSynthese: etat.niveauAideSynthese,
  });
}
