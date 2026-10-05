/**
 * Couche B (5e) — types + ordre des écrans pour 5gen23 ("Limites et asymptotes en contexte").
 * N'importe jamais rien de `src/generateurs5e/`. 4 familles FIXES, chacune sa propre séquence
 * d'écrans (jamais un ordre variable dérivé de dimensions comme 5gen22) — certains noms de phase
 * sont RÉUTILISÉS entre familles (ex. "interpreter") sans porter la même cible : chaque écran se
 * dispatche par (famille, phase), jamais par phase seule.
 */
import type { ExerciceLimitesContexte } from "../core5e/limitesContexte.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";
import type { ReglagesSession5e } from "../core5e/session5e.types";

export type PhaseLimitesContexte =
  | "asymptoteHorizontale"
  | "interpreter"
  | "vaSens"
  | "construireC"
  | "limiteC"
  | "evaluer"
  | "inequation"
  | "asymptoteOblique"
  | "interpreterPente"
  | "identification"
  | "evaluerSeuil";

const ORDRE_PRIX_REVIENT: PhaseLimitesContexte[] = ["asymptoteHorizontale", "interpreter", "vaSens"];
const ORDRE_EAU_SALEE: PhaseLimitesContexte[] = ["construireC", "limiteC", "interpreter"];
const ORDRE_CLUB_LOISIRS: PhaseLimitesContexte[] = ["evaluer", "inequation", "asymptoteOblique", "interpreterPente"];
const ORDRE_POPULATION: PhaseLimitesContexte[] = ["identification", "interpreter", "evaluerSeuil"];

export function ordreComplet(exercice: ExerciceLimitesContexte): PhaseLimitesContexte[] {
  switch (exercice.famille) {
    case "prixRevient":
      return ORDRE_PRIX_REVIENT;
    case "eauSalee":
      return ORDRE_EAU_SALEE;
    case "clubLoisirs":
      return ORDRE_CLUB_LOISIRS;
    case "population":
      return ORDRE_POPULATION;
  }
}

export function phaseInitiale(exercice: ExerciceLimitesContexte): PhaseLimitesContexte {
  return ordreComplet(exercice)[0];
}

export function phaseApres(exercice: ExerciceLimitesContexte, phase: PhaseLimitesContexte): PhaseLimitesContexte | "termine" {
  const ordre = ordreComplet(exercice);
  const i = ordre.indexOf(phase);
  return i === ordre.length - 1 ? "termine" : ordre[i + 1];
}

export interface ResultatExerciceLimitesContexte {
  exercice: ExerciceLimitesContexte;
  scores: Partial<Record<PhaseLimitesContexte, number>>;
}

export interface EtatSessionLimitesContexte {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceLimitesContexte;
  exerciceCourant: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseLimitesContexte, number>>;
  indexExercice: number;
  resultats: ResultatExerciceLimitesContexte[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
