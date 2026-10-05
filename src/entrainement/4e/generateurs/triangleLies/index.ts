/**
 * Couche A — point d'entrée du cinquante-huitième générateur, "Triangles liés (triangulation, côté
 * ou angle partagé)". Catalogue à UN SEUL axe (`famille`), comme gen57 ("Équations avec fonctions
 * de référence en contexte") — contrairement à gen55/gen56, le type de triangle pont
 * (rectangle/quelconque) et la grandeur demandée (côté/angle/aire) sont des propriétés FIXES de
 * chaque famille (voir `core/triangleLies.types.ts`), pas des tirages indépendants — la variante
 * (`cotePartage`/`anglePartage`) en découle directement, jamais un second axe de tirage.
 */
import type { ExerciceTriangleLies, FamilleTriangleLies } from "../../core/triangleLies.types";
import { construireTerrainRectangle } from "./familles/terrainRectangle";
import { construireTerrainQuelconque } from "./familles/terrainQuelconque";
import { construireHauteurInaccessible } from "./familles/hauteurInaccessible";
import { construireDistanceInaccessible } from "./familles/distanceInaccessible";
import { construireTerrainSportif } from "./familles/terrainSportif";
import { construireInclinaisonCable } from "./familles/inclinaisonCable";
import { construireHauteurArbre } from "./familles/hauteurArbre";
import { construireSectionFalaise } from "./familles/sectionFalaise";
import { construireNaviresConvergents } from "./familles/naviresConvergents";
import { construireRandonneursSommet } from "./familles/randonneursSommet";
import { construireAvionsConvergents } from "./familles/avionsConvergents";
import { randomInt } from "./aleatoire";

export interface EntreeCatalogueTriangleLies {
  id: FamilleTriangleLies;
  label: string;
}

export const CATALOGUE_FAMILLES: EntreeCatalogueTriangleLies[] = [
  { id: "terrainRectangle", label: "Terrain quadrilatère (triangle pont rectangle, aire demandée)" },
  { id: "terrainQuelconque", label: "Terrain quadrilatère (triangle pont quelconque, côté demandé)" },
  { id: "hauteurInaccessible", label: "Hauteur d'un objet inaccessible" },
  { id: "distanceInaccessible", label: "Distance entre deux points inaccessibles" },
  { id: "terrainSportif", label: "Terrain sportif (triangle pont quelconque, aire demandée)" },
  { id: "inclinaisonCable", label: "Inclinaison d'un câble de grue (angle demandé)" },
  { id: "hauteurArbre", label: "Hauteur d'un arbre inaccessible (triangulation via un repère)" },
  { id: "sectionFalaise", label: "Aire d'une section de paroi rocheuse (triangulation via un repère)" },
  { id: "naviresConvergents", label: "Distance entre 2 navires (sommet partagé)" },
  { id: "randonneursSommet", label: "Distance entre 2 randonneurs vers un sommet commun (sommet partagé)" },
  { id: "avionsConvergents", label: "Aire entre 2 avions convergeant vers un aéroport (sommet partagé)" },
];

const CONSTRUCTEURS: Record<FamilleTriangleLies, () => ExerciceTriangleLies> = {
  terrainRectangle: construireTerrainRectangle,
  terrainQuelconque: construireTerrainQuelconque,
  hauteurInaccessible: construireHauteurInaccessible,
  distanceInaccessible: construireDistanceInaccessible,
  terrainSportif: construireTerrainSportif,
  inclinaisonCable: construireInclinaisonCable,
  hauteurArbre: construireHauteurArbre,
  sectionFalaise: construireSectionFalaise,
  naviresConvergents: construireNaviresConvergents,
  randonneursSommet: construireRandonneursSommet,
  avionsConvergents: construireAvionsConvergents,
};

export function construireAvecFamilleId(familleId: FamilleTriangleLies): ExerciceTriangleLies {
  return CONSTRUCTEURS[familleId]();
}

export function genererExerciceTriangleLies(): ExerciceTriangleLies {
  const entree = CATALOGUE_FAMILLES[randomInt(0, CATALOGUE_FAMILLES.length - 1)]!;
  return construireAvecFamilleId(entree.id);
}
