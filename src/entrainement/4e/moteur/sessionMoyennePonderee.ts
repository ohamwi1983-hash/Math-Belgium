/**
 * Couche B — moteur de session pour "Moyenne pondérée" (chapitre 5, troisième générateur).
 * N'importe jamais rien de `src/generateurs/` — voir `sessionMoyennePonderee.test.ts` pour la
 * preuve avec un générateur factice, même principe que les 31 autres moteurs du projet.
 *
 * Séquence dépendant de la variante — `phaseInitiale` décide de la phase de départ (`"centres"`
 * pour "classes", directement `"sommes"` pour "discrete", l'écran "centres" n'existe pas pour
 * cette variante). "quotient" est désormais TOUJOURS la phase terminale pour les 2 variantes
 * (`promptgen32modifications.md`, point 5 — l'écran "conceptuel" a été retiré, la variante
 * "classes" se termine donc à "quotient" comme "discrete").
 *
 * **Aide PROGRESSIVE par écran** (comme "Tableau de fréquences"/"Regroupement en classes et
 * histogramme"/"Triangle quelconque"/"Colinéarité"/"Orthogonalité") — pénalité ADDITIVE (-20 points
 * par niveau atteint) appliquée au moment précis où l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceMoyennePonderee, GenerateurExerciceMoyennePonderee } from "../core/moyennePonderee.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { ReponseCentres, ReponseQuotient, ReponseSommes } from "./verificationMoyennePonderee";
import { verifierCentres, verifierQuotient, verifierSommes } from "./verificationMoyennePonderee";
import type { EtatSessionMoyennePonderee, PhaseMoyennePonderee, ResultatExerciceMoyennePonderee } from "./typesMoyennePonderee";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_CENTRES = 2;
export const NIVEAU_AIDE_MAX_SOMMES = 2;
export const NIVEAU_AIDE_MAX_QUOTIENT = 1;

/** Phase de départ — la seule décision de branchement initial de ce moteur, prise uniquement sur
 * `exercice.variante`, jamais recalculée ailleurs. */
function phaseInitiale(exercice: ExerciceMoyennePonderee): PhaseMoyennePonderee {
  return exercice.variante === "classes" ? "centres" : "sommes";
}

export function demarrerSessionMoyennePonderee(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceMoyennePonderee,
): EtatSessionMoyennePonderee {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideCentres: 0,
    niveauAideSommes: 0,
    niveauAideQuotient: 0,
    scoreCentresExercice: null,
    centresRevele: false,
    scoreSommesExercice: null,
    sommesRevele: false,
    scoreQuotientExercice: null,
    quotientRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionMoyennePonderee): ReglagesEtape {
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
export function activerAideSuivante(etat: EtatSessionMoyennePonderee): EtatSessionMoyennePonderee {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "centres") {
    if (etat.niveauAideCentres >= NIVEAU_AIDE_MAX_CENTRES) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideCentres: etat.niveauAideCentres + 1 };
  }
  if (etat.phase === "sommes") {
    if (etat.niveauAideSommes >= NIVEAU_AIDE_MAX_SOMMES) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideSommes: etat.niveauAideSommes + 1 };
  }
  if (etat.niveauAideQuotient >= NIVEAU_AIDE_MAX_QUOTIENT) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideQuotient: etat.niveauAideQuotient + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionMoyennePonderee, resultat: ResultatExerciceMoyennePonderee): EtatSessionMoyennePonderee {
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
    niveauAideCentres: 0,
    niveauAideSommes: 0,
    niveauAideQuotient: 0,
    scoreCentresExercice: null,
    centresRevele: false,
    scoreSommesExercice: null,
    sommesRevele: false,
    scoreQuotientExercice: null,
    quotientRevele: false,
  };
}

export function soumettreReponseCentres(etat: EtatSessionMoyennePonderee, reponse: ReponseCentres): EtatSessionMoyennePonderee {
  if (etat.terminee || etat.phase !== "centres") {
    throw new Error("soumettreReponseCentres : la session n'est pas à l'étape centres");
  }
  const exerciceCourant = etat.exerciceCourant;
  if (exerciceCourant.variante !== "classes") {
    throw new Error("soumettreReponseCentres : l'écran centres n'existe que pour la variante classes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseCentres>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCentres(exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCentres);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "sommes",
    scoreCentresExercice: score,
    centresRevele: etapeCourante.revelee,
  };
}

export function soumettreReponseSommes(etat: EtatSessionMoyennePonderee, reponse: ReponseSommes): EtatSessionMoyennePonderee {
  if (etat.terminee || etat.phase !== "sommes") {
    throw new Error("soumettreReponseSommes : la session n'est pas à l'étape sommes");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseSommes>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSommes(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideSommes);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "quotient",
    scoreSommesExercice: score,
    sommesRevele: etapeCourante.revelee,
  };
}

/** Toujours la phase terminale, pour les 2 variantes — clôture directement l'exercice. */
export function soumettreReponseQuotient(etat: EtatSessionMoyennePonderee, reponse: ReponseQuotient): EtatSessionMoyennePonderee {
  if (etat.terminee || etat.phase !== "quotient") {
    throw new Error("soumettreReponseQuotient : la session n'est pas à l'étape quotient");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseQuotient>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierQuotient(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideQuotient);

  return cloturerExerciceOuSuivant(etat, {
    variante: etat.exerciceCourant.variante,
    scoreCentres: etat.scoreCentresExercice,
    centresRevele: etat.centresRevele,
    niveauAideCentres: etat.niveauAideCentres,
    scoreSommes: etat.scoreSommesExercice as number,
    sommesRevele: etat.sommesRevele,
    niveauAideSommes: etat.niveauAideSommes,
    scoreQuotient: score,
    quotientRevele: etapeCourante.revelee,
    niveauAideQuotient: etat.niveauAideQuotient,
  });
}
