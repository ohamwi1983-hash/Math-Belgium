import { enDegres, enRadians } from "../ui6e/nombresCycloLotG";

/**
 * Couche core — `6gen156` « Problèmes avec arcfonctions » (6e ch. 1, § 2 et § 4, processus 3
 * TRANSFÉRER ; lot G de l'audit). Trois vraies questions par problème, calculatrice indispensable
 * (angles en degrés au dixième, longueurs au centimètre), indices de réfraction réels.
 *
 * Décomposition du raisonnement (une question = un écran) :
 * 1. modéliser : reconnaître la relation (loi de Snell-Descartes, triangle rectangle, différence de
 *    deux angles) et quel rapport donne l'angle (sinus, cosinus, tangente) ;
 * 2. isoler la fonction trigonométrique de l'angle cherché ;
 * 3. appliquer l'arcfonction qui convient (calculatrice en degrés) et interpréter (existence d'un
 *    rayon réfracté, distance qui maximise, angle de sécurité).
 *
 * Variantes (contextes) :
 * - `refraction` : air → eau, verre, plexiglas ou diamant ; a) angle de réfraction, b) incidence pour
 *   un angle de réfraction voulu, c) plus grand angle de réfraction possible (incidence rasante) ;
 * - `reflexion-totale` : eau → air, verre → air, verre → eau, diamant → air ; a) angle limite,
 *   b) angle de réfraction sous l'angle limite, c) VERDICT « existe-t-il un rayon réfracté ? » pour
 *   une autre incidence (oui / non tiré 50/50, à 3° au moins de l'angle limite) ;
 * - `angle-de-vue` : tableau, écran de cinéma, panneau ; θ(x) = arctan(b/x) − arctan(a/x) ;
 *   a) angle à une distance donnée, b) distance qui maximise (√(ab), par la dérivée), c) angle maximal ;
 * - `echelle` : a) angle avec le sol (arccos), b) distance au mur pour l'angle de sécurité de 75°,
 *   c) angle pour atteindre une hauteur donnée (arcsin).
 */

export type VarianteProblemesArcfonctions = "refraction" | "reflexion-totale" | "angle-de-vue" | "echelle";

export interface Milieu {
  id: "air" | "eau" | "verre" | "plexiglas" | "diamant";
  /** « l'air », « l'eau », « le verre »… */
  nom: string;
  /** « de l'air », « de l'eau », « du verre »… */
  de: string;
  /** « dans l'air », « dans l'eau »… */
  dans: string;
  n: number;
}

export const MILIEUX: Record<Milieu["id"], Milieu> = {
  air: { id: "air", nom: "l'air", de: "de l'air", dans: "dans l'air", n: 1.0 },
  eau: { id: "eau", nom: "l'eau", de: "de l'eau", dans: "dans l'eau", n: 1.33 },
  verre: { id: "verre", nom: "le verre", de: "du verre", dans: "dans le verre", n: 1.5 },
  plexiglas: { id: "plexiglas", nom: "le plexiglas", de: "du plexiglas", dans: "dans le plexiglas", n: 1.49 },
  diamant: { id: "diamant", nom: "le diamant", de: "du diamant", dans: "dans le diamant", n: 2.42 },
};

export type ContexteVue = "musee" | "cinema" | "panneau";

export type ExerciceProblemesArcfonctions =
  | {
      variante: "refraction";
      milieu1: Milieu;
      milieu2: Milieu;
      /** Incidence (a), en degrés entiers. */
      theta1: number;
      /** Angle de réfraction voulu (b), en degrés entiers. */
      theta2Voulu: number;
      cleCollecteur: string;
    }
  | {
      variante: "reflexion-totale";
      milieu1: Milieu;
      milieu2: Milieu;
      /** Incidence sous l'angle limite (b). */
      theta1: number;
      /** Incidence du verdict (c). */
      theta1Verdict: number;
      contexte: "piscine" | "fibre" | "aquarium" | "diamant";
      cleCollecteur: string;
    }
  | {
      variante: "angle-de-vue";
      contexte: ContexteVue;
      /** Hauteurs du bas et du haut au-dessus des yeux (m). */
      a: number;
      b: number;
      /** Distance de la question a (m). */
      x0: number;
      cleCollecteur: string;
    }
  | {
      variante: "echelle";
      /** Longueur de l'échelle (m). */
      L: number;
      /** Distance du pied au mur (a), en m. */
      d: number;
      /** Hauteur à atteindre (c), en m. */
      h: number;
      cleCollecteur: string;
    };

export type ExRefraction = Extract<ExerciceProblemesArcfonctions, { variante: "refraction" }>;
export type ExReflexion = Extract<ExerciceProblemesArcfonctions, { variante: "reflexion-totale" }>;
export type ExVue = Extract<ExerciceProblemesArcfonctions, { variante: "angle-de-vue" }>;
export type ExEchelle = Extract<ExerciceProblemesArcfonctions, { variante: "echelle" }>;

export const ANGLE_SECURITE = 75;

const asinDeg = (v: number) => enDegres(Math.asin(v));
const acosDeg = (v: number) => enDegres(Math.acos(v));
const sinDeg = (d: number) => Math.sin(enRadians(d));
const cosDeg = (d: number) => Math.cos(enRadians(d));

/** sin θ₂ = n₁ sin θ₁ / n₂ (peut dépasser 1 : pas de rayon réfracté). */
export const sinusRefracte = (n1: number, n2: number, theta1: number): number => (n1 * sinDeg(theta1)) / n2;
export const angleRefracte = (n1: number, n2: number, theta1: number): number => asinDeg(sinusRefracte(n1, n2, theta1));
export const angleLimite = (n1: number, n2: number): number => asinDeg(n2 / n1);
/** Incidence qui donne l'angle de réfraction θ₂ : sin θ₁ = n₂ sin θ₂ / n₁. */
export const incidencePour = (n1: number, n2: number, theta2: number): number => asinDeg((n2 * sinDeg(theta2)) / n1);
/** Incidence rasante (θ₁ = 90°) : plus grand angle de réfraction. */
export const angleRefracteMax = (n1: number, n2: number): number => asinDeg(n1 / n2);

export const angleVue = (a: number, b: number, x: number): number => enDegres(Math.atan(b / x) - Math.atan(a / x));
export const distanceOptimale = (a: number, b: number): number => Math.sqrt(a * b);
export const angleVueMax = (a: number, b: number): number => angleVue(a, b, distanceOptimale(a, b));

export const angleSol = (L: number, d: number): number => acosDeg(d / L);
export const distanceSecurite = (L: number): number => L * cosDeg(ANGLE_SECURITE);
export const angleHauteur = (L: number, h: number): number => asinDeg(h / L);

export const verdictRayon = (e: ExReflexion): boolean => e.theta1Verdict < angleLimite(e.milieu1.n, e.milieu2.n);
