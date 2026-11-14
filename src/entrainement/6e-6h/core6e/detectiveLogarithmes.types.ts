import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { EnsembleReelGuide } from "./ensembleReel.types";

/**
 * Couche core — « Le détective d'erreurs : logarithmes » (6gen88, 6e, chapitre 3 « Fonctions
 * logarithmes », section « problemes », processus 3 TRANSFÉRER). Même mécanique que 6gen84
 * (« Le détective d'erreurs : intégrales et primitives ») et gen81/gen91 (4e).
 *
 * Un élève fictif a résolu un exercice du chapitre (3 à 5 lignes numérotées). UNE SEULE ligne est
 * fausse, et tout ce qui suit en découle (la copie reste cohérente avec son erreur). L'élève trouve
 * la ligne, nomme l'erreur, puis corrige (valeur de la ligne et/ou résultat final, valeurs exactes).
 *
 * Notation du cours : `\ln(x)`, `\log_a(x)`, `\log(x)` (base 10), CE (condition d'existence) lue sur
 * l'équation de DÉPART, `\ln(x^2) = 2\ln|x|`, `\left(\ln(u)\right)' = \dfrac{u'}{u}`,
 * `\log_a(x) = \dfrac{\ln(x)}{\ln(a)}`, sens inversé pour une base `0 < a < 1`.
 */

/** Les huit types d'erreur du catalogue (une variante chacun). */
export type TypeErreurLogarithmes = "somme" | "carre" | "domaine" | "base" | "puissance" | "quotient" | "derivee" | "changementBase";

/**
 * Scénario = type d'erreur + exercice support + ligne fausse (même étape d'une série à l'autre) :
 * - S1 : ln(x + a) = b, écrit ln(x) + ln(a) = b (ligne 2/4) ;
 * - S2 : ln(eᵏx) = m, écrit ln(eᵏ)·ln(x) = k ln(x) (ligne 2/4) ;
 * - C1 : ln(x²) = ln(a²), écrit 2 ln(x) : solution −a perdue (ligne 2/4) ;
 * - C2 : ln(x²) < 2k, écrit 2 ln(x) : solutions négatives perdues (ligne 1/3) ;
 * - D1 : logₐ(x) + logₐ(x − p) = q, CE calculée sur la forme regroupée (ligne 2/4) ;
 * - D2 : 2 ln(x) = ln(x + n), CE jamais vérifiée : solution parasite gardée (ligne 4/4) ;
 * - B1 : log_{1/2}(x − p) > −n, sens non inversé (ligne 2/4) ;
 * - B2 : log_{0,5}(2x − b) ≤ log_{0,5}(x + c), sens non inversé (ligne 2/4) ;
 * - P1 : (ln(x))² = m², écrit 2 ln(x) = m² (ligne 2/4) ;
 * - P2 : f(x) = (ln(x))², écrit 2 ln(x) avant de dériver (ligne 2/4) ;
 * - Q1 : ln(x)/ln(a) = q, écrit ln(x − a) = q (ligne 2/4) ;
 * - Q2 : log₂(X)/log₂(Y) écrit log₂(X − Y) (ligne 1/3) ;
 * - V1 : dérivée de ln(x² + c) écrite 1/(x² + c) (ligne 2/3) ;
 * - V2 : tangente à ln(ax + b), dérivée 1/(ax + b) (ligne 2/4) ;
 * - K1 : aˣ = b, logₐ(b) écrit ln(a)/ln(b) (ligne 2/3) ;
 * - K2 : log_B(A) écrit ln(B)/ln(A) (ligne 1/3).
 */
export type IdScenarioLogarithmes = "S1" | "S2" | "C1" | "C2" | "D1" | "D2" | "B1" | "B2" | "P1" | "P2" | "Q1" | "Q2" | "V1" | "V2" | "K1" | "K2";

/** Descriptions d'erreur proposées à l'écran 2 (la bonne + 3 leurres). */
export type IdDescriptionLogarithmes =
  | "somme"
  | "produit"
  | "valeurAbsolue"
  | "ceRegroupee"
  | "solutionParasite"
  | "sensBase"
  | "carreLn"
  | "quotient"
  | "deriveeCompose"
  | "changementBase"
  // leurres
  | "produitSomme"
  | "puissanceSomme"
  | "ceSomme"
  | "puissanceProduit"
  | "diviserK"
  | "ceProduit"
  | "carreDouble"
  | "carreRacine"
  | "ceCarre"
  | "sensCarre"
  | "ceInegalite"
  | "ceInutile"
  | "ceNonNul"
  | "injectiviteFausse"
  | "rejeterR"
  | "deuxSolutionsAbs"
  | "puissanceSigne"
  | "ceBase"
  | "baseConserve"
  | "simplifierLog"
  | "ceIntersection"
  | "sensMembre"
  | "carreLnCarre"
  | "carreExp"
  | "carreCE"
  | "quotientDiff"
  | "quotientSimplifier"
  | "quotientCE"
  | "quotientLogQuotient"
  | "deriveeUSurU2"
  | "deriveeLnPrime"
  | "deriveeDomaine"
  | "baseProduit"
  | "baseDifference"
  | "baseLog10";

export interface ExerciceDetectiveLogarithmes {
  scenario: IdScenarioLogarithmes;
  /** Paramètres entiers du scénario (noms propres à chaque scénario, voir le modèle). */
  donnees: Record<string, number>;
  /** Les 4 descriptions de l'écran 2, dans l'ordre d'affichage (tiré à la génération : le QR code
   * rouvre le même ordre). */
  options: IdDescriptionLogarithmes[];
}

/** Nombre exact : son écriture LaTeX et sa valeur. */
export interface NombreExact {
  latex: string;
  valeur: number;
}

/** Valeur demandée à l'écran 3 (ce qu'il faut corriger). */
export type ValeurLog =
  | {
      genre: "nombre";
      libelle: string;
      /** LaTeX avant le champ (`f'(2) =`, `\log_4(8) =`). */
      quantite: string;
      nombre: NombreExact;
    }
  | {
      genre: "fonction";
      libelle: string;
      /** LaTeX avant le champ (`f'(x)`, `y`, `\ln(e^{2}x)`). */
      quantite: string;
      /** LaTeX de la bonne réponse. */
      latex: string;
      variable: "x";
      /** Fonction de référence (calculée par le modèle à chaque appel, jamais stockée). */
      f: (x: number) => number;
      /** Points d'échantillonnage (tous dans le domaine de l'exercice). */
      points: number[];
      /** Toujours `false` ici (champ du vérificateur partagé avec 6gen84). */
      aConstantePres: false;
      avecC: false;
    }
  | {
      genre: "ensemble";
      libelle: string;
      /** Ensemble fini des solutions (vide possible), dans l'ordre croissant. */
      elements: NombreExact[];
    }
  | {
      genre: "intervalle";
      libelle: string;
      /** Préfixe LaTeX de l'aperçu (`S =`, `x \in`). */
      quantite: string;
      ensemble: EnsembleReelGuide;
      /** Écriture exacte (`\mathopen{]}0;e^{2}\mathclose{[}`). */
      latex: string;
      /** Bornes exactes (LaTeX ↔ valeur) : pour réécrire la saisie de l'élève dans la fiche. */
      bornes: NombreExact[];
    };

/** Réponse à un champ de l'écran 3 : un texte libre, ou un ensemble construit (`null` si incomplet). */
export type ReponseChampLog = string | EnsembleReelGuide | null;

/** Les fragments viennent de l'export (une seule source écran / papier). */
export type { FragmentConsigne };
