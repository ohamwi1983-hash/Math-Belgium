import type { ExercicePL, VariantePL } from "../../core6e/poissonInverse";
import { auMoins, lambdaFinal, probaFinale, seuil } from "../../core6e/poissonInverse";
import { entier, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen121` « Poisson : λ inconnu, valeur la plus probable, seuil d'alerte ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). λ de base au demi (ou au dixième pour « mode »),
 * λ final ≤ 10 (calculable à la Casio Graph Math+ comme à la main) ; « mode » : λ entier une fois sur
 * trois (deux valeurs les plus probables), tiré AVANT les nombres ; « seuil » : P(X ≥ k) à plus de
 * 0,003 du seuil α des deux côtés (aucune ambiguïté d'arrondi). Probabilité finale entre 0,005 et 0,95.
 */

export const CATALOGUE_VARIANTES: { id: VariantePL; label: string }[] = [
  { id: "lambdaZero", label: "λ à partir de P(X = 0), puis ajusté" },
  { id: "egalite", label: "λ à partir de P(X = k + 1) = c·P(X = k), E et σ" },
  { id: "mode", label: "Valeur la plus probable" },
  { id: "seuil", label: "Seuil d'alerte" },
];

export function construire(v: VariantePL): ExercicePL {
  const entierMode = v === "mode" && Math.random() < 1 / 3;
  for (;;) {
    const ctx = entier(0, 2);
    let d: Record<string, number>;
    switch (v) {
      case "lambdaZero":
        d = { l10: 5 * entier(1, 8), m: parmi([2, 3, 4, 5]), ...(Math.random() < 0.3 ? { q: 1, j: 0 } : { q: 0, j: entier(1, 6) }) };
        break;
      case "egalite":
        d = { k: entier(1, 4), c2: Math.random() < 0.5 ? 2 : parmi([1, 3, 4, 6]), q: 0, j: entier(0, 5) };
        break;
      case "mode":
        d = { l10: entierMode ? 10 * entier(2, 8) : 10 * entier(1, 8) + entier(1, 9) };
        break;
      case "seuil":
        d = { l10: parmi([5, 10, 15, 20, 30]), m: parmi([1, 2, 3, 6]), a100: parmi([5, 1]) };
        break;
    }
    const e: ExercicePL = { variante: v, ctx, d };
    const l = lambdaFinal(e);
    if (l < 0.5 || l > 10) continue;
    if (v === "egalite" && d.j === d.k) continue;
    if (v === "seuil") {
      const a = d.a100! / 100;
      const k = seuil(l, a);
      if (Math.abs(auMoins(l, k) - a) < 0.003 || Math.abs(auMoins(l, k - 1) - a) < 0.003) continue;
    }
    const p = probaFinale(e);
    if (p < 0.005 || p > 0.95) continue;
    return e;
  }
}

export function construireAvecVariante(id: string): ExercicePL {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExercicePL(): ExercicePL {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
