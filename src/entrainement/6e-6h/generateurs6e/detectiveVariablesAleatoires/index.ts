import type { ExerciceDVA, VarianteDVA } from "../../core6e/detectiveVariablesAleatoires";
import { copie, LEURRES } from "../../moteur6e/modeleDetectiveVariablesAleatoires";
import { arrondiZ } from "../../core6e/tablePhi";
import { entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen122` « Détective d'erreurs : variables aléatoires ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). La variante fixe le TYPE D'ERREUR (groupe à verdict) ; les
 * nombres sont choisis pour que l'erreur se VOIE (résultat de la copie différent du résultat juste d'au
 * moins un centième ou un dix-millième selon la précision). L'ordre des descriptions est tiré ensuite,
 * et la position de la ligne fausse (`av`) EN DERNIER : un code imprimé rouvre les mêmes données.
 */

export const CATALOGUE_VARIANTES: { id: VarianteDVA; label: string }[] = [
  { id: "moyenne", label: "Espérance : moyenne non pondérée" },
  { id: "ecartType", label: "Écart-type : σ = V²" },
  { id: "symetriePhi", label: "Loi normale : Φ(−z) = Φ(z)" },
  { id: "regleUnCote", label: "Règle empirique : « / 2 » oublié" },
  { id: "lambda", label: "Poisson : λ non ajusté" },
  { id: "complement", label: "« Au moins k » : mauvais contraire" },
  { id: "uniforme", label: "Loi uniforme : (b − a)/12" },
  { id: "coefficient", label: "Binomiale : Cₙᵏ oublié" },
  { id: "continuite", label: "Approximation normale : correction de continuité oubliée" },
];

const PAIRES_SIGMA: [number, number][] = [
  [100, 50],
  [144, 50],
  [196, 50],
  [256, 50],
  [324, 50],
  [400, 50],
  [150, 40],
  [150, 60],
];

function donnees(v: VarianteDVA): Record<string, number> {
  for (;;) {
    switch (v) {
      case "moyenne": {
        const xs = melanger([-2, -1, 0, 1, 2, 3, 4, 5, 6, 8, 10]).slice(0, 3).sort((a, b) => a - b);
        const p1 = entier(1, 7);
        const p2 = entier(1, 8 - p1);
        const p3 = 10 - p1 - p2;
        const E = (xs[0]! * p1 + xs[1]! * p2 + xs[2]! * p3) / 10;
        const m = (xs[0]! + xs[1]! + xs[2]!) / 3;
        if (Math.abs(E - m) < 0.15) continue;
        return { x1: xs[0]!, x2: xs[1]!, x3: xs[2]!, p1, p2, p3 };
      }
      case "ecartType": {
        const xs = melanger([0, 1, 2, 3, 4, 5, 6]).slice(0, 3).sort((a, b) => a - b);
        const p1 = entier(1, 7);
        const p2 = entier(1, 8 - p1);
        const p3 = 10 - p1 - p2;
        const ps = [p1 / 10, p2 / 10, p3 / 10];
        const E1 = xs.reduce((s, x, i) => s + x * ps[i]!, 0);
        const E2 = xs.reduce((s, x, i) => s + x * x * ps[i]!, 0);
        const V = E2 - E1 * E1;
        if (V < 0.3 || Math.abs(V - 1) < 0.2 || V > 6) continue;
        return { x1: xs[0]!, x2: xs[1]!, x3: xs[2]!, p1, p2, p3 };
      }
      case "symetriePhi": {
        const mu = entier(40, 80);
        const sigma = entier(4, 12);
        const zc = entier(30, 250);
        if ((zc * sigma) % 10 !== 0) continue;
        return { mu, sigma, zc };
      }
      case "regleUnCote": {
        const ctx = entier(0, 1);
        return ctx === 0 ? { ctx, mu: entier(160, 180), sigma: entier(5, 9), k: entier(1, 3) } : { ctx, mu: parmi([250, 500, 1000]), sigma: entier(4, 12), k: entier(1, 3) };
      }
      case "lambda": {
        const r = parmi([6, 8, 9, 10, 12]);
        const t = parmi([10, 15, 20, 30]);
        const lam = (r * t) / 60;
        if (lam < 1 || lam > 6 || Math.abs(lam * 4 - Math.round(lam * 4)) > 1e-9) continue;
        return { r, t, k: entier(0, 4) };
      }
      case "complement":
        return { l2: entier(2, 10), k: entier(2, 4) };
      case "uniforme":
        return { a: entier(2, 15), L: parmi([6, 12, 18, 24, 30]) };
      case "coefficient": {
        const ctx = entier(0, 2);
        const n = ctx === 1 ? entier(4, 6) : entier(4, 8);
        return { ctx, n, k: entier(1, n - 1) };
      }
      case "continuite": {
        const [n, pc] = parmi(PAIRES_SIGMA);
        const mu = (n * pc) / 100;
        const sigma = Math.sqrt((n * pc * (100 - pc)) / 10000);
        const k = Math.round(mu + (Math.random() * 3 - 1.5) * sigma);
        if (arrondiZ((k - mu) / sigma) === arrondiZ((k + 0.5 - mu) / sigma)) continue;
        if (Math.abs(k + 0.5 - mu) / sigma > 2.3) continue;
        return { n, pc, k };
      }
    }
  }
}

export function construire(variante: VarianteDVA): ExerciceDVA {
  for (;;) {
    const d = donnees(variante);
    const options = melanger([variante as string, ...LEURRES[variante]]);
    const e: ExerciceDVA = { variante, d: { ...d, av: 0 }, options };
    const c = copie(e);
    if (Math.abs(c.valeur - c.valeurCopie) < (c.precision === "dec4" ? 0.0005 : 0.01)) continue;
    return { variante, d: { ...d, av: entier(0, 3) }, options };
  }
}

export function construireAvecVariante(id: string): ExerciceDVA {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDVA(): ExerciceDVA {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
