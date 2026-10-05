/**
 * Couche B — moteur de session pour l'exercice "Simplifier" (fractions rationnelles avec CE).
 * Phases, selon exercice.type (voir typesSimplification.ts) — "denomFactorisation"/
 * "numFactorisation" n'apparaissent que si le P2 correspondant est cas_general (prompt-
 * corrections-etat-actuel-et-duplication.md, point 1 : même step que l'exercice 1, dupliquée ici
 * faute de machine à états partagée entre générateurs) ; "numChamp2" (racines du numérateur)
 * n'apparaît, elle aussi, que si le numérateur est cas_general (prompt-generateurs123vague2.md,
 * générateur 3, point 4 — redondante avec la factorisation déjà visible dès numChamp1 pour les 3
 * autres techniques, et avec l'étape "Simplification" qui suit) :
 *   P2/P2 : denomReconnaissance→denomChamp1→denomChamp2→[denomFactorisation]→numReconnaissance→numChamp1→[numChamp2→[numFactorisation]]→simplification
 *   P1/P2 : denomReconnaissance→denomChamp1→denomChamp2→[denomFactorisation]→simplification
 *   P2/P1 : ceDirecte→numReconnaissance→numChamp1→[numChamp2→[numFactorisation]]→simplification
 * Réutilise etapeTentatives.ts (générique) et, pour les sous-étapes de factorisation,
 * verifierChampPrincipal/verifierRacines/verifierFactorisationCasGeneral de verification.ts
 * telles quelles (même vérification que l'exercice "méthode la plus rapide", voir le plan).
 * N'importe jamais rien de src/generateurs : voir sessionSimplification.test.ts pour la preuve
 * avec des générateurs factices minimaux.
 */
import type { Categorie, Exercice } from "../core/generateur.types";
import type { ExerciceSimplification, GenerateurExerciceSimplification, PolynomeLineaire } from "../core/simplification.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierChampPrincipal, verifierFactorisationCasGeneral, verifierRacines } from "./verification";
import {
  diagnostiquerMiseEnEvidenceFraction,
  diagnostiquerMiseEnEvidenceP1,
  necessiteMiseEnEvidenceP1,
  verifierCEDirecte,
  verifierSimplification,
} from "./verificationSimplification";
import { necessiteSimplification } from "./simplificationEquation";
import type { EtatSessionSimplification, PhaseSimplification, ResultatExerciceSimplification } from "./typesSimplification";

const POINTS_DE_BASE = 100;

function estPolynomeLineaire(poly: Exercice | PolynomeLineaire): poly is PolynomeLineaire {
  return "k" in poly;
}

/** Les phases de factorisation du dénominateur ne sont atteintes que quand il s'agit d'un P2. */
function denominateurP2(exercice: ExerciceSimplification): Exercice {
  if (estPolynomeLineaire(exercice.denominateur)) {
    throw new Error("denominateurP2 : le dénominateur de cet exercice est un P1");
  }
  return exercice.denominateur;
}

/** Les phases de factorisation du numérateur ne sont atteintes que quand il s'agit d'un P2. */
function numerateurP2(exercice: ExerciceSimplification): Exercice {
  if (estPolynomeLineaire(exercice.numerateur)) {
    throw new Error("numerateurP2 : le numérateur de cet exercice est un P1");
  }
  return exercice.numerateur;
}

/** La phase "denomReductionP1" n'est atteinte que quand le dénominateur est un P1 (type P2/P1). */
function denominateurP1(exercice: ExerciceSimplification): PolynomeLineaire {
  if (!estPolynomeLineaire(exercice.denominateur)) {
    throw new Error("denominateurP1 : le dénominateur de cet exercice est un P2");
  }
  return exercice.denominateur;
}

/** La phase "numReductionP1" n'est atteinte que quand le numérateur est un P1 (type P1/P2). */
function numerateurP1(exercice: ExerciceSimplification): PolynomeLineaire {
  if (!estPolynomeLineaire(exercice.numerateur)) {
    throw new Error("numerateurP1 : le numérateur de cet exercice est un P2");
  }
  return exercice.numerateur;
}

/**
 * Phase de départ : "denomReduction" seulement si le dénominateur est un P2 non réduit (voir
 * necessiteSimplification, simplificationEquation.ts), sinon "denomReconnaissance" directement
 * (P2/P2, P1/P2) ; pour P2/P1 (dénominateur P1), "denomReductionP1" en tout premier si k≠±1 (gen3
 * image 6/7 du prompt du 27/09 : avant toute autre question sur ce côté), sinon "ceDirecte"
 * directement (le numérateur, lui, n'est jamais réduit avant "ceDirecte" — voir
 * soumettreReponseCEDirecte).
 */
function phaseInitiale(exercice: ExerciceSimplification): PhaseSimplification {
  if (exercice.type === "P2/P1") {
    return necessiteMiseEnEvidenceP1(denominateurP1(exercice)) ? "denomReductionP1" : "ceDirecte";
  }
  return necessiteSimplification(denominateurP2(exercice)) ? "denomReduction" : "denomReconnaissance";
}

/** Phase suivant la clôture du dénominateur (denomChamp2 ou denomFactorisation selon la
 * catégorie) : "numReduction" seulement si le numérateur (P2/P2 uniquement) est lui-même non
 * réduit, sinon "numReconnaissance" ; pour P1/P2 (numérateur P1), "numReductionP1" si k≠±1 (gen3
 * image 6/7), sinon "simplification" directement (aucune autre étape propre à un numérateur P1). */
function prochainePhaseApresDenom(exercice: ExerciceSimplification): PhaseSimplification {
  if (exercice.type === "P1/P2") {
    return necessiteMiseEnEvidenceP1(numerateurP1(exercice)) ? "numReductionP1" : "simplification";
  }
  if (exercice.type !== "P2/P2") return "simplification";
  return necessiteSimplification(numerateurP2(exercice)) ? "numReduction" : "numReconnaissance";
}

const ETAT_TRANSITOIRE_VIERGE = {
  scoreDenomReductionExercice: null,
  scoreDenomReductionP1Exercice: null,
  scoreDenomReconnaissanceExercice: null,
  denomCategorieRevelee: false,
  scoreDenomChamp1Exercice: null,
  scoreDenomChamp2Exercice: null,
  scoreDenomFactorisationExercice: null,
  scoreCEDirecteExercice: null,
  scoreNumReductionExercice: null,
  scoreNumReductionP1Exercice: null,
  scoreNumReconnaissanceExercice: null,
  numCategorieRevelee: false,
  scoreNumChamp1Exercice: null,
  scoreNumChamp2Exercice: null,
  scoreNumFactorisationExercice: null,
  aideDenomReductionUtilisee: false,
  aideDenomReductionP1Utilisee: false,
  aideDenomChamp1Utilisee: false,
  aideDenomChamp2Utilisee: false,
  aideDenomFactorisationUtilisee: false,
  aideNumReductionUtilisee: false,
  aideNumReductionP1Utilisee: false,
  aideNumChamp1Utilisee: false,
  aideNumChamp2Utilisee: false,
  aideNumFactorisationUtilisee: false,
  aideSimplificationUtilisee: false,
} as const;

export function demarrerSessionSimplification(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceSimplification,
): EtatSessionSimplification {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionSimplification): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function garderPhase(etat: EtatSessionSimplification, phase: PhaseSimplification, nomFonction: string): void {
  if (etat.terminee || etat.phase !== phase) {
    throw new Error(`${nomFonction} : la session n'est pas à l'étape ${phase}`);
  }
}

/**
 * Étape "denomReduction" (dénominateur P2 uniquement, quand pgcd(|a|,|b|,|c|)>1 — voir
 * phaseInitiale) : demande de mettre le dénominateur en évidence (facteur commun conservé,
 * visible — ex. "2(x^2-2x-24)"), jamais de le DIVISER par ce facteur : contrairement à
 * l'équation "...=0" de gen1/gen2, ce dénominateur est celui d'une fraction dont la valeur doit
 * rester exactement celle de l'énoncé (bug confirmé empiriquement — capture d'écran utilisateur,
 * un premier essai remplaçait bel et bien le dénominateur par sa forme divisée, faisant
 * silencieusement passer (x+4)/(2x²-4x-48) à (x+4)/(x²-2x-24), une fraction différente). Ne
 * modifie donc jamais exercice.denominateur : denomReconnaissance et la suite continuent de
 * travailler sur le dénominateur d'origine, exactement comme avant l'ajout de cette étape.
 */
export function soumettreReponseDenomReduction(etat: EtatSessionSimplification, reponse: string): EtatSessionSimplification {
  garderPhase(etat, "denomReduction", "soumettreReponseDenomReduction");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceFraction(denominateurP2(etat.exerciceCourant), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "denomReconnaissance",
    scoreDenomReductionExercice: etat.aideDenomReductionUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "denomReduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomReduction(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "denomReduction", "activerAideDenomReduction");
  return { ...etat, aideDenomReductionUtilisee: true };
}

/**
 * Étape "denomReductionP1" (dénominateur P1, type P2/P1 uniquement, quand k≠±1 — voir
 * phaseInitiale) : gen3 image 6/7 du prompt du 27/09 — même principe que
 * soumettreReponseDenomReduction ci-dessus (mise en évidence du facteur commun entier, jamais de
 * division), mais pour un polynôme du 1er degré. Toujours en tout premier pour ce type de
 * fraction, avant "ceDirecte".
 */
export function soumettreReponseDenomReductionP1(etat: EtatSessionSimplification, reponse: string): EtatSessionSimplification {
  garderPhase(etat, "denomReductionP1", "soumettreReponseDenomReductionP1");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceP1(denominateurP1(etat.exerciceCourant), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "ceDirecte",
    scoreDenomReductionP1Exercice: etat.aideDenomReductionP1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "denomReductionP1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomReductionP1(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "denomReductionP1", "activerAideDenomReductionP1");
  return { ...etat, aideDenomReductionP1Utilisee: true };
}

/** Étape "denomReconnaissance" : choix de la catégorie parmi les 4, pour le dénominateur P2. */
export function soumettreChoixDenomCategorie(etat: EtatSessionSimplification, choix: Categorie): EtatSessionSimplification {
  garderPhase(etat, "denomReconnaissance", "soumettreChoixDenomCategorie");

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === denominateurP2(etat.exerciceCourant).categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "denomChamp1",
    scoreDenomReconnaissanceExercice: etapeCourante.score,
    denomCategorieRevelee: etapeCourante.revelee,
  };
}

/** Étape "denomChamp1" : "Factorise" ou "Δ =" pour le dénominateur, selon la catégorie retenue. */
export function soumettreReponseDenomChamp1(etat: EtatSessionSimplification, reponse: string): EtatSessionSimplification {
  garderPhase(etat, "denomChamp1", "soumettreReponseDenomChamp1");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(denominateurP2(etat.exerciceCourant), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "denomChamp2",
    scoreDenomChamp1Exercice: etat.aideDenomChamp1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "denomChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomChamp1(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "denomChamp1", "activerAideDenomChamp1");
  return { ...etat, aideDenomChamp1Utilisee: true };
}

/**
 * Étape "denomChamp2" : les racines du dénominateur constituent les CE de la fraction (libellé
 * adapté côté UI, mais même vérification que les racines de l'exercice 1 — voir le plan).
 */
export function soumettreReponseDenomChamp2(
  etat: EtatSessionSimplification,
  racines: [number, number],
): EtatSessionSimplification {
  garderPhase(etat, "denomChamp2", "soumettreReponseDenomChamp2");

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, denominateurP2(etat.exerciceCourant)),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const prochainePhase: PhaseSimplification =
    denominateurP2(etat.exerciceCourant).categorie === "cas_general"
      ? "denomFactorisation"
      : prochainePhaseApresDenom(etat.exerciceCourant);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: prochainePhase,
    scoreDenomChamp2Exercice: etat.aideDenomChamp2Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "denomChamp2" (CE) — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomChamp2(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "denomChamp2", "activerAideDenomChamp2");
  return { ...etat, aideDenomChamp2Utilisee: true };
}

/**
 * Étape "denomFactorisation" (dénominateur cas_general uniquement, prompt-corrections-etat-
 * actuel-et-duplication.md point 1) : a(x-x1)(x-x2) à partir des racines trouvées à l'étape
 * précédente — même principe que la nouvelle étape "factorisation" de l'exercice 1.
 */
export function soumettreReponseDenomFactorisation(
  etat: EtatSessionSimplification,
  reponse: string,
): EtatSessionSimplification {
  garderPhase(etat, "denomFactorisation", "soumettreReponseDenomFactorisation");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(denominateurP2(etat.exerciceCourant), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: prochainePhaseApresDenom(etat.exerciceCourant),
    scoreDenomFactorisationExercice: etat.aideDenomFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "denomFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideDenomFactorisation(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "denomFactorisation", "activerAideDenomFactorisation");
  return { ...etat, aideDenomFactorisationUtilisee: true };
}

/** Étape "ceDirecte" (type P2/P1 uniquement) : une seule valeur interdite, un seul champ numérique. */
export function soumettreReponseCEDirecte(etat: EtatSessionSimplification, valeur: string): EtatSessionSimplification {
  garderPhase(etat, "ceDirecte", "soumettreReponseCEDirecte");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierCEDirecte(v, etat.exerciceCourant.racineCommune),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: necessiteSimplification(numerateurP2(etat.exerciceCourant)) ? "numReduction" : "numReconnaissance",
    scoreCEDirecteExercice: etapeCourante.score,
  };
}

/**
 * Étape "numReduction" (numérateur P2 uniquement, quand pgcd(|a|,|b|,|c|)>1) : même principe que
 * soumettreReponseDenomReduction ci-dessus (mise en évidence, jamais de division qui changerait la
 * valeur de la fraction) — atteinte après "ceDirecte" (type P2/P1) ou après la clôture du
 * dénominateur (type P2/P2).
 */
export function soumettreReponseNumReduction(etat: EtatSessionSimplification, reponse: string): EtatSessionSimplification {
  garderPhase(etat, "numReduction", "soumettreReponseNumReduction");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceFraction(numerateurP2(etat.exerciceCourant), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "numReconnaissance",
    scoreNumReductionExercice: etat.aideNumReductionUtilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "numReduction" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideNumReduction(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "numReduction", "activerAideNumReduction");
  return { ...etat, aideNumReductionUtilisee: true };
}

/**
 * Étape "numReductionP1" (numérateur P1, type P1/P2 uniquement, quand k≠±1 — voir
 * prochainePhaseApresDenom) : gen3 image 6/7 du prompt du 27/09 — même principe que
 * soumettreReponseNumReduction ci-dessus, mais pour un polynôme du 1er degré. Atteinte juste avant
 * "simplification" (le numérateur P1 n'a sinon aucune étape propre).
 */
export function soumettreReponseNumReductionP1(etat: EtatSessionSimplification, reponse: string): EtatSessionSimplification {
  garderPhase(etat, "numReductionP1", "soumettreReponseNumReductionP1");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerMiseEnEvidenceP1(numerateurP1(etat.exerciceCourant), r) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplification",
    scoreNumReductionP1Exercice: etat.aideNumReductionP1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "numReductionP1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideNumReductionP1(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "numReductionP1", "activerAideNumReductionP1");
  return { ...etat, aideNumReductionP1Utilisee: true };
}

/** Étape "numReconnaissance" : choix de la catégorie parmi les 4, pour le numérateur P2. */
export function soumettreChoixNumCategorie(etat: EtatSessionSimplification, choix: Categorie): EtatSessionSimplification {
  garderPhase(etat, "numReconnaissance", "soumettreChoixNumCategorie");

  const etapeCourante = soumettreEtapeTentatives<Categorie>(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c) => c === numerateurP2(etat.exerciceCourant).categorie,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "numChamp1",
    scoreNumReconnaissanceExercice: etapeCourante.score,
    numCategorieRevelee: etapeCourante.revelee,
  };
}

/**
 * Étape "numChamp1" : "Factorise" ou "Δ =" pour le numérateur, selon la catégorie retenue.
 *
 * "numChamp2" (Racines du numérateur) est désormais sautée pour les 3 techniques dont la forme
 * factorisée rend déjà la racine immédiatement visible (produit_remarquable/binome_conjugue/
 * mise_en_evidence, prompt-generateurs123vague2.md, générateur 3, point 4) — redemander la racine
 * y serait redondant avec cette factorisation ET avec l'étape "Simplification" qui suit. Conservée
 * pour cas_general uniquement, où le calcul du discriminant ne rend jamais la racine triviale.
 */
export function soumettreReponseNumChamp1(etat: EtatSessionSimplification, reponse: string): EtatSessionSimplification {
  garderPhase(etat, "numChamp1", "soumettreReponseNumChamp1");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChampPrincipal(numerateurP2(etat.exerciceCourant), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: numerateurP2(etat.exerciceCourant).categorie === "cas_general" ? "numChamp2" : "simplification",
    scoreNumChamp1Exercice: etat.aideNumChamp1Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "numChamp1" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideNumChamp1(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "numChamp1", "activerAideNumChamp1");
  return { ...etat, aideNumChamp1Utilisee: true };
}

/** Étape "numChamp2" : ici de vraies racines (le numérateur ne contraint pas le domaine). */
export function soumettreReponseNumChamp2(
  etat: EtatSessionSimplification,
  racines: [number, number],
): EtatSessionSimplification {
  garderPhase(etat, "numChamp2", "soumettreReponseNumChamp2");

  const etapeCourante = soumettreEtapeTentatives<[number, number]>(etat.etapeCourante, racines, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierRacines(r, numerateurP2(etat.exerciceCourant)),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: numerateurP2(etat.exerciceCourant).categorie === "cas_general" ? "numFactorisation" : "simplification",
    scoreNumChamp2Exercice: etat.aideNumChamp2Utilisee ? (etapeCourante.score as number) * 0.5 : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "numChamp2" (racines) — révélation à sens unique, ×0,5 sur le score. */
export function activerAideNumChamp2(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "numChamp2", "activerAideNumChamp2");
  return { ...etat, aideNumChamp2Utilisee: true };
}

/**
 * Étape "numFactorisation" (numérateur cas_general uniquement) : a(x-x1)(x-x2) à partir des
 * racines trouvées à l'étape précédente.
 */
export function soumettreReponseNumFactorisation(
  etat: EtatSessionSimplification,
  reponse: string,
): EtatSessionSimplification {
  garderPhase(etat, "numFactorisation", "soumettreReponseNumFactorisation");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFactorisationCasGeneral(numerateurP2(etat.exerciceCourant), r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "simplification",
    scoreNumFactorisationExercice: etat.aideNumFactorisationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : etapeCourante.score,
  };
}

/** Active le bouton "Aide" de l'étape "numFactorisation" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideNumFactorisation(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "numFactorisation", "activerAideNumFactorisation");
  return { ...etat, aideNumFactorisationUtilisee: true };
}

/** Étape "simplification" : finale, clôture l'exercice et agrège tous les scores tenus jusque-là. */
export function soumettreReponseSimplification(
  etat: EtatSessionSimplification,
  numerateurSaisi: string,
  denominateurSaisi: string,
): EtatSessionSimplification {
  garderPhase(etat, "simplification", "soumettreReponseSimplification");

  const etapeCourante = soumettreEtapeTentatives<[string, string]>(
    etat.etapeCourante,
    [numerateurSaisi, denominateurSaisi],
    {
      ...reglagesEtape(etat),
      verifier: ([n, d]) => verifierSimplification(etat.exerciceCourant, n, d),
      revelerReponse: () => {},
    },
  );
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const resultat: ResultatExerciceSimplification = {
    type: etat.exerciceCourant.type,
    scoreDenomReduction: etat.scoreDenomReductionExercice,
    aideDenomReductionUtilisee: etat.aideDenomReductionUtilisee,
    scoreDenomReductionP1: etat.scoreDenomReductionP1Exercice,
    aideDenomReductionP1Utilisee: etat.aideDenomReductionP1Utilisee,
    scoreDenomReconnaissance: etat.scoreDenomReconnaissanceExercice,
    denomCategorieRevelee: etat.denomCategorieRevelee,
    scoreDenomChamp1: etat.scoreDenomChamp1Exercice,
    aideDenomChamp1Utilisee: etat.aideDenomChamp1Utilisee,
    scoreDenomChamp2: etat.scoreDenomChamp2Exercice,
    aideDenomChamp2Utilisee: etat.aideDenomChamp2Utilisee,
    scoreDenomFactorisation: etat.scoreDenomFactorisationExercice,
    aideDenomFactorisationUtilisee: etat.aideDenomFactorisationUtilisee,
    scoreCEDirecte: etat.scoreCEDirecteExercice,
    scoreNumReduction: etat.scoreNumReductionExercice,
    aideNumReductionUtilisee: etat.aideNumReductionUtilisee,
    scoreNumReductionP1: etat.scoreNumReductionP1Exercice,
    aideNumReductionP1Utilisee: etat.aideNumReductionP1Utilisee,
    scoreNumReconnaissance: etat.scoreNumReconnaissanceExercice,
    numCategorieRevelee: etat.numCategorieRevelee,
    scoreNumChamp1: etat.scoreNumChamp1Exercice,
    aideNumChamp1Utilisee: etat.aideNumChamp1Utilisee,
    scoreNumChamp2: etat.scoreNumChamp2Exercice,
    aideNumChamp2Utilisee: etat.aideNumChamp2Utilisee,
    scoreNumFactorisation: etat.scoreNumFactorisationExercice,
    aideNumFactorisationUtilisee: etat.aideNumFactorisationUtilisee,
    scoreSimplification: etat.aideSimplificationUtilisee
      ? (etapeCourante.score as number) * 0.5
      : (etapeCourante.score as number),
    aideSimplificationUtilisee: etat.aideSimplificationUtilisee,
  };

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
    phase: phaseInitiale(prochainExercice),
    etapeCourante: demarrerEtapeTentatives(),
    ...ETAT_TRANSITOIRE_VIERGE,
  };
}

/** Active le bouton "Aide" de l'étape "simplification" — révélation à sens unique, ×0,5 sur le score. */
export function activerAideSimplification(etat: EtatSessionSimplification): EtatSessionSimplification {
  garderPhase(etat, "simplification", "activerAideSimplification");
  return { ...etat, aideSimplificationUtilisee: true };
}
