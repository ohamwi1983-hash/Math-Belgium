/**
 * Couche B — moteur de session pour "Comparaison de deux séries statistiques" (chapitre 5, huitième
 * et dernier générateur du chapitre). N'importe jamais rien de `src/generateurs/` — voir
 * `sessionComparaisonSeries.test.ts` pour la preuve avec un générateur factice, même principe que
 * les 37 autres moteurs.
 *
 * **Mono-écran** (comme "Quel angle ?"/"Transformations graphiques") — une seule question par
 * exercice, tirée à la génération (`exercice.question.type`) : 4 fonctions de soumission
 * exportées, une par forme de réponse, chacune toujours terminale dès sa clôture. Aide PROGRESSIVE
 * additive (même mécanique que "Boîte à moustaches"/"Étendue et écart interquartile"/"Triangle
 * quelconque"), 2 niveaux pour les 4 types de question — pénalité appliquée au moment précis où la
 * question se clôt.
 */
import type { ExerciceComparaisonSeries, GenerateurExerciceComparaisonSeries } from "../core/comparaisonSeries.types";
import type { ReglagesSession } from "../core/session.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "./etapeTentatives";
import type { ReglagesEtape } from "./etapeTentatives";
import { verifierCentrage, verifierDispersion, verifierInterpretation, verifierSeuil } from "./verificationComparaisonSeries";
import type { ReponseDispersion } from "./verificationComparaisonSeries";
import type { EtatSessionComparaisonSeries, ResultatExerciceComparaisonSeries } from "./typesComparaisonSeries";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;
const NIVEAU_AIDE_MAX = 2;

export function niveauAideMax(): number {
  return NIVEAU_AIDE_MAX;
}

export function demarrerSessionComparaisonSeries(
  reglages: ReglagesSession,
  generateur: GenerateurExerciceComparaisonSeries,
): EtatSessionComparaisonSeries {
  return {
    reglages,
    generateur,
    indexExercice: 0,
    exerciceCourant: generateur(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    resultats: [],
    terminee: false,
  };
}

function reglagesEtape(etat: EtatSessionComparaisonSeries): ReglagesEtape {
  return {
    pointsDeBase: POINTS_DE_BASE,
    tentativesMax: etat.reglages.tentativesMax,
    penaliteActivee: etat.reglages.penaliteActivee,
  };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Révèle le niveau d'aide suivant de la question courante — lève si la session est terminée ou si
 * le niveau maximal est déjà atteint. */
export function activerAideSuivante(etat: EtatSessionComparaisonSeries): EtatSessionComparaisonSeries {
  if (etat.terminee) {
    throw new Error("activerAideSuivante : la session est déjà terminée");
  }
  if (etat.niveauAide >= NIVEAU_AIDE_MAX) {
    throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cette question");
  }
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionComparaisonSeries, resultat: ResultatExerciceComparaisonSeries): EtatSessionComparaisonSeries {
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
    niveauAide: 0,
  };
}

function exigerTypeQuestion(etat: EtatSessionComparaisonSeries, type: ExerciceComparaisonSeries["question"]["type"], nomFonction: string): void {
  if (etat.terminee) {
    throw new Error(`${nomFonction} : la session est déjà terminée`);
  }
  if (etat.exerciceCourant.question.type !== type) {
    throw new Error(`${nomFonction} : la question courante n'est pas de type "${type}"`);
  }
}

function construireResultat(etat: EtatSessionComparaisonSeries, score: number, revele: boolean): ResultatExerciceComparaisonSeries {
  return {
    variante: etat.exerciceCourant.variante,
    typeQuestion: etat.exerciceCourant.question.type,
    score,
    revele,
    niveauAide: etat.niveauAide,
  };
}

export function soumettreReponseCentrage(etat: EtatSessionComparaisonSeries, choix: "A" | "B"): EtatSessionComparaisonSeries {
  exigerTypeQuestion(etat, "centrage", "soumettreReponseCentrage");
  const question = etat.exerciceCourant.question;
  if (question.type !== "centrage") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<"A" | "B">(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierCentrage(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, construireResultat(etat, score, etapeCourante.revelee));
}

export function soumettreReponseInterpretation(etat: EtatSessionComparaisonSeries, choix: "A" | "B"): EtatSessionComparaisonSeries {
  exigerTypeQuestion(etat, "interpretation", "soumettreReponseInterpretation");
  const question = etat.exerciceCourant.question;
  if (question.type !== "interpretation") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<"A" | "B">(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierInterpretation(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, construireResultat(etat, score, etapeCourante.revelee));
}

export function soumettreReponseSeuil(etat: EtatSessionComparaisonSeries, texte: string): EtatSessionComparaisonSeries {
  exigerTypeQuestion(etat, "seuil", "soumettreReponseSeuil");
  const question = etat.exerciceCourant.question;
  if (question.type !== "seuil") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<string>(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierSeuil(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, construireResultat(etat, score, etapeCourante.revelee));
}

export function soumettreReponseDispersion(etat: EtatSessionComparaisonSeries, reponse: ReponseDispersion): EtatSessionComparaisonSeries {
  exigerTypeQuestion(etat, "dispersion", "soumettreReponseDispersion");
  const question = etat.exerciceCourant.question;
  if (question.type !== "dispersion") throw new Error("unreachable");

  const etapeCourante = soumettreEtapeTentatives<ReponseDispersion>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r) => verifierDispersion(question, r),
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  return cloturerExerciceOuSuivant(etat, construireResultat(etat, score, etapeCourante.revelee));
}
