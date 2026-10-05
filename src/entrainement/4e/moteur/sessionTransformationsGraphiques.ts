/**
 * Couche B — moteur de session pour "Transformations graphiques" (chapitre 1).
 * N'importe jamais rien de src/generateurs — voir sessionTransformationsGraphiques.test.ts pour la
 * preuve avec un générateur factice minimal, même principe que les 6 autres moteurs du projet.
 *
 * Un seul écran (pas de `Phase`) : les 4 curseurs + le toggle + le champ équation sont soumis
 * ensemble par le même bouton "Valider" (section 2 de la spec), mais alimentent DEUX notes
 * indépendantes ("équation", "curseurs"), chacune sa propre machine à tentatives
 * (etapeTentatives.ts) — une note peut se clore avant l'autre, et une note déjà close n'est plus
 * jamais réévaluée aux soumissions suivantes. L'exercice ne se clôt que lorsque les deux sont
 * closes.
 */
import type { ReponseTransformationGraphique, GenerateurExerciceTransformationGraphique } from "../core/transformationsGraphiques.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierCurseurs, verifierEquationTransformation } from "./verificationTransformationsGraphiques";
import type { EtatSessionTransformationGraphique, ResultatExerciceTransformationGraphique } from "./typesTransformationsGraphiques";

const POINTS_DE_BASE = 100;

export function demarrerSessionTransformationGraphique(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceTransformationGraphique,
): EtatSessionTransformationGraphique {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    etapeEquation: demarrerEtapeTentatives(),
    etapeCurseurs: demarrerEtapeTentatives(),
    aideUtilisee: false,
    scoreEquationExercice: null,
    scoreCurseursExercice: null,
    equationAideAppliquee: false,
    curseursAideAppliquee: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionTransformationGraphique): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Bouton "Aide" : révélation à sens unique (section 2-3 de la spec). */
export function activerAide(etat: EtatSessionTransformationGraphique): EtatSessionTransformationGraphique {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  return { ...etat, aideUtilisee: true };
}

/** Clôture l'exercice en cours et avance au suivant, ou termine la session. */
function cloturerExerciceOuSuivant(
  etat: EtatSessionTransformationGraphique,
  resultat: ResultatExerciceTransformationGraphique,
): EtatSessionTransformationGraphique {
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
    etapeEquation: demarrerEtapeTentatives(),
    etapeCurseurs: demarrerEtapeTentatives(),
    aideUtilisee: false,
    scoreEquationExercice: null,
    scoreCurseursExercice: null,
    equationAideAppliquee: false,
    curseursAideAppliquee: false,
  };
}

/**
 * Soumission unique de l'écran (section 2 de la spec) : traite les deux notes indépendamment —
 * une note déjà close (etapeXxx.terminee) n'est plus réévaluée, quelle que soit la réponse fournie
 * pour elle dans cette soumission. Clôture l'exercice dès que les deux notes sont closes (dans
 * cette soumission ou dans une précédente).
 */
export function soumettreReponse(
  etat: EtatSessionTransformationGraphique,
  reponse: ReponseTransformationGraphique,
): EtatSessionTransformationGraphique {
  if (etat.terminee) {
    throw new Error("soumettreReponse : la session est déjà terminée");
  }

  let etapeEquation = etat.etapeEquation;
  let scoreEquationExercice = etat.scoreEquationExercice;
  let equationAideAppliquee = etat.equationAideAppliquee;
  if (!etapeEquation.terminee) {
    etapeEquation = soumettreEtapeTentatives<string>(etapeEquation, reponse.equation, {
      ...reglagesEtape(etat),
      verifier: (r) => verifierEquationTransformation(etat.exerciceCourant, r),
      revelerReponse: () => {},
    });
    if (etapeEquation.terminee) {
      const score = etapeEquation.score as number;
      equationAideAppliquee = etat.aideUtilisee;
      scoreEquationExercice = equationAideAppliquee ? score * 0.5 : score;
    }
  }

  let etapeCurseurs = etat.etapeCurseurs;
  let scoreCurseursExercice = etat.scoreCurseursExercice;
  let curseursAideAppliquee = etat.curseursAideAppliquee;
  if (!etapeCurseurs.terminee) {
    etapeCurseurs = soumettreEtapeTentatives<typeof reponse.curseurs>(etapeCurseurs, reponse.curseurs, {
      ...reglagesEtape(etat),
      verifier: (r) => verifierCurseurs(etat.exerciceCourant, r),
      revelerReponse: () => {},
    });
    if (etapeCurseurs.terminee) {
      const score = etapeCurseurs.score as number;
      curseursAideAppliquee = etat.aideUtilisee;
      scoreCurseursExercice = curseursAideAppliquee ? score * 0.5 : score;
    }
  }

  const etatMisAJour: EtatSessionTransformationGraphique = {
    ...etat,
    etapeEquation,
    etapeCurseurs,
    scoreEquationExercice,
    scoreCurseursExercice,
    equationAideAppliquee,
    curseursAideAppliquee,
  };

  if (scoreEquationExercice !== null && scoreCurseursExercice !== null) {
    return cloturerExerciceOuSuivant(etatMisAJour, {
      scoreEquation: scoreEquationExercice,
      equationRevele: etapeEquation.revelee,
      equationAideUtilisee: equationAideAppliquee,
      scoreCurseurs: scoreCurseursExercice,
      curseursRevele: etapeCurseurs.revelee,
      curseursAideUtilisee: curseursAideAppliquee,
    });
  }

  return etatMisAJour;
}
