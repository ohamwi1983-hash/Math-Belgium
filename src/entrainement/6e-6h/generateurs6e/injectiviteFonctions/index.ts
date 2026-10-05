import type { ExerciceInjectiviteFonctions, FamilleInjectiviteFonctions } from "../../core6e/injectiviteFonctions.types";
import { construireHomographique } from "./familles/homographique";
import { construirePuissanceAffine } from "./familles/puissanceAffine";
import { construirePuissanceMonome } from "./familles/puissanceMonome";
import { construireQuadratique } from "./familles/quadratique";
import { construireRacineNieme } from "./familles/racineNieme";
import { construireRacinePlusConstante } from "./familles/racinePlusConstante";

/** Catalogue de variantes `{id,label}` + `construireAvecFamilleId` — convention permanente du
 * projet (voir CLAUDE.md, "Catalogue de variantes"). */
export const CATALOGUE_FAMILLES: { id: FamilleInjectiviteFonctions; label: string }[] = [
  { id: "puissanceAffine", label: "a) (ax+b)^n" },
  { id: "racineNieme", label: "b) (ax+b)^(1/n)" },
  { id: "puissanceMonome", label: "c) a·xⁿ+b" },
  { id: "racinePlusConstante", label: "d) √(ax+b)+c" },
  { id: "homographique", label: "e) (ax+b)/(cx+d)" },
  { id: "quadratique", label: "f) ax²+bx+c" },
];

const CONSTRUCTEURS: Record<FamilleInjectiviteFonctions, () => ExerciceInjectiviteFonctions> = {
  puissanceAffine: construirePuissanceAffine,
  racineNieme: construireRacineNieme,
  puissanceMonome: construirePuissanceMonome,
  racinePlusConstante: construireRacinePlusConstante,
  homographique: construireHomographique,
  quadratique: construireQuadratique,
};

export function construireAvecFamilleId(familleId: FamilleInjectiviteFonctions): ExerciceInjectiviteFonctions {
  return CONSTRUCTEURS[familleId]();
}

/** Tirage ÉQUIPROBABLE parmi les 6 familles — spec explicite. Les sous-variantes (parité de n,
 * signe de a) sont déterminées par le tirage DES PARAMÈTRES à l'intérieur de chaque
 * `construireXxx`, jamais par un second tirage séparé ici. */
export function genererExerciceInjectiviteFonctions(): ExerciceInjectiviteFonctions {
  const familleId = CATALOGUE_FAMILLES[Math.floor(Math.random() * CATALOGUE_FAMILLES.length)].id;
  return construireAvecFamilleId(familleId);
}
