/**
 * Couche B (6e) — moteur de session pour `6gen10`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionInequationsExponentielles.test.ts` pour la preuve avec des
 * exercices factices définis localement.
 */
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";
import type { ExerciceInequationExponentielle } from "../core6e/inequationsExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesInequationsExponentielles";
import type { EtatSessionInequationExponentielle, PhaseInequationExponentielle, ResultatExerciceInequationExponentielle } from "./typesInequationsExponentielles";
import type { ReponseSigneUnZero } from "./verificationInequationsExponentielles";
import {
  verifierAReconnaitre,
  verifierAResoudre,
  verifierBReconnaitre,
  verifierCfReconnaitre,
  verifierCkConclure,
  verifierCkRegrouper,
  verifierDConstantResoudre,
  verifierDConstantSigne,
  verifierDVariableSigne1,
  verifierDVariableSigne2,
  verifierDVariableTableau,
  verifierERegrouper,
  verifierEResoudre,
} from "./verificationInequationsExponentielles";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceInequationExponentielle,
): Pick<EtatSessionInequationExponentielle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionInequationExponentielle(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceInequationExponentielle,
): EtatSessionInequationExponentielle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionInequationExponentielle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionInequationExponentielle): EtatSessionInequationExponentielle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionInequationExponentielle, resultat: ResultatExerciceInequationExponentielle, revele: boolean): EtatSessionInequationExponentielle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, derniereRevelee: revele, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceInequationExponentielle, scores: Partial<Record<PhaseInequationExponentielle, number>>): ResultatExerciceInequationExponentielle {
  switch (exercice.famille) {
    case "A":
      return { famille: "A", exercice, scoreReconnaitre: scores.aReconnaitre as number, scoreResoudre: scores.aResoudre as number };
    case "B":
      return { famille: "B", exercice, score: scores.bReconnaitre as number };
    case "C":
      if (exercice.sousType === "f") return { famille: "C", sousType: "f", exercice, score: scores.cfReconnaitre as number };
      return { famille: "C", sousType: "k", exercice, scoreRegrouper: scores.ckRegrouper as number, scoreConclure: scores.ckConclure as number };
    case "D":
      if (exercice.sousType === "constant") {
        return { famille: "D", sousType: "constant", exercice, scoreSigne: scores.dConstantSigne as number, scoreResoudre: scores.dConstantResoudre as number };
      }
      return {
        famille: "D",
        sousType: "variable",
        exercice,
        scoreSigne1: scores.dVariableSigne1 as number,
        scoreSigne2: scores.dVariableSigne2 as number,
        scoreTableau: scores.dVariableTableau as number,
      };
    case "E":
      return { famille: "E", exercice, scoreRegrouper: scores.eRegrouper as number, scoreResoudre: scores.eResoudre as number };
  }
}

function avancerPhase<TReponse>(
  etat: EtatSessionInequationExponentielle,
  reponse: TReponse,
  verifier: (exercice: ExerciceInequationExponentielle, reponse: TReponse) => boolean,
  phaseAttendue: PhaseInequationExponentielle,
): EtatSessionInequationExponentielle {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereRevelee: false };

  // `etapeCourante.revelee` (donc `derniereRevelee` ci-dessous) n'est observable QU'ICI : dès que
  // cette fonction retourne, l'écran a déjà changé de phase (ou l'exercice est déjà clos) et
  // `etapeCourante` est réinitialisé pour la suite — voir la doc de `EtatSessionInequationExponentielle.derniereRevelee`.
  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels), revele);
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereRevelee: revele };
}

export function soumettreReponseAReconnaitre(etat: EtatSessionInequationExponentielle, texte: string): EtatSessionInequationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "A" ? verifierAReconnaitre(e, r) : false), "aReconnaitre");
}

export function soumettreReponseAResoudre(etat: EtatSessionInequationExponentielle, reponse: EnsembleReelGuide): EtatSessionInequationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "A" ? verifierAResoudre(e, r) : false), "aResoudre");
}

export function soumettreReponseBReconnaitre(etat: EtatSessionInequationExponentielle, estImpossible: boolean): EtatSessionInequationExponentielle {
  return avancerPhase(etat, estImpossible, (e, r) => (e.famille === "B" ? verifierBReconnaitre(e, r) : false), "bReconnaitre");
}

export function soumettreReponseCfReconnaitre(etat: EtatSessionInequationExponentielle, estToujoursVraie: boolean): EtatSessionInequationExponentielle {
  return avancerPhase(etat, estToujoursVraie, (e, r) => (e.famille === "C" && e.sousType === "f" ? verifierCfReconnaitre(e, r) : false), "cfReconnaitre");
}

export function soumettreReponseCkRegrouper(etat: EtatSessionInequationExponentielle, texte: string): EtatSessionInequationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "C" && e.sousType === "k" ? verifierCkRegrouper(e, r) : false), "ckRegrouper");
}

export function soumettreReponseCkConclure(etat: EtatSessionInequationExponentielle, estToujoursVraie: boolean): EtatSessionInequationExponentielle {
  return avancerPhase(etat, estToujoursVraie, (e, r) => (e.famille === "C" && e.sousType === "k" ? verifierCkConclure(e, r) : false), "ckConclure");
}

export function soumettreReponseDConstantSigne(etat: EtatSessionInequationExponentielle, signe: "positif" | "negatif"): EtatSessionInequationExponentielle {
  return avancerPhase(etat, signe, (e, r) => (e.famille === "D" && e.sousType === "constant" ? verifierDConstantSigne(e, r) : false), "dConstantSigne");
}

export function soumettreReponseDConstantResoudre(etat: EtatSessionInequationExponentielle, reponse: EnsembleReelGuide): EtatSessionInequationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" && e.sousType === "constant" ? verifierDConstantResoudre(e, r) : false), "dConstantResoudre");
}

export function soumettreReponseDVariableSigne1(etat: EtatSessionInequationExponentielle, reponse: ReponseSigneUnZero): EtatSessionInequationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" && e.sousType === "variable" ? verifierDVariableSigne1(e, r) : false), "dVariableSigne1");
}

export function soumettreReponseDVariableSigne2(etat: EtatSessionInequationExponentielle, reponse: ReponseSigneUnZero): EtatSessionInequationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" && e.sousType === "variable" ? verifierDVariableSigne2(e, r) : false), "dVariableSigne2");
}

export function soumettreReponseDVariableTableau(etat: EtatSessionInequationExponentielle, reponse: EnsembleReelGuide): EtatSessionInequationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "D" && e.sousType === "variable" ? verifierDVariableTableau(e, r) : false), "dVariableTableau");
}

export function soumettreReponseERegrouper(etat: EtatSessionInequationExponentielle, texte: string): EtatSessionInequationExponentielle {
  return avancerPhase(etat, texte, (e, r) => (e.famille === "E" ? verifierERegrouper(e, r) : false), "eRegrouper");
}

export function soumettreReponseEResoudre(etat: EtatSessionInequationExponentielle, reponse: EnsembleReelGuide): EtatSessionInequationExponentielle {
  return avancerPhase(etat, reponse, (e, r) => (e.famille === "E" ? verifierEResoudre(e, r) : false), "eResoudre");
}
