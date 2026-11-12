/**
 * Couche core (5e) — contrat propre à `5gen4` ("Composée de fonctions et image d'un réel — lecture
 * graphique"). Indépendant de tout contrat 4e — voir CLAUDE.md, "Chantier 5e FWB (4h)" : les 2
 * courbes de ce générateur sont des lignes brisées (polyline) passant par des nœuds de grille
 * ENTIERS, jamais une famille algébrique lisse (contrairement au catalogue de gen10, 4e) — décision
 * explicite prise pour ce générateur (voir sa section dédiée dans CLAUDE.md) : aucune fonction
 * algébrique usuelle ne garantit qu'une image entière corresponde à CHAQUE abscisse entière du
 * domaine visible, alors qu'une ligne brisée le garantit par construction.
 *
 * **Écart assumé face à `promptcorrectionsregroupees.md`, E.6** — le prompt demande de tracer les
 * courbes "nativement par Mafs à partir de la formule réelle de la fonction (catalogue de fonctions
 * de référence... gen10)". Structurellement incompatible avec la contrainte ci-dessus : aucune des 6
 * familles du catalogue gen10 (x², x³, √x, ∛x, 1/x, |x|) ne produit une image ENTIÈRE à chaque
 * abscisse entière du domaine visible sans restreindre ce domaine à quelques points isolés (√x/∛x/
 * 1/x en particulier). Rendu (audit du chapitre 1 de 5e, décision G) : segments DROITS entre nœuds
 * entiers sur un quadrillage FIXE à 1 unité (`ui5e/composeeGraphiqueGraph.ts::svgGrapheComposee`) —
 * l'ancienne spline de Catmull-Rom dépassait entre les nœuds (faux extremums, sortie de cadre) et la
 * grille adaptative (1 carré = 5 unités) empêchait toute lecture exacte.
 */

export interface PointGraphique {
  x: number;
  y: number;
}

/** Une courbe = une suite de points entiers, triés par x croissant, reliés par des segments —
 * `points[0].x`/`points[at].x` bornent son domaine (visuellement une demi-droite si l'une des 2
 * bornes touche le bord du cadre, un intervalle sinon). */
export interface CourbeGraphique {
  points: PointGraphique[];
}

export type Composition = "fRondG" | "gRondF";

export interface QuestionComposeeGraphique {
  composition: Composition;
  /** valeur d'entrée interrogée — TOUJOURS dans le domaine de la fonction interne. */
  a: number;
  /** image de la fonction interne en `a` — TOUJOURS définie (a est choisi dans son domaine). */
  bAttendu: number;
  /** `bAttendu` appartient-il au domaine de la fonction EXTERNE ? Le piège central de ce générateur. */
  resultatExiste: boolean;
  /** image de la fonction externe en `bAttendu` — `null` ssi `resultatExiste===false`. */
  resultatAttendu: number | null;
}

export interface ExerciceComposeeGraphique {
  f: CourbeGraphique;
  g: CourbeGraphique;
  /** laquelle des 2 courbes a un domaine visuellement restreint (nécessaire au piège "hors domaine"). */
  restreinte: "f" | "g";
  /** 4 à 5 questions, mélange f∘g/g∘f garanti, au moins une hors domaine — voir
   * `generateurs5e/composeeGraphique/index.ts`. */
  questions: QuestionComposeeGraphique[];
}

export type GenerateurExerciceComposeeGraphique = () => ExerciceComposeeGraphique;
