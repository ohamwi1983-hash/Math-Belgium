import type { ExerciceAccumulerGrandeur } from "../core6e/accumulerGrandeur.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres } from "./typesAccumulerGrandeur";
import type { EtatSessionAccumulerGrandeur, PhaseAccumulerGrandeur } from "./typesAccumulerGrandeur";
import { diagnostiquerEcran, verifierEcran } from "./verificationAccumulerGrandeur";

/**
 * Couche B (6e) — moteur de session de `6gen80`. Même patron que `sessionParadoxesProbabilites.ts`
 * (6gen76) : choix fermé = une seule tentative, champ ouvert = `reglages.tentativesMax` ; une saisie
 * illisible (`parse_error`) ne consomme JAMAIS de tentative (l'écran affiche un message de syntaxe).
 * Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur les écrans ouverts, 1 sur le choix fermé (une aide de plus désignerait
 * l'option correcte). */
export function niveauAideMaxPhase(phase: PhaseAccumulerGrandeur): number {
  return estPhaseChoix(phase) ? 1 : 2;
}

export function tentativesMaxPhase(etat: EtatSessionAccumulerGrandeur): number {
  return estPhaseChoix(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatExercice(exercice: ExerciceAccumulerGrandeur) {
  return {
    exerciceCourant: exercice,
    phase: "modele" as const,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    aidePartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionAccumulerGrandeur(reglages: ReglagesSession6e, generateur: () => ExerciceAccumulerGrandeur): EtatSessionAccumulerGrandeur {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionAccumulerGrandeur): EtatSessionAccumulerGrandeur {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionAccumulerGrandeur, valeurs: string[]): EtatSessionAccumulerGrandeur {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  // Saisie illisible : aucune tentative décomptée.
  if (diagnostiquerEcran(exercice, phase, valeurs) === "parse_error") return { ...etat, derniereTransitionRevelee: false };

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxPhase(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const aidePartiels = { ...etat.aidePartiels, [phase]: etat.niveauAide > 0 };
  const suivante = phaseApres(phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, aidePartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, aidePartiels, derniereTransitionRevelee: revele };
}
