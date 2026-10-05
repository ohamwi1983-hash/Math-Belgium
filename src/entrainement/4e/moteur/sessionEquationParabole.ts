/**
 * Couche B — moteur de session pour "Équation d'une parabole depuis un graphe". N'importe jamais
 * rien de `src/generateurs/` — voir `sessionEquationParabole.test.ts` pour la preuve avec un
 * générateur factice.
 *
 * 2 phases FIXES, toujours dans le même ordre : `sommetFoyer → equation` — aucun saut conditionnel,
 * les deux variantes traversant exactement la même séquence (même principe que "Équation d'un
 * cercle... à partir d'un graphe").
 *
 * Aide PROGRESSIVE par écran — pénalité ADDITIVE (-20 points/niveau) appliquée au moment précis où
 * l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceEquationParabole, GenerateurExerciceEquationParabole } from "../core/equationParabole.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionEquationParabole, ResultatExerciceEquationParabole } from "./typesEquationParabole";
import { verifierEquation, verifierSommetFoyer } from "./verificationEquationParabole";
import type { ReponseSommetFoyer } from "./verificationEquationParabole";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_SOMMET_FOYER = 2;
export const NIVEAU_AIDE_MAX_EQUATION = 2;

function etatInitial(
  exercice: ExerciceEquationParabole,
): Pick<
  EtatSessionEquationParabole,
  "exerciceCourant" | "phase" | "etapeCourante" | "niveauAideSommetFoyer" | "niveauAideEquation" | "scoreSommetFoyerExercice" | "sommetFoyerRevele" | "sommetFoyerAideUtilisee"
> {
  return {
    exerciceCourant: exercice,
    phase: "sommetFoyer",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideSommetFoyer: 0,
    niveauAideEquation: 0,
    scoreSommetFoyerExercice: null,
    sommetFoyerRevele: false,
    sommetFoyerAideUtilisee: false,
  };
}

export function demarrerSessionEquationParabole(reglages: ReglagesSession, generateur: GenerateurExerciceEquationParabole): EtatSessionEquationParabole {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionEquationParabole): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionEquationParabole): EtatSessionEquationParabole {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "sommetFoyer") {
    if (etat.niveauAideSommetFoyer >= NIVEAU_AIDE_MAX_SOMMET_FOYER) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideSommetFoyer: etat.niveauAideSommetFoyer + 1 };
  }
  if (etat.niveauAideEquation >= NIVEAU_AIDE_MAX_EQUATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideEquation: etat.niveauAideEquation + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationParabole, resultat: ResultatExerciceEquationParabole): EtatSessionEquationParabole {
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

/** Écran "sommetFoyer" — mène toujours à "equation". */
export function soumettreReponseSommetFoyer(etat: EtatSessionEquationParabole, reponse: ReponseSommetFoyer): EtatSessionEquationParabole {
  if (etat.terminee || etat.phase !== "sommetFoyer") {
    throw new Error("soumettreReponseSommetFoyer : la session n'est pas à l'étape sommetFoyer");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseSommetFoyer>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSommetFoyer(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSommetFoyer);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equation",
    scoreSommetFoyerExercice: score,
    sommetFoyerRevele: etapeCourante.revelee,
    sommetFoyerAideUtilisee: etat.niveauAideSommetFoyer > 0,
  };
}

/** Écran "equation" (dernier, toujours terminal) — clôture toujours l'exercice. */
export function soumettreReponseEquation(etat: EtatSessionEquationParabole, reponse: string): EtatSessionEquationParabole {
  if (etat.terminee || etat.phase !== "equation") {
    throw new Error("soumettreReponseEquation : la session n'est pas à l'étape equation");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
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
    scoreSommetFoyer: etat.scoreSommetFoyerExercice as number,
    sommetFoyerRevele: etat.sommetFoyerRevele,
    sommetFoyerAideUtilisee: etat.sommetFoyerAideUtilisee,
    scoreEquation: score,
    equationRevele: etapeCourante.revelee,
    equationAideUtilisee: etat.niveauAideEquation > 0,
  });
}
