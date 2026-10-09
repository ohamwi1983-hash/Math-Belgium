import type { CandidatEtudeLogD, ExerciceEtudeLogD } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleAsymptote, CibleCroissance } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleReel } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const C_VALEURS = [1, 2, 3, 4] as const;
/** Pool de décalages, jamais `0` (sinon "minimumMalPlace" coïnciderait avec le réel). */
const DECALAGE_MIN_VALEURS = [-2, -1, 1, 2] as const;

/**
 * Famille D — `f(x) = x + c·e^(-x)`, c∈{1,2,3,4}. Domaine ℝ ; +∞ aux DEUX infinis (PIÈGE : ne pas
 * conclure "pas d'asymptote" par réflexe, même piège que `6gen11` famille C) ; asymptote OBLIQUE
 * y=x en +∞ SEULEMENT (réutilise `f(x)-x→0`, méthode de `6gen11` famille C) ; minimum toujours en
 * x=ln(c) ; toujours convexe.
 *
 * **Limites** : en -∞, x→-∞ mais c·e^(-x)→+∞ BEAUCOUP plus vite (exponentielle domine le linéaire)
 * — somme → +∞. En +∞, x→+∞ et c·e^(-x)→0 — somme → +∞ aussi (deux limites infinies, mais
 * structurellement différentes : celle de +∞ a une asymptote, celle de -∞ n'en a aucune).
 *
 * **Asymptote oblique** : f(x)-x = c·e^(-x) → 0 quand x→+∞ (donc asymptote y=x) ; → +∞ quand x→-∞
 * (donc aucune asymptote, même si la limite de f elle-même y est infinie).
 *
 * **Croissance** : f'(x) = 1 - c·e^(-x), nul en e^(-x)=1/c, soit x=ln(c). f'<0 avant (e^(-x)>1/c),
 * f'>0 après — minimum unique.
 *
 * **Concavité** : f''(x) = c·e^(-x) > 0 TOUJOURS (c>0) — convexe partout, jamais d'inflexion (le
 * terme linéaire x a une dérivée seconde nulle, n'affecte jamais le signe de f'').
 */
export function construireD(): ExerciceEtudeLogD {
  const c = tirerParmi(C_VALEURS);
  const positionMinimum = Math.log(c);

  const limites: [CibleLimite, CibleLimite] = [{ type: "plus_infini" }, { type: "plus_infini" }];
  const asymptotes: [CibleAsymptote, CibleAsymptote] = [{ type: "aucune" }, { type: "oblique", a: 1, b: 0 }];
  const croissance: CibleCroissance = { type: "minimum", position: positionMinimum };

  const reel: CandidatEtudeLogD = { type: "reel", c, decalageMin: 0 };
  const pasAsymptoteOblique: CandidatEtudeLogD = { type: "pasAsymptoteOblique", c, decalageMin: 0 };
  const minimumMalPlace: CandidatEtudeLogD = { type: "minimumMalPlace", c, decalageMin: tirerParmi(DECALAGE_MIN_VALEURS) };
  const inflexionInventee: CandidatEtudeLogD = { type: "inflexionInventee", c, decalageMin: 0 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, pasAsymptoteOblique, minimumMalPlace, inflexionInventee]);

  return {
    famille: "D",
    c,
    domaine: ensembleReel(),
    limites,
    asymptotes,
    croissance,
    concavite: { type: "convexe_partout", positions: [] },
    candidats,
    indexCorrect,
  };
}

export { C_VALEURS as D_C_VALEURS, DECALAGE_MIN_VALEURS as D_DECALAGE_MIN_VALEURS };
