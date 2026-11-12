import type { ExerciceComplexesAvances } from "../core6e/complexesAvances.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesComplexesAvances";
import type { EtatSessionComplexesAvances, PhaseComplexesAvances, ResultatExerciceComplexesAvances } from "./typesComplexesAvances";
import { diagnostiquerEcran, verifierEcran } from "./verificationComplexesAvances";

/**
 * Couche B (6e) — moteur de session pour `6gen42`. N'importe jamais rien de `src/generateurs6e/` —
 * voir `sessionComplexesAvances.test.ts` (fixtures locales factices) et
 * `generateurs6e/complexesAvances/session.integration.test.ts` pour le seul fichier autorisé
 * Couche A + Couche B ensemble. Mirroir structurel de `sessionTransformationsPlan.ts` (6gen40).
 */

const POINTS_DE_BASE = 100;

export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceComplexesAvances,
): Pick<EtatSessionComplexesAvances, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels" | "derniereTransitionRevelee"> {
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

export function demarrerSessionComplexesAvances(reglages: ReglagesSession6e, generateur: () => ExerciceComplexesAvances): EtatSessionComplexesAvances {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

/** Écrans à choix fermé (QCM) : UNE seule tentative (convention « une tentative pour un choix
 * fermé », audit 6e ch. 5) — sinon il suffit d'essayer les options une à une. */
const PHASES_CHOIX_FERME: ReadonlySet<PhaseComplexesAvances> = new Set(["aEcran1", "aEcran2", "aEcran3", "cEcran3", "eEcran3"]);

export function tentativesMaxEcran(etat: EtatSessionComplexesAvances): number {
  return PHASES_CHOIX_FERME.has(etat.phase) ? 1 : etat.reglages.tentativesMax;
}

function reglagesEtape(etat: EtatSessionComplexesAvances): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: tentativesMaxEcran(etat) };
}

export function activerAideSuivante(etat: EtatSessionComplexesAvances): EtatSessionComplexesAvances {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionComplexesAvances, resultat: ResultatExerciceComplexesAvances): EtatSessionComplexesAvances {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcran(etat: EtatSessionComplexesAvances, valeurs: string[]): EtatSessionComplexesAvances {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const phaseCourante = etat.phase;

  // Saisie illisible : aucune tentative décomptée (l'écran affiche un message de syntaxe).
  if (diagnostiquerEcran(exercice, phaseCourante, valeurs) === "parse_error") return { ...etat, derniereTransitionRevelee: false };

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, valeurs, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phaseCourante, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereTransitionRevelee: false };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels: Partial<Record<PhaseComplexesAvances, number>> = { ...etat.scoresPartiels, [phaseCourante]: score };
  const revelesPartiels: Partial<Record<PhaseComplexesAvances, boolean>> = { ...etat.revelesPartiels, [phaseCourante]: revele };
  const phaseSuivante = phaseApres(phaseCourante);

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceComplexesAvances = { exercice, scores: scoresPartiels, revelesPartiels };
    return { ...cloturerExerciceOuSuivant(etat, resultat), derniereTransitionRevelee: revele };
  }

  return { ...etat, scoresPartiels, revelesPartiels, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, derniereTransitionRevelee: revele };
}
