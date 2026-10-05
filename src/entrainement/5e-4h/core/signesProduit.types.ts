/**
 * Couche core — contrat propre à l'exercice "tableau de signes à plusieurs facteurs" (18, série
 * 1). Réutilise délibérément trois contrats déjà en place (même principe que les exercices 3 et
 * 4, voir CLAUDE.md) : `Exercice` de l'exercice "méthode la plus rapide" pour tout facteur
 * quadratique à factoriser (mécanisme reconnaissance+factorisation+racines réutilisé tel quel),
 * `PolynomeLineaire` de l'exercice "Simplifier" pour un facteur linéaire donné tel quel (k(x-p),
 * pas de technique à reconnaître), et `Morceau`/`Symbole` de l'exercice "tableau de signes" pour
 * les bornes d'un morceau d'intervalle. L'ensemble-solution final utilise en revanche son propre
 * type `SolutionEnsembleProduit` (ci-dessous), pas `SolutionEnsemble` de l'exercice "tableau de
 * signes" : celui-ci limite "union" à exactement 2 morceaux et "reel_sauf_point" à une seule
 * valeur, une limite propre à son générateur (Δ=0 ne peut produire qu'un seul point double) —
 * cette verticale-ci doit au contraire rester extensible à un nombre variable de morceaux/valeurs
 * (prompt-corrections-tableau-signes-3points.md, point 2), donc son propre type, jamais partagé.
 */

import type { Enonce, Exercice } from "./generateur.types";
import type { PolynomeLineaire } from "./simplification.types";
import type { Morceau, Symbole } from "./inequation.types";

export type Signe = "+" | "-";

/** Valeur d'une cellule du tableau de signes classique : un signe, ou "0" au point d'une racine. */
export type ValeurCellule = Signe | "0";

/** Facteur linéaire donné tel quel dans l'énoncé — aucune technique à reconnaître, juste sa racine p. */
export interface FacteurLineaire {
  type: "lineaire";
  polynome: PolynomeLineaire;
}

/**
 * Facteur quadratique à factoriser — réutilise directement `Exercice` (mécanisme de
 * reconnaissance+factorisation+racines de l'exercice "méthode la plus rapide"). `categorie` n'est
 * jamais "produit_remarquable" (racine double — violerait la contrainte "toutes les racines
 * distinctes", voir construireFacteurFactorisable.ts) ni "mise_en_evidence_generalisee" (famille 5,
 * hors périmètre de ce générateur).
 */
export interface FacteurQuadratiqueFactorisable {
  type: "quadratique_factorisable";
  exercice: Exercice;
}

/**
 * Facteur quadratique irréductible (Δ<0) — signe constant sur tout ℝ, jamais nul. `signe` est
 * toujours égal au signe réel de `enonce.a` (Δ<0 garantit qu'il ne change jamais).
 */
export interface FacteurQuadratiqueIrreductible {
  type: "quadratique_irreductible";
  enonce: Enonce;
  signe: Signe;
}

export type FacteurSignesProduit = FacteurLineaire | FacteurQuadratiqueFactorisable | FacteurQuadratiqueIrreductible;

/**
 * Grille de signes attendue, conforme au modèle classique (tableau à colonnes alternées zone/point
 * — voir prompt-refonte-tableau-signes.md) : pour n racines distinctes, chaque ligne et la ligne
 * produit comptent 2n+1 colonnes (zone, point, zone, point, ..., zone). `lignes` a une entrée par
 * ligne du tableau — un facteur P0 (constante négative, jamais de "0"), un facteur P1 (racine
 * propre, "0" à son propre point, un signe ailleurs) ou un facteur P2 (irréductible, signe
 * constant, jamais de "0") — dans l'ordre canonique défini par `ordreLignesGrille`
 * (src/generateurs/signesProduit/grille.ts) — jamais recalculé différemment côté génération et
 * côté présentation. `produit` est la ligne finale "signe du produit", une valeur par colonne
 * (peut valoir "0" à la colonne point d'une racine).
 */
export interface Grille {
  lignes: ValeurCellule[][];
  produit: ValeurCellule[];
}

/**
 * Ensemble-solution final, extensible en nombre de morceaux/valeurs (prompt-corrections-tableau-
 * signes-3points.md, point 2) — contrairement à `SolutionEnsemble` (exercice "tableau de signes"),
 * "union" porte une liste `morceaux` (toujours ≥2, sinon ce serait "intervalle") et
 * "reel_sauf_points" une liste `valeurs` (toujours ≥1). En pratique, ce générateur ne construit
 * jamais plus de 2 morceaux pour "union" (au plus 3 racines, signe strictement alterné — voir
 * classifierSolutionProduit) ni "point"/"reel_sauf_points" (aucune racine double n'est jamais
 * générée) ; le type reste néanmoins extensible pour que l'élève puisse construire sa réponse avec
 * un nombre arbitraire de morceaux/valeurs via "+ Ajouter", sans limite artificielle côté saisie.
 */
export type SolutionEnsembleProduit =
  | { forme: "vide" }
  | { forme: "reel" }
  | { forme: "point"; valeur: number }
  | { forme: "reel_sauf_points"; valeurs: number[] }
  | { forme: "intervalle"; morceau: Morceau }
  | { forme: "union"; morceaux: Morceau[] };

export interface ExerciceSignesProduit {
  /** 2 ou 3 facteurs, dans l'ordre d'affichage de l'énoncé (mélangé aléatoirement à la génération). */
  facteurs: FacteurSignesProduit[];
  symbole: Symbole;
  /** Toutes les racines distinctes (tous facteurs confondus), triées croissant — délimitent les zones. */
  racines: number[];
  grille: Grille;
  solution: SolutionEnsembleProduit;
}

export type GenerateurExerciceSignesProduit = () => ExerciceSignesProduit;
