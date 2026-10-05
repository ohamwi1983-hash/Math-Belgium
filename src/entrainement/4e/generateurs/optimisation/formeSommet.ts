/**
 * Couche A — forme sommet → forme développée, PARTAGÉE par les 3 familles `fonctionDonnee`
 * (`trajectoire`/`archePont`/`coutProduction`, spec section 3, familles C/D/E) : fonction et
 * domaine sont directement fournis par l'énoncé (jamais de dérivation, contrairement à
 * `modelisation`), donc chaque famille n'a besoin que de choisir (sommet, |a|, sens) puis
 * d'appeler cette seule primitive.
 *
 * f(x) = a·(x-x_S)² + h_S = a·x² - 2a·x_S·x + (a·x_S² + h_S). Propreté entière garantie : `xS`/`hS`/
 * `aAbs` sont toujours entiers (imposé par chaque famille appelante), donc `a`/`b`/`c` le sont
 * aussi automatiquement — jamais de vérification a posteriori nécessaire.
 */
import type { CoefficientsQuadratiques, SensOptimisation } from "../../core/optimisation.types";

export function fonctionDepuisSommet(sens: SensOptimisation, xS: number, hS: number, aAbs: number): CoefficientsQuadratiques {
  const a = sens === "max" ? -aAbs : aAbs;
  return { a, b: -2 * a * xS, c: a * xS * xS + hS };
}
