/**
 * Couche B (5e) — moteur de session pour 5gen33 ("Contexte économique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransContexteEconomique`, dépend UNIQUEMENT de
 * `exercice.famille`) — aucune branche réactive dépendant d'une réponse élève, même patron que
 * `sessionEtudeLocale.ts` (5gen29).
 */
import type { ExerciceContexteEconomique } from "../core5e/contexteEconomique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial, indexIteration } from "./typesContexteEconomique";
import type { EcranContexteEconomique, EtatSessionContexteEconomique, ResultatExerciceContexteEconomique } from "./typesContexteEconomique";
import type { ReponseEgaliteMarginales, ReponseExtremum, ReponseIterationDichotomie, ReponseTableauSigneBenefice } from "./verificationContexteEconomique";
import {
  diagnostiquerBeneficeDerivee,
  diagnostiquerBeneficeFormule,
  diagnostiquerBeneficeMaximum,
  diagnostiquerCoutMarginalB,
  diagnostiquerCoutMarginalDiscret,
  diagnostiquerDeriveeSymboliqueA,
  diagnostiquerDeriveeValeur,
  diagnostiquerEcartAbsolu,
  diagnostiquerEcartPourcent,
  diagnostiquerEquationReduite,
  diagnostiquerRacineApprochee,
  diagnostiquerRecetteMarginale,
  diagnostiquerRecetteTotale,
  verifierConfirmationCoherence,
  verifierEgaliteMarginales,
  verifierExtremum,
  verifierIterationDichotomie,
  verifierTableauSigneBenefice,
} from "./verificationContexteEconomique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_CONTEXTE_ECONOMIQUE = 2;

export function niveauAideMaxContexteEconomique(): number {
  return NIVEAU_AIDE_MAX_CONTEXTE_ECONOMIQUE;
}

function etatInitial(exercice: ExerciceContexteEconomique): Pick<EtatSessionContexteEconomique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionContexteEconomique(reglages: ReglagesSession5e, generateur: () => ExerciceContexteEconomique): EtatSessionContexteEconomique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionContexteEconomique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionContexteEconomique): EtatSessionContexteEconomique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_CONTEXTE_ECONOMIQUE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionContexteEconomique, resultat: ResultatExerciceContexteEconomique, revele: boolean): EtatSessionContexteEconomique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionContexteEconomique, ecranAttendu: EcranContexteEconomique, reponse: T, verifier: (r: T) => boolean): EtatSessionContexteEconomique {
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
// Famille A.
// ============================================================================

function exerciceA(etat: EtatSessionContexteEconomique) {
  const ex = etat.exerciceCourant;
  if (ex.famille !== "A") throw new Error('cet écran exige un exercice de famille "A"');
  return ex;
}

export function soumettreReponseCoutMarginalDiscret(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "coutMarginalDiscret", texte, (t) => diagnostiquerCoutMarginalDiscret(t, exerciceA(etat)) === "correct");
}

export function soumettreReponseDeriveeSymbolique(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "deriveeSymbolique", texte, (t) => diagnostiquerDeriveeSymboliqueA(t, exerciceA(etat)) === "correct");
}

export function soumettreReponseDeriveeValeur(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "deriveeValeur", texte, (t) => diagnostiquerDeriveeValeur(t, exerciceA(etat)) === "correct");
}

export function soumettreReponseComparaisonEcart(etat: EtatSessionContexteEconomique, reponse: { ecartAbsolu: string; ecartPourcent: string }): EtatSessionContexteEconomique {
  return soumettreEcran(
    etat,
    "comparaisonEcart",
    reponse,
    (r) => diagnostiquerEcartAbsolu(r.ecartAbsolu, exerciceA(etat)) === "correct" && diagnostiquerEcartPourcent(r.ecartPourcent, exerciceA(etat)) === "correct",
  );
}

export function soumettreReponseExtremum(etat: EtatSessionContexteEconomique, reponse: ReponseExtremum): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "extremum", reponse, (r) => verifierExtremum(r, exerciceA(etat)));
}

// ============================================================================
// Famille B.
// ============================================================================

function exerciceB(etat: EtatSessionContexteEconomique) {
  const ex = etat.exerciceCourant;
  if (ex.famille !== "B") throw new Error('cet écran exige un exercice de famille "B"');
  return ex;
}

export function soumettreReponseRecetteTotale(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "recetteTotale", texte, (t) => diagnostiquerRecetteTotale(t, exerciceB(etat)) === "correct");
}

export function soumettreReponseMarginales(etat: EtatSessionContexteEconomique, reponse: { coutMarginal: string; recetteMarginale: string }): EtatSessionContexteEconomique {
  return soumettreEcran(
    etat,
    "marginales",
    reponse,
    (r) => diagnostiquerCoutMarginalB(r.coutMarginal, exerciceB(etat)) === "correct" && diagnostiquerRecetteMarginale(r.recetteMarginale, exerciceB(etat)) === "correct",
  );
}

export function soumettreReponseEgaliteMarginales(etat: EtatSessionContexteEconomique, reponse: ReponseEgaliteMarginales): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "resoudreEgaliteMarginales", reponse, (r) => verifierEgaliteMarginales(r, exerciceB(etat)));
}

export function soumettreReponseBeneficeFormule(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "beneficeFormule", texte, (t) => diagnostiquerBeneficeFormule(t, exerciceB(etat)) === "correct");
}

export function soumettreReponseBeneficeDerivee(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "beneficeDerivee", texte, (t) => diagnostiquerBeneficeDerivee(t, exerciceB(etat)) === "correct");
}

export function soumettreReponseTableauSigneBenefice(etat: EtatSessionContexteEconomique, reponse: ReponseTableauSigneBenefice): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "tableauSigneBenefice", reponse, (r) => verifierTableauSigneBenefice(r));
}

export function soumettreReponseConfirmationCoherence(etat: EtatSessionContexteEconomique, reponse: boolean): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "confirmationCoherence", reponse, (r) => verifierConfirmationCoherence(r));
}

export function soumettreReponseBeneficeMaximum(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "beneficeMaximum", texte, (t) => diagnostiquerBeneficeMaximum(t, exerciceB(etat)) === "correct");
}

// ============================================================================
// Bonus.
// ============================================================================

function exerciceBonus(etat: EtatSessionContexteEconomique) {
  const ex = etat.exerciceCourant;
  if (ex.famille !== "bonus") throw new Error('cet écran exige un exercice de famille "bonus"');
  return ex;
}

export function soumettreReponsePoserEquationReduite(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "poserEquationReduite", texte, (t) => diagnostiquerEquationReduite(t, exerciceBonus(etat)) === "correct");
}

export function soumettreReponseIteration(etat: EtatSessionContexteEconomique, reponse: ReponseIterationDichotomie): EtatSessionContexteEconomique {
  const ecran = etat.phase;
  const index = indexIteration(ecran);
  return soumettreEcran(etat, ecran, reponse, (r) => verifierIterationDichotomie(r, exerciceBonus(etat), index));
}

export function soumettreReponseRacineApprochee(etat: EtatSessionContexteEconomique, texte: string): EtatSessionContexteEconomique {
  return soumettreEcran(etat, "racineApprochee", texte, (t) => diagnostiquerRacineApprochee(t, exerciceBonus(etat)) === "correct");
}
