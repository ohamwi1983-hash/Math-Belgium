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
import { diagnostiquerCibleAsymptote } from "./verificationLectureGraphiqueLimites";
import type { ReponseTableauEtudeLocale } from "./verificationEtudeLocale";
import { tableauFPrimeAttendu, tableauFSecondeAttendu, verifierEnsembleValeurs, verifierTableauEtudeLocale, diagnostiquerValeurExtremum, diagnostiquerPositionInflexion } from "./verificationLectureGraphiqueDerivees";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Aide VISUELLE uniquement (surlignage du graphique), même esprit que 5gen22 — 1 seul niveau. */
export const NIVEAU_AIDE_MAX_LECTURE_GRAPHIQUE_DERIVEES = 1;

export function niveauAideMaxLectureGraphiqueDerivees(): number {
  return NIVEAU_AIDE_MAX_LECTURE_GRAPHIQUE_DERIVEES;
}

function etatInitial(exercice: ExerciceLectureGraphiqueDerivees): Pick<EtatSessionLectureGraphiqueDerivees, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitial(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionLectureGraphiqueDerivees(reglages: ReglagesSession5e, generateur: () => ExerciceLectureGraphiqueDerivees): EtatSessionLectureGraphiqueDerivees {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionLectureGraphiqueDerivees): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
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

function soumettreEcran<T>(etat: EtatSessionLectureGraphiqueDerivees, ecranAttendu: EcranLectureGraphiqueDerivees, reponse: T, verifier: (r: T) => boolean): EtatSessionLectureGraphiqueDerivees {
  if (etat.terminee || etat.phase !== ecranAttendu) throw new Error(`soumettreEcran : la session n'est pas à l'écran "${ecranAttendu}"`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [etat.phase]: score };
  const ecranSuivant = ecranApres(etat.exerciceCourant, etat.phase);

  if (ecranSuivant === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Écran "asymptotes" — reprend le patron de 5gen22 (`listeAsymptotes`/`diagnostiquerCibleAsymptote`)
// appliqué au sous-objet `exercice.asymptotique`.
// ============================================================================

export function soumettreReponseAsymptotes(etat: EtatSessionLectureGraphiqueDerivees, textes: string[]): EtatSessionLectureGraphiqueDerivees {
  const slots = listeAsymptotes(etat.exerciceCourant.asymptotique);
  return soumettreEcran(etat, "asymptotes", textes, (t) => t.length === slots.length && t.every((v, i) => diagnostiquerCibleAsymptote(v, slots[i].cible) === "correct"));
}

// ============================================================================
// Écrans "tableauFPrime"/"tableauFSeconde" — grille étendue, notation combinée.
// ============================================================================

export function soumettreReponseTableauFPrime(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseTableauEtudeLocale): EtatSessionLectureGraphiqueDerivees {
  return soumettreEcran(etat, "tableauFPrime", reponse, (r) => verifierTableauEtudeLocale(r, tableauFPrimeAttendu(etat.exerciceCourant)));
}

export function soumettreReponseTableauFSeconde(etat: EtatSessionLectureGraphiqueDerivees, reponse: ReponseTableauEtudeLocale): EtatSessionLectureGraphiqueDerivees {
  return soumettreEcran(etat, "tableauFSeconde", reponse, (r) => verifierTableauEtudeLocale(r, tableauFSecondeAttendu(etat.exerciceCourant)));
}

// ============================================================================
// Écrans "extremums"/"inflexions" — valeur/abscisse lues, tolérance large (voir
// `verificationLectureGraphiqueDerivees.ts`).
// ============================================================================

export function soumettreReponseExtremums(etat: EtatSessionLectureGraphiqueDerivees, reponses: string[]): EtatSessionLectureGraphiqueDerivees {
  const cibles = etat.exerciceCourant.extrema.map((e) => e.valeur);
  return soumettreEcran(etat, "extremums", reponses, (r) => verifierEnsembleValeurs(r, cibles, diagnostiquerValeurExtremum));
}

export function soumettreReponseInflexions(etat: EtatSessionLectureGraphiqueDerivees, reponses: string[]): EtatSessionLectureGraphiqueDerivees {
  const cibles = etat.exerciceCourant.inflexions.map((p) => p.position);
  return soumettreEcran(etat, "inflexions", reponses, (r) => verifierEnsembleValeurs(r, cibles, diagnostiquerPositionInflexion));
}
