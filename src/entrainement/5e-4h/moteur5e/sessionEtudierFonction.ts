/**
 * Couche B (5e) — moteur de session pour 5gen31 ("Étudier une fonction"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransEtudierFonction`, ne dépend que de
 * `possedeDomaineRestreint`) — même patron que `sessionEtudeLocale.ts`/`sessionTangentes.ts`.
 *
 * 2 écarts documentés par rapport au patron `soumettreEcran` générique des autres générateurs :
 * - "recap" (étape 7) n'est JAMAIS noté (`avancerRecap`, pas de `soumettreEtapeTentatives`) — écran
 *   purement présentationnel, aucune question, voir `typesEtudierFonction.ts`.
 * - "graphique" (étape 8, DERNIER écran) utilise un score PAR POINT plutôt que le mécanisme
 *   `etapeTentatives` à tentative UNIQUE combinée — `PlacementPointsGraphique` gère ses propres
 *   tentatives par point (jusqu'à `reglages.tentativesMax` par point, indépendamment) puis remonte
 *   un résumé agrégé (`ResumePlacementPoints`) ; `soumettreReponseGraphique` calcule le score final
 *   à partir de ce résumé et clôt TOUJOURS l'exercice (dernier écran).
 */
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { EnsembleReelGuide } from "../core5e/domaineDefinition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial } from "./typesEtudierFonction";
import type { EcranEtudierFonction, EtatSessionEtudierFonction, ResultatExerciceEtudierFonction } from "./typesEtudierFonction";
import type { ReponseTableauEtudierFonction, ValeurReponseSlotLimite } from "./verificationEtudierFonction";
import {
  diagnostiquerCalculerFPrime,
  diagnostiquerCalculerFSeconde,
  domaineAttendu,
  listeSlotsLimites,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  verifierEnsembleReelGuide,
  verifierLimitesEtudierFonction,
  verifierTableauEtudierFonction,
} from "./verificationEtudierFonction";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide) pour les écrans 1-7. L'écran 8 a sa
 * propre échelle d'aide (1 niveau, gérée par `PlacementPointsGraphique` — voir la tête de fichier
 * de ce composant pour la justification du repli). */
export const NIVEAU_AIDE_MAX_ETUDIER_FONCTION = 2;

export function niveauAideMaxEtudierFonction(): number {
  return NIVEAU_AIDE_MAX_ETUDIER_FONCTION;
}

/** Écran "graphique" (étape 8) — 1 SEUL niveau d'aide (déviation documentée, voir
 * `components5e/PlacementPointsGraphique.tsx`). */
export const NIVEAU_AIDE_MAX_GRAPHIQUE = 1;

export function niveauAideMaxGraphique(): number {
  return NIVEAU_AIDE_MAX_GRAPHIQUE;
}

function etatInitial(exercice: ExerciceEtudierFonction): Pick<EtatSessionEtudierFonction, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionEtudierFonction(reglages: ReglagesSession5e, generateur: () => ExerciceEtudierFonction): EtatSessionEtudierFonction {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEtudierFonction): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionEtudierFonction): EtatSessionEtudierFonction {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  const max = etat.phase === "graphique" ? NIVEAU_AIDE_MAX_GRAPHIQUE : NIVEAU_AIDE_MAX_ETUDIER_FONCTION;
  if (etat.niveauAide >= max) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEtudierFonction, resultat: ResultatExerciceEtudierFonction, revele: boolean): EtatSessionEtudierFonction {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionEtudierFonction, ecranAttendu: EcranEtudierFonction, reponse: T, verifier: (r: T) => boolean): EtatSessionEtudierFonction {
  if (etat.terminee || etat.phase !== ecranAttendu) throw new Error(`soumettreEcran : la session n'est pas à l'écran "${ecranAttendu}"`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [ecranAttendu]: score };
  const ecranSuivant = ecranApres(etat.exerciceCourant, ecranAttendu);

  if (ecranSuivant === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Écran "domaine" (uniquement si domaine restreint).
// ============================================================================

export function soumettreReponseDomaine(etat: EtatSessionEtudierFonction, reponse: EnsembleReelGuide): EtatSessionEtudierFonction {
  return soumettreEcran(etat, "domaine", reponse, (r) => verifierEnsembleReelGuide(r, domaineAttendu(etat.exerciceCourant)));
}

// ============================================================================
// Écran "limites".
// ============================================================================

export function soumettreReponseLimites(etat: EtatSessionEtudierFonction, reponses: ValeurReponseSlotLimite[]): EtatSessionEtudierFonction {
  const slots = listeSlotsLimites(etat.exerciceCourant);
  return soumettreEcran(etat, "limites", reponses, (r) => verifierLimitesEtudierFonction(r, slots));
}

// ============================================================================
// Écrans "calculerFPrime"/"calculerFSeconde".
// ============================================================================

export function soumettreReponseCalculerFPrime(etat: EtatSessionEtudierFonction, texte: string): EtatSessionEtudierFonction {
  return soumettreEcran(etat, "calculerFPrime", texte, (t) => diagnostiquerCalculerFPrime(t, etat.exerciceCourant) === "correct");
}

export function soumettreReponseCalculerFSeconde(etat: EtatSessionEtudierFonction, texte: string): EtatSessionEtudierFonction {
  return soumettreEcran(etat, "calculerFSeconde", texte, (t) => diagnostiquerCalculerFSeconde(t, etat.exerciceCourant) === "correct");
}

// ============================================================================
// Écrans "tableauFPrime"/"tableauFSeconde".
// ============================================================================

export function soumettreReponseTableauFPrime(etat: EtatSessionEtudierFonction, reponse: ReponseTableauEtudierFonction): EtatSessionEtudierFonction {
  return soumettreEcran(etat, "tableauFPrime", reponse, (r) => verifierTableauEtudierFonction(r, tableauFPrimeAttendu(etat.exerciceCourant)));
}

export function soumettreReponseTableauFSeconde(etat: EtatSessionEtudierFonction, reponse: ReponseTableauEtudierFonction): EtatSessionEtudierFonction {
  return soumettreEcran(etat, "tableauFSeconde", reponse, (r) => verifierTableauEtudierFonction(r, tableauFSecondeAttendu(etat.exerciceCourant)));
}

// ============================================================================
// Écran "recap" — jamais noté, voir tête de fichier.
// ============================================================================

export function avancerRecap(etat: EtatSessionEtudierFonction): EtatSessionEtudierFonction {
  if (etat.terminee || etat.phase !== "recap") throw new Error('avancerRecap : la session n\'est pas à l\'écran "recap"');
  const ecranSuivant = ecranApres(etat.exerciceCourant, "recap");
  if (ecranSuivant === "termine") throw new Error('avancerRecap : "graphique" doit toujours suivre "recap"');
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant };
}

// ============================================================================
// Écran "graphique" — DERNIER écran, score PAR POINT (voir tête de fichier).
// ============================================================================

export interface ResumePlacementPoints {
  pointsReussis: number;
  pointsTotal: number;
  /** Vrai si AU MOINS un point a dû être révélé (tentatives épuisées pour ce point). */
  revele: boolean;
}

export function soumettreReponseGraphique(etat: EtatSessionEtudierFonction, resume: ResumePlacementPoints): EtatSessionEtudierFonction {
  if (etat.terminee || etat.phase !== "graphique") throw new Error('soumettreReponseGraphique : la session n\'est pas à l\'écran "graphique"');
  const brut = resume.pointsTotal > 0 ? Math.round((POINTS_DE_BASE * resume.pointsReussis) / resume.pointsTotal) : POINTS_DE_BASE;
  const score = Math.max(0, brut - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, graphique: score };
  return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, resume.revele);
}
