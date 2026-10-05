/**
 * Couche B — moteur de session pour "Triangle quelconque" (chapitre 3, remplace "Aire d'un
 * triangle quelconque" à la position 19). N'importe jamais rien de src/generateurs — voir
 * sessionTriangleQuelconque.test.ts pour la preuve avec un générateur factice, même principe que
 * les autres moteurs du projet.
 *
 * 2 phases fixes, toujours dans le même ordre : donneeManquante → aire (l'écran 2 n'apparaît qu'une
 * fois l'écran 1 clos, correct ou révélé — jamais affichés simultanément, comportement séquentiel
 * standard demandé par le prompt de création).
 *
 * **Aide PROGRESSIVE par écran**, contrairement au bouton binaire du reste du projet — 2 niveaux
 * par écran (`promptcorrectionsgenerateur19unitesnotation.md` réduit l'écran 1 de 3 à 2 : l'ancien
 * niveau 2 — jargon "assignation côté/angle opposé" — est retiré, le croquis suffit déjà à montrer
 * la correspondance côté/angle opposé via les connecteurs de paire), chacun un cran de plus que le
 * précédent (`activerAideSuivante`) — jamais accessible au-delà de son maximum ni hors de la phase
 * à laquelle il appartient. Pénalité ADDITIVE (-20 points par niveau atteint, même principe que
 * "L'un sans l'autre" mais étendu à plusieurs niveaux cumulables au lieu d'un seul flag) appliquée
 * au niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement si un niveau
 * supplémentaire est activé après coup (impossible ici de toute façon, l'écran étant déjà clos).
 *
 * **Système d'unités** (même prompt) : `soumettreReponseDonneeManquante`/`soumettreReponseAire`
 * acceptent désormais une unité en plus de la valeur numérique — `null` pour la donnée manquante
 * quand elle est un angle (aucun menu déroulant, `alKashi`), toujours requise pour l'aire. Transmise
 * telle quelle à `verifierDonneeManquante`/`verifierAire` (`verificationTriangleQuelconque.ts`), qui
 * exigent l'égalité de la valeur ET de l'unité — jamais stockée sur `EtatSessionTriangleQuelconque`
 * elle-même, seulement capturée par la fermeture de chaque soumission (une tentative = une unité).
 */
import type { GenerateurExerciceTriangleQuelconque, UniteLongueur } from "../core/triangleQuelconque.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierAire, verifierDonneeManquante } from "./verificationTriangleQuelconque";
import type { EtatSessionTriangleQuelconque, ResultatExerciceTriangleQuelconque } from "./typesTriangleQuelconque";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
export const NIVEAU_AIDE_MAX_DONNEE_MANQUANTE = 2;
export const NIVEAU_AIDE_MAX_AIRE = 2;

export function demarrerSessionTriangleQuelconque(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceTriangleQuelconque,
): EtatSessionTriangleQuelconque {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    phase: "donneeManquante",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideDonneeManquante: 0,
    niveauAideAire: 0,
    scoreDonneeManquanteExercice: null,
    donneeManquanteRevele: false,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionTriangleQuelconque): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

/** Pénalité additive, jamais sous 0 — un cran de plus retire toujours 20 points supplémentaires. */
function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de l'écran courant — lève si la session est terminée, ou si le
 * niveau maximal de l'écran courant est déjà atteint (rien de plus à révéler). */
export function activerAideSuivante(etat: EtatSessionTriangleQuelconque): EtatSessionTriangleQuelconque {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.phase === "donneeManquante") {
    if (etat.niveauAideDonneeManquante >= NIVEAU_AIDE_MAX_DONNEE_MANQUANTE) {
      throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
    }
    return { ...etat, niveauAideDonneeManquante: etat.niveauAideDonneeManquante + 1 };
  }
  if (etat.niveauAideAire >= NIVEAU_AIDE_MAX_AIRE) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  }
  return { ...etat, niveauAideAire: etat.niveauAideAire + 1 };
}

function cloturerExerciceOuSuivant(
  etat: EtatSessionTriangleQuelconque,
  resultat: ResultatExerciceTriangleQuelconque,
): EtatSessionTriangleQuelconque {
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
    phase: "donneeManquante",
    etapeCourante: demarrerEtapeTentatives(),
    niveauAideDonneeManquante: 0,
    niveauAideAire: 0,
    scoreDonneeManquanteExercice: null,
    donneeManquanteRevele: false,
  };
}

export function soumettreReponseDonneeManquante(
  etat: EtatSessionTriangleQuelconque,
  valeur: number,
  unite: UniteLongueur | null,
): EtatSessionTriangleQuelconque {
  if (etat.terminee || etat.phase !== "donneeManquante") {
    throw new Error("soumettreReponseDonneeManquante : la session n'est pas à l'étape donnée manquante");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierDonneeManquante(etat.exerciceCourant, v, unite),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideDonneeManquante);

  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    phase: "aire",
    scoreDonneeManquanteExercice: score,
    donneeManquanteRevele: etapeCourante.revelee,
  };
}

/** Dernière phase, clôture l'exercice. */
export function soumettreReponseAire(etat: EtatSessionTriangleQuelconque, valeur: number, unite: UniteLongueur): EtatSessionTriangleQuelconque {
  if (etat.terminee || etat.phase !== "aire") {
    throw new Error("soumettreReponseAire : la session n'est pas à l'étape aire");
  }

  const etapeCourante = soumettreEtapeTentatives<number>(etat.etapeCourante, valeur, {
    ...reglagesEtape(etat),
    verifier: (v) => verifierAire(etat.exerciceCourant, v, unite),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) {
    return { ...etat, etapeCourante };
  }

  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAideAire);

  return cloturerExerciceOuSuivant(etat, {
    configuration: etat.exerciceCourant.configuration,
    scoreDonneeManquante: etat.scoreDonneeManquanteExercice as number,
    donneeManquanteRevele: etat.donneeManquanteRevele,
    niveauAideDonneeManquante: etat.niveauAideDonneeManquante,
    scoreAire: score,
    aireRevele: etapeCourante.revelee,
    niveauAideAire: etat.niveauAideAire,
  });
}
