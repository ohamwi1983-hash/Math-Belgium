/**
 * Couche B (6e) — moteur de session pour `6gen20`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionGraphiqueDeriveeLogarithme.test.ts` pour la preuve avec un
 * exercice factice défini localement.
 */
import type { ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesGraphiqueDeriveeLogarithme";
import type { EtatSessionGraphiqueDeriveeLogarithme, PhaseGraphiqueDeriveeLogarithme, ResultatExerciceGraphiqueDeriveeLogarithme } from "./typesGraphiqueDeriveeLogarithme";
import { verifierEcranDerivee, verifierEcranSelection } from "./verificationGraphiqueDeriveeLogarithme";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur les 2 écrans (spec : "Aides (2 niveaux)" pour chaque écran de chaque
 * famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceGraphiqueDeriveeLogarithme,
): Pick<EtatSessionGraphiqueDeriveeLogarithme, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreDeriveePartiel" | "derniereTransitionRevelee"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreDeriveePartiel: null,
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionGraphiqueDeriveeLogarithme(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceGraphiqueDeriveeLogarithme,
): EtatSessionGraphiqueDeriveeLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionGraphiqueDeriveeLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionGraphiqueDeriveeLogarithme): EtatSessionGraphiqueDeriveeLogarithme {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionGraphiqueDeriveeLogarithme, resultat: ResultatExerciceGraphiqueDeriveeLogarithme): EtatSessionGraphiqueDeriveeLogarithme {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function avancerPhase<TReponse>(
  etat: EtatSessionGraphiqueDeriveeLogarithme,
  reponse: TReponse,
  verifier: (exercice: ExerciceGraphiqueDeriveeLogarithme, reponse: TReponse) => boolean,
  phaseAttendue: PhaseGraphiqueDeriveeLogarithme,
): EtatSessionGraphiqueDeriveeLogarithme {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<TReponse>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceGraphiqueDeriveeLogarithme = { exercice, scoreDerivee: etat.scoreDeriveePartiel as number, scoreSelection: score };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoreDeriveePartiel: score, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}

export function soumettreReponseDerivee(etat: EtatSessionGraphiqueDeriveeLogarithme, texte: string): EtatSessionGraphiqueDeriveeLogarithme {
  return avancerPhase(etat, texte, verifierEcranDerivee, "derivee");
}

export function soumettreReponseSelection(etat: EtatSessionGraphiqueDeriveeLogarithme, indexChoisi: number): EtatSessionGraphiqueDeriveeLogarithme {
  return avancerPhase(etat, indexChoisi, verifierEcranSelection, "selection");
}
