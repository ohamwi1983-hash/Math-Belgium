/**
 * Couche B (5e) — types pour 5gen7 ("Polygones, arcs et secteurs"). Séquence à 3-5 écrans fixes
 * — `cercleEntier → arcElementaire → [arcMultiPas] → secteurElementaire → [secteurMultiPas]` —
 * les 2 écrans entre crochets sont SAUTÉS indépendamment selon `exercice.arcMultiPas`/
 * `secteurMultiPas` (`null` ⟹ absent de la séquence).
 */
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type PhasePolygonesArcsSecteurs = "cercleEntier" | "arcElementaire" | "arcMultiPas" | "secteurElementaire" | "secteurMultiPas";

export function phaseApres(exercice: ExercicePolygonesArcsSecteurs, phaseActuelle: PhasePolygonesArcsSecteurs): PhasePolygonesArcsSecteurs | "termine" {
  if (phaseActuelle === "cercleEntier") return "arcElementaire";
  if (phaseActuelle === "arcElementaire") return exercice.arcMultiPas !== null ? "arcMultiPas" : "secteurElementaire";
  if (phaseActuelle === "arcMultiPas") return "secteurElementaire";
  if (phaseActuelle === "secteurElementaire") return exercice.secteurMultiPas !== null ? "secteurMultiPas" : "termine";
  return "termine";
}

/** Écrans "multi-pas" seuls ont un 3e niveau d'aide (désignation du nombre de crans à compter,
 * sans le donner) — spec explicite, "2-3 niveaux". */
export function niveauAideMaxPolygonesArcsSecteurs(phase: PhasePolygonesArcsSecteurs): number {
  return phase === "arcMultiPas" || phase === "secteurMultiPas" ? 3 : 2;
}

export interface ResultatExercicePolygonesArcsSecteurs {
  exercice: ExercicePolygonesArcsSecteurs;
  scoreCercleEntier: number;
  cercleEntierRevele: boolean;
  scoreArcElementaire: number;
  arcElementaireRevele: boolean;
  /** `null` ssi `exercice.arcMultiPas===null` (écran absent de la séquence). */
  scoreArcMultiPas: number | null;
  arcMultiPasRevele: boolean;
  scoreSecteurElementaire: number;
  secteurElementaireRevele: boolean;
  /** `null` ssi `exercice.secteurMultiPas===null` (écran absent de la séquence). */
  scoreSecteurMultiPas: number | null;
  secteurMultiPasRevele: boolean;
}

export interface EtatSessionPolygonesArcsSecteurs {
  reglages: ReglagesSession5e;
  generateur: () => ExercicePolygonesArcsSecteurs;
  exerciceCourant: ExercicePolygonesArcsSecteurs;
  phase: PhasePolygonesArcsSecteurs;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoreCercleEntierExercice: number | null;
  cercleEntierRevele: boolean;
  scoreArcElementaireExercice: number | null;
  arcElementaireRevele: boolean;
  scoreArcMultiPasExercice: number | null;
  arcMultiPasRevele: boolean;
  scoreSecteurElementaireExercice: number | null;
  secteurElementaireRevele: boolean;
  indexExercice: number;
  resultats: ResultatExercicePolygonesArcsSecteurs[];
  terminee: boolean;
}
