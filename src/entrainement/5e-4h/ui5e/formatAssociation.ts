/**
 * Couche présentation (5e) — formatage pour 5gen25 ("Association graphique/mots ↔ signe de f'/f'').
 * Dépend librement des couches inférieures, jamais l'inverse.
 */
import type { ExerciceAssociation } from "../core5e/association.types";

export const CONSIGNE_GENERALE_ASSOCIATION = "Associe chaque élément numéroté au candidat lettré qui lui correspond, en choisissant la bonne lettre dans chaque menu déroulant.";

export function consigneAssociation(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return "Chaque graphique numéroté représente une fonction f. Associe-lui, parmi les graphiques lettrés, celui de sa dérivée f'.";
    case "grapheDeriveeAvancee":
      return "Chaque graphique numéroté représente une fonction f. Associe-lui, parmi les graphiques lettrés, celui de sa dérivée f' — ou choisis « f' n'existe pas ici » si f n'est pas dérivable partout sur son domaine.";
    case "grapheVerbal":
      return "Chaque graphique numéroté représente une fonction f. Associe-lui, parmi les énoncés lettrés, celui qui décrit correctement son comportement (variations et concavité).";
    case "symbolique":
      return "Chaque fonction f numérotée admet une dérivée parmi les expressions lettrées. Associe chaque f à sa dérivée f'.";
  }
}

export function texteAideNiveau1Association(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return "Regarde le signe de la pente de f : là où f monte, f' est positive (au-dessus de l'axe) ; là où f descend, f' est négative (en-dessous).";
    case "grapheDeriveeAvancee":
      return "Regarde le signe de la pente de f comme d'habitude — mais cherche aussi un point anguleux, un rebroussement ou une tangente verticale : à un tel endroit, f' n'a pas de valeur.";
    case "grapheVerbal":
      return "Repère d'abord les intervalles où f croît/décroît (signe de f'), puis où la courbe est concave/convexe (signe de f'').";
    case "symbolique":
      return "Identifie la structure de f (puissance, produit, composée) avant d'appliquer la règle de dérivation correspondante.";
  }
}

export function texteAideNiveau2Association(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return "Un maximum ou un minimum de f correspond TOUJOURS à un zéro (passage par 0) de f'.";
    case "grapheDeriveeAvancee":
      return "Un point anguleux (deux pentes différentes qui se rencontrent), un rebroussement ou une tangente verticale : dans les trois cas, la courbe de f n'admet aucune tangente unique en ce point — donc f' n'y existe pas.";
    case "grapheVerbal":
      return "Un point d'inflexion de f correspond à un changement de concavité — jamais à un extremum.";
    case "symbolique":
      return "\\text{Exemple : } (2x+1)^2 \\text{ se dérive par la règle de chaîne : } 2\\cdot2\\cdot(2x+1)=4(2x+1).";
  }
}
