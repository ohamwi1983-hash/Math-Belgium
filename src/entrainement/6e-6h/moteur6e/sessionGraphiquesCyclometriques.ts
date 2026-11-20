/**
 * Couche B (6e) — moteur de session pour `6gen5`. N'importe jamais rien de `src/generateurs6e/`.
 *
 * Écran unique en deux temps (audit du 6e ch. 1, lot B, G2 — voir `typesGraphiquesCyclometriques.ts`) :
 * `soumettreLettre` (choix du graphique, une tentative) puis `soumettreReponseEcranUnique`
 * (justification, trois tentatives ; parité jugée une seule fois).
 */
import type { ExerciceGraphiquesCyclometriques } from "../core6e/graphiquesCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionGraphiquesCyclometriques, ResultatExerciceGraphiquesCyclometriques } from "./typesGraphiquesCyclometriques";
import type { ReponseEcranUniqueGraphiquesCyclometriques } from "./verificationGraphiquesCyclometriques";
import { verifierEcranUnique } from "./verificationGraphiquesCyclometriques";

const POINTS_DE_BASE = 100;

/** 2 niveaux d'aide sur l'écran unique. */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(
  exercice: ExerciceGraphiquesCyclometriques,
): Pick<EtatSessionGraphiquesCyclometriques, "exerciceCourant" | "etapeCourante" | "niveauAide" | "lettreValidee" | "pariteRevelee"> {
  return { exerciceCourant: exercice, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, lettreValidee: false, pariteRevelee: false };
}

export function demarrerSessionGraphiquesCyclometriques(
  reglages: ReglagesSession6e,
  generateur: () => ExerciceGraphiquesCyclometriques,
): EtatSessionGraphiquesCyclometriques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionGraphiquesCyclometriques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
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

/**
 * Temps 1 — choix du graphique (choix fermé, une tentative) : juste, la justification s'ouvre sans
 * consommer de tentative ; faux, l'exercice se clôt, réponse révélée.
 */
export function soumettreLettre(etat: EtatSessionGraphiquesCyclometriques, lettre: number): EtatSessionGraphiquesCyclometriques {
  if (etat.terminee) throw new Error("soumettreLettre : la session est déjà terminée");
  if (lettre === etat.exerciceCourant.indexCorrect) return { ...etat, lettreValidee: true, derniereRevelee: false };
  return cloturerExerciceOuSuivant({ ...etat, derniereRevelee: true }, { exercice: etat.exerciceCourant, score: 0 });
}

/**
 * Temps 2 — justification (trois tentatives). La parité est un choix fermé : fausse une première
 * fois, elle est figée et révélée (`pariteRevelee`) sans clore l'écran ; les autres champs gardent
 * leurs tentatives. L'écran est « révélé » si la parité l'a été ou si les tentatives sont épuisées.
 */
export function soumettreReponseEcranUnique(
  etat: EtatSessionGraphiquesCyclometriques,
  reponse: ReponseEcranUniqueGraphiquesCyclometriques,
): EtatSessionGraphiquesCyclometriques {
  if (etat.terminee) throw new Error("soumettreReponseEcranUnique : la session est déjà terminée");
  const exercice = etat.exerciceCourant;
  const pariteRevelee = etat.pariteRevelee || reponse.parite !== exercice.proprietes.parite;
  // La lettre a été jugée au temps 1 ; la parité (choix fermé) ne l'est qu'une fois.
  const aJuger: ReponseEcranUniqueGraphiquesCyclometriques = { ...reponse, lettre: exercice.indexCorrect, parite: exercice.proprietes.parite };
  if (verifierEcranUnique(exercice, aJuger)) {
    return cloturerExerciceOuSuivant({ ...etat, pariteRevelee, derniereRevelee: pariteRevelee }, { exercice, score: pariteRevelee ? 0 : POINTS_DE_BASE });
  }
  const etapeCourante = soumettreEtapeTentatives<ReponseEcranUniqueGraphiquesCyclometriques>(etat.etapeCourante, aJuger, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierEcranUnique(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante, pariteRevelee, derniereRevelee: false };
  return cloturerExerciceOuSuivant({ ...etat, pariteRevelee, derniereRevelee: true }, { exercice, score: 0 });
}
