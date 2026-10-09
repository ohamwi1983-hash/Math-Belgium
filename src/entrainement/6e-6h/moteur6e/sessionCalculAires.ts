import type { ExerciceCalculAires } from "../core6e/calculAires.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesCalculAires";
import type { EtatSessionCalculAires, PhaseCalculAires, ResultatExerciceCalculAires } from "./typesCalculAires";
import { verifierEcran } from "./verificationCalculAires";

/**
 * Couche B (6e) — moteur de session pour `6gen26`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionCalculAires.test.ts` (fixtures locales factices) et
 * `generateurs6e/calculAires/session.integration.test.ts` pour la preuve. Mirroir structurel de
 * `sessionCalculPrimitives.ts` (6gen23), jamais importé (chaque générateur garde son propre moteur
 * de session — CLAUDE.md, "Pas de moteur de session unifié").
 *
 * **UNE SEULE fonction de soumission** (`soumettreReponseEcran(etat, valeurs)`) — `etat.phase` porte
 * déjà l'information de "quel écran", `verifierEcran` (dispatcher générique) sait déjà quoi
 * vérifier.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur les écrans qui en prévoient (spec explicite : écran 1 famille B, écran 4
 * famille C, écran 2 famille D — les autres écrans n'en ont pas prévu). `NIVEAU_AIDE_MAX` reste
 * commun à 2 (plafond global) : un écran sans aide prévue expose `aideNiveau1/2` à `max=0`
 * ponctuellement côté `ui6e/formatCalculAires.ts` (convention "max=0 → pas de bouton", CLAUDE.md) —
 * jamais un plafond variable par écran ici (resterait à gérer côté UI de toute façon). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceCalculAires): Pick<EtatSessionCalculAires, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionCalculAires(reglages: ReglagesSession6e, generateur: () => ExerciceCalculAires): EtatSessionCalculAires {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionCalculAires): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionCalculAires): EtatSessionCalculAires {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionCalculAires, resultat: ResultatExerciceCalculAires): EtatSessionCalculAires {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionCalculAires, valeurs: string[]): EtatSessionCalculAires {
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
  const scoresPartiels: Partial<Record<PhaseCalculAires, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante, exercice);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceCalculAires = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
