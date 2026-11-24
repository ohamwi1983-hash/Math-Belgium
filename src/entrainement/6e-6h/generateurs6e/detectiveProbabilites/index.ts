import type { ExerciceDetectiveProba, VarianteDetectiveProba } from "../../core6e/detectiveProbabilites";
import { LEURRES } from "../../moteur6e/modeleDetectiveProbabilites";

/**
 * Couche A — générateur de `6gen163` « Détective d'erreurs : probabilités ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). La variante fixe le TYPE D'ERREUR (groupe à verdict) ; les nombres sont
 * choisis pour que l'erreur se VOIE (résultat de la copie ≠ résultat juste, aucun cas où la règle
 * fausse donnerait par hasard la bonne valeur). L'ordre des descriptions est tiré ensuite, et la
 * position de la ligne fausse (`av` : 0 à 3 lignes justes avant elle) EN DERNIER : un code imprimé
 * rouvre les mêmes données et réponses.
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

function donnees(v: VarianteDetectiveProba): Record<string, number> {
  for (;;) {
    switch (v) {
      case "complementaire": {
        const ctx = Math.random() < 0.5 ? 1 : 0;
        return ctx === 1 ? { ctx, k: 0, n: parmi([2, 3, 4]) } : { ctx, k: parmi([2, 3, 4, 6, 7, 8]), n: parmi([2, 3]) };
      }
      case "reunion": {
        const N = parmi([20, 25, 30, 40, 50]);
        const a = entier(Math.ceil(N / 5), Math.floor(N / 2));
        const b = entier(Math.ceil(N / 5), Math.floor(N / 2));
        const c = entier(1, Math.min(a, b) - 1);
        if (a + b >= N) continue;
        return { N, a, b, c };
      }
      case "conditionnelleInversee": {
        const N = parmi([30, 40, 50, 60]);
        const a = entier(Math.ceil(N / 5), Math.floor(N / 2));
        const b = entier(Math.ceil(N / 5), Math.floor(N / 2));
        const c = entier(2, Math.min(a, b) - 1);
        // a ≠ b (sinon P(B|T) = P(T|B)) ; T et B non indépendants (c·N ≠ a·b).
        if (a === b || c * N === a * b || a + b - c > N) continue;
        return { N, a, b, c };
      }
      case "produitSansRemise":
        return { r: entier(2, 6), b: entier(2, 6) };
      case "arbreMalPondere": {
        const kA = parmi([3, 4, 6, 7]);
        const dA = parmi([2, 3, 4, 5, 6, 8, 10]);
        const dB = parmi([2, 3, 4, 5, 6, 8, 10, 12, 15]);
        if (dA === dB) continue;
        return { kA, dA, dB };
      }
      case "ordreOublie": {
        if (Math.random() < 0.5) {
          const a = entier(1, 6);
          const b = entier(1, 6);
          if (a === b) continue;
          return { ctx: 1, a: Math.min(a, b), b: Math.max(a, b) };
        }
        return { ctx: 0, r: entier(2, 6), b: entier(2, 6) };
      }
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveProba; label: string }[] = [
  { id: "complementaire", label: "« Au moins un » : mauvais événement contraire" },
  { id: "reunion", label: "Réunion sans retirer l'intersection" },
  { id: "conditionnelleInversee", label: "Probabilité conditionnelle inversée" },
  { id: "produitSansRemise", label: "Produit comme si le tirage était avec remise" },
  { id: "arbreMalPondere", label: "Arbre : chemin non multiplié" },
  { id: "ordreOublie", label: "Un seul ordre compté (dénombrement)" },
];

export function construire(variante: VarianteDetectiveProba): ExerciceDetectiveProba {
  const d = donnees(variante);
  const options = melanger([variante as string, ...LEURRES[variante]]);
  return { variante, d: { ...d, av: entier(0, 3) }, options };
}

export function construireAvecVariante(id: string): ExerciceDetectiveProba {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDetectiveProba(): ExerciceDetectiveProba {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
