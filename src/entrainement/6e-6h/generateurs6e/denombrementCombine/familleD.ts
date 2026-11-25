import { coefficientBinomial } from "../combinatoire";
import type { ExerciceDenombCombD } from "../../core6e/denombrementCombine.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille D de `6gen44` — deux personnes précises qui ne peuvent pas être ensemble (total moins
 * « les deux ») ou qui vont ensemble ou pas du tout (« les deux » plus « aucun des deux »). Verdict tiré
 * à parts égales (avant : exclusion 2 fois sur 3) ; n ≤ 25, k ≤ 6 : les termes restent calculables.
 */

function tirerNK(): { n: number; k: number } {
  const n = tirerEntier(12, 25);
  const k = tirerEntier(4, 6);
  return { n, k };
}

export function construireExclusionPaire(): ExerciceDenombCombD {
  const { n, k } = tirerNK();
  const contexte = `Dans une classe de ${n} élèves, dont Xavier et Yasmine, on choisit ${k} délégués. Xavier et Yasmine refusent de siéger ensemble.`;
  const terme1 = coefficientBinomial(n, k);
  const terme2 = coefficientBinomial(n - 2, k - 2);
  return { famille: "D", sousType: "exclusionPaire", typeContrainte: "exclusion", contexte, n, k, terme1, terme2, resultatFinal: terme1 - terme2 };
}

export function construireCoupleIndissociable(): ExerciceDenombCombD {
  const { n, k } = tirerNK();
  const contexte = tirerParmi([
    `Dans une classe de ${n} élèves, dont Xavier et Yasmine, on choisit ${k} délégués. Xavier et Yasmine veulent être choisis tous les deux ou pas du tout.`,
    `Un orchestre de ${n} musiciens, dont un couple de violonistes, envoie ${k} musiciens à un concert. Le couple part ensemble ou reste ensemble.`,
  ]);
  const terme1 = coefficientBinomial(n - 2, k - 2);
  const terme2 = coefficientBinomial(n - 2, k);
  return { famille: "D", sousType: "coupleIndissociable", typeContrainte: "indissociable", contexte, n, k, terme1, terme2, resultatFinal: terme1 + terme2 };
}

export function construireContrainteRiche(): ExerciceDenombCombD {
  const { n, k } = tirerNK();
  const nA = tirerEntier(5, n - 5);
  const contexte = `Un club compte ${nA} filles, dont Zoé et Yasmine, et ${n - nA} garçons. On forme une équipe de ${k} personnes, filles ou garçons ; Zoé et Yasmine ne veulent pas jouer dans la même équipe.`;
  const terme1 = coefficientBinomial(n, k);
  const terme2 = coefficientBinomial(n - 2, k - 2);
  return { famille: "D", sousType: "contrainteRiche", typeContrainte: "exclusion", contexte, n, k, terme1, terme2, resultatFinal: terme1 - terme2 };
}
