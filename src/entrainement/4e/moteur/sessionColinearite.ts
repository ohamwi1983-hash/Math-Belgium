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
 * composantes de combinaisons linéaires") — 1 ou 2 niveaux selon l'écran (`NIVEAU_AIDE_MAX_XXX`).
 */
import type { ExerciceColinearParametreCarre, ExerciceColinearPoints, ExerciceColinearVecteurs, ExerciceColinearite, GenerateurExerciceColinearite } from "../core/colinearite.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { conclusionAttendue, diagnostiquerCritereTest, verifierConstructionAvecX, verifierConstructionVecteurs, verifierReductionAvecX, verifierResolutionAvecX, verifierValeursCarre } from "./verificationColinearite";
import type { ReponseConstructionAvecX, ReponseConstructionVecteurs, ReponseTest } from "./verificationColinearite";
import type { EtatSessionColinearite, PhaseColinearite, ResultatExerciceColinearite } from "./typesColinearite";

const POINTS_DE_BASE = 100;
// Aides à deux niveaux sur tous les écrans (audit 4e ch. 6, lot B) ; le moteur ne garde que le
// drapeau « aide ouverte » (niveau 1, pour la puce de progression), le niveau 2 est local à l'écran.
export const NIVEAU_AIDE_MAX_TEST = 2;
export const NIVEAU_AIDE_MAX_CONSTRUCTION_VECTEURS = 2;
export const NIVEAU_AIDE_MAX_CONSTRUCTION_AVEC_X = 2;
export const NIVEAU_AIDE_MAX_REDUCTION = 2;
export const NIVEAU_AIDE_MAX_RESOLUTION = 2;
export const NIVEAU_AIDE_MAX_REDUCTION_AVEC_X = 2;
export const NIVEAU_AIDE_MAX_RESOLUTION_AVEC_X = 2;

function estExerciceTest(exercice: ExerciceColinearite): exercice is ExerciceColinearVecteurs | ExerciceColinearPoints {
  return exercice.variante === "vecteurs" || exercice.variante === "points";
}

function phaseInitiale(exercice: ExerciceColinearite): PhaseColinearite {
  if (exercice.variante === "vecteurs") return "test";
  if (exercice.variante === "points") return "constructionVecteurs";
  if (exercice.variante === "parametre" || exercice.variante === "parametreCarre") return "reduction";
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
  | "conclusionTest"
  | "choixValeurs"
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
    conclusionTest: null,
    choixValeurs: null,
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
  };
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
  // Résolutions (V2, V4, « paramètre au carré ») : aides à deux niveaux depuis le lot B.
  if (etat.niveauAideResolution >= NIVEAU_AIDE_MAX_RESOLUTION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideResolution: etat.niveauAideResolution + 1 };
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

  const score = etapeCourante.score as number;

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

  const score = etapeCourante.score as number;

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
  if (etat.terminee || etat.phase !== "reduction" || (etat.exerciceCourant.variante !== "parametre" && etat.exerciceCourant.variante !== "parametreCarre")) {
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

  const score = etapeCourante.score as number;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: exercice.variante === "parametreCarre" ? "resolutionCarre" : "resolution",
    scoreReductionExercice: score,
    reductionRevele: etapeCourante.revelee,
  };
}

function cloturerResolutionCarre(etat: EtatSessionColinearite, score: number, revele: boolean): EtatSessionColinearite {
  return cloturerExerciceOuSuivant(etat, {
    variante: "parametreCarre",
    scoreConstruction: null,
    constructionRevele: false,
    niveauAideConstruction: 0,
    scoreReduction: etat.scoreReductionExercice,
    reductionRevele: etat.reductionRevele,
    niveauAideReduction: etat.niveauAideReduction,
    scoreResolution: score,
    resolutionRevele: revele,
    niveauAideResolution: etat.niveauAideResolution,
    scoreTest: null,
    testRevele: false,
    niveauAideTest: 0,
  });
}

/** « Paramètre au carré », écran « résolution », partie 1 : le choix « aucune valeur / au moins
 * une » est jugé UNE fois (choix fermé, audit 4e ch. 6, G3). Aucune solution : l'écran se clôt
 * (réussi ou révélé). Des solutions : le choix est figé (révélé s'il était faux) et les valeurs se
 * saisissent ensuite avec les tentatives habituelles. */
export function soumettreChoixResolutionCarre(etat: EtatSessionColinearite, aucune: boolean): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "resolutionCarre" || etat.exerciceCourant.variante !== "parametreCarre" || etat.choixValeurs !== null) {
    throw new Error("soumettreChoixResolutionCarre : la session n'est pas au choix de l'écran resolutionCarre");
  }
  const exercice: ExerciceColinearParametreCarre = etat.exerciceCourant;
  const correct = aucune === (exercice.solutions.length === 0);
  if (exercice.solutions.length === 0) return cloturerResolutionCarre(etat, correct ? POINTS_DE_BASE : 0, !correct);
  return { ...etat, choixValeurs: { choisi: aucune, correct } };
}

/** Partie 2 : les valeurs de x (tentatives du réglage). Écran révélé si le choix était faux. */
export function soumettreReponseResolutionCarre(etat: EtatSessionColinearite, valeurs: number[]): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "resolutionCarre" || etat.exerciceCourant.variante !== "parametreCarre" || etat.choixValeurs === null) {
    throw new Error("soumettreReponseResolutionCarre : la session n'est pas aux valeurs de l'écran resolutionCarre");
  }
  const exercice: ExerciceColinearParametreCarre = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives<number[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierValeursCarre(exercice, v),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  return cloturerResolutionCarre(etat, etapeCourante.score as number, etapeCourante.revelee || !etat.choixValeurs.correct);
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

  const score = etapeCourante.score as number;

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

  const score = etapeCourante.score as number;

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

  const score = etapeCourante.score as number;

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

/** Écran "test" (V1 seul écran, V3-écran2, dernière phase) — clôture toujours l'exercice.
 * Choix fermé + champ sur le même écran (audit 4e ch. 6, lot B, G3) : la conclusion (colinéaires ?
 * alignés ?) est jugée à la PREMIÈRE validation, puis figée (révélée si elle était fausse) ; seul le
 * critère garde ses tentatives. Écran révélé si la conclusion était fausse. */
export function soumettreReponseTest(etat: EtatSessionColinearite, reponse: ReponseTest): EtatSessionColinearite {
  if (etat.terminee || etat.phase !== "test" || !estExerciceTest(etat.exerciceCourant)) {
    throw new Error("soumettreReponseTest : la session n'est pas à l'étape test");
  }
  const exercice = etat.exerciceCourant;
  const attendue = conclusionAttendue(exercice);
  const conclusionTest =
    etat.conclusionTest ??
    {
      choisi: { colinearite: reponse.conclusionColinearite, alignement: reponse.conclusionAlignement },
      correct: reponse.conclusionColinearite === attendue && (exercice.variante !== "points" || reponse.conclusionAlignement === attendue),
    };

  const etapeCourante = soumettreEtapeTentatives<ReponseTest>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerCritereTest(exercice, r.critere) === "correct",
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante, conclusionTest };
  }

  const score = etapeCourante.score as number;

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
    scoreTest: conclusionTest.correct ? score : 0,
    testRevele: etapeCourante.revelee || !conclusionTest.correct,
    niveauAideTest: etat.niveauAideTest,
  });
}
