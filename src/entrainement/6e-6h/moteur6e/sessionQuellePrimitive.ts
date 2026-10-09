import type { ExerciceQuellePrimitive } from "../core6e/quellePrimitive.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesQuellePrimitive";
import type { EtatSessionQuellePrimitive, PhaseQuellePrimitive, ResultatExerciceQuellePrimitive } from "./typesQuellePrimitive";
import { verifierEcranQuellePrimitive } from "./verificationQuellePrimitive";

/**
 * Couche B (6e) — moteur de session pour `6gen24`. N'importe JAMAIS rien de `src/generateurs6e/`
 * (voir `sessionQuellePrimitive.test.ts`, fixtures locales factices, et
 * `generateurs6e/quellePrimitive/session.integration.test.ts` pour le seul fichier autorisé Couche
 * A + Couche B ensemble). Mirroir QUASI EXACT de `sessionCalculPrimitives.ts` (6gen23) — même
 * patron "une seule fonction de soumission" (`soumettreReponseEcran`), même piège "revele stale"
 * corrigé via `derniereTransitionRevelee` calculé AVANT le reset de `etapeCourante` (voir CLAUDE.md
 * point 3 des clarifications) — seule différence : les types/fonctions importés viennent de
 * `typesQuellePrimitive.ts`/`verificationQuellePrimitive.ts` plutôt que leurs équivalents 6gen23.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans, y compris l'écran final (spec explicite). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceQuellePrimitive): Pick<EtatSessionQuellePrimitive, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionQuellePrimitive(reglages: ReglagesSession6e, generateur: () => ExerciceQuellePrimitive): EtatSessionQuellePrimitive {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionQuellePrimitive): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionQuellePrimitive): EtatSessionQuellePrimitive {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionQuellePrimitive, resultat: ResultatExerciceQuellePrimitive): EtatSessionQuellePrimitive {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionQuellePrimitive, valeurs: string[]): EtatSessionQuellePrimitive {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phaseCourante = etat.phase;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcranQuellePrimitive(exercice, phaseCourante, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels: Partial<Record<PhaseQuellePrimitive, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceQuellePrimitive = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
