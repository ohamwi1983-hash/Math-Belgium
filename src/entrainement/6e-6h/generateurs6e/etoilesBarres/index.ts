import type { Contexte104, Exercice104, Variante104 } from "../../core6e/etoilesBarres";

/**
 * Couche A — générateur de `6gen104` « Étoiles et barres ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). n ≠ nombre d'objets libres (sinon l'inversion n / p serait invisible) ;
 * réponses ≤ 1 820, faisables à la main ou à la calculatrice.
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function tirer(variante: Variante104): Exercice104 {
  for (;;) {
    let contexte: Contexte104;
    let n: number;
    let p: number;
    switch (variante) {
      case "glaces":
        contexte = parmi(["glace", "viennoiseries", "des"] as const);
        if (contexte === "des") {
          n = 6;
          p = entier(2, 4);
        } else if (contexte === "glace") {
          n = entier(4, 12);
          p = entier(2, 4);
        } else {
          n = entier(4, 8);
          p = entier(3, 6);
        }
        break;
      case "bonbons":
        contexte = parmi(["bonbons", "votes", "billes"] as const);
        n = entier(3, contexte === "votes" ? 4 : 5);
        p = entier(4, contexte === "votes" ? 12 : 10);
        break;
      case "equation":
        contexte = "equation";
        n = entier(3, 5);
        p = entier(4, n === 5 ? 9 : 12);
        break;
      case "auMoinsUn":
        contexte = parmi(["bonbons", "votes", "equation"] as const);
        n = entier(3, contexte === "votes" ? 4 : 5);
        p = n + entier(2, n === 5 ? 9 : 10);
        break;
    }
    const libre: number = variante === "auMoinsUn" ? p - n : p;
    if (libre === n) continue;
    return { variante, contexte, n, p };
  }
}

export const CATALOGUE_104: { id: Variante104; label: string }[] = [
  { id: "glaces", label: "Choisir avec répétition (glaces, viennoiseries, dés identiques)" },
  { id: "bonbons", label: "Objets identiques dans des boîtes (bonbons, votes, billes)" },
  { id: "equation", label: "Solutions entières de x₁ + … + xₙ = p" },
  { id: "auMoinsUn", label: "Au moins un par boîte (ou xᵢ ≥ 1)" },
];

export function construireAvecVariante104(id: string): Exercice104 {
  const v = CATALOGUE_104.find((x) => x.id === id);
  return tirer(v ? v.id : parmi(CATALOGUE_104).id);
}

export function genererExercice104(): Exercice104 {
  return tirer(parmi(CATALOGUE_104).id);
}
