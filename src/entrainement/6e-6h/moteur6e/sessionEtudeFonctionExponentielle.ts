/**
 * Couche B (6e) — moteur de session pour `6gen11`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionEtudeFonctionExponentielle.test.ts` pour la preuve avec un
 * exercice factice défini localement. Séquence FIXE à 6 écrans (`domaine → limites → asymptotes →
 * croissance → concavite → graphique`), TOUJOURS traversée en entier quelle que soit la famille —
 * aucun saut conditionnel, contrairement à la plupart des moteurs récents du chantier.
 */
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesEtudeFonctionExponentielle";
import type { EtatSessionEtudeFonctionExponentielle, PhaseEtudeFonctionExponentielle, ResultatExerciceEtudeFonctionExponentielle } from "./typesEtudeFonctionExponentielle";
import type { ReponseAsymptotes, ReponseConcavite, ReponseCroissance, ReponseLimites } from "./verificationEtudeFonctionExponentielle";
import { verifierEcranAsymptotes, verifierEcranConcavite, verifierEcranCroissance, verifierEcranDomaine, verifierEcranGraphique, verifierEcranLimites } from "./verificationEtudeFonctionExponentielle";
import type { EnsembleReelGuide } from "../core6e/ensembleReel.types";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur les 6 écrans (spec : "aide progressive à paliers, 2 niveaux/écran"). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceEtudeFonctionExponentielle): Pick<EtatSessionEtudeFonctionExponentielle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionEtudeFonctionExponentielle(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceEtudeFonctionExponentielle,
): EtatSessionEtudeFonctionExponentielle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEtudeFonctionExponentielle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionEtudeFonctionExponentielle): EtatSessionEtudeFonctionExponentielle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEtudeFonctionExponentielle, resultat: ResultatExerciceEtudeFonctionExponentielle, revele: boolean): EtatSessionEtudeFonctionExponentielle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, derniereRevelee: revele, ...etatInitial(etat.generateur()) };
}

function construireResultat(exercice: ExerciceEtudeFonctionExponentielle, scores: Partial<Record<PhaseEtudeFonctionExponentielle, number>>): ResultatExerciceEtudeFonctionExponentielle {
  return {
    exercice,
    scoreDomaine: scores.domaine as number,
    scoreLimites: scores.limites as number,
    scoreAsymptotes: scores.asymptotes as number,
    scoreCroissance: scores.croissance as number,
    scoreConcavite: scores.concavite as number,
    scoreGraphique: scores.graphique as number,
  };
}

function avancerPhase<TReponse>(
  etat: EtatSessionEtudeFonctionExponentielle,
  reponse: TReponse,
  verifier: (exercice: ExerciceEtudeFonctionExponentielle, reponse: TReponse) => boolean,
  phaseAttendue: PhaseEtudeFonctionExponentielle,
): EtatSessionEtudeFonctionExponentielle {
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
  // `etapeCourante` est réinitialisé pour la suite — voir la doc de `EtatSessionEtudeFonctionExponentielle.derniereRevelee`.
  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels), revele);
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereRevelee: revele };
}

export function soumettreReponseDomaine(etat: EtatSessionEtudeFonctionExponentielle, reponse: EnsembleReelGuide): EtatSessionEtudeFonctionExponentielle {
  return avancerPhase(etat, reponse, verifierEcranDomaine, "domaine");
}

export function soumettreReponseLimites(etat: EtatSessionEtudeFonctionExponentielle, reponse: ReponseLimites): EtatSessionEtudeFonctionExponentielle {
  return avancerPhase(etat, reponse, verifierEcranLimites, "limites");
}

export function soumettreReponseAsymptotes(etat: EtatSessionEtudeFonctionExponentielle, reponse: ReponseAsymptotes): EtatSessionEtudeFonctionExponentielle {
  return avancerPhase(etat, reponse, verifierEcranAsymptotes, "asymptotes");
}

export function soumettreReponseCroissance(etat: EtatSessionEtudeFonctionExponentielle, reponse: ReponseCroissance): EtatSessionEtudeFonctionExponentielle {
  return avancerPhase(etat, reponse, verifierEcranCroissance, "croissance");
}

export function soumettreReponseConcavite(etat: EtatSessionEtudeFonctionExponentielle, reponse: ReponseConcavite): EtatSessionEtudeFonctionExponentielle {
  return avancerPhase(etat, reponse, verifierEcranConcavite, "concavite");
}

export function soumettreReponseGraphique(etat: EtatSessionEtudeFonctionExponentielle, indexChoisi: number): EtatSessionEtudeFonctionExponentielle {
  return avancerPhase(etat, indexChoisi, verifierEcranGraphique, "graphique");
}
