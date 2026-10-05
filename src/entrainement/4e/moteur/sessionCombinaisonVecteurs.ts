/**
 * Couche B — moteur de session pour "Calcul de composantes de combinaisons linéaires" (chapitre
 * "Calcul vectoriel"). N'importe jamais rien de src/generateurs — voir
 * sessionCombinaisonVecteurs.test.ts pour la preuve avec un générateur factice.
 *
 * 2 phases fixes, toujours dans le même ordre : simplification → composantes.
 *
 * **Aide PROGRESSIVE par écran** (même principe exact que "Triangle quelconque",
 * `sessionTriangleQuelconque.ts`) — 3 niveaux pour l'écran "simplification", 2 pour l'écran
 * "composantes" (`activerAideSuivante`), chacun un cran de plus que le précédent, jamais
 * accessible au-delà de son maximum ni hors de la phase à laquelle il appartient. Pénalité
 * ADDITIVE (-20 points par niveau atteint) appliquée au niveau atteint au moment précis où l'écran
 * se clôt — jamais rétroactivement.
 */
import type { GenerateurExerciceCombinaisonVecteurs } from "../core/combinaisonVecteurs.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierComposantes, verifierSimplification } from "./verificationCombinaisonVecteurs";
import type { EtatSessionCombinaisonVecteurs, ResultatExerciceCombinaisonVecteurs } from "./typesCombinaisonVecteurs";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_SIMPLIFICATION = 3;
export const NIVEAU_AIDE_MAX_COMPOSANTES = 2;

export function demarrerSessionCombinaisonVecteurs(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceCombinaisonVecteurs,
): EtatSessionCombinaisonVecteurs {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "simplification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideSimplification: 0,
    niveauAideComposantes: 0,
    scoreSimplificationExercice: null,
    simplificationRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionCombinaisonVecteurs): ReglagesEtape {
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
export function activerAideSuivante(etat: EtatSessionCombinaisonVecteurs): EtatSessionCombinaisonVecteurs {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "simplification") {
    if (etat.niveauAideSimplification >= NIVEAU_AIDE_MAX_SIMPLIFICATION) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideSimplification: etat.niveauAideSimplification + 1 };
  }
  if (etat.niveauAideComposantes >= NIVEAU_AIDE_MAX_COMPOSANTES) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideComposantes: etat.niveauAideComposantes + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionCombinaisonVecteurs,
  resultat: ResultatExerciceCombinaisonVecteurs,
): EtatSessionCombinaisonVecteurs {
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
    phase: "simplification",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideSimplification: 0,
    niveauAideComposantes: 0,
    scoreSimplificationExercice: null,
    simplificationRevele: false,
  };
}

export function soumettreReponseSimplification(etat: EtatSessionCombinaisonVecteurs, texte: string): EtatSessionCombinaisonVecteurs {
  if (etat.terminee || etat.phase !== "simplification") {
    throw new Error("soumettreReponseSimplification : la session n'est pas à l'étape simplification");
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSimplification(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSimplification);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "composantes",
    scoreSimplificationExercice: score,
    simplificationRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseComposantes(
  etat: EtatSessionCombinaisonVecteurs,
  reponse: { x: number; y: number },
): EtatSessionCombinaisonVecteurs {
  if (etat.terminee || etat.phase !== "composantes") {
    throw new Error("soumettreReponseComposantes : la session n'est pas à l'étape composantes");
  }

  const etapeCourante = soumettreEtapeTentatives<{ x: number; y: number }>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierComposantes(etat.exerciceCourant, r.x, r.y),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideComposantes);

  return cloturerExerciceOuSuivant(etat, {
    variante: etat.exerciceCourant.variante,
    scoreSimplification: etat.scoreSimplificationExercice as number,
    simplificationRevele: etat.simplificationRevele,
    niveauAideSimplification: etat.niveauAideSimplification,
    scoreComposantes: score,
    composantesRevele: etapeCourante.revelee,
    niveauAideComposantes: etat.niveauAideComposantes,
  });
}
