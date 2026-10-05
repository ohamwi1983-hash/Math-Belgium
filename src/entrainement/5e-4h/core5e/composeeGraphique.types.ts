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
 * 1/x en particulier). Le SYMPTÔME visé par E.6 ("allure de polygone des effectifs") est traité
 * directement — voir `ui5e/composeeGraphiqueGraph.ts::pointsLissesCourbe` (spline de Catmull-Rom
 * passant exactement par les mêmes nœuds, RENDU seulement, jamais les données) et
 * `components5e/CourbeGraph.tsx` (trait `EPAISSEUR_TRAIT_ACCENTUE`, la courbe étant l'élément
 * principal de l'écran — retour utilisateur direct après la réduction initiale à `_STANDARD` de
 * la Partie E, jugée trop fine) — sans jamais réintroduire de risque d'incohérence entre
 * coordonnées lues et coordonnées interrogées.
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
