import type { CandidatEtudeC, ExerciceEtudeC } from "../../../core6e/etudeFonctionExponentielle.types";
import { ensembleReel } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const BASE_VALEURS = [2, 3, 5] as const;
const M_VALEURS = [1, 2] as const;
const N_VALEURS = [-3, -2, -1, 0, 1, 2, 3] as const;
const P_VALEURS = [-2, -1, 0, 1, 2] as const;
/** Pool de décalages d'exposant, jamais `0` (sinon "minimumMalPlace" coïnciderait avec le réel). */
const DECALAGE_MIN_VALEURS = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Famille C — `f(x) = base^(mx+n) − c·x`, base∈{2,3,5}, m∈{1,2}, c>0 DÉRIVÉ. Nouveauté du
 * générateur : ASYMPTOTE OBLIQUE, jamais testée avant ce générateur du chapitre.
 *
 * **Construction "cible d'abord"** — `base`/`m`/`n` tirés librement, puis un exposant CIBLE
 * `p∈{-2,...,2}` choisi pour l'extremum ; `c = m·ln(base)·base^p` est DÉRIVÉ pour garantir
 * `f'(x)=0` exactement en `mx+n=p`, donc en `x=(p−n)/m` — une position exacte (rationnelle, pas
 * nécessairement entière si m=2), jamais un simple tirage de c suivi d'une résolution.
 *
 * **Preuve** : `f'(x) = m·ln(base)·base^(mx+n) − c`. En substituant `c`, `f'(x)=0 ⟺
 * base^(mx+n)=base^p ⟺ mx+n=p` (base>1, `base^u` strictement croissante donc injective) `⟺
 * x=(p−n)/m`. `f''(x) = m²·ln(base)²·base^(mx+n) > 0` TOUJOURS (le terme `−c·x` a une dérivée
 * seconde nulle, n'affecte jamais le signe de f'') — convexe partout, donc ce point critique
 * unique est bien un MINIMUM (jamais un maximum ni un point-selle).
 *
 * **Asymptote oblique** — en `x→−∞`, `mx+n→−∞` (m>0) donc `base^(mx+n)→0` : `f(x)−(−c·x) =
 * base^(mx+n)→0`, exactement la définition d'une asymptote oblique `y=−c·x`. En `x→+∞`,
 * `base^(mx+n)→+∞` domine `−c·x` : `f→+∞`, aucune asymptote.
 *
 * **`c` affiché symboliquement, jamais en décimal** — `c` est en général IRRATIONNEL (facteur
 * `ln(base)`) ; voir `ui6e/formatEtudeFonctionExponentielle.ts::formatCoefficientCLatex`, qui le
 * rend comme `K·ln(base)` (K rationnel EXACT, `K=m·base^p`) plutôt que d'approximer en décimal —
 * cohérent avec la convention "jamais de notation décimale pour une valeur générée" (voir
 * CLAUDE.md), adaptée ici à une valeur qui ne peut structurellement pas être un entier/une
 * fraction simple.
 */
export function construireC(): ExerciceEtudeC {
  const base = tirerParmi(BASE_VALEURS);
  const m = tirerParmi(M_VALEURS);
  const n = tirerParmi(N_VALEURS);
  const p = tirerParmi(P_VALEURS);
  const c = m * Math.log(base) * Math.pow(base, p);
  const positionMinimum = (p - n) / m;

  const reel: CandidatEtudeC = { type: "reel", base, m, n, c, decalageMin: 0 };
  const sansAsymptote: CandidatEtudeC = { type: "sansAsymptote", base, m, n, c, decalageMin: 0 };
  const minimumMalPlace: CandidatEtudeC = { type: "minimumMalPlace", base, m, n, c, decalageMin: tirerParmi(DECALAGE_MIN_VALEURS) };
  const inflexionInventee: CandidatEtudeC = { type: "inflexionInventee", base, m, n, c, decalageMin: 0 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, sansAsymptote, minimumMalPlace, inflexionInventee]);

  return {
    famille: "C",
    base,
    m,
    n,
    p,
    c,
    domaine: ensembleReel(),
    limitePlusInfini: { type: "plus_infini" },
    limiteMoinsInfini: { type: "plus_infini" },
    asymptotePlusInfini: { type: "aucune" },
    asymptoteMoinsInfini: { type: "oblique", a: -c, b: 0 },
    croissance: { type: "minimum", position: positionMinimum },
    concavite: { type: "convexe_partout", position: null },
    candidats,
    indexCorrect,
  };
}

export { BASE_VALEURS as C_BASE_VALEURS, M_VALEURS as C_M_VALEURS, N_VALEURS as C_N_VALEURS, P_VALEURS as C_P_VALEURS };
