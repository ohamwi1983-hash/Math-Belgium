/**
 * Couche B (5e) — moteur de session pour 5gen12 ("Problèmes de géométrie du cercle"). N'importe
 * jamais rien de `src/generateurs5e/` — voir `sessionGeometrieCercle.test.ts` pour la preuve avec
 * des exercices factices définis localement.
 *
 * TOUS les écrans des 3 scénarios survivants ont EXACTEMENT la même forme (un champ texte libre,
 * une cible numérique) — une SEULE fonction `soumettreReponse` couvre donc les 17 écrans possibles,
 * plutôt que 17 fonctions `soumettreReponseXxx` quasi identiques (contrairement à 5gen10/5gen11,
 * dont les écrans ont des formes de réponse réellement différentes d'un écran à l'autre) — décision
 * explicite, justifiée par cette uniformité structurelle, jamais un raccourci pris par défaut.
 */
import type { ExerciceGeometrieCercle } from "../core5e/geometrieCercle.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesGeometrieCercle";
import type { EtatSessionGeometrieCercle, PhaseGeometrieCercle, ResultatExerciceGeometrieCercle } from "./typesGeometrieCercle";
import { diagnostiquerChamp } from "./verificationGeometrieCercle";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide, PLAFOND UNIFORME par défaut (même convention que la majorité des générateurs
 * récents du chantier 5e) — quelques écrans dérogent à ce plafond via `niveauAideMaxGeometrieCercle`
 * ci-dessous (aide niveau 2 retirée, contenu redondant avec l'aide niveau 1 une fois les corrections
 * de la campagne "Variante A3/A3b" appliquées). */
export const NIVEAU_AIDE_MAX_GEOMETRIE_CERCLE = 2;

/** Écrans dont l'aide niveau 2 a été retirée (donnait la soustraction déjà posée par l'aide niveau
 * 1 — "secteur − triangle" — sans rien ajouter) : l'écran segment de `segmentCirculaire` et les 2
 * écrans segment de `lentille` (un par cercle). Tout autre écran garde le plafond uniforme. */
const PHASES_AIDE_MAX_1: ReadonlySet<PhaseGeometrieCercle> = new Set(["aireSegment", "segmentAire1", "segmentAire2"]);

export function niveauAideMaxGeometrieCercle(phase: PhaseGeometrieCercle): number {
  return PHASES_AIDE_MAX_1.has(phase) ? 1 : NIVEAU_AIDE_MAX_GEOMETRIE_CERCLE;
}

function etatInitial(exercice: ExerciceGeometrieCercle): Pick<EtatSessionGeometrieCercle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionGeometrieCercle(reglages: ReglagesSession5e, generateur: () => ExerciceGeometrieCercle): EtatSessionGeometrieCercle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionGeometrieCercle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionGeometrieCercle): EtatSessionGeometrieCercle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxGeometrieCercle(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionGeometrieCercle, resultat: ResultatExerciceGeometrieCercle, revele: boolean): EtatSessionGeometrieCercle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function s(scores: Partial<Record<PhaseGeometrieCercle, number>>, phase: PhaseGeometrieCercle): number {
  return scores[phase] as number;
}

/** Assemble la forme de résultat FIXE propre au scénario depuis les scores accumulés — appelée
 * uniquement une fois la DERNIÈRE phase de la séquence close (tous les scores sont alors garantis
 * présents). */
function construireResultat(exercice: ExerciceGeometrieCercle, scores: Partial<Record<PhaseGeometrieCercle, number>>): ResultatExerciceGeometrieCercle {
  switch (exercice.scenario) {
    case "secteurBalaye":
      return { scenario: "secteurBalaye", exercice, scoreConversionRad: s(scores, "conversionRad"), scoreAireGrandSecteur: s(scores, "aireGrandSecteur"), scoreAirePetitSecteur: s(scores, "airePetitSecteur"), scoreAireBalayee: s(scores, "aireBalayee") };
    case "segmentCirculaire":
      return { scenario: "segmentCirculaire", exercice, scoreAngleTheta: s(scores, "angleTheta"), scoreAireSecteur: s(scores, "aireSecteur"), scoreAireTriangle: s(scores, "aireTriangle"), scoreAireSegment: s(scores, "aireSegment") };
    case "lentille":
      return {
        scenario: "lentille",
        exercice,
        scoreAngle1: s(scores, "angle1"),
        scoreSecteur1: s(scores, "secteur1"),
        scoreTriangle1: s(scores, "triangle1"),
        scoreSegmentAire1: s(scores, "segmentAire1"),
        scoreAngle2: s(scores, "angle2"),
        scoreSecteur2: s(scores, "secteur2"),
        scoreTriangle2: s(scores, "triangle2"),
        scoreSegmentAire2: s(scores, "segmentAire2"),
        scoreAireLentille: s(scores, "aireLentille"),
      };
  }
}

export function soumettreReponse(etat: EtatSessionGeometrieCercle, texte: string): EtatSessionGeometrieCercle {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t) => diagnostiquerChamp(exercice, phase, t) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [phase]: score };
  const phaseSuivante = phaseApres(exercice, phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(exercice, scoresPartiels), revele);
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereEtapeRevelee: revele };
}
