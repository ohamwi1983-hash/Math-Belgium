import type { ExerciceIntegralesDefinies } from "../core6e/integralesDefinies.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesIntegralesDefinies";
import type { EtatSessionIntegralesDefinies, PhaseIntegralesDefinies, ResultatExerciceIntegralesDefinies } from "./typesIntegralesDefinies";
import { verifierEcran } from "./verificationIntegralesDefinies";

/**
 * Couche B (6e) — moteur de session pour `6gen25`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionIntegralesDefinies.test.ts` (fixtures locales factices) et
 * `generateurs6e/integralesDefinies/session.integration.test.ts` pour la preuve. Mirroir EXACT de
 * `sessionCalculPrimitives.ts` (6gen23) — UNE SEULE fonction de soumission
 * (`soumettreReponseEcran`), `derniereTransitionRevelee` calculée AVANT le reset de
 * `etapeCourante`/`niveauAide` dans le même appel (piège "revele stale", CLAUDE.md point 4).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque écran documenté). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceIntegralesDefinies): Pick<EtatSessionIntegralesDefinies, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionIntegralesDefinies(reglages: ReglagesSession6e, generateur: () => ExerciceIntegralesDefinies): EtatSessionIntegralesDefinies {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionIntegralesDefinies): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionIntegralesDefinies): EtatSessionIntegralesDefinies {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionIntegralesDefinies, resultat: ResultatExerciceIntegralesDefinies): EtatSessionIntegralesDefinies {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionIntegralesDefinies, valeurs: string[]): EtatSessionIntegralesDefinies {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phaseCourante = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phaseCourante, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels: Partial<Record<PhaseIntegralesDefinies, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(exercice, phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceIntegralesDefinies = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
