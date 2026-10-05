/**
 * Couche B — moteur de session pour "Colinéarité et alignement de points" (chapitre "Calcul
 * vectoriel"), réécriture complète (`promptcreationgenerateur24colinearitealignement.md`).
 * N'importe jamais rien de src/generateurs — voir sessionColinearite.test.ts pour la preuve avec
 * des générateurs factices.
 *
 * Séquence de phases dépendante de la VARIANTE (voir `typesColinearite.ts`) — `phaseInitiale`
 * décide où démarrer, chaque `soumettreReponseXxx` connaît sa propre phase suivante UNIQUE (jamais
 * un second dispatch sur la variante à ce niveau : la phase "reduction" mène toujours à
 * "resolution", quelle que soit la variante qui l'a atteinte). Les phases "test"/"resolution" sont
 * TOUJOURS les dernières, quelle que soit la variante — c'est là que l'exercice se clôt.
 *
 * **Aide PROGRESSIVE par écran** (même principe exact que "Triangle quelconque"/"Calcul de
 * composantes de combinaisons linéaires") — 1 ou 2 niveaux selon l'écran (`NIVEAU_AIDE_MAX_XXX`),
 * pénalité ADDITIVE (-20 points/niveau) appliquée au moment précis où l'écran se clôt, jamais
 * rétroactivement.
 */
import type { ExerciceColinearPoints, ExerciceColinearVecteurs, ExerciceColinearite, GenerateurExerciceColinearite } from "../core/colinearite.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierConstructionAvecX, verifierConstructionVecteurs, verifierReductionAvecX, verifierResolutionAvecX, verifierTest } from "./verificationColinearite";
import type { ReponseConstructionAvecX, ReponseConstructionVecteurs, ReponseTest } from "./verificationColinearite";
import type { EtatSessionColinearite, PhaseColinearite, ResultatExerciceColinearite } from "./typesColinearite";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_TEST = 2;
export const NIVEAU_AIDE_MAX_CONSTRUCTION_VECTEURS = 1;
export const NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X = 1;
/** `promptcorrectionsgenerateur24lot3.md`, point 2 — "reduction" (V2) est désormais alignée sur
 * "reductionAvecX" (V4) : 2 niveaux (formule vectorielle générique + substituée). "resolution" (V2)
 * est de même alignée sur "resolutionAvecX" (V4) : AUCUNE aide (`max=0` — retire l'aide générique de
 * résolution, sans valeur ajoutée pour un simple champ `x=`, même convention que le générateur 26
 * "Norme d'un vecteur et distance entre 2 points" : un écran à `max=0` n'affiche aucun bouton "Aide"
 * côté composant, jamais un bouton perpétuellement désactivé). */
export const NIVEAU_AIDE_MAX_REDUCTION = 2;
export const NIVEAU_AIDE_MAX_RESOLUTION = 0;
export const NIVEAU_AIDE_MAX_REDUCTION_AVEC_X = 2;
export const NIVEAU_AIDE_MAX_RESOLUTION_AVEC_X = 0;

function estExerciceTest(exercice: ExerciceColinearite): exercice is ExerciceColinearVecteurs | ExerciceColinearPoints {
  return exercice.variante === "vecteurs" || exercice.variante === "points";
}

function phaseInitiale(exercice: ExerciceColinearite): PhaseColinearite {
  if (exercice.variante === "vecteurs") return "test";
  if (exercice.variante === "points") return "constructionVecteurs";
  if (exercice.variante === "parametre") return "reduction";
  return "constructionAvecX"; // pointsParametre → constructionAvecX → reductionAvecX → resolutionAvecX
}

function etatInitial(exercice: ExerciceColinearite): Pick<
  EtatSessionColinearite,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideConstruction"
  | "niveauAideReduction"
  | "niveauAideResolution"
  | "niveauAideTest"
  | "scoreConstructionExercice"
  | "constructionRevele"
  | "scoreReductionExercice"
  | "reductionRevele"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideConstruction: 0,
    niveauAideReduction: 0,
    niveauAideResolution: 0,
    niveauAideTest: 0,
    scoreConstructionExercice: null,
    constructionRevele: false,
    scoreReductionExercice: null,
    reductionRevele: false,
  };
}

export function demarrerSessionColinearite(reglages: ReglagesSession, generateur: GenerateurExerciceColinearite): EtatSessionColinearite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionColinearite): ReglagesEtape {
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
export function activerAideSuivante(etat: EtatSessionColinearite): EtatSessionColinearite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "test") {
    if (etat.niveauAideTest >= NIVEAU_AIDE_MAX_TEST) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideTest: etat.niveauAideTest + 1 };
  }
  if (etat.phase === "constructionVecteurs") {
    if (etat.niveauAideConstruction >= NIVEAU_AIDE_MAX_CONSTRUCTION_VECTEURS)
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideConstruction: etat.niveauAideConstruction + 1 };
  }
  if (etat.phase === "constructionAvecX") {
    if (etat.niveauAideConstruction >= NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X)
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideConstruction: etat.niveauAideConstruction + 1 };
  }
  if (etat.phase === "reduction") {
    if (etat.niveauAideReduction >= NIVEAU_AIDE_MAX_REDUCTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideReduction: etat.niveauAideReduction + 1 };
  }
  if (etat.phase === "reductionAvecX") {
    if (etat.niveauAideReduction >= NIVEAU_AIDE_MAX_REDUCTION_AVEC_X) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideReduction: etat.niveauAideReduction + 1 };
  }
  // "resolution" (V2) et "resolutionAvecX" (V4) n'ont plus aucune aide (`NIVEAU_AIDE_MAX_RESOLUTION`
  // = `NIVEAU_AIDE_MAX_RESOLUTION_AVEC_X` = 0 depuis `promptcorrectionsgenerateur24lot3.md`, point 2).
  throw new Error("activerAideSuivante : aucune aide sur cet écran");
}

function cloturerExerciceOuSuivant(etat: EtatSessionColinearite, resultat: ResultatExerciceColinearite): EtatSessionColinearite {
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

/** Écran "constructionVecteurs" (V3-écran1, variante "points") — mène toujours à "test". */
export function soumettreReponseConstructionVecteurs(etat: EtatSessionColinearite, reponse: ReponseConstructionVecteurs): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "constructionVecteurs" || etat.exerciceCourant.variante !== "points") {
    throw new Error("soumettreReponseConstructionVecteurs : la session n'est pas à l'étape constructionVecteurs");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseConstructionVecteurs>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstructionVecteurs(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideConstruction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "test",
    scoreConstructionExercice: score,
    constructionRevele: etapeCourante.revelee,
  };
}

/** Écran "constructionAvecX" (V4-écran1, variante "pointsParametre") — mène toujours à
 * "reductionAvecX" (jamais "reduction", V2 SEULE depuis `promptcorrectionsgenerateur24complet.md`). */
export function soumettreReponseConstructionAvecX(etat: EtatSessionColinearite, reponse: ReponseConstructionAvecX): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "constructionAvecX" || etat.exerciceCourant.variante !== "pointsParametre") {
    throw new Error("soumettreReponseConstructionAvecX : la session n'est pas à l'étape constructionAvecX");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseConstructionAvecX>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierConstructionAvecX(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideConstruction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "reductionAvecX",
    scoreConstructionExercice: score,
    constructionRevele: etapeCourante.revelee,
  };
}

/** Écran "reduction" (V2 SEULE, "parametre") — mène toujours à "resolution". Jamais atteint par
 * "pointsParametre" depuis la correction, voir "reductionAvecX" plus bas. Depuis
 * `promptcorrectionsgenerateur24lot3.md`, point 2 : un seul champ de saisie libre pour l'équation
 * réduite complète, exactement le même contrat que "reductionAvecX" (`verifierReductionAvecX`,
 * réutilisée telle quelle — cette variante garantit désormais elle aussi `typeSolution="unique"`,
 * voir `generateurs/colinearite/index.ts`). */
export function soumettreReponseReduction(etat: EtatSessionColinearite, texte: string): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "reduction" || etat.exerciceCourant.variante !== "parametre") {
    throw new Error("soumettreReponseReduction : la session n'est pas à l'étape reduction");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReductionAvecX(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideReduction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resolution",
    scoreReductionExercice: score,
    reductionRevele: etapeCourante.revelee,
  };
}

/** Écran "resolution" (V2 SEULE, "parametre", dernière phase) — clôture toujours l'exercice. Depuis
 * `promptcorrectionsgenerateur24lot3.md`, point 2 : un simple champ numérique `x=`, exactement le
 * même contrat que "resolutionAvecX" (`verifierResolutionAvecX`, réutilisée telle quelle) — plus
 * aucun cas dégénéré (identité/contradiction) à gérer pour cette variante. */
export function soumettreReponseResolution(etat: EtatSessionColinearite, valeur: number): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "resolution" || etat.exerciceCourant.variante !== "parametre") {
    throw new Error("soumettreReponseResolution : la session n'est pas à l'étape resolution");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierResolutionAvecX(exercice, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideResolution);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreConstruction: etat.scoreConstructionExercice,
    constructionRevele: etat.constructionRevele,
    niveauAideConstruction: etat.niveauAideConstruction,
    scoreReduction: etat.scoreReductionExercice,
    reductionRevele: etat.reductionRevele,
    niveauAideReduction: etat.niveauAideReduction,
    scoreResolution: score,
    resolutionRevele: etapeCourante.revelee,
    niveauAideResolution: etat.niveauAideResolution,
    scoreTest: null,
    testRevele: false,
    niveauAideTest: 0,
  });
}

/** Écran "reductionAvecX" (V4 SEULE, "pointsParametre") — mène toujours à "resolutionAvecX".
 * `promptcorrectionsgenerateur24complet.md`, point 7 : équation réduite complète, vérifiée
 * symboliquement (`verifierReductionAvecX`, réutilise `diagnostiquerFormeCanonique`). */
export function soumettreReponseReductionAvecX(etat: EtatSessionColinearite, texte: string): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "reductionAvecX" || etat.exerciceCourant.variante !== "pointsParametre") {
    throw new Error("soumettreReponseReductionAvecX : la session n'est pas à l'étape reductionAvecX");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReductionAvecX(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideReduction);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "resolutionAvecX",
    scoreReductionExercice: score,
    reductionRevele: etapeCourante.revelee,
  };
}

/** Écran "resolutionAvecX" (V4 SEULE, "pointsParametre", dernière phase) — clôture toujours
 * l'exercice. Cette variante garantit toujours exactement une solution (voir
 * `generateurs/colinearite/index.ts`), un simple champ numérique suffit. */
export function soumettreReponseResolutionAvecX(etat: EtatSessionColinearite, valeur: number): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "resolutionAvecX" || etat.exerciceCourant.variante !== "pointsParametre") {
    throw new Error("soumettreReponseResolutionAvecX : la session n'est pas à l'étape resolutionAvecX");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierResolutionAvecX(exercice, v),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideResolution);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreConstruction: etat.scoreConstructionExercice,
    constructionRevele: etat.constructionRevele,
    niveauAideConstruction: etat.niveauAideConstruction,
    scoreReduction: etat.scoreReductionExercice,
    reductionRevele: etat.reductionRevele,
    niveauAideReduction: etat.niveauAideReduction,
    scoreResolution: score,
    resolutionRevele: etapeCourante.revelee,
    niveauAideResolution: etat.niveauAideResolution,
    scoreTest: null,
    testRevele: false,
    niveauAideTest: 0,
  });
}

/** Écran "test" (V1 seul écran, V3-écran2, dernière phase) — clôture toujours l'exercice. */
export function soumettreReponseTest(etat: EtatSessionColinearite, reponse: ReponseTest): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "test" || !estExerciceTest(etat.exerciceCourant)) {
    throw new Error("soumettreReponseTest : la session n'est pas à l'étape test");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseTest>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierTest(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideTest);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreConstruction: etat.scoreConstructionExercice,
    constructionRevele: etat.constructionRevele,
    niveauAideConstruction: etat.niveauAideConstruction,
    scoreReduction: null,
    reductionRevele: false,
    niveauAideReduction: 0,
    scoreResolution: null,
    resolutionRevele: false,
    niveauAideResolution: 0,
    scoreTest: score,
    testRevele: etapeCourante.revelee,
    niveauAideTest: etat.niveauAideTest,
  });
}
