/**
 * Couche B (5e) — moteur de session pour 5gen30 ("Lecture graphique — dérivées et applications").
 * N'importe jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceLectureGraphiqueDerivees } from "../core5e/lectureGraphiqueDerivees.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial } from "./typesLectureGraphiqueDerivees";
import type { EcranLectureGraphiqueDerivees, EtatSessionLectureGraphiqueDerivees, ResultatExerciceLectureGraphiqueDerivees } from "./typesLectureGraphiqueDerivees";
import { listeAsymptotes } from "./typesLectureGraphiqueLimites";
import type { ReponseNommerAsymptotes } from "./typesLectureGraphiqueLimites";
import type { ReponseTableauEtudeLocale } from "./verificationEtudeLocale";
import type { ReponseListeAbscisses } from "./verificationLectureGraphiqueDerivees";
import {
  diagnostiquerListeAbscisses,
  diagnostiquerNommerAsymptotes,
  diagnostiquerValeurExtremum,
  positionsInflexions,
  positionsTangenteHorizontale,
  tableauFPrimeAttendu,
  tableauFSecondeAttendu,
  TOLERANCE_POSITION_INFLEXION,
  TOLERANCE_POSITION_TANGENTE,
  verifierTableauEtudeLocale,
} from "./verificationLectureGraphiqueDerivees";

const POINTS_DE_BASE = 100;

/** Aide VISUELLE uniquement (surlignage du graphique), même esprit que 5gen22 — 1 seul niveau. */
export const NIVEAU_AIDE_MAX_LECTURE_GRAPHIQUE_DERIVEES = 1;

export function niveauAideMaxLectureGraphiqueDerivees(): number {
  return NIVEAU_AIDE_MAX_LECTURE_GRAPHIQUE_DERIVEES;
}

function etatInitial(
  exercice: ExerciceLectureGraphiqueDerivees,
): Pick<EtatSessionLectureGraphiqueDerivees, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels"> {
  return {
    exerciceCourant: exercice,
    phase: ecranInitial(exercice),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
    revelesPartiels: {},
  };
}

export function demarrerSessionLectureGraphiqueDerivees(reglages: ReglagesSession5e, generateur: () => ExerciceLectureGraphiqueDerivees): EtatSessionLectureGraphiqueDerivees {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLectureGraphiqueDerivees): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function activerAideSuivante(etat: EtatSessionLectureGraphiqueDerivees): EtatSessionLectureGraphiqueDerivees {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_LECTURE_GRAPHIQUE_DERIVEES) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionLectureGraphiqueDerivees, resultat: ResultatExerciceLectureGraphiqueDerivees, revele: boolean): EtatSessionLectureGraphiqueDerivees {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

/** `tentativesMaxForce` : 1 pour un choix fermé (tableaux) ou un verdict « aucun » faux — l'écran se
 * clôt et révèle la réponse, il ne se gagne jamais par élimination. */
function soumettreEcran<T>(etat: EtatSessionLectureGraphiqueDerivees, ecranAttendu: EcranLectureGraphiqueDerivees, reponse: T, verifier: (r: T) => boolean, tentativesMaxForce?: number): EtatSessionLectureGraphiqueDerivees {
  if (etat.terminee || etat.phase !== ecranAttendu) throw new Error(`soumettreEcran : la session n'est pas à l'écran "${ecranAttendu}"`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    ...(tentativesMaxForce !== undefined ? { tentativesMax: tentativesMaxForce } : {}),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = etapeCourante.score as number;
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const revelesPartiels = { ...etat.revelesPartiels, [etat.phase]: revele };
  const ecranSuivant = ecranApres(etat.exerciceCourant, etat.phase);

  if (ecranSuivant === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels, revelesPartiels }, revele);
  }
  return {
    ...etat,
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    phase: ecranSuivant,
    scoresPartiels,
    revelesPartiels,
    derniereEtapeRevelee: revele,
  };
}

// ============================================================================
// Écran "asymptotes" — lignes « type + équation » libres (patron de 5gen22, décision G du ch. 4).
// ============================================================================

export function soumettreReponseAsymptotes(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseNommerAsymptotes): EtatSessionLectureGraphiqueDerivees {
  const diagnostic = diagnostiquerNommerAsymptotes(reponse, listeAsymptotes(etat.exerciceCourant.asymptotique));
  return soumettreEcran(etat, "asymptotes", reponse, () => diagnostic.correct, diagnostic.verdictAucuneFaux ? 1 : undefined);
}

// ============================================================================
// Écrans "zerosFPrime"/"inflexions" — liste d'abscisses lues (ordre libre) ou « aucun ».
// ============================================================================

export function soumettreReponseZerosFPrime(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseListeAbscisses): EtatSessionLectureGraphiqueDerivees {
  const diagnostic = diagnostiquerListeAbscisses(reponse, positionsTangenteHorizontale(etat.exerciceCourant), TOLERANCE_POSITION_TANGENTE);
  return soumettreEcran(etat, "zerosFPrime", reponse, () => diagnostic.correct, diagnostic.verdictAucunFaux ? 1 : undefined);
}

export function soumettreReponseInflexions(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseListeAbscisses): EtatSessionLectureGraphiqueDerivees {
  const diagnostic = diagnostiquerListeAbscisses(reponse, positionsInflexions(etat.exerciceCourant), TOLERANCE_POSITION_INFLEXION);
  return soumettreEcran(etat, "inflexions", reponse, () => diagnostic.correct, diagnostic.verdictAucunFaux ? 1 : undefined);
}

// ============================================================================
// Écrans "tableauFPrime"/"tableauFSeconde" — choix fermés : UNE seule tentative.
// ============================================================================

export function soumettreReponseTableauFPrime(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseTableauEtudeLocale): EtatSessionLectureGraphiqueDerivees {
  return soumettreEcran(etat, "tableauFPrime", reponse, (r) => verifierTableauEtudeLocale(r, tableauFPrimeAttendu(etat.exerciceCourant)), 1);
}

export function soumettreReponseTableauFSeconde(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseTableauEtudeLocale): EtatSessionLectureGraphiqueDerivees {
  return soumettreEcran(etat, "tableauFSeconde", reponse, (r) => verifierTableauEtudeLocale(r, tableauFSecondeAttendu(etat.exerciceCourant)), 1);
}

// ============================================================================
// Écran "extremums" — ordonnée de chaque extremum (position connue depuis le tableau de f').
// ============================================================================

export function soumettreReponseExtremums(etat: EtatSessionLectureGraphiqueDerivees, reponses: string[]): EtatSessionLectureGraphiqueDerivees {
  const cibles = etat.exerciceCourant.extrema.map((e) => e.valeur);
  return soumettreEcran(etat, "extremums", reponses, (r) => r.length === cibles.length && r.every((t, i) => diagnostiquerValeurExtremum(t, cibles[i]) === "correct"));
}
