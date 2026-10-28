/**
 * Couche B (6e) — types pour `6gen11`. Contrairement à la plupart des moteurs récents du chantier,
 * les 4 familles suivent TOUJOURS EXACTEMENT LA MÊME séquence à 6 écrans FIXES (spec explicite :
 * "chaque instance suit les 6 mêmes tâches, dans l'ordre") — aucune variance de longueur/de saut
 * conditionnel à modéliser ici, donc un simple type de résultat à 6 champs `number` fixes (jamais
 * `null`, jamais un `Partial<Record<...>>`) suffit — plus simple que la plupart des moteurs récents
 * à cet égard, même principe que "Caractéristiques d'une fonction" (4e).
 */
import type { ExerciceEtudeFonctionExponentielle } from "../core6e/etudeFonctionExponentielle.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEtudeFonctionExponentielle = "domaine" | "limites" | "asymptotes" | "croissance" | "concavite" | "graphique";

const ORDRE: PhaseEtudeFonctionExponentielle[] = ["domaine", "limites", "asymptotes", "croissance", "concavite", "graphique"];

export function phaseInitiale(): PhaseEtudeFonctionExponentielle {
  return ORDRE[0];
}

export function phaseApres(phase: PhaseEtudeFonctionExponentielle): PhaseEtudeFonctionExponentielle | "termine" {
  const index = ORDRE.indexOf(phase);
  return index === ORDRE.length - 1 ? "termine" : ORDRE[index + 1];
}

export interface ResultatExerciceEtudeFonctionExponentielle {
  exercice: ExerciceEtudeFonctionExponentielle;
  scoreDomaine: number;
  scoreLimites: number;
  scoreAsymptotes: number;
  scoreCroissance: number;
  scoreConcavite: number;
  scoreGraphique: number;
}

export interface EtatSessionEtudeFonctionExponentielle {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEtudeFonctionExponentielle;
  exerciceCourant: ExerciceEtudeFonctionExponentielle;
  phase: PhaseEtudeFonctionExponentielle;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseEtudeFonctionExponentielle, number>>;
  /** vrai signal "révélé" par phase, peuplé depuis `etapeCourante.revelee` à la clôture — jusqu'au
   * 2025-10, le récapitulatif le déduisait de `scoresPartiels[phase] === 0`, corrigé pendant le
   * balayage générique (point A) car non fiable ici : l'ancienne pénalité d'aide (supprimée)
   * (`Math.max(0, score - niveauAide*20)`) était soustraite APRÈS le score de tentatives, donc une
   * réussite fortement aidée pouvait tomber à exactement 0 et s'afficher à tort comme "révélée". */
  revelesPartiels: Partial<Record<PhaseEtudeFonctionExponentielle, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceEtudeFonctionExponentielle[];
  terminee: boolean;
  /** `revele` de l'écran qui vient de se refermer suite au DERNIER appel `soumettreReponseXxx`
   * (`true` seulement si les tentatives ont été épuisées SANS réponse correcte) — jamais celui
   * d'un écran antérieur. Piège explicite (voir CLAUDE.md, "Récapitulatif final à plat, coloré") :
   * `etapeCourante.revelee` est TOUJOURS `false` au moment où l'appelant peut l'observer, car
   * `avancerPhase` réinitialise `etapeCourante` (`demarrerEtapeTentatives()`) dans LE MÊME appel
   * qui calcule la révélation, avant que l'état ne soit rendu à l'appelant — ce champ est le seul
   * moyen fiable pour `App6gen11.tsx` de capturer la couleur rouge du récapitulatif final. */
  derniereRevelee: boolean;
}
