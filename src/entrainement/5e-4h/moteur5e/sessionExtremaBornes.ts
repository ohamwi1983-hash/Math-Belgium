/**
 * Couche B (5e) — moteur de session pour 5gen34 ("Extrema en contexte borné"). N'importe jamais
 * rien de `src/generateurs5e/`.
 *
 * Séquence FIXE (5 écrans, TOUJOURS présents, voir `typesExtremaBornes.ts`) — aucune branche
 * réactive dépendant d'une réponse élève, même patron que `sessionEtudeLocale.ts`/`sessionTangentes.ts`.
 */
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { ecranApresExtremaBornes, ecranInitialExtremaBornes } from "./typesExtremaBornes";
import type { EcranExtremaBornes, EtatSessionExtremaBornes, ResultatExerciceExtremaBornes } from "./typesExtremaBornes";
import type { ReponseComparaisonBorne, ReponseTableauFPrimeBorne } from "./verificationExtremaBornes";
import {
  diagnostiquerCalculerDeriveeBorne,
  valeursFAuxBornes,
  valeursFAuxExtremumsBorne,
  verifierComparaisonBorne,
  verifierEnsembleNumeriqueBorne,
  verifierTableauFPrimeBorne,
  tableauFPrimeBorneAttendu,
} from "./verificationExtremaBornes";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_EXTREMA_BORNES = 2;

export function niveauAideMaxExtremaBornes(): number {
  return NIVEAU_AIDE_MAX_EXTREMA_BORNES;
}

function etatInitial(exercice: ExerciceExtremaBornes): Pick<EtatSessionExtremaBornes, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: ecranInitialExtremaBornes(), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionExtremaBornes(reglages: ReglagesSession5e, generateur: () => ExerciceExtremaBornes): EtatSessionExtremaBornes {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionExtremaBornes): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivanteExtremaBornes(etat: EtatSessionExtremaBornes): EtatSessionExtremaBornes {
  if (etat.terminee) throw new Error("activerAideSuivanteExtremaBornes : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_EXTREMA_BORNES) throw new Error("activerAideSuivanteExtremaBornes : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionExtremaBornes, resultat: ResultatExerciceExtremaBornes, revele: boolean): EtatSessionExtremaBornes {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionExtremaBornes, ecranAttendu: EcranExtremaBornes, reponse: T, verifier: (r: T) => boolean): EtatSessionExtremaBornes {
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
  const ecranSuivant = ecranApresExtremaBornes(etat.phase);

  if (ecranSuivant === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: ecranSuivant, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Écran "deriver" — champ symbolique f'(t).
// ============================================================================

export function soumettreReponseDeriverBorne(etat: EtatSessionExtremaBornes, texte: string): EtatSessionExtremaBornes {
  return soumettreEcran(etat, "deriver", texte, (t) => diagnostiquerCalculerDeriveeBorne(t, etat.exerciceCourant) === "correct");
}

// ============================================================================
// Écran "tableauFPrime" — tableau de signes étendu, notation combinée en un seul essai.
// ============================================================================

export function soumettreReponseTableauFPrimeBorne(etat: EtatSessionExtremaBornes, reponse: ReponseTableauFPrimeBorne): EtatSessionExtremaBornes {
  return soumettreEcran(etat, "tableauFPrime", reponse, (r) => verifierTableauFPrimeBorne(r, tableauFPrimeBorneAttendu(etat.exerciceCourant)));
}

// ============================================================================
// Écrans "valeursExtremums"/"valeursBornes" — N champs numériques, vérifiés comme un ensemble.
// ============================================================================

export function soumettreReponseValeursExtremumsBorne(etat: EtatSessionExtremaBornes, reponses: string[]): EtatSessionExtremaBornes {
  return soumettreEcran(etat, "valeursExtremums", reponses, (r) => verifierEnsembleNumeriqueBorne(r, valeursFAuxExtremumsBorne(etat.exerciceCourant)));
}

export function soumettreReponseValeursBornes(etat: EtatSessionExtremaBornes, reponses: string[]): EtatSessionExtremaBornes {
  return soumettreEcran(etat, "valeursBornes", reponses, (r) => verifierEnsembleNumeriqueBorne(r, valeursFAuxBornes(etat.exerciceCourant)));
}

// ============================================================================
// Écran "comparaison" — identification du max/min absolu parmi toutes les valeurs.
// ============================================================================

export function soumettreReponseComparaisonBorne(etat: EtatSessionExtremaBornes, reponse: ReponseComparaisonBorne): EtatSessionExtremaBornes {
  return soumettreEcran(etat, "comparaison", reponse, (r) => verifierComparaisonBorne(r, etat.exerciceCourant));
}
