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

/** Construit un exercice à partir d'un contexte précis (trame + bornes) — tire `pct`/`b`/`u1` dans
 * les bornes propres au contexte, `a`/`L`/`u2`/`u3`/`u4` calculés en arithmétique fractionnaire
 * exacte. Le régime (`contexte.regime`) découle directement du contexte, jamais retiré. */
function construireDepuisContexte(contexte: ContexteSuiteRecurrenteAffine): ExerciceSuiteRecurrenteAffine {
  const { regime } = contexte;
  const b = entierAleatoire(contexte.bMin, contexte.bMax);
  const u1 = entierAleatoire(contexte.u1Min, contexte.u1Max);
  const pct = entierAleatoire(contexte.pctMin, contexte.pctMax);
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
