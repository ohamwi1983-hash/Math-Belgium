/**
 * Couche B — moteur de session pour "L'un sans l'autre" (chapitre 3, seizième générateur).
 * N'importe jamais rien de src/generateurs — voir sessionUnSansLautre.test.ts pour la preuve avec
 * un générateur factice, même principe que les quinze autres moteurs du projet.
 *
 * 3 phases fixes, toujours dans le même ordre : carre → valeurSignee → tangente. Un bouton
 * "Aide" par écran (révélation à sens unique), sans pénalité (générateurs d'apprentissage).
 */
import type { GenerateurExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierCarre, verifierTangente, verifierValeurSignee } from "./verificationUnSansLautre";
import type { EtatSessionUnSansLautre, ResultatExerciceUnSansLautre } from "./typesUnSansLautre";

const POINTS_DE_BASE = 100;

export function demarrerSessionUnSansLautre(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceUnSansLautre,
): EtatSessionUnSansLautre {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "carre",
    etapeCourante: demarrerEtapeTentatives(),
    aideCarreUtilisee: false,
    aideValeurSigneeUtilisee: false,
    aideTangenteUtilisee: false,
    scoreCarreExercice: null,
    carreRevele: false,
    scoreValeurSigneeExercice: null,
    valeurSigneeRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionUnSansLautre): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
  };
}

/** Bouton "Aide" — un par écran, révélation à sens unique — active uniquement le flag correspondant
 * à `etat.phase`, sans jamais affecter les autres écrans (même principe que "Valeurs remarquables"). */
export function activerAide(etat: EtatSessionUnSansLautre): EtatSessionUnSansLautre {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  switch (etat.phase) {
    case "carre":
      return { ...etat, aideCarreUtilisee: true };
    case "valeurSignee":
      return { ...etat, aideValeurSigneeUtilisee: true };
    case "tangente":
      return { ...etat, aideTangenteUtilisee: true };
  }
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionUnSansLautre,
  resultat: ResultatExerciceUnSansLautre,
): EtatSessionUnSansLautre {
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
    phase: "carre",
    etapeCourante: demarrerEtapeTentatives(),
    aideCarreUtilisee: false,
    aideValeurSigneeUtilisee: false,
    aideTangenteUtilisee: false,
    scoreCarreExercice: null,
    carreRevele: false,
    scoreValeurSigneeExercice: null,
    valeurSigneeRevele: false,
  };
}

export function soumettreReponseCarre(etat: EtatSessionUnSansLautre, texte: string): EtatSessionUnSansLautre {
  if (etat.terminee || etat.phase !== "carre") {
    throw new Error("soumettreReponseCarre : la session n'est pas à l'étape carré");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierCarre(etat.exerciceCourant, t),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "valeurSignee",
    scoreCarreExercice: score,
    carreRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseValeurSignee(etat: EtatSessionUnSansLautre, texte: string): EtatSessionUnSansLautre {
  if (etat.terminee || etat.phase !== "valeurSignee") {
    throw new Error("soumettreReponseValeurSignee : la session n'est pas à l'étape valeur signée");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierValeurSignee(etat.exerciceCourant, t),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "tangente",
    scoreValeurSigneeExercice: score,
    valeurSigneeRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseTangente(etat: EtatSessionUnSansLautre, texte: string): EtatSessionUnSansLautre {
  if (etat.terminee || etat.phase !== "tangente") {
    throw new Error("soumettreReponseTangente : la session n'est pas à l'étape tangente");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierTangente(etat.exerciceCourant, t),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return cloturerExerciceOuSuivant(etat, {
    fonctionConnue: etat.exerciceCourant.fonctionConnue,
    scoreCarre: etat.scoreCarreExercice as number,
    carreRevele: etat.carreRevele,
    aideCarreUtilisee: etat.aideCarreUtilisee,
    scoreValeurSignee: etat.scoreValeurSigneeExercice as number,
    valeurSigneeRevele: etat.valeurSigneeRevele,
    aideValeurSigneeUtilisee: etat.aideValeurSigneeUtilisee,
    scoreTangente: score,
    tangenteRevele: etapeCourante.revelee,
    aideTangenteUtilisee: etat.aideTangenteUtilisee,
  });
}
