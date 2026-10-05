import type {
  ConfigurationTriangleQuelconque,
  ExerciceTriangleQuelconque,
  GenerateurExerciceTriangleQuelconque,
} from "../core/triangleQuelconque.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** 2 phases fixes, toujours dans le même ordre — l'écran 2 n'apparaît qu'après validation correcte
 * (ou révélation après épuisement) de l'écran 1, jamais affichés simultanément. */
export type PhaseTriangleQuelconque = "donneeManquante" | "aire";

export interface ResultatExerciceTriangleQuelconque {
  configuration: ConfigurationTriangleQuelconque;
  scoreDonneeManquante: number;
  donneeManquanteRevele: boolean;
  niveauAideDonneeManquante: number;
  scoreAire: number;
  aireRevele: boolean;
  niveauAideAire: number;
}

export interface EtatSessionTriangleQuelconque {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceTriangleQuelconque;
  indexExercice: number;
  exerciceCourant: ExerciceTriangleQuelconque;
  phase: PhaseTriangleQuelconque;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Aide PROGRESSIVE par écran (contrairement au bouton binaire du reste du projet) — 0 à 2 niveaux
   * pour chacun des deux écrans (`promptcorrectionsgenerateur19unitesnotation.md` réduit l'écran 1
   * de 3 à 2 niveaux — retrait de l'étape "assignation côté/angle opposé", jargon jamais nécessaire
   * grâce au croquis), chacun révélant strictement plus que le précédent (`activerAideSuivante`,
   * `sessionTriangleQuelconque.ts`). Pénalité ADDITIVE (-20 points par niveau atteint, même principe
   * que "L'un sans l'autre" mais étendu à plusieurs niveaux cumulables plutôt qu'un seul flag
   * binaire), appliquée au niveau atteint au moment précis où l'écran se clôt — jamais rétroactivement.
   */
  niveauAideDonneeManquante: number;
  niveauAideAire: number;
  /** Score/révélation de l'écran 1, conservés jusqu'à la clôture de l'écran 2 (qui construit le
   * `ResultatExerciceTriangleQuelconque` complet) — même principe que `scoreCarreExercice`/
   * `carreRevele` côté "L'un sans l'autre". */
  scoreDonneeManquanteExercice: number | null;
  donneeManquanteRevele: boolean;
  resultats: ResultatExerciceTriangleQuelconque[];
  terminee: boolean;
}
