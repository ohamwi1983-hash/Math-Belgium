/**
 * Couche B — moteur de session pour "Transformations graphiques — fonctions de référence"
 * (chapitre 2). N'importe jamais rien de src/generateurs — voir sessionFonctionsReference.test.ts
 * pour la preuve avec un générateur factice minimal, même principe que les 7 autres moteurs du
 * projet.
 *
 * 2 phases (spec section 3) : `reconnaissance` (choix de la famille, jamais sautée) puis
 * `exercice` (curseurs + équation, DEUX notes indépendantes, chacune sa propre machine à
 * tentatives — même principe que "Transformations graphiques" chapitre 1). Le bouton "Aide" ne
 * s'applique qu'aux deux notes de l'écran "exercice" (jamais à la reconnaissance, toujours déjà
 * close avant que l'aide ne devienne accessible).
 */
import type { FamilleReference, GenerateurExerciceFonctionReference, ReponseFonctionReference } from "../core/fonctionsReference.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import { verifierCurseursFonctionReference, verifierEquationFonctionReference } from "./verificationFonctionsReference";
import type { EtatSessionFonctionReference, ResultatExerciceFonctionReference } from "./typesFonctionsReference";

const POINTS_DE_BASE = 100;

export function demarrerSessionFonctionReference(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceFonctionReference,
): EtatSessionFonctionReference {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "reconnaissance",
    etapeReconnaissance: demarrerEtapeTentatives(),
    etapeEquation: demarrerEtapeTentatives(),
    etapeCurseurs: demarrerEtapeTentatives(),
    aideUtilisee: false,
    scoreReconnaissanceExercice: null,
    scoreEquationExercice: null,
    scoreCurseursExercice: null,
    equationAideAppliquee: false,
    curseursAideAppliquee: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionFonctionReference) {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Bouton "Aide" : révélation à sens unique, uniquement accessible en phase "exercice". */
export function activerAide(etat: EtatSessionFonctionReference): EtatSessionFonctionReference {
  if (etat.terminee) {
    throw new Error("activerAide : la session est déjà terminée");
  }
  if (etat.phase !== "exercice") {
    throw new Error("activerAide : indisponible avant la fin de la reconnaissance");
  }
  return { ...etat, aideUtilisee: true };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionFonctionReference,
  resultat: ResultatExerciceFonctionReference,
): EtatSessionFonctionReference {
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
    phase: "reconnaissance",
    etapeReconnaissance: demarrerEtapeTentatives(),
    etapeEquation: demarrerEtapeTentatives(),
    etapeCurseurs: demarrerEtapeTentatives(),
    aideUtilisee: false,
    scoreReconnaissanceExercice: null,
    scoreEquationExercice: null,
    scoreCurseursExercice: null,
    equationAideAppliquee: false,
    curseursAideAppliquee: false,
  };
}

/** Étape 0 (spec section 3) : choix de la famille parmi les 6, jamais l'aide (toujours indisponible
 * à ce stade). Transition vers la phase "exercice" que le choix soit correct ou que les tentatives
 * soient épuisées — comme les étapes de reconnaissance/isolement des autres exercices du projet, le
 * flux avance toujours, seul le score diffère. */
export function soumettreChoixFamille(
  etat: EtatSessionFonctionReference,
  choix: FamilleReference,
): EtatSessionFonctionReference {
  if (etat.terminee) {
    throw new Error("soumettreChoixFamille : la session est déjà terminée");
  }
  if (etat.phase !== "reconnaissance") {
    throw new Error("soumettreChoixFamille : la reconnaissance est déjà close pour cet exercice");
  }

  const etapeReconnaissance = soumettreEtapeTentatives<FamilleReference>(etat.etapeReconnaissance, choix, {
    ...reglagesEtape(etat),
    verifier: (r) => r === etat.exerciceCourant.famille,
    revelerReponse: () => {},
  });

  if (!etapeReconnaissance.terminee) {
    return { ...etat, etapeReconnaissance };
  }

  return {
    ...etat,
    etapeReconnaissance,
    phase: "exercice",
    scoreReconnaissanceExercice: etapeReconnaissance.score as number,
  };
}

/**
 * Étape 1 (spec section 2-3) : soumission unique de l'écran "exercice" — les deux notes
 * ("équation", "curseurs") sont traitées indépendamment, une note déjà close n'est plus jamais
 * réévaluée. Clôture l'exercice dès que les deux sont closes (dans cette soumission ou une
 * précédente).
 */
export function soumettreReponse(
  etat: EtatSessionFonctionReference,
  reponse: ReponseFonctionReference,
): EtatSessionFonctionReference {
  if (etat.terminee) {
    throw new Error("soumettreReponse : la session est déjà terminée");
  }
  if (etat.phase !== "exercice") {
    throw new Error("soumettreReponse : la reconnaissance doit être close avant l'écran exercice");
  }

  let etapeEquation = etat.etapeEquation;
  let scoreEquationExercice = etat.scoreEquationExercice;
  let equationAideAppliquee = etat.equationAideAppliquee;
  if (!etapeEquation.terminee) {
    etapeEquation = soumettreEtapeTentatives<string>(etapeEquation, reponse.equation, {
      ...reglagesEtape(etat),
      verifier: (r) => verifierEquationFonctionReference(etat.exerciceCourant, r),
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
      verifier: (r) => verifierCurseursFonctionReference(etat.exerciceCourant, r),
      revelerReponse: () => {},
    });
    if (etapeCurseurs.terminee) {
      const score = etapeCurseurs.score as number;
      curseursAideAppliquee = etat.aideUtilisee;
      scoreCurseursExercice = curseursAideAppliquee ? score * 0.5 : score;
    }
  }

  const etatMisAJour: EtatSessionFonctionReference = {
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
      scoreReconnaissance: etat.scoreReconnaissanceExercice as number,
      reconnaissanceRevele: etat.etapeReconnaissance.revelee,
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
