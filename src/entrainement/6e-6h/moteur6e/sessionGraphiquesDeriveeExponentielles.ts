/**
 * Couche B (6e) — moteur de session pour `6gen8`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionGraphiquesDeriveeExponentielles.test.ts` pour la preuve avec
 * un exercice factice défini localement.
 */
import type { ExerciceGraphiqueDeriveeExponentielle } from "../core6e/graphiquesDeriveeExponentielles.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesGraphiquesDeriveeExponentielles";
import type { EtatSessionGraphiqueDeriveeExponentielle, PhaseGraphiqueDeriveeExponentielle, ResultatExerciceGraphiqueDeriveeExponentielle } from "./typesGraphiquesDeriveeExponentielles";
import { verifierEcranDerivee, verifierEcranSelection } from "./verificationGraphiquesDeriveeExponentielles";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur les 2 écrans possibles (spec : "Aides (2 niveaux)" pour chaque écran de
 * chaque famille). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceGraphiqueDeriveeExponentielle,
): Pick<EtatSessionGraphiqueDeriveeExponentielle, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreDeriveePartiel" | "derniereTransitionRevelee"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoreDeriveePartiel: null,
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionGraphiqueDeriveeExponentielle(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceGraphiqueDeriveeExponentielle,
): EtatSessionGraphiqueDeriveeExponentielle {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionGraphiqueDeriveeExponentielle): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionGraphiqueDeriveeExponentielle): EtatSessionGraphiqueDeriveeExponentielle {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionGraphiqueDeriveeExponentielle, resultat: ResultatExerciceGraphiqueDeriveeExponentielle): EtatSessionGraphiqueDeriveeExponentielle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

function avancerPhase<TReponse>(
  etat: EtatSessionGraphiqueDeriveeExponentielle,
  reponse: TReponse,
  verifier: (exercice: ExerciceGraphiqueDeriveeExponentielle, reponse: TReponse) => boolean,
  phaseAttendue: PhaseGraphiqueDeriveeExponentielle,
): EtatSessionGraphiqueDeriveeExponentielle {
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
    const resultat: ResultatExerciceGraphiqueDeriveeExponentielle = { exercice, scoreDerivee: etat.scoreDeriveePartiel, scoreSelection: score };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoreDeriveePartiel: score, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}

export function soumettreReponseDerivee(etat: EtatSessionGraphiqueDeriveeExponentielle, texte: string): EtatSessionGraphiqueDeriveeExponentielle {
  return avancerPhase(etat, texte, verifierEcranDerivee, "derivee");
}

export function soumettreReponseSelection(etat: EtatSessionGraphiqueDeriveeExponentielle, indexChoisi: number): EtatSessionGraphiqueDeriveeExponentielle {
  return avancerPhase(etat, indexChoisi, verifierEcranSelection, "selection");
}
