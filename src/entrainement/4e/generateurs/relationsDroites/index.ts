import type {
  CritereRelation,
  ExerciceRelationsDroites,
  FormeEntreeCartesienne,
  FormeEntreeRelation,
  FormeSortieRelation,
  VarianteRelationsDroites,
} from "../../core/relationsDroites.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import {
  expliciteXDepuisPointVecteur,
  expliciteYDepuisPointVecteur,
  implicteDepuisPointVecteur,
  parametriqueDepuisPointVecteur,
} from "../droite/geometrieDroite";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

/**
 * Vecteur directeur de la droite de référence — **toujours** à composantes non nulles,
 * contrairement à l'exercice "Équation d'une droite" (qui force parfois une composante nulle pour
 * déclencher son propre piège "forme impossible"). Ce générateur n'a structurellement aucun cas
 * "impossible" : les 3 formes cartésiennes concrètes (implicite/explicite_y/explicite_x) restent
 * toujours toutes les trois calculables pour n'importe quelle instance.
 */
function tirerVecteur(): Composantes {
  const x = randomInt(1, 4) * (Math.random() < 0.5 ? -1 : 1);
  const y = randomInt(1, 4) * (Math.random() < 0.5 ? -1 : 1);
  return { x, y };
}

/** Rotation de 90° — `(a,b) → (-b,a)`, exactement l'exemple de la spec, cohérente avec le critère
 * d'orthogonalité `a·c+b·d=0` déjà partagé (`a·(-b)+b·a=0` par construction). */
export function perpendiculaire(v: Composantes): Composantes {
  return { x: -v.y, y: v.x };
}

interface ParametresVariante {
  bucketEntree: "cart" | "param";
  formeSortie: FormeSortieRelation;
  critere: CritereRelation;
}

export const PARAMETRES_PAR_VARIANTE: Record<VarianteRelationsDroites, ParametresVariante> = {
  cart_vers_cart_parallele: { bucketEntree: "cart", formeSortie: "cartesienne", critere: "parallele" },
  cart_vers_cart_perpendiculaire: { bucketEntree: "cart", formeSortie: "cartesienne", critere: "perpendiculaire" },
  cart_vers_param_parallele: { bucketEntree: "cart", formeSortie: "parametrique", critere: "parallele" },
  cart_vers_param_perpendiculaire: { bucketEntree: "cart", formeSortie: "parametrique", critere: "perpendiculaire" },
  param_vers_cart_parallele: { bucketEntree: "param", formeSortie: "cartesienne", critere: "parallele" },
  param_vers_cart_perpendiculaire: { bucketEntree: "param", formeSortie: "cartesienne", critere: "perpendiculaire" },
};

const FORMES_ENTREE_CARTESIENNES: FormeEntreeCartesienne[] = ["implicite", "explicite_y", "explicite_x"];

export function construireExercice(varianteId: VarianteRelationsDroites): ExerciceRelationsDroites {
  const params = PARAMETRES_PAR_VARIANTE[varianteId];
  const pointReference = tirerPoint();
  const vecteurReference = tirerVecteur();

  let formeEntree: FormeEntreeRelation;
  let parametriqueEntree = null;
  let impliciteEntree = null;
  let expliciteYEntree = null;
  let expliciteXEntree = null;

  if (params.bucketEntree === "param") {
    formeEntree = "parametrique";
    parametriqueEntree = parametriqueDepuisPointVecteur(pointReference, vecteurReference);
  } else {
    formeEntree = FORMES_ENTREE_CARTESIENNES[randomInt(0, FORMES_ENTREE_CARTESIENNES.length - 1)]!;
    if (formeEntree === "implicite") {
      impliciteEntree = implicteDepuisPointVecteur(pointReference, vecteurReference);
    } else if (formeEntree === "explicite_y") {
      expliciteYEntree = expliciteYDepuisPointVecteur(pointReference, vecteurReference);
    } else {
      expliciteXEntree = expliciteXDepuisPointVecteur(pointReference, vecteurReference);
    }
  }

  let pointCherche = tirerPoint();
  while (pointCherche.x === pointReference.x && pointCherche.y === pointReference.y) {
    pointCherche = tirerPoint();
  }

  const vecteurCherche = params.critere === "parallele" ? vecteurReference : perpendiculaire(vecteurReference);
  const referenceImpliciteSortie = implicteDepuisPointVecteur(pointCherche, vecteurCherche);

  return {
    variante: varianteId,
    formeEntree,
    formeSortie: params.formeSortie,
    critere: params.critere,
    parametriqueEntree,
    impliciteEntree,
    expliciteYEntree,
    expliciteXEntree,
    vecteurReference,
    pointCherche,
    vecteurCherche,
    referenceImpliciteSortie,
  };
}

export const CATALOGUE_VARIANTES: { id: VarianteRelationsDroites; label: string }[] = [
  { id: "cart_vers_cart_parallele", label: "Cartésienne → cartésienne, parallèle" },
  { id: "cart_vers_cart_perpendiculaire", label: "Cartésienne → cartésienne, perpendiculaire" },
  { id: "cart_vers_param_parallele", label: "Cartésienne → paramétrique, parallèle" },
  { id: "cart_vers_param_perpendiculaire", label: "Cartésienne → paramétrique, perpendiculaire" },
  { id: "param_vers_cart_parallele", label: "Paramétrique → cartésienne, parallèle" },
  { id: "param_vers_cart_perpendiculaire", label: "Paramétrique → cartésienne, perpendiculaire" },
];

export function construireAvecVarianteId(varianteId: VarianteRelationsDroites): ExerciceRelationsDroites {
  return construireExercice(varianteId);
}

export function genererExerciceRelationsDroites(): ExerciceRelationsDroites {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireExercice(varianteId);
}
