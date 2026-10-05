/**
 * Couche B (5e) — moteur de session pour 5gen13 ("Modéliser une fonction sinusoïdale en contexte").
 * N'importe jamais rien de `src/generateurs5e/` — voir `sessionModelisationSinusoide.test.ts` pour
 * la preuve avec des exercices factices définis localement.
 *
 * Chaque phase a une forme de réponse PROPRE (nombre simple, paire de champs, add-as-needed,
 * liste de paires...) — une fonction `soumettreReponseXxx` nommée par phase, plutôt qu'une seule
 * fonction générique (contrairement à 5gen12, où les 25 écrans étaient structurellement
 * identiques) : ici les formes diffèrent réellement d'un écran à l'autre.
 */
import type { DonneesB1, DonneesB2, DonneesB3, ExerciceModelisationSinusoide, QuestionExtremum, QuestionInequation, QuestionResoudre } from "../core5e/modelisationSinusoide.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesModelisationSinusoide";
import type { EtatSessionModelisationSinusoide, PhaseModelisationSinusoide, ResultatExerciceModelisationSinusoide } from "./typesModelisationSinusoide";
import {
  diagnostiquerArgumentResoudre,
  diagnostiquerFonctionFinale,
  diagnostiquerIsolerSinInequation,
  diagnostiquerIsolerTExtremum,
  diagnostiquerIsolerTInequation,
  diagnostiquerIsolerTResoudre,
  diagnostiquerListerIntervalles,
  diagnostiquerNombre,
  diagnostiquerNombreDixieme,
  diagnostiquerNombreUnite,
  diagnostiquerPhiModuloDeuxPi,
  diagnostiquerPoserExtremum,
  diagnostiquerResoudreUInequation,
  diagnostiquerSolutionsExtremum,
  diagnostiquerSolutionsResoudre,
  diagnostiquerSysteme,
} from "./verificationModelisationSinusoide";
import type { ReponseArgumentResoudre } from "./verificationModelisationSinusoide";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide, uniformes sur tous les écrans (même convention que la majorité du chantier 5e). */
export const NIVEAU_AIDE_MAX_MODELISATION = 2;

function etatInitial(exercice: ExerciceModelisationSinusoide): Pick<EtatSessionModelisationSinusoide, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return { exerciceCourant: exercice, phase: phaseInitiale(exercice), etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, scoresPartiels: {} };
}

export function demarrerSessionModelisationSinusoide(reglages: ReglagesSession5e, generateur: () => ExerciceModelisationSinusoide): EtatSessionModelisationSinusoide {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionModelisationSinusoide): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

/** Écrans "amplitude"/"decalage" (B1 A=R/b=R+h_sol, B2 A/b, phases PARTAGÉES entre les 2
 * techniques) — aide niveau 2 supprimée pour LES DEUX techniques identiquement (demande explicite
 * dans les 2 sections de `prompt5gen13B1B2.md`), jamais un plafond différent par technique ici. */
const PHASES_AIDE1_SEULE = new Set<PhaseModelisationSinusoide>(["amplitude", "decalage"]);

/** Écrans SANS AUCUNE aide (0 niveau) quand la technique correspond — `fonctionFinale` pour B1 ET
 * B2 (2 sections du prompt le demandent identiquement) ; "argumentResoudre"/"isolerTResoudre"/
 * "solutionsResoudre" UNIQUEMENT pour B2 (ce sont les écrans 6-8 de sa Phase 2 TOUJOURS "resoudre" —
 * voir `generateurs5e/modelisationSinusoide/index.ts`), jamais pour B3/"donnee" quand ces MÊMES
 * phases partagées apparaissent pour eux (hors périmètre du prompt, comportement inchangé). */
const PHASES_SANS_AIDE_B1_B2 = new Set<PhaseModelisationSinusoide>(["fonctionFinale"]);
const PHASES_SANS_AIDE_B2_SEUL = new Set<PhaseModelisationSinusoide>(["argumentResoudre", "isolerTResoudre", "solutionsResoudre"]);

/** Plafond d'aide PAR PHASE/INSTANCE (B.3, `promptcorrectionsround2.md`, étendu par
 * `prompt5gen13B1B2.md`) — remplace l'usage nu de `NIVEAU_AIDE_MAX_MODELISATION` (toujours 2). Sur
 * l'écran "isolerSinInequation", quand `question.casSpecial !== null` (cas |m|>1, boutons "Toujours
 * vraie"/"Toujours fausse"), `EtapeIsolerSinInequation.tsx` bloque explicitement le rendu du niveau 2
 * (aucun texte de repli prévu pour ce cas) — sans ce garde, le bouton "Aide supplémentaire" restait
 * cliquable/pénalisant pour un niveau 2 qui ne s'affiche jamais. Les autres phases gardent le
 * plafond uniforme, SAUF les phases B1/B2 listées ci-dessus (aide réduite ou totalement retirée). */
export function niveauAideMaxModelisation(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): number {
  if (phase === "isolerSinInequation" && exercice.phase2 !== null && "casSpecial" in exercice.phase2 && exercice.phase2.casSpecial !== null) {
    return 1;
  }
  const technique = exercice.phase1.technique;
  if ((technique === "b1" || technique === "b2") && PHASES_SANS_AIDE_B1_B2.has(phase)) return 0;
  if (technique === "b2" && PHASES_SANS_AIDE_B2_SEUL.has(phase)) return 0;
  if (PHASES_AIDE1_SEULE.has(phase)) return 1;
  if ((technique === "b1" || technique === "b2") && phase === "pulsation") return 1;
  if (technique === "b2" && phase === "phi") return 1;
  return NIVEAU_AIDE_MAX_MODELISATION;
}

export function activerAideSuivante(etat: EtatSessionModelisationSinusoide): EtatSessionModelisationSinusoide {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxModelisation(etat.exerciceCourant, etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionModelisationSinusoide, resultat: ResultatExerciceModelisationSinusoide, revele: boolean): EtatSessionModelisationSinusoide {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

function soumettreEcran<T>(etat: EtatSessionModelisationSinusoide, phaseAttendue: PhaseModelisationSinusoide, reponse: T, verifier: (r: T) => boolean): EtatSessionModelisationSinusoide {
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

// ============================================================================
// Accesseurs narrowed — gardes défensives (jamais atteintes en pratique, chaque phase n'étant
// accessible que depuis LA séquence à laquelle elle appartient — même principe que
// `commeDirecte`/`commeProduit` de 5gen10).
// ============================================================================

function commeB1OuB2(exercice: ExerciceModelisationSinusoide): DonneesB1 | DonneesB2 {
  const d = exercice.phase1;
  if (d.technique !== "b1" && d.technique !== "b2") throw new Error("commeB1OuB2 : technique hors 'b1'/'b2'");
  return d;
}
function commeB2(exercice: ExerciceModelisationSinusoide): DonneesB2 {
  const d = exercice.phase1;
  if (d.technique !== "b2") throw new Error("commeB2 : technique hors 'b2'");
  return d;
}
function commeB3(exercice: ExerciceModelisationSinusoide): DonneesB3 {
  const d = exercice.phase1;
  if (d.technique !== "b3") throw new Error("commeB3 : technique hors 'b3'");
  return d;
}
function commeResoudre(exercice: ExerciceModelisationSinusoide): QuestionResoudre {
  if (exercice.phase2 === null || exercice.phase2.type !== "resoudre") throw new Error("commeResoudre : phase2 hors type 'resoudre'");
  return exercice.phase2;
}
function commeExtremum(exercice: ExerciceModelisationSinusoide): QuestionExtremum {
  if (exercice.phase2 === null || exercice.phase2.type !== "extremum") throw new Error("commeExtremum : phase2 hors type 'extremum'");
  return exercice.phase2;
}
function commeInequation(exercice: ExerciceModelisationSinusoide): QuestionInequation {
  if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("commeInequation : phase2 hors type 'inequation'");
  return exercice.phase2;
}

// ============================================================================
// Phase 1 — B1/B2 (écrans partagés "amplitude"/"decalage").
// ============================================================================

export function soumettreReponseAmplitude(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const cible = commeB1OuB2(etat.exerciceCourant).fonction.A;
  return soumettreEcran(etat, "amplitude", texte, (t) => diagnostiquerNombreUnite(t, cible) === "correct");
}

export function soumettreReponseDecalage(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const cible = commeB1OuB2(etat.exerciceCourant).fonction.b;
  return soumettreEcran(etat, "decalage", texte, (t) => diagnostiquerNombreUnite(t, cible) === "correct");
}

// ============================================================================
// Phase 1 — B1/B2 (écran partagé "pulsation" — B1 calcule ω=2π/dureeTour DIRECTEMENT, jamais via
// une étape intermédiaire en degrés/seconde, `prompt5gen13B1B2B3.md`).
// ============================================================================

export function soumettreReponsePulsation(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const cible = commeB1OuB2(etat.exerciceCourant).fonction.omega;
  return soumettreEcran(etat, "pulsation", texte, (t) => diagnostiquerNombreDixieme(t, cible) === "correct");
}

// ============================================================================
// Phase 1 — B2 uniquement.
// ============================================================================

export function soumettreReponsePhi(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const cible = commeB2(etat.exerciceCourant).fonction.phi as number;
  return soumettreEcran(etat, "phi", texte, (t) => diagnostiquerPhiModuloDeuxPi(t, cible) === "correct");
}

// ============================================================================
// Phase 1 — B3 uniquement.
// ============================================================================

export interface ReponseSysteme {
  equation1: string;
  equation2: string;
}

export function soumettreReponseSysteme(etat: EtatSessionModelisationSinusoide, reponse: ReponseSysteme): EtatSessionModelisationSinusoide {
  const donnees = commeB3(etat.exerciceCourant);
  return soumettreEcran(etat, "systeme", reponse, (r) => {
    const [gauche1, droite1] = r.equation1.split("=");
    const [gauche2, droite2] = r.equation2.split("=");
    if (gauche1 === undefined || droite1 === undefined || gauche2 === undefined || droite2 === undefined) return false;
    const statut1 = diagnostiquerSysteme(gauche1, droite1, donnees.t1, 1, donnees.alpha1);
    const statut2 = diagnostiquerSysteme(gauche2, droite2, donnees.t2, 1, donnees.alpha2);
    return statut1 === "correct" && statut2 === "correct";
  });
}

export interface ReponseResolution {
  omega: string;
  phi: string;
}

export function soumettreReponseResolution(etat: EtatSessionModelisationSinusoide, reponse: ReponseResolution): EtatSessionModelisationSinusoide {
  const donnees = commeB3(etat.exerciceCourant);
  return soumettreEcran(etat, "resolution", reponse, (r) => diagnostiquerNombre(r.omega, donnees.fonction.omega) === "correct" && diagnostiquerNombre(r.phi, donnees.fonction.phi as number) === "correct");
}

// ============================================================================
// Phase 1 — écran terminal commun (B1/B2/B3).
// ============================================================================

export function soumettreReponseFonctionFinale(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const donnees = etat.exerciceCourant.phase1;
  return soumettreEcran(etat, "fonctionFinale", texte, (t) => diagnostiquerFonctionFinale(donnees, t) === "correct");
}

// ============================================================================
// Phase 2 — Type "resoudre".
// ============================================================================

export function soumettreReponseArgumentResoudre(etat: EtatSessionModelisationSinusoide, reponse: ReponseArgumentResoudre): EtatSessionModelisationSinusoide {
  const question = commeResoudre(etat.exerciceCourant);
  return soumettreEcran(etat, "argumentResoudre", reponse, (r) => diagnostiquerArgumentResoudre(question, r) === "correct");
}

export function soumettreReponseIsolerTResoudre(etat: EtatSessionModelisationSinusoide, lignes: string[]): EtatSessionModelisationSinusoide {
  const question = commeResoudre(etat.exerciceCourant);
  return soumettreEcran(etat, "isolerTResoudre", lignes, (l) => diagnostiquerIsolerTResoudre(question, l) === "correct");
}

export function soumettreReponseSolutionsResoudre(etat: EtatSessionModelisationSinusoide, textes: string[]): EtatSessionModelisationSinusoide {
  const question = commeResoudre(etat.exerciceCourant);
  return soumettreEcran(etat, "solutionsResoudre", textes, (t) => diagnostiquerSolutionsResoudre(question, t) === "correct");
}

// ============================================================================
// Phase 2 — Type "extremum".
// ============================================================================

export function soumettreReponsePoserExtremum(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const question = commeExtremum(etat.exerciceCourant);
  return soumettreEcran(etat, "poserExtremum", texte, (t) => diagnostiquerPoserExtremum(question, t) === "correct");
}

export function soumettreReponseIsolerTExtremum(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const question = commeExtremum(etat.exerciceCourant);
  return soumettreEcran(etat, "isolerTExtremum", texte, (t) => diagnostiquerIsolerTExtremum(question, t) === "correct");
}

export function soumettreReponseSolutionsExtremum(etat: EtatSessionModelisationSinusoide, textes: string[]): EtatSessionModelisationSinusoide {
  const question = commeExtremum(etat.exerciceCourant);
  return soumettreEcran(etat, "solutionsExtremum", textes, (t) => diagnostiquerSolutionsExtremum(question, t) === "correct");
}

// ============================================================================
// Phase 2 — Type "inequation".
// ============================================================================

export function soumettreReponseIsolerSinInequation(etat: EtatSessionModelisationSinusoide, texte: string): EtatSessionModelisationSinusoide {
  const question = commeInequation(etat.exerciceCourant);
  return soumettreEcran(etat, "isolerSinInequation", texte, (t) => diagnostiquerIsolerSinInequation(t, question.casSpecial, question.sens, question.m) === "correct");
}

export interface ReponseBornes {
  inf: string;
  sup: string;
}

export function soumettreReponseResoudreUInequation(etat: EtatSessionModelisationSinusoide, reponse: ReponseBornes): EtatSessionModelisationSinusoide {
  const question = commeInequation(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreUInequation", reponse, (r) => diagnostiquerResoudreUInequation(question, r.inf, r.sup) === "correct");
}

export function soumettreReponseIsolerTInequation(etat: EtatSessionModelisationSinusoide, reponse: ReponseBornes): EtatSessionModelisationSinusoide {
  const question = commeInequation(etat.exerciceCourant);
  return soumettreEcran(etat, "isolerTInequation", reponse, (r) => diagnostiquerIsolerTInequation(question, r.inf, r.sup) === "correct");
}

export function soumettreReponseListerIntervalles(etat: EtatSessionModelisationSinusoide, paires: [string, string][]): EtatSessionModelisationSinusoide {
  const question = commeInequation(etat.exerciceCourant);
  return soumettreEcran(etat, "listerIntervallesInequation", paires, (p) => diagnostiquerListerIntervalles(p, question.intervalles) === "correct");
}
