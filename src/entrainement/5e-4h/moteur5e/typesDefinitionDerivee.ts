/**
 * Couche B (5e) — types pour 5gen26 ("Calculer f'(a) par la définition"). N'importe jamais rien de
 * `src/generateurs5e/`.
 *
 * Chaque exercice traverse UNE SEULE FOIS la séquence de 3 écrans ("developper" → "quotient" →
 * "limite") — `phase` reste une simple chaîne (`EcranDefinitionDerivee`), même convention que les
 * autres générateurs 5e à séquence fixe (ex. 5gen21). Contrairement à l'ancienne structure "2
 * passages" (voir `prompt5gen26unevaleurareecriture.md`), `ORDRE_COMPLET` n'a plus besoin d'une
 * dimension supplémentaire.
 */
import type { ExerciceDefinitionDerivee } from "../core5e/definitionDerivee.types";
import type { ReglagesSession5e } from "../core5e/session5e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

export type EcranDefinitionDerivee = "developper" | "quotient" | "limite";

export const ORDRE_COMPLET: EcranDefinitionDerivee[] = ["developper", "quotient", "limite"];

export function phaseInitiale(): EcranDefinitionDerivee {
  return ORDRE_COMPLET[0];
}

export function phaseApres(phase: EcranDefinitionDerivee): EcranDefinitionDerivee | "termine" {
  const index = ORDRE_COMPLET.indexOf(phase);
  return index + 1 < ORDRE_COMPLET.length ? ORDRE_COMPLET[index + 1] : "termine";
}

export interface ResultatExerciceDefinitionDerivee {
  exercice: ExerciceDefinitionDerivee;
  /** Indexé par `EcranDefinitionDerivee` — un score par écran (toujours les 3, séquence fixe). */
  scores: Partial<Record<EcranDefinitionDerivee, number>>;
}

export interface EtatSessionDefinitionDerivee {
  reglages: ReglagesSession5e;
  generateur: () => ExerciceDefinitionDerivee;
  exerciceCourant: ExerciceDefinitionDerivee;
  phase: EcranDefinitionDerivee;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  scoresPartiels: Partial<Record<EcranDefinitionDerivee, number>>;
  indexExercice: number;
  resultats: ResultatExerciceDefinitionDerivee[];
  terminee: boolean;
  derniereEtapeRevelee: boolean;
}
