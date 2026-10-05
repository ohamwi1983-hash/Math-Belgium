import type { EnsembleReelGuide, MorceauIntervalle } from "../../core6e/ensembleReel.types";
import { ensembleReel, ensembleUnMorceau } from "../ensembleReel";

/**
 * Couche A (6e) — petites fabriques PURES d'intervalles pour les CE de `6gen3` (REFONTE). Un
 * intervalle est représenté comme un `MorceauIntervalle` (bornes `number | null`, `null` = infini) ;
 * `null` en retour d'`intersection` signifie "CE vide" — jamais construit par les familles
 * (reroll tant que la CE est vide, même principe que l'ancienne `construireEgaliteAvecCE`), le
 * builder élève (`EnsembleReelGuideBuilder`) n'ayant de toute façon aucun moyen de représenter
 * l'ensemble vide.
 */
const EPS = 1e-9;

/** Domaine de `ax+b ∈ [-1;1]` (arcsin/arccos), TOUJOURS borné et FERMÉ (`a≠0` garanti par l'appelant). */
export function domaineArcsinArccosLineaire(a: number, b: number): MorceauIntervalle {
  const b1 = (-1 - b) / a;
  const b2 = (1 - b) / a;
  return { inf: Math.min(b1, b2), sup: Math.max(b1, b2), infInclus: true, supInclus: true };
}

/** Domaine de `ax+b > 0` (demi-droite OUVERTE, `a≠0` garanti). */
export function domaineStrictementPositif(a: number, b: number): MorceauIntervalle {
  const seuil = -b / a;
  return a > 0 ? { inf: seuil, sup: null, infInclus: false, supInclus: false } : { inf: null, sup: seuil, infInclus: false, supInclus: false };
}

/** Domaine de `ax+b >= 0` (demi-droite FERMÉE au seuil, `a≠0` garanti) — condition de signe non
 * stricte, utilisée par l'écran "condition" de la variante 4 (compatibilité de codomaines : le
 * seuil lui-même appartient toujours à la condition, ex. `arcsin(0)=0` est une égalité valide). */
export function domaineSigneNonNegatif(a: number, b: number): MorceauIntervalle {
  const seuil = -b / a;
  return a > 0 ? { inf: seuil, sup: null, infInclus: true, supInclus: false } : { inf: null, sup: seuil, infInclus: false, supInclus: true };
}

function borneInfPlusGrande(i1: MorceauIntervalle, i2: MorceauIntervalle): { inf: number | null; infInclus: boolean } {
  if (i1.inf === null) return { inf: i2.inf, infInclus: i2.infInclus };
  if (i2.inf === null) return { inf: i1.inf, infInclus: i1.infInclus };
  if (Math.abs(i1.inf - i2.inf) < EPS) return { inf: i1.inf, infInclus: i1.infInclus && i2.infInclus };
  return i1.inf > i2.inf ? { inf: i1.inf, infInclus: i1.infInclus } : { inf: i2.inf, infInclus: i2.infInclus };
}

function borneSupPlusPetite(i1: MorceauIntervalle, i2: MorceauIntervalle): { sup: number | null; supInclus: boolean } {
  if (i1.sup === null) return { sup: i2.sup, supInclus: i2.supInclus };
  if (i2.sup === null) return { sup: i1.sup, supInclus: i1.supInclus };
  if (Math.abs(i1.sup - i2.sup) < EPS) return { sup: i1.sup, supInclus: i1.supInclus && i2.supInclus };
  return i1.sup < i2.sup ? { sup: i1.sup, supInclus: i1.supInclus } : { sup: i2.sup, supInclus: i2.supInclus };
}

/** Intersection de 2 intervalles — `null` ssi l'intersection est vide. */
export function intersection(i1: MorceauIntervalle, i2: MorceauIntervalle): MorceauIntervalle | null {
  const { inf, infInclus } = borneInfPlusGrande(i1, i2);
  const { sup, supInclus } = borneSupPlusPetite(i1, i2);
  if (inf !== null && sup !== null) {
    if (inf > sup + EPS) return null;
    if (Math.abs(inf - sup) < EPS && !(infInclus && supInclus)) return null; // point unique mais ouvert d'un côté
  }
  return { inf, sup, infInclus, supInclus };
}

export function appartient(x: number, i: MorceauIntervalle): boolean {
  if (i.inf !== null) {
    if (x < i.inf - EPS) return false;
    if (Math.abs(x - i.inf) < EPS && !i.infInclus) return false;
  }
  if (i.sup !== null) {
    if (x > i.sup + EPS) return false;
    if (Math.abs(x - i.sup) < EPS && !i.supInclus) return false;
  }
  return true;
}

export function versGuide(i: MorceauIntervalle): EnsembleReelGuide {
  return ensembleUnMorceau(i);
}

export const CE_REEL: EnsembleReelGuide = ensembleReel();
