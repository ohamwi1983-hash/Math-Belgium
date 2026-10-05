/**
 * Couche A (5e) — catalogues d'angles remarquables pour 5gen10 ("Équations trigonométriques
 * trig(ax+b)=k"), un par fonction (cos/sin/tan). Chaque entrée associe une valeur cible EXACTE `k`
 * (potentiellement irrationnelle, ex. √3/2 — jamais représentée via `RationnelPi`, réservé aux
 * multiples de π) à sa représentation LaTeX et à son angle de référence `B` (arccos/arcsin/arctan(k)
 * EXACT, une fraction de π). `k=±1` (cos/sin) est volontairement ABSENT de ces catalogues : ce sont
 * des cas SPÉCIAUX (branche unique), construits séparément dans `identites.ts` — jamais mélangés au
 * cas général à deux branches ici.
 */
import type { RationnelPi } from "../parametresSinusoide/rationnelPi";

export interface EntreeAngleRemarquable {
  k: number;
  kLatex: string;
  /** arccos(k) pour CATALOGUE_COS (toujours dans [0,π]), arcsin(k) pour CATALOGUE_SIN (toujours
   * dans [-π/2,π/2]), arctan(k) pour CATALOGUE_TAN (toujours dans (-π/2,π/2)). */
  B: RationnelPi;
}

function pi(numerateur: number, denominateur: number): RationnelPi {
  return { numerateur, denominateur, degrePi: 1 };
}

const RACINE3 = Math.sqrt(3);
const RACINE2 = Math.sqrt(2);

export const CATALOGUE_COS: EntreeAngleRemarquable[] = [
  { k: RACINE3 / 2, kLatex: "\\frac{\\sqrt3}{2}", B: pi(1, 6) },
  { k: RACINE2 / 2, kLatex: "\\frac{\\sqrt2}{2}", B: pi(1, 4) },
  { k: 0.5, kLatex: "\\frac{1}{2}", B: pi(1, 3) },
  { k: 0, kLatex: "0", B: pi(1, 2) },
  { k: -0.5, kLatex: "-\\frac{1}{2}", B: pi(2, 3) },
  { k: -RACINE2 / 2, kLatex: "-\\frac{\\sqrt2}{2}", B: pi(3, 4) },
  { k: -RACINE3 / 2, kLatex: "-\\frac{\\sqrt3}{2}", B: pi(5, 6) },
];

export const CATALOGUE_SIN: EntreeAngleRemarquable[] = [
  { k: RACINE3 / 2, kLatex: "\\frac{\\sqrt3}{2}", B: pi(1, 3) },
  { k: RACINE2 / 2, kLatex: "\\frac{\\sqrt2}{2}", B: pi(1, 4) },
  { k: 0.5, kLatex: "\\frac{1}{2}", B: pi(1, 6) },
  { k: 0, kLatex: "0", B: pi(0, 1) },
  { k: -0.5, kLatex: "-\\frac{1}{2}", B: pi(-1, 6) },
  { k: -RACINE2 / 2, kLatex: "-\\frac{\\sqrt2}{2}", B: pi(-1, 4) },
  { k: -RACINE3 / 2, kLatex: "-\\frac{\\sqrt3}{2}", B: pi(-1, 3) },
];

export const CATALOGUE_TAN: EntreeAngleRemarquable[] = [
  { k: 0, kLatex: "0", B: pi(0, 1) },
  { k: RACINE3 / 3, kLatex: "\\frac{\\sqrt3}{3}", B: pi(1, 6) },
  { k: 1, kLatex: "1", B: pi(1, 4) },
  { k: RACINE3, kLatex: "\\sqrt3", B: pi(1, 3) },
  { k: -RACINE3 / 3, kLatex: "-\\frac{\\sqrt3}{3}", B: pi(-1, 6) },
  { k: -1, kLatex: "-1", B: pi(-1, 4) },
  { k: -RACINE3, kLatex: "-\\sqrt3", B: pi(-1, 3) },
];
