/**
 * Couche B — moteur de session pour "L'un sans l'autre" (chapitre 3, seizième générateur).
 * N'importe jamais rien de src/generateurs — voir sessionUnSansLautre.test.ts pour la preuve avec
 * un générateur factice, même principe que les quinze autres moteurs du projet.
 *
 * 3 phases fixes, toujours dans le même ordre : carre → valeurSignee → tangente. Chaque écran
 * combine DEUX pénalités indépendantes et cumulables (promptcreationgenerateur16unsanslautre.md) :
 *  - la pénalité "Aide" habituelle du projet (révélation à sens unique) — mais ADDITIVE ici
 *    (-20 points sur 100), jamais multiplicative (×0,5) comme ailleurs dans le projet ;
 *  - une pénalité de "forme non simplifiée" (-20 points), appliquée uniquement quand la réponse
 *    QUI A RÉUSSI (etapeCourante.reussie) n'est pas dans sa forme canonique la plus simple — jamais
 *    quand l'étape se clôt par révélation (score déjà à 0, rien à détecter puisqu'aucune réponse
 *    n'a été acceptée).
 * Les deux réductions sont indépendantes et peuvent toutes deux s'appliquer sur un même écran.
 */
import type { GenerateurExerciceUnSansLautre } from "../core/unSansLautre.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { estFormeSimplifiee, verifierCarre, verifierTangente, verifierValeurSignee } from "./verificationUnSansLautre";
import type { EtatSessionUnSansLautre, ResultatExerciceUnSansLautre } from "./typesUnSansLautre";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_MECANISME = 20;

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
    simplificationCarreAppliqueeExercice: false,
    scoreValeurSigneeExercice: null,
    valeurSigneeRevele: false,
    simplificationValeurSigneeAppliqueeExercice: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionUnSansLautre): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Applique les deux pénalités additives, indépendamment cumulables, jamais sous 0. */
function appliquerPenalitesAdditives(score: number, aideUtilisee: boolean, formeNonSimplifiee: boolean): number {
  let resultat = score;
  if (aideUtilisee) resultat = Math.max(0, resultat - PENALITE_PAR_MECANISME);
  if (formeNonSimplifiee) resultat = Math.max(0, resultat - PENALITE_PAR_MECANISME);
  return resultat;
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
    simplificationCarreAppliqueeExercice: false,
    scoreValeurSigneeExercice: null,
    valeurSigneeRevele: false,
    simplificationValeurSigneeAppliqueeExercice: false,
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

  const simplificationAppliquee = etapeCourante.reussie && !estFormeSimplifiee(texte);
  const score = appliquerPenalitesAdditives(etapeCourante.score as number, etat.aideCarreUtilisee, simplificationAppliquee);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "valeurSignee",
    scoreCarreExercice: score,
    carreRevele: etapeCourante.revelee,
    simplificationCarreAppliqueeExercice: simplificationAppliquee,
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

  const simplificationAppliquee = etapeCourante.reussie && !estFormeSimplifiee(texte);
  const score = appliquerPenalitesAdditives(etapeCourante.score as number, etat.aideValeurSigneeUtilisee, simplificationAppliquee);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "tangente",
    scoreValeurSigneeExercice: score,
    valeurSigneeRevele: etapeCourante.revelee,
    simplificationValeurSigneeAppliqueeExercice: simplificationAppliquee,
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

  const simplificationAppliquee = etapeCourante.reussie && !estFormeSimplifiee(texte);
  const score = appliquerPenalitesAdditives(etapeCourante.score as number, etat.aideTangenteUtilisee, simplificationAppliquee);

  return cloturerExerciceOuSuivant(etat, {
    fonctionConnue: etat.exerciceCourant.fonctionConnue,
    scoreCarre: etat.scoreCarreExercice as number,
    carreRevele: etat.carreRevele,
    aideCarreUtilisee: etat.aideCarreUtilisee,
    simplificationCarreAppliquee: etat.simplificationCarreAppliqueeExercice,
    scoreValeurSignee: etat.scoreValeurSigneeExercice as number,
    valeurSigneeRevele: etat.valeurSigneeRevele,
    aideValeurSigneeUtilisee: etat.aideValeurSigneeUtilisee,
    simplificationValeurSigneeAppliquee: etat.simplificationValeurSigneeAppliqueeExercice,
    scoreTangente: score,
    tangenteRevele: etapeCourante.revelee,
    aideTangenteUtilisee: etat.aideTangenteUtilisee,
    simplificationTangenteAppliquee: simplificationAppliquee,
  });
}
