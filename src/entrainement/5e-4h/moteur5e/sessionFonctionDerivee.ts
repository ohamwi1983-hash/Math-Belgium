/**
 * Couche B (5e) — moteur de session pour 5gen27 ("Fonction dérivée"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence RÉACTIVE (voir `typesFonctionDerivee.ts`) : "decomposer" est sauté quand le type retenu
 * à l'écran "reconnaissance" est "reglebase" — chaque `soumettreReponseXxx` calcule donc lui-même
 * l'écran suivant, plutôt que de consulter une table `ORDRE_COMPLET` statique (qui n'aurait pas de
 * sens ici, la suite dépendant de la réponse de l'élève).
 */
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { EtatEtapeTentatives, ReglagesEtape } from "../moteur/etapeTentatives";
import type { EcranFonctionDerivee, EtatSessionFonctionDerivee, ResultatExerciceFonctionDerivee } from "./typesFonctionDerivee";
import { diagnostiquerCalculerDerivee, verifierDecompositionComposee, verifierDecompositionUV } from "./verificationFonctionDerivee";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** Convention STANDARD de la plateforme (2 niveaux d'aide sur tout écran). */
export const NIVEAU_AIDE_MAX_FONCTION_DERIVEE = 2;

export function niveauAideMaxFonctionDerivee(): number {
  return NIVEAU_AIDE_MAX_FONCTION_DERIVEE;
}

function etatInitial(exercice: ExerciceFonctionDerivee): Pick<EtatSessionFonctionDerivee, "exerciceCourant" | "phase" | "typeRetenu" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: "reconnaissance", typeRetenu: null, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionFonctionDerivee(reglages: ReglagesSession5e, generateur: () => ExerciceFonctionDerivee): EtatSessionFonctionDerivee {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionFonctionDerivee): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

export function activerAideSuivante(etat: EtatSessionFonctionDerivee): EtatSessionFonctionDerivee {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= NIVEAU_AIDE_MAX_FONCTION_DERIVEE) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionFonctionDerivee, resultat: ResultatExerciceFonctionDerivee, revele: boolean): EtatSessionFonctionDerivee {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

/** Termine l'écran courant (score, pénalité d'aide) puis avance vers `phaseSuivante` — clôture
 * l'exercice si `phaseSuivante==="termine"`. `extra` permet à l'appelant d'injecter un champ
 * supplémentaire dans le nouvel état (ex. `typeRetenu`, décidé UNIQUEMENT à la sortie de
 * "reconnaissance"). */
function terminerEcranEtAvancer(
  etat: EtatSessionFonctionDerivee,
  ecranAttendu: EcranFonctionDerivee,
  etapeCourante: EtatEtapeTentatives,
  phaseSuivante: EcranFonctionDerivee | "termine",
  extra: Partial<EtatSessionFonctionDerivee> = {},
): EtatSessionFonctionDerivee {
  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [ecranAttendu]: score };

  if (phaseSuivante === "termine") {
    const resultat: ResultatExerciceFonctionDerivee = { exercice: etat.exerciceCourant, typeRetenu: (extra.typeRetenu ?? etat.typeRetenu) as TypeDerivee, scores: scoresPartiels };
    return cloturerExerciceOuSuivant(etat, resultat, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele, ...extra };
}

// ============================================================================
// Écran "reconnaissance" — choix de bouton parmi les 4 types.
// ============================================================================

export function soumettreReponseReconnaissance(etat: EtatSessionFonctionDerivee, choix: TypeDerivee): EtatSessionFonctionDerivee {
  if (etat.terminee || etat.phase !== "reconnaissance") throw new Error('soumettreReponseReconnaissance : la session n\'est pas à l\'écran "reconnaissance"');
  const exercice = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives(etat.etapeCourante, choix, {
    ...reglagesEtape(etat),
    verifier: (c: TypeDerivee) => exercice.typesAcceptes.includes(c),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const typeRetenu: TypeDerivee = etapeCourante.reussie ? choix : exercice.typesAcceptes[0];
  const phaseSuivante: EcranFonctionDerivee = typeRetenu === "reglebase" ? "calculer" : "decomposer";
  return terminerEcranEtAvancer(etat, "reconnaissance", etapeCourante, phaseSuivante, { typeRetenu });
}

// ============================================================================
// Écran "decomposer" — 2 variantes de champs selon `typeRetenu` (produit/quotient : u/v ;
// composee : intérieure/extérieure), UNE seule tentative combinée (1 bouton Valider) par écran.
// ============================================================================

export interface ReponseDecomposerUV {
  u: string;
  v: string;
}

export function soumettreReponseDecomposerUV(etat: EtatSessionFonctionDerivee, reponse: ReponseDecomposerUV): EtatSessionFonctionDerivee {
  if (etat.terminee || etat.phase !== "decomposer") throw new Error('soumettreReponseDecomposerUV : la session n\'est pas à l\'écran "decomposer"');
  const exercice = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r: ReponseDecomposerUV) => verifierDecompositionUV(r, exercice),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  return terminerEcranEtAvancer(etat, "decomposer", etapeCourante, "calculer");
}

export interface ReponseDecomposerComposee {
  interieur: string;
  exterieur: string;
}

export function soumettreReponseDecomposerComposee(etat: EtatSessionFonctionDerivee, reponse: ReponseDecomposerComposee): EtatSessionFonctionDerivee {
  if (etat.terminee || etat.phase !== "decomposer") throw new Error('soumettreReponseDecomposerComposee : la session n\'est pas à l\'écran "decomposer"');
  const exercice = etat.exerciceCourant;
  const typeRetenu = etat.typeRetenu as TypeDerivee;
  const etapeCourante = soumettreEtapeTentatives(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier: (r: ReponseDecomposerComposee) => verifierDecompositionComposee(r, exercice, typeRetenu),
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  return terminerEcranEtAvancer(etat, "decomposer", etapeCourante, "calculer");
}

// ============================================================================
// Écran "calculer" — 1 champ (f'(x), forme exacte).
// ============================================================================

export function soumettreReponseCalculer(etat: EtatSessionFonctionDerivee, texte: string): EtatSessionFonctionDerivee {
  if (etat.terminee || etat.phase !== "calculer") throw new Error('soumettreReponseCalculer : la session n\'est pas à l\'écran "calculer"');
  const exercice = etat.exerciceCourant;
  const etapeCourante = soumettreEtapeTentatives(etat.etapeCourante, texte, {
    ...reglagesEtape(etat),
    verifier: (t: string) => diagnostiquerCalculerDerivee(t, exercice) === "correct",
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };
  return terminerEcranEtAvancer(etat, "calculer", etapeCourante, "termine");
}
