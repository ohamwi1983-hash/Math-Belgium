/**
 * Couche B (5e) — moteur de session pour 5gen35 ("Vitesse et position"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransVitessePosition`, dépend uniquement de
 * `exercice.variante`) — chaque `soumettreReponseXxx` avance simplement à l'écran suivant de la
 * séquence, même patron que `sessionTangentes.ts` (5gen28).
 */
import type { ExerciceVitessePosition } from "../core5e/vitessePosition.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial } from "./typesVitessePosition";
import type { EcranVitessePosition, EtatSessionVitessePosition, ResultatExerciceVitessePosition } from "./typesVitessePosition";
import {
  diagnostiquerConversionKmh,
  diagnostiquerDeriveeVitesse,
  diagnostiquerEvaluerV0,
  diagnostiquerSegmentConstant,
  diagnostiquerTempsTotal,
  diagnostiquerVitessePointe,
  verifierEcranResoudre,
} from "./verificationVitessePosition";
import type { ReponseResoudre } from "./verificationVitessePosition";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_VITESSE_POSITION = 2;

export function niveauAideMaxVitessePosition(): number {
  return NIVEAU_AIDE_MAX_VITESSE_POSITION;
}

function etatInitial(
  exercice: ExerciceVitessePosition,
): Pick<EtatSessionVitessePosition, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionVitessePosition(reglages: ReglagesSession5e, generateur: () => ExerciceVitessePosition): EtatSessionVitessePosition {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionVitessePosition): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionVitessePosition): EtatSessionVitessePosition {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_VITESSE_POSITION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionVitessePosition, resultat: ResultatExerciceVitessePosition, revele: boolean): EtatSessionVitessePosition {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionVitessePosition, ecranAttendu: EcranVitessePosition, reponse: T, verifier: (r: T) => boolean): EtatSessionVitessePosition {
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
// Écrans communs A/B — "derivee" (v(t)=e'(t), symbolique), "evaluerV0" (v(t0), numérique),
// "resoudre" (2 racines + justification), "vitessePointe" (v(tCible), numérique).
// ============================================================================

export function soumettreReponseDerivee(etat: EtatSessionVitessePosition, texte: string): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "derivee", texte, (t) => diagnostiquerDeriveeVitesse(t, exercice) === "correct");
}

export function soumettreReponseEvaluerV0(etat: EtatSessionVitessePosition, texte: string): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "evaluerV0", texte, (t) => diagnostiquerEvaluerV0(t, exercice) === "correct");
}

export function soumettreReponseResoudre(etat: EtatSessionVitessePosition, reponse: ReponseResoudre): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "resoudre", reponse, (r) => verifierEcranResoudre(r, exercice));
}

export function soumettreReponseVitessePointe(etat: EtatSessionVitessePosition, texte: string): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "vitessePointe", texte, (t) => diagnostiquerVitessePointe(t, exercice) === "correct");
}

// ============================================================================
// Variante A uniquement — "conversion" (m/s → km/h).
// ============================================================================

export function soumettreReponseConversion(etat: EtatSessionVitessePosition, texte: string): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "A") throw new Error('soumettreReponseConversion : exercice hors variante "A"');
  return soumettreEcran(etat, "conversion", texte, (t) => diagnostiquerConversionKmh(t, exercice) === "correct");
}

// ============================================================================
// Variante B uniquement — "segmentConstant" (t2=D2/v(tCible)), "tempsTotal" (tCible+t2).
// ============================================================================

export function soumettreReponseSegmentConstant(etat: EtatSessionVitessePosition, texte: string): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "B") throw new Error('soumettreReponseSegmentConstant : exercice hors variante "B"');
  return soumettreEcran(etat, "segmentConstant", texte, (t) => diagnostiquerSegmentConstant(t, exercice) === "correct");
}

export function soumettreReponseTempsTotal(etat: EtatSessionVitessePosition, texte: string): EtatSessionVitessePosition {
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "B") throw new Error('soumettreReponseTempsTotal : exercice hors variante "B"');
  return soumettreEcran(etat, "tempsTotal", texte, (t) => diagnostiquerTempsTotal(t, exercice) === "correct");
}
