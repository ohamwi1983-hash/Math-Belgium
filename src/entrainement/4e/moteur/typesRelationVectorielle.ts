import type { ExerciceRelationVectorielle, GenerateurExerciceRelationVectorielle } from "../core/relationVectorielle.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/** `"traduction"` n'a lieu que pour la variante `relationGenerale` (les deux formes, `pointAPoint`
 * ET `milieu`) — `phaseInitiale` (`sessionRelationVectorielle.ts`) démarre directement à
 * `"coordonnees"` pour `translation`, qui n'a jamais d'étape de traduction symbolique. */
export type PhaseRelationVectorielle = "traduction" | "coordonnees";

export interface ResultatExerciceRelationVectorielle {
  variante: ExerciceRelationVectorielle["variante"];
  /** `null` pour la variante `translation` (étape absente), toujours un `number` pour
   * `relationGenerale` — même convention que le reste du projet pour une étape sautable. */
  scoreTraduction: number | null;
  traductionRevele: boolean;
  /** Aide activée au moment précis où CETTE note s'est close — jamais dérivé du score a posteriori
   * (une tentative ratée sans aide reste verte au récapitulatif final). `false` pour `translation`
   * (étape absente). */
  traductionAideUtilisee: boolean;
  scoreCoordonnees: number;
  coordonneesRevele: boolean;
  /** Même principe que `traductionAideUtilisee`, capturé à la clôture de l'étape "coordonnees". */
  coordonneesAideUtilisee: boolean;
}

export interface EtatSessionRelationVectorielle {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceRelationVectorielle;
  indexExercice: number;
  exerciceCourant: ExerciceRelationVectorielle;
  phase: PhaseRelationVectorielle;
  etapeCourante: EtatEtapeTentatives;
  /**
   * Bouton "Aide" — UNE seule aide pénalisante par exercice (spec), jamais réinitialisée entre les
   * deux phases d'un même exercice `relationGenerale` (même graphe aide les deux étapes) ; remise à
   * `false` au passage à l'exercice suivant. Révélation à sens unique, facteur ×0,5 appliqué à
   * CHAQUE note qui se clôt après son activation — jamais rétroactivement à une note déjà close
   * avant (même principe exact que "Transformations graphiques", ses deux notes indépendantes).
   */
  aideUtilisee: boolean;
  /** Score/révélation de la phase "traduction", conservés jusqu'à la clôture de l'exercice (qui
   * construit le `ResultatExerciceRelationVectorielle` complet) — même principe que
   * `scoreDonneeManquanteExercice`/`donneeManquanteRevele` côté "Triangle quelconque". `null` tant
   * que la phase n'a pas eu lieu (variante `translation`, ou `relationGenerale` pas encore close). */
  scoreTraductionExercice: number | null;
  traductionRevele: boolean;
  /** Aide activée au moment précis où la phase "traduction" s'est close, conservée jusqu'à la
   * clôture de l'exercice — même principe que `traductionRevele`. */
  traductionAideUtiliseeExercice: boolean;
  resultats: ResultatExerciceRelationVectorielle[];
  terminee: boolean;
}
