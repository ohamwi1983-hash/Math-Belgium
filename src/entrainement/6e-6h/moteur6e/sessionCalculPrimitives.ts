import type { ExerciceCalculPrimitives } from "../core6e/calculPrimitives.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesCalculPrimitives";
import type { EtatSessionCalculPrimitives, PhaseCalculPrimitives, ResultatExerciceCalculPrimitives } from "./typesCalculPrimitives";
import { verifierEcran } from "./verificationCalculPrimitives";

/**
 * Couche B (6e) — moteur de session pour `6gen23`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionCalculPrimitives.test.ts` (fixtures locales factices) et
 * `generateurs6e/calculPrimitives/session.integration.test.ts` pour la preuve.
 *
 * **UNE SEULE fonction de soumission** (`soumettreReponseEcran(etat, valeurs)`), pas une par écran
 * (contrairement à `6gen18`) : `etat.phase` porte déjà l'information de "quel écran", et
 * `verifierEcran` (dispatcher générique, `verificationCalculPrimitives.ts`) sait déjà quoi
 * vérifier — dupliquer ~24 fonctions `soumettreReponseXxxEcranYyy` n'aurait rien apporté vu la
 * signature déjà uniforme `string[]` (voir en-tête de `verificationCalculPrimitives.ts`).
 * `scoresPartiels` reste un champ PUR de `EtatSessionCalculPrimitives` (jamais une variable mutable
 * de module) — chaque transition retourne un nouvel état, comme partout ailleurs sur la plateforme.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur tous les écrans (spec explicite pour chaque écran documenté). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceCalculPrimitives): Pick<EtatSessionCalculPrimitives, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionCalculPrimitives(reglages: ReglagesSession6e, generateur: () => ExerciceCalculPrimitives): EtatSessionCalculPrimitives {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionCalculPrimitives): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionCalculPrimitives): EtatSessionCalculPrimitives {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionCalculPrimitives, resultat: ResultatExerciceCalculPrimitives): EtatSessionCalculPrimitives {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionCalculPrimitives, valeurs: string[]): EtatSessionCalculPrimitives {
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
  const scoresPartiels: Partial<Record<PhaseCalculPrimitives, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceCalculPrimitives = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
