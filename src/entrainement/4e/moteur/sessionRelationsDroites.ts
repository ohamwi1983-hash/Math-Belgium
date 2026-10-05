/**
 * Couche B — moteur de session pour "Relations entre droites (parallèle/perpendiculaire)".
 * N'importe jamais rien de `src/generateurs/` — voir `sessionRelationsDroites.test.ts` pour la
 * preuve avec un générateur factice.
 *
 * 3 phases FIXES, toujours dans le même ordre : `extraction → construction → equation` — aucun
 * saut conditionnel, ce générateur n'ayant structurellement aucun cas "impossible" (contrairement à
 * "Équation d'une droite").
 *
 * Aide PROGRESSIVE par écran (même principe que "Colinéarité"/"Orthogonalité"/"Équation d'une
 * droite") : 1 seul niveau sur "extraction", 2 niveaux sur "construction" et "equation" — pénalité
 * ADDITIVE (-20 points/niveau) appliquée au moment précis où l'écran se clôt, jamais
 * rétroactivement.
 */
import type { ExerciceRelationsDroites, GenerateurExerciceRelationsDroites } from "../core/relationsDroites.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionRelationsDroites, ReponseEquation, ResultatExerciceRelationsDroites } from "./typesRelationsDroites";
import { verifierConstruction, verifierEquationCartesienne, verifierEquationParametrique, verifierExtraction } from "./verificationRelationsDroites";
import type { ReponseVecteur } from "./verificationRelationsDroites";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_EXTRACTION = 1;
export const NIVEAU_AIDE_MAX_CONSTRUCTION = 2;
export const NIVEAU_AIDE_MAX_EQUATION = 2;

function etatInitial(exercice: ExerciceRelationsDroites): Pick<
  EtatSessionRelationsDroites,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideExtraction"
  | "niveauAideConstruction"
  | "niveauAideEquation"
  | "scoreExtractionExercice"
  | "extractionRevele"
  | "scoreConstructionExercice"
  | "constructionRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: "extraction",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideExtraction: 0,
    niveauAideConstruction: 0,
    niveauAideEquation: 0,
    scoreExtractionExercice: null,
    extractionRevele: false,
    scoreConstructionExercice: null,
    constructionRevele: false,
  };
}

export function demarrerSessionRelationsDroites(reglages: ReglagesSession, generateur: GenerateurExerciceRelationsDroites): EtatSessionRelationsDroites {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionRelationsDroites): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionRelationsDroites): EtatSessionRelationsDroites {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "extraction") {
    if (etat.niveauAideExtraction >= NIVEAU_AIDE_MAX_EXTRACTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideExtraction: etat.niveauAideExtraction + 1 };
  }
  if (etat.phase === "construction") {
    if (etat.niveauAideConstruction >= NIVEAU_AIDE_MAX_CONSTRUCTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideConstruction: etat.niveauAideConstruction + 1 };
  }
  if (etat.niveauAideEquation >= NIVEAU_AIDE_MAX_EQUATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideEquation: etat.niveauAideEquation + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionRelationsDroites, resultat: ResultatExerciceRelationsDroites): EtatSessionRelationsDroites {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatInitial(etat.generateur()),
  };
}

/** Écran "extraction" — mène toujours à "construction". */
export function soumettreReponseExtraction(etat: EtatSessionRelationsDroites, reponse: ReponseVecteur): EtatSessionRelationsDroites {
  if (etat.terminee || etat.phase !== "extraction") {
    throw new Error("soumettreReponseExtraction : la session n'est pas à l'étape extraction");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseVecteur>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierExtraction(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideExtraction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "construction",
    scoreExtractionExercice: score,
    extractionRevele: etapeCourante.revelee,
  };
}

/** Écran "construction" — mène toujours à "equation". */
export function soumettreReponseConstruction(etat: EtatSessionRelationsDroites, reponse: ReponseVecteur): EtatSessionRelationsDroites {
  if (etat.terminee || etat.phase !== "construction") {
    throw new Error("soumettreReponseConstruction : la session n'est pas à l'étape construction");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseVecteur>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstruction(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideConstruction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equation",
    scoreConstructionExercice: score,
    constructionRevele: etapeCourante.revelee,
  };
}

function verifierEquation(exercice: ExerciceRelationsDroites, reponse: ReponseEquation): boolean {
  return exercice.formeSortie === "cartesienne" ? verifierEquationCartesienne(exercice, reponse as string) : verifierEquationParametrique(exercice, reponse as never);
}

/** Écran "equation" (dernière phase) — clôture toujours l'exercice. */
export function soumettreReponseEquation(etat: EtatSessionRelationsDroites, reponse: ReponseEquation): EtatSessionRelationsDroites {
  if (etat.terminee || etat.phase !== "equation") {
    throw new Error("soumettreReponseEquation : la session n'est pas à l'étape equation");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseEquation>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEquation(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideEquation);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    formeEntree: exercice.formeEntree,
    formeSortie: exercice.formeSortie,
    critere: exercice.critere,
    scoreExtraction: etat.scoreExtractionExercice as number,
    extractionRevele: etat.extractionRevele,
    extractionAideUtilisee: etat.niveauAideExtraction > 0,
    scoreConstruction: etat.scoreConstructionExercice as number,
    constructionRevele: etat.constructionRevele,
    constructionAideUtilisee: etat.niveauAideConstruction > 0,
    scoreEquation: score,
    equationRevele: etapeCourante.revelee,
    equationAideUtilisee: etat.niveauAideEquation > 0,
  });
}
