/**
 * Couche B (5e) — moteur de session pour 5gen29 ("Étude locale (extremums et points critiques)").
 * N'importe jamais rien de `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransEtudeLocale`, dépend uniquement de `exercice.type`/
 * `exercice.niveau`/du nombre de vrais extremums-PI déjà classifiés) — aucune branche réactive
 * dépendant d'une réponse élève, même patron que `sessionTangentes.ts` (5gen28).
 */
import type { ExerciceEtudeLocale } from "../core5e/etudeLocale.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial } from "./typesEtudeLocale";
import type { EcranEtudeLocale, EtatSessionEtudeLocale, ResultatExerciceEtudeLocale } from "./typesEtudeLocale";
import type { ReponseTableauEtudeLocale } from "./verificationEtudeLocale";
import {
  domaineAttendu,
  racinesFPrimeNumeriques,
  racinesFSecondeNumeriques,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  valeursFAuxExtremums,
  valeursFAuxInflexions,
  verifierEnsembleNumerique,
  verifierEnsembleReelGuide,
  verifierTableauEtudeLocale,
} from "./verificationEtudeLocale";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_ETUDE_LOCALE = 2;

export function niveauAideMaxEtudeLocale(): number {
  return NIVEAU_AIDE_MAX_ETUDE_LOCALE;
}

function etatInitial(exercice: ExerciceEtudeLocale): Pick<EtatSessionEtudeLocale, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionEtudeLocale(reglages: ReglagesSession5e, generateur: () => ExerciceEtudeLocale): EtatSessionEtudeLocale {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEtudeLocale): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionEtudeLocale): EtatSessionEtudeLocale {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_ETUDE_LOCALE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEtudeLocale, resultat: ResultatExerciceEtudeLocale, revele: boolean): EtatSessionEtudeLocale {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionEtudeLocale, ecranAttendu: EcranEtudeLocale, reponse: T, verifier: (r: T) => boolean): EtatSessionEtudeLocale {
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
// Écran "domaine" (rationnelleAvecCE uniquement).
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionEtudeLocale, reponse: EnsembleReelGuide): EtatSessionEtudeLocale {
  const exercice = etat.exerciceCourant;
  if (exercice.type !== "rationnelleAvecCE") throw new Error('soumettreReponseDomaine : exercice hors type "rationnelleAvecCE"');
  return soumettreEcran(etat, "domaine", reponse, (r) => verifierEnsembleReelGuide(r, domaineAttendu(exercice)));
}

// ============================================================================
// Écrans "resoudreFPrime"/"resoudreFSeconde" — ensemble de racines, ordre indifférent.
// ============================================================================

export function soumettreReponseResoudreFPrime(etat: EtatSessionEtudeLocale, reponses: string[]): EtatSessionEtudeLocale {
  return soumettreEcran(etat, "resoudreFPrime", reponses, (r) => verifierEnsembleNumerique(r, racinesFPrimeNumeriques(etat.exerciceCourant)));
}

export function soumettreReponseResoudreFSeconde(etat: EtatSessionEtudeLocale, reponses: string[]): EtatSessionEtudeLocale {
  const exercice = etat.exerciceCourant;
  if (exercice.niveau !== "avance") throw new Error('soumettreReponseResoudreFSeconde : exercice hors niveau "avance"');
  return soumettreEcran(etat, "resoudreFSeconde", reponses, (r) => verifierEnsembleNumerique(r, racinesFSecondeNumeriques(exercice)));
}

// ============================================================================
// Écrans "tableauFPrime"/"tableauFSeconde" — grille étendue, notation combinée en un seul essai.
// ============================================================================

export function soumettreReponseTableauFPrime(etat: EtatSessionEtudeLocale, reponse: ReponseTableauEtudeLocale): EtatSessionEtudeLocale {
  return soumettreEcran(etat, "tableauFPrime", reponse, (r) => verifierTableauEtudeLocale(r, tableauFPrimeAttendu(etat.exerciceCourant)));
}

export function soumettreReponseTableauFSeconde(etat: EtatSessionEtudeLocale, reponse: ReponseTableauEtudeLocale): EtatSessionEtudeLocale {
  const exercice = etat.exerciceCourant;
  if (exercice.niveau !== "avance") throw new Error('soumettreReponseTableauFSeconde : exercice hors niveau "avance"');
  return soumettreEcran(etat, "tableauFSeconde", reponse, (r) => verifierTableauEtudeLocale(r, tableauFSecondeAttendu(exercice)));
}

// ============================================================================
// Écrans "extremums"/"inflexions" — valeur de f aux points RÉELLEMENT classés (jamais atteints si
// leur nombre est 0, voir `ordreEcransEtudeLocale`).
// ============================================================================

export function soumettreReponseExtremums(etat: EtatSessionEtudeLocale, reponses: string[]): EtatSessionEtudeLocale {
  return soumettreEcran(etat, "extremums", reponses, (r) => verifierEnsembleNumerique(r, valeursFAuxExtremums(etat.exerciceCourant)));
}

export function soumettreReponseInflexions(etat: EtatSessionEtudeLocale, reponses: string[]): EtatSessionEtudeLocale {
  return soumettreEcran(etat, "inflexions", reponses, (r) => verifierEnsembleNumerique(r, valeursFAuxInflexions(etat.exerciceCourant)));
}
