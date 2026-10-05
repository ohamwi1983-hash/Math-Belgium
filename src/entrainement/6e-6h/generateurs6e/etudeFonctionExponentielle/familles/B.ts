import type { CandidatEtudeB, CibleAsymptote, ExerciceEtudeB } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensemblePrivePoints } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const P_VALEURS = [-3, -2, -1, 0, 1, 2, 3] as const;
/** Pool de décalages du niveau horizontal, jamais `0` (sinon "mauvaisNiveau" coïnciderait avec le
 * réel). */
const DECALAGE_VALEURS = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Famille B — `f(x) = e^(k/(x−p))`, k≠0. La famille la plus riche des 4 : domaine ℝ\{p} ;
 * asymptote verticale ASYMÉTRIQUE en x=p (un seul côté explose vers +∞, l'autre tend vers la
 * valeur FINIE 0 — piège central de cette famille) ; asymptote horizontale y=1 des deux côtés
 * (±∞) ; monotone sur chaque branche séparément, MÊME sens partout (f'(x)=e^(k/(x-p))·(-k/(x-p)²),
 * dont le signe est celui de −k, constant car (x-p)² est toujours strictement positif — jamais de
 * changement de signe entre les deux branches) ; TOUJOURS un point d'inflexion, en x=p−k/2 (preuve
 * ci-dessous).
 *
 * **Preuve — côté qui explose vers +∞** : quand x→p⁺, x−p→0⁺, donc k/(x−p)→+∞ SSI k>0 (sinon
 * →−∞, donnant f→0). Quand x→p⁻, x−p→0⁻, donc k/(x−p)→+∞ SSI k<0. Donc `coteAsymptoteVerticale`
 * = "plus" SSI k>0.
 *
 * **Preuve — point d'inflexion en x=p−k/2** : posons u=k/(x−p), f=e^u. f'=e^u·u', u'=−k/(x−p)².
 * f''=e^u·(u'² + u'') où u''=2k/(x−p)³. En substituant u'=−k/(x−p)² : u'² = k²/(x−p)⁴, donc
 * f''=e^u/(x−p)⁴·(k² + 2k(x−p)) = e^u/(x−p)⁴·k·(k+2(x−p)). e^u/(x−p)⁴>0 toujours, donc le signe de
 * f'' est celui de k·(k+2(x−p)), qui s'annule (changement de signe, k≠0 donc un seul zéro simple)
 * en k+2(x−p)=0 ⟺ x=p−k/2. Cross-vérifié empiriquement dans `B.test.ts` par dérivée seconde
 * numérique (différences finies), indépendamment de cette dérivation analytique.
 */
export function construireB(): ExerciceEtudeB {
  const k = tirerParmi(K_VALEURS);
  const p = tirerParmi(P_VALEURS);

  const coteAsymptoteVerticale: "plus" | "moins" = k > 0 ? "plus" : "moins";
  const limitePointPlus: CibleLimite = coteAsymptoteVerticale === "plus" ? { type: "plus_infini" } : { type: "zero" };
  const limitePointMoins: CibleLimite = coteAsymptoteVerticale === "moins" ? { type: "plus_infini" } : { type: "zero" };

  const asymptoteVerticale: CibleAsymptote = { type: "verticale", p };
  const asymptoteHorizontale: CibleAsymptote = { type: "horizontale", valeur: 1 };

  const reel: CandidatEtudeB = { type: "reel", k, p, decalage: 0 };
  const symetrique: CandidatEtudeB = { type: "symetrique", k, p, decalage: 0 };
  const sansInflexion: CandidatEtudeB = { type: "sansInflexion", k, p, decalage: 0 };
  const mauvaisNiveau: CandidatEtudeB = { type: "mauvaisNiveau", k, p, decalage: tirerParmi(DECALAGE_VALEURS) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, symetrique, sansInflexion, mauvaisNiveau]);

  return {
    famille: "B",
    k,
    p,
    domaine: ensemblePrivePoints([p]),
    limitePointPlus,
    limitePointMoins,
    limitePlusInfini: { type: "valeur", valeur: 1 },
    limiteMoinsInfini: { type: "valeur", valeur: 1 },
    coteAsymptoteVerticale,
    asymptoteVerticale,
    asymptoteHorizontale,
    croissance: { type: -k > 0 ? "croissante_partout" : "decroissante_partout", position: null },
    concavite: { type: "inflexion", position: p - k / 2 },
    candidats,
    indexCorrect,
  };
}

export { K_VALEURS as B_K_VALEURS, P_VALEURS as B_P_VALEURS, DECALAGE_VALEURS as B_DECALAGE_VALEURS };
