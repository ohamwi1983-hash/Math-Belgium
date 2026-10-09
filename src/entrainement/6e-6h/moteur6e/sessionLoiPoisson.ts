import type { ExerciceLoiPoisson } from "../core6e/loiPoisson.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesLoiPoisson";
import type { EtatSessionLoiPoisson, PhaseLoiPoisson, ResultatExerciceLoiPoisson } from "./typesLoiPoisson";
import { verifierEcran } from "./verificationLoiPoisson";

/**
 * Couche B (6e) — moteur de session pour `6gen53`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionLoiPoisson.test.ts` (fixtures locales) et `generateurs6e/loiPoisson/
 * session.integration.test.ts` pour le seul fichier autorisé. Mirroir structurel de
 * `sessionLoiBinomiale.ts` (6gen50), jamais importé (chaque générateur garde son propre moteur de
 * session — CLAUDE.md, "Pas de moteur de session unifié").
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatLoiPoisson.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

/** Compteur GLOBAL au module (jamais réinitialisé par exercice/session) — voir `generationId`
 * (`moteur6e/typesLoiPoisson.ts`) pour le contrat complet : même pitfall que `6gen48`/`6gen50`, la
 * famille B a un nombre de CHAMPS variable à phase de départ constante selon la longueur de
 * `termesACalculer`. `App6gen53.tsx` DOIT combiner `generationId` et `phase` dans sa clé React. */
let prochainGenerationId = 0;

function etatInitial(exercice: ExerciceLoiPoisson): Pick<EtatSessionLoiPoisson, "exerciceCourant" | "phase" | "generationId" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), generationId: prochainGenerationId++, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionLoiPoisson(reglages: ReglagesSession6e, generateur: () => ExerciceLoiPoisson): EtatSessionLoiPoisson {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLoiPoisson): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionLoiPoisson): EtatSessionLoiPoisson {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLoiPoisson, resultat: ResultatExerciceLoiPoisson): EtatSessionLoiPoisson {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionLoiPoisson, valeurs: string[]): EtatSessionLoiPoisson {
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
  const scoresPartiels: Partial<Record<PhaseLoiPoisson, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceLoiPoisson = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
