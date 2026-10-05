/**
 * Couche A — "Point/coordonnée à partir d'une relation vectorielle" (chapitre "Calcul vectoriel",
 * premier générateur). Réutilise `additionner`/`milieu`/`pointDepuisVecteur`
 * (`generateurs/vecteur/arithmetique.ts`, module frère).
 */
import type {
  ExercicePointVectoriel,
  ExerciceRelationCombinaison,
  ExerciceRelationPointAPoint,
  GenerateurExercicePointVectoriel,
  VariantePointVectoriel,
} from "../../core/pointVectoriel.types";
import { randomInt } from "./aleatoire";

function pointAleatoire(min: number, max: number): { x: number; y: number } {
  return { x: randomInt(min, max), y: randomInt(min, max) };
}

/** Translation donnée par un couple (a,b), image d'un point A (ou de l'origine, ~30% des tirages). */
function construireTranslation(): ExercicePointVectoriel {
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
    reponse: { x: point.x + translation.x, y: point.y + translation.y },
  };
}

/** Milieu d'un segment [AB], A et B tirés distincts. */
function construireMilieu(): ExercicePointVectoriel {
  let pointA = pointAleatoire(-6, 6);
  let pointB = pointAleatoire(-6, 6);
  while (pointA.x === pointB.x && pointA.y === pointB.y) {
    pointB = pointAleatoire(-6, 6);
  }

  return {
    variante: "milieu",
    pointA,
    labelA: "A",
    pointB,
    labelB: "B",
    pointCherche: "M",
    reponse: { x: (pointA.x + pointB.x) / 2, y: (pointA.y + pointB.y) / 2 },
  };
}

const COEFFICIENTS_FORME1 = [-3, -2, -1, -1 / 2, -1 / 3, 1 / 2, 1 / 3, 2, 3];

/**
 * `\vec{BF} = k\vec{BE}` — B, E connus, F cherché. Le déplacement B→E est construit comme un
 * MULTIPLE du dénominateur du coefficient k (2 ou 3 pour une fraction, 1 sinon), pour garantir que
 * `reponse` reste toujours un entier exact malgré un coefficient fractionnaire.
 */
function construireRelationPointAPoint(): ExerciceRelationPointAPoint {
  const coefficient = COEFFICIENTS_FORME1[randomInt(0, COEFFICIENTS_FORME1.length - 1)];
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
    forme: "pointAPoint",
    pointOrigine,
    labelOrigine: "B",
    pointConnu,
    labelConnu: "E",
    coefficient,
    pointCherche: "F",
    reponse: { x: pointOrigine.x + coefficient * dx, y: pointOrigine.y + coefficient * dy },
  };
}

const COEFFICIENTS_FORME2 = [-3, -2, -1, 1, 2, 3];

/** `\vec{AE} = c_1\vec u + c_2\vec v` — A connu, u/v des vecteurs libres nommés, E cherché. */
function construireRelationCombinaison(): ExerciceRelationCombinaison {
  const pointDepart = pointAleatoire(-5, 5);

  let vecteurU = { x: 0, y: 0 };
  while (vecteurU.x === 0 && vecteurU.y === 0) {
    vecteurU = { x: randomInt(-4, 4), y: randomInt(-4, 4) };
  }
  let vecteurV = { x: 0, y: 0 };
  while (vecteurV.x === 0 && vecteurV.y === 0) {
    vecteurV = { x: randomInt(-4, 4), y: randomInt(-4, 4) };
  }

  const coefU = COEFFICIENTS_FORME2[randomInt(0, COEFFICIENTS_FORME2.length - 1)];
  const coefV = COEFFICIENTS_FORME2[randomInt(0, COEFFICIENTS_FORME2.length - 1)];

  return {
    variante: "relationGenerale",
    forme: "combinaisonVecteurs",
    pointDepart,
    labelDepart: "A",
    vecteurU,
    labelU: "u",
    vecteurV,
    labelV: "v",
    coefU,
    coefV,
    pointCherche: "E",
    reponse: {
      x: pointDepart.x + coefU * vecteurU.x + coefV * vecteurV.x,
      y: pointDepart.y + coefU * vecteurU.y + coefV * vecteurV.y,
    },
  };
}

function construireRelationGenerale(): ExercicePointVectoriel {
  return Math.random() < 0.5 ? construireRelationPointAPoint() : construireRelationCombinaison();
}

export const CATALOGUE_VARIANTES: { id: VariantePointVectoriel; label: string }[] = [
  { id: "translation", label: "Image par une translation" },
  { id: "milieu", label: "Milieu d'un segment" },
  { id: "relationGenerale", label: "Relation vectorielle générale" },
];

/** Convention CLAUDE.md ("Catalogue de variantes") — force la variante demandée ; pour
 * "relationGenerale", la forme interne (pointAPoint/combinaisonVecteurs) reste tirée aléatoirement,
 * jamais exposée séparément (même principe que les sous-variantes internes déjà présentes
 * ailleurs, ex. "L'inconnue au dénominateur"). */
export function construireAvecVarianteId(varianteId: VariantePointVectoriel): ExercicePointVectoriel {
  if (varianteId === "translation") return construireTranslation();
  if (varianteId === "milieu") return construireMilieu();
  return construireRelationGenerale();
}

export const genererExercicePointVectoriel: GenerateurExercicePointVectoriel = () => {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
};
