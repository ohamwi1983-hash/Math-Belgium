/**
 * Couche B — moteur de session pour "Distance point-droite et droite-droite (méthode de synthèse,
 * sans formule)". N'importe jamais rien de `src/generateurs/` — voir
 * `sessionDistanceDroite.test.ts` pour la preuve avec un générateur factice.
 *
 * 4 phases possibles : `[choixPoint] → equationB → intersectionQ → distancePQ` — "choixPoint" n'a
 * lieu que pour la variante "paralleles" (le point est déjà donné dans l'énoncé pour "point") ;
 * "distancePQ" est toujours la phase terminale.
 *
 * Aide PROGRESSIVE par écran (même principe que "Colinéarité"/"Orthogonalité"/"Relations entre
 * droites") : 1 seul niveau sur "choixPoint", 2 niveaux sur les 3 autres écrans — pénalité ADDITIVE
 * (-20 points/niveau) appliquée au moment précis où l'écran se clôt, jamais rétroactivement.
 */
import type { ExerciceDistanceDroite, ExerciceDistanceParalleles } from "../core/distanceDroite.types";
import type { GenerateurExerciceDistanceDroite } from "../core/distanceDroite.types";
import type { ReglagesSession } from "../core/session.types";
import type { Point } from "../core/vecteur.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import type { EtatSessionDistanceDroite, ResultatExerciceDistanceDroite } from "./typesDistanceDroite";
import { impliciteDepuisPointVecteurDroite, intersectionDeuxDroitesImplicites, pointEntierAleatoireImpliciteDroite } from "./verificationDroite";
import {
  droiteCibleDeExercice,
  droiteSourceDeExercice,
  verifierChoixPoint,
  verifierDistance,
  verifierEquationB,
  verifierIntersection,
} from "./verificationDistanceDroite";
import type { ReponseIntersection } from "./verificationDistanceDroite";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_CHOIX_POINT = 1;
export const NIVEAU_AIDE_MAX_EQUATION_B = 2;
export const NIVEAU_AIDE_MAX_INTERSECTION_Q = 2;
export const NIVEAU_AIDE_MAX_DISTANCE_PQ = 2;

type ChampsInitiaux = Pick<
  EtatSessionDistanceDroite,
  | "exerciceCourant"
  | "phase"
  | "etapeCourante"
  | "niveauAideChoixPoint"
  | "niveauAideEquationB"
  | "niveauAideIntersectionQ"
  | "niveauAideDistancePQ"
  | "scoreChoixPointExercice"
  | "choixPointRevele"
  | "scoreEquationBExercice"
  | "equationBRevele"
  | "scoreIntersectionQExercice"
  | "intersectionQRevele"
  | "point"
  | "droiteCible"
  | "bAttendue"
  | "qAttendu"
>;

function etatInitial(exercice: ExerciceDistanceDroite): ChampsInitiaux {
  const base = {
    exerciceCourant: exercice,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideChoixPoint: 0,
    niveauAideEquationB: 0,
    niveauAideIntersectionQ: 0,
    niveauAideDistancePQ: 0,
    scoreChoixPointExercice: null,
    choixPointRevele: false,
    scoreEquationBExercice: null,
    equationBRevele: false,
    scoreIntersectionQExercice: null,
    intersectionQRevele: false,
  } as const;

  if (exercice.variante === "point") {
    return {
      ...base,
      phase: "equationB",
      point: exercice.point,
      droiteCible: exercice.d,
      bAttendue: exercice.bAttendue,
      qAttendu: exercice.q,
    };
  }

  return {
    ...base,
    phase: "choixPoint",
    point: null,
    // `droiteCible` (l'AUTRE droite du couple, jamais celle désignée pour le choix du point) est
    // déjà connue statiquement — c'est uniquement `point`/`bAttendue`/`qAttendu` qui dépendent du
    // choix de l'élève à l'écran 0.
    droiteCible: droiteCibleDeExercice(exercice),
    bAttendue: null,
    qAttendu: null,
  };
}

export function demarrerSessionDistanceDroite(reglages: ReglagesSession, generateur: GenerateurExerciceDistanceDroite): EtatSessionDistanceDroite {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionDistanceDroite): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

export function activerAideSuivante(etat: EtatSessionDistanceDroite): EtatSessionDistanceDroite {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "choixPoint") {
    if (etat.niveauAideChoixPoint >= NIVEAU_AIDE_MAX_CHOIX_POINT) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideChoixPoint: etat.niveauAideChoixPoint + 1 };
  }
  if (etat.phase === "equationB") {
    if (etat.niveauAideEquationB >= NIVEAU_AIDE_MAX_EQUATION_B) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideEquationB: etat.niveauAideEquationB + 1 };
  }
  if (etat.phase === "intersectionQ") {
    if (etat.niveauAideIntersectionQ >= NIVEAU_AIDE_MAX_INTERSECTION_Q) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    return { ...etat, niveauAideIntersectionQ: etat.niveauAideIntersectionQ + 1 };
  }
  if (etat.niveauAideDistancePQ >= NIVEAU_AIDE_MAX_DISTANCE_PQ) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAideDistancePQ: etat.niveauAideDistancePQ + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDistanceDroite, resultat: ResultatExerciceDistanceDroite): EtatSessionDistanceDroite {
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

/**
 * Écran "choixPoint" (variante "paralleles" uniquement) — mène toujours à "equationB". Dérive
 * `point`/`bAttendue`/`qAttendu` à partir du point RÉELLEMENT soumis par l'élève si l'écran se clôt
 * sur une réussite (n'importe quel point entier valide de la droite désignée, jamais une valeur
 * fixe), ou d'un repli ALÉATOIRE (`pointEntierAleatoireImpliciteDroite`, un point entier différent
 * à chaque tirage, jamais un point fixe reproposé — `promptgen47modifications.md`, point 5) si
 * l'écran se clôt par révélation, pour ne jamais réutiliser la réponse fausse de l'élève.
 */
export function soumettreReponseChoixPoint(etat: EtatSessionDistanceDroite, reponse: Point): EtatSessionDistanceDroite {
  if (etat.terminee || etat.phase !== "choixPoint") {
    throw new Error("soumettreReponseChoixPoint : la session n'est pas à l'étape choixPoint");
  }
  const exercice = etat.exerciceCourant;
  if (exercice.variante !== "paralleles") {
    throw new Error("soumettreReponseChoixPoint : réservé à la variante paralleles");
  }
  const exerciceParalleles: ExerciceDistanceParalleles = exercice;

  const etapeCourante = soumettreEtapeTentatives<Point>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierChoixPoint(exerciceParalleles, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideChoixPoint);

  const point: Point = etapeCourante.reussie ? reponse : pointEntierAleatoireImpliciteDroite(droiteSourceDeExercice(exerciceParalleles));
  const bAttendue = impliciteDepuisPointVecteurDroite(point, exerciceParalleles.vecteurNormal);
  const droiteCible = etat.droiteCible!;
  // b (perpendiculaire à la direction commune de d1/d2) est toujours sécante à droiteCible —
  // jamais null, même garantie géométrique que la variante "point" (voir generateurs/distanceDroite/index.ts).
  const qAttendu = intersectionDeuxDroitesImplicites(bAttendue, droiteCible)!;

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "equationB",
    scoreChoixPointExercice: score,
    choixPointRevele: etapeCourante.revelee,
    point,
    bAttendue,
    qAttendu,
  };
}

/** Écran "equationB" — mène toujours à "intersectionQ". Identique pour les deux variantes : lit
 * `bAttendue` déjà connu (dès `etatInitial` pour "point", après "choixPoint" pour "paralleles"). */
export function soumettreReponseEquationB(etat: EtatSessionDistanceDroite, reponse: string): EtatSessionDistanceDroite {
  if (etat.terminee || etat.phase !== "equationB" || etat.bAttendue === null) {
    throw new Error("soumettreReponseEquationB : la session n'est pas à l'étape equationB");
  }
  const bAttendue = etat.bAttendue;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEquationB(r, bAttendue),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideEquationB);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "intersectionQ",
    scoreEquationBExercice: score,
    equationBRevele: etapeCourante.revelee,
  };
}

/** Écran "intersectionQ" — mène toujours à "distancePQ". Identique pour les deux variantes. */
export function soumettreReponseIntersectionQ(etat: EtatSessionDistanceDroite, reponse: ReponseIntersection): EtatSessionDistanceDroite {
  if (etat.terminee || etat.phase !== "intersectionQ" || etat.qAttendu === null) {
    throw new Error("soumettreReponseIntersectionQ : la session n'est pas à l'étape intersectionQ");
  }
  const qAttendu = etat.qAttendu;

  const etapeCourante = soumettreEtapeTentatives<ReponseIntersection>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierIntersection(r, qAttendu),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideIntersectionQ);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "distancePQ",
    scoreIntersectionQExercice: score,
    intersectionQRevele: etapeCourante.revelee,
  };
}

/** Écran "distancePQ" (dernière phase) — clôture toujours l'exercice. Identique pour les deux
 * variantes : compare toujours à `exercice.distance`, jamais recalculée depuis les réponses
 * précédentes (toujours la vraie valeur confirmée par la Couche A). `reponse` est un texte libre
 * (entier, fraction, `sqrt(...)`, décimal — `promptgen47modifications.md`, point 15), parsé
 * symboliquement par `verifierDistance`/`diagnostiquerDistance`, jamais un `number` déjà réduit ici. */
export function soumettreReponseDistancePQ(etat: EtatSessionDistanceDroite, reponse: string): EtatSessionDistanceDroite {
  if (etat.terminee || etat.phase !== "distancePQ") {
    throw new Error("soumettreReponseDistancePQ : la session n'est pas à l'étape distancePQ");
  }
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDistance(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDistancePQ);

  return cloturerExerciceOuSuivant(etat, {
    variante: exercice.variante,
    scoreChoixPoint: etat.scoreChoixPointExercice,
    choixPointRevele: etat.choixPointRevele,
    niveauAideChoixPoint: etat.niveauAideChoixPoint,
    scoreEquationB: etat.scoreEquationBExercice as number,
    equationBRevele: etat.equationBRevele,
    niveauAideEquationB: etat.niveauAideEquationB,
    scoreIntersectionQ: etat.scoreIntersectionQExercice as number,
    intersectionQRevele: etat.intersectionQRevele,
    niveauAideIntersectionQ: etat.niveauAideIntersectionQ,
    scoreDistancePQ: score,
    distancePQRevele: etapeCourante.revelee,
    niveauAideDistancePQ: etat.niveauAideDistancePQ,
  });
}
