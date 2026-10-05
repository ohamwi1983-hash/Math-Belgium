/**
 * Couche B — moteur de session pour "Intersection entre deux droites". N'importe jamais rien de
 * `src/generateurs/` — voir `sessionIntersectionDroites.test.ts` pour la preuve avec un générateur
 * factice, même principe que les autres moteurs du projet.
 *
 * **2 phases possibles, jamais toujours traversées** : `diagnostic` toujours en premier ; `point`
 * UNIQUEMENT si la conclusion RÉELLE de l'exercice (jamais le choix de l'élève, correct ou révélé)
 * vaut "secantes" — sinon `soumettreReponseDiagnostic` clôture directement l'exercice, exactement
 * le même principe de branchement que "Analyse d'une fonction du second degré"/`irreductible`
 * (jamais un écran affiché "pour rien" quand la vérité géométrique n'en a pas besoin).
 *
 * Aide PROGRESSIVE par écran (2 niveaux chacun), pénalité ADDITIVE (-20 points par niveau atteint)
 * appliquée à la clôture de l'écran concerné — voir `typesIntersectionDroites.ts`.
 */
import type { ConclusionIntersectionDroites, GenerateurExerciceIntersectionDroites } from "../core/intersectionDroites.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierDiagnostic, verifierPoint, type ReponsePoint } from "./verificationIntersectionDroites";
import type { EtatSessionIntersectionDroites, ResultatExerciceIntersectionDroites } from "./typesIntersectionDroites";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_DIAGNOSTIC = 2;
export const NIVEAU_AIDE_MAX_POINT = 2;

export function demarrerSessionIntersectionDroites(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceIntersectionDroites,
): EtatSessionIntersectionDroites {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "diagnostic",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideDiagnostic: 0,
    niveauAidePoint: 0,
    scoreDiagnosticExercice: null,
    diagnosticRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionIntersectionDroites): ReglagesEtape {
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
export function activerAideSuivante(etat: EtatSessionIntersectionDroites): EtatSessionIntersectionDroites {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "diagnostic") {
    if (etat.niveauAideDiagnostic >= NIVEAU_AIDE_MAX_DIAGNOSTIC) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideDiagnostic: etat.niveauAideDiagnostic + 1 };
  }
  if (etat.niveauAidePoint >= NIVEAU_AIDE_MAX_POINT) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAidePoint: etat.niveauAidePoint + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionIntersectionDroites,
  resultat: ResultatExerciceIntersectionDroites,
): EtatSessionIntersectionDroites {
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
    phase: "diagnostic",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideDiagnostic: 0,
    niveauAidePoint: 0,
    scoreDiagnosticExercice: null,
    diagnosticRevele: false,
  };
}

export function soumettreReponseDiagnostic(
  etat: EtatSessionIntersectionDroites,
  reponse: ConclusionIntersectionDroites,
): EtatSessionIntersectionDroites {
  if (etat.terminee || etat.phase !== "diagnostic") {
    throw new Error("soumettreReponseDiagnostic : la session n'est pas à l'étape diagnostic");
  }

  const etapeCourante = soumettreEtapeTentatives<ConclusionIntersectionDroites>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDiagnostic(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDiagnostic);
  const revele = etapeCourante.revelee;

  // Divergence par rapport à "Position d'une droite par rapport à un plan" : ici, seul le cas
  // "secantes" a un second écran — sinon l'exercice se clôt directement.
  if (etat.exerciceCourant.conclusion !== "secantes") {
    return cloturerExerciceOuSuivant(etat, {
      variante: etat.exerciceCourant.variante,
      conclusion: etat.exerciceCourant.conclusion,
      scoreDiagnostic: score,
      diagnosticRevele: revele,
      niveauAideDiagnostic: etat.niveauAideDiagnostic,
      scorePoint: null,
      pointRevele: false,
      niveauAidePoint: 0,
    });
  }

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "point",
    scoreDiagnosticExercice: score,
    diagnosticRevele: revele,
  };
}

/** Dernière phase (uniquement atteinte si `conclusion === "secantes"`), clôture l'exercice. */
export function soumettreReponsePoint(etat: EtatSessionIntersectionDroites, reponse: ReponsePoint): EtatSessionIntersectionDroites {
  if (etat.terminee || etat.phase !== "point") {
    throw new Error("soumettreReponsePoint : la session n'est pas à l'étape point");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponsePoint>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPoint(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAidePoint);

  return cloturerExerciceOuSuivant(etat, {
    variante: etat.exerciceCourant.variante,
    conclusion: etat.exerciceCourant.conclusion,
    scoreDiagnostic: etat.scoreDiagnosticExercice as number,
    diagnosticRevele: etat.diagnosticRevele,
    niveauAideDiagnostic: etat.niveauAideDiagnostic,
    scorePoint: score,
    pointRevele: etapeCourante.revelee,
    niveauAidePoint: etat.niveauAidePoint,
  });
}
