import type { ExerciceLoiNormale } from "../core6e/loiNormale.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { CalculerReferenceLoiNormale, EtatSessionLoiNormale, PhaseLoiNormale, ResultatExerciceLoiNormale } from "./typesLoiNormale";
import { phaseApres, phaseInitiale } from "./typesLoiNormale";
import { verifierEcran } from "./verificationLoiNormale";

/**
 * Couche B (6e) — moteur de session pour `6gen51`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionLoiNormale.test.ts` (fixtures + `calculerReference` factices locales) et
 * `generateurs6e/loiNormale/session.integration.test.ts` pour la preuve. Mirroir structurel de
 * `sessionCalculAires.ts` (6gen26), jamais importé (chaque générateur garde son propre moteur de
 * session — CLAUDE.md, "Pas de moteur de session unifié"). `calculerReference` : voir en-tête
 * `typesLoiNormale.ts`.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatLoiNormale.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceLoiNormale): Pick<EtatSessionLoiNormale, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionLoiNormale(reglages: ReglagesSession6e, generateur: () => ExerciceLoiNormale, calculerReference: CalculerReferenceLoiNormale): EtatSessionLoiNormale {
  return { reglages, generateur, calculerReference, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLoiNormale): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionLoiNormale): EtatSessionLoiNormale {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLoiNormale, resultat: ResultatExerciceLoiNormale): EtatSessionLoiNormale {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionLoiNormale, valeurs: string[]): EtatSessionLoiNormale {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phaseCourante = etat.phase;
  const ref = etat.calculerReference(exercice, phaseCourante);

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phaseCourante, r, ref),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels: Partial<Record<PhaseLoiNormale, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante, exercice);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceLoiNormale = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
