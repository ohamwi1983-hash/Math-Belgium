/**
 * Pool FIXE de 4 figures prédéfinies pour "Réduction d'une somme de vecteurs (Chasles)" — points
 * nommés et coordonnées toujours identiques d'un exercice à l'autre pour une même figure (seule
 * l'expression à réduire varie, voir `index.ts`). Les 2 premières figures sont imposées par la
 * spec (hexagone régulier + centre, étoile à 6 branches) ; les 2 suivantes (trapèze + diagonales,
 * triangle + médianes) ont été choisies avec l'utilisateur — voir CLAUDE.md pour le détail complet
 * de cette décision.
 *
 * Chaque nom de point est une seule lettre majuscule (jamais "Ma"/"Mb"...) pour que la réponse de
 * l'élève (2 lettres, ex. "MA") reste triviale à analyser — voir `verificationReductionVectorielle.ts`.
 */
import type { FigureReduction } from "../../core/reductionVectorielle.types";
import type { Point } from "../../core/vecteur.types";

export interface DefinitionFigure {
  points: Record<string, Point>;
  /** Arêtes affichées (schéma SVG) — purement visuelles, aucun rôle dans la génération/vérification. */
  aretes: [string, string][];
}

const RACINE3 = Math.sqrt(3);

/** Hexagone régulier ABCDEF (rayon 2, centré en O) + son centre. */
const HEXAGONE: DefinitionFigure = {
  points: {
    O: { x: 0, y: 0 },
    A: { x: 2, y: 0 },
    B: { x: 1, y: RACINE3 },
    C: { x: -1, y: RACINE3 },
    D: { x: -2, y: 0 },
    E: { x: -1, y: -RACINE3 },
    F: { x: 1, y: -RACINE3 },
  },
  aretes: [
    ["A", "B"],
    ["B", "C"],
    ["C", "D"],
    ["D", "E"],
    ["E", "F"],
    ["F", "A"],
    ["O", "A"],
    ["O", "B"],
    ["O", "C"],
    ["O", "D"],
    ["O", "E"],
    ["O", "F"],
  ],
};

/** Étoile à 6 branches (hexagramme, 2 triangles superposés G-I-K / H-J-L) + son centre M. */
const ETOILE: DefinitionFigure = {
  points: {
    M: { x: 0, y: 0 },
    G: { x: 3, y: 0 },
    H: { x: 1.5, y: 1.5 * RACINE3 },
    I: { x: -1.5, y: 1.5 * RACINE3 },
    J: { x: -3, y: 0 },
    K: { x: -1.5, y: -1.5 * RACINE3 },
    L: { x: 1.5, y: -1.5 * RACINE3 },
  },
  aretes: [
    ["G", "I"],
    ["I", "K"],
    ["K", "G"],
    ["H", "J"],
    ["J", "L"],
    ["L", "H"],
  ],
};

/** Trapèze ABCD (AB // DC) + ses 2 diagonales, sécantes en E. */
const TRAPEZE: DefinitionFigure = {
  points: {
    A: { x: 0, y: 0 },
    B: { x: 4, y: 0 },
    C: { x: 3, y: 2 },
    D: { x: 1, y: 2 },
    E: { x: 2, y: 4 / 3 },
  },
  aretes: [
    ["A", "B"],
    ["B", "C"],
    ["C", "D"],
    ["D", "A"],
    ["A", "C"],
    ["B", "D"],
  ],
};

/** Triangle ABC + ses 3 médianes (D milieu de [BC], E milieu de [CA], F milieu de [AB]) + le
 * centre de gravité G. */
const TRIANGLE_MEDIANES: DefinitionFigure = {
  points: {
    A: { x: 0, y: 3 },
    B: { x: -2, y: -1 },
    C: { x: 3, y: -1 },
    D: { x: 0.5, y: -1 },
    E: { x: 1.5, y: 1 },
    F: { x: -1, y: 1 },
    G: { x: 1 / 3, y: 1 / 3 },
  },
  aretes: [
    ["A", "B"],
    ["B", "C"],
    ["C", "A"],
    ["A", "D"],
    ["B", "E"],
    ["C", "F"],
  ],
};

export const FIGURES: Record<FigureReduction, DefinitionFigure> = {
  hexagone: HEXAGONE,
  etoile: ETOILE,
  trapeze: TRAPEZE,
  triangleMedianes: TRIANGLE_MEDIANES,
};

export const LIBELLES_FIGURE: Record<FigureReduction, string> = {
  hexagone: "Hexagone régulier + centre",
  etoile: "Étoile à 6 branches",
  trapeze: "Trapèze + diagonales",
  triangleMedianes: "Triangle + médianes",
};
