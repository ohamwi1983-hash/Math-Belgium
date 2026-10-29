import type {
  CritereRelation,
  DroiteDonneeRelation,
  ExerciceRelationsDroites,
  FormeEntreeCartesienne,
  FormeEntreeRelation,
  FormeSortieRelation,
  RelationReconnue,
  VarianteRelationsDroites,
} from "../../core/relationsDroites.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import {
  expliciteXDepuisPointVecteur,
  expliciteYDepuisPointVecteur,
  formeExpliciteXPossible,
  formeExpliciteYPossible,
  implicteDepuisPointVecteur,
  parametriqueDepuisPointVecteur,
} from "../droite/geometrieDroite";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

/** Part des droites données verticales ou horizontales (audit chapitre 7, gen45 point 23 : jamais
 * tirées auparavant, alors que le cours les traite comme cas particuliers). */
const PROPORTION_VERTICALE_HORIZONTALE = 0.2;

/**
 * Vecteur directeur d'une droite donnée — le plus souvent à composantes toutes deux non nulles
 * (`1 ≤ |x|, |y| ≤ 4`), parfois vertical `(0 ; 1)` ou horizontal `(1 ; 0)`. Une droite verticale
 * n'a pas de forme `y=mx+p`, une horizontale pas de forme `x=ny+q` : `formesCartesiennesPossibles`
 * écarte ces formes pour la forme d'entrée.
 */
function tirerVecteur(): Composantes {
  if (Math.random() < PROPORTION_VERTICALE_HORIZONTALE) {
    return Math.random() < 0.5 ? { x: 0, y: 1 } : { x: 1, y: 0 };
  }
  const x = randomInt(1, 4) * (Math.random() < 0.5 ? -1 : 1);
  const y = randomInt(1, 4) * (Math.random() < 0.5 ? -1 : 1);
  return { x, y };
}

/** Rotation de 90° — `(a,b) → (-b,a)`, exactement l'exemple de la spec, cohérente avec le critère
 * d'orthogonalité `a·c+b·d=0` déjà partagé (`a·(-b)+b·a=0` par construction). */
export function perpendiculaire(v: Composantes): Composantes {
  return { x: -v.y === 0 ? 0 : -v.y, y: v.x };
}

interface ParametresVariante {
  bucketEntree: "cart" | "param";
  formeSortie: FormeSortieRelation;
  critere: CritereRelation;
}

export const PARAMETRES_PAR_VARIANTE: Partial<Record<VarianteRelationsDroites, ParametresVariante>> = {
  cart_vers_cart_parallele: { bucketEntree: "cart", formeSortie: "cartesienne", critere: "parallele" },
  cart_vers_cart_perpendiculaire: { bucketEntree: "cart", formeSortie: "cartesienne", critere: "perpendiculaire" },
  cart_vers_param_parallele: { bucketEntree: "cart", formeSortie: "parametrique", critere: "parallele" },
  cart_vers_param_perpendiculaire: { bucketEntree: "cart", formeSortie: "parametrique", critere: "perpendiculaire" },
  param_vers_cart_parallele: { bucketEntree: "param", formeSortie: "cartesienne", critere: "parallele" },
  param_vers_cart_perpendiculaire: { bucketEntree: "param", formeSortie: "cartesienne", critere: "perpendiculaire" },
};

const FORMES_ENTREE_CARTESIENNES: FormeEntreeCartesienne[] = ["implicite", "explicite_y", "explicite_x"];

function formesCartesiennesPossibles(v: Composantes): FormeEntreeCartesienne[] {
  return FORMES_ENTREE_CARTESIENNES.filter((f) => (f === "explicite_y" ? formeExpliciteYPossible(v) : f === "explicite_x" ? formeExpliciteXPossible(v) : true));
}

/** Construit une droite donnée dans la forme demandée (`"cart"` : une forme cartésienne au hasard
 * parmi celles qui existent pour ce vecteur). */
function construireDroiteDonnee(point: Point, vecteur: Composantes, bucket: "cart" | "param"): DroiteDonneeRelation {
  const droite: DroiteDonneeRelation = {
    formeEntree: "parametrique",
    parametriqueEntree: null,
    impliciteEntree: null,
    expliciteYEntree: null,
    expliciteXEntree: null,
    vecteur,
  };
  if (bucket === "param") {
    droite.parametriqueEntree = parametriqueDepuisPointVecteur(point, vecteur);
    return droite;
  }
  const formes = formesCartesiennesPossibles(vecteur);
  const forme: FormeEntreeRelation = formes[randomInt(0, formes.length - 1)]!;
  droite.formeEntree = forme;
  if (forme === "implicite") droite.impliciteEntree = implicteDepuisPointVecteur(point, vecteur);
  else if (forme === "explicite_y") droite.expliciteYEntree = expliciteYDepuisPointVecteur(point, vecteur);
  else droite.expliciteXEntree = expliciteXDepuisPointVecteur(point, vecteur);
  return droite;
}

/** Vrai si `point` est sur la droite (point de passage, vecteur directeur) — critère de
 * colinéarité de (point − passage) avec le vecteur. */
function surDroite(point: Point, passage: Point, v: Composantes): boolean {
  return (point.x - passage.x) * v.y - (point.y - passage.y) * v.x === 0;
}

/** Point tiré hors de la droite donnée — jamais sur d (sinon la « parallèle » demandée serait d
 * elle-même : 2,5 % des tirages auparavant, audit chapitre 7, gen45 point 22). */
function tirerPointHorsDroite(passage: Point, v: Composantes): Point {
  let point = tirerPoint();
  while (surDroite(point, passage, v)) point = tirerPoint();
  return point;
}

function determinant(a: Composantes, b: Composantes): number {
  return a.x * b.y - a.y * b.x;
}

function produit(a: Composantes, b: Composantes): number {
  return a.x * b.x + a.y * b.y;
}

function tirerFacteurNonNul(): number {
  const k = randomInt(1, 3);
  return Math.random() < 0.5 ? -k : k;
}

/** Multiple non nul `k·v` — composante nulle gardée à +0 (jamais « −0 » à l'affichage). */
function multiple(v: Composantes, k: number): Composantes {
  return { x: v.x === 0 ? 0 : k * v.x, y: v.y === 0 ? 0 : k * v.y };
}

const RELATIONS: RelationReconnue[] = ["paralleles", "perpendiculaires", "aucune"];

/** Famille `reconnaissance` — d₁ et d₂ données, relation équirépartie. Parallèles : d₂ distincte
 * (point de d₂ hors de d₁), vecteur multiple `k·u` pour que les deux équations ne soient pas
 * identiques à l'œil. « Aucune » : vecteur ni colinéaire ni orthogonal. Variante `mixte` : une des
 * deux droites (au hasard) est donnée en paramétrique. */
function construireReconnaissance(varianteId: VarianteRelationsDroites): ExerciceRelationsDroites {
  const point1 = tirerPoint();
  const vecteur1 = tirerVecteur();
  const relation = RELATIONS[randomInt(0, RELATIONS.length - 1)]!;

  let vecteur2: Composantes;
  if (relation === "paralleles") vecteur2 = multiple(vecteur1, tirerFacteurNonNul());
  else if (relation === "perpendiculaires") vecteur2 = multiple(perpendiculaire(vecteur1), tirerFacteurNonNul());
  else {
    vecteur2 = tirerVecteur();
    while (determinant(vecteur1, vecteur2) === 0 || produit(vecteur1, vecteur2) === 0) vecteur2 = tirerVecteur();
  }
  const point2 = tirerPointHorsDroite(point1, vecteur1);

  const paramEnPremier = Math.random() < 0.5;
  const bucket1 = varianteId === "reconnaissance_mixte" && paramEnPremier ? "param" : "cart";
  const bucket2 = varianteId === "reconnaissance_mixte" && !paramEnPremier ? "param" : "cart";
  const droite1 = construireDroiteDonnee(point1, vecteur1, bucket1);
  const droite2 = construireDroiteDonnee(point2, vecteur2, bucket2);

  return {
    variante: varianteId,
    famille: "reconnaissance",
    formeEntree: droite1.formeEntree,
    formeSortie: "cartesienne",
    critere: "parallele",
    parametriqueEntree: droite1.parametriqueEntree,
    impliciteEntree: droite1.impliciteEntree,
    expliciteYEntree: droite1.expliciteYEntree,
    expliciteXEntree: droite1.expliciteXEntree,
    vecteurReference: vecteur1,
    pointCherche: point2,
    vecteurCherche: vecteur2,
    referenceImpliciteSortie: implicteDepuisPointVecteur(point2, vecteur2),
    droite2,
    relation,
  };
}

export function construireExercice(varianteId: VarianteRelationsDroites): ExerciceRelationsDroites {
  const params = PARAMETRES_PAR_VARIANTE[varianteId];
  if (!params) return construireReconnaissance(varianteId);

  const pointReference = tirerPoint();
  const vecteurReference = tirerVecteur();
  const droite = construireDroiteDonnee(pointReference, vecteurReference, params.bucketEntree);

  const pointCherche = tirerPointHorsDroite(pointReference, vecteurReference);
  const vecteurCherche = params.critere === "parallele" ? vecteurReference : perpendiculaire(vecteurReference);
  const referenceImpliciteSortie = implicteDepuisPointVecteur(pointCherche, vecteurCherche);

  return {
    variante: varianteId,
    famille: "construction",
    formeEntree: droite.formeEntree,
    formeSortie: params.formeSortie,
    critere: params.critere,
    parametriqueEntree: droite.parametriqueEntree,
    impliciteEntree: droite.impliciteEntree,
    expliciteYEntree: droite.expliciteYEntree,
    expliciteXEntree: droite.expliciteXEntree,
    vecteurReference,
    pointCherche,
    vecteurCherche,
    referenceImpliciteSortie,
    droite2: null,
    relation: null,
  };
}

export const CATALOGUE_VARIANTES: { id: VarianteRelationsDroites; label: string }[] = [
  { id: "cart_vers_cart_parallele", label: "Cartésienne → cartésienne, parallèle" },
  { id: "cart_vers_cart_perpendiculaire", label: "Cartésienne → cartésienne, perpendiculaire" },
  { id: "cart_vers_param_parallele", label: "Cartésienne → paramétrique, parallèle" },
  { id: "cart_vers_param_perpendiculaire", label: "Cartésienne → paramétrique, perpendiculaire" },
  { id: "param_vers_cart_parallele", label: "Paramétrique → cartésienne, parallèle" },
  { id: "param_vers_cart_perpendiculaire", label: "Paramétrique → cartésienne, perpendiculaire" },
  { id: "reconnaissance_cartesiennes", label: "Reconnaître la relation (deux cartésiennes)" },
  { id: "reconnaissance_mixte", label: "Reconnaître la relation (cartésienne et paramétrique)" },
];

export function construireAvecVarianteId(varianteId: VarianteRelationsDroites): ExerciceRelationsDroites {
  return construireExercice(varianteId);
}

export function genererExerciceRelationsDroites(): ExerciceRelationsDroites {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireExercice(varianteId);
}
