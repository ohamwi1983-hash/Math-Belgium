/**
 * Couche core — "Point à partir d'une relation vectorielle" (version guidée, position 20, remplace
 * "Problèmes contextualisés" — `promptremplacementgenerateur20relationvectorielle.md`).
 *
 * **Distinct du générateur "Point à partir d'une relation vectorielle" déjà en place en position 21**
 * (`core/pointVectoriel.types.ts`, premier générateur du chapitre "Calcul vectoriel") — même thème,
 * structure pédagogique différente et volontairement coexistante (décision explicite de l'utilisateur
 * après qu'un doublon a été détecté avant implémentation, voir CLAUDE.md) : celui-ci scaffold la
 * traduction d'une relation vectorielle en équation de coordonnées comme une étape NOTÉE séparée
 * (`"traduction"`), absente du générateur en position 21 (qui ne note que les coordonnées finales,
 * les 4 variantes mélangées sur un seul écran). Module entièrement indépendant — aucun type ni
 * fonction partagée avec `pointVectoriel.types.ts`/`generateurs/pointVectoriel/`, seule
 * l'arithmétique vectorielle pure (`generateurs/vecteur/arithmetique.ts`) et le graphe partagé
 * (`VecteurGraph`/`ui/vecteurGraph.ts`) du chapitre sont réutilisés, comme par tout générateur du
 * chapitre "Calcul vectoriel".
 *
 * 2 variantes tirées à poids égal :
 * - `"translation"` — image d'un point A (ou l'origine O) par une translation `(a,b)`.
 * - `"relationGenerale"` — `\vec{BF} = k\vec{BE}` (`forme: "pointAPoint"`) ou, en sous-variante non
 *   exposée séparément (même principe que `deux_fractions_lineaires`, exercice "L'inconnue au
 *   dénominateur"), la définition du milieu `\vec{BM} = \frac12\vec{BE}` (`forme: "milieu"`,
 *   coefficient toujours exactement `0.5`) — jamais appliquée comme une formule mémorisée
 *   `M=(B+E)/2`, l'élève doit dériver la traduction générique de la relation comme pour
 *   `pointAPoint`.
 */
import type { Composantes, Point } from "./vecteur.types";

export type VarianteRelationVectorielle = "translation" | "relationGenerale";
export type FormeRelationVectorielle = "pointAPoint" | "milieu";

export interface ExerciceTranslationRV {
  variante: "translation";
  point: Point;
  labelPoint: string; // "A" ou "O" (origine)
  translation: Composantes; // (a,b)
  pointCherche: string; // ex. "A'"
  reponse: Point;
}

/**
 * `\vec{PointCherche - PointOrigine} = coefficient \cdot \vec{PointConnu - PointOrigine}` — couvre
 * `pointAPoint` (`\vec{BF}=k\vec{BE}`, `coefficient` tiré) et `milieu` (`\vec{BM}=\frac12\vec{BE}`,
 * `coefficient` toujours `0.5`) via la même forme structurelle, jamais deux contrats séparés.
 */
export interface ExerciceRelationGeneraleRV {
  variante: "relationGenerale";
  forme: FormeRelationVectorielle;
  pointOrigine: Point;
  labelOrigine: string; // "B"
  pointConnu: Point;
  labelConnu: string; // "E"
  coefficient: number; // k (0.5 pour "milieu")
  pointCherche: string; // "F" (pointAPoint) ou "M" (milieu)
  reponse: Point;
}

export type ExerciceRelationVectorielle = ExerciceTranslationRV | ExerciceRelationGeneraleRV;

export type GenerateurExerciceRelationVectorielle = () => ExerciceRelationVectorielle;
