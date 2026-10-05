/**
 * Couche B — types de session pour "Boîte à moustaches" (chapitre 5, septième et dernier générateur
 * du chapitre). **`PhaseBoiteMoustaches` nomme directement chacun des 4 écrans possibles** (même
 * principe que "Regroupement en classes et histogramme"/"Étendue et écart interquartile") —
 * `phaseInitiale(exercice)` choisit l'écran de départ selon `exercice.variante` :
 * `construction`/`lecture` sont chacun un SEUL écran toujours terminal ; `comparaison` traverse
 * `comparaisonMedianes → comparaisonDispersions` (2 écrans fixes, ce dernier terminal).
 */
import type { ExerciceBoiteMoustaches, GenerateurExerciceBoiteMoustaches, VarianteBoiteMoustaches } from "../core/boiteMoustaches.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

export type PhaseBoiteMoustaches = "construction" | "lecture" | "comparaisonMedianes" | "comparaisonDispersions";

export interface ResultatExerciceBoiteMoustaches {
  variante: VarianteBoiteMoustaches;
  /** `null` pour la variante "comparaison" (2 notes séparées ci-dessous). */
  score: number | null;
  revele: boolean;
  niveauAide: number;
  /** `null` pour les variantes "construction"/"lecture". */
  scoreComparaisonMedianes: number | null;
  comparaisonMedianesRevele: boolean;
  niveauAideComparaisonMedianes: number;
  scoreComparaisonDispersions: number | null;
  comparaisonDispersionsRevele: boolean;
  niveauAideComparaisonDispersions: number;
}

export interface EtatSessionBoiteMoustaches {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceBoiteMoustaches;
  indexExercice: number;
  exerciceCourant: ExerciceBoiteMoustaches;
  phase: PhaseBoiteMoustaches;
  etapeCourante: EtatEtapeTentatives;
  /** Aide PROGRESSIVE de l'écran courant, remise à 0 à chaque transition d'écran — même principe
   * que "Étendue et écart interquartile" (un seul champ, jamais un par écran : un seul écran
   * non-terminal existe ici, "comparaisonMedianes"). */
  niveauAide: number;
  /** Score/révélation de l'écran "comparaisonMedianes", conservés jusqu'à la clôture de l'exercice
   * entier (qui construit le `ResultatExerciceBoiteMoustaches` complet) — même principe que le
   * reste du projet. */
  scoreComparaisonMedianesExercice: number | null;
  comparaisonMedianesRevele: boolean;
  niveauAideComparaisonMedianesExercice: number;
  resultats: ResultatExerciceBoiteMoustaches[];
  terminee: boolean;
}
