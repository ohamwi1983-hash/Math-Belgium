/**
 * Couche B (5e) — moteur de session pour 5gen16 ("Convergence et divergence des suites"). N'importe
 * jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceConvergenceArithmetique, ExerciceConvergenceGeometrique, ExerciceConvergenceQuelconque, ExerciceConvergenceSuite } from "../core5e/convergenceSuites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesConvergenceSuites";
import type { EtatSessionConvergenceSuite, PhaseConvergenceSuite, ResultatExerciceConvergenceSuite } from "./typesConvergenceSuites";
import { diagnostiquerClassifierQuelconque, diagnostiquerDiviserQuelconque, verifierClassificationArithmetique, verifierClassificationGeometrique } from "./verificationConvergenceSuites";
import type { ReponseClassifierQuelconque } from "./verificationConvergenceSuites";

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX_CONVERGENCE_SUITE = 2;

function etatInitial(
  exercice: ExerciceConvergenceSuite,
): Pick<EtatSessionConvergenceSuite, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, revelesPartiels: {} };
}

export function demarrerSessionConvergenceSuite(reglages: ReglagesSession5e, generateur: () => ExerciceConvergenceSuite): EtatSessionConvergenceSuite {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

/**
 * Tentatives par écran (audit 5c3b point 7, même règle qu'au chapitre 2) : un choix fermé qui se
 * gagnerait par élimination n'a droit qu'à UNE tentative — classification arithmétique (3 options),
 * géométrique (6 options). « Conclure » (4 options) garde le plafond des réglages pour la seule
 * VALEUR de la limite (champ libre) ; une mauvaise CONCLUSION, elle, clôt l'écran tout de suite
 * (`soumettreReponseClassifierQuelconque`).
 */
export function tentativesMaxConvergenceSuite(etat: Pick<EtatSessionConvergenceSuite, "reglages">, phase: PhaseConvergenceSuite): number {
  if (phase === "classificationArithmetique" || phase === "classificationGeometrique") return 1;
  return etat.reglages.tentativesMax;
}

function reglagesEtape(etat: EtatSessionConvergenceSuite): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxConvergenceSuite(etat, etat.phase) };
}

/** Plafond d'aide PAR PHASE/INSTANCE (B.3, `promptcorrectionsround2.md`) — remplace l'usage nu de
 * `NIVEAU_AIDE_MAX_CONVERGENCE_SUITE` (toujours 2). `texteAideNiveau2()`
 * (`ui5e/formatConvergenceSuites.ts`) ne couvre que "diviserQuelconque" et "classifierQuelconque"
 * quand `classification==="limiteValeur"` — sans ce garde, le bouton "Aide supplémentaire" restait
 * cliquable/pénalisant sur "classificationArithmetique" (100% des instances variante
 * "arithmetique"), "classificationGeometrique" (100% des instances variante "geometrique"), et
 * "classifierQuelconque" pour les 3 classifications autres que "limiteValeur" (~75% des instances
 * variante "quelconque" atteignant cette phase). Les autres phases gardent le plafond uniforme. */
export function niveauAideMaxConvergenceSuite(exercice: ExerciceConvergenceSuite, phase: PhaseConvergenceSuite): number {
  if (phase === "classificationArithmetique" || phase === "classificationGeometrique") return 1;
  if (phase === "classifierQuelconque" && exercice.variante === "quelconque" && exercice.classification !== "limiteValeur") return 1;
  return NIVEAU_AIDE_MAX_CONVERGENCE_SUITE;
}

export function activerAideSuivante(etat: EtatSessionConvergenceSuite): EtatSessionConvergenceSuite {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxConvergenceSuite(etat.exerciceCourant, etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionConvergenceSuite, resultat: ResultatExerciceConvergenceSuite, revele: boolean): EtatSessionConvergenceSuite {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(
  etat: EtatSessionConvergenceSuite,
  phaseAttendue: PhaseConvergenceSuite,
  reponse: T,
  verifier: (r: T) => boolean,
  derniereTentative = false,
): EtatSessionConvergenceSuite {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const reglages = reglagesEtape(etat);
  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglages,
    // Échec qui doit clore l'écran tout de suite (mauvaise conclusion sur un choix fermé).
    tentativesMax: derniereTentative ? etat.etapeCourante.tentativesUtilisees + 1 : reglages.tentativesMax,
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const revelesPartiels = { ...etat.revelesPartiels, [phaseAttendue]: revele };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels, revelesPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, revelesPartiels, derniereEtapeRevelee: revele };
}

function commeArithmetique(exercice: ExerciceConvergenceSuite): ExerciceConvergenceArithmetique {
  if (exercice.variante !== "arithmetique") throw new Error("commeArithmetique : variante hors 'arithmetique'");
  return exercice;
}
function commeGeometrique(exercice: ExerciceConvergenceSuite): ExerciceConvergenceGeometrique {
  if (exercice.variante !== "geometrique") throw new Error("commeGeometrique : variante hors 'geometrique'");
  return exercice;
}
function commeQuelconque(exercice: ExerciceConvergenceSuite): ExerciceConvergenceQuelconque {
  if (exercice.variante !== "quelconque") throw new Error("commeQuelconque : variante hors 'quelconque'");
  return exercice;
}

export function soumettreReponseClassificationArithmetique(etat: EtatSessionConvergenceSuite, choix: ExerciceConvergenceArithmetique["classification"]): EtatSessionConvergenceSuite {
  const exo = commeArithmetique(etat.exerciceCourant);
  return soumettreEcran(etat, "classificationArithmetique", choix, (c) => verifierClassificationArithmetique(c, exo));
}

export function soumettreReponseClassificationGeometrique(etat: EtatSessionConvergenceSuite, choix: ExerciceConvergenceGeometrique["classification"]): EtatSessionConvergenceSuite {
  const exo = commeGeometrique(etat.exerciceCourant);
  return soumettreEcran(etat, "classificationGeometrique", choix, (c) => verifierClassificationGeometrique(c, exo));
}

export function soumettreReponseDiviserQuelconque(etat: EtatSessionConvergenceSuite, texte: string): EtatSessionConvergenceSuite {
  const exo = commeQuelconque(etat.exerciceCourant);
  return soumettreEcran(etat, "diviserQuelconque", texte, (t) => diagnostiquerDiviserQuelconque(t, exo) === "correct");
}

export function soumettreReponseClassifierQuelconque(etat: EtatSessionConvergenceSuite, reponse: ReponseClassifierQuelconque): EtatSessionConvergenceSuite {
  const exo = commeQuelconque(etat.exerciceCourant);
  // Mauvaise conclusion (choix fermé à 4 options) : écran clos et réponse révélée, sans 2e essai ;
  // bonne conclusion mais valeur fausse : nouvel essai sur la valeur (plafond des réglages).
  const mauvaiseConclusion = reponse.classification !== exo.classification;
  return soumettreEcran(etat, "classifierQuelconque", reponse, (r) => diagnostiquerClassifierQuelconque(r, exo) === "correct", mauvaiseConclusion);
}
