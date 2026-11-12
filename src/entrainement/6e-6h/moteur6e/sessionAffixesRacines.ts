import type { ExerciceAffixesRacines } from "../core6e/affixesRacines.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesAffixesRacines";
import type { EtatSessionAffixesRacines, PhaseAffixesRacines, ResultatExerciceAffixesRacines } from "./typesAffixesRacines";
import { verifierEcran, xOpposeSaisi } from "./verificationAffixesRacines";

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

/** 2 niveaux d'aide max sur tous les écrans qui en prévoient (spec : écran unique de A, écran 1 de
 * B, écrans 2 et 3 de C — `max=0` pour bEcran2 et cEcran1, voir `ui6e/formatAffixesRacines.ts`). */
export const NIVEAU_AIDE_MAX = 2;

/** Une seule tentative sur un choix fermé (audit 6e ch. 5, point 6) : avec 3 tentatives sur 4
 * options, l'élimination suffisait à « réussir » sans comprendre. Saisies libres :
 * `reglages.tentativesMax`. */
export const TENTATIVES_CHOIX_FERME = 1;
const PHASES_CHOIX_FERME: ReadonlySet<PhaseAffixesRacines> = new Set(["bEcran1", "cEcran1"]);

export function tentativesMaxPhase(etat: Pick<EtatSessionAffixesRacines, "phase" | "reglages">): number {
  return PHASES_CHOIX_FERME.has(etat.phase) ? TENTATIVES_CHOIX_FERME : etat.reglages.tentativesMax;
}

function etatInitial(
  exercice: ExerciceAffixesRacines,
): Pick<EtatSessionAffixesRacines, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "derniereTransitionRevelee"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
    derniereTransitionRevelee: false,
  };
}

export function demarrerSessionAffixesRacines(reglages: ReglagesSession6e, generateur: () => ExerciceAffixesRacines): EtatSessionAffixesRacines {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionAffixesRacines): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxPhase(etat) };
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
  // Famille C, écran 2 : −x est accepté — la suite part de la valeur de l'élève.
  let exerciceSuivi = exercice;
  if (!revele && phaseCourante === "cEcran2" && exercice.famille === "C") {
    const xOppose = xOpposeSaisi(exercice, valeurs);
    if (xOppose !== null) exerciceSuivi = { ...exercice, xRetenu: xOppose };
  }
  const score = etapeCourante.score as number;
  const scoresPartiels: Partial<Record<PhaseAffixesRacines, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const revelesPartiels: Partial<Record<PhaseAffixesRacines, boolean>> = { ...etat.revelesPartiels, [phaseCourante]: revele };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceAffixesRacines = { exercice, scores: scoresPartiels, revelesPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, exerciceCourant: exerciceSuivi, scoresPartiels, revelesPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
