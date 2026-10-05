/**
 * Couche B — moteur de session pour "Paramètres de dispersion" (remplace "Mode et classe modale",
 * `promptgen34remplacement.md`). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionDispersion.test.ts` pour la preuve avec un générateur factice, même principe que les 33
 * autres moteurs.
 *
 * 2 phases FIXES, toujours dans le même ordre — `tableau → varianceEcartType`, cette dernière
 * toujours terminale. **Aide PROGRESSIVE par écran** — pénalité ADDITIVE (-20 points par niveau
 * atteint) appliquée au moment précis où l'écran se clôt, jamais rétroactivement (même mécanique
 * exacte que "Moyenne pondérée"/"Tableau de fréquences"/"Triangle quelconque"/"Colinéarité"/
 * "Orthogonalité").
 */
import type { ExerciceDispersion, GenerateurExerciceDispersion } from "../core/dispersion.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseTableauDispersion, ReponseVarianceEcartType } from "./verificationDispersion";
import { verifierTableauDispersion, verifierVarianceEcartType } from "./verificationDispersion";
import type { EtatSessionDispersion, ResultatExerciceDispersion } from "./typesDispersion";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_TABLEAU = 2;
export const NIVEAU_AIDE_MAX_VARIANCE_ECART_TYPE = 2;

export function demarrerSessionDispersion(reglages: ReglagesSession, generateur: GenerateurExerciceDispersion): EtatSessionDispersion {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "tableau",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideTableau: 0,
    niveauAideVarianceEcartType: 0,
    scoreTableauExercice: null,
    tableauRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionDispersion): ReglagesEtape {
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
 * niveau maximal de l'écran courant est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionDispersion): EtatSessionDispersion {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
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
    exerciceCourant: etat.generateur(),
    phase: "tableau",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideTableau: 0,
    niveauAideVarianceEcartType: 0,
    scoreTableauExercice: null,
    tableauRevele: false,
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

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideTableau);

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

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideVarianceEcartType);

  return cloturerExerciceOuSuivant(etat, {
    scoreTableau: etat.scoreTableauExercice as number,
    tableauRevele: etat.tableauRevele,
    niveauAideTableau: etat.niveauAideTableau,
    scoreVarianceEcartType: score,
    varianceEcartTypeRevele: etapeCourante.revelee,
    niveauAideVarianceEcartType: etat.niveauAideVarianceEcartType,
  });
}
