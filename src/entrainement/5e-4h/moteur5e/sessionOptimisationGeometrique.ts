/**
 * Couche B (5e) — moteur de session pour 5gen32 ("Optimisation géométrique"). N'importe jamais rien
 * de `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransOptimisation`, dépend uniquement de
 * `exercice.famille`) — aucune branche réactive dépendant d'une réponse élève. Un SEUL point
 * d'entrée `soumettreReponseEcran` (au lieu d'une fonction par écran) — voir le commentaire
 * d'architecture dans `typesOptimisationGeometrique.ts` pour la justification de cet écart.
 */
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { verifierEcran } from "./verificationOptimisationGeometrique";
import { ecranApres, ecranInitial } from "./typesOptimisationGeometrique";
import type { EcranOptimisation, EtatSessionOptimisation, ResultatExerciceOptimisation } from "./typesOptimisationGeometrique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_OPTIMISATION = 2;

export function niveauAideMaxOptimisation(): number {
  return NIVEAU_AIDE_MAX_OPTIMISATION;
}

function etatInitial(
  exercice: ExerciceOptimisation,
): Pick<EtatSessionOptimisation, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "dernieresReponsesParEcran"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, dernieresReponsesParEcran: {} };
}

export function demarrerSessionOptimisation(reglages: ReglagesSession5e, generateur: () => ExerciceOptimisation): EtatSessionOptimisation {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionOptimisation): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionOptimisation): EtatSessionOptimisation {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_OPTIMISATION) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionOptimisation, resultat: ResultatExerciceOptimisation, revele: boolean): EtatSessionOptimisation {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

/** Point d'entrée UNIQUE (voir tête de fichier) — `reponses` doit porter EXACTEMENT les clés
 * attendues par `verificationOptimisationGeometrique.ts::diagnostiquerEcran` pour
 * (`etat.exerciceCourant`, `etat.phase`), voir `ui5e/formatOptimisationGeometrique.ts::champsEcran`. */
export function soumettreReponseEcran(etat: EtatSessionOptimisation, reponses: Record<string, string>): EtatSessionOptimisation {
  if (etat.terminee) throw new Error("soumettreReponseEcran : la session est déjà terminée");
  const phaseCourante: EcranOptimisation = etat.phase;
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<Record<string, string>>(etat.etapeCourante, reponses, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcran(exercice, phaseCourante, r),
    revelerReponse: () => {},
  });
  const dernieresReponsesParEcran = { ...etat.dernieresReponsesParEcran, [phaseCourante]: reponses };
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, dernieresReponsesParEcran };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [phaseCourante]: score };
  const ecranSuivant = ecranApres(exercice, phaseCourante);

  if (ecranSuivant === "termine") {
    return cloturerExerciceOuSuivant({ ...etat, dernieresReponsesParEcran }, { exercice, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant, scoresPartiels, dernieresReponsesParEcran, derniereEtapeRevelee: revele };
}
