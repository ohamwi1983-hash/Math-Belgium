/**
 * Couche A — "Colinéarité et alignement de points" (chapitre "Calcul vectoriel"), réécriture
 * complète (`promptcreationgenerateur24colinearitealignement.md`). Réutilise
 * `additionner`/`determinant`/`multiplier` (`generateurs/vecteur/arithmetique.ts`, module frère) —
 * jamais nommé "déterminant" côté présentation, voir `ui/formatColinearite.ts`.
 *
 * Simplification délibérée (même principe que "Loi des sinus", chapitre "Cercle
 * trigonométrique") : les 2 vecteurs des variantes "vecteurs"/"parametre" sont toujours nommés
 * u/v, les 3 points des variantes "points"/"pointsParametre" toujours A/B/C — la variété vient des
 * composantes tirées, pas des noms.
 */
import type {
  ComposantesLin,
  ExerciceColinearParametre,
  ExerciceColinearPoints,
  ExerciceColinearPointsParametre,
  ExerciceColinearVecteurs,
  ExerciceColinearite,
  TypeSolutionColinearite,
  VarianteColinearite,
} from "../../core/colinearite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { additionner, determinant, multiplier } from "../vecteur/arithmetique";
import { randomInt } from "./aleatoire";
import { construireVecteurAvecX } from "./linExpr";

const COEFFICIENTS_MULTIPLE = [-3, -2, 2, 3];

/** `-0` produit par `a*b-a*b` quand les deux produits coïncident — jamais affiché "-0" à l'élève,
 * même précaution que `normaliserZero` (exercice "tableau de signes"). */
function normaliserZero(valeur: number): number {
  return valeur === 0 ? 0 : valeur;
}

function vecteurAleatoire(): Composantes {
  let v = { x: 0, y: 0 };
  while (v.x === 0 && v.y === 0) {
    v = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  }
  return v;
}

function composantesLinFixe(v: Composantes): ComposantesLin {
  return { x: { coefX: 0, constante: v.x }, y: { coefX: 0, constante: v.y } };
}

function pointLinDepuisVecteur(origine: Point, v: ComposantesLin): ComposantesLin {
  return {
    x: { coefX: v.x.coefX, constante: origine.x + v.x.constante },
    y: { coefX: v.y.coefX, constante: origine.y + v.y.constante },
  };
}

function construireVecteurs(): ExerciceColinearVecteurs {
  const v1 = vecteurAleatoire();
  const doitEtreColineaire = Math.random() < 0.5;

  let v2: Composantes;
  if (doitEtreColineaire) {
    const k = COEFFICIENTS_MULTIPLE[randomInt(0, COEFFICIENTS_MULTIPLE.length - 1)];
    v2 = multiplier(k, v1);
  } else {
    do {
      v2 = vecteurAleatoire();
    } while (determinant(v1, v2) === 0);
  }

  return {
    variante: "vecteurs",
    v1,
    v1Nom: "u",
    v2,
    v2Nom: "v",
    critere: normaliserZero(determinant(v1, v2)),
    colineaires: determinant(v1, v2) === 0,
  };
}

function construirePoints(): ExerciceColinearPoints {
  const pointA = { x: randomInt(-5, 5), y: randomInt(-5, 5) };
  const vecteurAB = vecteurAleatoire();
  const doitEtreAligne = Math.random() < 0.5;

  let vecteurAC: Composantes;
  if (doitEtreAligne) {
    const k = COEFFICIENTS_MULTIPLE[randomInt(0, COEFFICIENTS_MULTIPLE.length - 1)];
    vecteurAC = multiplier(k, vecteurAB);
  } else {
    do {
      vecteurAC = vecteurAleatoire();
    } while (determinant(vecteurAB, vecteurAC) === 0);
  }

  const pointB = additionner(pointA, vecteurAB);
  const pointC = additionner(pointA, vecteurAC);

  return {
    variante: "points",
    pointA,
    labelA: "A",
    pointB,
    labelB: "B",
    pointC,
    labelC: "C",
    vecteurAB,
    vecteurAC,
    critere: normaliserZero(determinant(vecteurAB, vecteurAC)),
    alignes: determinant(vecteurAB, vecteurAC) === 0,
  };
}

/** `variableEstV1` (ou `abEstVariable` pour la variante points) décide lequel des deux
 * vecteurs/côtés porte les composantes en `x` — le critère `critere(v1,v2)` change de signe selon
 * ce choix (`critere(fixe,variable) = -critere(variable,fixe)`), jamais recalculé indépendamment :
 * `coefX`/`coefConst` restent toujours ceux de l'équation RÉELLEMENT posée par `v1,v2` dans cet
 * ordre, quel que soit le côté choisi pour porter `x` — le signe global n'affecte jamais
 * `solutionX` (rapport `coefConst/coefX` invariant par un facteur global commun).
 *
 * `promptcorrectionsgenerateur24lot3.md`, point 2 — cette variante garantit désormais elle aussi
 * TOUJOURS exactement une solution (jamais identité/contradiction), `typeSolution` forcé à
 * `"unique"` comme `construirePointsParametre` ci-dessous — jamais tiré via `tirerTypeSolution()` —
 * pour permettre l'écran "résolution" simplifié à un simple champ numérique "x =", sans les 3 cas
 * dégénérés à gérer côté interface. */
function construireParametre(): ExerciceColinearParametre {
  const typeSolution: TypeSolutionColinearite = "unique";
  const { vecteurVariable, vecteurFixe, coefX, coefConst, solutionX } = construireVecteurAvecX(typeSolution);
  const variableEstV1 = Math.random() < 0.5;
  const signe = variableEstV1 ? 1 : -1;

  return {
    variante: "parametre",
    v1: variableEstV1 ? vecteurVariable : composantesLinFixe(vecteurFixe),
    v1Nom: "u",
    v2: variableEstV1 ? composantesLinFixe(vecteurFixe) : vecteurVariable,
    v2Nom: "v",
    coefX: normaliserZero(signe * coefX),
    coefConst: normaliserZero(signe * coefConst),
    typeSolution,
    solutionX,
  };
}

/**
 * `promptcorrectionsgenerateur24complet.md`, point 10 — cette variante garantit toujours EXACTEMENT
 * une solution (jamais identité/contradiction) : `typeSolution` forcé à `"unique"`, jamais tiré via
 * `tirerTypeSolution()`. Simplifie l'écran "résolution" en un simple champ numérique, sans les 3 cas
 * dégénérés à gérer — même principe désormais appliqué à `construireParametre` ci-dessus
 * (`promptcorrectionsgenerateur24lot3.md`, point 2).
 */
function construirePointsParametre(): ExerciceColinearPointsParametre {
  const typeSolution: TypeSolutionColinearite = "unique";
  const { vecteurVariable, vecteurFixe, coefX, coefConst, solutionX } = construireVecteurAvecX(typeSolution);
  const abEstVariable = Math.random() < 0.5;
  const signe = abEstVariable ? 1 : -1;
  const pointA = { x: randomInt(-5, 5), y: randomInt(-5, 5) };

  const vecteurAB: ComposantesLin = abEstVariable ? vecteurVariable : composantesLinFixe(vecteurFixe);
  const vecteurAC: ComposantesLin = abEstVariable ? composantesLinFixe(vecteurFixe) : vecteurVariable;

  return {
    variante: "pointsParametre",
    pointA,
    labelA: "A",
    pointB: pointLinDepuisVecteur(pointA, vecteurAB),
    labelB: "B",
    pointC: pointLinDepuisVecteur(pointA, vecteurAC),
    labelC: "C",
    vecteurAB,
    vecteurAC,
    coefX: normaliserZero(signe * coefX),
    coefConst: normaliserZero(signe * coefConst),
    typeSolution,
    solutionX,
  };
}

export const CATALOGUE_VARIANTES: { id: VarianteColinearite; label: string }[] = [
  { id: "vecteurs", label: "Colinéarité de deux vecteurs" },
  { id: "parametre", label: "Déterminer x pour la colinéarité" },
  { id: "points", label: "Alignement de trois points" },
  { id: "pointsParametre", label: "Alignement avec x" },
];

export function construireAvecVarianteId(varianteId: VarianteColinearite): ExerciceColinearite {
  if (varianteId === "vecteurs") return construireVecteurs();
  if (varianteId === "parametre") return construireParametre();
  if (varianteId === "points") return construirePoints();
  return construirePointsParametre();
}

export function genererExerciceColinearite(): ExerciceColinearite {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)].id;
  return construireAvecVarianteId(varianteId);
}
