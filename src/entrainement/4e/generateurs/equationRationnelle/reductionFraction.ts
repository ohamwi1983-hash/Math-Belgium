import type { PolynomeLineaire } from "../../core/simplification.types";
import type { FractionAReduire } from "../../core/equationRationnelle.types";

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/**
 * Calcule si une fraction P1/P2 (déjà garantie sans racine commune par les exclusions de
 * construction — voir CLAUDE.md) est réductible numériquement (pgcd des coefficients dominants
 * > 1). Retourne les coefficients "effectifs" (réduits si réductible, inchangés sinon) à utiliser
 * pour la suite du calcul (`equationIsolee`) : réduire une fraction par un facteur numérique ne
 * change jamais ses racines (fait algébrique général — les deux fractions restent racine-pour-
 * racine identiques), donc n'affecte jamais la classification ni les racines de l'équation
 * isolée, seulement l'échelle du coefficient dominant `a`.
 */
export function reduireSiPossible(
  cote: "gauche" | "droite",
  numerateur: PolynomeLineaire,
  denominateur: PolynomeLineaire,
): { kNumerateurEffectif: number; kDenominateurEffectif: number; entree: FractionAReduire | null } {
  const diviseur = pgcd(Math.abs(numerateur.k), Math.abs(denominateur.k));
  if (diviseur <= 1) {
    return { kNumerateurEffectif: numerateur.k, kDenominateurEffectif: denominateur.k, entree: null };
  }
  return {
    kNumerateurEffectif: numerateur.k / diviseur,
    kDenominateurEffectif: denominateur.k / diviseur,
    entree: { cote, numerateur, denominateur, diviseur },
  };
}
