/**
 * Couche B (6e) — moteur de session pour `6gen13`. N'importe jamais rien de `src/generateurs6e/`
 * — voir `sessionProprietesLogarithme.test.ts` pour la preuve avec un exercice factice défini
 * localement (même principe que `sessionFonctionsCyclometriques.ts`, 6gen2).
 */
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesProprietesLogarithme";
import type { EtatSessionProprietesLogarithme, PhaseProprietesLogarithme, ResultatExerciceProprietesLogarithme } from "./typesProprietesLogarithme";
import { verifierEcran1, verifierEcran2 } from "./verificationProprietesLogarithme";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur les 2 écrans (spec explicite). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceProprieteLogarithme,
): Pick<EtatSessionProprietesLogarithme, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreEcran1Partiel" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoreEcran1Partiel: null, derniereTransitionRevelee: false };
}

export function demarrerSessionProprietesLogarithme(reglages: ReglagesSession6e, generateur: () => ExerciceProprieteLogarithme): EtatSessionProprietesLogarithme {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProprietesLogarithme): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
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

function avancerPhase(
  etat: EtatSessionProprietesLogarithme,
  texte: string,
  verifier: (exercice: ExerciceProprieteLogarithme, texte: string) => boolean,
  phaseAttendue: PhaseProprietesLogarithme,
): EtatSessionProprietesLogarithme {
  if (etat.terminee) throw new Error("soumettreReponse : la session est déjà terminée");
  if (etat.phase !== phaseAttendue) throw new Error(`soumettreReponse : attendu à la phase "${phaseAttendue}", trouvé "${etat.phase}"`);
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifier(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceProprietesLogarithme = { exercice, scoreEcran1: etat.scoreEcran1Partiel as number, scoreEcran2: score };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoreEcran1Partiel: score, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}

export function soumettreReponseEcran1(etat: EtatSessionProprietesLogarithme, texte: string): EtatSessionProprietesLogarithme {
  return avancerPhase(etat, texte, verifierEcran1, "ecran1");
}

export function soumettreReponseEcran2(etat: EtatSessionProprietesLogarithme, texte: string): EtatSessionProprietesLogarithme {
  return avancerPhase(etat, texte, verifierEcran2, "ecran2");
}
