import type { ExerciceBinomeC, ExerciceBinomeNewton } from "../core6e/binomeNewton.types";
import { diagnostiquerAttentes } from "./attentesCombinatoire";
import type { Attente } from "./attentesCombinatoire";
import { combinaisonBig, polynomeDepuisCoefficients, rationnel } from "./saisieCombinatoire";
import type { Rationnel } from "./saisieCombinatoire";
import type { DefinitionSession } from "./sessionCombinatoire";
import { phasesPourExercice } from "./typesBinomeNewton";
import type { PhaseBinomeNewton } from "./typesBinomeNewton";

/**
 * Vérification de `6gen45` — exacte partout (audit, G10 et G12) : le polynôme final est comparé
 * coefficient par coefficient et doit être DÉVELOPPÉ (« (2x − 3)⁴ » recopié est refusé sans tentative) ;
 * l'approximation est exacte, la valeur calculée doit avoir au moins 4 décimales (avant : « 0 » accepté
 * pour un terme de 10⁻¹⁰).
 */

export function approximationC(e: ExerciceBinomeC): Rationnel {
  return rationnel(100 + e.n * e.epsilonCentiemes, 100);
}
export function termeNegligeC(e: ExerciceBinomeC): Rationnel {
  return rationnel(combinaisonBig(e.n, 2) * BigInt(e.epsilonCentiemes * e.epsilonCentiemes), 10000);
}
export function valeurExacteC(e: ExerciceBinomeC): Rationnel {
  return rationnel(BigInt(100 + e.epsilonCentiemes) ** BigInt(e.n), 100n ** BigInt(e.n));
}

export function attentesBinomeNewton(e: ExerciceBinomeNewton, p: PhaseBinomeNewton): Attente[] {
  switch (e.famille) {
    case "A":
      if (p === "aEcran1") return e.termes.map((t) => ({ nature: "entier", cible: t.coefficientBinomial }));
      if (p === "aEcran2") return e.termes.map((t) => ({ nature: "entier", cible: t.coefficientFinal }));
      return [{ nature: "polynome", cible: polynomeDepuisCoefficients(e.termes.map((t) => ({ exposant: t.exposantX, coefficient: t.coefficientFinal }))) }];
    case "B":
      if (p === "bTrouverKEcran") return [{ nature: "entier", cible: e.k }];
      if (p === "bPoserEcran") return [e.coefficientBinomial, e.aPuissance, e.bPuissance].map((c) => ({ nature: "entier", cible: c }));
      return [{ nature: "entier", cible: e.coefficientFinal }];
    case "C":
      if (p === "cEcran1") return [{ nature: "exacte", cible: approximationC(e) }];
      if (p === "cEcran2") return [{ nature: "exacte", cible: termeNegligeC(e) }];
      return [{ nature: "arrondi4", cible: valeurExacteC(e) }];
    case "D":
      if (p === "dEcran1") return e.positions.map((k) => ({ nature: "entier", cible: Number(combinaisonBig(e.n + 1, k)) }));
      return [{ nature: "entier", cible: 2 ** (e.n + 1) }];
  }
}

export const DEFINITION_6GEN45: DefinitionSession<ExerciceBinomeNewton, PhaseBinomeNewton> = {
  phases: phasesPourExercice,
  estChoix: () => false,
  diagnostiquer: (e, p, valeurs) => diagnostiquerAttentes(attentesBinomeNewton(e, p), valeurs),
};
