import type { CandidatEtudeLogC, ExerciceEtudeLogC } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleAsymptote } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensemblePrivePoints } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [2, 3, 4, 5] as const;
/** Pool de décalages, jamais `0` (sinon les distracteurs coïncideraient avec le réel). */
const DECALAGE_VALEURS = [-2, -1, 1, 2] as const;

/**
 * Famille C — `f(x) = ln|k²-x²|`, k∈{2,3,4,5}. Domaine ℝ\{-k,k} — 3 branches, ÉLARGI par la valeur
 * absolue par rapport à `ln(k²-x²)` seul (piège central écran 1 : les deux régions |x|>k sont AUSSI
 * valides). Paire. 2 asymptotes verticales symétriques x=±k. Maximum local en x=0 (valeur 2ln k).
 *
 * **Domaine** : `k²-x²` s'annule en x=±k (exclus) ; `|k²-x²|>0` PARTOUT ailleurs (que k²-x² soit
 * positif OU négatif), donc `ln|k²-x²|` est défini sur ℝ\{-k,k} tout entier — pas seulement
 * ]-k;k[ (où k²-x²>0 SANS valeur absolue).
 *
 * **Croissance — f'(x)=2x/(x²-k²), tableau de signe sur 4 intervalles, INVARIANT en k** :
 * - x<-k : 2x<0, x²-k²>0 (|x|>k) ⟹ f'<0, décroissante.
 * - -k<x<0 : 2x<0, x²-k²<0 (|x|<k) ⟹ f'>0, croissante.
 * - 0<x<k : 2x>0, x²-k²<0 ⟹ f'<0, décroissante.
 * - x>k : 2x>0, x²-k²>0 ⟹ f'>0, croissante.
 * Motif [décroissante, croissante, décroissante, croissante] TOUJOURS le même quel que soit k>0 —
 * maximum local unique en x=0 (croissante puis décroissante autour de 0), cohérent avec la spec.
 *
 * **Concavité — TOUJOURS concave partout, jamais d'inflexion (résultat propre à cette famille,
 * contrairement à ce qu'on pourrait attendre d'une fonction à 3 branches)** : sur ]-k;k[, avec
 * g(x)=k²-x², f=ln(g), f'=-2x/g, f''=[g''·g-(g')²]/g² = [-2g-4x²]/g² = -2(k²+x²)/g² < 0 TOUJOURS.
 * Sur |x|>k, avec h(x)=x²-k², f=ln(h), f'=2x/h, f''=[2h-4x²]/h² = -2(x²+k²)/h² < 0 TOUJOURS aussi.
 * Les 2 formules coïncident en signe (toujours strictement négatif) : concave sur les 3 branches,
 * sans exception — jamais de changement de signe, donc jamais de point d'inflexion.
 */
export function construireC(): ExerciceEtudeLogC {
  const k = tirerParmi(K_VALEURS);

  const limites: [CibleLimite, CibleLimite, CibleLimite, CibleLimite, CibleLimite, CibleLimite] = [
    { type: "plus_infini" }, // x→-∞
    { type: "moins_infini" }, // x→(-k)⁻
    { type: "moins_infini" }, // x→(-k)⁺
    { type: "moins_infini" }, // x→k⁻
    { type: "moins_infini" }, // x→k⁺
    { type: "plus_infini" }, // x→+∞
  ];
  const asymptotes: [CibleAsymptote, CibleAsymptote] = [
    { type: "verticale", p: -k },
    { type: "verticale", p: k },
  ];

  const reel: CandidatEtudeLogC = { type: "reel", k, decalage: 0 };
  const domaineRestreint: CandidatEtudeLogC = { type: "domaineRestreint", k, decalage: 0 };
  const asymptotesMalPlacees: CandidatEtudeLogC = { type: "asymptotesMalPlacees", k, decalage: tirerParmi(DECALAGE_VALEURS) };
  const asymetrieIncorrecte: CandidatEtudeLogC = { type: "asymetrieIncorrecte", k, decalage: tirerParmi(DECALAGE_VALEURS) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, domaineRestreint, asymptotesMalPlacees, asymetrieIncorrecte]);

  return {
    famille: "C",
    k,
    domaine: ensemblePrivePoints([-k, k]),
    limites,
    asymptotes,
    croissance: { signes: ["decroissante", "croissante", "decroissante", "croissante"], positionMax: 0 },
    concavite: { type: "concave_partout", positions: [] },
    candidats,
    indexCorrect,
  };
}

export { K_VALEURS as C_K_VALEURS, DECALAGE_VALEURS as C_DECALAGE_VALEURS };
