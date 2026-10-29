/**
 * Couche A — "Caractéristiques d'une droite". Construit une instance en 2 temps, jamais un tirage-
 * puis-classification : (1) la DIRECTION est choisie EN PREMIER — soit un angle remarquable
 * (`ANGLES_REMARQUABLES`, pente exacte 0/1/−1 ou verticale), soit un vecteur directeur entier
 * `(dx ; dy)` de pente rationnelle quelconque (`VECTEURS_PENTE_QUELCONQUE`, ex. 2, −1/3, 3/2 —
 * audit chapitre 7, gen46 point 7 : avec les seuls angles remarquables, la pente ne valait jamais
 * que 0, 1, −1 ou « n'existe pas », l'exercice se devinait) ; la pente et les angles en dérivent
 * mécaniquement ; (2) le point/vecteur canoniques et la forme d'entrée (qui doit rester capable de
 * représenter cette direction, voir `anglesDegsPossibles`) sont dérivés une fois pour toutes.
 */
import type { CaracteristiqueDemandee, ExerciceCaracteristiquesDroite, VarianteCaracteristiquesDroite } from "../../core/caracteristiquesDroite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { ANGLES_REMARQUABLES, expliciteXDepuisPointVecteur, expliciteYDepuisPointVecteur, implicteDepuisPointVecteur, parametriqueDepuisPointVecteur, vecteurDepuisAngleOx } from "../droite/geometrieDroite";

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

/** Vecteurs directeurs irréductibles `(dx ; dy)`, `1 ≤ dx ≤ 4`, `1 ≤ |dy| ≤ 4`, `|dy| ≠ dx` — pente
 * `dy/dx` rationnelle, jamais 0 ni ±1 (déjà couverts par les angles remarquables) : 20 pentes
 * (±2, ±3, ±4, ±1/2, ±3/2, ±1/3, ±2/3, ±4/3, ±1/4, ±3/4). L'angle correspondant n'est pas
 * remarquable : il est demandé arrondi à l'unité (`TOLERANCE_ANGLE`, vérification). */
export const VECTEURS_PENTE_QUELCONQUE: Composantes[] = (() => {
  const liste: Composantes[] = [];
  for (let dx = 1; dx <= 4; dx++) {
    for (let dy = -4; dy <= 4; dy++) {
      if (dy === 0 || Math.abs(dy) === dx || pgcd(Math.abs(dy), dx) !== 1) continue;
      liste.push({ x: dx, y: dy });
    }
  }
  return liste;
})();

/** Part des instances tirées sur un angle remarquable (le reste : pente quelconque). */
const PROPORTION_ANGLE_REMARQUABLE = 0.4;

/** `90°-angleOxDeg`, ramené dans `[0°,180°[` (une inclinaison de droite, jamais un angle signé) —
 * convention du cours (angle avec Oy = 90° − angle avec Ox, ramené entre 0° et 180°) : verticale
 * → 0°, horizontale → 90°, 135° → 135°, 60° → 30°. Pour une pente quelconque, revient à
 * `90° − arctan(m)`, toujours dans `]0° ; 180°[` puisque `arctan(m) ∈ ]−90° ; 90°[`. */
function angleOyDepuisAngleOx(angleOxDeg: number): number {
  const brut = 90 - angleOxDeg;
  return brut < 0 ? brut + 180 : brut;
}

/** Angle avec Ox d'un vecteur non vertical, dans `[0° ; 180°[` — `arctan(m)`, +180° si négatif. */
function angleOxDepuisVecteur(v: Composantes): number {
  const brut = (Math.atan(v.y / v.x) * 180) / Math.PI;
  return brut < 0 ? brut + 180 : brut;
}

/**
 * Angles remarquables représentables par chaque forme d'entrée : `explicite_y` (`y=mx+p`) exige un
 * vecteur directeur non vertical (`v.x≠0`, voir `formeExpliciteYPossible`) — exclut donc 90° ;
 * `explicite_x` (`x=ny+q`) exige un vecteur directeur non horizontal (`v.y≠0`) — exclut donc 0°.
 * `implicite`/`parametrique` représentent n'importe quel angle sans restriction. Les pentes
 * quelconques (`VECTEURS_PENTE_QUELCONQUE`, deux composantes non nulles) passent dans toutes les
 * formes.
 */
function anglesDegsPossibles(variante: VarianteCaracteristiquesDroite): number[] {
  if (variante === "explicite_y") return ANGLES_REMARQUABLES.filter((a) => a !== 90);
  if (variante === "explicite_x") return ANGLES_REMARQUABLES.filter((a) => a !== 0);
  return ANGLES_REMARQUABLES;
}

export function construireExercice(variante: VarianteCaracteristiquesDroite): ExerciceCaracteristiquesDroite {
  let vecteur: Composantes;
  let angleDeg: number;
  if (Math.random() < PROPORTION_ANGLE_REMARQUABLE) {
    const anglesPossibles = anglesDegsPossibles(variante);
    angleDeg = anglesPossibles[randomInt(0, anglesPossibles.length - 1)]!;
    vecteur = vecteurDepuisAngleOx(angleDeg);
  } else {
    vecteur = VECTEURS_PENTE_QUELCONQUE[randomInt(0, VECTEURS_PENTE_QUELCONQUE.length - 1)]!;
    angleDeg = angleOxDepuisVecteur(vecteur);
  }
  const verticale = vecteur.x === 0;

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

  // pente = y_u/x_u du vecteur canonique — exactement la formule que l'élève applique à l'écran 2 ;
  // rationnelle par construction (dénominateur ≤ 4), jamais un arrondi.
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
