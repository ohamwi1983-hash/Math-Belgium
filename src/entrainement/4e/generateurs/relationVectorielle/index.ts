/**
 * Couche A — "Point à partir d'une relation vectorielle" (version guidée, position 20). Réutilise
 * `pointDepuisVecteur` (`generateurs/vecteur/arithmetique.ts`, module frère) — jamais
 * `generateurs/pointVectoriel/` (module totalement indépendant, voir `core/relationVectorielle.types.ts`).
 */
import type {
  ExerciceRelationVectorielle,
  FormeRelationVectorielle,
  GenerateurExerciceRelationVectorielle,
  VarianteRelationVectorielle,
} from "../../core/relationVectorielle.types";
import { pointDepuisVecteur } from "../vecteur/arithmetique";
import { randomInt } from "./aleatoire";

function pointAleatoire(min: number, max: number): { x: number; y: number } {
  return { x: randomInt(min, max), y: randomInt(min, max) };
}

/** Translation donnée par un couple (a,b), image d'un point A (ou de l'origine, ~30% des tirages —
 * même proportion que le générateur "Point vectoriel" existant, cas particulier explicitement
 * demandé par la spec). */
export function construireTranslation(): ExerciceRelationVectorielle {
  const estOrigine = Math.random() < 0.3;
  const point = estOrigine ? { x: 0, y: 0 } : pointAleatoire(-6, 6);
  const labelPoint = estOrigine ? "O" : "A";

  let translation = { x: 0, y: 0 };
  while (translation.x === 0 && translation.y === 0) {
    translation = { x: randomInt(-6, 6), y: randomInt(-6, 6) };
  }

  return {
    variante: "translation",
    point,
    labelPoint,
    translation,
    pointCherche: `${labelPoint}'`,
    reponse: pointDepuisVecteur(point, translation),
  };
}

const COEFFICIENTS_POINT_A_POINT = [-3, -2, -1, -1 / 2, -1 / 3, 1 / 2, 1 / 3, 2, 3];

/**
 * `\vec{BF}=k\vec{BE}` (forme `pointAPoint`) ou `\vec{BM}=\frac12\vec{BE}` (forme `milieu`, k
 * toujours 0.5) — même construction pour les deux, seul le coefficient/le label du point cherché
 * changent. Le déplacement B→E est construit comme un MULTIPLE du dénominateur de `coefficient`
 * (2 ou 3 pour une fraction, 1 sinon), pour garantir que `reponse` reste toujours un entier exact
 * malgré un coefficient fractionnaire — même technique que le générateur "Point vectoriel" existant.
 */
function construireRelation(coefficient: number, forme: FormeRelationVectorielle, pointCherche: string): ExerciceRelationVectorielle {
  const denominateur = coefficient === Math.trunc(coefficient) ? 1 : Math.abs(coefficient) === 1 / 2 ? 2 : 3;

  const pointOrigine = pointAleatoire(-5, 5);
  let m = 0;
  let n = 0;
  while (m === 0 && n === 0) {
    m = randomInt(-4, 4);
    n = randomInt(-4, 4);
  }
  const pointConnu = { x: pointOrigine.x + denominateur * m, y: pointOrigine.y + denominateur * n };

  const dx = pointConnu.x - pointOrigine.x;
  const dy = pointConnu.y - pointOrigine.y;

  return {
    variante: "relationGenerale",
    forme,
    pointOrigine,
    labelOrigine: "B",
    pointConnu,
    labelConnu: "E",
    coefficient,
    pointCherche,
    reponse: { x: pointOrigine.x + coefficient * dx, y: pointOrigine.y + coefficient * dy },
  };
}

export function construireRelationPointAPoint(): ExerciceRelationVectorielle {
  const coefficient = COEFFICIENTS_POINT_A_POINT[randomInt(0, COEFFICIENTS_POINT_A_POINT.length - 1)];
  return construireRelation(coefficient, "pointAPoint", "F");
}

/** Sous-variante milieu — jamais exposée comme variante séparée du catalogue (même principe que
 * `deux_fractions_lineaires`) : `\vec{BM}=\frac12\vec{BE}`, coefficient toujours exactement 0.5. */
export function construireMilieuCommeRelation(): ExerciceRelationVectorielle {
  return construireRelation(0.5, "milieu", "M");
}

function construireRelationGenerale(): ExerciceRelationVectorielle {
  return Math.random() < 0.5 ? construireRelationPointAPoint() : construireMilieuCommeRelation();
}

export const CATALOGUE_VARIANTES: { id: VarianteRelationVectorielle; label: string }[] = [
  { id: "translation", label: "Translation par un vecteur (a,b)" },
  { id: "relationGenerale", label: "Relation vectorielle générale (avec milieu)" },
];

/** Convention CLAUDE.md ("Catalogue de variantes") — force la variante demandée ; la sous-forme
 * (pointAPoint/milieu) reste tirée aléatoirement pour "relationGenerale", jamais exposée ici. */
export function construireAvecVarianteId(varianteId: VarianteRelationVectorielle): ExerciceRelationVectorielle {
  return varianteId === "translation" ? construireTranslation() : construireRelationGenerale();
}

export const genererExerciceRelationVectorielle: GenerateurExerciceRelationVectorielle = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
