/**
 * Couche B — moteur de session pour "Ombre au soleil" (41e générateur, chapitre "Géométrie dans
 * l'espace"). N'importe jamais rien de `src/generateurs/` — voir `sessionOmbreSoleil.test.ts` pour
 * la preuve avec un générateur factice, même principe que les 40 autres moteurs du projet.
 *
 * Aide PROGRESSIVE (2 niveaux max sur "pointSimple", 2 niveaux max sur "directionInconnue", 2
 * niveaux max PARTAGÉS sur le flux "direction"→"point" d'un même piquet, aucune aide sur
 * "conclusion"), pénalité ADDITIVE (-20 points par niveau atteint) appliquée à la clôture de
 * l'étape concernée — même mécanique que le reste du projet.
 */
import type { ExerciceOmbreSoleil, GenerateurExerciceOmbreSoleil, PiquetAResoudre } from "../core/ombreSoleil.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { sommetPiquet, verifierDirection, verifierPointObstacle, verifierPointOmbre } from "./verificationOmbreSoleil";
import type { EtatSessionOmbreSoleil, PhaseOmbreSoleil, ResultatExerciceOmbreSoleil } from "./typesOmbreSoleil";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_POINT_SIMPLE = 2;
export const NIVEAU_AIDE_MAX_DIRECTION_INCONNUE = 2;
export const NIVEAU_AIDE_MAX_LOOP = 2;

function phaseInitiale(exercice: ExerciceOmbreSoleil): PhaseOmbreSoleil {
  if (exercice.variante === "simple") return "pointSimple";
  if (exercice.variante === "directionInconnue") return "directionInconnue";
  return "direction";
}

export function demarrerSessionOmbreSoleil(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceOmbreSoleil,
): EtatSessionOmbreSoleil {
  const exerciceCourant = generateur();
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant,
    phase: phaseInitiale(exerciceCourant),
    resolus: [],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: [],
    revelesAccumules: [],
    niveauxAideAccumules: [],
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionOmbreSoleil): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'unité pédagogique courante — lève si la session est
 * terminée, si l'écran courant est "conclusion" (aucune aide, jamais de bouton), ou si le niveau
 * maximal de l'écran courant est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionOmbreSoleil): EtatSessionOmbreSoleil {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "conclusion") {
    throw new Error("activerAideSuivante : aucune aide sur l'écran de conclusion");
  }
  const max =
    etat.phase === "pointSimple"
      ? NIVEAU_AIDE_MAX_POINT_SIMPLE
      : etat.phase === "directionInconnue"
        ? NIVEAU_AIDE_MAX_DIRECTION_INCONNUE
        : NIVEAU_AIDE_MAX_LOOP;
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionOmbreSoleil,
  resultat: ResultatExerciceOmbreSoleil,
): EtatSessionOmbreSoleil {
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
    resolus: [],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: [],
    revelesAccumules: [],
    niveauxAideAccumules: [],
  };
}

/** Piquets à résoudre de l'exercice courant — variante "directionInconnue" UNIQUEMENT (`simple` et
 * `obstacle` n'ont pas de tableau `piquets`, `obstacle` a `obstacles` à la place). */
function piquetsDeExercice(exercice: ExerciceOmbreSoleil): PiquetAResoudre[] {
  if (exercice.variante !== "directionInconnue") {
    throw new Error("piquetsDeExercice : seule la variante 'directionInconnue' a un tableau piquets");
  }
  return exercice.piquets;
}

/** Écran unique de la variante "simple" : sélectionne directement le point d'ombre du piquet, sans
 * passer par une étape "direction" séparée (spec, variante A — un seul écran). Clôture toujours
 * directement l'exercice. */
export function soumettreReponsePointSimple(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  if (etat.terminee || etat.phase !== "pointSimple" || etat.exerciceCourant.variante !== "simple") {
    throw new Error("soumettreReponsePointSimple : la session n'est pas à l'étape pointSimple");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, id, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierPointOmbre(exercice, exercice.piquet, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  return { ...etat, phase: "conclusion", etapeCourante: demarrerEtapeTentatives(), scoresAccumules, revelesAccumules, niveauxAideAccumules };
}

/** Étape 0 de la variante "directionInconnue" : déduire la direction cachée depuis l'unique paire
 * piquet connu/ombre connue. Transitionne vers "direction" (s'il reste des piquets à résoudre) ou
 * directement "conclusion" (cas limite, jamais atteint en pratique — `piquets` a toujours au moins
 * 1 élément pour cette variante, gardé par symétrie avec le reste de la boucle). */
export function soumettreReponseDirectionInconnue(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  if (etat.terminee || etat.phase !== "directionInconnue" || etat.exerciceCourant.variante !== "directionInconnue") {
    throw new Error("soumettreReponseDirectionInconnue : la session n'est pas à l'étape directionInconnue");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, id, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDirection(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  const phase: PhaseOmbreSoleil = exercice.piquets.length > 0 ? "direction" : "conclusion";

  return { ...etat, phase, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresAccumules, revelesAccumules, niveauxAideAccumules };
}

/** Boucle piquet par piquet (variantes "obstacle" et "directionInconnue", une fois la direction
 * connue) — étape 1 : sélectionner la bonne direction parmi les 4 candidats. Le niveau d'aide n'est
 * PAS réinitialisé en sortie (même unité pédagogique que l'étape "point" qui suit, même principe que
 * "Section plane d'un solide"). */
export function soumettreReponseDirection(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  if (etat.terminee || etat.phase !== "direction") {
    throw new Error("soumettreReponseDirection : la session n'est pas à l'étape direction");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, id, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDirection(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];

  return {
    ...etat,
    phase: "point",
    etapeCourante: demarrerEtapeTentatives(),
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
    // niveauAide volontairement PAS réinitialisé ici — même unité pédagogique que l'étape suivante.
  };
}

/** Boucle, étape 2 (dernière étape de l'item courant) : sélectionner le point d'ombre réel — la
 * projection du BÂTON sur ce solide-obstacle précis (variante `obstacle`) ou du piquet courant du
 * gabarit (variante `directionInconnue`). L'item courant est toujours `resolus.length` (le premier
 * non résolu dans l'ordre du tableau) — une fois validé, il rejoint `resolus` et le niveau d'aide
 * repart à 0 pour l'item suivant.
 *
 * **Seule fonction de ce moteur qui dispatch sur la variante** (`direction` n'en a jamais besoin,
 * sa transition `→ "point"` étant identique dans les deux cas) — pour la variante `obstacle`, la
 * phase suivante reste `"point"` (l'obstacle suivant, jamais de nouvelle étape "direction" — la
 * direction n'est confirmée qu'une seule fois pour toute la scène) ; pour `directionInconnue`, elle
 * redevient `"direction"` (comportement historique inchangé, un couple direction/point par piquet). */
export function soumettreReponsePoint(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  if (etat.terminee || etat.phase !== "point") {
    throw new Error("soumettreReponsePoint : la session n'est pas à l'étape point");
  }
  const exercice = etat.exerciceCourant;
  const indexItem = etat.resolus.length;

  let verifier: (r: string) => boolean;
  let nombreItems: number;
  let phaseSuivanteSiIncomplet: PhaseOmbreSoleil;

  if (exercice.variante === "obstacle") {
    const origine = sommetPiquet(exercice.baton);
    const obstacleResoudre = exercice.obstacles[indexItem];
    verifier = (r) => verifierPointObstacle(exercice, origine, obstacleResoudre, r);
    nombreItems = exercice.obstacles.length;
    phaseSuivanteSiIncomplet = "point";
  } else {
    const piquetResoudre = piquetsDeExercice(exercice)[indexItem];
    verifier = (r) => verifierPointOmbre(exercice, piquetResoudre, r);
    nombreItems = piquetsDeExercice(exercice).length;
    phaseSuivanteSiIncomplet = "direction";
  }

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, id, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules = [...etat.scoresAccumules, score];
  const revelesAccumules = [...etat.revelesAccumules, etapeCourante.revelee];
  const niveauxAideAccumules = [...etat.niveauxAideAccumules, etat.niveauAide];
  const resolus = [...etat.resolus, indexItem];
  const phase: PhaseOmbreSoleil = resolus.length >= nombreItems ? "conclusion" : phaseSuivanteSiIncomplet;

  return {
    ...etat,
    phase,
    resolus,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules,
    revelesAccumules,
    niveauxAideAccumules,
  };
}

/** Écran de conclusion, dernière étape : aucune interaction/vérification — clôture toujours
 * l'exercice, agrège la moyenne des scores déjà accumulés. */
export function soumettreConclusion(etat: EtatSessionOmbreSoleil): EtatSessionOmbreSoleil {
  if (etat.terminee || etat.phase !== "conclusion") {
    throw new Error("soumettreConclusion : la session n'est pas à l'étape conclusion");
  }
  const scores = etat.scoresAccumules;
  const scoreMoyen = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  return cloturerExerciceOuSuivant(etat, {
    scores,
    scoreMoyen,
    revelees: etat.revelesAccumules,
    niveauxAide: etat.niveauxAideAccumules,
  });
}
