/**
 * Couche B (5e) — moteur de session pour 5gen17 ("Problèmes classiques sur les suites"). 26 écrans
 * répartis en 7 scénarios disjoints, chacun TOUJOURS traversé dans sa séquence COMPLÈTE (aucune
 * instance n'étant aléatoire, aucun saut conditionnel n'est nécessaire). N'importe jamais rien de
 * `src/generateurs5e/`.
 */
import type {
  ExerciceCarresEmboites,
  ExerciceEchiquier,
  ExerciceFibonacci,
  ExercicePapyrusRhind,
  ExerciceSuiteClassique,
  ExerciceSuitesCombinees,
  ExerciceTrianglesZigzag,
  ExerciceVitesse,
} from "../core5e/suitesClassiques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesSuiteClassique";
import type { EtatSessionSuiteClassique, PhaseSuiteClassique, ResultatExerciceSuiteClassique } from "./typesSuiteClassique";
import {
  diagnostiquerAiresB,
  diagnostiquerAiresZigzag,
  diagnostiquerAiresZigzagAC,
  diagnostiquerCalculV5,
  diagnostiquerDistance11,
  diagnostiquerDixTermes,
  diagnostiquerFormuleRecurrence,
  diagnostiquerHauteursZigzag,
  diagnostiquerLimitePuissanceA,
  diagnostiquerLongueurZigzag,
  diagnostiquerPoidsComparaison,
  diagnostiquerPoserEquationCombinees,
  diagnostiquerPoserSysteme,
  diagnostiquerProprieteInverse,
  diagnostiquerResoudrePhi,
  diagnostiquerResoudreRCombinees,
  diagnostiquerResoudreSysteme,
  diagnostiquerSommeInfinieA,
  diagnostiquerSommeInfinieB,
  diagnostiquerSommePartielleA,
  diagnostiquerSommeTotale11,
  diagnostiquerSommeTotaleEchiquier,
  diagnostiquerSuiteFinalePapyrus,
  diagnostiquerSuitesFinalesCombinees,
  diagnostiquerTroisMethodes,
  diagnostiquerU64,
} from "./verificationSuiteClassique";
import type { ChoixEquationCombinees, ChoixFormuleRecurrence, ChoixLimitePuissanceA, ChoixLongueurZigzag, ChoixProprieteInverse, ChoixSysteme } from "./verificationSuiteClassique";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

export const NIVEAU_AIDE_MAX_SUITE_CLASSIQUE = 2;

function etatInitial(exercice: ExerciceSuiteClassique): Pick<EtatSessionSuiteClassique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionSuiteClassique(reglages: ReglagesSession5e, generateur: () => ExerciceSuiteClassique): EtatSessionSuiteClassique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionSuiteClassique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** Plafond d'aide PAR PHASE (B.3, `promptcorrectionsround2.md`) — remplace l'usage nu de
 * `NIVEAU_AIDE_MAX_SUITE_CLASSIQUE` (toujours 2). `texteAideNiveau2()`
 * (`ui5e/formatSuiteClassique.ts`) ne couvre que 4 des 26 phases du générateur (chacune
 * exclusive à un seul scénario via `ORDRE_PHASES` — voir `typesSuiteClassique.ts` — donc la
 * condition de scénario de `texteAideNiveau2` est TOUJOURS vraie dès que la phase correspondante
 * est atteinte) : "resoudreSysteme", "resoudreRCombinees", "troisMethodes", "resoudrePhi". Les 22
 * autres phases retombent sur `return ""` — chaque scénario traversant TOUJOURS sa séquence
 * complète (aucun tirage conditionnel, voir la doc de tête de `typesSuiteClassique.ts`), ces
 * écrans sont systématiquement atteints avec un niveau 2 vide. "suitesFinalesCombinees" cumule un
 * second défaut (son composant `EtapeSuitesFinalesCombinees.tsx` n'a même aucune branche
 * `niveauAide>=2`) — déjà couvert par ce plafonnage à 1, qui masque le bouton dans tous les cas. */
const PHASES_AVEC_AIDE_NIVEAU2 = new Set<PhaseSuiteClassique>(["resoudreSysteme", "resoudreRCombinees", "troisMethodes", "resoudrePhi"]);

export function niveauAideMaxSuiteClassique(phase: PhaseSuiteClassique): number {
  return PHASES_AVEC_AIDE_NIVEAU2.has(phase) ? NIVEAU_AIDE_MAX_SUITE_CLASSIQUE : 1;
}

export function activerAideSuivante(etat: EtatSessionSuiteClassique): EtatSessionSuiteClassique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxSuiteClassique(etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionSuiteClassique, resultat: ResultatExerciceSuiteClassique, revele: boolean): EtatSessionSuiteClassique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionSuiteClassique, phaseAttendue: PhaseSuiteClassique, reponse: T, verifier: (r: T) => boolean): EtatSessionSuiteClassique {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });
  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = Math.max(0, (etapeCourante.score as number) - etat.niveauAide * PENALITE_PAR_NIVEAU_AIDE);
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, { exercice: etat.exerciceCourant, scores: scoresPartiels }, revele);
  }
  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

function commeEchiquier(exercice: ExerciceSuiteClassique): ExerciceEchiquier {
  if (exercice.scenario !== "echiquier") throw new Error("commeEchiquier : scénario hors 'echiquier'");
  return exercice;
}
function commePapyrus(exercice: ExerciceSuiteClassique): ExercicePapyrusRhind {
  if (exercice.scenario !== "papyrusRhind") throw new Error("commePapyrus : scénario hors 'papyrusRhind'");
  return exercice;
}
function commeCombinees(exercice: ExerciceSuiteClassique): ExerciceSuitesCombinees {
  if (exercice.scenario !== "suitesCombinees") throw new Error("commeCombinees : scénario hors 'suitesCombinees'");
  return exercice;
}
function commeVitesse(exercice: ExerciceSuiteClassique): ExerciceVitesse {
  if (exercice.scenario !== "vitesse") throw new Error("commeVitesse : scénario hors 'vitesse'");
  return exercice;
}
function commeFibonacci(exercice: ExerciceSuiteClassique): ExerciceFibonacci {
  if (exercice.scenario !== "fibonacci") throw new Error("commeFibonacci : scénario hors 'fibonacci'");
  return exercice;
}
function commeZigzag(exercice: ExerciceSuiteClassique): ExerciceTrianglesZigzag {
  if (exercice.scenario !== "trianglesZigzag") throw new Error("commeZigzag : scénario hors 'trianglesZigzag'");
  return exercice;
}
function commeCarres(exercice: ExerciceSuiteClassique): ExerciceCarresEmboites {
  if (exercice.scenario !== "carresEmboites") throw new Error("commeCarres : scénario hors 'carresEmboites'");
  return exercice;
}

// ============================================================================
// echiquier
// ============================================================================
export function soumettreReponseU64(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeEchiquier(etat.exerciceCourant);
  return soumettreEcran(etat, "u64", texte, (t) => diagnostiquerU64(t, exo) === "correct");
}
export function soumettreReponseSommeTotaleEchiquier(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeEchiquier(etat.exerciceCourant);
  return soumettreEcran(etat, "sommeTotaleEchiquier", texte, (t) => diagnostiquerSommeTotaleEchiquier(t, exo) === "correct");
}
export function soumettreReponsePoidsComparaison(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeEchiquier(etat.exerciceCourant);
  return soumettreEcran(etat, "poidsComparaison", textes, (t) => diagnostiquerPoidsComparaison(t, exo) === "correct");
}

// ============================================================================
// papyrusRhind
// ============================================================================
export function soumettreReponsePoserSysteme(etat: EtatSessionSuiteClassique, choix: ChoixSysteme): EtatSessionSuiteClassique {
  commePapyrus(etat.exerciceCourant);
  return soumettreEcran(etat, "poserSysteme", choix, diagnostiquerPoserSysteme);
}
export function soumettreReponseResoudreSysteme(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commePapyrus(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreSysteme", textes, (t) => diagnostiquerResoudreSysteme(t, exo) === "correct");
}
export function soumettreReponseSuiteFinalePapyrus(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commePapyrus(etat.exerciceCourant);
  return soumettreEcran(etat, "suiteFinalePapyrus", textes, (t) => diagnostiquerSuiteFinalePapyrus(t, exo) === "correct");
}

// ============================================================================
// suitesCombinees
// ============================================================================
export function soumettreReponsePoserEquationCombinees(etat: EtatSessionSuiteClassique, choix: ChoixEquationCombinees): EtatSessionSuiteClassique {
  commeCombinees(etat.exerciceCourant);
  return soumettreEcran(etat, "poserEquationCombinees", choix, diagnostiquerPoserEquationCombinees);
}
export function soumettreReponseResoudreRCombinees(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeCombinees(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreRCombinees", texte, (t) => diagnostiquerResoudreRCombinees(t, exo) === "correct");
}
export function soumettreReponseSuitesFinalesCombinees(etat: EtatSessionSuiteClassique, reponse: { arithmetique: string[]; geometrique: string[] }): EtatSessionSuiteClassique {
  const exo = commeCombinees(etat.exerciceCourant);
  return soumettreEcran(etat, "suitesFinalesCombinees", reponse, (r) => diagnostiquerSuitesFinalesCombinees(r, exo) === "correct");
}

// ============================================================================
// vitesse
// ============================================================================
export function soumettreReponseDistance11(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeVitesse(etat.exerciceCourant);
  return soumettreEcran(etat, "distance11", texte, (t) => diagnostiquerDistance11(t, exo) === "correct");
}
export function soumettreReponseSommeTotale11(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeVitesse(etat.exerciceCourant);
  return soumettreEcran(etat, "sommeTotale11", texte, (t) => diagnostiquerSommeTotale11(t, exo) === "correct");
}
export function soumettreReponseTroisMethodes(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeVitesse(etat.exerciceCourant);
  return soumettreEcran(etat, "troisMethodes", textes, (t) => diagnostiquerTroisMethodes(t, exo) === "correct");
}

// ============================================================================
// fibonacci
// ============================================================================
export function soumettreReponseDixTermes(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeFibonacci(etat.exerciceCourant);
  return soumettreEcran(etat, "dixTermes", textes, (t) => diagnostiquerDixTermes(t, exo) === "correct");
}
export function soumettreReponseFormuleRecurrence(etat: EtatSessionSuiteClassique, choix: ChoixFormuleRecurrence): EtatSessionSuiteClassique {
  commeFibonacci(etat.exerciceCourant);
  return soumettreEcran(etat, "formuleRecurrence", choix, diagnostiquerFormuleRecurrence);
}
export function soumettreReponseCalculV5(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeFibonacci(etat.exerciceCourant);
  return soumettreEcran(etat, "calculV5", texte, (t) => diagnostiquerCalculV5(t, exo) === "correct");
}
export function soumettreReponseResoudrePhi(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeFibonacci(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudrePhi", texte, (t) => diagnostiquerResoudrePhi(t, exo) === "correct");
}
export function soumettreReponseProprieteInverse(etat: EtatSessionSuiteClassique, choix: ChoixProprieteInverse): EtatSessionSuiteClassique {
  commeFibonacci(etat.exerciceCourant);
  return soumettreEcran(etat, "proprieteInverse", choix, diagnostiquerProprieteInverse);
}

// ============================================================================
// trianglesZigzag
// ============================================================================
export function soumettreReponseHauteursZigzag(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeZigzag(etat.exerciceCourant);
  return soumettreEcran(etat, "hauteursZigzag", textes, (t) => diagnostiquerHauteursZigzag(t, exo) === "correct");
}
export function soumettreReponseAiresZigzag(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeZigzag(etat.exerciceCourant);
  return soumettreEcran(etat, "airesZigzag", textes, (t) => diagnostiquerAiresZigzag(t, exo) === "correct");
}
export function soumettreReponseLongueurZigzag(etat: EtatSessionSuiteClassique, choix: ChoixLongueurZigzag): EtatSessionSuiteClassique {
  commeZigzag(etat.exerciceCourant);
  return soumettreEcran(etat, "longueurZigzag", choix, diagnostiquerLongueurZigzag);
}
export function soumettreReponseAiresZigzagAC(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeZigzag(etat.exerciceCourant);
  return soumettreEcran(etat, "airesZigzagAC", textes, (t) => diagnostiquerAiresZigzagAC(t, exo) === "correct");
}

// ============================================================================
// carresEmboites
// ============================================================================
export function soumettreReponseSommePartielleA(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeCarres(etat.exerciceCourant);
  return soumettreEcran(etat, "sommePartielleA", texte, (t) => diagnostiquerSommePartielleA(t, exo) === "correct");
}
export function soumettreReponseLimitePuissanceA(etat: EtatSessionSuiteClassique, choix: ChoixLimitePuissanceA): EtatSessionSuiteClassique {
  commeCarres(etat.exerciceCourant);
  return soumettreEcran(etat, "limitePuissanceA", choix, diagnostiquerLimitePuissanceA);
}
export function soumettreReponseSommeInfinieA(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeCarres(etat.exerciceCourant);
  return soumettreEcran(etat, "sommeInfinieA", texte, (t) => diagnostiquerSommeInfinieA(t, exo) === "correct");
}
export function soumettreReponseAiresB(etat: EtatSessionSuiteClassique, textes: string[]): EtatSessionSuiteClassique {
  const exo = commeCarres(etat.exerciceCourant);
  return soumettreEcran(etat, "airesB", textes, (t) => diagnostiquerAiresB(t, exo) === "correct");
}
export function soumettreReponseSommeInfinieB(etat: EtatSessionSuiteClassique, texte: string): EtatSessionSuiteClassique {
  const exo = commeCarres(etat.exerciceCourant);
  return soumettreEcran(etat, "sommeInfinieB", texte, (t) => diagnostiquerSommeInfinieB(t, exo) === "correct");
}
