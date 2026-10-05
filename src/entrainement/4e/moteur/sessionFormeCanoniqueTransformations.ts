/**
 * Couche B — moteur de session pour "Forme canonique et transformations" (chapitre 1) : 4 phases
 * fixes, toujours dans le même ordre (canonique → th → evCvSox → tv), même principe que
 * sessionInequation.ts mais une étape de plus — pas de saut conditionnel. N'importe jamais rien de
 * src/generateurs : voir sessionFormeCanoniqueTransformations.test.ts pour la preuve avec un
 * générateur factice minimal, même principe que les autres moteurs du projet.
 *
 * Contrairement à "Transformations graphiques" (deux notes indépendantes sur un seul écran), la
 * spec organise ce générateur en une séquence de 4 écrans distincts — aucun bouton "Aide" n'est
 * demandé ici (absent de la spec), donc aucun mécanisme de révélation à sens unique avec facteur
 * ×0,5 n'est nécessaire, contrairement aux exercices 2/5/6/"Analyse d'une fonction".
 */
import type {
  GenerateurExerciceFormeCanoniqueTransformation,
  ReponseCanonique,
  ReponseEvCvSox,
  ReponseTh,
  ReponseTv,
} from "../core/formeCanoniqueTransformations.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  verifierCanonique,
  verifierEvCvSox,
  verifierTh,
  verifierTv,
} from "./verificationFormeCanoniqueTransformations";
import type {
  EtatSessionFormeCanoniqueTransformation,
  ResultatExerciceFormeCanoniqueTransformation,
} from "./typesFormeCanoniqueTransformations";

const POINTS_DE_BASE = 100;

export function demarrerSessionFormeCanoniqueTransformation(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceFormeCanoniqueTransformation,
): EtatSessionFormeCanoniqueTransformation {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "canonique",
    etapeCourante: demarrerEtapeTentatives(),
    scoreCanoniqueExercice: null,
    canoniqueRevele: false,
    scoreThExercice: null,
    thRevele: false,
    scoreEvCvSoxExercice: null,
    evCvSoxRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionFormeCanoniqueTransformation): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Étape "canonique" : toujours la première. */
export function soumettreReponseCanonique(
  etat: EtatSessionFormeCanoniqueTransformation,
  reponse: ReponseCanonique,
): EtatSessionFormeCanoniqueTransformation {
  if (etat.terminee || etat.phase !== "canonique") {
    throw new Error("soumettreReponseCanonique : la session n'est pas à l'étape canonique");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCanonique>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCanonique(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "th",
    scoreCanoniqueExercice: etapeCourante.score,
    canoniqueRevele: etapeCourante.revelee,
  };
}

/** Étape "th" : après canonique. */
export function soumettreReponseTh(
  etat: EtatSessionFormeCanoniqueTransformation,
  reponse: ReponseTh,
): EtatSessionFormeCanoniqueTransformation {
  if (etat.terminee || etat.phase !== "th") {
    throw new Error("soumettreReponseTh : la session n'est pas à l'étape th");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseTh>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTh(etat.exerciceCourant, r),
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

/** Étape "evCvSox" : après th. */
export function soumettreReponseEvCvSox(
  etat: EtatSessionFormeCanoniqueTransformation,
  reponse: ReponseEvCvSox,
): EtatSessionFormeCanoniqueTransformation {
  if (etat.terminee || etat.phase !== "evCvSox") {
    throw new Error("soumettreReponseEvCvSox : la session n'est pas à l'étape evCvSox");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseEvCvSox>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEvCvSox(etat.exerciceCourant, r),
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

/** Clôture l'exercice en cours et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(
  etat: EtatSessionFormeCanoniqueTransformation,
  resultat: ResultatExerciceFormeCanoniqueTransformation,
): EtatSessionFormeCanoniqueTransformation {
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
    phase: "canonique",
    etapeCourante: demarrerEtapeTentatives(),
    scoreCanoniqueExercice: null,
    canoniqueRevele: false,
    scoreThExercice: null,
    thRevele: false,
    scoreEvCvSoxExercice: null,
    evCvSoxRevele: false,
  };
}

/** Étape "tv" : finale, clôture l'exercice et agrège les 4 scores. */
export function soumettreReponseTv(
  etat: EtatSessionFormeCanoniqueTransformation,
  reponse: ReponseTv,
): EtatSessionFormeCanoniqueTransformation {
  if (etat.terminee || etat.phase !== "tv") {
    throw new Error("soumettreReponseTv : la session n'est pas à l'étape tv");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseTv>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTv(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const resultat: ResultatExerciceFormeCanoniqueTransformation = {
    scoreCanonique: etat.scoreCanoniqueExercice as number,
    canoniqueRevele: etat.canoniqueRevele,
    scoreTh: etat.scoreThExercice as number,
    thRevele: etat.thRevele,
    scoreEvCvSox: etat.scoreEvCvSoxExercice as number,
    evCvSoxRevele: etat.evCvSoxRevele,
    scoreTv: etapeCourante.score as number,
    tvRevele: etapeCourante.revelee,
  };

  return cloturerExerciceOuSuivant(etat, resultat);
}
