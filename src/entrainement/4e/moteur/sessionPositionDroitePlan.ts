/**
 * Couche B — moteur de session pour "Position d'une droite par rapport à un plan" (39e générateur,
 * chapitre "Géométrie dans l'espace"). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionPositionDroitePlan.test.ts` pour la preuve avec un générateur factice, même principe que
 * les autres moteurs du projet.
 *
 * 2 phases fixes, toujours dans le même ordre : classification → justification. Aide PROGRESSIVE
 * par écran (2 niveaux sur "classification", 1 sur "justification"), pénalité ADDITIVE (-20 points
 * par niveau atteint) appliquée à la clôture de l'écran concerné — voir `typesPositionDroitePlan.ts`.
 */
import type { ConclusionPositionDroitePlan, GenerateurExercicePositionDroitePlan, ReponseJustificationPositionDroitePlan } from "../core/positionDroitePlan.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierClassification, verifierJustification } from "./verificationPositionDroitePlan";
import type { EtatSessionPositionDroitePlan, ResultatExercicePositionDroitePlan } from "./typesPositionDroitePlan";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_CLASSIFICATION = 2;
export const NIVEAU_AIDE_MAX_JUSTIFICATION = 1;

export function demarrerSessionPositionDroitePlan(
  reglages: ReglagesSession,
  generateur: GenerateurExercicePositionDroitePlan,
): EtatSessionPositionDroitePlan {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "classification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideClassification: 0,
    niveauAideJustification: 0,
    scoreClassificationExercice: null,
    classificationRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionPositionDroitePlan): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, ou si le
 * niveau maximal de l'écran courant est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionPositionDroitePlan): EtatSessionPositionDroitePlan {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "classification") {
    if (etat.niveauAideClassification >= NIVEAU_AIDE_MAX_CLASSIFICATION) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideClassification: etat.niveauAideClassification + 1 };
  }
  if (etat.niveauAideJustification >= NIVEAU_AIDE_MAX_JUSTIFICATION) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideJustification: etat.niveauAideJustification + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionPositionDroitePlan,
  resultat: ResultatExercicePositionDroitePlan,
): EtatSessionPositionDroitePlan {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    phase: "classification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideClassification: 0,
    niveauAideJustification: 0,
    scoreClassificationExercice: null,
    classificationRevele: false,
  };
}

export function soumettreReponseClassification(
  etat: EtatSessionPositionDroitePlan,
  reponse: ConclusionPositionDroitePlan,
): EtatSessionPositionDroitePlan {
  if (etat.terminee || etat.phase !== "classification") {
    throw new Error("soumettreReponseClassification : la session n'est pas à l'étape classification");
  }

  const etapeCourante = soumettreEtapeTentatives<ConclusionPositionDroitePlan>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierClassification(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideClassification);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "justification",
    scoreClassificationExercice: score,
    classificationRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseJustification(
  etat: EtatSessionPositionDroitePlan,
  reponse: ReponseJustificationPositionDroitePlan,
): EtatSessionPositionDroitePlan {
  if (etat.terminee || etat.phase !== "justification") {
    throw new Error("soumettreReponseJustification : la session n'est pas à l'étape justification");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseJustificationPositionDroitePlan>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierJustification(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideJustification);

  return cloturerExerciceOuSuivant(etat, {
    classification: etat.exerciceCourant.classification,
    scoreClassification: etat.scoreClassificationExercice as number,
    classificationRevele: etat.classificationRevele,
    niveauAideClassification: etat.niveauAideClassification,
    scoreJustification: score,
    justificationRevele: etapeCourante.revelee,
    niveauAideJustification: etat.niveauAideJustification,
  });
}
