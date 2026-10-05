/**
 * Couche B — moteur de session pour "Analyse d'une fonction du second degré" (chapitre 1).
 * N'importe jamais rien de src/generateurs — voir sessionAnalyseFonction.test.ts pour la preuve
 * avec un générateur factice minimal, même principe que les 6 autres moteurs du projet.
 *
 * 6 étapes activables/désactivables indépendamment (etapesActives, section 9 de la spec) :
 * coefficients → allure → axeSommet → domaineImage → racines (1 à 3 sous-phases) → tableauSignes.
 * L'étape "racines" réutilise reconnaissance+factorisation+racines de l'exercice 1 (verification.ts)
 * mais jamais l'isolement (l'énoncé est toujours en forme canonique) ni la "factorisation après Δ"
 * (categorie jamais cas_general, voir generateurs/analyseFonction) — seulement 3 sous-phases. Sauf
 * pour la catégorie "irreductible" (Δ<0, prompt-cas-non-factorisable.md) : une seule sous-phase
 * (reconnaissance), les deux autres (factorisation, racines) n'ayant pas de sens quand la fonction
 * n'a aucune racine réelle — voir soumettreChoixRacinesCategorie.
 * L'étape "tableauSignes" (6) est le tableau "signe et variation" (section 8,
 * prompt-8-corrections-analyse-fonction.md) : soumise en un seul essai global, comme la grille de
 * l'exercice 5.
 */
import type { Categorie } from "../core/generateur.types";
import type {
  ChoixAllure,
  EtapeAnalyseFonction,
  GenerateurExerciceAnalyseFonction,
  ReponseAxeSommet,
  ReponseCoefficients,
} from "../core/analyseFonction.types";
import { ORDRE_ETAPES_ANALYSE_FONCTION } from "../core/analyseFonction.types";
import type { Morceau } from "../core/inequation.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierChampPrincipal, verifierRacines } from "./verification";
import {
  verifierAllure,
  verifierAxeSommet,
  verifierCoefficients,
  verifierGrilleSigneVariation,
  verifierImage,
} from "./verificationAnalyseFonction";
import type { ReponseGrilleSigneVariation } from "./verificationAnalyseFonction";
import type { EtatSessionAnalyseFonction, PhaseAnalyseFonction, ResultatExerciceAnalyseFonction } from "./typesAnalyseFonction";

const POINTS_DE_BASE = 100;

function phaseDeEtape(etape: EtapeAnalyseFonction): PhaseAnalyseFonction {
  return etape === "racines" ? "racinesReconnaissance" : (etape as PhaseAnalyseFonction);
}

/** Première étape active à partir de (exclu) `apres`, ou null s'il n'en reste aucune. */
function prochaineEtapeActive(
  etapesActives: Record<EtapeAnalyseFonction, boolean>,
  apres: EtapeAnalyseFonction | null,
): EtapeAnalyseFonction | null {
  const idxDepart = apres === null ? 0 : ORDRE_ETAPES_ANALYSE_FONCTION.indexOf(apres) + 1;
  for (let i = idxDepart; i < ORDRE_ETAPES_ANALYSE_FONCTION.length; i++) {
    if (etapesActives[ORDRE_ETAPES_ANALYSE_FONCTION[i]]) return ORDRE_ETAPES_ANALYSE_FONCTION[i];
  }
  return null;
}

/** Au moins une étape doit être active (réglage du professeur) — voir section 9 de la spec. */
function phaseInitiale(etapesActives: Record<EtapeAnalyseFonction, boolean>): PhaseAnalyseFonction {
  const etape = prochaineEtapeActive(etapesActives, null);
  if (etape === null) {
    throw new Error("phaseInitiale : au moins une étape doit être active dans etapesActives");
  }
  return phaseDeEtape(etape);
}

export function demarrerSessionAnalyseFonction(
  reglages: ReglagesSession,
  etapesActives: Record<EtapeAnalyseFonction, boolean>,
  generateur: GenerateurExerciceAnalyseFonction,
): EtatSessionAnalyseFonction {
  const exerciceCourant = generateur();
  return {
    reglages,
    etapesActives,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(etapesActives),
    etapeCourante: demarrerEtapeTentatives(),
    aideCoefficientsUtilisee: false,
    aideAxeSommetUtilisee: false,
    aideDomaineImageUtilisee: false,
    aideTableauSignesUtilisee: false,
    coefficientsRevele: false,
    allureRevele: false,
    axeSommetRevele: false,
    domaineImageRevele: false,
    racinesReconnaissanceRevele: false,
    racinesChamp1Revele: false,
    racinesChamp2Revele: false,
    tableauSignesRevele: false,
    scoreCoefficientsExercice: null,
    scoreAllureExercice: null,
    scoreAxeSommetExercice: null,
    scoreDomaineImageExercice: null,
    scoreRacinesReconnaissanceExercice: null,
    scoreRacinesChamp1Exercice: null,
    scoreRacinesChamp2Exercice: null,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionAnalyseFonction): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Clôture l'exercice en cours et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(
  etat: EtatSessionAnalyseFonction,
  resultat: ResultatExerciceAnalyseFonction,
): EtatSessionAnalyseFonction {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const prochainExercice = etat.generateur();

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: prochainExercice,
    phase: phaseInitiale(etat.etapesActives),
    etapeCourante: demarrerEtapeTentatives(),
    aideCoefficientsUtilisee: false,
    aideAxeSommetUtilisee: false,
    aideDomaineImageUtilisee: false,
    aideTableauSignesUtilisee: false,
    coefficientsRevele: false,
    allureRevele: false,
    axeSommetRevele: false,
    domaineImageRevele: false,
    racinesReconnaissanceRevele: false,
    racinesChamp1Revele: false,
    racinesChamp2Revele: false,
    tableauSignesRevele: false,
    scoreCoefficientsExercice: null,
    scoreAllureExercice: null,
    scoreAxeSommetExercice: null,
    scoreDomaineImageExercice: null,
    scoreRacinesReconnaissanceExercice: null,
    scoreRacinesChamp1Exercice: null,
    scoreRacinesChamp2Exercice: null,
  };
}

/** Avance vers l'étape suivante active après `etapeActuelle`, ou clôture l'exercice s'il n'en reste aucune. */
function avancerApres(
  etat: EtatSessionAnalyseFonction,
  etapeActuelle: EtapeAnalyseFonction,
  resultatPartiel: Omit<ResultatExerciceAnalyseFonction, "scoreTableauSignes" | "tableauSignesRevele" | "aideTableauSignesUtilisee">,
): EtatSessionAnalyseFonction {
  const suivante = prochaineEtapeActive(etat.etapesActives, etapeActuelle);
  if (suivante === null) {
    return cloturerExerciceOuSuivant(etat, { ...resultatPartiel, scoreTableauSignes: null, tableauSignesRevele: false, aideTableauSignesUtilisee: false });
  }
  return { ...etat, phase: phaseDeEtape(suivante), etapeCourante: demarrerEtapeTentatives() };
}

/**
 * Reconstruit le résultat partiel courant à partir des scores déjà clos de l'exercice en cours —
 * toujours actualisé au fil des étapes, jamais recalculé depuis zéro (même principe que les
 * récapitulatifs du reste du projet : la seule source de vérité, c'est ce que le moteur a déjà
 * tracké).
 */
function resultatPartielCourant(etat: EtatSessionAnalyseFonction): Omit<ResultatExerciceAnalyseFonction, "scoreTableauSignes" | "tableauSignesRevele" | "aideTableauSignesUtilisee"> {
  return {
    categorie: etat.exerciceCourant.exercice.categorie,
    scoreCoefficients: etat.scoreCoefficientsExercice,
    coefficientsRevele: etat.coefficientsRevele,
    aideCoefficientsUtilisee: etat.aideCoefficientsUtilisee,
    scoreAllure: etat.scoreAllureExercice,
    allureRevele: etat.allureRevele,
    scoreAxeSommet: etat.scoreAxeSommetExercice,
    axeSommetRevele: etat.axeSommetRevele,
    aideAxeSommetUtilisee: etat.aideAxeSommetUtilisee,
    scoreDomaineImage: etat.scoreDomaineImageExercice,
    domaineImageRevele: etat.domaineImageRevele,
    aideDomaineImageUtilisee: etat.aideDomaineImageUtilisee,
    scoreRacinesReconnaissance: etat.scoreRacinesReconnaissanceExercice,
    racinesReconnaissanceRevele: etat.racinesReconnaissanceRevele,
    scoreRacinesChamp1: etat.scoreRacinesChamp1Exercice,
    racinesChamp1Revele: etat.racinesChamp1Revele,
    scoreRacinesChamp2: etat.scoreRacinesChamp2Exercice,
    racinesChamp2Revele: etat.racinesChamp2Revele,
  };
}

/** Étape "coefficients" (1) : les 3 champs a, b, c validés en un seul essai. */
export function soumettreReponseCoefficients(
  etat: EtatSessionAnalyseFonction,
  reponse: ReponseCoefficients,
): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "coefficients") {
    throw new Error("soumettreReponseCoefficients : la session n'est pas à l'étape coefficients");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCoefficients>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCoefficients(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etat.aideCoefficientsUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);
  const etatFerme = { ...etat, scoreCoefficientsExercice: score, coefficientsRevele: etapeCourante.revelee };
  return avancerApres(etatFerme, "coefficients", resultatPartielCourant(etatFerme));
}

/** Bouton "Aide" de l'étape coefficients : révélation à sens unique, ×0,5 au score final. */
export function activerAideCoefficients(etat: EtatSessionAnalyseFonction): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "coefficients") {
    throw new Error("activerAideCoefficients : la session n'est pas à l'étape coefficients");
  }
  return { ...etat, aideCoefficientsUtilisee: true };
}

/** Étape "allure" (2) : signe de a et signe de a·b validés en un seul essai. */
export function soumettreReponseAllure(etat: EtatSessionAnalyseFonction, reponse: ChoixAllure): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "allure") {
    throw new Error("soumettreReponseAllure : la session n'est pas à l'étape allure");
  }

  const etapeCourante = soumettreEtapeTentatives<ChoixAllure>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierAllure(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const etatFerme = { ...etat, scoreAllureExercice: etapeCourante.score, allureRevele: etapeCourante.revelee };
  return avancerApres(etatFerme, "allure", resultatPartielCourant(etatFerme));
}

/** Bouton "Aide" de l'étape axeSommet : révélation à sens unique, ×0,5 au score final. */
export function activerAideAxeSommet(etat: EtatSessionAnalyseFonction): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "axeSommet") {
    throw new Error("activerAideAxeSommet : la session n'est pas à l'étape axeSommet");
  }
  return { ...etat, aideAxeSommetUtilisee: true };
}

/** Étape "axeSommet" (3) : AS≡, xS et yS validés en un seul essai. */
export function soumettreReponseAxeSommet(
  etat: EtatSessionAnalyseFonction,
  reponse: ReponseAxeSommet,
): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "axeSommet") {
    throw new Error("soumettreReponseAxeSommet : la session n'est pas à l'étape axeSommet");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseAxeSommet>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierAxeSommet(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etat.aideAxeSommetUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);
  const etatFerme = { ...etat, scoreAxeSommetExercice: score, axeSommetRevele: etapeCourante.revelee };
  return avancerApres(etatFerme, "axeSommet", resultatPartielCourant(etatFerme));
}

/** Bouton "Aide" de l'étape domaineImage : révélation à sens unique, ×0,5 au score final. */
export function activerAideDomaineImage(etat: EtatSessionAnalyseFonction): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "domaineImage") {
    throw new Error("activerAideDomaineImage : la session n'est pas à l'étape domaineImage");
  }
  return { ...etat, aideDomaineImageUtilisee: true };
}

/** Étape "domaineImage" (4) : domf est une information donnée, seule imf est notée. */
export function soumettreReponseImage(etat: EtatSessionAnalyseFonction, reponse: Morceau): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "domaineImage") {
    throw new Error("soumettreReponseImage : la session n'est pas à l'étape domaineImage");
  }

  const etapeCourante = soumettreEtapeTentatives<Morceau>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierImage(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etat.aideDomaineImageUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);
  const etatFerme = { ...etat, scoreDomaineImageExercice: score, domaineImageRevele: etapeCourante.revelee };
  return avancerApres(etatFerme, "domaineImage", resultatPartielCourant(etatFerme));
}

/**
 * Étape "racines" (5), sous-phase 1/3 : choix de la méthode parmi les 3 techniques sans Δ, plus
 * "irreductible" (prompt-cas-non-factorisable.md). Si la catégorie *confirmée* de l'exercice
 * (jamais le choix de l'élève, correct ou non — c'est la vérité qui décide, pas la réponse
 * donnée) est "irreductible", il n'y a rien à factoriser ni aucune racine à trouver : les
 * sous-phases champ1/champ2 sont sautées, direction la prochaine étape active (normalement
 * tableauSignes) — mêmes scores `null` que pour toute étape sautée ailleurs dans le projet.
 */
export function soumettreChoixRacinesCategorie(
  etat: EtatSessionAnalyseFonction,
  choix: Categorie,
): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "racinesReconnaissance") {
    throw new Error("soumettreChoixRacinesCategorie : la session n'est pas à l'étape de reconnaissance des racines");
  }

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === etat.exerciceCourant.exercice.categorie,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const etatFerme = { ...etat, scoreRacinesReconnaissanceExercice: etapeCourante.score, racinesReconnaissanceRevele: etapeCourante.revelee };

  if (etat.exerciceCourant.exercice.categorie === "irreductible") {
    return avancerApres(etatFerme, "racines", resultatPartielCourant(etatFerme));
  }

  return { ...etatFerme, etapeCourante: demarrerEtapeTentatives(), phase: "racinesChamp1" };
}

/** Étape "racines" (5), sous-phase 2/3 : "Factorise l'équation" (jamais "Δ =", cas_general exclu). */
export function soumettreReponseRacinesChamp1(etat: EtatSessionAnalyseFonction, reponse: string): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "racinesChamp1") {
    throw new Error("soumettreReponseRacinesChamp1 : la session n'est pas à l'étape champ1 des racines");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(etat.exerciceCourant.exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "racinesChamp2",
    scoreRacinesChamp1Exercice: etapeCourante.score,
    racinesChamp1Revele: etapeCourante.revelee,
  };
}

/** Étape "racines" (5), sous-phase 3/3 : les racines, dernière sous-phase de l'étape. */
export function soumettreReponseRacinesChamp2(
  etat: EtatSessionAnalyseFonction,
  racines: [number, number],
): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "racinesChamp2") {
    throw new Error("soumettreReponseRacinesChamp2 : la session n'est pas à l'étape champ2 des racines");
  }

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, etat.exerciceCourant.exercice),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const etatFerme = { ...etat, scoreRacinesChamp2Exercice: etapeCourante.score, racinesChamp2Revele: etapeCourante.revelee };
  return avancerApres(etatFerme, "racines", resultatPartielCourant(etatFerme));
}

/**
 * Étape "tableauSignes" (6, dernière phase atteignable) : le tableau "signe et variation" (2
 * lignes) validé en un seul essai global — même principe que verifierGrille (exercice 5). Ne
 * redemande jamais le signe de a ni les racines (déjà confirmés aux étapes 2/5 si actives) :
 * exercice.grilleSigneVariation est calculée une fois pour toutes à la génération, à partir des
 * vraies valeurs, indépendamment de ce que ces étapes ont noté.
 */
export function soumettreReponseTableauSigneVariation(
  etat: EtatSessionAnalyseFonction,
  reponse: ReponseGrilleSigneVariation,
): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "tableauSignes") {
    throw new Error("soumettreReponseTableauSigneVariation : la session n'est pas à l'étape tableauSignes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseGrilleSigneVariation>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierGrilleSigneVariation(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etat.aideTableauSignesUtilisee ? (etapeCourante.score as number) * 0.5 : (etapeCourante.score as number);
  return cloturerExerciceOuSuivant(etat, {
    ...resultatPartielCourant(etat),
    scoreTableauSignes: score,
    tableauSignesRevele: etapeCourante.revelee,
    aideTableauSignesUtilisee: etat.aideTableauSignesUtilisee,
  });
}

/** Bouton "Aide" de l'étape tableauSignes : révélation à sens unique, ×0,5 au score final. */
export function activerAideTableauSignes(etat: EtatSessionAnalyseFonction): EtatSessionAnalyseFonction {
  if (etat.terminee || etat.phase !== "tableauSignes") {
    throw new Error("activerAideTableauSignes : la session n'est pas à l'étape tableauSignes");
  }
  return { ...etat, aideTableauSignesUtilisee: true };
}
