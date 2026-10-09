import type { CandidatEtudeLogB, ExerciceEtudeLogB } from "../../../core6e/etudeFonctionLogarithme.types";
import type { CibleAsymptote, CibleCroissance } from "../../../core6e/etudeFonctionExponentielle.types";
import type { CibleLimite } from "../../../core6e/limitesExponentielles.types";
import { ensembleUnMorceau, versLeHautDepuis } from "../../ensembleReel";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";

const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const DECALAGE_EXPOSANT_VALEURS = [-2, -1, 1, 2] as const;

/** Position INVARIANTE de l'extremum, quel que soit k≠0 (voir preuve ci-dessous). */
export const POSITION_EXTREMUM_B = Math.E;

/**
 * `T(k,x) = k²(1-ln x)² + kx(2ln x - 3)` — proportionnel au signe de f''(x) (voir preuve complète
 * ci-dessous). Multiplié par x⁴>0 pour éliminer le dénominateur, ne change pas le signe.
 */
function T(k: number, x: number): number {
  const L = Math.log(x);
  return k * k * (1 - L) * (1 - L) + k * x * (2 * L - 3);
}

/**
 * Trouve TOUS les points d'inflexion de `f(x)=x^(k/x)` (x>0) par balayage numérique + bissection —
 * aucune forme close n'existe pour cette famille (voir preuve ci-dessous), contrairement aux 3
 * autres familles de ce générateur. Balayage fin sur `]0,60]` (au-delà, `T` ne change plus de signe
 * pour les valeurs de k utilisées ici — vérifié empiriquement) ; bissection à 80 itérations pour
 * chaque changement de signe détecté (précision très largement sous la tolérance de vérification,
 * `TOLERANCE=0.01` dans `moteur6e/verificationEtudeFonctionLogarithme.ts`).
 */
export function trouverPointsInflexionB(k: number): number[] {
  const racines: number[] = [];
  const N = 4000;
  const xMax = 60;
  let prevX = 0.001;
  let prevV = T(k, prevX);
  for (let i = 1; i <= N; i++) {
    const x = 0.001 + (i * xMax) / N;
    const v = T(k, x);
    if (prevV !== 0 && Math.sign(prevV) !== Math.sign(v)) {
      let lo = prevX;
      let hi = x;
      let fLo = prevV;
      for (let it = 0; it < 80; it++) {
        const mid = (lo + hi) / 2;
        const fMid = T(k, mid);
        if (Math.sign(fMid) === Math.sign(fLo)) {
          lo = mid;
          fLo = fMid;
        } else {
          hi = mid;
        }
      }
      racines.push((lo + hi) / 2);
    }
    prevX = x;
    prevV = v;
  }
  return racines;
}

/**
 * Famille B — `f(x) = x^(k/x)`, x>0, k∈{-3,-2,-1,1,2,3}. Extremum toujours en x=e (maximum si k>0,
 * minimum si k<0) ; asymptote horizontale y=1 en +∞ TOUJOURS présente (contrairement à la famille A)
 * ; limite en 0⁺ = 0 si k>0, +∞ si k<0.
 *
 * **Dérivation logarithmique implicite** (u(x)=x, v(x)=k/x) : f'/f = v'·ln(u) + v·u'/u =
 * (-k/x²)·ln(x) + (k/x)·(1/x) = k(1-ln x)/x². Nul en ln x=1, soit x=e — INDÉPENDANT de k, d'où
 * l'invariance de la position de l'extremum.
 *
 * **Concavité — DEUX points d'inflexion si k>0, UN seul si k<0 (résultat NON trivial, prouvé puis
 * vérifié numériquement)** : notons u=f'/f=k(1-L)/x² (L=ln x), u'=k(2L-3)/x³. f''=f·(u²+u'), signe
 * de f'' = signe de T(x)=k²(1-L)²+kx(2L-3) (même signe que u²+u' après multiplication par x⁴>0).
 * Aux bornes : T(0⁺)=+∞ (le terme k²(1-L)² domine, L→-∞) ; T(e)=-ke (signe opposé à k, cohérent
 * avec un maximum concave pour k>0 ou un minimum convexe pour k<0) ; T(+∞)→signe(k)·∞ (le terme
 * kx(2L-3) domine, croissance en x·ln x bat (ln x)²). Pour k>0 : signes +,-,+ ⟹ AU MOINS 2 racines
 * (une de chaque côté de e). Pour k<0 : signes +,+,- ⟹ AU MOINS 1 racine (entre e et +∞). Compte
 * EXACT confirmé par balayage numérique fin (`trouverPointsInflexionB`, testé pour les 6 valeurs de
 * k du pool) : exactement 2 pour k>0, exactement 1 pour k<0 — aucune forme close, positions
 * irrationnelles en général, stockées telles quelles (comparées par tolérance numérique côté
 * vérification, jamais par égalité exacte).
 */
export function construireB(): ExerciceEtudeLogB {
  const k = tirerParmi(K_VALEURS);

  const limiteZeroPlus: CibleLimite = k > 0 ? { type: "zero" } : { type: "plus_infini" };
  const limites: [CibleLimite, CibleLimite] = [limiteZeroPlus, { type: "valeur", valeur: 1 }];
  const asymptotes: [CibleAsymptote] = [{ type: "horizontale", valeur: 1 }];
  const croissance: CibleCroissance = { type: k > 0 ? "maximum" : "minimum", position: POSITION_EXTREMUM_B };
  const positionsInflexion = trouverPointsInflexionB(k).sort((x, y) => x - y);

  const reel: CandidatEtudeLogB = { type: "reel", k, decalageExposant: 0 };
  const extremumMalPlace: CandidatEtudeLogB = { type: "extremumMalPlace", k, decalageExposant: tirerParmi(DECALAGE_EXPOSANT_VALEURS) };
  const sansAsymptoteHorizontale: CandidatEtudeLogB = { type: "sansAsymptoteHorizontale", k, decalageExposant: 0 };
  const extremumTypeInverse: CandidatEtudeLogB = { type: "extremumTypeInverse", k, decalageExposant: 0 };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, extremumMalPlace, sansAsymptoteHorizontale, extremumTypeInverse]);

  return {
    famille: "B",
    k,
    domaine: ensembleUnMorceau(versLeHautDepuis(0, false)),
    limites,
    asymptotes,
    croissance,
    concavite: { type: "inflexions", positions: positionsInflexion },
    candidats,
    indexCorrect,
  };
}

export { K_VALEURS as B_K_VALEURS, DECALAGE_EXPOSANT_VALEURS as B_DECALAGE_EXPOSANT_VALEURS };
