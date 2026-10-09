import type { ExerciceMethodeGeneratrices } from "../core6e/methodeGeneratrices.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Couche B (6e) — types de session pour `6gen57`. DÉCISION DE CONCEPTION DÉLIBÉRÉE (voir
 * `docs/historique-6e.md`, section 6gen57) : contrairement à la quasi-totalité des autres
 * générateurs 6e (où `PhaseXxx` porte une variante PAR FAMILLE, ex.
 * `moteur6e/typesDenombrementFondamental.ts`), les 5 familles de ce générateur traversent
 * EXACTEMENT la même succession de 5 écrans (poser les génératrices → éliminer α → factoriser →
 * statut des morceaux → décrire le lieu propre) — seule l'algèbre concrète change, jamais le NOMBRE
 * ni le SENS des écrans. `PhaseMethodeGeneratrices` est donc un simple enum à 5 valeurs, PARTAGÉ
 * par toutes les familles, plutôt qu'une union de variantes par famille — ce qui rend
 * `phaseApres`/`phasesPourExercice` triviaux (toujours les 5 mêmes écrans, jamais de branchement
 * sur `exercice.donnees.famille`).
 */

export type PhaseMethodeGeneratrices = "ecran1" | "ecran2" | "ecran3" | "ecran4" | "ecran5";

const ORDRE_PHASES: PhaseMethodeGeneratrices[] = ["ecran1", "ecran2", "ecran3", "ecran4", "ecran5"];

export function phaseInitiale(): PhaseMethodeGeneratrices {
  return ORDRE_PHASES[0];
}

export function phaseApres(phase: PhaseMethodeGeneratrices): PhaseMethodeGeneratrices | "termine" {
  const i = ORDRE_PHASES.indexOf(phase);
  return i + 1 < ORDRE_PHASES.length ? ORDRE_PHASES[i + 1] : "termine";
}

/** Toujours les 5 mêmes écrans, quelle que soit la famille — `exercice` n'est même pas consulté,
 * gardé en paramètre uniquement pour rester un mirroir d'appel de `phasesPourExercice` des autres
 * générateurs 6e (`ResultatPanelMethodeGeneratrices.tsx`/`formatMethodeGeneratrices.ts`). */
export function phasesPourExercice(_exercice?: ExerciceMethodeGeneratrices): PhaseMethodeGeneratrices[] {
  return [...ORDRE_PHASES];
}

export interface ResultatExerciceMethodeGeneratrices {
  exercice: ExerciceMethodeGeneratrices;
  scores: Partial<Record<PhaseMethodeGeneratrices, number>>;
}

export interface EtatSessionMethodeGeneratrices {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceMethodeGeneratrices;
  exerciceCourant: ExerciceMethodeGeneratrices;
  phase: PhaseMethodeGeneratrices;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseMethodeGeneratrices, number>>;
  indexExercice: number;
  resultats: ResultatExerciceMethodeGeneratrices[];
  terminee: boolean;
  derniereTransitionRevelee: boolean;
}
