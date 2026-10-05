/**
 * Couche B — moteur de session pour 5gen2 ("Décomposer une fonction composée"). Écran UNIQUE (pas
 * de phases multiples, contrairement à 5gen1) — voir `sessionDecompositionFonction.test.ts` pour la
 * preuve avec un générateur factice, jamais `src/generateurs5e/` importé ici.
 */
import type { ExerciceDecompositionFonction, GenerateurExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionDecompositionFonction, ResultatExerciceDecompositionFonction } from "./typesDecompositionFonction";
import { verifierDecomposition } from "./verificationDecompositionFonction";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Plafond d'aide DYNAMIQUE par exercice (même principe que gen17, 4e) : le niveau 3 ("cette
 * couche finale s'applique au résultat précédent, pas à x") n'a de sens que si la couche finale
 * est effectivement un habillage affine — 2 niveaux seulement sinon. */
export function niveauAideMaxDecomposition(exercice: ExerciceDecompositionFonction): number {
  return exercice.couches[exercice.couches.length - 1].estAffineFinale ? 3 : 2;
}

function etatInitial(exercice: ExerciceDecompositionFonction): Pick<EtatSessionDecompositionFonction, "exerciceCourant" | "etapeCourante" | "niveauAide"> {
  return { exerciceCourant: exercice, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0 };
}

export function demarrerSessionDecompositionFonction(reglages: ReglagesSession5e, generateur: GenerateurExerciceDecompositionFonction): EtatSessionDecompositionFonction {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionDecompositionFonction): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionDecompositionFonction): EtatSessionDecompositionFonction {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxDecomposition(etat.exerciceCourant)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

export function soumettreReponseDecomposition(etat: EtatSessionDecompositionFonction, lignes: string[]): EtatSessionDecompositionFonction {
  if (etat.terminee) throw new Error("soumettreReponseDecomposition : la session est déjà terminée");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<string[]>(etat.etapeCourante, lignes, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDecomposition(exercice, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const resultat: ResultatExerciceDecompositionFonction = { exercice, score, revele: etapeCourante.revelee };
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}
