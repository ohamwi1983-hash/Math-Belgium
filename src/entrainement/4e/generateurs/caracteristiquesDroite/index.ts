/**
 * Couche A — "Caractéristiques d'une droite". Construit une instance en 2 temps, jamais un tirage-
 * puis-classification : (1) l'angle remarquable est choisi EN PREMIER (`angleDeg`), la pente en
 * dérive mécaniquement — jamais l'inverse, garantit une pente exacte, cohérent avec "Angles
 * associés" / "Quel angle ?" ; (2) le point/vecteur canoniques et la forme d'entrée (qui doit
 * rester capable de représenter cet angle, voir `anglesDegsPossibles`) sont dérivés une fois pour
 * toutes.
 */
import type { CaracteristiqueDemandee, ExerciceCaracteristiquesDroite, VarianteCaracteristiquesDroite } from "../../core/caracteristiquesDroite.types";
import type { Point } from "../../core/vecteur.types";
import { ANGLES_REMARQUABLES, expliciteXDepuisPointVecteur, expliciteYDepuisPointVecteur, implicteDepuisPointVecteur, parametriqueDepuisPointVecteur, vecteurDepuisAngleOx } from "../droite/geometrieDroite";

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

/** `90°-angleOxDeg`, ramené dans `[0°,180°[` (une inclinaison de droite, jamais un angle signé) —
 * cohérent avec les 4 angles remarquables (`ANGLES_REMARQUABLES`) : chacun se transforme en un
 * autre angle remarquable de ce même ensemble (0↔90, 45↔45, 135↔135 modulo 180), vérifié
 * exhaustivement par `index.test.ts` (`promptgen46modifications.md`, point 2). */
function angleOyDepuisAngleOx(angleOxDeg: number): number {
  const brut = 90 - angleOxDeg;
  return brut < 0 ? brut + 180 : brut;
}

/**
 * Angles remarquables représentables par chaque forme d'entrée : `explicite_y` (`y=mx+p`) exige un
 * vecteur directeur non vertical (`v.x≠0`, voir `formeExpliciteYPossible`) — exclut donc 90° ;
 * `explicite_x` (`x=ny+q`) exige un vecteur directeur non horizontal (`v.y≠0`) — exclut donc 0°.
 * `implicite`/`parametrique` représentent n'importe quel angle sans restriction.
 */
function anglesDegsPossibles(variante: VarianteCaracteristiquesDroite): number[] {
  if (variante === "explicite_y") return ANGLES_REMARQUABLES.filter((a) => a !== 90);
  if (variante === "explicite_x") return ANGLES_REMARQUABLES.filter((a) => a !== 0);
  return ANGLES_REMARQUABLES;
}

export function construireExercice(variante: VarianteCaracteristiquesDroite): ExerciceCaracteristiquesDroite {
  const anglesPossibles = anglesDegsPossibles(variante);
  const angleDeg = anglesPossibles[randomInt(0, anglesPossibles.length - 1)]!;
  const verticale = angleDeg === 90;
  const vecteur = vecteurDepuisAngleOx(angleDeg);

  // Exclusion de génération : jamais une verticale coïncidant exactement avec l'axe Oy (x=0).
  let point = tirerPoint();
  if (verticale) {
    while (point.x === 0) point = tirerPoint();
  }

  const referenceImplicite = implicteDepuisPointVecteur(point, vecteur);

  let parametriqueEntree = null;
  let impliciteEntree = null;
  let expliciteYEntree = null;
  let expliciteXEntree = null;
  if (variante === "parametrique") parametriqueEntree = parametriqueDepuisPointVecteur(point, vecteur);
  else if (variante === "implicite") impliciteEntree = referenceImplicite;
  else if (variante === "explicite_y") expliciteYEntree = expliciteYDepuisPointVecteur(point, vecteur);
  else expliciteXEntree = expliciteXDepuisPointVecteur(point, vecteur);

  // pente = b/a du vecteur canonique — exactement la formule que l'élève applique à l'écran 2 ;
  // v.x=1 pour tout angle non vertical (vecteurDepuisAngleOx), donc pente=v.y, une valeur remarquable
  // exacte par construction (0, 1 ou -1), jamais un arrondi.
  const pente = verticale ? null : vecteur.y / vecteur.x;
  const ordonneeOrigine = verticale || pente === null ? null : point.y - pente * point.x;
  const angleOyDeg = angleOyDepuisAngleOx(angleDeg);

  const tirageCaracteristique = Math.random();
  const caracteristiqueDemandee: CaracteristiqueDemandee = tirageCaracteristique < 1 / 3 ? "pente" : tirageCaracteristique < 2 / 3 ? "angleOx" : "angleOy";

  return {
    variante,
    verticale,
    parametriqueEntree,
    impliciteEntree,
    expliciteYEntree,
    expliciteXEntree,
    referenceImplicite,
    point,
    vecteur,
    angleDeg,
    angleOyDeg,
    pente,
    ordonneeOrigine,
    caracteristiqueDemandee,
  };
}

export const CATALOGUE_VARIANTES: { id: VarianteCaracteristiquesDroite; label: string }[] = [
  { id: "implicite", label: "Implicite (ax+by+c=0)" },
  { id: "explicite_y", label: "Explicite (y=mx+p)" },
  { id: "explicite_x", label: "Explicite (x=ny+q)" },
  { id: "parametrique", label: "Paramétrique" },
];

export function construireAvecVarianteId(varianteId: VarianteCaracteristiquesDroite): ExerciceCaracteristiquesDroite {
  return construireExercice(varianteId);
}

export function genererExerciceCaracteristiquesDroite(): ExerciceCaracteristiquesDroite {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireExercice(varianteId);
}
