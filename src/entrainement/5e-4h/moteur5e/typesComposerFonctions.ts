import type { CompositionDirigee, ExerciceComposerFonctions, GenerateurExerciceComposerFonctions } from "../core5e/composerFonctions.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/**
 * Séquence d'écrans D.4 (`promptcorrectionsregroupees.md`) — DYNAMIQUE, contrairement au modèle
 * fixe à 5 écrans d'origine : chaque direction (f∘g, g∘f) traverse son PROPRE pipeline
 * indépendamment, "simple" (2 écrans : formule → domaine) ou "riche" (5 écrans : formule →
 * conditions → c1 → c2 → domaine), selon la richesse de SA fonction intérieure (voir
 * `core5e/composerFonctions.types.ts`) — et les 2 pipelines se succèdent l'un après l'autre pour
 * `sens === "lesDeux"` (fRondG entier, PUIS gRondF entier). Noms de phase TOUJOURS suffixés par la
 * direction ("FRondG"/"GRondF"), même quand une seule des deux est présente — un seul espace de
 * noms, jamais 2 selon `sens` (même principe "phases suffixées" déjà établi côté 5gen15, voir
 * CLAUDE.md).
 */
export type PhaseComposerFonctions =
  | "formuleFRondG"
  | "conditionsFRondG"
  | "c1FRondG"
  | "c2FRondG"
  | "domaineFRondG"
  | "formuleGRondF"
  | "conditionsGRondF"
  | "c1GRondF"
  | "c2GRondF"
  | "domaineGRondF"
  | "termine";

function ordreDirection(dir: CompositionDirigee, suffixe: "FRondG" | "GRondF"): PhaseComposerFonctions[] {
  const phases: PhaseComposerFonctions[] = [`formule${suffixe}` as PhaseComposerFonctions];
  if (dir.riche) {
    phases.push(`conditions${suffixe}` as PhaseComposerFonctions, `c1${suffixe}` as PhaseComposerFonctions, `c2${suffixe}` as PhaseComposerFonctions);
  }
  phases.push(`domaine${suffixe}` as PhaseComposerFonctions);
  return phases;
}

/** Séquence RÉELLE de phases pour CETTE instance — calculée une seule fois à la génération de
 * l'exercice, jamais recalculée à la volée pendant la session (garantit que `ordre`/`indexPhase`
 * restent cohérents tout au long de l'exercice). */
export function ordreComplet(exercice: ExerciceComposerFonctions): PhaseComposerFonctions[] {
  const phases: PhaseComposerFonctions[] = [];
  if (exercice.fRondG) phases.push(...ordreDirection(exercice.fRondG, "FRondG"));
  if (exercice.gRondF) phases.push(...ordreDirection(exercice.gRondF, "GRondF"));
  return phases;
}

/** `Partial<Record<...>>` plutôt que des champs fixes (voir `ResultatExerciceDeuxVersTrois`,
 * 5gen6) — l'ENSEMBLE des phases réellement traversées varie trop (2 à 10 selon `sens`/richesse des
 * 2 directions) pour un type à champs fixes. */
export interface ResultatExerciceComposerFonctions {
  exercice: ExerciceComposerFonctions;
  scores: Partial<Record<PhaseComposerFonctions, number>>;
  reveles: Partial<Record<PhaseComposerFonctions, boolean>>;
}

export interface EtatSessionComposerFonctions {
  reglages: ReglagesSession5e;
  generateur: GenerateurExerciceComposerFonctions;
  exerciceCourant: ExerciceComposerFonctions;
  /** Séquence complète de CET exercice (voir `ordreComplet`), figée à sa génération. */
  ordre: PhaseComposerFonctions[];
  indexPhase: number;
  phase: PhaseComposerFonctions;
  etapeCourante: EtatEtapeTentatives;
  /** Niveau d'aide de l'ÉCRAN EN COURS uniquement — remis à 0 à chaque transition de phase (même
   * principe qu'un unique compteur d'aide "courant", pas un champ nommé par écran comme l'ancien
   * modèle à 5 écrans fixes : la liste de phases étant désormais dynamique, un champ par nom de
   * phase serait à la fois plus lourd et inutile — le niveau d'aide RÉELLEMENT utilisé par écran clos
   * est de toute façon capturé côté présentation, voir `App5gen3.tsx::aideParPhase`, même patron déjà
   * établi pour les autres générateurs 5e). */
  niveauAide: number;
  /** Scores/révélations des phases DÉJÀ CLOSES de l'exercice en cours — accumulés au fil de la
   * traversée de `ordre`, copiés tels quels dans `ResultatExerciceComposerFonctions` à la clôture
   * de l'exercice (jamais recalculés). */
  scoresPartiels: Partial<Record<PhaseComposerFonctions, number>>;
  revelesPartiels: Partial<Record<PhaseComposerFonctions, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceComposerFonctions[];
  terminee: boolean;
}
