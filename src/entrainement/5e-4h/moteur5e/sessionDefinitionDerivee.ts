/**
 * Couche B (5e) — moteur de session pour 5gen26 ("Calculer f'(a) par la définition"). N'importe
 * jamais rien de `src/generateurs5e/`.
 */
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesDefinitionDerivee";
import type { EcranDefinitionDerivee, EtatSessionDefinitionDerivee, ResultatExerciceDefinitionDerivee } from "./typesDefinitionDerivee";
import { diagnostiquerDeveloppementH, diagnostiquerLimiteDerivee, diagnostiquerQuotientH, diagnostiquerValeurFA } from "./verificationDefinitionDerivee";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_DEFINITION_DERIVEE = 2;

export function niveauAideMaxDefinitionDerivee(): number {
  return NIVEAU_AIDE_MAX_DEFINITION_DERIVEE;
}

function etatInitial(exercice: ExerciceDefinitionDerivee): Pick<EtatSessionDefinitionDerivee, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionDefinitionDerivee(reglages: ReglagesSession5e, generateur: () => ExerciceDefinitionDerivee): EtatSessionDefinitionDerivee {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionDefinitionDerivee): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionDefinitionDerivee): EtatSessionDefinitionDerivee {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_DEFINITION_DERIVEE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionDefinitionDerivee, resultat: ResultatExerciceDefinitionDerivee, revele: boolean): EtatSessionDefinitionDerivee {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionDefinitionDerivee, ecranAttendu: EcranDefinitionDerivee, reponse: T, verifier: (r: T) => boolean): EtatSessionDefinitionDerivee {
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
  const phaseSuivante = phaseApres(etat.phase);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Écran "developper" — 2 champs (f(a) + f(a+h)), UNE seule tentative combinée (1 bouton Valider).
// ============================================================================

export interface ReponseDevelopper {
  fA: string;
  fAH: string;
}

export function soumettreReponseDevelopper(etat: EtatSessionDefinitionDerivee, reponse: ReponseDevelopper): EtatSessionDefinitionDerivee {
  const exercice = etat.exerciceCourant;
  const a = exercice.a;
  return soumettreEcran(
    etat,
    "developper",
    reponse,
    (r) => diagnostiquerValeurFA(r.fA, exercice, a) === "correct" && diagnostiquerDeveloppementH(r.fAH, exercice, a) === "correct",
  );
}

// ============================================================================
// Écran "quotient" — 1 champ (quotient simplifié).
// ============================================================================

export function soumettreReponseQuotient(etat: EtatSessionDefinitionDerivee, texte: string): EtatSessionDefinitionDerivee {
  const exercice = etat.exerciceCourant;
  const a = exercice.a;
  return soumettreEcran(etat, "quotient", texte, (t) => diagnostiquerQuotientH(t, exercice, a) === "correct");
}

// ============================================================================
// Écran "limite" — 1 champ (f'(a), nombre exact).
// ============================================================================

export function soumettreReponseLimite(etat: EtatSessionDefinitionDerivee, texte: string): EtatSessionDefinitionDerivee {
  const exercice = etat.exerciceCourant;
  const a = exercice.a;
  return soumettreEcran(etat, "limite", texte, (t) => diagnostiquerLimiteDerivee(t, exercice, a) === "correct");
}
