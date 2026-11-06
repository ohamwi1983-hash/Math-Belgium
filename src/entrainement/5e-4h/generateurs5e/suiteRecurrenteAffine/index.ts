import type { ExerciceSuiteRecurrenteAffine, RegimeSuiteRecurrenteAffine } from "../../core5e/suiteRecurrenteAffine.types";
import type { FractionQ } from "../../core5e/suitesGeometriques.types";
import { additionnerFractionQ, diviserFractionQ, entierVersFractionQ, fractionQ, multiplierFractionQ, soustraireFractionQ } from "../suitesGeometriques/fraction";
import { CONTEXTES_SUITE_RECURRENTE_AFFINE, type ContexteSuiteRecurrenteAffine } from "./contextes";

export { CATALOGUE_CONTEXTES_SUITE_RECURRENTE_AFFINE, CONTEXTES_SUITE_RECURRENTE_AFFINE } from "./contextes";
export type { ContexteSuiteRecurrenteAffine } from "./contextes";

function entierAleatoire(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** `a×u+b` en arithmétique fractionnaire exacte — `a` est TOUJOURS une fraction (dénominateur 100),
 * jamais reconverti en flottant avant l'affichage (voir `core5e/suiteRecurrenteAffine.types.ts`). */
function suivant(a: FractionQ, b: number, u: FractionQ): FractionQ {
  return additionnerFractionQ(multiplierFractionQ(a, u), entierVersFractionQ(b));
}

/** Marge imposée au-dessus du point fixe en régime divergent : u₁ ≥ MARGE_DIVERGENT × L*. */
const MARGE_DIVERGENT = 1.2;
const TENTATIVES_TIRAGE = 500;

/**
 * Tire `pct`/`b`/`u1` dans les bornes propres au contexte.
 *
 * Régime divergent (a = 1 + pct/100 > 1, b < 0) : le point fixe L* = b/(1−a) = |b|/(pct/100) est
 * POSITIF (et non « toujours négatif », comme l'affirmait l'ancien commentaire de `contextes.ts`).
 * Si u₁ < L*, u_{n+1} − u_n = (a−1)(u_n − L*) < 0 : la suite DÉCROÎT puis devient négative (bactéries,
 * abonnés… négatifs). On impose donc u₁ ≥ 1,2·L* : la suite est alors croissante et positive, et
 * s'éloigne visiblement de L* (divergence vers +∞). Tirage refait jusqu'à satisfaire la contrainte ;
 * en dernier recours, |b| est réduit au plus grand entier compatible (jamais une suite décroissante).
 */
function tirerParametres(contexte: ContexteSuiteRecurrenteAffine): { pct: number; b: number; u1: number } {
  if (contexte.regime === "convergent") {
    return { pct: entierAleatoire(contexte.pctMin, contexte.pctMax), b: entierAleatoire(contexte.bMin, contexte.bMax), u1: entierAleatoire(contexte.u1Min, contexte.u1Max) };
  }
  for (let t = 0; t < TENTATIVES_TIRAGE; t++) {
    const pct = entierAleatoire(contexte.pctMin, contexte.pctMax);
    const b = entierAleatoire(contexte.bMin, contexte.bMax);
    const u1 = entierAleatoire(contexte.u1Min, contexte.u1Max);
    if (u1 >= (MARGE_DIVERGENT * -b * 100) / pct) return { pct, b, u1 };
  }
  const pct = entierAleatoire(contexte.pctMin, contexte.pctMax);
  const u1 = entierAleatoire(contexte.u1Min, contexte.u1Max);
  const bLimite = -Math.floor((u1 * pct) / (100 * MARGE_DIVERGENT));
  return { pct, b: Math.min(-1, Math.max(contexte.bMin, bLimite)), u1 };
}

/** Construit un exercice à partir d'un contexte précis (trame + bornes) — `a`/`L`/`u2`/`u3`/`u4`
 * calculés en arithmétique fractionnaire exacte. Le régime (`contexte.regime`) découle directement du
 * contexte, jamais retiré. */
function construireDepuisContexte(contexte: ContexteSuiteRecurrenteAffine): ExerciceSuiteRecurrenteAffine {
  const { regime } = contexte;
  const { pct, b, u1 } = tirerParametres(contexte);
  const pctSurCent = fractionQ(pct, 100);
  const a: FractionQ = regime === "convergent" ? soustraireFractionQ(entierVersFractionQ(1), pctSurCent) : additionnerFractionQ(entierVersFractionQ(1), pctSurCent);
  // L=b/(1-a) — pour le régime convergent, 1-a=pct/100 par construction : division directe, jamais
  // une re-soustraction flottante depuis `a`.
  const L: FractionQ | null = regime === "convergent" ? diviserFractionQ(entierVersFractionQ(b), pctSurCent) : null;

  const u1F = entierVersFractionQ(u1);
  const u2 = suivant(a, b, u1F);
  const u3 = suivant(a, b, u2);
  const u4 = suivant(a, b, u3);

  return {
    a,
    b,
    u1,
    regime,
    L,
    u2,
    u3,
    u4,
    phraseEnonce: contexte.phrase(u1, pct, b),
    variableGrandeur: contexte.variableGrandeur,
  };
}

/** Force le régime (convergent/divergent) — tire un contexte au hasard parmi ceux de ce régime,
 * puis délègue à `construireDepuisContexte`. Voir le panneau dev-only (`SelecteurVarianteDev`). */
export function construireAvecRegime(regime: RegimeSuiteRecurrenteAffine): ExerciceSuiteRecurrenteAffine {
  const contextesDuRegime = CONTEXTES_SUITE_RECURRENTE_AFFINE.filter((c) => c.regime === regime);
  const contexte = contextesDuRegime[entierAleatoire(0, contextesDuRegime.length - 1)];
  return construireDepuisContexte(contexte);
}

/** Force un contexte précis parmi les 60 (panneau dev) — le régime en découle directement. */
export function construireAvecContexteId(id: string): ExerciceSuiteRecurrenteAffine {
  const contexte = CONTEXTES_SUITE_RECURRENTE_AFFINE.find((c) => c.id === id);
  if (!contexte) throw new Error(`aucun contexte trouvé pour l'id "${id}"`);
  return construireDepuisContexte(contexte);
}

/** Génère une instance — 80% régime convergent (|a|<1, |a|=1-perte%), 20% divergent (|a|≥1,
 * |a|=1+croissance%) — le cas rare explicitement demandé par la spec ("piège riche"). */
export function genererExerciceSuiteRecurrenteAffine(): ExerciceSuiteRecurrenteAffine {
  const regime: RegimeSuiteRecurrenteAffine = Math.random() < 0.8 ? "convergent" : "divergent";
  return construireAvecRegime(regime);
}
