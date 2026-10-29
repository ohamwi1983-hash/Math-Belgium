/**
 * Couche B — moteur de session pour "Équation d'une droite". N'importe jamais rien de
 * `src/generateurs/` — voir `sessionEquationDroite.test.ts` pour la preuve avec un générateur
 * factice.
 *
 * Séquence dépendant de `exercice.formeCible` (`promptgen42modificationsv2.md`) — voir
 * `PhaseEquationDroite` (`typesEquationDroite.ts`) pour le détail des 2 chemins disjoints :
 * "implicite"/"parametrique" vont à `extraction → coefficients` ; "explicite_y"/"explicite_x" vont
 * à `extraction → possibiliteCoefficients` (écran fusionné terminal).
 *
 * Aide PROGRESSIVE par écran (même principe que "Colinéarité"/"Orthogonalité") : 2 niveaux sur
 * chaque écran.
 */
import type { ExerciceEquationDroite, GenerateurExerciceEquationDroite } from "../core/equationDroite.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionEquationDroite, PhaseEquationDroite, ReponseCoefficients, ReponsePossibiliteCoefficients, ResultatExerciceEquationDroite } from "./typesEquationDroite";
import {
  diagnostiquerExpliciteX,
  diagnostiquerExpliciteY,
  diagnostiquerImplicite,
  diagnostiquerParametrique,
  diagnostiquerPossibiliteCoefficients,
  verifierExtraction,
} from "./verificationEquationDroite";
import type { ReponseExtraction } from "./verificationEquationDroite";

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX_EXTRACTION = 2;
export const NIVEAU_AIDE_MAX_COEFFICIENTS = 2;
/** Écran fusionné (partie A) — reprend le contenu de l'ancienne aide de "coefficients" (2 niveaux),
 * adapté au choix Possible/Impossible de l'élève (`formatAideNiveau2PossibiliteCoefficientsLatex`). */
export const NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS = 2;

/** Phase suivant "extraction", déterminée par `formeCible` — voir l'en-tête de fichier pour le
 * détail des 2 chemins. */
function prochainePhaseApresExtraction(exercice: ExerciceEquationDroite): PhaseEquationDroite {
  if (exercice.formeCible === "parametrique" || exercice.formeCible === "implicite") return "coefficients";
  return "possibiliteCoefficients";
}

function etatInitial(exercice: ExerciceEquationDroite): Pick<
  EtatSessionEquationDroite,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideExtraction"
  | "niveauAideCoefficients"
  | "niveauAidePossibiliteCoefficients"
  | "scoreExtractionExercice"
  | "extractionRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: "extraction",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideExtraction: 0,
    niveauAideCoefficients: 0,
    niveauAidePossibiliteCoefficients: 0,
    scoreExtractionExercice: null,
    extractionRevele: false,
  };
}

export function demarrerSessionEquationDroite(reglages: ReglagesSession, generateur: GenerateurExerciceEquationDroite): EtatSessionEquationDroite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionEquationDroite): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
  };
}

export function activerAideSuivante(etat: EtatSessionEquationDroite): EtatSessionEquationDroite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "extraction") {
    if (etat.niveauAideExtraction >= NIVEAU_AIDE_MAX_EXTRACTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideExtraction: etat.niveauAideExtraction + 1 };
  }
  if (etat.phase === "possibiliteCoefficients") {
    if (etat.niveauAidePossibiliteCoefficients >= NIVEAU_AIDE_MAX_POSSIBILITE_COEFFICIENTS)
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAidePossibiliteCoefficients: etat.niveauAidePossibiliteCoefficients + 1 };
  }
  if (etat.niveauAideCoefficients >= NIVEAU_AIDE_MAX_COEFFICIENTS) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideCoefficients: etat.niveauAideCoefficients + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationDroite, resultat: ResultatExerciceEquationDroite): EtatSessionEquationDroite {
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

/** Écran "extraction" — la phase suivante dépend de `formeCible` (`prochainePhaseApresExtraction`,
 * voir en-tête de fichier). */
export function soumettreReponseExtraction(etat: EtatSessionEquationDroite, reponse: ReponseExtraction): EtatSessionEquationDroite {
  if (etat.terminee || etat.phase !== "extraction") {
    throw new Error("soumettreReponseExtraction : la session n'est pas à l'étape extraction");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseExtraction>(etat.etapeCourante, reponse, {
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
    phase: prochainePhaseApresExtraction(exercice),
    scoreExtractionExercice: score,
    extractionRevele: etapeCourante.revelee,
  };
}

function verifierCoefficients(exercice: ExerciceEquationDroite, reponse: ReponseCoefficients): boolean {
  switch (exercice.formeCible) {
    case "parametrique":
      return diagnostiquerParametrique(exercice, reponse as never) === "correct";
    case "implicite":
      return diagnostiquerImplicite(exercice, reponse as never) === "correct";
    case "explicite_y":
      return diagnostiquerExpliciteY(exercice, reponse as never) === "correct";
    case "explicite_x":
      return diagnostiquerExpliciteX(exercice, reponse as never) === "correct";
  }
}

/** Écran "coefficients" — atteint directement depuis "extraction" (formeCible "implicite" ou
 * "parametrique"). Dernière phase de ce chemin, clôture toujours l'exercice. */
export function soumettreReponseCoefficients(etat: EtatSessionEquationDroite, reponse: ReponseCoefficients): EtatSessionEquationDroite {
  if (etat.terminee || etat.phase !== "coefficients") {
    throw new Error("soumettreReponseCoefficients : la session n'est pas à l'étape coefficients");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseCoefficients>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCoefficients(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return cloturerExerciceOuSuivant(etat, {
    typeDonnee: exercice.donnees.type,
    formeCible: exercice.formeCible,
    scoreExtraction: etat.scoreExtractionExercice as number,
    extractionRevele: etat.extractionRevele,
    extractionAideUtilisee: etat.niveauAideExtraction > 0,
    scoreCoefficients: score,
    coefficientsRevele: etapeCourante.revelee,
    coefficientsAideUtilisee: etat.niveauAideCoefficients > 0,
    scorePossibiliteCoefficients: null,
    possibiliteCoefficientsRevele: false,
    possibiliteCoefficientsAideUtilisee: false,
  });
}

/** Écran fusionné "possibilité + équation" (partie A, formes explicite_y/explicite_x uniquement) —
 * dernière phase de ce chemin, clôture toujours l'exercice directement (jamais de score
 * intermédiaire à persister dans `etat`, contrairement à "extraction"). */
export function soumettreReponsePossibiliteCoefficients(etat: EtatSessionEquationDroite, reponse: ReponsePossibiliteCoefficients): EtatSessionEquationDroite {
  if (etat.terminee || etat.phase !== "possibiliteCoefficients") {
    throw new Error("soumettreReponsePossibiliteCoefficients : la session n'est pas à l'étape possibiliteCoefficients");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponsePossibiliteCoefficients>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerPossibiliteCoefficients(exercice, r) === "correct",
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = etapeCourante.score as number;

  return cloturerExerciceOuSuivant(etat, {
    typeDonnee: exercice.donnees.type,
    formeCible: exercice.formeCible,
    scoreExtraction: etat.scoreExtractionExercice as number,
    extractionRevele: etat.extractionRevele,
    extractionAideUtilisee: etat.niveauAideExtraction > 0,
    scoreCoefficients: null,
    coefficientsRevele: false,
    coefficientsAideUtilisee: false,
    scorePossibiliteCoefficients: score,
    possibiliteCoefficientsRevele: etapeCourante.revelee,
    possibiliteCoefficientsAideUtilisee: etat.niveauAidePossibiliteCoefficients > 0,
  });
}
