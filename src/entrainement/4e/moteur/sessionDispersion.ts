/**
 * Couche B — moteur de session pour "Paramètres de dispersion" (remplace "Mode et classe modale",
 * `promptgen34remplacement.md`). N'importe jamais rien de `src/generateurs/` — même principe que
 * les autres moteurs.
 *
 * Phases FIXES par famille (voir `typesDispersion.ts`) — famille "valeurs" : `tableau →
 * varianceEcartType` (comportement historique inchangé) ; famille "classes" : `centresMoyenne →
 * tableau → varianceEcartType`. `varianceEcartType` toujours terminale. **Aide PROGRESSIVE par
 * écran** (même mécanique exacte que "Moyenne pondérée"/"Tableau de fréquences"/"Triangle
 * quelconque"/"Colinéarité"/"Orthogonalité").
 */
import type { ExerciceDispersion, GenerateurExerciceDispersion } from "../core/dispersion.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseCentresMoyenneDispersion, ReponseTableauDispersion, ReponseVarianceEcartType } from "./verificationDispersion";
import { verifierCentresMoyenneDispersion, verifierTableauDispersion, verifierVarianceEcartType } from "./verificationDispersion";
import type { EtatSessionDispersion, PhaseDispersion, ResultatExerciceDispersion } from "./typesDispersion";

const POINTS_DE_BASE = 100;
export const NIVEAU_AIDE_MAX_CENTRES_MOYENNE = 2;
export const NIVEAU_AIDE_MAX_TABLEAU = 2;
export const NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE = 2;

/** Première phase d'un exercice : l'écran supplémentaire « centres et moyenne » pour la famille
 * "classes", directement le tableau sinon. */
export function phaseInitialeDispersion(exercice: ExerciceDispersion): PhaseDispersion {
  return exercice.enClasses ? "centresMoyenne" : "tableau";
}

/** Ordre des écrans d'un exercice (puces de progression). */
export function ordrePhasesDispersion(exercice: ExerciceDispersion): PhaseDispersion[] {
  return exercice.enClasses ? ["centresMoyenne", "tableau", "varianceEcartType"] : ["tableau", "varianceEcartType"];
}

function etatExercice(exerciceCourant: ExerciceDispersion) {
  return {
    exerciceCourant,
    phase: phaseInitialeDispersion(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideCentresMoyenne: 0,
    niveauAideTableau: 0,
    niveauAideVarianceEcartType: 0,
    scoreCentresMoyenneExercice: null,
    centresMoyenneRevele: false,
    scoreTableauExercice: null,
    tableauRevele: false,
  };
}

export function demarrerSessionDispersion(reglages: ReglagesSession, generateur: GenerateurExerciceDispersion): EtatSessionDispersion {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    ...etatExercice(generateur()),
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionDispersion): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
  };
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, ou si le
 * niveau maximal de l'écran courant est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionDispersion): EtatSessionDispersion {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "centresMoyenne") {
    if (etat.niveauAideCentresMoyenne >= NIVEAU_AIDE_MAX_CENTRES_MOYENNE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideCentresMoyenne: etat.niveauAideCentresMoyenne + 1 };
  }
  if (etat.phase === "tableau") {
    if (etat.niveauAideTableau >= NIVEAU_AIDE_MAX_TABLEAU) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideTableau: etat.niveauAideTableau + 1 };
  }
  if (etat.niveauAideVarianceEcartType >= NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideVarianceEcartType: etat.niveauAideVarianceEcartType + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDispersion, resultat: ResultatExerciceDispersion): EtatSessionDispersion {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    ...etatExercice(etat.generateur()),
  };
}

/** Écran supplémentaire de la famille "classes" : centres de classes et x̄. */
export function soumettreReponseCentresMoyenne(etat: EtatSessionDispersion, reponse: ReponseCentresMoyenneDispersion): EtatSessionDispersion {
  if (etat.terminee || etat.phase !== "centresMoyenne") {
    throw new Error("soumettreReponseCentresMoyenne : la session n'est pas à l'étape centresMoyenne");
  }

  const exerciceCourant = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives<ReponseCentresMoyenneDispersion>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCentresMoyenneDispersion(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "tableau",
    scoreCentresMoyenneExercice: etapeCourante.score as number,
    centresMoyenneRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseTableau(etat: EtatSessionDispersion, reponse: ReponseTableauDispersion): EtatSessionDispersion {
  if (etat.terminee || etat.phase !== "tableau") {
    throw new Error("soumettreReponseTableau : la session n'est pas à l'étape tableau");
  }

  const exerciceCourant = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives<ReponseTableauDispersion>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTableauDispersion(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "varianceEcartType",
    scoreTableauExercice: score,
    tableauRevele: etapeCourante.revelee,
  };
}

/** Toujours la phase terminale. */
export function soumettreReponseVarianceEcartType(etat: EtatSessionDispersion, reponse: ReponseVarianceEcartType): EtatSessionDispersion {
  if (etat.terminee || etat.phase !== "varianceEcartType") {
    throw new Error("soumettreReponseVarianceEcartType : la session n'est pas à l'étape varianceEcartType");
  }

  const exerciceCourant: ExerciceDispersion = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives<ReponseVarianceEcartType>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierVarianceEcartType(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return cloturerExerciceOuSuivant(etat, {
    scoreTableau: etat.scoreTableauExercice as number,
    tableauRevele: etat.tableauRevele,
    niveauAideTableau: etat.niveauAideTableau,
    scoreVarianceEcartType: score,
    varianceEcartTypeRevele: etapeCourante.revelee,
    niveauAideVarianceEcartType: etat.niveauAideVarianceEcartType,
    ...(exerciceCourant.enClasses
      ? {
          scoreCentresMoyenne: etat.scoreCentresMoyenneExercice as number,
          centresMoyenneRevele: etat.centresMoyenneRevele,
          niveauAideCentresMoyenne: etat.niveauAideCentresMoyenne,
        }
      : {}),
  });
}
