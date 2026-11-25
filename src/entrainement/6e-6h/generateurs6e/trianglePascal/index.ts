import type { ContexteParties, Contrainte102, Exercice102, Propriete102, Variante102 } from "../../core6e/trianglePascal";
import { identite } from "../../core6e/trianglePascal";

/**
 * Couche A — générateur de `6gen102` « Triangle de Pascal et propriétés ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Variante « identité » : verdict vrai / faux tiré à 50 % AVANT
 * l'identité ; une forme fausse dont la valeur coïncide par hasard avec la vraie est rejetée.
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

const base: Omit<Exercice102, "variante" | "n" | "k"> = { contrainte: "auMoinsUn", contexte: "pizza", propriete: "pascal", vrai: true, fausse: 0 };

function tirer(variante: Variante102): Exercice102 {
  switch (variante) {
    case "ligne": {
      const n = entier(5, 9);
      // k ≠ (n+1)/2 : la case cherchée et sa symétrique sont deux cases différentes.
      let k = entier(1, Math.floor(n / 2));
      if (2 * k === n + 1) k -= 1;
      return { ...base, variante, n, k: Math.max(1, k) };
    }
    case "symetrie": {
      const n = entier(10, 18);
      const k = entier(2, 5);
      return { ...base, variante, n, k };
    }
    case "parties": {
      const contrainte: Contrainte102 = parmi(["auMoinsUn", "auMoinsDeux", "pasTous"] as const);
      const contexte: ContexteParties = parmi(["pizza", "options", "invites"] as const);
      return { ...base, variante, n: entier(4, 10), k: 0, contrainte, contexte };
    }
    case "identite": {
      const vrai = Math.random() < 0.5;
      const propriete: Propriete102 = parmi(["pascal", "symetrie", "somme"] as const);
      for (;;) {
        const n = propriete === "somme" ? entier(4, 9) : entier(6, 12);
        const k = entier(1, Math.floor(n / 2) - 1);
        const e: Exercice102 = { ...base, variante, n, k, propriete, vrai, fausse: vrai ? 0 : entier(1, 3) };
        const id = identite(e);
        if (!vrai && id.vg === id.vd) continue;
        return e;
      }
    }
  }
}

export const CATALOGUE_102: { id: Variante102; label: string }[] = [
  { id: "ligne", label: "Compléter une ligne du triangle" },
  { id: "symetrie", label: "Symétrie et relation de Pascal sur des valeurs données" },
  { id: "parties", label: "Nombre de parties d'un ensemble (2ⁿ, 2ⁿ − 1…)" },
  { id: "identite", label: "Identité vraie ou fausse ?" },
];

export function construireAvecVariante102(id: string): Exercice102 {
  const v = CATALOGUE_102.find((x) => x.id === id);
  return tirer(v ? v.id : parmi(CATALOGUE_102).id);
}

export function genererExercice102(): Exercice102 {
  return tirer(parmi(CATALOGUE_102).id);
}
