import type { CandidatEtudeA, ExerciceEtudeA } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleAsymptote } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleReel } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const M_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const N_VALEURS = [-4, -3, -2, -1, 0, 1, 2, 3, 4] as const;
/** Pool de décalages, jamais `0` (sinon le distracteur "mauvaisNiveau" coïnciderait avec le réel). */
const DECALAGE_VALEURS = [-3, -2, -1, 1, 2, 3] as const;

/**
 * Famille A — `f(x) = e^(mx+n)`, m≠0. Cas le plus simple des 4 : domaine ℝ, TOUJOURS monotone
 * (f'(x)=m·e^(mx+n) ne s'annule jamais) et TOUJOURS convexe (f''(x)=m²·e^(mx+n)>0 toujours) —
 * jamais de point d'inflexion.
 *
 * Asymptote — mx+n→−∞ SSI m<0 (x→+∞) ou m>0 (x→−∞), c'est-à-dire exactement un des deux côtés :
 * ce côté a f→0 (asymptote y=0) ; l'autre côté a mx+n→+∞ donc f→+∞ (aucune asymptote).
 */
export function construireA(): ExerciceEtudeA {
  const m = tirerParmi(M_VALEURS);
  const n = tirerParmi(N_VALEURS);

  // Asymptote côté +∞ SSI m<0 (mx+n→−∞ là-bas) ; sinon asymptote côté −∞.
  const asymptoteAPlusInfini = m < 0;
  const limitePlusInfini: CibleLimite = asymptoteAPlusInfini ? { type: "zero" } : { type: "plus_infini" };
  const limiteMoinsInfini: CibleLimite = asymptoteAPlusInfini ? { type: "plus_infini" } : { type: "zero" };
  const asymptotePlusInfini: CibleAsymptote = asymptoteAPlusInfini ? { type: "horizontale", valeur: 0 } : { type: "aucune" };
  const asymptoteMoinsInfini: CibleAsymptote = asymptoteAPlusInfini ? { type: "aucune" } : { type: "horizontale", valeur: 0 };

  const reel: CandidatEtudeA = { type: "reel", m, n, decalage: 0 };
  const sensInverse: CandidatEtudeA = { type: "sensInverse", m, n, decalage: 0 };
  const mauvaisNiveau: CandidatEtudeA = { type: "mauvaisNiveau", m, n, decalage: tirerParmi(DECALAGE_VALEURS) };
  const inflexionInventee: CandidatEtudeA = { type: "inflexionInventee", m, n, decalage: 0 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, sensInverse, mauvaisNiveau, inflexionInventee]);

  return {
    famille: "A",
    m,
    n,
    domaine: ensembleReel(),
    limitePlusInfini,
    limiteMoinsInfini,
    asymptotePlusInfini,
    asymptoteMoinsInfini,
    croissance: { type: m > 0 ? "croissante_partout" : "decroissante_partout", position: null },
    concavite: { type: "convexe_partout", position: null },
    candidats,
    indexCorrect,
  };
}

export { M_VALEURS as A_M_VALEURS, N_VALEURS as A_N_VALEURS, DECALAGE_VALEURS as A_DECALAGE_VALEURS };
