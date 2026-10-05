/**
 * Couche B — moteur de session pour "Exercice de synthèse" (chapitre 5, remplace intégralement
 * "Étendue et écart interquartile" à la même position, gen35 — `promptgen35synthese.md`).
 * N'importe jamais rien de src/generateurs — voir sessionExerciceSynthese.test.ts pour la preuve
 * avec des générateurs factices.
 *
 * Chaque variante traverse une SÉQUENCE FIXE (`SEQUENCES`, `typesExerciceSynthese.ts`) — même
 * patron exact que "Orthogonalité et théorème de Pythagore généralisé" : `soumettrePhase` (privée)
 * factorise le motif commun (tentatives, pénalité additive par niveau d'aide, transition vers
 * l'écran suivant ou clôture de l'exercice) ; chaque `soumettreReponseXxx` exporté n'est qu'un thin
 * wrapper typé par écran, qui délègue TOUJOURS à une fonction `verifierXxx`/`diagnostiquerXxx`
 * RÉELLE des 5 modules sources (via les mappers de `verificationExerciceSynthese.ts`) — jamais une
 * seconde implémentation de la logique de vérification.
 */
import type { ExerciceSynthese, GenerateurExerciceSynthese } from "../core/exerciceSynthese.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { NIVEAU_AIDE_MAX, SEQUENCES } from "./typesExerciceSynthese";
import type { EtatSessionExerciceSynthese, PhaseExerciceSynthese, ResultatExerciceSynthese, ScoreEcran } from "./typesExerciceSynthese";
import { verifierCentres, verifierSommes, verifierQuotient } from "./verificationMoyennePonderee";
import type { ReponseCentres, ReponseSommes, ReponseQuotient } from "./verificationMoyennePonderee";
import { verifierMediane, verifierQ1, verifierQ3, verifierMinMaxMode, verifierPolygone, verifierLecture, verifierSynthese } from "./verificationMediane";
import type { ReponseMediane, ReponseQ1, ReponseQ3, ReponseMinMaxMode, PointPolygone, ParametreLecture, ReponseSynthese } from "./verificationMediane";
import { verifierTableauDispersion, verifierVarianceEcartType } from "./verificationDispersion";
import type { ReponseTableauDispersion, ReponseVarianceEcartType } from "./verificationDispersion";
import { verifierConstruction } from "./verificationBoiteMoustaches";
import type { CinqNombres } from "../core/boiteMoustaches.types";
import { verifierBtIntervalle, verifierBtPourcent, versDispersion, versMediane, versMoyennePonderee, versBoiteMoustaches } from "./verificationExerciceSynthese";
import type { ReponseIntervalle } from "./verificationBienaymeTchebychev";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

function phaseInitiale(exercice: ExerciceSynthese): PhaseExerciceSynthese {
  return SEQUENCES[exercice.variante][0];
}

function phaseSuivante(exercice: ExerciceSynthese, phaseActuelle: PhaseExerciceSynthese): PhaseExerciceSynthese | null {
  const sequence = SEQUENCES[exercice.variante];
  const index = sequence.indexOf(phaseActuelle);
  return index + 1 < sequence.length ? sequence[index + 1] : null;
}

function etatInitial(
  exercice: ExerciceSynthese,
): Pick<EtatSessionExerciceSynthese, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresAccumules"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresAccumules: {},
  };
}

export function demarrerSessionExerciceSynthese(reglages: ReglagesSession, generateur: GenerateurExerciceSynthese): EtatSessionExerciceSynthese {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    resultats: [],
    terminee: false,
    ...etatInitial(generateur()),
  };
}

function reglagesEtape(etat: EtatSessionExerciceSynthese): ReglagesEtape {
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
export function activerAideSuivante(etat: EtatSessionExerciceSynthese): EtatSessionExerciceSynthese {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  const max = NIVEAU_AIDE_MAX[etat.phase];
  if (etat.niveauAide >= max) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function champVide(): { score: number | null; revele: boolean; niveauAide: number } {
  return { score: null, revele: false, niveauAide: 0 };
}

function champ(scoresAccumules: Partial<Record<PhaseExerciceSynthese, ScoreEcran>>, phase: PhaseExerciceSynthese) {
  return scoresAccumules[phase] ?? champVide();
}

function construireResultat(
  exercice: ExerciceSynthese,
  scoresAccumules: Partial<Record<PhaseExerciceSynthese, ScoreEcran>>,
): ResultatExerciceSynthese {
  const centres = champ(scoresAccumules, "centres");
  const sommes = champ(scoresAccumules, "sommes");
  const quotient = champ(scoresAccumules, "quotient");
  const mediane = champ(scoresAccumules, "mediane");
  const q1 = champ(scoresAccumules, "q1");
  const q3 = champ(scoresAccumules, "q3");
  const minMaxMode = champ(scoresAccumules, "minMaxMode");
  const polygone = champ(scoresAccumules, "polygone");
  const lectureMediane = champ(scoresAccumules, "lectureMediane");
  const lectureQ1 = champ(scoresAccumules, "lectureQ1");
  const lectureQ3 = champ(scoresAccumules, "lectureQ3");
  const synthese = champ(scoresAccumules, "synthese");
  const boxplot = champ(scoresAccumules, "boxplot");
  const tableau = champ(scoresAccumules, "tableau");
  const varianceEcartType = champ(scoresAccumules, "varianceEcartType");
  const btIntervalle = champ(scoresAccumules, "btIntervalle");
  const btPourcent = champ(scoresAccumules, "btPourcent");

  return {
    variante: exercice.variante,
    scoreCentres: centres.score,
    centresRevele: centres.revele,
    niveauAideCentres: centres.niveauAide,
    scoreSommes: sommes.score,
    sommesRevele: sommes.revele,
    niveauAideSommes: sommes.niveauAide,
    scoreQuotient: quotient.score,
    quotientRevele: quotient.revele,
    niveauAideQuotient: quotient.niveauAide,
    scoreMediane: mediane.score,
    medianeRevele: mediane.revele,
    niveauAideMediane: mediane.niveauAide,
    scoreQ1: q1.score,
    q1Revele: q1.revele,
    niveauAideQ1: q1.niveauAide,
    scoreQ3: q3.score,
    q3Revele: q3.revele,
    niveauAideQ3: q3.niveauAide,
    scoreMinMaxMode: minMaxMode.score,
    minMaxModeRevele: minMaxMode.revele,
    niveauAideMinMaxMode: minMaxMode.niveauAide,
    scorePolygone: polygone.score,
    polygoneRevele: polygone.revele,
    niveauAidePolygone: polygone.niveauAide,
    scoreLectureMediane: lectureMediane.score,
    lectureMedianeRevele: lectureMediane.revele,
    niveauAideLectureMediane: lectureMediane.niveauAide,
    scoreLectureQ1: lectureQ1.score,
    lectureQ1Revele: lectureQ1.revele,
    niveauAideLectureQ1: lectureQ1.niveauAide,
    scoreLectureQ3: lectureQ3.score,
    lectureQ3Revele: lectureQ3.revele,
    niveauAideLectureQ3: lectureQ3.niveauAide,
    scoreSynthese: synthese.score,
    syntheseRevele: synthese.revele,
    niveauAideSynthese: synthese.niveauAide,
    scoreBoxplot: boxplot.score,
    boxplotRevele: boxplot.revele,
    niveauAideBoxplot: boxplot.niveauAide,
    scoreTableau: tableau.score,
    tableauRevele: tableau.revele,
    niveauAideTableau: tableau.niveauAide,
    scoreVarianceEcartType: varianceEcartType.score,
    varianceEcartTypeRevele: varianceEcartType.revele,
    niveauAideVarianceEcartType: varianceEcartType.niveauAide,
    scoreBtIntervalle: btIntervalle.score,
    btIntervalleRevele: btIntervalle.revele,
    niveauAideBtIntervalle: btIntervalle.niveauAide,
    scoreBtPourcent: btPourcent.score,
    btPourcentRevele: btPourcent.revele,
    niveauAideBtPourcent: btPourcent.niveauAide,
  };
}

function cloturerExerciceOuSuivant(etat: EtatSessionExerciceSynthese, resultat: ResultatExerciceSynthese): EtatSessionExerciceSynthese {
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

/** Factorise le motif commun à tous les écrans : tentatives, pénalité additive par niveau d'aide,
 * transition vers l'écran suivant de la séquence de la variante, ou clôture de l'exercice si
 * `phaseAttendue` est la dernière de sa séquence. */
function soumettrePhase<R>(
  etat: EtatSessionExerciceSynthese,
  phaseAttendue: PhaseExerciceSynthese,
  reponse: R,
  verifier: (reponse: R) => boolean,
): EtatSessionExerciceSynthese {
  if (etat.terminee || etat.phase !== phaseAttendue) {
    throw new Error(`soumettrePhase(${phaseAttendue}) : la session n'est pas à cette étape`);
  }

  const etapeCourante = soumettreEtapeTentatives<R>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresAccumules: Partial<Record<PhaseExerciceSynthese, ScoreEcran>> = {
    ...etat.scoresAccumules,
    [phaseAttendue]: { score, revele: etapeCourante.revelee, niveauAide: etat.niveauAide },
  };

  const suivante = phaseSuivante(etat.exerciceCourant, phaseAttendue);
  if (suivante === null) {
    return cloturerExerciceOuSuivant(etat, construireResultat(etat.exerciceCourant, scoresAccumules));
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), phase: suivante, niveauAide: 0, scoresAccumules };
}

// ============================================================================
// Un wrapper par écran — délègue toujours à une vérification RÉELLE d'un des 5 modules sources
// (via les mappers de `verificationExerciceSynthese.ts`), jamais une logique dupliquée.
// ============================================================================

function requiertVariante(exercice: ExerciceSynthese, variante: ExerciceSynthese["variante"], nomFonction: string): void {
  if (exercice.variante !== variante) {
    throw new Error(`${nomFonction} : réservé à la variante '${variante}'`);
  }
}

export function soumettreReponseCentres(etat: EtatSessionExerciceSynthese, reponse: ReponseCentres): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "classes", "soumettreReponseCentres");
  const mappe = versMoyennePonderee(exercice);
  if (mappe.variante !== "classes") throw new Error("soumettreReponseCentres : mapping incohérent");
  return soumettrePhase(etat, "centres", reponse, (r) => verifierCentres(mappe, r));
}

export function soumettreReponseSommes(etat: EtatSessionExerciceSynthese, reponse: ReponseSommes): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  const mappe = versMoyennePonderee(exercice);
  return soumettrePhase(etat, "sommes", reponse, (r) => verifierSommes(mappe, r));
}

export function soumettreReponseQuotient(etat: EtatSessionExerciceSynthese, texte: ReponseQuotient): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  const mappe = versMoyennePonderee(exercice);
  return soumettrePhase(etat, "quotient", texte, (t) => verifierQuotient(mappe, t));
}

export function soumettreReponseMediane(etat: EtatSessionExerciceSynthese, reponse: ReponseMediane): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "discrete", "soumettreReponseMediane");
  const mappe = versMediane(exercice);
  return soumettrePhase(etat, "mediane", reponse, (r) => verifierMediane(mappe, r));
}

export function soumettreReponseQ1(etat: EtatSessionExerciceSynthese, reponse: ReponseQ1): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "discrete", "soumettreReponseQ1");
  const mappe = versMediane(exercice);
  if (mappe.variante !== "discrete") throw new Error("soumettreReponseQ1 : mapping incohérent");
  return soumettrePhase(etat, "q1", reponse, (r) => verifierQ1(mappe, r));
}

export function soumettreReponseQ3(etat: EtatSessionExerciceSynthese, reponse: ReponseQ3): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "discrete", "soumettreReponseQ3");
  const mappe = versMediane(exercice);
  if (mappe.variante !== "discrete") throw new Error("soumettreReponseQ3 : mapping incohérent");
  return soumettrePhase(etat, "q3", reponse, (r) => verifierQ3(mappe, r));
}

export function soumettreReponseMinMaxMode(etat: EtatSessionExerciceSynthese, reponse: ReponseMinMaxMode): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "discrete", "soumettreReponseMinMaxMode");
  const mappe = versMediane(exercice);
  if (mappe.variante !== "discrete") throw new Error("soumettreReponseMinMaxMode : mapping incohérent");
  return soumettrePhase(etat, "minMaxMode", reponse, (r) => verifierMinMaxMode(mappe, r));
}

export function soumettreReponsePolygone(etat: EtatSessionExerciceSynthese, points: PointPolygone[]): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "classes", "soumettreReponsePolygone");
  const mappe = versMediane(exercice);
  if (mappe.variante !== "classes") throw new Error("soumettreReponsePolygone : mapping incohérent");
  return soumettrePhase(etat, "polygone", points, (p) => verifierPolygone(mappe, p));
}

const PHASE_LECTURE_PAR_PARAMETRE: Record<ParametreLecture, "lectureMediane" | "lectureQ1" | "lectureQ3"> = {
  mediane: "lectureMediane",
  q1: "lectureQ1",
  q3: "lectureQ3",
};

export function soumettreReponseLecture(etat: EtatSessionExerciceSynthese, parametre: ParametreLecture, texte: string): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "classes", "soumettreReponseLecture");
  const mappe = versMediane(exercice);
  if (mappe.variante !== "classes") throw new Error("soumettreReponseLecture : mapping incohérent");
  return soumettrePhase(etat, PHASE_LECTURE_PAR_PARAMETRE[parametre], texte, (t) => verifierLecture(mappe, parametre, t));
}

export function soumettreReponseSynthese(etat: EtatSessionExerciceSynthese, reponse: ReponseSynthese): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  requiertVariante(exercice, "classes", "soumettreReponseSynthese");
  const mappe = versMediane(exercice);
  if (mappe.variante !== "classes") throw new Error("soumettreReponseSynthese : mapping incohérent");
  return soumettrePhase(etat, "synthese", reponse, (r) => verifierSynthese(mappe, r));
}

export function soumettreReponseBoxplot(etat: EtatSessionExerciceSynthese, reponse: CinqNombres): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  const mappe = versBoiteMoustaches(exercice);
  return soumettrePhase(etat, "boxplot", reponse, (r) => verifierConstruction(mappe, r));
}

export function soumettreReponseTableau(etat: EtatSessionExerciceSynthese, reponse: ReponseTableauDispersion): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  const mappe = versDispersion(exercice);
  return soumettrePhase(etat, "tableau", reponse, (r) => verifierTableauDispersion(mappe, r));
}

export function soumettreReponseVarianceEcartType(etat: EtatSessionExerciceSynthese, reponse: ReponseVarianceEcartType): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  const mappe = versDispersion(exercice);
  return soumettrePhase(etat, "varianceEcartType", reponse, (r) => verifierVarianceEcartType(mappe, r));
}

export function soumettreReponseBtIntervalle(etat: EtatSessionExerciceSynthese, reponse: ReponseIntervalle): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  return soumettrePhase(etat, "btIntervalle", reponse, (r) => verifierBtIntervalle(exercice, r));
}

export function soumettreReponseBtPourcent(etat: EtatSessionExerciceSynthese, texte: string): EtatSessionExerciceSynthese {
  const exercice = etat.exerciceCourant;
  return soumettrePhase(etat, "btPourcent", texte, (t) => verifierBtPourcent(exercice, t));
}
