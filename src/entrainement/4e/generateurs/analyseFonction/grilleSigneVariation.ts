import type { Enonce } from "../../core/generateur.types";
import type { GrilleSigneVariation, ValeurVariation } from "../../core/analyseFonction.types";
import type { ValeurCellule } from "../../core/signesProduit.types";

function signeDeValeur(valeur: number): ValeurCellule {
  if (valeur > 0) return "+";
  if (valeur < 0) return "-";
  return "0";
}

/**
 * Construit le tableau "signe et variation" (étape 6, section 8 de la spec) à partir des valeurs
 * déjà connues de l'exercice (racines, x_S, y_S) — jamais recalculé différemment de ce qui a été
 * confirmé aux étapes 3 et 5. `racines` peut être une racine double ([r,r]) ; `xS` coïncide alors
 * toujours avec cette racine (propriété mathématique du sommet, x_S = -b/(2a) = r), donc une seule
 * colonne représente les deux à la fois. Quand les racines sont distinctes, x_S est toujours
 * strictement entre elles (le sommet d'une parabole est le milieu de ses deux racines) — jamais
 * égal à l'une d'elles dans ce cas.
 *
 * Réutilisée telle quelle pour la catégorie "irreductible" (Δ<0, prompt-cas-non-factorisable.md) :
 * l'appelant (generateurs/analyseFonction/index.ts) lui passe alors `[xS, xS]` au lieu de vraies
 * racines — le chemin "racine double" ci-dessous produit exactement la structure voulue (une seule
 * colonne x_S, en-tête `-∞, x_S, +∞`), et `signeYS` y vaut toujours `signeA` (Δ<0 garantit que
 * y_S a le même signe que a), donc la ligne de signe obtenue est constante sur toute la largeur,
 * sans jamais de "0" — jamais un cas spécial à écrire ici.
 */
export function construireGrilleSigneVariation(
  enonce: Enonce,
  racines: [number, number],
  xS: number,
  yS: number,
): GrilleSigneVariation {
  const [r1, r2] = [...racines].sort((a, b) => a - b);
  const racineDouble = r1 === r2;
  const colonnesValeurs = racineDouble ? [r1] : [r1, xS, r2];
  const indexSommet = racineDouble ? 0 : 1;
  const k = colonnesValeurs.length;
  const nbColonnes = 2 * k + 1;

  const signeA = signeDeValeur(enonce.a) as "+" | "-";
  const signeYS = signeDeValeur(yS);

  const ligneSigne: ValeurCellule[] = [];
  for (let i = 0; i < nbColonnes; i++) {
    if (i % 2 === 0) {
      const estExterieur = i === 0 || i === nbColonnes - 1;
      ligneSigne.push(estExterieur ? signeA : signeYS);
    } else {
      const idxValeur = (i - 1) / 2;
      ligneSigne.push(idxValeur === indexSommet ? signeYS : "0");
    }
  }

  const avant: ValeurVariation = enonce.a > 0 ? "↘" : "↗";
  const apres: ValeurVariation = enonce.a > 0 ? "↗" : "↘";
  const symboleSommet: ValeurVariation = enonce.a > 0 ? "⌣" : "⌢";
  const indexSommetLigne = 2 * indexSommet + 1;

  const ligneVariation: ValeurVariation[] = [];
  for (let i = 0; i < nbColonnes; i++) {
    if (i === indexSommetLigne) ligneVariation.push(symboleSommet);
    else if (i < indexSommetLigne) ligneVariation.push(avant);
    else ligneVariation.push(apres);
  }

  return { colonnesValeurs, indexSommet, ligneSigne, ligneVariation };
}
