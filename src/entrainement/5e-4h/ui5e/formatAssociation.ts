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
      return "Chaque graphique numéroté représente une fonction f. Associe-lui, parmi les énoncés lettrés, celui qui décrit correctement son comportement (variations, extremums, ordonnée à l'origine et concavité).";
    case "symbolique":
      return "Chaque fonction f numérotée admet une dérivée parmi les expressions lettrées. Associe chaque f à sa dérivée f'.";
  }
}

export function texteAideNiveau1Association(exercice: ExerciceAssociation): string {
  switch (exercice.famille) {
    case "grapheDerivee":
      return "Regarde le signe de la pente de f : là où f monte, f' est positive (au-dessus de l'axe) ; là où f descend, f' est négative (en-dessous).";
    case "grapheDeriveeAvancee":
      return "Regarde le signe de la pente de f comme d'habitude — mais cherche aussi un point anguleux, un rebroussement ou une tangente verticale : en un tel point, f' n'existe pas.";
    case "grapheVerbal":
      return "Repère d'abord les intervalles où f croît ou décroît (signe de f'), la place de ses extremums par rapport à l'axe des ordonnées, puis l'endroit où la courbe coupe cet axe.";
    case "symbolique":
      return "Identifie la structure de f (puissance, produit, composée) avant d'appliquer la règle de dérivation correspondante.";
  }
}

/** Aide de niveau 2 : une phrase (texte) et, si besoin, une formule rendue À PART en KaTeX —
 * jamais de prose en mode maths (lettres collées, audit 5c5a point 6). */
export interface AideNiveau2Association {
  texte: string;
  latex?: string;
}

export function texteAideNiveau2Association(exercice: ExerciceAssociation): AideNiveau2Association {
  switch (exercice.famille) {
    case "grapheDerivee":
      return {
        texte:
          "Là où f est dérivable, un maximum ou un minimum de f (à l'intérieur du graphique) correspond à un zéro de f' où f' change de signe : f' passe de positive à négative en un maximum, de négative à positive en un minimum.",
      };
    case "grapheDeriveeAvancee":
      return {
        texte:
          "En un point anguleux (deux pentes différentes qui se rencontrent) ou en un point de rebroussement, la courbe n'a pas de tangente unique. En un point à tangente verticale, la tangente existe mais elle est verticale : sa pente serait infinie. Dans ces trois cas, f' n'existe pas en ce point.",
      };
    case "grapheVerbal":
      return {
        texte:
          "Compare d'abord le sens de variation et la place des extremums, puis le point où la courbe coupe l'axe des ordonnées. Un point d'inflexion correspond à un changement de concavité, pas à un extremum.",
      };
    case "symbolique":
      return { texte: "Exemple : une puissance d'un binôme se dérive avec la règle de la composée :", latex: "\left((2x+1)^2\right)' = 2\cdot 2\cdot(2x+1) = 4(2x+1)" };
  }
}
