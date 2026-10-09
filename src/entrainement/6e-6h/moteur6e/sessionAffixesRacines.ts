import type { ExerciceAffixesRacines } from "../core6e/affixesRacines.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesAffixesRacines";
import type { EtatSessionAffixesRacines, PhaseAffixesRacines, ResultatExerciceAffixesRacines } from "./typesAffixesRacines";
import { verifierEcran } from "./verificationAffixesRacines";

/**
 * Couche B (6e) — moteur de session pour `6gen35`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionAffixesRacines.test.ts` (fixtures locales factices) et
 * `generateurs6e/affixesRacines/session.integration.test.ts` pour la preuve. Mirroir structurel de
 * `sessionNombresComplexes.ts` (6gen34), jamais importé (chaque générateur garde son propre moteur
 * de session — CLAUDE.md, "Pas de moteur de session unifié"). Les réponses soumises pour un écran
 * QCM (`bEcran1`/`cEcran1`) sont représentées comme `[id]`, un tableau à 1 élément comme n'importe
 * quel autre écran — voir en-tête `verificationAffixesRacines.ts`.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur tous les écrans qui en prévoient (spec : écran unique de A, écran 1 de
 * B, écrans 2 et 3 de C — `max=0` pour bEcran2 et cEcran1, voir `ui6e/formatAffixesRacines.ts`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceAffixesRacines): Pick<EtatSessionAffixesRacines, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionAffixesRacines(reglages: ReglagesSession6e, generateur: () => ExerciceAffixesRacines): EtatSessionAffixesRacines {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionAffixesRacines): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionAffixesRacines): EtatSessionAffixesRacines {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionAffixesRacines, resultat: ResultatExerciceAffixesRacines): EtatSessionAffixesRacines {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionAffixesRacines, valeurs: string[]): EtatSessionAffixesRacines {
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
  const scoresPartiels: Partial<Record<PhaseAffixesRacines, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceAffixesRacines = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
