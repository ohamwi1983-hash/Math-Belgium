/**
 * Couche B — moteur de session pour "Ombre au soleil" (41e générateur, chapitre "Géométrie dans
 * l'espace"). N'importe jamais rien de `src/generateurs/`.
 *
 * Aide progressive (2 niveaux par écran noté, aucune sur "conclusion"), remise à 0 à chaque écran.
 */
import type { ExerciceOmbreSoleil, GenerateurExerciceOmbreSoleil } from "../core/ombreSoleil.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { EtatEtapeTentatives, ReglagesEtape } from "./etapeTentatives";
import { verifierDirection, verifierPoint } from "./verificationOmbreSoleil";
import type { EtatSessionOmbreSoleil, PhaseOmbreSoleil, ResultatExerciceOmbreSoleil } from "./typesOmbreSoleil";

const POINTS_DE_BASE = 100;
export const NIVEAU_AIDE_MAX_POINT_SIMPLE = 2;
export const NIVEAU_AIDE_MAX_DIRECTION_INCONNUE = 2;
export const NIVEAU_AIDE_MAX_LOOP = 2;

function phaseInitiale(exercice: ExerciceOmbreSoleil): PhaseOmbreSoleil {
  if (exercice.variante === "simple") return "pointSimple";
  if (exercice.variante === "directionInconnue") return "directionInconnue";
  return "direction";
}

/** Séquence COMPLÈTE des écrans notés d'un exercice, connue dès sa génération — l'écran courant est
 * toujours `etat.scoresAccumules.length` (une même phase "point" peut apparaître plusieurs fois). */
export function sequencePourExercice(exercice: ExerciceOmbreSoleil): PhaseOmbreSoleil[] {
  if (exercice.variante === "simple") return ["pointSimple"];
  if (exercice.variante === "obstacle") return ["direction", "point"];
  return ["directionInconnue", ...exercice.piquets.map(() => "point" as const)];
}

export function demarrerSessionOmbreSoleil(reglages: ReglagesSession, generateur: GenerateurExerciceOmbreSoleil): EtatSessionOmbreSoleil {
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
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function niveauAideMaxPhase(phase: PhaseOmbreSoleil): number {
  if (phase === "conclusion") return 0;
  if (phase === "pointSimple") return NIVEAU_AIDE_MAX_POINT_SIMPLE;
  if (phase === "directionInconnue") return NIVEAU_AIDE_MAX_DIRECTION_INCONNUE;
  return NIVEAU_AIDE_MAX_LOOP;
}

/** Révèle le niveau d'aide suivant de l'écran courant. */
export function activerAideSuivante(etat: EtatSessionOmbreSoleil): EtatSessionOmbreSoleil {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.phase === "conclusion") throw new Error("activerAideSuivante : aucune aide sur l'écran de conclusion");
  if (etat.niveauAide >= niveauAideMaxPhase(etat.phase)) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionOmbreSoleil, resultat: ResultatExerciceOmbreSoleil): EtatSessionOmbreSoleil {
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

/** Soumission commune : tant que l'écran n'est pas clos, seule l'étape change ; à sa clôture, on
 * accumule score/révélation/aide et on passe à `phaseSuivante`. */
function soumettre(
  etat: EtatSessionOmbreSoleil,
  id: string,
  verifier: (id: string) => boolean,
  phaseSuivante: (etat: EtatSessionOmbreSoleil) => { phase: PhaseOmbreSoleil; resolus?: number[] },
): EtatSessionOmbreSoleil {
  const etapeCourante: EtatEtapeTentatives = soumettreEtapeTentatives<string>(etat.etapeCourante, id, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const suite = phaseSuivante(etat);
  return {
    ...etat,
    phase: suite.phase,
    resolus: suite.resolus ?? etat.resolus,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: [...etat.scoresAccumules, etapeCourante.score as number],
    revelesAccumules: [...etat.revelesAccumules, etapeCourante.revelee],
    niveauxAideAccumules: [...etat.niveauxAideAccumules, etat.niveauAide],
  };
}

/** Écran unique de la variante "simple" : choisir le point d'ombre du bâton. */
export function soumettreReponsePointSimple(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  const exercice = etat.exerciceCourant;
  if (etat.terminee || etat.phase !== "pointSimple" || exercice.variante !== "simple") {
    throw new Error("soumettreReponsePointSimple : la session n'est pas à l'étape pointSimple");
  }
  return soumettre(etat, id, (r) => verifierPoint(exercice.piquet.pointsCandidats, exercice.piquet.ombre, r), () => ({ phase: "conclusion" }));
}

/** Variante "directionInconnue", étape 0 : déduire la direction depuis la paire sommet/ombre connue. */
export function soumettreReponseDirectionInconnue(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  const exercice = etat.exerciceCourant;
  if (etat.terminee || etat.phase !== "directionInconnue" || exercice.variante !== "directionInconnue") {
    throw new Error("soumettreReponseDirectionInconnue : la session n'est pas à l'étape directionInconnue");
  }
  return soumettre(etat, id, (r) => verifierDirection(exercice, r), () => ({ phase: exercice.piquets.length > 0 ? "point" : "conclusion" }));
}

/** Variante "obstacle", écran 1 : choisir le rayon parallèle à celui de l'exemple. */
export function soumettreReponseDirection(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  const exercice = etat.exerciceCourant;
  if (etat.terminee || etat.phase !== "direction" || exercice.variante !== "obstacle") {
    throw new Error("soumettreReponseDirection : la session n'est pas à l'étape direction");
  }
  return soumettre(etat, id, (r) => verifierDirection(exercice, r), () => ({ phase: "point" }));
}

/** Écran "point" : premier impact réel (variante obstacle), ou ombre du sommet courant (variante
 * directionInconnue, un écran par sommet). */
export function soumettreReponsePoint(etat: EtatSessionOmbreSoleil, id: string): EtatSessionOmbreSoleil {
  const exercice = etat.exerciceCourant;
  if (etat.terminee || etat.phase !== "point" || exercice.variante === "simple") {
    throw new Error("soumettreReponsePoint : la session n'est pas à l'étape point");
  }
  if (exercice.variante === "obstacle") {
    return soumettre(etat, id, (r) => verifierPoint(exercice.pointsCandidats, exercice.ombre, r), () => ({ phase: "conclusion" }));
  }
  const index = etat.resolus.length;
  const piquet = exercice.piquets[index];
  return soumettre(
    etat,
    id,
    (r) => verifierPoint(piquet.pointsCandidats, piquet.ombre, r),
    () => {
      const resolus = [...etat.resolus, index];
      return { phase: resolus.length >= exercice.piquets.length ? "conclusion" : "point", resolus };
    },
  );
}

/** Écran de conclusion : aucune vérification, clôture l'exercice. */
export function soumettreConclusion(etat: EtatSessionOmbreSoleil): EtatSessionOmbreSoleil {
  if (etat.terminee || etat.phase !== "conclusion") {
    throw new Error("soumettreConclusion : la session n'est pas à l'étape conclusion");
  }
  const scores = etat.scoresAccumules;
  const scoreMoyen = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  return cloturerExerciceOuSuivant(etat, { scores, scoreMoyen, revelees: etat.revelesAccumules, niveauxAide: etat.niveauxAideAccumules });
}
