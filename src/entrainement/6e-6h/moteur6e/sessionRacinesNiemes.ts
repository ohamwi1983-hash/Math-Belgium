import type { ExerciceRacinesNiemes } from "../core6e/racinesNiemes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesRacinesNiemes";
import type { EtatSessionRacinesNiemes, PhaseRacinesNiemes, ResultatExerciceRacinesNiemes } from "./typesRacinesNiemes";
import { verifierEcran } from "./verificationRacinesNiemes";

/**
 * Couche B (6e) — moteur de session pour `6gen39`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionRacinesNiemes.test.ts` (fixtures locales factices) et
 * `generateurs6e/racinesNiemes/session.integration.test.ts` pour la preuve. Mirroir structurel de
 * `sessionFormeTrigonometrique.ts` (6gen37), jamais importé (chaque générateur garde son propre
 * moteur de session — CLAUDE.md, "Pas de moteur de session unifié").
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient (aEcran2, bEcran2, cEcran1 — voir
 * `ui6e/formatRacinesNiemes.ts`, `niveauAideMaxEcran`) — `max=0` ailleurs. */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceRacinesNiemes): Pick<EtatSessionRacinesNiemes, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionRacinesNiemes(reglages: ReglagesSession6e, generateur: () => ExerciceRacinesNiemes): EtatSessionRacinesNiemes {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionRacinesNiemes): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionRacinesNiemes): EtatSessionRacinesNiemes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionRacinesNiemes, resultat: ResultatExerciceRacinesNiemes): EtatSessionRacinesNiemes {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionRacinesNiemes, valeurs: string[]): EtatSessionRacinesNiemes {
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
  const scoresPartiels: Partial<Record<PhaseRacinesNiemes, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceRacinesNiemes = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
