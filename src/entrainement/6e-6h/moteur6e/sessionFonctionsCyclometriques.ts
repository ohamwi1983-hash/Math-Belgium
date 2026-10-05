/**
 * Couche B (6e) — moteur de session pour `6gen2` (REFONTE TOTALE). N'importe jamais rien de
 * `src/generateurs6e/` — voir `sessionFonctionsCyclometriques.test.ts` (exercice factice défini
 * localement) et `generateurs6e/fonctionsCyclometriques/session.integration.test.ts` pour le seul
 * fichier autorisé à importer les deux couches. Écran UNIQUE (voir `typesFonctionsCyclometriques.ts`) :
 * pas de `phase`, une seule tentative par exercice à noter puis clôturer.
 */
import type { ExerciceFonctionsCyclometriques } from "../core6e/fonctionsCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import type { EtatSessionFonctionsCyclometriques, ResultatExerciceFonctionsCyclometriques } from "./typesFonctionsCyclometriques";
import type { ReponseFonctionsCyclometriques } from "./verificationFonctionsCyclometriques";
import { verifierReponseFonctionsCyclometriques } from "./verificationFonctionsCyclometriques";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide (spec : rappel de la condition à vérifier, puis résultat de cette condition). */
export const NIVEAU_AIDE_MAX = 2;

function etatInitial(exercice: ExerciceFonctionsCyclometriques): Pick<EtatSessionFonctionsCyclometriques, "exerciceCourant" | "etapeCourante" | "niveauAide"> {
  return { exerciceCourant: exercice, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0 };
}

export function demarrerSessionFonctionsCyclometriques(reglages: ReglagesSession6e, generateur: () => ExerciceFonctionsCyclometriques): EtatSessionFonctionsCyclometriques {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionFonctionsCyclometriques): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionFonctionsCyclometriques): EtatSessionFonctionsCyclometriques {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionFonctionsCyclometriques, resultat: ResultatExerciceFonctionsCyclometriques): EtatSessionFonctionsCyclometriques {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()) };
}

export function soumettreReponseFonctionsCyclometriques(etat: EtatSessionFonctionsCyclometriques, reponse: ReponseFonctionsCyclometriques): EtatSessionFonctionsCyclometriques {
  if (etat.terminee) throw new Error("soumettreReponseFonctionsCyclometriques : la session est déjà terminée");
  const exercice = etat.exerciceCourant;

  const etapeCourante = soumettreEtapeTentatives<ReponseFonctionsCyclometriques>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseFonctionsCyclometriques(exercice, r),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const revele = etapeCourante.revelee;
  return cloturerExerciceOuSuivant(etat, { exercice, score, revele });
}
