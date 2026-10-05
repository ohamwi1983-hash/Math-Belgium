/**
 * Couche B (5e) — moteur de session pour 5gen28 ("Tangentes"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransTangente`, dépend uniquement de `exercice.variante`) —
 * contrairement à 5gen27, aucune branche réactive dépendant d'une réponse élève : chaque
 * `soumettreReponseXxx` avance simplement à l'écran suivant de la séquence, même patron que
 * `sessionDefinitionDerivee.ts` (5gen26).
 */
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial } from "./typesTangentes";
import type { EcranTangente, EtatSessionTangente, ResultatExerciceTangente } from "./typesTangentes";
import {
  diagnostiquerEquationTangentePointDonne,
  diagnostiquerEquationTangenteP,
  diagnostiquerFAPointDonne,
  diagnostiquerFPrimeAPointDonne,
  diagnostiquerFPrimeP,
  diagnostiquerFPrimeQ,
  diagnostiquerQ,
  verifierCoordonneesHorizontale,
  verifierRacinesHorizontale,
} from "./verificationTangentes";
import type { PointSaisi } from "./verificationTangentes";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_TANGENTES = 2;

export function niveauAideMaxTangentes(): number {
  return NIVEAU_AIDE_MAX_TANGENTES;
}

function etatInitial(exercice: ExerciceTangente): Pick<EtatSessionTangente, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionTangentes(reglages: ReglagesSession5e, generateur: () => ExerciceTangente): EtatSessionTangente {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionTangente): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionTangente): EtatSessionTangente {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_TANGENTES) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionTangente, resultat: ResultatExerciceTangente, revele: boolean): EtatSessionTangente {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionTangente, ecranAttendu: EcranTangente, reponse: T, verifier: (r: T) => boolean): EtatSessionTangente {
  if (etat.terminee || etat.phase !== ecranAttendu) throw new Error(`soumettreEcran : la session n'est pas à l'écran "${ecranAttendu}"`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const ecranSuivant = ecranApres(etat.exerciceCourant, etat.phase);

  if (ecranSuivant === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Variante A ("pointDonne") — écran "substituer" (2 champs numériques, 1 tentative combinée) puis
// "tangente" (1 champ symbolique).
// ============================================================================

export interface ReponseSubstituer {
  fA: string;
  fPrimeA: string;
}

export function soumettreReponseSubstituer(etat: EtatSessionTangente, reponse: ReponseSubstituer): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pointDonne") throw new Error('soumettreReponseSubstituer : exercice hors variante "pointDonne"');
  return soumettreEcran(etat, "substituer", reponse, (r) => diagnostiquerFAPointDonne(r.fA, exercice) === "correct" && diagnostiquerFPrimeAPointDonne(r.fPrimeA, exercice) === "correct");
}

export function soumettreReponseTangentePointDonne(etat: EtatSessionTangente, texte: string): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "pointDonne") throw new Error('soumettreReponseTangentePointDonne : exercice hors variante "pointDonne"');
  return soumettreEcran(etat, "tangente", texte, (t) => diagnostiquerEquationTangentePointDonne(t, exercice) === "correct");
}

// ============================================================================
// Variante B ("horizontale") — écran "resoudre" (1 ou 2 champs numériques, ENSEMBLE) puis
// "coordonnees" (1 ou 2 champs point "(x;y)", ENSEMBLE).
// ============================================================================

export function soumettreReponseResoudre(etat: EtatSessionTangente, reponses: string[]): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "horizontale") throw new Error('soumettreReponseResoudre : exercice hors variante "horizontale"');
  return soumettreEcran(etat, "resoudre", reponses, (r) => verifierRacinesHorizontale(r, exercice));
}

export function soumettreReponseCoordonnees(etat: EtatSessionTangente, reponses: PointSaisi[]): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "horizontale") throw new Error('soumettreReponseCoordonnees : exercice hors variante "horizontale"');
  return soumettreEcran(etat, "coordonnees", reponses, (r) => verifierCoordonneesHorizontale(r, exercice));
}

// ============================================================================
// Variante C ("doubleTangence") — "tangenteEnP" (f'(p) + équation, 1 tentative combinée),
// "trouverQ" (1 champ), "verifierPente" (1 champ).
// ============================================================================

export interface ReponseTangenteEnP {
  fPrimeP: string;
  tangente: string;
}

export function soumettreReponseTangenteEnP(etat: EtatSessionTangente, reponse: ReponseTangenteEnP): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "doubleTangence") throw new Error('soumettreReponseTangenteEnP : exercice hors variante "doubleTangence"');
  return soumettreEcran(
    etat,
    "tangenteEnP",
    reponse,
    (r) => diagnostiquerFPrimeP(r.fPrimeP, exercice) === "correct" && diagnostiquerEquationTangenteP(r.tangente, exercice) === "correct",
  );
}

export function soumettreReponseTrouverQ(etat: EtatSessionTangente, texte: string): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "doubleTangence") throw new Error('soumettreReponseTrouverQ : exercice hors variante "doubleTangence"');
  return soumettreEcran(etat, "trouverQ", texte, (t) => diagnostiquerQ(t, exercice) === "correct");
}

export function soumettreReponseVerifierPente(etat: EtatSessionTangente, texte: string): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "doubleTangence") throw new Error('soumettreReponseVerifierPente : exercice hors variante "doubleTangence"');
  return soumettreEcran(etat, "verifierPente", texte, (t) => diagnostiquerFPrimeQ(t, exercice) === "correct");
}
