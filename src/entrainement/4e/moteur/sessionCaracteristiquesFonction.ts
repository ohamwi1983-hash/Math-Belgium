/**
 * Couche B — moteur de session pour "Caractéristiques d'une fonction (lecture graphique)" :
 * 6 phases fixes, toujours dans le même ordre (domaine → zéros → décroissance → ordonnée →
 * valeur → asymptotes, questions a à f du PDF) — même principe que
 * sessionFormeCanoniqueTransformations.ts, aucun saut conditionnel. N'importe jamais rien de
 * src/generateurs (voir sessionCaracteristiquesFonction.test.ts, générateur factice local).
 *
 * Aucun bouton "Aide" demandé par la spec — aucun mécanisme de révélation à sens unique avec
 * facteur ×0,5 ici, comme "Forme canonique et transformations".
 */
import type {
  GenerateurExerciceCaracteristiquesFonction,
  ReponseAsymptotesCaracteristiques,
  ReponseExistence,
  ReponseZerosCaracteristiques,
} from "../core/caracteristiquesFonction.types";
import type { Morceau } from "../core/inequation.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  verifierAsymptotesCaracteristiques,
  verifierConstanceCaracteristiques,
  verifierCroissanceCaracteristiques,
  verifierDecroissanceCaracteristiques,
  verifierDomaineCaracteristiques,
  verifierOrdonneeCaracteristiques,
  verifierValeurEnVCaracteristiques,
  verifierZerosCaracteristiques,
} from "./verificationCaracteristiquesFonction";
import type { EtatSessionCaracteristiquesFonction, ResultatExerciceCaracteristiquesFonction } from "./typesCaracteristiquesFonction";

const POINTS_DE_BASE = 100;

export function demarrerSessionCaracteristiquesFonction(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceCaracteristiquesFonction,
): EtatSessionCaracteristiquesFonction {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "domaine",
    etapeCourante: demarrerEtapeTentatives(),
    scoreDomaineExercice: null,
    domaineRevele: false,
    scoreZerosExercice: null,
    zerosRevele: false,
    scoreCroissanceExercice: null,
    croissanceRevele: false,
    scoreDecroissanceExercice: null,
    decroissanceRevele: false,
    scoreConstanceExercice: null,
    constanceRevele: false,
    scoreOrdonneeExercice: null,
    ordonneeRevele: false,
    scoreValeurExercice: null,
    valeurRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionCaracteristiquesFonction): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Étape "domaine" : toujours la première. */
export function soumettreReponseDomaine(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: Morceau[],
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "domaine") {
    throw new Error("soumettreReponseDomaine : la session n'est pas à l'étape domaine");
  }

  const etapeCourante = soumettreEtapeTentatives<Morceau[]>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDomaineCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "zeros",
    scoreDomaineExercice: etapeCourante.score,
    domaineRevele: etapeCourante.revelee,
  };
}

/** Étape "zéros" : après domaine. */
export function soumettreReponseZeros(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: ReponseZerosCaracteristiques,
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "zeros") {
    throw new Error("soumettreReponseZeros : la session n'est pas à l'étape zeros");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseZerosCaracteristiques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierZerosCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "croissance",
    scoreZerosExercice: etapeCourante.score,
    zerosRevele: etapeCourante.revelee,
  };
}

/** Étape "croissance stricte" (refonte 2, correction 7) : après zéros. */
export function soumettreReponseCroissance(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: Morceau[],
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "croissance") {
    throw new Error("soumettreReponseCroissance : la session n'est pas à l'étape croissance");
  }

  const etapeCourante = soumettreEtapeTentatives<Morceau[]>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCroissanceCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "decroissance",
    scoreCroissanceExercice: etapeCourante.score,
    croissanceRevele: etapeCourante.revelee,
  };
}

/** Étape "décroissance" : après croissance. */
export function soumettreReponseDecroissance(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: Morceau[],
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "decroissance") {
    throw new Error("soumettreReponseDecroissance : la session n'est pas à l'étape decroissance");
  }

  const etapeCourante = soumettreEtapeTentatives<Morceau[]>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDecroissanceCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "constance",
    scoreDecroissanceExercice: etapeCourante.score,
    decroissanceRevele: etapeCourante.revelee,
  };
}

/** Étape "constance" (refonte 2, correction 7) : après décroissance. */
export function soumettreReponseConstance(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: Morceau[],
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "constance") {
    throw new Error("soumettreReponseConstance : la session n'est pas à l'étape constance");
  }

  const etapeCourante = soumettreEtapeTentatives<Morceau[]>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstanceCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "ordonnee",
    scoreConstanceExercice: etapeCourante.score,
    constanceRevele: etapeCourante.revelee,
  };
}

/** Étape "ordonnée à l'origine" : après décroissance. */
export function soumettreReponseOrdonnee(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: ReponseExistence,
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "ordonnee") {
    throw new Error("soumettreReponseOrdonnee : la session n'est pas à l'étape ordonnee");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseExistence>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierOrdonneeCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "valeur",
    scoreOrdonneeExercice: etapeCourante.score,
    ordonneeRevele: etapeCourante.revelee,
  };
}

/** Étape "f(v)" : après ordonnée. */
export function soumettreReponseValeur(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: ReponseExistence,
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "valeur") {
    throw new Error("soumettreReponseValeur : la session n'est pas à l'étape valeur");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseExistence>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierValeurEnVCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "asymptotes",
    scoreValeurExercice: etapeCourante.score,
    valeurRevele: etapeCourante.revelee,
  };
}

/** Clôture l'exercice en cours et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(
  etat: EtatSessionCaracteristiquesFonction,
  resultat: ResultatExerciceCaracteristiquesFonction,
): EtatSessionCaracteristiquesFonction {
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
    phase: "domaine",
    etapeCourante: demarrerEtapeTentatives(),
    scoreDomaineExercice: null,
    domaineRevele: false,
    scoreZerosExercice: null,
    zerosRevele: false,
    scoreCroissanceExercice: null,
    croissanceRevele: false,
    scoreDecroissanceExercice: null,
    decroissanceRevele: false,
    scoreConstanceExercice: null,
    constanceRevele: false,
    scoreOrdonneeExercice: null,
    ordonneeRevele: false,
    scoreValeurExercice: null,
    valeurRevele: false,
  };
}

/** Étape "équations des asymptotes" : finale, clôture l'exercice et agrège les 8 scores. */
export function soumettreReponseAsymptotes(
  etat: EtatSessionCaracteristiquesFonction,
  reponse: ReponseAsymptotesCaracteristiques,
): EtatSessionCaracteristiquesFonction {
  if (etat.terminee || etat.phase !== "asymptotes") {
    throw new Error("soumettreReponseAsymptotes : la session n'est pas à l'étape asymptotes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseAsymptotesCaracteristiques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierAsymptotesCaracteristiques(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const resultat: ResultatExerciceCaracteristiquesFonction = {
    scoreDomaine: etat.scoreDomaineExercice as number,
    domaineRevele: etat.domaineRevele,
    scoreZeros: etat.scoreZerosExercice as number,
    zerosRevele: etat.zerosRevele,
    scoreCroissance: etat.scoreCroissanceExercice as number,
    croissanceRevele: etat.croissanceRevele,
    scoreDecroissance: etat.scoreDecroissanceExercice as number,
    decroissanceRevele: etat.decroissanceRevele,
    scoreConstance: etat.scoreConstanceExercice as number,
    constanceRevele: etat.constanceRevele,
    scoreOrdonnee: etat.scoreOrdonneeExercice as number,
    ordonneeRevele: etat.ordonneeRevele,
    scoreValeur: etat.scoreValeurExercice as number,
    valeurRevele: etat.valeurRevele,
    scoreAsymptotes: etapeCourante.score as number,
    asymptotesRevele: etapeCourante.revelee,
  };

  return cloturerExerciceOuSuivant(etat, resultat);
}
