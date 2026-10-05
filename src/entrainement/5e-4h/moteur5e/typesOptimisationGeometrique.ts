/**
 * Couche B (5e) — types pour 5gen32 ("Optimisation géométrique"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Séquence FIXE dès le tirage (dépend uniquement de `exercice.famille`, jamais une branche
 * réactive dépendant d'une réponse élève) — même patron que `typesTangentes.ts` (5gen28).
 *
 * Écart architectural DÉLIBÉRÉ par rapport à 5gen28/5gen29 : au lieu d'une fonction
 * `soumettreReponseXxx` PAR écran (30+ combinaisons famille×écran ici, contre 2-3 variantes chez
 * 5gen28/29), CHAQUE écran soumet un objet générique `Record<string,string>` (une entrée par champ
 * de l'écran, voir `ui5e/formatOptimisationGeometrique.ts::champsEcran`) à UNE SEULE fonction
 * `soumettreReponseEcran` (`sessionOptimisationGeometrique.ts`) — la vérification par champ reste
 * néanmoins entièrement typée et par famille (`moteur5e/verificationOptimisationGeometrique.ts`).
 * Ce n'est PAS un "moteur de session unifié" au sens interdit par CLAUDE.md (aucune table de
 * transitions générique partagée entre générateurs) : la règle "1 fonction par écran" n'est
 * elle-même qu'une convention locale à 5gen28/5gen29, pas une règle non négociable de la
 * plateforme — ici, la combinatoire famille×écran rendrait 1 fonction par écran (30+ fonctions
 * quasi identiques) une duplication réelle, pas une simplification.
 */
import type { ExerciceOptimisation } from "../core5e/optimisationGeometrique.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranOptimisation = "lien" | "construire" | "deriver" | "resoudre" | "justifier" | "conclure" | "application" | "coeffsImmediats" | "relation" | "resoudreA" | "expressionFinale";

const SEQUENCE_COMMUNE: EcranOptimisation[] = ["lien", "construire", "deriver", "resoudre", "justifier", "conclure"];
const SEQUENCE_CUBIQUE: EcranOptimisation[] = ["coeffsImmediats", "relation", "resoudreA", "expressionFinale"];

export function ordreEcransOptimisation(exercice: ExerciceOptimisation): EcranOptimisation[] {
  if (exercice.famille === "cubique") return SEQUENCE_CUBIQUE;
  if (exercice.famille === "cylindre" && exercice.avecApplicationNumerique) return [...SEQUENCE_COMMUNE, "application"];
  return SEQUENCE_COMMUNE;
}

export function ecranInitial(exercice: ExerciceOptimisation): EcranOptimisation {
  return ordreEcransOptimisation(exercice)[0];
}

export function ecranApres(exercice: ExerciceOptimisation, ecran: EcranOptimisation): EcranOptimisation | "termine" {
  const ordre = ordreEcransOptimisation(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceOptimisation {
  exercice: ExerciceOptimisation;
  /** Indexé par écran RÉELLEMENT traversé — 4 clés (cubique) ou 6-7 clés (autres), selon
   * `ordreEcransOptimisation`. */
  scores: Partial<Record<EcranOptimisation, number>>;
}

export interface EtatSessionOptimisation {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceOptimisation;
  exerciceCourant: ExerciceOptimisation;
  phase: EcranOptimisation;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranOptimisation, number>>;
  /** Dernières réponses soumises pour l'écran courant — nécessaire au bloc "état actuel" de
   * l'écran suivant ET au récapitulatif final (`ui5e/formatOptimisationGeometrique.ts`), qui
   * affichent la réponse RÉELLEMENT attendue, jamais recalculée depuis un score. */
  dernieresReponsesParEcran: Partial<Record<EcranOptimisation, Record<string, string>>>;
  indexExercice: number;
  resultats: ResultatExerciceOptimisation[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
