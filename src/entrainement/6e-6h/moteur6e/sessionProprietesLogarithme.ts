/**
 * Couche B (6e) — moteur de session pour `6gen13`, REFONTE TOTALE : `phase` est un index numérique
 * (voir `typesProprietesLogarithme.ts`) et `scoresPartiels` un TABLEAU (un score par écran DÉJÀ clos
 * de l'exercice courant), jamais un champ unique ni un dict par nom de phase — seule représentation
 * qui generalise à un nombre d'écrans déterminé à l'exécution (3 ou 4 selon la combinaison tirée).
 */
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesProprietesLogarithme";
import type { EtatSessionProprietesLogarithme, ResultatExerciceProprietesLogarithme } from "./typesProprietesLogarithme";
import { verifierEcran } from "./verificationProprietesLogarithme";

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur CHAQUE écran (convention héritée, inchangée par la refonte). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceProprieteLogarithme,
): Pick<
  EtatSessionProprietesLogarithme,
  "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "derniereTransitionRevelee"
> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: [],
    revelesPartiels: [],
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionProprietesLogarithme(reglages: ReglagesSession6e, generateur: () => ExerciceProprieteLogarithme): EtatSessionProprietesLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProprietesLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function activerAideSuivante(etat: EtatSessionProprietesLogarithme): EtatSessionProprietesLogarithme {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionProprietesLogarithme, resultat: ResultatExerciceProprietesLogarithme): EtatSessionProprietesLogarithme {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponse(etat: EtatSessionProprietesLogarithme, texte: string): EtatSessionProprietesLogarithme {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels = [...etat.scoresPartiels, score];
  const revelesPartiels = [...etat.revelesPartiels, revele];
  const phaseSuivante = phaseApres(exercice, phase);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceProprietesLogarithme = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return {
    ...etat,
    scoresPartiels,
    revelesPartiels,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: phaseSuivante,
    derniereTransitionRevelee: revele,
  };
}
