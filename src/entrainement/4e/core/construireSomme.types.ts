/**
 * Couche core — « Construire une somme, une différence, un point » (gen83, 4e, chapitre 6
 * « Calcul vectoriel », section `additionGeometrique`, processus 2 APPLIQUER).
 *
 * Prolonge la grille magnétique de gen23 (`AppConstructionVectorielle`) : l'élève fait glisser
 * l'EXTRÉMITÉ d'un vecteur dont l'ORIGINE est imposée (point O, extrémité d'un vecteur déjà
 * tracé…) ; chaque construction est jugée sur le nœud exact atteint. Cinq variantes :
 * - `somme` : u + v (méthode du triangle — u part de O, v est dessiné ailleurs — ou du
 *   parallélogramme — u et v partent tous deux de O) ;
 * - `difference` : u − v (en ajoutant l'opposé −v au bout de u, ou à partir d'une origine commune :
 *   u − v relie alors l'extrémité de v à celle de u) ;
 * - `combinaison` : k·u + l·v (k, l entiers ou demi-entiers, signes variés) ;
 * - `point` : placer M défini par AM = k·AB + l·AC, ou par MA = k·AB + l·AC (il faut d'abord
 *   retourner la relation) ;
 * - `lecture` : lire les composantes de deux vecteurs tracés (section `composantes`).
 *
 * Représentation unique : deux vecteurs u et v (composantes entières), deux coefficients k et l, et
 * l'origine O de la construction. Pour `point`, A = O, B = A + u (AB = u) et C = A + v (AC = v).
 */
import type { Composantes, Point } from "./vecteur.types";

export type VarianteConstruireSomme = "somme" | "difference" | "combinaison" | "point" | "lecture";

/**
 * Méthode (ou forme de l'énoncé) tirée dans la variante :
 * - somme : `triangle` | `parallelogramme` ;
 * - difference : `oppose` | `origineCommune` ;
 * - point : `AM` | `MA` ;
 * - combinaison : `chaine` ; lecture : `lecture`.
 */
export type MethodeConstruireSomme = "triangle" | "parallelogramme" | "oppose" | "origineCommune" | "chaine" | "AM" | "MA" | "lecture";

export interface ExerciceConstruireSomme {
  variante: VarianteConstruireSomme;
  methode: MethodeConstruireSomme;
  u: Composantes;
  v: Composantes;
  /** Coefficients DE L'ÉNONCÉ (somme : 1 et 1 ; différence : 1 et −1 ; point MA : coefficients de
   * la relation MA = k·AB + l·AC, donc AM = −k·AB − l·AC). Toujours entiers ou demi-entiers. */
  k: number;
  l: number;
  /** Origine de la construction (O ; A pour la variante `point`). */
  O: Point;
  /** Origine du DESSIN de u dans les données (= O sauf combinaison et lecture). */
  origineU: Point;
  /** Origine du DESSIN de v dans les données (= O pour les méthodes à origine commune). */
  origineV: Point;
  /** v colinéaire à u (somme, différence, combinaison) : le cas particulier des évaluations. */
  colineaires: boolean;
}

/** Une construction : origine imposée, extrémité attendue (nœud entier). */
export interface EcranConstruction {
  type: "construction";
  origine: Point;
  attendu: Point;
  /** Rôle pédagogique de l'écran (aides, diagnostics, corrigé). */
  role: RoleConstruction;
  /** Vecteur à tracer, en LaTeX (« \vec{v} », « -\vec{v} », « 2\vec{u} », « \vec{u}+\vec{v} »…). */
  vecteurLatex: string;
}

/**
 * - `reporter` : recopier un vecteur donné (ou un multiple) à partir d'une origine imposée ;
 * - `oppose` : tracer −v au bout de u ;
 * - `multiple` : tracer k·w (k ≠ 1) ;
 * - `differenceCommune` : tracer u − v depuis l'extrémité de v (u et v de même origine) ;
 * - `resultat` : tracer le vecteur final depuis O (somme, différence, combinaison) ;
 * - `placerPoint` : dernière étape de la variante point (l'extrémité est M).
 */
export type RoleConstruction = "reporter" | "oppose" | "multiple" | "differenceCommune" | "resultat" | "placerPoint";

export interface EcranChoix {
  type: "choix";
  /** Options en LaTeX (membre de droite de « \vec{AM} = … ») ; `correct` = indice de la bonne. */
  options: string[];
  correct: number;
}

export interface EcranLecture {
  type: "lecture";
}

export type EcranConstruireSomme = EcranConstruction | EcranChoix | EcranLecture;

export type { Composantes, Point };
