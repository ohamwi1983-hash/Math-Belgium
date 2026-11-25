import type { ExerciceDetectiveCombi, VarianteDetectiveCombi } from "../../core6e/detectiveCombinatoire";
import { MOTS } from "../../core6e/detectiveCombinatoire";
import { LEURRES } from "../../moteur6e/modeleDetectiveCombinatoire";
import { C, entier, melanger, parmi } from "../../ui6e/nombresCombinatoireLotH2";

/**
 * Couche A — générateur de `6gen109` « Détective d'erreurs : analyse combinatoire ». `Math.random()`
 * seul (le `?code=` rejoue le tirage). La variante fixe le TYPE D'ERREUR (groupe à verdict) ; les
 * nombres sont choisis pour que l'erreur se VOIE (résultat de la copie ≠ résultat juste ; probabilité
 * fausse de la copie restée ≤ 1 pour que l'erreur ne soit pas trahie par une absurdité). L'ordre des
 * descriptions est tiré ensuite, et la position de la ligne fausse (`av` : 0 à 3 lignes justes avant
 * elle) EN DERNIER : un code imprimé rouvre les mêmes données et réponses.
 */

function donnees(v: VarianteDetectiveCombi): Record<string, number> {
  for (;;) {
    switch (v) {
      case "ordre": {
        const ctx = Math.random() < 0.5 ? 1 : 0;
        return ctx === 0 ? { ctx, n: entier(8, 15), k: entier(2, 4) } : { ctx, n: entier(6, 12) };
      }
      case "collier":
        return { n: entier(5, 8) };
      case "denominateur": {
        const N = parmi([10, 12, 15]);
        const K = entier(3, 5);
        const n = entier(3, 4);
        const j = entier(1, Math.min(K, n - 1));
        const fav = C(K, j) * C(N - K, n - j);
        if (fav > C(N, j)) continue;
        return { N, K, n, j };
      }
      case "exposants": {
        if (Math.random() < 0.5) {
          const n = entier(3, 6);
          const k = entier(2, 5);
          if (n === k || n ** k === k ** n || n ** k > 100_000 || k ** n > 100_000) continue;
          return { ctx: 0, n, k };
        }
        const n = entier(3, 5);
        const j = entier(1, n - 1);
        if (2 * j === n) continue;
        return { ctx: 1, n, j };
      }
      case "moinsUn":
        return Math.random() < 0.5 ? { ctx: 0, mot: entier(0, MOTS.length - 1) } : { ctx: 1, n: entier(4, 8) };
      case "repetitions":
        return { mot: entier(0, MOTS.length - 1) };
    }
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveCombi; label: string }[] = [
  { id: "ordre", label: "Ordre compté ou oublié (arrangement / combinaison)" },
  { id: "collier", label: "Collier : division par 2 oubliée" },
  { id: "denominateur", label: "Hypergéométrique : mauvais dénominateur" },
  { id: "exposants", label: "Exposants inversés" },
  { id: "moinsUn", label: "« − 1 » oublié (le mot lui-même, la partie vide)" },
  { id: "repetitions", label: "Lettres répétées : division oubliée" },
];

export function construire(variante: VarianteDetectiveCombi): ExerciceDetectiveCombi {
  const d = donnees(variante);
  const options = melanger([variante as string, ...LEURRES[variante]]);
  return { variante, d: { ...d, av: entier(0, 3) }, options };
}

export function construireAvecVariante(id: string): ExerciceDetectiveCombi {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceDetectiveCombi(): ExerciceDetectiveCombi {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
