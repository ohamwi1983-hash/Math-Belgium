import type { ExerciceMediane, GenerateurExerciceMediane, VarianteMediane } from "../core/mediane.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** Séquence dépendant de la variante (aiguillage `etat.phase` combiné à `exercice.variante`, même
 * principe que "Moyenne pondérée"/"Regroupement en classes et histogramme") — étendue par
 * `promptgen33modifications.md` puis `promptgen33modifications2.md` : variante "discrete" →
 * `mediane → q1 → q3 → minMaxMode` (4 écrans, "minMaxMode" terminale, INCHANGÉE par
 * `promptgen33modifications2.md` — scopé exclusivement à la variante "classes") ; variante
 * "classes" → `polygone → lectureQ1 → lectureMediane → lectureQ3 → synthese` (5 écrans, "synthese"
 * terminale — remplace "composantsFormule"/"calculFinal", retirés). Les 2 séquences restent
 * entièrement DISJOINTES, aucune phase partagée entre les 2 variantes. */
export type PhaseMediane = "mediane" | "q1" | "q3" | "minMaxMode" | "polygone" | "lectureQ1" | "lectureMediane" | "lectureQ3" | "synthese";

export interface ResultatExerciceMediane {
  /** Nécessaire pour que le résumé de session sache quels écrans ont eu lieu pour cet exercice
   * (même principe que `variante` dans `ResultatExerciceMoyennePonderee`). */
  variante: VarianteMediane;
  /** `number` pour "discrete" (toujours atteint, plus jamais terminal — voir `PhaseMediane`),
   * `null` pour "classes" (jamais atteint). */
  scoreMediane: number | null;
  medianeRevele: boolean;
  niveauAideMediane: number;
  /** `null` pour "classes" (écran absent, `promptgen33modifications.md`). */
  scoreQ1: number | null;
  q1Revele: boolean;
  niveauAideQ1: number;
  /** `null` pour "classes". */
  scoreQ3: number | null;
  q3Revele: boolean;
  niveauAideQ3: number;
  /** `null` pour "classes" — dernière étape de la variante "discrete", toujours atteinte pour elle. */
  scoreMinMaxMode: number | null;
  minMaxModeRevele: boolean;
  niveauAideMinMaxMode: number;
  /** `null` pour "discrete" — remplace `identificationClasse` (`promptgen33modifications.md`). */
  scorePolygone: number | null;
  polygoneRevele: boolean;
  niveauAidePolygone: number;
  /** `null` pour "discrete" — lecture graphique de Q1 sur le polygone (`promptgen33modifications2.md`,
   * remplace "composantsFormule"). */
  scoreLectureQ1: number | null;
  lectureQ1Revele: boolean;
  niveauAideLectureQ1: number;
  /** `null` pour "discrete" — lecture graphique de la médiane sur le polygone. */
  scoreLectureMediane: number | null;
  lectureMedianeRevele: boolean;
  niveauAideLectureMediane: number;
  /** `null` pour "discrete" — lecture graphique de Q3 sur le polygone. */
  scoreLectureQ3: number | null;
  lectureQ3Revele: boolean;
  niveauAideLectureQ3: number;
  /** `null` pour "discrete" — dernière étape de la variante "classes" (remplace "calculFinal") :
   * xMin/xMax/étendue/classe modale/mode. */
  scoreSynthese: number | null;
  syntheseRevele: boolean;
  niveauAideSynthese: number;
}

export interface EtatSessionMediane {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceMediane;
  indexExercice: number;
  exerciceCourant: ExerciceMediane;
  phase: PhaseMediane;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Aide PROGRESSIVE par écran (comme "Moyenne pondérée"/"Regroupement en classes et
   * histogramme") — 2 niveaux sur "mediane"/"q1"/"q3"/"minMaxMode" (ce dernier n'affectant que la
   * partie mode(s), min/max n'ont pas d'aide dédiée), 1 seul niveau sur "polygone" (rappel générique
   * du principe, jamais les coordonnées de l'exercice), 2 niveaux sur "lectureQ1"/"lectureMediane"/
   * "lectureQ3" (rappel de méthode, puis révélation du seuil calculé — jamais la valeur finale
   * elle-même) et 2 niveaux sur "synthese". Pénalité ADDITIVE (-20 points par niveau atteint)
   * appliquée au niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement.
   */
  niveauAideMediane: number;
  niveauAideQ1: number;
  niveauAideQ3: number;
  niveauAideMinMaxMode: number;
  niveauAidePolygone: number;
  niveauAideLectureQ1: number;
  niveauAideLectureMediane: number;
  niveauAideLectureQ3: number;
  niveauAideSynthese: number;
  /** Scores/révélations des écrans déjà clos, conservés jusqu'à la clôture finale de l'exercice. */
  scoreMedianeExercice: number | null;
  medianeRevele: boolean;
  scoreQ1Exercice: number | null;
  q1Revele: boolean;
  scoreQ3Exercice: number | null;
  q3Revele: boolean;
  scorePolygoneExercice: number | null;
  polygoneRevele: boolean;
  scoreLectureQ1Exercice: number | null;
  lectureQ1Revele: boolean;
  scoreLectureMedianeExercice: number | null;
  lectureMedianeRevele: boolean;
  scoreLectureQ3Exercice: number | null;
  lectureQ3Revele: boolean;
  resultats: ResultatExerciceMediane[];
  terminee: boolean;
}
