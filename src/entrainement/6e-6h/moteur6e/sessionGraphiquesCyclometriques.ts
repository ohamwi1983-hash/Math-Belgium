/**
 * Couche B (6e) — moteur de session pour `6gen5`. N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionGraphiquesCyclometriques.test.ts` pour la preuve avec un
 * exercice factice défini localement.
 *
 * **REFONTE — écran unique** : un seul `soumettreReponseEcranUnique` par exercice (lettre + 6
 * sous-réponses de justification soumises ensemble, une seule tentative pour l'ensemble du bloc —
 * même mécanique que l'écran "bijection" de 6gen1). Remplace `soumettreReponseCalcul`/
 * `soumettreReponseSelection` et la notion de phase.
 */
import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionGraphiquesCyclometriques, ResultatExerciceGraphiquesCyclometriques } from "./typesGraphiquesCyclometriques";
import type { ReponseEcranUniqueGraphiquesCyclometriques } from "./verificationGraphiquesCyclometriques";
import { verifierEcranUnique } from "./verificationGraphiquesCyclometriques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur l'écran unique. */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceGraphiquesCyclometriques): Pick<EtatSessionGraphiquesCyclometriques, "exerciceCourant" | "etapeCourante" | "niveauAide"> {
  return { exerciceCourant: exercice, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0 };
}

export function demarrerSessionGraphiquesCyclometriques(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceGraphiquesCyclometriques,
): EtatSessionGraphiquesCyclometriques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionGraphiquesCyclometriques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionGraphiquesCyclometriques): EtatSessionGraphiquesCyclometriques {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionGraphiquesCyclometriques, resultat: ResultatExerciceGraphiquesCyclometriques): EtatSessionGraphiquesCyclometriques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseEcranUnique(
  etat: EtatSessionGraphiquesCyclometriques,
  reponse: ReponseEcranUniqueGraphiquesCyclometriques,
): EtatSessionGraphiquesCyclometriques {
  if (etat.terminee) throw new Error("soumettreReponseEcranUnique : la session est déjà terminée");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseEcranUniqueGraphiquesCyclometriques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcranUnique(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, derniereRevelee: false };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const etatAvecRevele = { ...etat, derniereRevelee: etapeCourante.revelee };
  const resultat: ResultatExerciceGraphiquesCyclometriques = { exercice, score };
  return cloturerExerciceOuSuivant(etatAvecRevele, resultat);
}
