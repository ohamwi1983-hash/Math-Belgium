import type { DemandeEcran3FamilleC } from "../../core6e/independanceBayes.types";
import type { ExerciceFamilleEMixte } from "../../core6e/probabilitesProblemes.types";
import { construireFamilleC as construireBayesNumerique, genererFamilleC as genererBayesNumerique } from "../independanceBayes/familleC";

/**
 * Couche A (6e) — génération famille E (« Bayes en problème ») pour `6gen33`. Réutilise le tirage
 * de `6gen32` famille C (paramètres réalistes d'un test : sensibilité élevée, faux positifs rares),
 * puis mélange l'ordre de présentation des 3 données : l'élève doit d'abord reconnaître P(c₁),
 * P(E|c₁) et P(E|c₂). Le sous-type « paramétrique » (inéquation en x) a été retiré (audit 6e ch. 6,
 * décision F : hors du cours).
 */

function permutation3(): [number, number, number] {
  const indices = [0, 1, 2];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices as [number, number, number];
}

export function construireFamilleEMixte(): ExerciceFamilleEMixte {
  return { famille: "E", sousType: "mixte", base: genererBayesNumerique(), ordreAffichage: permutation3() };
}

export function genererFamilleEMixte(): ExerciceFamilleEMixte {
  return construireFamilleEMixte();
}

export function construireFamilleEMixteAvecDemande(demandeEcran3: DemandeEcran3FamilleC): ExerciceFamilleEMixte {
  return { famille: "E", sousType: "mixte", base: construireBayesNumerique(demandeEcran3), ordreAffichage: permutation3() };
}
