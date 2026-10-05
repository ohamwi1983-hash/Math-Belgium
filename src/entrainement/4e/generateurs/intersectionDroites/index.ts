/**
 * Couche A — "Intersection entre deux droites". Réutilise directement les primitives déjà
 * partagées du groupe "droites" (`generateurs/droite/geometrieDroite.ts`, module frère) : jamais
 * de conversion point/vecteur → forme cartésienne réinventée ici.
 *
 * **Construction "point d'intersection d'abord", jamais un tirage-puis-résolution** (même principe
 * que le reste du projet) : pour le cas `secantes`, un point d'intersection ENTIER (`pointCroise`)
 * est choisi en premier, puis les deux droites sont construites pour passer par lui — garantit par
 * construction que `intersectionDeuxDroites` retombe exactement sur cet entier (aucune coordonnée
 * fractionnaire résiduelle possible : deux droites à coefficients entiers passant exactement par un
 * même point entier, avec des vecteurs directeurs non colinéaires eux aussi entiers, résolvent
 * toujours exactement sur ce point via la règle de Cramer — vérifié par test sur un grand
 * échantillon, jamais une preuve algébrique a priori seule).
 *
 * **Piège évité : ancrer chaque droite directement sur `pointCroise` rendrait le paramètre à
 * résoudre (`t`/`s`) trivialement toujours nul.** Chaque droite stocke donc son couple
 * (point,vecteur) à un point DÉCALÉ le long de la même droite infinie (`pointCroise +
 * décalage·vecteur`, décalage entier non nul) — garde exactement la même droite (donc la même
 * intersection réelle) tout en donnant à l'élève un vrai paramètre entier non trivial à retrouver.
 */
import type { Composantes, Point } from "../../core/vecteur.types";
import type {
  ConclusionIntersectionDroites,
  ExerciceIntersectionDroites,
  FormeLigneCartesienne,
  LigneIntersection,
  VarianteIntersectionDroites,
} from "../../core/intersectionDroites.types";
import {
  expliciteXDepuisPointVecteur,
  expliciteYDepuisPointVecteur,
  implicteDepuisPointVecteur,
  intersectionDeuxDroites,
} from "../droite/geometrieDroite";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSigne(): 1 | -1 {
  return Math.random() < 0.5 ? 1 : -1;
}

export const CATALOGUE_VARIANTES: { id: VarianteIntersectionDroites; label: string }[] = [
  { id: "cart_cart", label: "Cartésienne × cartésienne" },
  { id: "param_cart", label: "Paramétrique × cartésienne" },
  { id: "param_param", label: "Paramétrique × paramétrique" },
];

/** Poids égal — la spec exige que les 3 cas apparaissent "avec une fréquence raisonnable". */
const CONCLUSIONS: ConclusionIntersectionDroites[] = ["secantes", "paralleles_distinctes", "confondues"];

/** Rotation de 90° — dupliquée depuis `generateurs/relationsDroites/index.ts`/`generateurs/distanceDroite/index.ts`
 * (jamais importée, contrats indépendants entre générateurs du groupe, même principe que le reste du projet). */
function perpendiculaire(v: Composantes): Composantes {
  return { x: -v.y, y: v.x };
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

/** Chaque composante non nulle — jamais de cas "vecteur nul" ni de droite verticale/horizontale à
 * traiter comme un cas spécial ici (contrairement à "Équation d'une droite"). */
function tirerVecteur(): Composantes {
  const composante = () => randomInt(1, 4) * randomSigne();
  return { x: composante(), y: composante() };
}

function tirerFormeCartesienne(): FormeLigneCartesienne {
  const formes: FormeLigneCartesienne[] = ["implicite", "explicite_y", "explicite_x"];
  return formes[randomInt(0, formes.length - 1)]!;
}

/** Décale le point d'ancrage le long de la droite portée par `(pointCroise, vecteur)` — même
 * droite, jamais `pointCroise` lui-même (voir doc de tête de fichier). */
function decalerSurLigne(pointCroise: Point, vecteur: Composantes): Point {
  let decalage = randomInt(-3, 3);
  while (decalage === 0) decalage = randomInt(-3, 3);
  return { x: pointCroise.x + decalage * vecteur.x, y: pointCroise.y + decalage * vecteur.y };
}

interface DonneeLigne {
  point: Point;
  vecteur: Composantes;
}

function construireLignesSecantes(): { donnee1: DonneeLigne; donnee2: DonneeLigne; pointCroise: Point } {
  const pointCroise = tirerPoint();
  const vecteur1 = tirerVecteur();
  let vecteur2 = tirerVecteur();
  while (vecteur1.x * vecteur2.y - vecteur1.y * vecteur2.x === 0) vecteur2 = tirerVecteur();
  return {
    donnee1: { point: decalerSurLigne(pointCroise, vecteur1), vecteur: vecteur1 },
    donnee2: { point: decalerSurLigne(pointCroise, vecteur2), vecteur: vecteur2 },
    pointCroise,
  };
}

function construireLignesParalleles(conclusion: "paralleles_distinctes" | "confondues"): { donnee1: DonneeLigne; donnee2: DonneeLigne } {
  const point1 = tirerPoint();
  const vecteur1 = tirerVecteur();
  const k = randomInt(1, 3) * randomSigne();
  const vecteur2 = { x: k * vecteur1.x, y: k * vecteur1.y };
  const donnee1: DonneeLigne = { point: point1, vecteur: vecteur1 };

  if (conclusion === "confondues") {
    let t = randomInt(-4, 4);
    while (t === 0) t = randomInt(-4, 4);
    const point2 = { x: point1.x + t * vecteur1.x, y: point1.y + t * vecteur1.y };
    return { donnee1, donnee2: { point: point2, vecteur: vecteur2 } };
  }

  const perp = perpendiculaire(vecteur1);
  const decalage = randomInt(1, 3) * randomSigne();
  const point2 = { x: point1.x + decalage * perp.x, y: point1.y + decalage * perp.y };
  return { donnee1, donnee2: { point: point2, vecteur: vecteur2 } };
}

/** Résout `t` tel que `cible = ligne.point + t·ligne.vecteur` — n'a de sens que si `cible`
 * appartient réellement à la droite (toujours garanti ici : `cible` est le point d'intersection
 * réel, `ligne` porte bien cette même droite). Utilise la composante x, jamais nulle par
 * construction (`tirerVecteur` garantit les deux composantes non nulles). */
function resoudreParametre(ligne: DonneeLigne, cible: Point): number {
  return (cible.x - ligne.point.x) / ligne.vecteur.x;
}

function construireLigneIntersection(donnee: DonneeLigne, forme: FormeLigneCartesienne | "parametrique"): LigneIntersection {
  const implicite = implicteDepuisPointVecteur(donnee.point, donnee.vecteur);
  return {
    point: donnee.point,
    vecteur: donnee.vecteur,
    implicite,
    forme,
    parametriqueAffichee:
      forme === "parametrique" ? { x0: donnee.point.x, y0: donnee.point.y, a: donnee.vecteur.x, b: donnee.vecteur.y } : null,
    expliciteYAffichee: forme === "explicite_y" ? expliciteYDepuisPointVecteur(donnee.point, donnee.vecteur) : null,
    expliciteXAffichee: forme === "explicite_x" ? expliciteXDepuisPointVecteur(donnee.point, donnee.vecteur) : null,
  };
}

export function construireAvecVarianteId(
  varianteId: VarianteIntersectionDroites,
  overrides?: { conclusion?: ConclusionIntersectionDroites },
): ExerciceIntersectionDroites {
  const conclusion = overrides?.conclusion ?? CONCLUSIONS[randomInt(0, CONCLUSIONS.length - 1)]!;

  let donnee1: DonneeLigne;
  let donnee2: DonneeLigne;
  if (conclusion === "secantes") {
    const construction = construireLignesSecantes();
    donnee1 = construction.donnee1;
    donnee2 = construction.donnee2;
  } else {
    const construction = construireLignesParalleles(conclusion);
    donnee1 = construction.donnee1;
    donnee2 = construction.donnee2;
  }

  // La forme "parametrique" est toujours celle exigée par la variante ; pour un côté cartésien,
  // une des 3 formes concrètes est tirée uniformément — jamais de cas "forme impossible" ici (voir
  // doc de tête de fichier).
  const forme1: FormeLigneCartesienne | "parametrique" = varianteId === "cart_cart" ? tirerFormeCartesienne() : "parametrique";
  const forme2: FormeLigneCartesienne | "parametrique" = varianteId === "param_param" ? "parametrique" : tirerFormeCartesienne();

  const d1 = construireLigneIntersection(donnee1, forme1);
  const d2 = construireLigneIntersection(donnee2, forme2);
  const colineaires = d1.vecteur.x * d2.vecteur.y - d1.vecteur.y * d2.vecteur.x === 0;

  let point: Point | null = null;
  let tAttendu: number | null = null;
  let sAttendu: number | null = null;
  if (conclusion === "secantes") {
    // Toujours non-null : vecteurs directeurs non colinéaires garantis par construction.
    point = intersectionDeuxDroites(d1.implicite, d2.implicite)!;
    if (d1.forme === "parametrique") tAttendu = resoudreParametre(donnee1, point);
    if (d2.forme === "parametrique") sAttendu = resoudreParametre(donnee2, point);
  }

  return { variante: varianteId, d1, d2, colineaires, conclusion, point, tAttendu, sAttendu };
}

export function genererExerciceIntersectionDroites(): ExerciceIntersectionDroites {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
