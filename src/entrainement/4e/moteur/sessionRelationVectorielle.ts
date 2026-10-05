/**
 * Couche B — moteur de session pour "Point à partir d'une relation vectorielle" (version guidée,
 * position 20). N'importe jamais rien de src/generateurs — voir sessionRelationVectorielle.test.ts
 * pour la preuve avec un générateur factice, même principe que les autres moteurs du projet.
 *
 * Phase initiale selon la variante — `translation` démarre directement à `"coordonnees"` (pas
 * d'étape de traduction symbolique pour un simple déplacement) ; `relationGenerale`
 * (`pointAPoint`/`milieu`, même traitement) démarre à `"traduction"`, puis avance à `"coordonnees"`
 * quelle que soit la réponse (correcte ou tentatives épuisées — le flux avance toujours, seul le
 * score diffère, même principe que le reste du projet).
 *
 * **Une seule aide pénalisante par exercice** (`aideUtilisee`, jamais réinitialisée entre les deux
 * phases d'un même exercice `relationGenerale` — le même graphe aide les deux étapes) : le facteur
 * ×0,5 est appliqué à CHAQUE note (traduction, coordonnées) au moment précis où elle se clôt, jamais
 * rétroactivement à une note déjà close avant l'activation — même principe exact que
 * "Transformations graphiques" (ses deux notes indépendantes équation/curseurs).
 */
import type { ExerciceRelationGeneraleRV, GenerateurExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierCoordonnees, verifierTraduction } from "./verificationRelationVectorielle";
import type { EtatSessionRelationVectorielle, PhaseRelationVectorielle, ResultatExerciceRelationVectorielle } from "./typesRelationVectorielle";

const POINTS_DE_BASE = 100;

function phaseInitiale(exercice: EtatSessionRelationVectorielle["exerciceCourant"]): PhaseRelationVectorielle {
  return exercice.variante === "translation" ? "coordonnees" : "traduction";
}

export function demarrerSessionRelationVectorielle(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceRelationVectorielle,
): EtatSessionRelationVectorielle {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    aideUtilisee: false,
    scoreTraductionExercice: null,
    traductionRevele: false,
    traductionAideUtiliseeExercice: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionRelationVectorielle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Pénalité multiplicative, appliquée une seule fois à la clôture de chaque note — jamais une
 * pénalité par tentative (déjà gérée par `etapeTentatives.ts`). */
function appliquerPenaliteAide(score: number, aideUtilisee: boolean): number {
  return aideUtilisee ? score * 0.5 : score;
}

/** Révélation à sens unique — lève si la session est déjà terminée. */
export function activerAide(etat: EtatSessionRelationVectorielle): EtatSessionRelationVectorielle {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  return { ...etat, aideUtilisee: true };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionRelationVectorielle,
  resultat: ResultatExerciceRelationVectorielle,
): EtatSessionRelationVectorielle {
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
    aideUtilisee: false,
    scoreTraductionExercice: null,
    traductionRevele: false,
    traductionAideUtiliseeExercice: false,
  };
}

/** Variante `relationGenerale` uniquement — jamais atteinte pour `translation` (`phaseInitiale`
 * saute directement à `"coordonnees"` pour cette variante). */
export function soumettreReponseTraduction(etat: EtatSessionRelationVectorielle, texte: string): EtatSessionRelationVectorielle {
  if (etat.terminee || etat.phase !== "traduction") {
    throw new Error("soumettreReponseTraduction : la session n'est pas à l'étape traduction");
  }
  const exercice = etat.exerciceCourant as ExerciceRelationGeneraleRV;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => verifierTraduction(exercice, t),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideUtilisee);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "coordonnees",
    scoreTraductionExercice: score,
    traductionRevele: etapeCourante.revelee,
    traductionAideUtiliseeExercice: etat.aideUtilisee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseCoordonnees(etat: EtatSessionRelationVectorielle, x: number, y: number): EtatSessionRelationVectorielle {
  if (etat.terminee || etat.phase !== "coordonnees") {
    throw new Error("soumettreReponseCoordonnees : la session n'est pas à l'étape coordonnees");
  }

  const etapeCourante = soumettreEtapeTentatives<{ x: number; y: number }>(
    etat.etapeCourante,
    { x, y },
    {
      ...reglagesEtape(etat),
      verifier: (v) => verifierCoordonnees(etat.exerciceCourant, v.x, v.y),
      revelerReponse: () => {},
    },
  );

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideUtilisee);

  return cloturerExerciceOuSuivant(etat, {
    variante: etat.exerciceCourant.variante,
    scoreTraduction: etat.scoreTraductionExercice,
    traductionRevele: etat.traductionRevele,
    traductionAideUtilisee: etat.traductionAideUtiliseeExercice,
    scoreCoordonnees: score,
    coordonneesRevele: etapeCourante.revelee,
    coordonneesAideUtilisee: etat.aideUtilisee,
  });
}
