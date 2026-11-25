import { factorielle } from "../combinatoire";
import type { ExerciceDenombrementE } from "../../core6e/denombrementFondamental.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Famille E de `6gen43` — permutations circulaires : (n − 1)! quand seules les rotations donnent la
 * même disposition (table ronde, ronde d'enfants), (n − 1)!/2 quand on peut aussi retourner l'objet
 * (bracelet, collier, anneau de clés). Le contexte décrit la situation sans nommer la formule.
 */

const CONTEXTES_TABLE = [
  "{n} amis s'assoient autour d'une table ronde. Deux placements sont identiques si chacun a les mêmes voisins à sa gauche et à sa droite.",
  "{n} enfants forment une ronde, tous tournés vers le centre. Deux rondes sont identiques si chaque enfant a le même voisin à sa gauche et le même à sa droite.",
  "{n} invités prennent place autour d'une table ronde ; seule compte la position de chacun par rapport aux autres (qui est à sa gauche, qui est à sa droite).",
];

const CONTEXTES_COLLIER = [
  "On enfile {n} perles de couleurs toutes différentes sur un bracelet fermé. Le bracelet peut tourner et peut aussi être retourné.",
  "On accroche {n} clés toutes différentes sur un anneau. L'anneau peut tourner et être retourné : deux dispositions qui se superposent ainsi sont identiques.",
  "On fabrique un collier avec {n} pierres toutes différentes. Un collier tourné ou retourné reste le même collier.",
];

export function calculerArrangementsCirculaires(n: number, sousType: "table" | "collier"): number {
  const table = factorielle(n - 1);
  return sousType === "table" ? table : table / 2;
}

export function construireTable(n: number = tirerEntier(5, 9)): ExerciceDenombrementE {
  return { famille: "E", sousType: "table", n, contexte: tirerParmi(CONTEXTES_TABLE).replace("{n}", String(n)), resultat: calculerArrangementsCirculaires(n, "table") };
}

export function construireCollier(n: number = tirerEntier(5, 9)): ExerciceDenombrementE {
  return { famille: "E", sousType: "collier", n, contexte: tirerParmi(CONTEXTES_COLLIER).replace("{n}", String(n)), resultat: calculerArrangementsCirculaires(n, "collier") };
}
