import type { ExerciceProprietesOptiquesConiques } from "../core6e/proprietesOptiquesConiques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesProprietesOptiquesConiques";
import type { EtatSessionProprietesOptiquesConiques, PhaseProprietesOptiquesConiques, ResultatExerciceProprietesOptiquesConiques } from "./typesProprietesOptiquesConiques";
import { verifierEcran } from "./verificationProprietesOptiquesConiques";

/**
 * Couche B (6e) — moteur de session pour `6gen63`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `generateurs6e/proprietesOptiquesConiques/session.integration.test.ts` pour le seul fichier
 * autorisé Couche A + Couche B ensemble. Mirroir structurel de `sessionIntersectionsConiques.ts`
 * (6gen61)/`sessionTangentesConique.ts` (6gen62), jamais importé (chaque générateur garde son propre
 * moteur de session — CLAUDE.md).
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans 3 et 4 — `max=0` ailleurs (voir
 * `ui6e/formatProprietesOptiquesConiques.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceProprietesOptiquesConiques): Pick<EtatSessionProprietesOptiquesConiques, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionProprietesOptiquesConiques(reglages: ReglagesSession6e, generateur: () => ExerciceProprietesOptiquesConiques): EtatSessionProprietesOptiquesConiques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionProprietesOptiquesConiques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionProprietesOptiquesConiques): EtatSessionProprietesOptiquesConiques {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionProprietesOptiquesConiques, resultat: ResultatExerciceProprietesOptiquesConiques): EtatSessionProprietesOptiquesConiques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionProprietesOptiquesConiques, valeurs: string[]): EtatSessionProprietesOptiquesConiques {
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
  const scoresPartiels: Partial<Record<PhaseProprietesOptiquesConiques, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceProprietesOptiquesConiques = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
