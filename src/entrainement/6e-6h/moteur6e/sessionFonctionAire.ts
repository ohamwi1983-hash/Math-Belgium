import type { ExerciceFonctionAire } from "../core6e/fonctionAire.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import { estPhaseChoix, phaseApres, phasesPourExercice } from "./typesFonctionAire";
import type { EtatSessionFonctionAire } from "./typesFonctionAire";
import { diagnostiquerEcran, verifierEcran } from "./verificationFonctionAire";

/**
 * Couche B (6e) — moteur de session de `6gen78`. Même patron que `sessionParadoxesProbabilites.ts`
 * (6gen76) : une seule tentative sur un écran à choix fermé, 3 sur des champs libres ; une saisie
 * illisible (`parse_error`) ne consomme jamais de tentative.
 */

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX = 2;

function etatExercice(exercice: ExerciceFonctionAire) {
  return {
    exerciceCourant: exercice,
    phase: phasesPourExercice(exercice)[0],
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionFonctionAire(reglages: ReglagesSession6e, generateur: () => ExerciceFonctionAire): EtatSessionFonctionAire {
  return { reglages, generateur, indexExercice: 0, terminee: false, ...etatExercice(generateur()) };
}

export function activerAideSuivante(etat: EtatSessionFonctionAire): EtatSessionFonctionAire {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseEcran(etat: EtatSessionFonctionAire, valeurs: string[]): EtatSessionFonctionAire {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phase = etat.phase;
  // Saisie illisible : aucune tentative décomptée (l'écran affiche un message de syntaxe).
  if (diagnostiquerEcran(exercice, phase, valeurs) === "parse_error") return { ...etat, derniereTransitionRevelee: false };

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: estPhaseChoix(phase) ? 1 : etat.reglages.tentativesMax,
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
