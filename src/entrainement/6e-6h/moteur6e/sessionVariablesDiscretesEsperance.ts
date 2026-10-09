import type { ExerciceVariablesDiscretesEsperance } from "../core6e/variablesDiscretesEsperance.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesVariablesDiscretesEsperance";
import type { EtatSessionVariablesDiscretesEsperance, PhaseVariablesDiscretesEsperance, ResultatExerciceVariablesDiscretesEsperance } from "./typesVariablesDiscretesEsperance";
import { verifierEcran } from "./verificationVariablesDiscretesEsperance";

/**
 * Couche B (6e) — moteur de session pour `6gen49`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionVariablesDiscretesEsperance.test.ts` (fixtures locales) et
 * `generateurs6e/variablesDiscretesEsperance/session.integration.test.ts` pour le seul fichier
 * autorisé. Mirroir structurel de `sessionDenombrementFondamental.ts` (6gen43), jamais importé
 * (chaque générateur garde son propre moteur de session — CLAUDE.md, "Pas de moteur de session
 * unifié").
 */

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide max sur les écrans qui en prévoient — `max=0` ailleurs (voir
 * `ui6e/formatVariablesDiscretesEsperance.ts`, `niveauAideMaxEcran`). */
export const NIVEAU_AIDE_MAX = 2;

/**
 * Compteur GLOBAL au module (jamais réinitialisé par exercice/session) — voir `generationId` dans
 * `typesVariablesDiscretesEsperance.ts` pour le contrat complet et le bug qu'il évite (mirroir
 * `6gen48`, `sessionBinomialeSequenceOrdonnee.ts`) : la famille B démarre TOUJOURS sur la même phase
 * `"bEcran1"` quel que soit le sous-type/le tirage, alors que le NOMBRE DE CHAMPS de cet écran varie
 * (2×(m) champs, `m`∈[3,4] pour "contexteDirect", ou dépendant de la taille du support pour
 * "hypergeometrique") — sans cet identifiant dans la clé React, 2 exercices consécutifs de famille B
 * à `m`/support différent partageraient la même clé, React ne remonterait pas le composant écran, et
 * son état interne `valeurs` resterait bloqué à l'ancienne taille.
 */
let prochainGenerationId = 0;

function etatInitial(exercice: ExerciceVariablesDiscretesEsperance): Pick<EtatSessionVariablesDiscretesEsperance, "exerciceCourant" | "phase" | "generationId" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "derniereTransitionRevelee"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), generationId: prochainGenerationId++, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, derniereTransitionRevelee: false };
}

export function demarrerSessionVariablesDiscretesEsperance(reglages: ReglagesSession6e, generateur: () => ExerciceVariablesDiscretesEsperance): EtatSessionVariablesDiscretesEsperance {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionVariablesDiscretesEsperance): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionVariablesDiscretesEsperance): EtatSessionVariablesDiscretesEsperance {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionVariablesDiscretesEsperance, resultat: ResultatExerciceVariablesDiscretesEsperance): EtatSessionVariablesDiscretesEsperance {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionVariablesDiscretesEsperance, valeurs: string[]): EtatSessionVariablesDiscretesEsperance {
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
  const scoresPartiels: Partial<Record<PhaseVariablesDiscretesEsperance, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceVariablesDiscretesEsperance = { exercice, scores: scoresPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
