/**
 * Couche B (5e) — types pour 5gen28 ("Tangentes"). N'importe jamais rien de `src/generateurs5e/`.
 *
 * La séquence d'écrans dépend UNIQUEMENT de `exercice.variante`, fixée dès le tirage (jamais une
 * branche réactive dépendant d'une réponse élève, contrairement à 5gen27) — `ordreEcransTangente`
 * calcule donc la séquence complète une fois pour toutes, comme `ORDRE_COMPLET` de 5gen26 mais
 * paramétré par variante plutôt qu'une constante statique unique.
 */
import type { ExerciceTangente } from "../core5e/tangentes.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranTangente =
  | "deriver"
  | "substituer"
  | "tangente"
  | "resoudre"
  | "coordonnees"
  | "tangenteEnP"
  | "trouverQ"
  | "verifierPente"
  | "resoudrePente"
  | "tangentesPente"
  | "condition"
  | "abscissesContact"
  | "tangentesContact";

/** Écrans de l'exercice. « deriver » en tête quand f′ est À CALCULER (option du lot C, défaut) —
 * jamais pour la double tangence (la dérivée y est déjà un écran). Aucune tangente horizontale
 * (Δ < 0) : l'écran « coordonnées » disparaît (l'élève a conclu « aucune solution »). */
export function ordreEcransTangente(exercice: ExerciceTangente): EcranTangente[] {
  const deriver: EcranTangente[] = exercice.deriveeDonnee ? [] : ["deriver"];
  switch (exercice.variante) {
    case "pointDonne":
      return [...deriver, "substituer", "tangente"];
    case "horizontale":
      return exercice.racines.length === 0 ? [...deriver, "resoudre"] : [...deriver, "resoudre", "coordonnees"];
    case "doubleTangence":
      return ["tangenteEnP", "trouverQ", "verifierPente"];
    case "pente":
      return [...deriver, "resoudrePente", "coordonnees", "tangentesPente"];
    case "pointExterieur":
      return [...deriver, "condition", "abscissesContact", "tangentesContact"];
  }
}

export function ecranInitial(exercice: ExerciceTangente): EcranTangente {
  return ordreEcransTangente(exercice)[0];
}

export function ecranApres(exercice: ExerciceTangente, ecran: EcranTangente): EcranTangente | "termine" {
  const ordre = ordreEcransTangente(exercice);
  const index = ordre.indexOf(ecran);
  return index + 1 < ordre.length ? ordre[index + 1] : "termine";
}

export interface ResultatExerciceTangente {
  exercice: ExerciceTangente;
  /** Indexé par écran RÉELLEMENT traversé — 2 clés (A/B) ou 3 clés (C), selon `ordreEcransTangente`. */
  scores: Partial<Record<EcranTangente, number>>;
}

export interface EtatSessionTangente {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceTangente;
  exerciceCourant: ExerciceTangente;
  phase: EcranTangente;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranTangente, number>>;
  /** true par écran déjà clos ssi révélé (tentatives épuisées) — jusqu'au 2025-10,
   * `scoresPartiels[ecran] === 0` en tenait lieu, une heuristique FAUSSE ici : la pénalité d'aide
   * multi-niveaux (`sessionTangentes.ts`) était soustraite (avant le retrait des pénalités) APRÈS le score de tentatives puis
   * plafonnée à 0, donc une réussite fortement aidée pouvait légitimement tomber à 0 et s'afficher
   * à tort comme "révélée" (point A, balayage générique). Peuplé depuis `etapeCourante.revelee`. */
  revelesPartiels: Partial<Record<EcranTangente, boolean>>;
  indexExercice: number;
  resultats: ResultatExerciceTangente[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
