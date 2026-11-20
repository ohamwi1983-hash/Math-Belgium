import type { CandidatE, ExerciceGraphiqueE } from "../../../core6e/graphiquesCyclometriques.types";
import { q, qMul, qNeg, qVal } from "../../../ui6e/corrigeIntegrales1";
import type { Q } from "../../../ui6e/corrigeIntegrales1";
import { melangerAvecIndexCorrect, tirerParmi } from "../aleatoire";
import { calculerProprietesE } from "../proprietes";

const ARCFONCTIONS = ["arcsin", "arccos"] as const;
const K_VALEURS = [-3, -2, -1, 1, 2, 3] as const;
const DECALAGES = [-0.6, -0.4, 0.4, 0.6] as const;

/**
 * Seuils w₀ REMARQUABLES (multiples de π, en fraction de π) par arcfonction et signe de k — décision
 * de l'utilisateur (audit du 6e ch. 1, question 2, E11) : « constantes exactes en E ». Le domaine
 * ([sin w₀ ; 1], [−1 ; sin w₀], [−1 ; cos w₀] ou [cos w₀ ; 1]) a une borne remarquable (½, √2/2,
 * √3/2, 0…) et une longueur d'au moins 0,29 (les seuils qui la réduisaient à 0,13 sont écartés) ;
 * w₀ = 0 (c = 0) est écarté aussi.
 */
const SEUILS: Record<"arcsin" | "arccos", Record<"pos" | "neg", Q[]>> = {
  arcsin: {
    pos: [q(-1, 3), q(-1, 4), q(-1, 6), q(1, 6), q(1, 4)],
    neg: [q(-1, 4), q(-1, 6), q(1, 6), q(1, 4), q(1, 3)],
  },
  arccos: {
    pos: [q(1, 6), q(1, 4), q(1, 3), q(1, 2), q(2, 3), q(3, 4)],
    neg: [q(1, 4), q(1, 3), q(1, 2), q(2, 3), q(3, 4), q(5, 6)],
  },
};

/**
 * Famille E — `f(x) = √(k·arcfonction(x) + c)`, arcfonction ∈ {arcsin, arccos}. Le seuil w₀ (dans
 * l'image de l'arcfonction, angle remarquable) est tiré EN PREMIER, puis c = −k·w₀ (multiple exact
 * de π) : l'intersection de [−1 ; 1] et de « k·arcfonction(x) + c ≥ 0 » n'est jamais vide.
 */
export function construireE(): ExerciceGraphiqueE {
  const arcfonction = tirerParmi(ARCFONCTIONS);
  const k = tirerParmi(K_VALEURS);
  const w0q = tirerParmi(SEUILS[arcfonction][k > 0 ? "pos" : "neg"]);
  const cPiQ = qMul(q(-k), w0q);
  const w0 = qVal(w0q) * Math.PI;
  const c = qVal(cPiQ) * Math.PI;
  const reel: CandidatE = { k, c, arcfonction, ignorerContrainteRacine: false, decalageAffichage: 0, cPi: { n: cPiQ.n, d: cPiQ.d } };

  // Borne remarquable (½, √2/2, 0…) nettoyée de l'arrondi flottant (cos(π/2) = 6·10⁻¹⁷).
  const x0Brut = arcfonction === "arcsin" ? Math.sin(w0) : Math.cos(w0);
  const x0 = Math.abs(x0Brut) < 1e-12 ? 0 : Math.round(x0Brut * 1e12) / 1e12;
  let domaineInf: number;
  let domaineSup: number;
  if (arcfonction === "arcsin") {
    if (k > 0) {
      domaineInf = x0;
      domaineSup = 1;
    } else {
      domaineInf = -1;
      domaineSup = x0;
    }
  } else {
    if (k > 0) {
      domaineInf = -1;
      domaineSup = x0;
    } else {
      domaineInf = x0;
      domaineSup = 1;
    }
  }

  const uneSeuleContrainte: CandidatE = { ...reel, ignorerContrainteRacine: true };
  const cInverse = qNeg(cPiQ);
  const sensInverse: CandidatE = { ...reel, k: -k, c: qVal(cInverse) * Math.PI, cPi: { n: cInverse.n, d: cInverse.d } };
  const mauvaiseValeurExtremite: CandidatE = { ...reel, decalageAffichage: tirerParmi(DECALAGES) };

  const { candidats, indexCorrect } = melangerAvecIndexCorrect([reel, uneSeuleContrainte, sensInverse, mauvaiseValeurExtremite]);
  return { famille: "E", reel, proprietes: calculerProprietesE(reel, domaineInf, domaineSup), domaineInf, domaineSup, candidats, indexCorrect };
}

export { K_VALEURS as E_K_VALEURS };
