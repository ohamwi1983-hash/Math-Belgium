/**
 * Couche A — "Équation d'une droite". Construit une instance en 3 temps, jamais un tirage-puis-
 * classification : (1) tire le type de donnée d'entrée et la forme cible ; (2) construit les
 * données d'entrée, en forçant volontairement le cas-piège "forme impossible" (droite verticale
 * pour explicite_y, horizontale pour explicite_x) avec une fréquence raisonnable quand la forme
 * cible s'y prête ; (3) dérive point/vecteur/formes explicites une fois pour toutes.
 */
import type {
  DonneesAngle,
  DonneesDeuxPoints,
  DonneesEntreeDroite,
  DonneesPente,
  DonneesPointVecteur,
  ExerciceEquationDroite,
  TypeDonneeEntree,
} from "../../core/equationDroite.types";
import type { FormeSortieDroite } from "../../core/droite.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import {
  ANGLES_REMARQUABLES,
  expliciteXDepuisPointVecteur,
  expliciteYDepuisPointVecteur,
  formeExpliciteXPossible,
  formeExpliciteYPossible,
  implicteDepuisPointVecteur,
  vecteurDepuisAngleOx,
  vecteurDepuisAngleOy,
  vecteurDepuisPente,
} from "../droite/geometrieDroite";

const TYPES_DONNEE: TypeDonneeEntree[] = ["deux_points", "point_vecteur", "angle_ox", "angle_oy", "pente"];
const FORMES_SORTIE: FormeSortieDroite[] = ["parametrique", "implicite", "explicite_y", "explicite_x"];

function randomInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function tirerPoint(): Point {
  return { x: randomInt(-6, 6), y: randomInt(-6, 6) };
}

/** Angle qui force la contrainte demandée pour ce type de donnée — `null` si ce type ne peut
 * jamais produire la contrainte demandée (ex. angle_ox ne produit jamais une droite horizontale
 * "explicite_x impossible" par une contrainte "verticale"... voir le mapping exact ci-dessous). */
function angleForceOx(contrainte: "vertical" | "horizontale"): number {
  return contrainte === "vertical" ? 90 : 0;
}
function angleForceOy(contrainte: "vertical" | "horizontale"): number {
  return contrainte === "vertical" ? 0 : 90;
}

/** Construit les données d'entrée pour un type donné, en forçant `contrainte` quand fourni et
 * compatible avec ce type — sinon (type "pente" + contrainte "vertical", structurellement
 * impossible : `(1,m)` n'est jamais vertical) la contrainte est simplement ignorée, un cas générique
 * est construit à la place. */
function construireDonnees(type: TypeDonneeEntree, contrainte: "vertical" | "horizontale" | null): DonneesEntreeDroite {
  const point = tirerPoint();
  switch (type) {
    case "deux_points": {
      let dx = randomInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
      let dy = randomInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
      if (contrainte === "vertical") dx = 0;
      if (contrainte === "horizontale") dy = 0;
      const pointB: Point = { x: point.x + dx, y: point.y + dy };
      const donnees: DonneesDeuxPoints = { type: "deux_points", pointA: point, pointB };
      return donnees;
    }
    case "point_vecteur": {
      let a = randomInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
      let b = randomInt(1, 5) * (Math.random() < 0.5 ? -1 : 1);
      if (contrainte === "vertical") a = 0;
      if (contrainte === "horizontale") b = 0;
      const vecteur: Composantes = { x: a, y: b };
      const donnees: DonneesPointVecteur = { type: "point_vecteur", point, vecteur };
      return donnees;
    }
    case "angle_ox": {
      const angleDeg = contrainte !== null ? angleForceOx(contrainte) : ANGLES_REMARQUABLES[randomInt(0, ANGLES_REMARQUABLES.length - 1)];
      const donnees: DonneesAngle = { type: "angle_ox", point, angleDeg };
      return donnees;
    }
    case "angle_oy": {
      const angleDeg = contrainte !== null ? angleForceOy(contrainte) : ANGLES_REMARQUABLES[randomInt(0, ANGLES_REMARQUABLES.length - 1)];
      const donnees: DonneesAngle = { type: "angle_oy", point, angleDeg };
      return donnees;
    }
    case "pente": {
      // (1,m) n'est jamais vertical : seule la contrainte "horizontale" (m=0) est atteignable.
      let pente = randomInt(-4, 4);
      if (contrainte === "horizontale") pente = 0;
      else while (pente === 0) pente = randomInt(-4, 4);
      const donnees: DonneesPente = { type: "pente", point, pente };
      return donnees;
    }
  }
}

/** Extraction commune — dérive (point, vecteur) depuis n'importe lequel des 5 types de données. */
export function extraireVecteur(donnees: DonneesEntreeDroite): Composantes {
  switch (donnees.type) {
    case "deux_points":
      return { x: donnees.pointB.x - donnees.pointA.x, y: donnees.pointB.y - donnees.pointA.y };
    case "point_vecteur":
      return donnees.vecteur;
    case "angle_ox":
      return vecteurDepuisAngleOx(donnees.angleDeg);
    case "angle_oy":
      return vecteurDepuisAngleOy(donnees.angleDeg);
    case "pente":
      return vecteurDepuisPente(donnees.pente);
  }
}

export function extrairePoint(donnees: DonneesEntreeDroite): Point {
  return donnees.type === "deux_points" ? donnees.pointA : donnees.point;
}

const PROBABILITE_PIEGE = 0.35;

export function construireExercice(typeDonnee: TypeDonneeEntree, formeCible: FormeSortieDroite): ExerciceEquationDroite {
  const contrainteVoulue: "vertical" | "horizontale" | null =
    formeCible === "explicite_y" && Math.random() < PROBABILITE_PIEGE
      ? "vertical"
      : formeCible === "explicite_x" && Math.random() < PROBABILITE_PIEGE
        ? "horizontale"
        : null;

  const donnees = construireDonnees(typeDonnee, contrainteVoulue);
  const point = extrairePoint(donnees);
  const vecteur = extraireVecteur(donnees);
  const referenceImplicite = implicteDepuisPointVecteur(point, vecteur);
  const refExpliciteY = formeExpliciteYPossible(vecteur) ? expliciteYDepuisPointVecteur(point, vecteur) : null;
  const refExpliciteX = formeExpliciteXPossible(vecteur) ? expliciteXDepuisPointVecteur(point, vecteur) : null;

  const possible =
    formeCible === "parametrique" || formeCible === "implicite"
      ? true
      : formeCible === "explicite_y"
        ? refExpliciteY !== null
        : refExpliciteX !== null;

  return { donnees, point, vecteur, referenceImplicite, formeCible, possible, refExpliciteY, refExpliciteX };
}

export const CATALOGUE_VARIANTES: { id: TypeDonneeEntree; label: string }[] = [
  { id: "deux_points", label: "2 points" },
  { id: "point_vecteur", label: "Point + vecteur directeur" },
  { id: "angle_ox", label: "Angle avec Ox + point" },
  { id: "angle_oy", label: "Angle avec Oy + point" },
  { id: "pente", label: "Pente + point" },
];

export function construireAvecVarianteId(
  varianteId: TypeDonneeEntree,
  overrides?: { formeCible?: FormeSortieDroite },
): ExerciceEquationDroite {
  const formeCible = overrides?.formeCible ?? FORMES_SORTIE[randomInt(0, FORMES_SORTIE.length - 1)];
  return construireExercice(varianteId, formeCible);
}

export function genererExerciceEquationDroite(): ExerciceEquationDroite {
  const typeDonnee = TYPES_DONNEE[randomInt(0, TYPES_DONNEE.length - 1)];
  const formeCible = FORMES_SORTIE[randomInt(0, FORMES_SORTIE.length - 1)];
  return construireExercice(typeDonnee, formeCible);
}
