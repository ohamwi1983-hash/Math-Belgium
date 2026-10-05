/**
 * Couche B — moteur de session pour "Construction graphique de la parabole". N'importe jamais rien
 * de `src/generateurs/` — voir `sessionConstructionParabole.test.ts` pour la preuve avec un
 * générateur factice.
 *
 * Boucle de `NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE` (3) itérations de phase "construction",
 * suivie d'une unique phase "trace" terminale — même patron de boucle que l'ancien générateur qu'il
 * remplace, simplifié à une seule sous-étape par itération (plus de phase "resolution" séparée,
 * les points d'intersection étant désormais calculés automatiquement — voir
 * `verificationConstructionParabole.ts`).
 *
 * Aide PROGRESSIVE par itération — pénalité ADDITIVE (-20 points/niveau) appliquée au moment précis
 * où l'itération se clôt, jamais rétroactivement, et remise à zéro à chaque nouvelle itération
 * (même principe que le reste de la plateforme).
 */
import type { ExerciceConstructionParabole, GenerateurExerciceConstructionParabole } from "../core/constructionParabole.types";
import type { ReglagesSession } from "../core/session.types";
import type { Point } from "../core/vecteur.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionConstructionParabole, ResultatExerciceConstructionParabole } from "./typesConstructionParabole";
import type { ReponseConstructionParabole } from "./verificationConstructionParabole";
import { pointsCiblesIteration, rCanoniqueDisponible, rEstValide, verifierConstruction, verifierOrdreSelection } from "./verificationConstructionParabole";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE = 3;
export const NIVEAU_AIDE_MAX_CONSTRUCTION = 2;

function etatInitial(
  exercice: ExerciceConstructionParabole,
): Pick<EtatSessionConstructionParabole, "exerciceCourant" | "phase" | "iterationCourante" | "etapeCourante" | "niveauAideConstruction" | "iterationsCompletes"> {
  return {
    exerciceCourant: exercice,
    phase: "construction",
    iterationCourante: 0,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideConstruction: 0,
    iterationsCompletes: [],
  };
}

export function demarrerSessionConstructionParabole(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceConstructionParabole,
): EtatSessionConstructionParabole {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionConstructionParabole): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionConstructionParabole): EtatSessionConstructionParabole {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.niveauAideConstruction >= NIVEAU_AIDE_MAX_CONSTRUCTION) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cette itération");
  }
  return { ...etat, niveauAideConstruction: etat.niveauAideConstruction + 1 };
}

/** Les points cibles des itérations déjà closes — recalculés depuis chaque `r` confirmé, jamais
 * stockés séparément (même principe de cohérence interne que l'ancien générateur). */
export function ciblesTraceConstructionParabole(etat: EtatSessionConstructionParabole): Point[] {
  return etat.iterationsCompletes.flatMap((iteration) => pointsCiblesIteration(etat.exerciceCourant, iteration.r));
}

function cloturerExerciceOuSuivant(etat: EtatSessionConstructionParabole, resultat: ResultatExerciceConstructionParabole): EtatSessionConstructionParabole {
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

/** Écran "construction" — répété `NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE` fois ; passe à "trace"
 * une fois la dernière itération close. */
export function soumettreReponseConstruction(etat: EtatSessionConstructionParabole, reponse: ReponseConstructionParabole): EtatSessionConstructionParabole {
  if (etat.terminee || etat.phase !== "construction") {
    throw new Error("soumettreReponseConstruction : la session n'est pas à l'étape construction");
  }
  const exercice = etat.exerciceCourant;
  const rDejaUtilises = etat.iterationsCompletes.map((iteration) => iteration.r);

  const etapeCourante = soumettreEtapeTentatives<ReponseConstructionParabole>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstruction(exercice, r, rDejaUtilises),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideConstruction);
  // Repli défensif sur épuisement des tentatives : la dernière soumission de l'élève peut être un r
  // invalide (jamais garanti valide contrairement à une réponse correcte) — ne jamais le stocker tel
  // quel, sous peine de points cibles dégénérés/NaN pour le tracé final (voir `pointsCiblesIteration`,
  // qui suppose `r>rMinimal`). `rCanoniqueDisponible` (plutôt que `rCanonique`) garantit en plus que
  // ce repli n'introduit jamais lui-même une réutilisation de r (2 paires de points cibles
  // identiques, la seconde jamais cliquable sur l'écran de tracé — voir sa documentation). Jamais
  // atteint en usage normal (une soumission correcte utilise toujours un r déjà valide), uniquement
  // sur le chemin de révélation à l'épuisement.
  const r = rEstValide(exercice, reponse.r, rDejaUtilises) ? reponse.r : rCanoniqueDisponible(exercice, rDejaUtilises);
  const iterationsCompletes = [
    ...etat.iterationsCompletes,
    { r, scoreConstruction: score, constructionRevele: etapeCourante.revelee, constructionAideUtilisee: etat.niveauAideConstruction > 0 },
  ];
  const iterationCourante = etat.iterationCourante + 1;

  if (iterationCourante >= NOMBRE_ITERATIONS_CONSTRUCTION_PARABOLE) {
    return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: "trace", iterationCourante, niveauAideConstruction: 0, iterationsCompletes };
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), iterationCourante, niveauAideConstruction: 0, iterationsCompletes };
}

/** Écran "trace" (dernier, toujours terminal) — clôture toujours l'exercice. */
export function soumettreReponseTrace(etat: EtatSessionConstructionParabole, clics: Point[]): EtatSessionConstructionParabole {
  if (etat.terminee || etat.phase !== "trace") {
    throw new Error("soumettreReponseTrace : la session n'est pas à l'étape trace");
  }

  const cibles = ciblesTraceConstructionParabole(etat);
  const etapeCourante = soumettreEtapeTentatives<Point[]>(etat.etapeCourante, clics, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierOrdreSelection(cibles, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return cloturerExerciceOuSuivant(etat, {
    iterations: etat.iterationsCompletes,
    scoreTrace: etapeCourante.score as number,
    traceRevele: etapeCourante.revelee,
  });
}
