import type { FormeAffichage } from "../../core/generateur.types";

/**
 * Tire la forme d'affichage de l'énoncé, indépendamment de la catégorie (section "principe").
 * D'abord un tirage équiprobable parmi canonique/isolée/produit=constante (ce dernier exclu si
 * a≠1, illisible sinon), puis, si "isolée" est tirée, un second tirage équiprobable entre ses
 * deux variantes (constante isolée à droite, ou tout sauf le carré isolé à droite).
 */
export function tirerFormeAffichage(a: number): FormeAffichage {
  const formesDeBase: Array<"canonique" | "isolee" | "produit_egale_constante"> =
    a === 1 ? ["canonique", "isolee", "produit_egale_constante"] : ["canonique", "isolee"];
  const forme = formesDeBase[Math.floor(Math.random() * formesDeBase.length)];

  if (forme === "isolee") {
    return Math.random() < 0.5 ? "isolee_constante" : "isolee_carre";
  }
  return forme;
}
