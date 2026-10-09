import type { CandidatEtudeLogA, ExerciceEtudeLogA } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleAsymptote, CibleCroissance } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const A_VALEURS = [1, 2, 3] as const;
/** Pool de décalages d'exposant, jamais `0` (sinon "minimumMalPlace" coïnciderait avec le réel). */
const DECALAGE_EXPOSANT_VALEURS = [-2, -1, 1, 2] as const;
/** Pool de facteurs multiplicatifs, jamais `1` (sinon "limiteZeroIncorrecte" coïnciderait avec le
 * réel). */
const FACTEUR_LIMITE_VALEURS = [0.5, 2, 3] as const;

/** Position INVARIANTE du minimum, quel que soit a>0 (voir preuve dans l'en-tête ci-dessous). */
export const POSITION_MINIMUM_A = 1 / Math.E;

/**
 * Famille A — `f(x) = x^(ax)`, x>0, a∈{1,2,3}. Toujours convexe, jamais d'inflexion ; extremum
 * (minimum) toujours en x=1/e, INVARIANT en a ; limite 1 en 0⁺ (PIÈGE : borne FINIE du domaine, pas
 * un infini — ne jamais y voir une asymptote) ; limite +∞ en +∞ ; aucune asymptote.
 *
 * **Dérivation logarithmique implicite** (technique de `6gen16` famille G, généralisée ici à
 * u(x)=x, v(x)=ax) : ln f = ax·ln x, donc f'/f = a·ln x + a·x·(1/x) = a·(ln x + 1). Nul en
 * ln x = -1, soit x = 1/e — INDÉPENDANT de a (le facteur a se simplifie), d'où l'invariance
 * structurelle de la position du minimum quel que soit a>0.
 *
 * **Convexité** : f'/f = a(ln x + 1), donc (f'/f)' = a/x. f'' = f·[(f'/f)² + (f'/f)'] =
 * f·[a²(ln x+1)² + a/x]. Pour x>0 et a>0, a/x>0 et le carré est ≥0 : somme TOUJOURS strictement
 * positive — f''>0 partout, convexe partout, jamais de changement de signe donc jamais d'inflexion.
 */
export function construireA(): ExerciceEtudeLogA {
  const a = tirerParmi(A_VALEURS);

  const limites: [CibleLimite, CibleLimite] = [{ type: "valeur", valeur: 1 }, { type: "plus_infini" }];
  const asymptotes: [CibleAsymptote, CibleAsymptote] = [{ type: "aucune" }, { type: "aucune" }];
  const croissance: CibleCroissance = { type: "minimum", position: POSITION_MINIMUM_A };

  const reel: CandidatEtudeLogA = { type: "reel", a, decalageExposant: 0, facteurLimite: 1 };
  const minimumMalPlace: CandidatEtudeLogA = { type: "minimumMalPlace", a, decalageExposant: tirerParmi(DECALAGE_EXPOSANT_VALEURS), facteurLimite: 1 };
  const limiteZeroIncorrecte: CandidatEtudeLogA = { type: "limiteZeroIncorrecte", a, decalageExposant: 0, facteurLimite: tirerParmi(FACTEUR_LIMITE_VALEURS) };
  const inflexionInventee: CandidatEtudeLogA = { type: "inflexionInventee", a, decalageExposant: 0, facteurLimite: 1 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, minimumMalPlace, limiteZeroIncorrecte, inflexionInventee]);

  return {
    famille: "A",
    a,
    domaine: ensembleUnMorceau(versLeHautDepuis(0, false)),
    limites,
    asymptotes,
    croissance,
    concavite: { type: "convexe_partout", positions: [] },
    candidats,
    indexCorrect,
  };
}

export { A_VALEURS, DECALAGE_EXPOSANT_VALEURS as A_DECALAGE_EXPOSANT_VALEURS, FACTEUR_LIMITE_VALEURS as A_FACTEUR_LIMITE_VALEURS };
