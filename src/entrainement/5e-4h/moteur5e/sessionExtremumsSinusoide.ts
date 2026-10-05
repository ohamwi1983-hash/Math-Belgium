/**
 * Couche B (5e) — moteur de session pour 5gen11 ("Extremums d'une fonction sinusoïdale"). N'importe
 * jamais rien de `src/generateurs5e/` — voir `sessionExtremumsSinusoide.test.ts` pour la preuve avec
 * un exercice factice défini localement.
 *
 * Séquence FIXE à 3 écrans (poser l'équation, isoler x, solutions bonus), jamais de saut
 * conditionnel — le générateur garantit déjà (reroll borné) entre 1 et 5 solutions, donc l'écran 3
 * est toujours atteignable. Plafond d'aide PAR PHASE (`niveauAideMaxExtremums`, B.1/B.2) — jamais
 * uniforme : "poserEquation" (1 seul niveau, le niveau 2 a été retiré), "isolerX" (0, aucune aide
 * du tout), "solutions" (2, inchangé — le niveau 2 y positionne le cercle trigonométrique).
 */
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesExtremumsSinusoide";
import type { EtatSessionExtremumsSinusoide, PhaseExtremumsSinusoide, ResultatExerciceExtremumsSinusoide } from "./typesExtremumsSinusoide";
import { diagnostiquerIsolerXExtremum, diagnostiquerPoserEquationExtremum, diagnostiquerSolutionsExtremum } from "./verificationExtremumsSinusoide";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Plafond HISTORIQUE (2 niveaux), toujours le plafond de l'écran "solutions" — plus jamais utilisé
 * nu ailleurs, voir `niveauAideMaxExtremums`. */
export const NIVEAU_AIDE_MAX_EXTREMUMS = 2;

/** Plafond d'aide PAR PHASE (B.1/B.2) — remplace l'usage nu de `NIVEAU_AIDE_MAX_EXTREMUMS` (toujours
 * 2) : "poserEquation" perd son niveau 2 (le texte substitué qu'il donnait n'a plus de sens, la
 * réponse attendue étant désormais cette même formule substituée) ; "isolerX" perd l'aide
 * ENTIÈREMENT (0, pas de bouton du tout) ; "solutions" garde le plafond historique (2, le niveau 2
 * y positionne le cercle trigonométrique — voir `EtapeSolutionsExtremum.tsx`). */
export function niveauAideMaxExtremums(phase: PhaseExtremumsSinusoide): number {
  if (phase === "poserEquation") return 1;
  if (phase === "isolerX") return 0;
  return NIVEAU_AIDE_MAX_EXTREMUMS;
}

function etatInitial(exercice: ExerciceExtremumsSinusoide): Pick<EtatSessionExtremumsSinusoide, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scorePoserEquationPartiel" | "scoreIsolerXPartiel"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scorePoserEquationPartiel: null,
    scoreIsolerXPartiel: null,
  };
}

export function demarrerSessionExtremumsSinusoide(reglages: ReglagesSession5e, generateur: () => ExerciceExtremumsSinusoide): EtatSessionExtremumsSinusoide {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionExtremumsSinusoide): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionExtremumsSinusoide): EtatSessionExtremumsSinusoide {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxExtremums(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionExtremumsSinusoide, resultat: ResultatExerciceExtremumsSinusoide, revele: boolean): EtatSessionExtremumsSinusoide {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionExtremumsSinusoide, phaseAttendue: PhaseExtremumsSinusoide, reponse: T, verifier: (r: T) => boolean): EtatSessionExtremumsSinusoide {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  // A.1 : capturer `revele` sur cette variable locale FRAÎCHE, AVANT toute transition — jamais lu
  // plus tard sur `etat.etapeCourante` (pré-soumission, structurellement toujours `false`).
  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres(phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(
      etat,
      {
        exercice: etat.exerciceCourant,
        scorePoserEquation: etat.scorePoserEquationPartiel as number,
        scoreIsolerX: etat.scoreIsolerXPartiel as number,
        scoreSolutions: score,
      },
      revele,
    );
  }

  const partielsMisAJour: Partial<EtatSessionExtremumsSinusoide> = {};
  if (phaseAttendue === "poserEquation") partielsMisAJour.scorePoserEquationPartiel = score;
  else if (phaseAttendue === "isolerX") partielsMisAJour.scoreIsolerXPartiel = score;

  return { ...etat, ...partielsMisAJour, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereEtapeRevelee: revele };
}

export function soumettreReponsePoserEquation(etat: EtatSessionExtremumsSinusoide, texte: string): EtatSessionExtremumsSinusoide {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "poserEquation", texte, (t) => diagnostiquerPoserEquationExtremum(exercice, t) === "correct");
}

export function soumettreReponseIsolerX(etat: EtatSessionExtremumsSinusoide, texte: string): EtatSessionExtremumsSinusoide {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "isolerX", texte, (t) => diagnostiquerIsolerXExtremum(exercice, t) === "correct");
}

export function soumettreReponseSolutions(etat: EtatSessionExtremumsSinusoide, textes: string[]): EtatSessionExtremumsSinusoide {
  const exercice = etat.exerciceCourant;
  return soumettreEcran(etat, "solutions", textes, (t) => diagnostiquerSolutionsExtremum(exercice, t) === "correct");
}
