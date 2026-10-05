/**
 * Couche B (5e) — types pour 5gen27 ("Fonction dérivée"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Contrairement à 5gen26 (`PhaseDefinitionDerivee`, ordre d'écrans FIXE), la séquence d'écrans de
 * CET exercice dépend de la réponse de l'élève à l'écran "reconnaissance" : l'écran "decomposer"
 * est entièrement SAUTÉ quand le type retenu est "reglebase" (aucune décomposition u/v ou
 * intérieure/extérieure n'a de sens pour une simple somme de termes). `phase` reste donc une
 * simple chaîne (comme la plupart des générateurs 5e à séquence FIXE, ex. 5gen21), mais la
 * transition entre écrans est calculée au cas par cas dans `sessionFonctionDerivee.ts`, jamais
 * via une table `ORDRE_COMPLET` statique.
 */
import type { ExerciceFonctionDerivee, TypeDerivee } from "../core5e/fonctionDerivee.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranFonctionDerivee = "reconnaissance" | "decomposer" | "calculer";

/** Les 3 écrans possibles, dans l'ordre — utilisé UNIQUEMENT pour itérer côté récapitulatif
 * (`resultat.scores` ne porte que les écrans RÉELLEMENT traversés, "decomposer" absent pour
 * "reglebase") ; jamais une table de transition, la logique réelle vit dans
 * `sessionFonctionDerivee.ts`. */
export const ECRANS_POSSIBLES: EcranFonctionDerivee[] = ["reconnaissance", "decomposer", "calculer"];

export interface ResultatExerciceFonctionDerivee {
  exercice: ExerciceFonctionDerivee;
  /** Le type EFFECTIVEMENT retenu pour cet exercice (réponse correcte de l'élève, ou choix
   * canonique `typesAcceptes[0]` si révélé après épuisement des tentatives) — gouverne l'écran
   * "decomposer" (sauté si "reglebase") et la décomposition affichée au récapitulatif. */
  typeRetenu: TypeDerivee;
  /** Indexé par écran RÉELLEMENT traversé — 2 clés ("reconnaissance"/"calculer") pour "reglebase",
   * 3 clés sinon. */
  scores: Partial<Record<EcranFonctionDerivee, number>>;
}

export interface EtatSessionFonctionDerivee {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceFonctionDerivee;
  exerciceCourant: ExerciceFonctionDerivee;
  phase: EcranFonctionDerivee;
  /** null tant que l'écran "reconnaissance" n'est pas résolu (correct ou révélé) — gouverne le
   * saut éventuel de "decomposer" et le choix de la décomposition affichée. */
  typeRetenu: TypeDerivee | null;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranFonctionDerivee, number>>;
  indexExercice: number;
  resultats: ResultatExerciceFonctionDerivee[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
