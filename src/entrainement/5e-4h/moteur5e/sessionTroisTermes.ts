import type { ExerciceTroisTermes } from "../core5e/troisTermes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { PHASES_TROIS_TERMES, phaseApres, tentativesMaxPhase } from "./typesTroisTermes";
import type { EtatSessionTroisTermes } from "./typesTroisTermes";
import { verifierEcran } from "./verificationTroisTermes";

/**
 * Couche B (5e) — moteur de session de `5gen46`. Même patron que `sessionSommesTermes.ts` (5gen45),
 * avec UNE seule tentative sur le choix fermé (`relation`) et le réglage de session (3) sur les
 * champs libres. Une saisie illisible (`parse_error`) ou refusée pour sa forme (`refusFormat`) n'est
 * jamais soumise ici : l'écran (`EtapeTroisTermes`) l'arrête avant, sans consommer de tentative.
 * Aucun point ni pénalité affichés (générateur d'apprentissage).
 */

const POINTS_DE_BASE = 100;

/** Deux niveaux d'aide par écran. */
export const NIVEAU_AIDE_MAX = 2;

function etatExercice(exercice: ExerciceTroisTermes) {
  return {
    exerciceCourant: exercice,
    phase: PHASES_TROIS_TERMES[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionTroisTermes(reglages: ReglagesSession5e, generateur: () => ExerciceTroisTermes): EtatSessionTroisTermes {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionTroisTermes): EtatSessionTroisTermes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionTroisTermes, valeurs: string[]): EtatSessionTroisTermes {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: tentativesMaxPhase(phase, etat.reglages.tentativesMax),
    verifier: (r) => verifierEcran(exercice, phase, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const revelesPartiels = { ...etat.revelesPartiels, [phase]: revele };
  const suivante = phaseApres(exercice, phase);
  if (suivante === "termine") {
    const indexExercice = etat.indexExercice + 1;
    if (indexExercice >= etat.reglages.nombreExercices) {
      return { ...etat, etapeCourante, revelesPartiels, indexExercice, terminee: true, derniereTransitionRevelee: revele };
    }
    return { ...etat, indexExercice, ...etatExercice(etat.generateur()), derniereTransitionRevelee: revele };
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: suivante, revelesPartiels, derniereTransitionRevelee: revele };
}
