/**
 * Couche B — moteur de session pour "Boîte à moustaches" (chapitre 5, septième et dernier
 * générateur du chapitre). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionBoiteMoustaches.test.ts` pour la preuve avec un générateur factice, même principe que les
 * 35 autres moteurs.
 */
import type { CinqNombres, ExerciceBoiteMoustaches, GenerateurExerciceBoiteMoustaches } from "../core/boiteMoustaches.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import {
  verifierComparaisonDispersions,
  verifierComparaisonMedianes,
  verifierConstruction,
  verifierLecture,
} from "./verificationBoiteMoustaches";
import type { ReponseLecture } from "./verificationBoiteMoustaches";
import type { EtatSessionBoiteMoustaches, PhaseBoiteMoustaches, ResultatExerciceBoiteMoustaches } from "./typesBoiteMoustaches";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

const NIVEAU_AIDE_MAX_PAR_PHASE: Record<PhaseBoiteMoustaches, number> = {
  construction: 2,
  lecture: 2,
  comparaisonMedianes: 1,
  comparaisonDispersions: 1,
};

export function niveauAideMaxPourPhase(phase: PhaseBoiteMoustaches): number {
  return NIVEAU_AIDE_MAX_PAR_PHASE[phase];
}

function phaseInitiale(exercice: ExerciceBoiteMoustaches): PhaseBoiteMoustaches {
  if (exercice.variante === "construction") return "construction";
  if (exercice.variante === "lecture") return "lecture";
  return "comparaisonMedianes";
}

export function demarrerSessionBoiteMoustaches(reglages: ReglagesSession, generateur: GenerateurExerciceBoiteMoustaches): EtatSessionBoiteMoustaches {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreComparaisonMedianesExercice: null,
    comparaisonMedianesRevele: false,
    niveauAideComparaisonMedianesExercice: 0,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionBoiteMoustaches): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée ou si le
 * niveau maximal (dépendant de la phase en cours) est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionBoiteMoustaches): EtatSessionBoiteMoustaches {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  const max = niveauAideMaxPourPhase(etat.phase);
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionBoiteMoustaches, resultat: ResultatExerciceBoiteMoustaches): EtatSessionBoiteMoustaches {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  const exerciceCourant = etat.generateur();
  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreComparaisonMedianesExercice: null,
    comparaisonMedianesRevele: false,
    niveauAideComparaisonMedianesExercice: 0,
  };
}

function exigerPhase(etat: EtatSessionBoiteMoustaches, phase: PhaseBoiteMoustaches, nomFonction: string): void {
  if (etat.terminee) {
    throw new Error(`${nomFonction} : la session est déjà terminée`);
  }
  if (etat.phase !== phase) {
    throw new Error(`${nomFonction} : l'écran courant n'est pas "${phase}"`);
  }
}

const resultatVide = (variante: ExerciceBoiteMoustaches["variante"]): Omit<ResultatExerciceBoiteMoustaches, "score" | "revele" | "niveauAide"> => ({
  variante,
  scoreComparaisonMedianes: null,
  comparaisonMedianesRevele: false,
  niveauAideComparaisonMedianes: 0,
  scoreComparaisonDispersions: null,
  comparaisonDispersionsRevele: false,
  niveauAideComparaisonDispersions: 0,
});

/** Écran "construction" — 5 marqueurs déplacés par glissement cranté, toujours terminal. */
export function soumettreReponseConstruction(etat: EtatSessionBoiteMoustaches, reponse: CinqNombres): EtatSessionBoiteMoustaches {
  exigerPhase(etat, "construction", "soumettreReponseConstruction");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "construction") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<CinqNombres>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstruction(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);

  return cloturerExerciceOuSuivant(etat, {
    ...resultatVide("construction"),
    score,
    revele: etapeCourante.revelee,
    niveauAide: etat.niveauAide,
  });
}

/** Écran "lecture" — 5 champs libres, toujours terminal. */
export function soumettreReponseLecture(etat: EtatSessionBoiteMoustaches, reponse: ReponseLecture): EtatSessionBoiteMoustaches {
  exigerPhase(etat, "lecture", "soumettreReponseLecture");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "lecture") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<ReponseLecture>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierLecture(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);

  return cloturerExerciceOuSuivant(etat, {
    ...resultatVide("lecture"),
    score,
    revele: etapeCourante.revelee,
    niveauAide: etat.niveauAide,
  });
}

/** Écran "comparaisonMedianes" — jamais terminal, transitionne vers "comparaisonDispersions". */
export function soumettreReponseComparaisonMedianes(etat: EtatSessionBoiteMoustaches, choix: "A" | "B"): EtatSessionBoiteMoustaches {
  exigerPhase(etat, "comparaisonMedianes", "soumettreReponseComparaisonMedianes");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "comparaison") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<"A" | "B">(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierComparaisonMedianes(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);

  return {
    ...etat,
    phase: "comparaisonDispersions",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreComparaisonMedianesExercice: score,
    comparaisonMedianesRevele: etapeCourante.revelee,
    niveauAideComparaisonMedianesExercice: etat.niveauAide,
  };
}

/** Écran "comparaisonDispersions" — dernière étape, clôture toujours l'exercice. */
export function soumettreReponseComparaisonDispersions(etat: EtatSessionBoiteMoustaches, choix: "A" | "B"): EtatSessionBoiteMoustaches {
  exigerPhase(etat, "comparaisonDispersions", "soumettreReponseComparaisonDispersions");
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "comparaison") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<"A" | "B">(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierComparaisonDispersions(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);

  return cloturerExerciceOuSuivant(etat, {
    variante: "comparaison",
    score: null,
    revele: false,
    niveauAide: 0,
    scoreComparaisonMedianes: etat.scoreComparaisonMedianesExercice,
    comparaisonMedianesRevele: etat.comparaisonMedianesRevele,
    niveauAideComparaisonMedianes: etat.niveauAideComparaisonMedianesExercice,
    scoreComparaisonDispersions: score,
    comparaisonDispersionsRevele: etapeCourante.revelee,
    niveauAideComparaisonDispersions: etat.niveauAide,
  });
}
