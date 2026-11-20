import type { FragmentConsigne } from "../../export/genererFeuilleExercices";
import type { Ensemble, Poly2, Relation } from "../moteur/algebreTransfertSecondDegre";
import type { FormeEcriture } from "../moteur/formeEcriturePolynome";

/**
 * Écrans « en données » des nouveaux générateurs du chapitre 2 de 4e (gen115, gen116, gen118,
 * gen119, gen120) : un écran est soit un CHOIX fermé (UNE tentative), soit une liste de CHAMPS
 * libres (3 tentatives, une saisie illisible ne compte jamais). Les champs sont typés :
 * - `nombre` : une valeur exacte (fraction, radical « √2 » acceptés), pièges reconnus ;
 * - `liste` : des nombres dans n'importe quel ordre, séparés par « ; » (vide permis = « aucune ») ;
 * - `expression` : une expression polynomiale de degré ≤ 2 en `variable`, comparée par valeurs ;
 * - `equation` : « … = … », acceptée si les deux membres ramenés à 0 donnent un multiple NON NUL
 *   du trinôme attendu (toute équation équivalente obtenue en multipliant par une constante) ;
 * - `relation` : une (in)équation du second degré libre, jugée par son ENSEMBLE-SOLUTION (gen120 :
 *   toute réponse juste est acceptée), avec contraintes facultatives (symbole « = » ou non, coefficient
 *   de x² imposé) ;
 * - `ensemble` : un ensemble-solution construit (∅, ℝ, nombres isolés, intervalles et points).
 * Le texte visible est en fragments (texte / KaTeX) ; les messages d'erreur ciblés peuvent contenir
 * du LaTeX entre `$…$` (rendus par `messageFragments`).
 */

export type Fragments = FragmentConsigne[];
export type Variable = "x" | "t" | "m";

export interface PiegeNombre {
  valeur: number;
  message: string;
}

interface ChampBase {
  id: string;
  libelle: Fragments;
  /** Unité affichée après le champ. */
  unite?: string;
  /** Message quand la réponse est fausse sans correspondre à un piège connu. */
  messageSiFaux?: string;
}

export interface ChampNombre extends ChampBase {
  type: "nombre";
  cible: number;
  pieges: PiegeNombre[];
}

export interface ChampListe extends ChampBase {
  type: "liste";
  cibles: number[];
  pieges: { valeurs: number[]; message: string }[];
  /** « Aucune » accepté comme réponse (liste vide). */
  videPermis: boolean;
}

export interface ChampExpression extends ChampBase {
  type: "expression";
  variable: Variable;
  cible: Poly2;
  pieges: { poly: Poly2; message: string }[];
  /** Forme d'écriture EXIGÉE (gen126) : une écriture juste dans une autre forme reçoit un message
   * sans perte de tentative (statut `forme`). Absent : toute écriture juste est acceptée. */
  forme?: FormeEcriture;
}

export interface ChampEquation extends ChampBase {
  type: "equation";
  variable: Variable;
  /** Trinôme attendu (à un facteur non nul près) dans « trinôme = 0 ». */
  cible: Poly2;
  pieges: { poly: Poly2; message: string }[];
}

export interface ChampRelation extends ChampBase {
  type: "relation";
  variable: Variable;
  /** Ensemble-solution que la relation saisie doit avoir. */
  ensemble: Ensemble;
  /** « = » imposé (équation) ou interdit (inéquation). */
  sorte: "equation" | "inequation";
  /** Coefficient de x² imposé dans « ax² + bx + c ◇ 0 », s'il y en a un. */
  coefA?: number;
}

export interface ChampEnsemble extends ChampBase {
  type: "ensemble";
  variable: Variable;
  /** Préfixe LaTeX de l'aperçu et de la réponse affichée (défaut « S= ») — gen127 : « \operatorname{im} f= ». */
  prefixeApercu?: string;
  cible: Ensemble;
  pieges: { ensemble: Ensemble; message: string }[];
}

export type Champ = ChampNombre | ChampListe | ChampExpression | ChampEquation | ChampRelation | ChampEnsemble;

export type EcranTSD =
  | {
      type: "choix";
      titre: string;
      consigne: Fragments;
      options: Fragments[];
      bonne: number;
      aides: Fragments[];
      messageFaux: string;
      /** Message ciblé par option fausse (même ordre que `options`), sinon `messageFaux`. */
      messagesOptions?: (string | undefined)[];
      /** Explication d'un choix faux, option par option (gen128 : ce que donnerait l'équation
       * choisie) ; à défaut, `messageFaux`. */
      explications?: string[];
      /** Figure SVG autonome affichée avec l'écran (jamais une figure qui trahit la réponse). */
      figure?: string;
      /** Figure montrée seulement une fois l'écran clos. */
      figureApres?: string;
    }
  | {
      type: "champs";
      titre: string;
      consigne: Fragments;
      champs: Champ[];
      aides: Fragments[];
      /** Réponse attendue, affichée quand l'écran est clos. */
      reponse: Fragments;
      figure?: string;
      figureApres?: string;
    };

export type { Ensemble, Poly2, Relation };
