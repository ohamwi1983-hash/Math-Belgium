import type { ExerciceIntegraleGraphique } from "../core6e/integraleGraphique.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres } from "./typesIntegraleGraphique";
import type { EtatSessionIntegraleGraphique } from "./typesIntegraleGraphique";
import { verifierEcran } from "./verificationIntegraleGraphique";

/**
 * Couche B (6e) — moteur de session de `6gen77`. Même patron que `sessionParadoxesProbabilites.ts`
 * (6gen76) : choix fermé → une seule tentative ; champs libres → `reglages.tentativesMax`. Une saisie
 * illisible (`parse_error`) n'arrive jamais ici : l'écran la signale sans soumettre (elle ne consomme
 * donc aucune tentative).
 */

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX = 2;

/** Écran « bornes inversées » de `proprietes` : une seule aide (la propriété) — la seconde donnerait
 * la réponse. */
export function niveauAideMaxPhase(etat: EtatSessionIntegraleGraphique): number {
  return etat.exerciceCourant.variante === "proprietes" && etat.phase === "ecran3" ? 1 : NIVEAU_AIDE_MAX;
}

export function tentativesMaxCourant(etat: EtatSessionIntegraleGraphique): number {
  return estPhaseChoix(etat.exerciceCourant, etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function etatExercice(exercice: ExerciceIntegraleGraphique) {
  return {
    exerciceCourant: exercice,
    phase: "ecran1" as const,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionIntegraleGraphique(reglages: ReglagesSession6e, generateur: () => ExerciceIntegraleGraphique): EtatSessionIntegraleGraphique {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionIntegraleGraphique): EtatSessionIntegraleGraphique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxPhase(etat)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionIntegraleGraphique, valeurs: string[]): EtatSessionIntegraleGraphique {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxCourant(etat),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const suivante = phaseApres(phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, derniereTransitionRevelee: revele };
}
