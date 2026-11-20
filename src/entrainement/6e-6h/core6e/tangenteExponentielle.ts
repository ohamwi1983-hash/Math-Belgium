import type { Rat } from "../ui6e/nombresExpoLotG";
import { rat, ratMul, ratPow, ratVal } from "../ui6e/nombresExpoLotG";

/**
 * Couche core — `6gen149` « Tangente à une exponentielle et nombre ln a » (6e ch. 2, § 2, processus
 * 2 APPLIQUER ; lot G de l'audit). Décision de l'utilisateur : ln a n'est utilisé au ch. 2 que comme
 * la PENTE de la tangente en (0 ; 1) à la courbe de aˣ (cours, § 2 : (aˣ)′ = ln a·aˣ), valeur exacte
 * « ln a » ou touche ln de la calculatrice — jamais comme réciproque de l'exponentielle.
 *
 * Variantes (un écran par étape) :
 * - `en-zero` : f(x) = aˣ. 1) signe de la pente en (0 ; 1) — verdict (choix fermé, a > 1 ou
 *   0 < a < 1 tiré 50/50) ; 2) la pente f′(0) = ln a ; 3) l'équation de la tangente y = ln a·x + 1.
 * - `en-x0` : f(x) = k·aˣ, x₀ entier non nul. 1) f(x₀) exact ; 2) f′(x₀) = k·a^{x₀}·ln a ;
 *   3) tangente y = f′(x₀)(x − x₀) + f(x₀).
 * - `base-e` : f(x) = k·e^{mx} — la base dont la pente en 0 vaut 1 (ln e = 1) ; 1) f(x₀) = k·e^{mx₀} ;
 *   2) f′(x₀) = k·m·e^{mx₀} (règle de la chaîne, aucun facteur ln) ; 3) tangente.
 */

export type VarianteTangenteExpo = "en-zero" | "en-x0" | "base-e";

export type IdSigne = "positive" | "negative" | "nulle";

export interface ExerciceTangenteExpo {
  variante: VarianteTangenteExpo;
  /** Base a (variantes `en-zero` et `en-x0`) ; `null` pour la base e. */
  base: Rat | null;
  k: number;
  /** Coefficient de x dans l'exposant (base e) ; 1 sinon. */
  m: number;
  x0: number;
  /** Ordre d'affichage des trois options du verdict (`en-zero`). */
  ordreSigne: IdSigne[];
  cleCollecteur: string;
}

export const aVal = (e: ExerciceTangenteExpo): number => (e.base ? ratVal(e.base) : Math.E);
export const lnA = (e: ExerciceTangenteExpo): number => Math.log(aVal(e));

export function evaluer(e: ExerciceTangenteExpo, x: number): number {
  return e.k * Math.pow(aVal(e), e.m * x);
}

/** f(x₀) : rationnel exact (bases rationnelles) ; facteur de e^{m x₀} en base e. */
export function imageExacte(e: ExerciceTangenteExpo): Rat {
  return e.base ? ratMul(rat(e.k), ratPow(e.base, e.x0)) : rat(e.k);
}

/** Coefficient de la pente : f′(x₀) = coef·ln a (bases rationnelles) ou coef·e^{m x₀} (base e). */
export function coefPente(e: ExerciceTangenteExpo): Rat {
  return e.base ? imageExacte(e) : rat(e.k * e.m);
}

export const image = (e: ExerciceTangenteExpo): number => evaluer(e, e.x0);
export const pente = (e: ExerciceTangenteExpo): number => e.k * e.m * lnA(e) * Math.pow(aVal(e), e.m * e.x0);
export const ordonneeOrigine = (e: ExerciceTangenteExpo): number => image(e) - pente(e) * e.x0;
export const signeAttendu = (e: ExerciceTangenteExpo): IdSigne => (lnA(e) > 0 ? "positive" : "negative");
