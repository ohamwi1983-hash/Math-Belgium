/**
 * Couche B — moteur de session pour "Quel angle ?" (chapitre 3, générateur en position 18).
 * N'importe jamais rien de `src/generateurs` — voir `sessionQuelAngle.test.ts` pour la preuve avec
 * un générateur factice, même principe que les dix-sept autres moteurs du projet.
 *
 * Un seul écran par exercice (pas de `Phase`, comme "Transformations graphiques", générateur 8) —
 * mais une seule note ici (contrairement au huitième, qui en a deux indépendantes) : `soumettreReponse`
 * clôture directement l'exercice dès que l'étape se termine, plus jamais de branchement vers une
 * autre note.
 *
 * **Bouton "Aide" unique** (`promptcorrectionsgenerateur18aideunique.md`, remplace le système à 3
 * aides progressives à pénalité additive d'origine) — révélation à sens unique, facteur ×0,5
 * appliqué au score final, même mécanique standard que la plupart des générateurs du projet (ex.
 * "Valeurs remarquables", `appliquerPenaliteAide`) plutôt que la pénalité additive spécifique à
 * "L'un sans l'autre" : simplification voulue, une seule aide combinée ne justifie plus un
 * mécanisme de pénalité à plusieurs niveaux.
 */
import type { GenerateurExerciceQuelAngle } from "../core/quelAngle.types";
import type { ReponseQuelAngle } from "../core/quelAngle.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierReponseQuelAngle } from "./verificationQuelAngle";
import type { EtatSessionQuelAngle, ResultatExerciceQuelAngle } from "./typesQuelAngle";

const POINTS_DE_BASE = 100;

export function demarrerSessionQuelAngle(reglages: ReglagesSession, generateur: GenerateurExerciceQuelAngle): EtatSessionQuelAngle {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    etapeCourante: demarrerEtapeTentatives(),
    aideUtilisee: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionQuelAngle): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteAide(score: number, aideUtilisee: boolean): number {
  return aideUtilisee ? score * 0.5 : score;
}

/** Bouton "Aide" — révélation à sens unique, lève si la session est déjà terminée. */
export function activerAide(etat: EtatSessionQuelAngle): EtatSessionQuelAngle {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  return { ...etat, aideUtilisee: true };
}

function cloturerExerciceOuSuivant(etat: EtatSessionQuelAngle, resultat: ResultatExerciceQuelAngle): EtatSessionQuelAngle {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;

  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true };
  }

  return {
    ...etat,
    resultats,
    indexExercice,
    exerciceCourant: etat.generateur(),
    etapeCourante: demarrerEtapeTentatives(),
    aideUtilisee: false,
  };
}

/** Dernière et unique étape notée, clôture toujours l'exercice. */
export function soumettreReponse(etat: EtatSessionQuelAngle, reponse: ReponseQuelAngle): EtatSessionQuelAngle {
  if (etat.terminee) {
    throw new Error("soumettreReponse : la session est déjà terminée");
  }

  const etapeCourante = soumettreEtapeTentatives<ReponseQuelAngle>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierReponseQuelAngle(etat.exerciceCourant, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteAide(etapeCourante.score as number, etat.aideUtilisee);

  return cloturerExerciceOuSuivant(etat, {
    fonction: etat.exerciceCourant.fonction,
    score,
    revele: etapeCourante.revelee,
    aideUtilisee: etat.aideUtilisee,
  });
}
