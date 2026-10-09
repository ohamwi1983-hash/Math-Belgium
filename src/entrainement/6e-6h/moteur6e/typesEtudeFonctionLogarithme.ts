/**
 * Couche B (6e) — types pour `6gen21`. Contrairement à `6gen11` (TOUJOURS 6 écrans fixes pour ses 4
 * familles), le NOMBRE d'écrans varie ici selon la famille : 6 pour A-D (domaine → limites →
 * asymptotes → croissance → concavite → graphique), 2 seulement pour E (domaine → comportementInfini,
 * traitement qualitatif allégé — voir `core6e/etudeFonctionLogarithme.types.ts`). Même principe de
 * "variable screen count per family" que `6gen16` (`typesDomaineDeriveeLogarithme.ts`,
 * `phaseApres` dépendant de la famille) mais appliqué ici à un flux BEAUCOUP plus court (2 chemins
 * possibles, pas 7 espaces de phases nommés par famille) — un seul jeu de noms de phase partagé,
 * `phaseApres` prend la famille en paramètre plutôt que de préfixer chaque nom de phase par la
 * lettre de famille.
 */
import type { ExerciceEtudeFonctionLogarithme, FamilleEtudeFonctionLogarithme } from "../core6e/etudeFonctionLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEtudeFonctionLogarithme = "domaine" | "limites" | "asymptotes" | "croissance" | "concavite" | "graphique" | "comportementInfini";

export function phaseInitiale(): PhaseEtudeFonctionLogarithme {
  return "domaine";
}

/** Famille E : domaine → comportementInfini → terminé (2 écrans). Familles A-D : les 6 écrans
 * fixes, même ordre que `6gen11`. */
export function phaseApres(phase: PhaseEtudeFonctionLogarithme, famille: FamilleEtudeFonctionLogarithme): PhaseEtudeFonctionLogarithme | "termine" {
  if (famille === "E") {
    return phase === "domaine" ? "comportementInfini" : "termine";
  }
  switch (phase) {
    case "domaine":
      return "limites";
    case "limites":
      return "asymptotes";
    case "asymptotes":
      return "croissance";
    case "croissance":
      return "concavite";
    case "concavite":
      return "graphique";
    default:
      return "termine";
  }
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

/**
 * Scores partiels — champs `| null` plutôt qu'un union discriminée stricte par famille (voir
 * CLAUDE.md, "Total-points summary convention" : maximum variable par famille, 600 pour A-D, 200
 * pour E). `null` signifie "écran non applicable à cette famille", jamais "non encore atteint" (un
 * écran non encore atteint n'apparaît simplement pas dans `ResultatExerciceEtudeFonctionLogarithme`
 * tant que l'exercice n'est pas clos — ce type ne décrit que l'état FINAL, une fois l'exercice
 * entièrement résolu).
 */
export interface ResultatExerciceEtudeFonctionLogarithme {
  exercice: ExerciceEtudeFonctionLogarithme;
  scoreDomaine: number;
  scoreLimites: number | null;
  scoreAsymptotes: number | null;
  scoreCroissance: number | null;
  scoreConcavite: number | null;
  scoreGraphique: number | null;
  scoreComportementInfini: number | null;
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

/** Nombre d'écrans TOTAL pour une famille donnée — 6 pour A-D, 2 pour E. Utilisé par
 * `ui6e/formatEtudeFonctionLogarithme.ts::totalPointsRecap` pour le `maximum` variable (voir
 * CLAUDE.md, "Total-points summary convention"). */
export function nombreEcrans(famille: FamilleEtudeFonctionLogarithme): number {
  return famille === "E" ? 2 : 6;
}
