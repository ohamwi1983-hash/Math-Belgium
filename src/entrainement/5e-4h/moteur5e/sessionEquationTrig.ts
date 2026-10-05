/**
 * Couche B (5e) — moteur de session pour 5gen10, EXTENSION à 4 familles ("Équations
 * trigonométriques", voir CLAUDE.md section 5gen10 "Extension — 4 familles"). N'importe jamais
 * rien de `src/generateurs5e/` — voir `sessionEquationTrig.test.ts` pour la preuve avec des
 * exercices factices définis localement, un par famille.
 *
 * Écran 0 ("reconnaissance") commun, puis dispatch vers l'une des 4 séquences de
 * `typesEquationTrig.ts` (`phaseApres`). 2 niveaux d'aide UNIFORMES sur tous les écrans (spec
 * explicite, jamais dynamique) — même plafond `NIVEAU_AIDE_MAX_EQUATION_TRIG` qu'avant l'extension.
 */
import type {
  ExerciceEgaliteExpressions,
  ExerciceEquationTrig,
  ExerciceEquationTrigonometrique,
  ExerciceProduitFacteurs,
  ExercicePythagoricienne,
  FamilleEquationTrigonometrique,
  GenerateurExerciceEquationTrigonometrique,
} from "../core5e/equationsTrigonometriques.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import { demarrerEtapeTentatives, soumettreEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesEtape } from "../moteur/etapeTentatives";
import { phaseApres, phaseInitiale } from "./typesEquationTrig";
import type { EtatSessionEquationTrigonometrique, PhaseEquationTrigonometrique, ResultatExerciceEquationTrigonometrique } from "./typesEquationTrig";
import {
  diagnostiquerArgument,
  diagnostiquerArgumentProduit,
  diagnostiquerConversionEgalite,
  diagnostiquerConversionPythagoricienne,
  diagnostiquerFactorisationProduit,
  diagnostiquerIsolerX,
  diagnostiquerIsolerXProduit,
  diagnostiquerRacinesPythagoricienne,
  diagnostiquerRacinesResolution,
  diagnostiquerReconnaissance,
  diagnostiquerResoudreEgalite,
  diagnostiquerSeparerFacteurs,
  diagnostiquerSolutions,
  diagnostiquerSolutionsEgalite,
  diagnostiquerSolutionsProduit,
  diagnostiquerSolutionsPythagoricienne,
} from "./verificationEquationTrig";
import type { ReponseArgument, ReponseDeuxFacteursArgument, ReponseDeuxFacteursLignes, ReponseRacinesPythagoricienne } from "./verificationEquationTrig";

const POINTS_DE_BASE = 100;
const PENALITE_PAR_NIVEAU_AIDE = 20;

/** 2 niveaux d'aide sur chaque écran — spec explicite, jamais dynamique (contrairement à
 * gen17/gen58, 4e). */
export const NIVEAU_AIDE_MAX_EQUATION_TRIG = 2;

function commeDirecte(exercice: ExerciceEquationTrigonometrique): ExerciceEquationTrig {
  if (exercice.famille !== "directe") throw new Error("commeDirecte : exercice hors famille 'directe'");
  return exercice.exercice;
}

function commeProduit(exercice: ExerciceEquationTrigonometrique): ExerciceProduitFacteurs {
  if (exercice.famille !== "produit") throw new Error("commeProduit : exercice hors famille 'produit'");
  return exercice;
}

function commePythagoricienne(exercice: ExerciceEquationTrigonometrique): ExercicePythagoricienne {
  if (exercice.famille !== "pythagoricienne") throw new Error("commePythagoricienne : exercice hors famille 'pythagoricienne'");
  return exercice;
}

function commeEgalite(exercice: ExerciceEquationTrigonometrique): ExerciceEgaliteExpressions {
  if (exercice.famille !== "egalite") throw new Error("commeEgalite : exercice hors famille 'egalite'");
  return exercice;
}

function etatInitial(exercice: ExerciceEquationTrigonometrique): Pick<EtatSessionEquationTrigonometrique, "exerciceCourant" | "phase" | "etapeCourante" | "niveauAide" | "scoresPartiels"> {
  return {
    exerciceCourant: exercice,
    phase: phaseInitiale(),
    etapeCourante: demarrerEtapeTentatives(),
    niveauAide: 0,
    scoresPartiels: {},
  };
}

export function demarrerSessionEquationTrig(reglages: ReglagesSession5e, generateur: GenerateurExerciceEquationTrigonometrique): EtatSessionEquationTrigonometrique {
  return { reglages, generateur, indexExercice: 0, resultats: [], terminee: false, derniereEtapeRevelee: false, ...etatInitial(generateur()) };
}

function reglagesEtape(etat: EtatSessionEquationTrigonometrique): ReglagesEtape {
  return { pointsDeBase: POINTS_DE_BASE, tentativesMax: etat.reglages.tentativesMax, penaliteActivee: etat.reglages.penaliteActivee };
}

function appliquerPenaliteNiveau(score: number, niveauAide: number): number {
  return Math.max(0, score - niveauAide * PENALITE_PAR_NIVEAU_AIDE);
}

/** Plafond d'aide PAR PHASE (B.3, `promptcorrectionsround2.md`, revu par la correction D/E/F/G) —
 * remplace l'usage nu de `NIVEAU_AIDE_MAX_EQUATION_TRIG` (toujours 2), qui laissait le bouton "Aide
 * supplémentaire" cliquable/pénalisant pour des écrans dont le niveau 2 n'a en réalité aucun
 * contenu, ou dont l'aide a été explicitement retirée par la correction :
 * - "racinesPythagoricienne"/"racinesResolution" — jamais eu de branche niveau 2.
 * - "isolerX"/"isolerXProduit" — D.2/E.1 : aide retirée ENTIÈREMENT (0, pas de bouton du tout).
 * - "prefacteur" (E.3), "separerFacteurs" (E.4, donnait la réponse), "conversionPythagoricienne"
 *   (F.2), "conversionEgalite" (G.1) — niveau 2 retiré, niveau 1 conservé.
 * "argument"/"argumentProduit" restent au plafond uniforme (2) pour toute fonction, y compris tan —
 * `texteAideArgumentNiveau2` a désormais un texte réel pour tan (D.1), plus de cas particulier. */
export function niveauAideMaxEquationTrig(_exercice: ExerciceEquationTrigonometrique, phase: PhaseEquationTrigonometrique): number {
  if (phase === "racinesPythagoricienne" || phase === "racinesResolution") return 1;
  if (phase === "isolerX" || phase === "isolerXProduit") return 0;
  if (phase === "prefacteur" || phase === "separerFacteurs" || phase === "conversionPythagoricienne" || phase === "conversionEgalite") return 1;
  return NIVEAU_AIDE_MAX_EQUATION_TRIG;
}

export function activerAideSuivante(etat: EtatSessionEquationTrigonometrique): EtatSessionEquationTrigonometrique {
  if (etat.terminee) throw new Error("activerAideSuivante : la session est déjà terminée");
  if (etat.niveauAide >= niveauAideMaxEquationTrig(etat.exerciceCourant, etat.phase)) throw new Error("activerAideSuivante : niveau d'aide maximal déjà atteint pour cet écran");
  return { ...etat, niveauAide: etat.niveauAide + 1 };
}

function cloturerExerciceOuSuivant(etat: EtatSessionEquationTrigonometrique, resultat: ResultatExerciceEquationTrigonometrique, revele: boolean): EtatSessionEquationTrigonometrique {
  const resultats = [...etat.resultats, resultat];
  const indexExercice = etat.indexExercice + 1;
  if (indexExercice >= etat.reglages.nombreExercices) {
    return { ...etat, resultats, indexExercice, terminee: true, derniereEtapeRevelee: revele };
  }
  return { ...etat, resultats, indexExercice, ...etatInitial(etat.generateur()), derniereEtapeRevelee: revele };
}

/** Construit le `Resultat*` terminal de la famille courante depuis `scoresPartiels` (déjà rempli
 * de tous les scores intermédiaires) + le score de la toute dernière phase (`dernierePhase`,
 * `dernierScore`), jamais recalculé depuis la saisie brute de l'élève. */
function construireResultat(exercice: ExerciceEquationTrigonometrique, scores: Partial<Record<PhaseEquationTrigonometrique, number>>): ResultatExerciceEquationTrigonometrique {
  const s = (phase: PhaseEquationTrigonometrique): number => scores[phase] as number;
  switch (exercice.famille) {
    case "directe":
      return {
        famille: "directe",
        exercice: exercice.exercice,
        scoreReconnaissance: s("reconnaissance"),
        scoreArgument: s("argument"),
        scoreIsolerX: scores.isolerX ?? null,
        scoreSolutions: scores.solutions ?? null,
      };
    case "produit":
      return {
        famille: "produit",
        exercice,
        scoreReconnaissance: s("reconnaissance"),
        scorePrefacteur: scores.prefacteur ?? null,
        scoreSeparerFacteurs: s("separerFacteurs"),
        scoreArgumentProduit: s("argumentProduit"),
        scoreIsolerXProduit: s("isolerXProduit"),
        scoreSolutionsProduit: s("solutionsProduit"),
      };
    case "pythagoricienne":
      return {
        famille: "pythagoricienne",
        exercice,
        scoreReconnaissance: s("reconnaissance"),
        scoreConversionPythagoricienne: s("conversionPythagoricienne"),
        scoreRacinesPythagoricienne: s("racinesPythagoricienne"),
        scoreRacinesResolution: s("racinesResolution"),
        scoreSolutionsPythagoricienne: s("solutionsPythagoricienne"),
      };
    case "egalite":
      return {
        famille: "egalite",
        exercice,
        scoreReconnaissance: s("reconnaissance"),
        scoreConversionEgalite: s("conversionEgalite"),
        scoreResoudreEgalite: s("resoudreEgalite"),
        scoreSolutionsEgalite: s("solutionsEgalite"),
      };
  }
}

/** Soumission générique — factorise le motif commun aux 16 écrans (score par tentatives, pénalité
 * d'aide, transition de phase, clôture si terminal) derrière un seul point d'implémentation. */
function soumettreEcran<T>(etat: EtatSessionEquationTrigonometrique, phaseAttendue: PhaseEquationTrigonometrique, reponse: T, verifier: (r: T) => boolean): EtatSessionEquationTrigonometrique {
  if (etat.terminee || etat.phase !== phaseAttendue) throw new Error(`soumettreEcran : la session n'est pas à l'étape ${phaseAttendue}`);

  const etapeCourante = soumettreEtapeTentatives<T>(etat.etapeCourante, reponse, {
    ...reglagesEtape(etat),
    verifier,
    revelerReponse: () => {},
  });

  if (!etapeCourante.terminee) return { ...etat, etapeCourante };

  const revele = etapeCourante.revelee;
  const score = appliquerPenaliteNiveau(etapeCourante.score as number, etat.niveauAide);
  const scoresPartiels = { ...etat.scoresPartiels, [phaseAttendue]: score };
  const phaseSuivante = phaseApres(etat.exerciceCourant, phaseAttendue);

  if (phaseSuivante === "termine") {
    return cloturerExerciceOuSuivant(etat, construireResultat(etat.exerciceCourant, scoresPartiels), revele);
  }

  return { ...etat, etapeCourante: demarrerEtapeTentatives(), niveauAide: 0, phase: phaseSuivante, scoresPartiels, derniereEtapeRevelee: revele };
}

// ============================================================================
// Écran 0 — Reconnaissance (commune aux 4 familles).
// ============================================================================

export function soumettreReponseReconnaissance(etat: EtatSessionEquationTrigonometrique, choix: FamilleEquationTrigonometrique): EtatSessionEquationTrigonometrique {
  return soumettreEcran(etat, "reconnaissance", choix, (c) => diagnostiquerReconnaissance(etat.exerciceCourant, c) === "correct");
}

// ============================================================================
// Famille "directe".
// ============================================================================

export function soumettreReponseArgument(etat: EtatSessionEquationTrigonometrique, reponse: ReponseArgument): EtatSessionEquationTrigonometrique {
  const exercice = commeDirecte(etat.exerciceCourant);
  return soumettreEcran(etat, "argument", reponse, (r) => diagnostiquerArgument(exercice, r) === "correct");
}

export function soumettreReponseIsolerX(etat: EtatSessionEquationTrigonometrique, lignes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commeDirecte(etat.exerciceCourant);
  return soumettreEcran(etat, "isolerX", lignes, (l) => diagnostiquerIsolerX(exercice, l) === "correct");
}

export function soumettreReponseSolutions(etat: EtatSessionEquationTrigonometrique, textes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commeDirecte(etat.exerciceCourant);
  return soumettreEcran(etat, "solutions", textes, (t) => diagnostiquerSolutions(exercice, t) === "correct");
}

// ============================================================================
// Famille "produit" (Produit de facteurs = 0).
// ============================================================================

export function soumettreReponsePrefacteur(etat: EtatSessionEquationTrigonometrique, texte: string): EtatSessionEquationTrigonometrique {
  const exercice = commeProduit(etat.exerciceCourant);
  if (exercice.sousCas !== "nonFactoree") throw new Error("soumettreReponsePrefacteur : écran absent pour le sous-cas 'factoree'");
  return soumettreEcran(etat, "prefacteur", texte, (t) => diagnostiquerFactorisationProduit(exercice, t) === "correct");
}

export function soumettreReponseSeparerFacteurs(etat: EtatSessionEquationTrigonometrique, lignes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commeProduit(etat.exerciceCourant);
  return soumettreEcran(etat, "separerFacteurs", lignes, (l) => diagnostiquerSeparerFacteurs(exercice, l) === "correct");
}

export function soumettreReponseArgumentProduit(etat: EtatSessionEquationTrigonometrique, reponse: ReponseDeuxFacteursArgument): EtatSessionEquationTrigonometrique {
  const exercice = commeProduit(etat.exerciceCourant);
  return soumettreEcran(etat, "argumentProduit", reponse, (r) => diagnostiquerArgumentProduit(exercice, r) === "correct");
}

export function soumettreReponseIsolerXProduit(etat: EtatSessionEquationTrigonometrique, reponse: ReponseDeuxFacteursLignes): EtatSessionEquationTrigonometrique {
  const exercice = commeProduit(etat.exerciceCourant);
  return soumettreEcran(etat, "isolerXProduit", reponse, (r) => diagnostiquerIsolerXProduit(exercice, r) === "correct");
}

export function soumettreReponseSolutionsProduit(etat: EtatSessionEquationTrigonometrique, textes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commeProduit(etat.exerciceCourant);
  return soumettreEcran(etat, "solutionsProduit", textes, (t) => diagnostiquerSolutionsProduit(exercice, t) === "correct");
}

// ============================================================================
// Famille "pythagoricienne" (Substitution pythagoricienne).
// ============================================================================

export function soumettreReponseConversionPythagoricienne(etat: EtatSessionEquationTrigonometrique, texte: string): EtatSessionEquationTrigonometrique {
  const exercice = commePythagoricienne(etat.exerciceCourant);
  return soumettreEcran(etat, "conversionPythagoricienne", texte, (t) => diagnostiquerConversionPythagoricienne(exercice, t) === "correct");
}

export function soumettreReponseRacinesPythagoricienne(etat: EtatSessionEquationTrigonometrique, textes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commePythagoricienne(etat.exerciceCourant);
  return soumettreEcran(etat, "racinesPythagoricienne", textes, (t) => diagnostiquerRacinesPythagoricienne(exercice, t) === "correct");
}

export function soumettreReponseRacinesResolution(etat: EtatSessionEquationTrigonometrique, reponse: ReponseRacinesPythagoricienne): EtatSessionEquationTrigonometrique {
  const exercice = commePythagoricienne(etat.exerciceCourant);
  return soumettreEcran(etat, "racinesResolution", reponse, (r) => diagnostiquerRacinesResolution(exercice, r) === "correct");
}

export function soumettreReponseSolutionsPythagoricienne(etat: EtatSessionEquationTrigonometrique, textes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commePythagoricienne(etat.exerciceCourant);
  return soumettreEcran(etat, "solutionsPythagoricienne", textes, (t) => diagnostiquerSolutionsPythagoricienne(exercice, t) === "correct");
}

// ============================================================================
// Famille "egalite" (Égalité de deux expressions trigonométriques).
// ============================================================================

export function soumettreReponseConversionEgalite(etat: EtatSessionEquationTrigonometrique, texte: string): EtatSessionEquationTrigonometrique {
  const exercice = commeEgalite(etat.exerciceCourant);
  return soumettreEcran(etat, "conversionEgalite", texte, (t) => diagnostiquerConversionEgalite(exercice, t) === "correct");
}

export function soumettreReponseResoudreEgalite(etat: EtatSessionEquationTrigonometrique, lignes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commeEgalite(etat.exerciceCourant);
  return soumettreEcran(etat, "resoudreEgalite", lignes, (l) => diagnostiquerResoudreEgalite(exercice, l) === "correct");
}

export function soumettreReponseSolutionsEgalite(etat: EtatSessionEquationTrigonometrique, textes: string[]): EtatSessionEquationTrigonometrique {
  const exercice = commeEgalite(etat.exerciceCourant);
  return soumettreEcran(etat, "solutionsEgalite", textes, (t) => diagnostiquerSolutionsEgalite(exercice, t) === "correct");
}
