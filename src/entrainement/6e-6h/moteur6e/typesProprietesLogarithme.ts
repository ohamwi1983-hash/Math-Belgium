/**
 * Couche B (6e) — types pour `6gen13`, REFONTE TOTALE : le nombre d'écrans n'est plus FIXE (2) mais
 * dépend de la combinaison de caractéristiques de l'exercice tiré (1 écran PAR CARACTÉRISTIQUE,
 * voir `core6e/decompositionLogarithme.ts`) — ET CE NOMBRE VARIE même à l'intérieur d'une même
 * "variante" du catalogue, puisque l'ordre de construction (donc la profondeur de chaque
 * caractéristique) n'affecte PAS le compte d'écrans, mais le nombre de caractéristiques, lui, change
 * d'une variante à l'autre (3 ou 4, catalogue restreint — voir
 * `generateurs6e/proprietesLogarithme/index.ts`). Exercice PUREMENT SYMBOLIQUE : AUCUN écran numérique final (voir
 * `core6e/proprietesLogarithme.types.ts`) — le dernier écran reste une décomposition algébrique comme
 * les autres. Ni un dispatch par famille à séquence FIXE (6gen12/`typesExponentiellesProblemes.ts`,
 * phases énumérées en chaîne), ni une séquence commune unique (ancienne version de ce fichier, 2
 * écrans fixes) : `phase` est un simple INDEX NUMÉRIQUE dans la séquence propre à l'exercice COURANT
 * (`nombreEtapesAlgebriques`), la seule représentation qui generalise à un nombre d'écrans déterminé
 * À L'EXÉCUTION.
 */
import { calculerEtatsArgument } from "../core6e/decompositionLogarithme";
import type { Caracteristique, Noeud } from "../core6e/decompositionLogarithme";
import type { ExerciceProprieteLogarithme } from "../core6e/proprietesLogarithme.types";
import type { ReglagesSession6e } from "../core6e/session6e.types";
import type { EtatEtapeTentatives } from "../moteur/etapeTentatives";

/** Index de l'ÉCRAN courant dans `sequenceEcrans(exercice)` (pas l'index de l'étape algébrique). */
export type PhaseProprietesLogarithme = number;

/**
 * Un écran de l'exercice (audit 6e ch.3, décision K1) : chaque étape algébrique d'ARGUMENT
 * (produit/quotient/puissance/racine) est précédée d'un écran « choix » où l'élève reconnaît
 * lui-même la propriété à appliquer (une seule tentative), puis d'un écran « transformation » où il
 * l'applique. L'étape de changement de base (toujours la dernière, voir
 * `core6e/decompositionLogarithme.ts`) n'a PAS d'écran de choix : à ce moment l'argument est
 * entièrement décomposé et la consigne demande explicitement `log_b(...)`, le choix serait forcé.
 * `etape` = index de l'étape algébrique (0 … `nombreEtapesAlgebriques - 1`).
 */
export type EcranProprietesLogarithme = { kind: "choix"; etape: number } | { kind: "transformation"; etape: number };

/** Nombre d'étapes ALGÉBRIQUES — une par caractéristique de la combinaison (produit/quotient/
 * puissance/racine/changementBase). */
export function nombreEtapesAlgebriques(exercice: ExerciceProprieteLogarithme): number {
  const etapesArgument = calculerEtatsArgument(exercice.arbre).length - 1;
  return etapesArgument + (exercice.avecChangementBase ? 1 : 0);
}

/** Caractéristique RÉELLEMENT testée à l'étape algébrique donnée — déduite du nœud pelé à cette
 * étape (ou "changementBase" pour la dernière étape quand l'exercice l'inclut). */
export function caracteristiqueDeLEtape(exercice: ExerciceProprieteLogarithme, etape: number): Caracteristique {
  const etats = calculerEtatsArgument(exercice.arbre);
  const etapesArgument = etats.length - 1;
  if (etape < etapesArgument) return (etats[etape].reste as Exclude<Noeud, { kind: "var" }>).kind;
  return "changementBase";
}

export function sequenceEcrans(exercice: ExerciceProprieteLogarithme): EcranProprietesLogarithme[] {
  const ecrans: EcranProprietesLogarithme[] = [];
  const total = nombreEtapesAlgebriques(exercice);
  for (let etape = 0; etape < total; etape++) {
    if (caracteristiqueDeLEtape(exercice, etape) !== "changementBase") ecrans.push({ kind: "choix", etape });
    ecrans.push({ kind: "transformation", etape });
  }
  return ecrans;
}

export function ecranDeLaPhase(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): EcranProprietesLogarithme {
  return sequenceEcrans(exercice)[phase];
}

export function nombreEcrans(exercice: ExerciceProprieteLogarithme): number {
  return sequenceEcrans(exercice).length;
}

export function phaseInitiale(): PhaseProprietesLogarithme {
  return 0;
}

export function phaseApres(exercice: ExerciceProprieteLogarithme, phase: PhaseProprietesLogarithme): PhaseProprietesLogarithme | "termine" {
  const suivante = phase + 1;
  return suivante < nombreEcrans(exercice) ? suivante : "termine";
}

export interface ResultatExerciceProprietesLogarithme {
  exercice: ExerciceProprieteLogarithme;
  /** Un score par écran RÉELLEMENT traversé, dans l'ordre (longueur = `nombreEcrans(exercice)`). */
  scores: number[];
}

export interface EtatSessionProprietesLogarithme {
  reglages: ReglagesSession6e;
  generateur: () => ExerciceProprieteLogarithme;
  exerciceCourant: ExerciceProprieteLogarithme;
  phase: PhaseProprietesLogarithme;
  etapeCourante: EtatEtapeTentatives;
  niveauAide: number;
  /** Scores des écrans DÉJÀ clos de l'exercice courant, dans l'ordre (longueur = `phase`) — jamais
   * l'écran en cours, qui n'a pas encore de score définitif. */
  scoresPartiels: number[];
  /** Un booléen "révélé" par écran déjà clos, même index que `scoresPartiels` — jusqu'au 2025-10,
   * déduit indirectement de `scoresPartiels[i] === 0` (un succès ne vaut jamais exactement 0, l'ancienne pénalité par tentative garantissant un score strictement positif même à la dernière tentative
   * autorisée) ; tableau explicite ajouté pendant le balayage générique (point A). */
  revelesPartiels: boolean[];
  indexExercice: number;
  resultats: ResultatExerciceProprietesLogarithme[];
  terminee: boolean;
  /** Vrai UNIQUEMENT juste après l'appel à `soumettreReponse` qui a clos un écran par épuisement des
   * tentatives (réponse révélée) plutôt que par réussite — piège structurel documenté dans CLAUDE.md :
   * `etapeCourante.revelee` est remis à `false` DANS LE MÊME appel qui fait avancer `phase`, donc
   * jamais fiable lu depuis l'état PRÉ-transition côté `App6gen13.tsx`. */
  derniereTransitionRevelee: boolean;
}
