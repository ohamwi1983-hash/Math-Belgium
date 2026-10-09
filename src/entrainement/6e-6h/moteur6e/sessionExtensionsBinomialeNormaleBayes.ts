import type { ExerciceExtensionsBinomialeNormaleBayes } from "../core6e/extensionsBinomialeNormaleBayes.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { CalculerReferenceExtensionsBinomialeNormaleBayes, EtatSessionExtensionsBinomialeNormaleBayes, PhaseExtensionsBinomialeNormaleBayes, ResultatExerciceExtensionsBinomialeNormaleBayes } from "./typesExtensionsBinomialeNormaleBayes";
import { phaseApres, phaseInitiale } from "./typesExtensionsBinomialeNormaleBayes";
import { verifierEcran } from "./verificationExtensionsBinomialeNormaleBayes";

/**
 * Couche B (6e) — moteur de session pour `6gen52`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionExtensionsBinomialeNormaleBayes.test.ts` (fixtures + `calculerReference` factice
 * locale) et `generateurs6e/extensionsBinomialeNormaleBayes/session.integration.test.ts` pour la
 * preuve. Mirroir structurel de `sessionLoiNormale.ts` (6gen51), jamais importé (chaque générateur
 * garde son propre moteur de session — CLAUDE.md, "Pas de moteur de session unifié").
 * `calculerReference` : voir en-tête `typesExtensionsBinomialeNormaleBayes.ts`.
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatExtensionsBinomialeNormaleBayes.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

/** Compteur GLOBAL au module (jamais réinitialisé par exercice/session) — voir `generationId`,
 * `typesExtensionsBinomialeNormaleBayes.ts`, pour la justification (famille B, nombre de champs
 * variable à phase constante). */
let prochainGenerationId = 0;

function etatInitial(exercice: ExerciceExtensionsBinomialeNormaleBayes): Pick<EtatSessionExtensionsBinomialeNormaleBayes, "exerciceCourant" | "phase" | "generationId" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), generationId: prochainGenerationId++, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionExtensionsBinomialeNormaleBayes(reglages: ReglagesSession6e, generateur: () => ExerciceExtensionsBinomialeNormaleBayes, calculerReference: CalculerReferenceExtensionsBinomialeNormaleBayes): EtatSessionExtensionsBinomialeNormaleBayes {
  return { reglages, generateur, calculerReference, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionExtensionsBinomialeNormaleBayes): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionExtensionsBinomialeNormaleBayes): EtatSessionExtensionsBinomialeNormaleBayes {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionExtensionsBinomialeNormaleBayes, resultat: ResultatExerciceExtensionsBinomialeNormaleBayes): EtatSessionExtensionsBinomialeNormaleBayes {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionExtensionsBinomialeNormaleBayes, valeurs: string[]): EtatSessionExtensionsBinomialeNormaleBayes {
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
  const scoresPartiels: Partial<Record<PhaseExtensionsBinomialeNormaleBayes, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceExtensionsBinomialeNormaleBayes = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
