/**
 * Couche B (6e) — types pour `6gen3` (REFONTE TOTALE, complétée par un écran intercalaire). Les 4
 * variantes partagent la même COLONNE VERTÉBRALE (CE → [condition, variante 4 seulement] →
 * équation non cyclométrique → existence de solutions → accepter/rejeter chaque solution) — une
 * seule forme de résultat suffit donc, plus besoin d'une union discriminée par variante côté
 * Couche B (`core6e/equationsCyclometriques.types.ts` reste, lui, une union discriminée — c'est
 * l'EXERCICE qui varie, pas la structure de la séquence d'écrans qui le fait traverser).
 *
 * Écran "condition" — NOUVEAU, INSÉRÉ entre "ce" et "equation", UNIQUEMENT pour la variante 4
 * (`arcfonctionsDifferentes`) : demande la condition de compatibilité des codomaines des 2
 * arcfonctions (`exercice.conditionParasite`, `core6e/equationsCyclometriques.types.ts`), le vrai
 * filtre qui rejette les racines parasites à l'écran final — la CE de l'écran 1 seule ne suffisant
 * jamais à elle seule pour ce rôle. Les variantes 1/2/3 sautent directement de "ce" à "equation",
 * exactement comme avant cette évolution.
 *
 * Écran "acceptRejet" SAUTÉ (`phaseApres("solutions", exercice)` retourne directement `"termine"`)
 * quand `exercice.candidats` est vide (0 solution algébrique — rien à accepter/rejeter, voir
 * variante 3).
 */
import type { ExerciceEquationsCyclometriques } from "../core6e/equationsCyclometriques.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhaseEquationsCyclometriques = "ce" | "condition" | "equation" | "solutions" | "acceptRejet";

export const PHASE_INITIALE: PhaseEquationsCyclometriques = "ce";

export function phaseApres(phase: PhaseEquationsCyclometriques, exercice: ExerciceEquationsCyclometriques): PhaseEquationsCyclometriques | "termine" {
  switch (phase) {
    case "ce":
      return exercice.variante === "arcfonctionsDifferentes" ? "condition" : "equation";
    case "condition":
      return "equation";
    case "equation":
      return "solutions";
    case "solutions":
      return exercice.candidats.length === 0 ? "termine" : "acceptRejet";
    case "acceptRejet":
      return "termine";
  }
}

/** Niveau d'aide réellement consommé + révélation éventuelle, capturés à l'INSTANT PRÉCIS où un
 * écran se ferme (dans `avancerPhase`, avant que `niveauAide`/`etapeCourante` ne soient remis à
 * zéro pour l'écran suivant) — jamais reconstruits après coup depuis un état React déjà obsolète.
 * Voir `docs/conventions-transversales.md` (piège `terminerEtape`/`aideParPhase`). */
export interface AideInfoEcran {
  niveauAide: number;
  revele: boolean;
}

export interface ResultatExerciceEquationsCyclometriques {
  exercice: ExerciceEquationsCyclometriques;
  scoreCE: number;
  /** `null` ssi l'écran "condition" a été SAUTÉ (variantes 1/2/3, voir `phaseApres`). */
  scoreCondition: number | null;
  scoreEquation: number;
  scoreSolutions: number;
  /** `null` ssi l'écran "acceptRejet" a été SAUTÉ (0 candidat, voir `phaseApres`). */
  scoreAcceptRejet: number | null;
}

export interface EtatSessionEquationsCyclometriques {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceEquationsCyclometriques;
  exerciceCourant: ExerciceEquationsCyclometriques;
  phase: PhaseEquationsCyclometriques;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<PhaseEquationsCyclometriques, number>>;
  /** Dernier écran fermé (phase + aide/révélation) — `null` avant la toute première fermeture
   * d'écran. Alimente le récapitulatif final, sans jamais dépendre du timing d'un closure React. */
  derniereCloture: { phase: PhaseEquationsCyclometriques; info: AideInfoEcran } | null;
  indexExercice: number;
  resultats: ResultatExerciceEquationsCyclometriques[];
  terminee: boolean;
}
