/**
 * Couche B (6e) — types pour `6gen21`. Les 5 familles suivent les 6 MÊMES écrans que `6gen11`
 * (domaine → limites → asymptotes → croissance → concavité → graphique) ; seule la forme de
 * l'écran "croissance" change pour la famille C (tableau de signe à 4 cases).
 */
import type { ExerciceEtudeFonctionLogarithme } from "../core6e/etudeFonctionLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEtudeFonctionLogarithme = "domaine" | "limites" | "asymptotes" | "croissance" | "concavite" | "graphique";

export const PHASES_ETUDE_LOG: PhaseEtudeFonctionLogarithme[] = ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];

export function phaseInitiale(): PhaseEtudeFonctionLogarithme {
  return "domaine";
}

export function phaseApres(phase: PhaseEtudeFonctionLogarithme): PhaseEtudeFonctionLogarithme | "termine" {
  const i = PHASES_ETUDE_LOG.indexOf(phase);
  return i === PHASES_ETUDE_LOG.length - 1 ? "termine" : PHASES_ETUDE_LOG[i + 1];
}

/** Nombre de tentatives par écran (audit chapitre 3 de 6e) : une seule sur le QCM graphique (4
 * courbes — sinon il se gagne par élimination) ; 2 sur la concavité (3 catégories, dont 2 sans
 * saisie) ; le réglage de session ailleurs (saisies ouvertes ou combinaisons nombreuses). */
export function tentativesMaxPhase(phase: PhaseEtudeFonctionLogarithme, tentativesSession: number): number {
  if (phase === "graphique") return 1;
  if (phase === "concavite") return Math.min(2, tentativesSession);
  return tentativesSession;
}

/** Détail de clôture d'un écran (`revele`/`niveauAide` AU MOMENT PRÉCIS de la clôture, avant que la
 * transition de phase suivante ne remette `niveauAide` à zéro) — jamais dérivé du score. Même
 * principe que `6gen16`/`6gen7` : capturé DANS le moteur (`detailsPartiels`), jamais recalculé côté
 * App — évite par construction le piège "revele stale" (voir CLAUDE.md, point 7 des clarifications
 * de ce générateur). */
export interface DetailPhaseEtudeFonctionLogarithme {
  revele: boolean;
  niveauAide: number;
}

/** Scores de l'exercice clos (6 écrans pour toutes les familles). */
export interface ResultatExerciceEtudeFonctionLogarithme {
  exercice: ExerciceEtudeFonctionLogarithme;
  scoreDomaine: number;
  scoreLimites: number;
  scoreAsymptotes: number;
  scoreCroissance: number;
  scoreConcavite: number;
  scoreGraphique: number;
  details: Partial<Record<PhaseEtudeFonctionLogarithme, DetailPhaseEtudeFonctionLogarithme>>;
}

export interface EtatSessionEtudeFonctionLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEtudeFonctionLogarithme;
  exerciceCourant: ExerciceEtudeFonctionLogarithme;
  phase: PhaseEtudeFonctionLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseEtudeFonctionLogarithme, number>>;
  detailsPartiels: Partial<Record<PhaseEtudeFonctionLogarithme, DetailPhaseEtudeFonctionLogarithme>>;
  indexExercice: number;
  resultats: ResultatExerciceEtudeFonctionLogarithme[];
  terminee: boolean;
}

