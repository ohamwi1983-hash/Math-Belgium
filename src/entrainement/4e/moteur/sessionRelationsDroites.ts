/**
 * Couche B — moteur de session pour "Relations entre droites (parallèle/perpendiculaire)".
 * N'importe jamais rien de `src/generateurs/` — voir `sessionRelationsDroites.test.ts` pour la
 * preuve avec un générateur factice.
 *
 * 3 phases par exercice, séquence fixée par la famille (`SEQUENCES_RELATIONS_DROITES`) :
 * `extraction → construction → equation` (famille `construction`) ou
 * `extraction → extraction2 → relation` (famille `reconnaissance`) — aucun saut conditionnel.
 * L'écran 2 (`construction`/`extraction2`) et l'écran 3 (`equation`/`relation`) partagent les
 * mêmes champs d'état (`niveauAideConstruction`/`scoreConstructionExercice`…,
 * `niveauAideEquation`), une seule des deux phases existant dans un exercice donné.
 *
 * Aide PROGRESSIVE par écran (même principe que "Colinéarité"/"Orthogonalité"/"Équation d'une
 * droite") : 1 seul niveau sur "extraction"/"extraction2", 2 niveaux sur "construction",
 * "equation" et "relation". L'écran "relation" n'a qu'UNE tentative (`TENTATIVES_MAX_RELATION`).
 */
import type { ExerciceRelationsDroites, GenerateurExerciceRelationsDroites, RelationReconnue } from "../core/relationsDroites.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionRelationsDroites, ReponseEquation, ResultatExerciceRelationsDroites } from "./typesRelationsDroites";
import { TENTATIVES_MAX_RELATION, verifierConstruction, verifierEquationCartesienne, verifierEquationParametrique, verifierExtraction, verifierExtraction2, verifierRelation } from "./verificationRelationsDroites";
import type { ReponseVecteur } from "./verificationRelationsDroites";

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX_EXTRACTION = 1;
export const NIVEAU_AIDE_MAX_CONSTRUCTION = 2;
export const NIVEAU_AIDE_MAX_EQUATION = 2;
export const NIVEAU_AIDE_MAX_EXTRACTION2 = 1;
export const NIVEAU_AIDE_MAX_RELATION = 2;

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
  };
}

export function activerAideSuivante(etat: EtatSessionRelationsDroites): EtatSessionRelationsDroites {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "extraction") {
    if (etat.niveauAideExtraction >= NIVEAU_AIDE_MAX_EXTRACTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideExtraction: etat.niveauAideExtraction + 1 };
  }
  if (etat.phase === "construction" || etat.phase === "extraction2") {
    const max = etat.phase === "construction" ? NIVEAU_AIDE_MAX_CONSTRUCTION : NIVEAU_AIDE_MAX_EXTRACTION2;
    if (etat.niveauAideConstruction >= max) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideConstruction: etat.niveauAideConstruction + 1 };
  }
  const maxEcran3 = etat.phase === "relation" ? NIVEAU_AIDE_MAX_RELATION : NIVEAU_AIDE_MAX_EQUATION;
  if (etat.niveauAideEquation >= maxEcran3) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
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

/** Écran "extraction" — mène à "construction" (famille `construction`) ou à "extraction2"
 * (famille `reconnaissance`). */
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

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: exercice.famille === "reconnaissance" ? "extraction2" : "construction",
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

  const score = etapeCourante.score as number;

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

  const score = etapeCourante.score as number;

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    famille: exercice.famille,
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

/** Écran "extraction2" (famille `reconnaissance`) — vecteur directeur de d₂, mène toujours à
 * "relation". Partage les champs d'état de l'écran 2 (`niveauAideConstruction`,
 * `scoreConstructionExercice`, `constructionRevele`). */
export function soumettreReponseExtraction2(etat: EtatSessionRelationsDroites, reponse: ReponseVecteur): EtatSessionRelationsDroites {
  if (etat.terminee || etat.phase !== "extraction2") {
    throw new Error("soumettreReponseExtraction2 : la session n'est pas à l'étape extraction2");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseVecteur>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierExtraction2(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "relation",
    scoreConstructionExercice: etapeCourante.score as number,
    constructionRevele: etapeCourante.revelee,
  };
}

/** Écran "relation" (dernière phase de la famille `reconnaissance`) — UNE seule tentative, clôture
 * toujours l'exercice. */
export function soumettreReponseRelation(etat: EtatSessionRelationsDroites, reponse: RelationReconnue): EtatSessionRelationsDroites {
  if (etat.terminee || etat.phase !== "relation") {
    throw new Error("soumettreReponseRelation : la session n'est pas à l'étape relation");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<RelationReconnue>(etat.etapeCourante, reponse, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: TENTATIVES_MAX_RELATION,
    verifier: (r) => verifierRelation(exercice, r),
    revelerReponse: () => {},
  });

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    famille: exercice.famille,
    formeEntree: exercice.formeEntree,
    formeSortie: exercice.formeSortie,
    critere: exercice.critere,
    scoreExtraction: etat.scoreExtractionExercice as number,
    extractionRevele: etat.extractionRevele,
    extractionAideUtilisee: etat.niveauAideExtraction > 0,
    scoreConstruction: etat.scoreConstructionExercice as number,
    constructionRevele: etat.constructionRevele,
    constructionAideUtilisee: etat.niveauAideConstruction > 0,
    scoreEquation: etapeCourante.score as number,
    equationRevele: etapeCourante.revelee,
    equationAideUtilisee: etat.niveauAideEquation > 0,
  });
}
