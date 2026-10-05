/**
 * Couche core — contrat propre à l'exercice "Analyse d'une fonction du second degré" (chapitre 1).
 * Réutilise directement `Exercice` de src/core/generateur.types.ts (même couplage assumé que les
 * exercices 3/4/5/6) pour profiter tel quel du mécanisme reconnaissance+factorisation+racines de
 * l'exercice 1, restreint aux 3 techniques sans Δ (voir generateurs/analyseFonction). Réutilise
 * aussi `Morceau`/`Crochet` de src/core/inequation.types.ts pour la construction guidée de `imf`
 * (étape 4) — un seul morceau, jamais les 6 formes complètes (imf est toujours un intervalle semi-
 * infini une fois y_S connu).
 */

import type { Exercice } from "./generateur.types";
import type { ValeurCellule } from "./signesProduit.types";

export type TermeCoefficient = "a" | "b" | "c";

/** Signe du coefficient a — étape "allure". */
export type SigneAllure = "+" | "-";

/** Signe du produit a·b — étape "allure" (peut être nul si b=0). */
export type SigneProduitAB = "+" | "-" | "0";

export interface ChoixAllure {
  signeA: SigneAllure;
  signeAB: SigneProduitAB;
}

export interface ReponseCoefficients {
  a: number;
  b: number;
  c: number;
}

export interface ReponseAxeSommet {
  axeTexte: string;
  xS: number;
  yS: number;
}

/**
 * Les 6 étapes du générateur (section 9 de la spec), chacune activable/désactivable
 * indépendamment par le professeur — voir ReglagesAnalyseFonction. `tableauSignes` (étape 6) est
 * le tableau "signe et variation" (prompt-8-corrections-analyse-fonction.md, section 8) — une
 * structure propre à cet exercice, distincte du tableau de signes générique de l'exercice 2 ou de
 * la grille multi-facteurs de l'exercice 5 (jamais réutilisés ici).
 */
export type EtapeAnalyseFonction =
  | "coefficients"
  | "allure"
  | "axeSommet"
  | "domaineImage"
  | "racines"
  | "tableauSignes";

/** Ordre canonique des 6 étapes — utilisé par la Couche B pour déterminer la phase initiale/suivante. */
export const ORDRE_ETAPES_ANALYSE_FONCTION: EtapeAnalyseFonction[] = [
  "coefficients",
  "allure",
  "axeSommet",
  "domaineImage",
  "racines",
  "tableauSignes",
];

export interface ReglagesAnalyseFonction {
  etapesActives: Record<EtapeAnalyseFonction, boolean>;
}

/**
 * Symboles de la ligne "variation" du tableau signe et variation (étape 6) : flèches de
 * croissance/décroissance pour les colonnes ordinaires, symboles de sommet (creux/bosse) pour la
 * colonne x_S — jamais une flèche à cette colonne précise (section 8 de la spec).
 */
export type ValeurVariation = "↗" | "↘" | "⌢" | "⌣";

/**
 * Tableau "signe et variation" (étape 6, section 8 de la spec) — remplace le tableau de signes
 * générique pour cet exercice : 3 lignes (en-tête des valeurs de x, signe de f(x), variation),
 * colonnes = racines réelles (1 si racine double, 2 si distinctes) et x_S fusionnés/triés. Calculé
 * entièrement à la génération (Couche A) à partir de racines/xS/yS déjà connus — jamais recalculé
 * différemment côté vérification, même principe que `Grille` de l'exercice 5.
 */
export interface GrilleSigneVariation {
  /** Valeurs distinguées triées croissant : [racine] si racine double (= x_S), sinon [r1, x_S, r2]. */
  colonnesValeurs: number[];
  /** Index dans colonnesValeurs correspondant à x_S (coïncide avec l'unique racine si racine double). */
  indexSommet: number;
  /** 2k+1 entrées (k = colonnesValeurs.length), alternance zone/point/zone/... — ligne "signe de f(x)". */
  ligneSigne: ValeurCellule[];
  /** 2k+1 entrées, même alternance — ligne "variation" (flèches, sauf symbole de sommet à x_S). */
  ligneVariation: ValeurVariation[];
}

export interface ExerciceAnalyseFonction {
  /** ax²+bx+c ; categorie toujours mise_en_evidence | binome_conjugue | produit_remarquable, jamais cas_general. */
  exercice: Exercice;
  /** Ordre d'affichage des termes non nuls pour l'étape 1, mélangé aléatoirement à la génération. */
  ordreTermes: TermeCoefficient[];
  /** Abscisse du sommet, -b/(2a). */
  xS: number;
  /** Ordonnée du sommet, f(xS). */
  yS: number;
  /** Tableau de référence pour l'étape 6 — voir GrilleSigneVariation. */
  grilleSigneVariation: GrilleSigneVariation;
}

export type GenerateurExerciceAnalyseFonction = () => ExerciceAnalyseFonction;
