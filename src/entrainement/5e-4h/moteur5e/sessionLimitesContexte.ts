/**
 * Couche B (5e) — moteur de session pour 5gen23 ("Limites et asymptotes en contexte"). N'importe
 * jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesLimitesContexte";
import type { EtatSessionLimitesContexte, PhaseLimitesContexte, ResultatExerciceLimitesContexte } from "./typesLimitesContexte";
import {
  diagnostiquerConstructionC,
  diagnostiquerEvaluerSeuil,
  diagnostiquerNombreArrondiUnite,
  diagnostiquerNombreExact,
  diagnostiquerQuotient,
  verifierInterpretation,
} from "./verificationLimitesContexte";
import type { ReponseEvaluerSeuil } from "./verificationLimitesContexte";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran), comme 5gen20/5gen21. */
export const NIVEAU_AIDE_MAX_LIMITES_CONTEXTE = 2;

export function niveauAideMaxLimitesContexte(): number {
  return NIVEAU_AIDE_MAX_LIMITES_CONTEXTE;
}

function etatInitial(exercice: ExerciceLimitesContexte): Pick<EtatSessionLimitesContexte, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionLimitesContexte(reglages: ReglagesSession5e, generateur: () => ExerciceLimitesContexte): EtatSessionLimitesContexte {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLimitesContexte): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionLimitesContexte): EtatSessionLimitesContexte {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_LIMITES_CONTEXTE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLimitesContexte, resultat: ResultatExerciceLimitesContexte, revele: boolean): EtatSessionLimitesContexte {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionLimitesContexte, phaseAttendue: PhaseLimitesContexte, reponse: T, verifier: (r: T) => boolean): EtatSessionLimitesContexte {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Famille A — "Prix de revient".
// ============================================================================

export function soumettreReponseAsymptoteHorizontale(etat: EtatSessionLimitesContexte, texte: string): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "prixRevient") throw new Error("soumettreReponseAsymptoteHorizontale : famille inattendue");
  const { b } = etat.exerciceCourant;
  return soumettreEcran(etat, "asymptoteHorizontale", texte, (t) => diagnostiquerNombreExact(t, b) === "correct");
}

export function soumettreReponseVASens(etat: EtatSessionLimitesContexte, indexChoisi: number | null): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "prixRevient") throw new Error("soumettreReponseVASens : famille inattendue");
  const { optionsVASens } = etat.exerciceCourant;
  return soumettreEcran(etat, "vaSens", indexChoisi, (i) => verifierInterpretation(optionsVASens, i));
}

// ============================================================================
// Famille B — "Eau salée".
// ============================================================================

export function soumettreReponseConstruireC(etat: EtatSessionLimitesContexte, texte: string): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "eauSalee") throw new Error("soumettreReponseConstruireC : famille inattendue");
  const { v0, r, c } = etat.exerciceCourant;
  return soumettreEcran(etat, "construireC", texte, (t) => diagnostiquerConstructionC(t, v0, r, c) === "correct");
}

export function soumettreReponseLimiteC(etat: EtatSessionLimitesContexte, texte: string): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "eauSalee") throw new Error("soumettreReponseLimiteC : famille inattendue");
  const { c } = etat.exerciceCourant;
  return soumettreEcran(etat, "limiteC", texte, (t) => diagnostiquerNombreExact(t, c) === "correct");
}

// ============================================================================
// Famille C — "Club de loisirs".
// ============================================================================

export interface ReponseEvaluerClub {
  valeurZero: string;
  valeurX: string;
}

export function soumettreReponseEvaluer(etat: EtatSessionLimitesContexte, reponse: ReponseEvaluerClub): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "clubLoisirs") throw new Error("soumettreReponseEvaluer : famille inattendue");
  const { a, b, c, d, facteur, xEval } = etat.exerciceCourant;
  const f0 = (b - c / d) * facteur;
  const fX = (a * xEval + b - c / (xEval + d)) * facteur;
  return soumettreEcran(
    etat,
    "evaluer",
    reponse,
    (r) => diagnostiquerNombreArrondiUnite(r.valeurZero, f0) === "correct" && diagnostiquerNombreArrondiUnite(r.valeurX, fX) === "correct",
  );
}

export function soumettreReponseInequation(etat: EtatSessionLimitesContexte, texte: string): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "clubLoisirs") throw new Error("soumettreReponseInequation : famille inattendue");
  const { moisAttendu } = etat.exerciceCourant;
  return soumettreEcran(etat, "inequation", texte, (t) => diagnostiquerNombreExact(t, moisAttendu) === "correct");
}

export function soumettreReponseAsymptoteObliqueClub(etat: EtatSessionLimitesContexte, texte: string): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "clubLoisirs") throw new Error("soumettreReponseAsymptoteObliqueClub : famille inattendue");
  const { a, b } = etat.exerciceCourant;
  return soumettreEcran(etat, "asymptoteOblique", texte, (t) => diagnostiquerQuotient(t, a, b) === "correct");
}

export function soumettreReponseInterpreterPente(etat: EtatSessionLimitesContexte, texte: string): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "clubLoisirs") throw new Error("soumettreReponseInterpreterPente : famille inattendue");
  const { a, facteur } = etat.exerciceCourant;
  return soumettreEcran(etat, "interpreterPente", texte, (t) => diagnostiquerNombreExact(t, a * facteur) === "correct");
}

// ============================================================================
// Famille D — "Population".
// ============================================================================

export interface ReponseIdentificationPopulation {
  a: string;
  b: string;
}

export function soumettreReponseIdentification(etat: EtatSessionLimitesContexte, reponse: ReponseIdentificationPopulation): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "population") throw new Error("soumettreReponseIdentification : famille inattendue");
  const { a, b } = etat.exerciceCourant;
  return soumettreEcran(
    etat,
    "identification",
    reponse,
    (r) => diagnostiquerNombreExact(r.a, a) === "correct" && diagnostiquerNombreExact(r.b, b) === "correct",
  );
}

export function soumettreReponseInterpreterPopulation(etat: EtatSessionLimitesContexte, indexChoisi: number | null): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "population") throw new Error("soumettreReponseInterpreterPopulation : famille inattendue");
  const { optionsInterpretation } = etat.exerciceCourant;
  return soumettreEcran(etat, "interpreter", indexChoisi, (i) => verifierInterpretation(optionsInterpretation, i));
}

export function soumettreReponseEvaluerSeuil(etat: EtatSessionLimitesContexte, reponse: ReponseEvaluerSeuil): EtatSessionLimitesContexte {
  if (etat.exerciceCourant.famille !== "population") throw new Error("soumettreReponseEvaluerSeuil : famille inattendue");
  const { a, b, p, anneeRef, anneeEval, seuil } = etat.exerciceCourant;
  const x = anneeEval - anneeRef;
  const cible = a / (x + p) + b;
  return soumettreEcran(etat, "evaluerSeuil", reponse, (r) => {
    const s = diagnostiquerEvaluerSeuil(r, cible, seuil);
    return s.valeur === "correct" && s.comparaisonCorrecte;
  });
}

// ============================================================================
// Écran "interpreter" partagé par les familles A et B — même nom de phase, cibles différentes.
// ============================================================================

export function soumettreReponseInterpreter(etat: EtatSessionLimitesContexte, indexChoisi: number | null): EtatSessionLimitesContexte {
  const exercice = etat.exerciceCourant;
  if (exercice.famille === "population") return soumettreReponseInterpreterPopulation(etat, indexChoisi);
  if (exercice.famille !== "prixRevient" && exercice.famille !== "eauSalee") throw new Error("soumettreReponseInterpreter : famille inattendue");
  const { optionsInterpretation } = exercice;
  return soumettreEcran(etat, "interpreter", indexChoisi, (i) => verifierInterpretation(optionsInterpretation, i));
}
