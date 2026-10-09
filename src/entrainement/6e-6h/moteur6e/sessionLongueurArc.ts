import type { ExerciceLongueurArc } from "../core6e/longueurArc.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesLongueurArc";
import type { EtatSessionLongueurArc, PhaseLongueurArc, ResultatExerciceLongueurArc } from "./typesLongueurArc";
import { verifierEcran } from "./verificationLongueurArc";

/**
 * Couche B (6e) — moteur de session pour `6gen28`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionLongueurArc.test.ts` (fixtures locales factices) et
 * `generateurs6e/longueurArc/session.integration.test.ts` pour la preuve. Mirroir structurel de
 * `sessionCalculPrimitives.ts`/`sessionCalculAires.ts`, jamais importé (chaque générateur garde son
 * propre moteur de session — CLAUDE.md, "Pas de moteur de session unifié").
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur les écrans qui en prévoient (spec explicite : écran 2 famille A, écran 1
 * famille B, écran 2 famille C — les autres écrans n'en ont pas prévu, `max=0` côté
 * `ui6e/formatLongueurArc.ts`). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceLongueurArc): Pick<EtatSessionLongueurArc, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionCalculLongueurArc(reglages: ReglagesSession6e, generateur: () => ExerciceLongueurArc): EtatSessionLongueurArc {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLongueurArc): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionLongueurArc): EtatSessionLongueurArc {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLongueurArc, resultat: ResultatExerciceLongueurArc): EtatSessionLongueurArc {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionLongueurArc, valeurs: string[]): EtatSessionLongueurArc {
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
  const scoresPartiels: Partial<Record<PhaseLongueurArc, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceLongueurArc = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
