/**
 * Couche B (5e) — moteur de session pour 5gen18 ("Comparaison numérique de deux suites"). N'importe
 * jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceComparaisonSuites } from "../core5e/comparaisonSuites.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesComparaisonSuites";
import type { EtatSessionComparaisonSuites, ResultatExerciceComparaisonSuites } from "./typesComparaisonSuites";
import { diagnostiquerConclusion, diagnostiquerTableau } from "./verificationComparaisonSuites";
import type { ReponseConclusion } from "./verificationComparaisonSuites";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_COMPARAISON_SUITES = 2;

function etatInitial(exercice: ExerciceComparaisonSuites): Pick<EtatSessionComparaisonSuites, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoreTableauPartiel"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoreTableauPartiel: null };
}

export function demarrerSessionComparaisonSuites(reglages: ReglagesSession5e, generateur: () => ExerciceComparaisonSuites): EtatSessionComparaisonSuites {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionComparaisonSuites): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionComparaisonSuites): EtatSessionComparaisonSuites {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_COMPARAISON_SUITES) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionComparaisonSuites, resultat: ResultatExerciceComparaisonSuites, revele: boolean): EtatSessionComparaisonSuites {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

export function soumettreReponseTableau(etat: EtatSessionComparaisonSuites, textes: string[]): EtatSessionComparaisonSuites {
  if (etat.terminee || etat.phase !== "tableau") throw new Error("soumettreReponseTableau : la session n'est pas à l'étape 'tableau'");

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, textes, {
    ...reglagesEtape(etat),
    verifier: (t) => diagnostiquerTableau(t, etat.exerciceCourant) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: "conclusion", scoreTableauPartiel: score, derniereEtapeRevelee: revele };
}

export function soumettreReponseConclusion(etat: EtatSessionComparaisonSuites, reponse: ReponseConclusion): EtatSessionComparaisonSuites {
  if (etat.terminee || etat.phase !== "conclusion") throw new Error("soumettreReponseConclusion : la session n'est pas à l'étape 'conclusion'");
  if (etat.scoreTableauPartiel === null) throw new Error("soumettreReponseConclusion : score de l'écran 'tableau' manquant");

  const etapeCourante = soumettreEtapeTentatives<ReponseConclusion>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => diagnostiquerConclusion(r, etat.exerciceCourant) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const phaseSuivante = phaseApres("conclusion");
  if (phaseSuivante !== "termine") throw new Error("soumettreReponseConclusion : séquence inattendue après 'conclusion'");

  return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scoreTableau: etat.scoreTableauPartiel, scoreConclusion: score }, revele);
}
