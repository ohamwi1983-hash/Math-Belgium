import type { ExerciceSynthese, GenerateurExerciceSynthese, VarianteExerciceSynthese } from "../core/exerciceSynthese.types";
import type { ReglagesSession } from "../core/session.types";
import type { EtatEtapeTentatives } from "./etapeTentatives";

/**
 * 17 "écrans" possibles au total — les 2 variantes PARTAGENT 7 noms de phase (`sommes`, `quotient`,
 * `boxplot`, `tableau`, `varianceEcartType`, `btIntervalle`, `btPourcent` — les étapes gen32/gen36/
 * gen34/gen37 communes aux deux variantes), contrairement à "Orthogonalité et théorème de Pythagore
 * généralisé" dont les séquences sont entièrement disjointes — mais chaque exercice ne traverse
 * jamais qu'UNE SEULE des deux séquences (`SEQUENCES[exercice.variante]`), jamais les deux à la
 * fois, donc aucun risque de collision dans `scoresAccumules`.
 * - `discrete` (11 écrans) : sommes/quotient (gen32) → mediane/q1/q3/minMaxMode (gen33 discrete) →
 *   boxplot (gen36) → tableau/varianceEcartType (gen34) → btIntervalle/btPourcent (gen37 adaptée).
 * - `classes` (13 écrans) : centres/sommes/quotient (gen32 classes) → polygone/lectureMediane/
 *   lectureQ1/lectureQ3/synthese (gen33 classes) → boxplot (gen36) → tableau/varianceEcartType
 *   (gen34) → btIntervalle/btPourcent (gen37 adaptée).
 */
export type PhaseExerciceSynthese =
  | "centres"
  | "sommes"
  | "quotient"
  | "mediane"
  | "q1"
  | "q3"
  | "minMaxMode"
  | "polygone"
  | "lectureMediane"
  | "lectureQ1"
  | "lectureQ3"
  | "synthese"
  | "boxplot"
  | "tableau"
  | "varianceEcartType"
  | "btIntervalle"
  | "btPourcent";

export const SEQUENCES: Record<VarianteExerciceSynthese, PhaseExerciceSynthese[]> = {
  discrete: ["sommes", "quotient", "mediane", "q1", "q3", "minMaxMode", "boxplot", "tableau", "varianceEcartType", "btIntervalle", "btPourcent"],
  classes: [
    "centres",
    "sommes",
    "quotient",
    "polygone",
    "lectureMediane",
    "lectureQ1",
    "lectureQ3",
    "synthese",
    "boxplot",
    "tableau",
    "varianceEcartType",
    "btIntervalle",
    "btPourcent",
  ],
};

/** Niveau d'aide maximal par écran — pénalité ADDITIVE `-20 points/niveau`, même mécanique que les
 * 5 générateurs sources. Chaque valeur reprise EXACTEMENT du `NIVEAU_AIDE_MAX`/`niveauAideMaxPourPhase`
 * du composant/session source réutilisé littéralement (voir la revue de code menée avant l'écriture
 * de ce fichier) — jamais réinventée, pour que le bouton "Aide" du composant repris (qui lit sa
 * propre constante importée depuis son propre module source, PAS celle-ci) reste cohérent avec le
 * plafond que cette session applique réellement :
 * - `centres`/`sommes` : 2 (`sessionMoyennePonderee.ts`), `quotient` : 1.
 * - `mediane`/`q1`/`q3`/`minMaxMode`/`synthese` : 2 (`sessionMediane.ts`), `polygone` : 1.
 * - `lectureMediane`/`lectureQ1`/`lectureQ3` : 4 (`NIVEAU_AIDE_MAX_LECTURE_*`, `sessionMediane.ts`,
 *   passé de 2 à 4 par `promptgen33gen35aidesinterpolation.md` — mis à jour ICI en même temps, sans
 *   quoi le composant PARTAGÉ `EtapeLectureMediane` (qui lit, lui, directement la constante à jour
 *   de `sessionMediane.ts`) continue de proposer un 3ᵉ/4ᵉ clic sur "Aide" que CETTE session rejette
 *   alors avec une exception non rattrapée — bug réel trouvé par Playwright sur gen35 avant d'être
 *   corrigé ici, jamais un cas seulement théorique).
 * - `tableau`/`varianceEcartType` : 2 (`sessionDispersion.ts`).
 * - `boxplot` : 2 (`niveauAideMaxPourPhase("construction")`, `sessionBoiteMoustaches.ts`).
 * - `btIntervalle`/`btPourcent` : écrans propres à cet exercice (jamais un composant repris), valeurs
 *   choisies librement — 2 puis 1, même patron que gen37 (formule non substituée puis substituée). */
export const NIVEAU_AIDE_MAX: Record<PhaseExerciceSynthese, number> = {
  centres: 2,
  sommes: 2,
  quotient: 1,
  mediane: 2,
  q1: 2,
  q3: 2,
  minMaxMode: 2,
  polygone: 1,
  lectureMediane: 4,
  lectureQ1: 4,
  lectureQ3: 4,
  synthese: 2,
  boxplot: 2,
  tableau: 2,
  varianceEcartType: 2,
  btIntervalle: 2,
  btPourcent: 1,
};

export interface ResultatExerciceSynthese {
  variante: VarianteExerciceSynthese;
  scoreCentres: number | null;
  centresRevele: boolean;
  niveauAideCentres: number;
  scoreSommes: number | null;
  sommesRevele: boolean;
  niveauAideSommes: number;
  scoreQuotient: number | null;
  quotientRevele: boolean;
  niveauAideQuotient: number;
  scoreMediane: number | null;
  medianeRevele: boolean;
  niveauAideMediane: number;
  scoreQ1: number | null;
  q1Revele: boolean;
  niveauAideQ1: number;
  scoreQ3: number | null;
  q3Revele: boolean;
  niveauAideQ3: number;
  scoreMinMaxMode: number | null;
  minMaxModeRevele: boolean;
  niveauAideMinMaxMode: number;
  scorePolygone: number | null;
  polygoneRevele: boolean;
  niveauAidePolygone: number;
  scoreLectureMediane: number | null;
  lectureMedianeRevele: boolean;
  niveauAideLectureMediane: number;
  scoreLectureQ1: number | null;
  lectureQ1Revele: boolean;
  niveauAideLectureQ1: number;
  scoreLectureQ3: number | null;
  lectureQ3Revele: boolean;
  niveauAideLectureQ3: number;
  scoreSynthese: number | null;
  syntheseRevele: boolean;
  niveauAideSynthese: number;
  scoreBoxplot: number | null;
  boxplotRevele: boolean;
  niveauAideBoxplot: number;
  scoreTableau: number | null;
  tableauRevele: boolean;
  niveauAideTableau: number;
  scoreVarianceEcartType: number | null;
  varianceEcartTypeRevele: boolean;
  niveauAideVarianceEcartType: number;
  scoreBtIntervalle: number | null;
  btIntervalleRevele: boolean;
  niveauAideBtIntervalle: number;
  scoreBtPourcent: number | null;
  btPourcentRevele: boolean;
  niveauAideBtPourcent: number;
}

export interface ScoreEcran {
  score: number;
  revele: boolean;
  niveauAide: number;
}

export interface EtatSessionExerciceSynthese {
  reglages: ReglagesSession;
  generateur: GenerateurExerciceSynthese;
  indexExercice: number;
  exerciceCourant: ExerciceSynthese;
  phase: PhaseExerciceSynthese;
  etapeCourante: EtatEtapeTentatives;
  /** Niveau d'aide de l'ÉCRAN COURANT uniquement — jamais accumulé entre écrans, réinitialisé à
   * chaque transition de phase (même principe que "Colinéarité"/"Orthogonalité"). */
  niveauAide: number;
  /** Écrans déjà clos de CET exercice, accumulés jusqu'à la clôture complète (qui construit le
   * `ResultatExerciceSynthese` final via `construireResultat`, `sessionExerciceSynthese.ts`). */
  scoresAccumules: Partial<Record<PhaseExerciceSynthese, ScoreEcran>>;
  resultats: ResultatExerciceSynthese[];
  terminee: boolean;
}
