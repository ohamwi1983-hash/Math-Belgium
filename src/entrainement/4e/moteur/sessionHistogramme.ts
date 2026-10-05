/**
 * Couche B — moteur de session pour "Regroupement en classes et histogramme" (chapitre 5, second
 * générateur). N'importe jamais rien de `src/generateurs/` — voir `sessionHistogramme.test.ts` pour
 * la preuve avec un générateur factice, même principe que les 30 autres moteurs du projet.
 *
 * Séquence dépendant de la variante — `phaseApresClassement` décide de la phase suivante juste
 * après la clôture de "classement" : `"trace"` directement pour la variante "effectif" (écran
 * "fréquences" sauté), `"frequences"` pour la variante "frequence". "trace" est toujours la phase
 * terminale, quelle que soit la variante.
 *
 * **Aide PROGRESSIVE par écran** (comme "Tableau de fréquences"/"Triangle quelconque"/
 * "Colinéarité"/"Orthogonalité"/"Norme d'un vecteur et distance entre 2 points") — pénalité
 * ADDITIVE (-20 points par niveau atteint) appliquée au moment précis où l'écran se clôt, jamais
 * rétroactivement.
 */
import type { ExerciceHistogramme, GenerateurExerciceHistogramme } from "../core/histogramme.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseClassement, ReponseFrequencesHistogramme, ReponseTrace } from "./verificationHistogramme";
import { verifierClassement, verifierFrequencesHistogramme, verifierTrace } from "./verificationHistogramme";
import type { EtatSessionHistogramme, PhaseHistogramme, ResultatExerciceHistogramme } from "./typesHistogramme";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_CLASSEMENT = 2;
export const NIVEAU_AIDE_MAX_FREQUENCES = 2;
export const NIVEAU_AIDE_MAX_TRACE = 1;

/** Phase suivant la clôture de "classement" — la seule décision de branchement de ce moteur, prise
 * uniquement sur `exercice.variante`, jamais recalculée ailleurs. */
function phaseApresClassement(exercice: ExerciceHistogramme): PhaseHistogramme {
  return exercice.variante === "frequence" ? "frequences" : "trace";
}

export function demarrerSessionHistogramme(reglages: ReglagesSession, generateur: GenerateurExerciceHistogramme): EtatSessionHistogramme {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "classement",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideClassement: 0,
    niveauAideFrequences: 0,
    niveauAideTrace: 0,
    scoreClassementExercice: null,
    classementRevele: false,
    scoreFrequencesExercice: null,
    frequencesRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionHistogramme): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Pénalité additive, jamais sous 0 — un cran de plus retire toujours 20 points supplémentaires. */
function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, ou si le
 * niveau maximal de l'écran courant est déjà atteint (rien de plus à révéler). */
export function activerAideSuivante(etat: EtatSessionHistogramme): EtatSessionHistogramme {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "classement") {
    if (etat.niveauAideClassement >= NIVEAU_AIDE_MAX_CLASSEMENT) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideClassement: etat.niveauAideClassement + 1 };
  }
  if (etat.phase === "frequences") {
    if (etat.niveauAideFrequences >= NIVEAU_AIDE_MAX_FREQUENCES) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideFrequences: etat.niveauAideFrequences + 1 };
  }
  if (etat.niveauAideTrace >= NIVEAU_AIDE_MAX_TRACE) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideTrace: etat.niveauAideTrace + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionHistogramme, resultat: ResultatExerciceHistogramme): EtatSessionHistogramme {
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
    phase: "classement",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideClassement: 0,
    niveauAideFrequences: 0,
    niveauAideTrace: 0,
    scoreClassementExercice: null,
    classementRevele: false,
    scoreFrequencesExercice: null,
    frequencesRevele: false,
  };
}

export function soumettreReponseClassement(etat: EtatSessionHistogramme, reponse: ReponseClassement): EtatSessionHistogramme {
  if (etat.terminee || etat.phase !== "classement") {
    throw new Error("soumettreReponseClassement : la session n'est pas à l'étape classement");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseClassement>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierClassement(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideClassement);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: phaseApresClassement(etat.exerciceCourant),
    scoreClassementExercice: score,
    classementRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseFrequences(etat: EtatSessionHistogramme, reponse: ReponseFrequencesHistogramme): EtatSessionHistogramme {
  if (etat.terminee || etat.phase !== "frequences") {
    throw new Error("soumettreReponseFrequences : la session n'est pas à l'étape frequences");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseFrequencesHistogramme>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierFrequencesHistogramme(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideFrequences);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "trace",
    scoreFrequencesExercice: score,
    frequencesRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice — quelle que soit la variante. */
export function soumettreReponseTrace(etat: EtatSessionHistogramme, reponse: ReponseTrace): EtatSessionHistogramme {
  if (etat.terminee || etat.phase !== "trace") {
    throw new Error("soumettreReponseTrace : la session n'est pas à l'étape trace");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseTrace>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTrace(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideTrace);

  return cloturerExerciceOuSuivant(etat, {
    variante: etat.exerciceCourant.variante,
    scoreClassement: etat.scoreClassementExercice as number,
    classementRevele: etat.classementRevele,
    niveauAideClassement: etat.niveauAideClassement,
    scoreFrequences: etat.scoreFrequencesExercice,
    frequencesRevele: etat.frequencesRevele,
    niveauAideFrequences: etat.niveauAideFrequences,
    scoreTrace: score,
    traceRevele: etapeCourante.revelee,
    niveauAideTrace: etat.niveauAideTrace,
  });
}
