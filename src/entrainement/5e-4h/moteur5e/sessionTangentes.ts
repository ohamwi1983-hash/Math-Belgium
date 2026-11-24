/**
 * Couche B (5e) — moteur de session pour 5gen28 ("Tangentes"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (`ordreEcransTangente`, dépend uniquement de `exercice.variante`) —
 * contrairement à 5gen27, aucune branche réactive dépendant d'une réponse élève : chaque
 * `soumettreReponseXxx` avance simplement à l'écran suivant de la séquence, même patron que
 * `sessionDefinitionDerivee.ts` (5gen26).
 */
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApres, ecranInitial } from "./typesTangentes";
import type { EcranTangente, EtatSessionTangente, ResultatExerciceTangente } from "./typesTangentes";
import { refusSaisieTangente, verifierEcranTangente } from "./verificationTangentesLotC";
import type { ReponseTangente } from "./verificationTangentesLotC";

const POINTS_DE_BASE = 100;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_TANGENTES = 2;

export function niveauAideMaxTangentes(): number {
  return NIVEAU_AIDE_MAX_TANGENTES;
}

function etatInitial(
  exercice: ExerciceTangente,
): Pick<EtatSessionTangente, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels" | "revelesPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {}, revelesPartiels: {} };
}

export function demarrerSessionTangentes(reglages: ReglagesSession5e, generateur: () => ExerciceTangente): EtatSessionTangente {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionTangente): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax };
}

export function activerAideSuivante(etat: EtatSessionTangente): EtatSessionTangente {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_TANGENTES) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionTangente, resultat: ResultatExerciceTangente, revele: boolean): EtatSessionTangente {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionTangente, ecranAttendu: EcranTangente, reponse: T, verifier: (r: T) => boolean): EtatSessionTangente {
  if (etat.terminee || etat.phase !== ecranAttendu) throw new Error(`soumettreEcran : la session n'est pas à l'écran "${ecranAttendu}"`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
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
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant, scoresPartiels, revelesPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Soumission UNIFIÉE (lots B et C) : chaque écran reçoit une `ReponseTangente` ; une saisie refusée
// (illisible, approchée, répétée, incomplète) laisse l'état INCHANGÉ — aucune tentative consommée.
// ============================================================================

export function soumettreReponseTangente(etat: EtatSessionTangente, reponse: ReponseTangente): EtatSessionTangente {
  const exercice = etat.exerciceCourant;
  if (refusSaisieTangente(exercice, etat.phase, reponse)) return etat;
  return soumettreEcran(etat, etat.phase, reponse, (r) => verifierEcranTangente(exercice, etat.phase, r));
}
