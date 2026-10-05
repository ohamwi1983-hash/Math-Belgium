/**
 * Couche B — moteur de session pour "Forme canonique et transformations — fonctions de référence"
 * (chapitre 2) : 6 phases fixes, toujours dans le même ordre (reconnaissance → canonique → ehChSoy
 * → th → evCvSox → tv), aucun saut conditionnel — même principe que
 * sessionFormeCanoniqueTransformations.ts, étendu d'une étape de reconnaissance (comme
 * sessionFonctionsReference.ts) et d'une étape EH/CH/SOY. N'importe jamais rien de
 * src/generateurs — voir sessionFormeCanoniqueFonctionsReference.test.ts, générateur factice local,
 * même principe que les dix autres moteurs du projet. Aucun bouton "Aide" (absent de la spec, comme
 * "Forme canonique et transformations").
 */
import type {
  FamilleReference,
  GenerateurExerciceFormeCanoniqueFonctionReference,
  ReponseCanoniqueFR,
  ReponseEhChSoy,
  ReponseEvCvSoxFR,
  ReponseThFR,
  ReponseTvFR,
} from "../core/formeCanoniqueFonctionsReference.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import {
  verifierCanoniqueFR,
  verifierEhChSoy,
  verifierEvCvSoxFR,
  verifierThFR,
  verifierTvFR,
} from "./verificationFormeCanoniqueFonctionsReference";
import type {
  EtatSessionFormeCanoniqueFonctionReference,
  ResultatExerciceFormeCanoniqueFonctionReference,
} from "./typesFormeCanoniqueFonctionsReference";

const POINTS_DE_BASE = 100;

export function demarrerSessionFormeCanoniqueFonctionReference(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceFormeCanoniqueFonctionReference,
): EtatSessionFormeCanoniqueFonctionReference {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "reconnaissance",
    etapeCourante: demarrerEtapeTentatives(),
    scoreReconnaissanceExercice: null,
    reconnaissanceRevele: false,
    scoreCanoniqueExercice: null,
    canoniqueRevele: false,
    scoreEhChSoyExercice: null,
    ehChSoyRevele: false,
    scoreThExercice: null,
    thRevele: false,
    scoreEvCvSoxExercice: null,
    evCvSoxRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionFormeCanoniqueFonctionReference) {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

export function soumettreChoixFamilleFR(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  choix: FamilleReference,
): EtatSessionFormeCanoniqueFonctionReference {
  if (etat.terminee || etat.phase !== "reconnaissance") {
    throw new Error("soumettreChoixFamilleFR : la session n'est pas à l'étape reconnaissance");
  }

  const etapeCourante = soumettreEtapeTentatives<FamilleReference>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (r) => r === etat.exerciceCourant.famille,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "canonique",
    scoreReconnaissanceExercice: etapeCourante.score,
    reconnaissanceRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseCanoniqueFR(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  reponse: ReponseCanoniqueFR,
): EtatSessionFormeCanoniqueFonctionReference {
  if (etat.terminee || etat.phase !== "canonique") {
    throw new Error("soumettreReponseCanoniqueFR : la session n'est pas à l'étape canonique");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCanoniqueFR>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCanoniqueFR(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "ehChSoy",
    scoreCanoniqueExercice: etapeCourante.score,
    canoniqueRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseEhChSoy(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  reponse: ReponseEhChSoy,
): EtatSessionFormeCanoniqueFonctionReference {
  if (etat.terminee || etat.phase !== "ehChSoy") {
    throw new Error("soumettreReponseEhChSoy : la session n'est pas à l'étape ehChSoy");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseEhChSoy>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEhChSoy(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "th",
    scoreEhChSoyExercice: etapeCourante.score,
    ehChSoyRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseThFR(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  reponse: ReponseThFR,
): EtatSessionFormeCanoniqueFonctionReference {
  if (etat.terminee || etat.phase !== "th") {
    throw new Error("soumettreReponseThFR : la session n'est pas à l'étape th");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseThFR>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierThFR(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "evCvSox",
    scoreThExercice: etapeCourante.score,
    thRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseEvCvSoxFR(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  reponse: ReponseEvCvSoxFR,
): EtatSessionFormeCanoniqueFonctionReference {
  if (etat.terminee || etat.phase !== "evCvSox") {
    throw new Error("soumettreReponseEvCvSoxFR : la session n'est pas à l'étape evCvSox");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseEvCvSoxFR>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEvCvSoxFR(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "tv",
    scoreEvCvSoxExercice: etapeCourante.score,
    evCvSoxRevele: etapeCourante.revelee,
  };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  resultat: ResultatExerciceFormeCanoniqueFonctionReference,
): EtatSessionFormeCanoniqueFonctionReference {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    phase: "reconnaissance",
    etapeCourante: demarrerEtapeTentatives(),
    scoreReconnaissanceExercice: null,
    reconnaissanceRevele: false,
    scoreCanoniqueExercice: null,
    canoniqueRevele: false,
    scoreEhChSoyExercice: null,
    ehChSoyRevele: false,
    scoreThExercice: null,
    thRevele: false,
    scoreEvCvSoxExercice: null,
    evCvSoxRevele: false,
  };
}

export function soumettreReponseTvFR(
  etat: EtatSessionFormeCanoniqueFonctionReference,
  reponse: ReponseTvFR,
): EtatSessionFormeCanoniqueFonctionReference {
  if (etat.terminee || etat.phase !== "tv") {
    throw new Error("soumettreReponseTvFR : la session n'est pas à l'étape tv");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseTvFR>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTvFR(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const resultat: ResultatExerciceFormeCanoniqueFonctionReference = {
    scoreReconnaissance: etat.scoreReconnaissanceExercice as number,
    reconnaissanceRevele: etat.reconnaissanceRevele,
    scoreCanonique: etat.scoreCanoniqueExercice as number,
    canoniqueRevele: etat.canoniqueRevele,
    scoreEhChSoy: etat.scoreEhChSoyExercice as number,
    ehChSoyRevele: etat.ehChSoyRevele,
    scoreTh: etat.scoreThExercice as number,
    thRevele: etat.thRevele,
    scoreEvCvSox: etat.scoreEvCvSoxExercice as number,
    evCvSoxRevele: etat.evCvSoxRevele,
    scoreTv: etapeCourante.score as number,
    tvRevele: etapeCourante.revelee,
  };

  return cloturerExerciceOuSuivant(etat, resultat);
}
