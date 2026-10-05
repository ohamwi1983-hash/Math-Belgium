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

export type EcranTangente = "substituer" | "tangente" | "resoudre" | "coordonnees" | "tangenteEnP" | "trouverQ" | "verifierPente";

/** Séquence COMPLÈTE et FIXE d'écrans pour une variante donnée — A : 2 écrans, B : 2 écrans
 * (nombre de champs variable mais toujours ces 2 mêmes écrans), C : 3 écrans. */
export function ordreEcransTangente(exercice: ExerciceTangente): EcranTangente[] {
  switch (exercice.variante) {
    case "pointDonne":
      return ["substituer", "tangente"];
    case "horizontale":
      return ["resoudre", "coordonnees"];
    case "doubleTangence":
      return ["tangenteEnP", "trouverQ", "verifierPente"];
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
  indexExercice: number;
  resultats: ResultatExerciceTangente[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
