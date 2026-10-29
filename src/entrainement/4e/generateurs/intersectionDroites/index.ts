/**
 * Couche A — "Intersection entre deux droites". Réutilise directement les primitives déjà
 * partagées du groupe "droites" (`generateurs/droite/geometrieDroite.ts`, module frère) : jamais
 * de conversion point/vecteur → forme cartésienne réinventée ici.
 *
 * **Construction "point d'intersection d'abord", jamais un tirage-puis-résolution** (même principe
 * que le reste du projet) : pour le cas `secantes`, un point d'intersection ENTIER (`pointCroise`)
 * est choisi en premier (sauf pour environ 30 % des cas sécants, où deux droites quelconques
 * donnent volontairement un point fractionnaire — voir `construireLignesSecantes`), puis les deux droites sont construites pour passer par lui — garantit par
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

function tirerPoint(): Point {
  return { x: randomInt(-4, 4), y: randomInt(-4, 4) };
}

/** Chaque composante non nulle — jamais de cas "vecteur nul" ni de droite verticale/horizontale à
 * traiter comme un cas spécial ici (contrairement à "Équation d'une droite"). */
function tirerVecteur(): Composantes {
  const composante = () => randomInt(1, 4) * randomSigne();
  return { x: composante(), y: composante() };
}

function tirerFormeCartesienne(exclue?: FormeLigneCartesienne): FormeLigneCartesienne {
  const formes = (["implicite", "explicite_y", "explicite_x"] as FormeLigneCartesienne[]).filter((f) => f !== exclue);
  return formes[randomInt(0, formes.length - 1)]!;
}

/** Proportion de cas sécants dont le point d'intersection n'est pas entier (audit chapitre 7,
 * point 40 — l'exemple du cours tombe sur (9/5 ; 7/5)). */
const PROBABILITE_POINT_FRACTIONNAIRE = 0.3;
/** Plus grand |c| accepté dans une équation cartésienne affichée — le même pour les trois
 * conclusions (point 38 : les parallèles avaient des constantes nettement plus grandes, un indice
 * lisible sans aucun calcul). */
const C_MAX = 30;

/** Décale le point d'ancrage le long de la droite portée par `(pointCroise, vecteur)` — même
 * droite, jamais `pointCroise` lui-même (voir doc de tête de fichier). */
function decalerSurLigne(pointCroise: Point, vecteur: Composantes): Point {
  const decalage = randomInt(1, 2) * randomSigne();
  return { x: pointCroise.x + decalage * vecteur.x, y: pointCroise.y + decalage * vecteur.y };
}

interface DonneeLigne {
  point: Point;
  vecteur: Composantes;
}

function determinant(u: Composantes, v: Composantes): number {
  return u.x * v.y - u.y * v.x;
}

function construireLignesSecantes(): { donnee1: DonneeLigne; donnee2: DonneeLigne; pointCroise: Point } {
  if (Math.random() < PROBABILITE_POINT_FRACTIONNAIRE) {
    // Deux droites quelconques (point entier + vecteur entier) : Cramer donne en général un point
    // fractionnaire, de dénominateur divisant le déterminant — borné pour rester calculable à la main.
    for (;;) {
      const donnee1 = { point: tirerPoint(), vecteur: tirerVecteur() };
      const donnee2 = { point: tirerPoint(), vecteur: tirerVecteur() };
      const det = Math.abs(determinant(donnee1.vecteur, donnee2.vecteur));
      if (det === 0 || det > 12) continue;
      const pointCroise = intersectionDeuxDroites(
        implicteDepuisPointVecteur(donnee1.point, donnee1.vecteur),
        implicteDepuisPointVecteur(donnee2.point, donnee2.vecteur),
      )!;
      const entier = Number.isInteger(pointCroise.x) && Number.isInteger(pointCroise.y);
      if (entier || Math.abs(pointCroise.x) > 8 || Math.abs(pointCroise.y) > 8) continue;
      return { donnee1, donnee2, pointCroise };
    }
  }
  const pointCroise = tirerPoint();
  const vecteur1 = tirerVecteur();
  let vecteur2 = tirerVecteur();
  while (determinant(vecteur1, vecteur2) === 0) vecteur2 = tirerVecteur();
  return {
    donnee1: { point: decalerSurLigne(pointCroise, vecteur1), vecteur: vecteur1 },
    donnee2: { point: decalerSurLigne(pointCroise, vecteur2), vecteur: vecteur2 },
    pointCroise,
  };
}

/** `k ≠ 1` : le vecteur directeur de d₂ n'est jamais recopié tel quel, et deux équations
 * cartésiennes confondues ne s'écrivent jamais de la même façon (point 38). */
const FACTEURS_PARALLELES = [-2, -1, 2];

function construireLignesParalleles(conclusion: "paralleles_distinctes" | "confondues"): { donnee1: DonneeLigne; donnee2: DonneeLigne } {
  const point1 = tirerPoint();
  const vecteur1 = tirerVecteur();
  const k = FACTEURS_PARALLELES[randomInt(0, FACTEURS_PARALLELES.length - 1)]!;
  const vecteur2 = { x: k * vecteur1.x, y: k * vecteur1.y };
  const donnee1: DonneeLigne = { point: point1, vecteur: vecteur1 };

  if (conclusion === "confondues") {
    const t = randomInt(1, 2) * randomSigne();
    const point2 = { x: point1.x + t * vecteur1.x, y: point1.y + t * vecteur1.y };
    return { donnee1, donnee2: { point: point2, vecteur: vecteur2 } };
  }

  // Petit décalage non colinéaire au vecteur directeur — jamais un multiple de la perpendiculaire,
  // qui éloignait d₂ de plusieurs dizaines d'unités (point 38).
  let decalage: Composantes;
  do {
    decalage = { x: randomInt(-2, 2), y: randomInt(-2, 2) };
  } while (determinant(vecteur1, decalage) === 0);
  const point2 = { x: point1.x + decalage.x, y: point1.y + decalage.y };
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

  for (;;) {
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
    // une des 3 formes concrètes est tirée. Jamais deux fois la même forme EXPLICITE en cart_cart
    // (point 38) : une forme explicite est unique pour une droite donnée, deux droites confondues
    // s'y écrivaient donc caractère pour caractère à l'identique — la règle vaut pour les trois
    // conclusions, pour ne pas devenir elle-même un indice.
    const forme1: FormeLigneCartesienne | "parametrique" = varianteId === "cart_cart" ? tirerFormeCartesienne() : "parametrique";
    const formeExclue = forme1 === "explicite_y" || forme1 === "explicite_x" ? forme1 : undefined;
    const forme2: FormeLigneCartesienne | "parametrique" = varianteId === "param_param" ? "parametrique" : tirerFormeCartesienne(formeExclue);

    const d1 = construireLigneIntersection(donnee1, forme1);
    const d2 = construireLigneIntersection(donnee2, forme2);
    if (Math.abs(d1.implicite.c) > C_MAX || Math.abs(d2.implicite.c) > C_MAX) continue;
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
}

export function genererExerciceIntersectionDroites(): ExerciceIntersectionDroites {
  const varianteId = CATALOGUE_VARIANTES[randomInt(0, CATALOGUE_VARIANTES.length - 1)]!.id;
  return construireAvecVarianteId(varianteId);
}
