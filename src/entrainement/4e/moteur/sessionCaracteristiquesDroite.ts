/**
 * Couche B — moteur de session pour "Caractéristiques d'une droite". N'importe jamais rien de
 * `src/generateurs/` — voir `sessionCaracteristiquesDroite.test.ts` pour la preuve avec un
 * générateur factice.
 *
 * 2 phases FIXES, toujours dans le même ordre, TOUJOURS TOUTES LES DEUX traversées — même pour une
 * instance verticale (`exercice.verticale`), qui utilise alors des réponses catégorielles
 * "n'existe pas" à l'écran "caracteristiques" plutôt que d'être routée autour de cet écran (jamais
 * un saut conditionnel comme "Équation d'une droite").
 *
 * Aide PROGRESSIVE par écran (même principe que "Relations entre droites"/"Colinéarité"/
 * "Orthogonalité") : 2 niveaux sur chacun des 2 écrans — pénalité ADDITIVE (-20 points/niveau)
 * appliquée au moment précis où l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceCaracteristiquesDroite, GenerateurExerciceCaracteristiquesDroite } from "../core/caracteristiquesDroite.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { EtatSessionCaracteristiquesDroite, ResultatExerciceCaracteristiquesDroite } from "./typesCaracteristiquesDroite";
import type { ReponseCaracteristiques, ReponseExtraction } from "./verificationCaracteristiquesDroite";
import { verifierCaracteristiques, verifierExtraction } from "./verificationCaracteristiquesDroite";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_EXTRACTION = 2;
export const NIVEAU_AIDE_MAX_CARACTERISTIQUES = 2;

function etatInitial(exercice: ExerciceCaracteristiquesDroite): Pick<
  EtatSessionCaracteristiquesDroite,
  "exerciceCourant" | "phase" | "etapeCourante" | "niveauAideExtraction" | "niveauAideCaracteristiques" | "scoreExtractionExercice" | "extractionRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: "extraction",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideExtraction: 0,
    niveauAideCaracteristiques: 0,
    scoreExtractionExercice: null,
    extractionRevele: false,
  };
}

export function demarrerSessionCaracteristiquesDroite(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceCaracteristiquesDroite,
): EtatSessionCaracteristiquesDroite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionCaracteristiquesDroite) {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionCaracteristiquesDroite): EtatSessionCaracteristiquesDroite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "extraction") {
    if (etat.niveauAideExtraction >= NIVEAU_AIDE_MAX_EXTRACTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideExtraction: etat.niveauAideExtraction + 1 };
  }
  if (etat.niveauAideCaracteristiques >= NIVEAU_AIDE_MAX_CARACTERISTIQUES) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideCaracteristiques: etat.niveauAideCaracteristiques + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionCaracteristiquesDroite, resultat: ResultatExerciceCaracteristiquesDroite): EtatSessionCaracteristiquesDroite {
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

/** Écran "extraction" — mène toujours à "caracteristiques". */
export function soumettreReponseExtraction(etat: EtatSessionCaracteristiquesDroite, reponse: ReponseExtraction): EtatSessionCaracteristiquesDroite {
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

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideExtraction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "caracteristiques",
    scoreExtractionExercice: score,
    extractionRevele: etapeCourante.revelee,
  };
}

/** Écran "caracteristiques" (dernière phase) — clôture toujours l'exercice. */
export function soumettreReponseCaracteristiques(etat: EtatSessionCaracteristiquesDroite, reponse: ReponseCaracteristiques): EtatSessionCaracteristiquesDroite {
  if (etat.terminee || etat.phase !== "caracteristiques") {
    throw new Error("soumettreReponseCaracteristiques : la session n'est pas à l'étape caracteristiques");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseCaracteristiques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCaracteristiques(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideCaracteristiques);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    verticale: exercice.verticale,
    caracteristiqueDemandee: exercice.caracteristiqueDemandee,
    scoreExtraction: etat.scoreExtractionExercice as number,
    extractionRevele: etat.extractionRevele,
    niveauAideExtraction: etat.niveauAideExtraction,
    scoreCaracteristiques: score,
    caracteristiquesRevele: etapeCourante.revelee,
    niveauAideCaracteristiques: etat.niveauAideCaracteristiques,
  });
}
