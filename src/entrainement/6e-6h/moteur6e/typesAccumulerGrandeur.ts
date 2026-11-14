import type { ExerciceAccumulerGrandeur } from "../core6e/accumulerGrandeur.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session de `6gen80` « Accumuler une grandeur ». Chaîne FIXE de 5 écrans
 * pour toutes les variantes :
 * 1. `modele` — choix fermé (UNE tentative) : quelle expression donne la quantité demandée
 *    (pièges : quantité initiale oubliée, débit de sortie oublié, taux au lieu de son intégrale,
 *    mauvaises bornes, minutes au lieu d'heures) ;
 * 2. `primitive` — une primitive du taux (net) ;
 * 3. `quantite` — la quantité accumulée (avec la quantité initiale si elle existe) ;
 * 4. `transfert` — instant (volume maximal, cuve vide, salle pleine, batterie pleine, hauteur ou
 *    budget atteints) ou comparaison de deux scénarios ;
 * 5. `unite` — réponse dans l'unité demandée (conversion L → m³, min → h, W·h → kW·h, mm → L sur
 *    un toit, kt → Mt).
 */

export type PhaseAccumulerGrandeur = "modele" | "primitive" | "quantite" | "transfert" | "unite";

export const PHASES_ACCUMULER_GRANDEUR: PhaseAccumulerGrandeur[] = ["modele", "primitive", "quantite", "transfert", "unite"];

export function phaseApres(phase: PhaseAccumulerGrandeur): PhaseAccumulerGrandeur | "termine" {
  const i = PHASES_ACCUMULER_GRANDEUR.indexOf(phase);
  return i < PHASES_ACCUMULER_GRANDEUR.length - 1 ? PHASES_ACCUMULER_GRANDEUR[i + 1] : "termine";
}

/** Seul écran à choix fermé (une seule tentative). */
export function estPhaseChoix(phase: PhaseAccumulerGrandeur): boolean {
  return phase === "modele";
}

export interface EtatSessionAccumulerGrandeur {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceAccumulerGrandeur;
  exerciceCourant: ExerciceAccumulerGrandeur;
  phase: PhaseAccumulerGrandeur;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  revelesPartiels: Partial<Record<PhaseAccumulerGrandeur, boolean>>;
  aidePartiels: Partial<Record<PhaseAccumulerGrandeur, boolean>>;
  derniereTransitionRevelee: boolean;
  indexExercice: number;
  terminee: boolean;
}
