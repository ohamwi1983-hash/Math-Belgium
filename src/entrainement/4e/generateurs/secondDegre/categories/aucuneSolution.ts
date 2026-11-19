import type { Exercice, FormeAffichage } from "../../../core/generateur.types";
import { randomInt, randomNonZeroInt } from "../aleatoire";

/**
 * Variante « aucune solution » de gen1 (décision 2 de l'utilisateur, audit 4e ch. 2 G7) — le cours
 * en fait une ligne du tableau des raccourcis, et le bouton « Aucune solution » de l'écran final
 * n'était jamais la bonne réponse. C'est un VERDICT (jamais un cas particulier) : deux situations,
 * tirées à parts égales.
 *
 * - « sans solution visible » : b = 0 et a, c de même signe (3x² + 12 = 0). Catégorie
 *   `irreductible` (aucune factorisation réelle) : la reconnaissance attend « Aucune solution :
 *   b = 0, a et c de même signe », puis l'écran des solutions (pas de Δ ni de factorisation).
 * - cas général à Δ < 0 (x² − 2x + 5 = 0) : catégorie `cas_general`, méthode « formule
 *   générale », Δ < 0 calculé, puis « Aucune solution ».
 *
 * Coefficients entiers, jamais irrationnels ; `racines` vaut [NaN, NaN] (aucune racine réelle,
 * même convention que `irreductible` dans `core/generateur.types.ts`).
 */
export function construireAucuneSolutionSansDelta(): Exercice {
  const signe = Math.random() < 0.7 ? 1 : -1;
  const a = signe * randomInt(1, 4);
  const c = signe * randomInt(1, 20);
  // b = 0 : la forme « isolée » (3x² = −12) est déjà le raccourci du cours ; jamais x(x + b).
  const formeAffichage: FormeAffichage = Math.random() < 0.5 ? "canonique" : "isolee_constante";
  return {
    categorie: "irreductible",
    enonce: { a, b: 0, c },
    solution: { racines: [Number.NaN, Number.NaN], racinesExactes: true },
    formeAffichage,
  };
}

export function construireAucuneSolutionDeltaNegatif(): Exercice {
  for (;;) {
    const a = randomInt(1, 3);
    const b = randomNonZeroInt(-8, 8);
    const c = randomInt(1, 15);
    const delta = b * b - 4 * a * c;
    // Δ < 0, sans être trivial (|Δ| ≤ 60, calcul mental possible).
    if (delta >= 0 || delta < -60) continue;
    const s = Math.random() < 0.7 ? 1 : -1;
    const enonce = { a: s * a, b: s * b, c: s * c };
    const formes: FormeAffichage[] = enonce.a === 1 ? ["canonique", "isolee_constante", "isolee_carre", "produit_egale_constante"] : ["canonique", "isolee_constante", "isolee_carre"];
    return {
      categorie: "cas_general",
      enonce,
      solution: { delta: enonce.b * enonce.b - 4 * enonce.a * enonce.c, racines: [Number.NaN, Number.NaN], racinesExactes: true },
      formeAffichage: formes[Math.floor(Math.random() * formes.length)]!,
    };
  }
}

export function construireAucuneSolution(): Exercice {
  return Math.random() < 0.5 ? construireAucuneSolutionSansDelta() : construireAucuneSolutionDeltaNegatif();
}
