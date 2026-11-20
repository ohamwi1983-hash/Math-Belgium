import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExerciceDifferences, FamilleAucun, VarianteDifferences } from "../../core/differencesSecondes.types";
import { choisir, entierAlea, melanger } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen124 « Premier ou second degré ? Différences secondes ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le même tableau).
 *
 * x de 1 en 1, cinq valeurs commençant à 0, −1 ou −2 (0 et 1 toujours présents : c = f(0) et
 * f(1) = a + b + c se lisent dans le tableau). Toutes les valeurs sont ENTIÈRES, |f(x)| ≤ 60 :
 * - second degré, a entier : a ∈ {±1 ; ±2 ; ±3}, b ∈ [−6 ; 6], c ∈ [−9 ; 9] ;
 * - second degré, a demi-entier : a ∈ {±1/2 ; ±3/2}, b = impair/2 (alors ax² + bx = x(2ax + 2b)/2
 *   est entier pour tout x entier), c ∈ [−9 ; 9] — la différence seconde est impaire ;
 * - premier degré : m ∈ ±[1 ; 7], p ∈ [−9 ; 9] (différences secondes toutes nulles) ;
 * - ni l'un ni l'autre : cubique ±x³ + qx + r, exponentielle k·2ˣ + r (x de 0 à 4) ou trinôme dont
 *   une valeur est décalée de ±1 ou ±2 (différences secondes presque constantes).
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "secondEntier", label: "Second degré (différence seconde paire)" },
  { id: "secondDemi", label: "Second degré (différence seconde impaire : a fractionnaire)" },
  { id: "premier", label: "Premier degré (différences premières constantes)" },
  { id: "aucun", label: "Ni du premier ni du second degré" },
];

const MAX_VALEUR = 60;

function abscisses(debut: number): number[] {
  return [0, 1, 2, 3, 4].map((i) => debut + i);
}

function trinome(a: number, b: number, c: number, x: number): number {
  return a * x * x + b * x + c;
}

function valide(valeurs: number[]): boolean {
  return valeurs.every((v) => Number.isInteger(v) && Math.abs(v) <= MAX_VALEUR) && new Set(valeurs).size >= 3;
}

function tirer(variante: VarianteDifferences): ExerciceDifferences {
  const ordreVerdicts = melanger(["premier", "second", "aucun"] as const).slice();
  for (;;) {
    let xs = abscisses(choisir([0, -1, -2]));
    if (variante === "secondEntier" || variante === "secondDemi") {
      const a = variante === "secondEntier" ? choisir([1, -1, 2, -2, 3, -3]) : choisir([0.5, -0.5, 1.5, -1.5]);
      const b = variante === "secondEntier" ? entierAlea(-6, 6) : choisir([1, 3, 5, 7]) * choisir([1, -1]) / 2;
      const c = entierAlea(-9, 9);
      const valeurs = xs.map((x) => trinome(a, b, c, x));
      if (!valide(valeurs)) continue;
      return { variante, xs, valeurs, coefficients: { a, b, c }, ordreVerdicts };
    }
    if (variante === "premier") {
      const m = entierAlea(1, 7) * choisir([1, -1]);
      const p = entierAlea(-9, 9);
      const valeurs = xs.map((x) => m * x + p);
      if (!valide(valeurs)) continue;
      return { variante, xs, valeurs, coefficients: { m, p }, ordreVerdicts };
    }
    const famille: FamilleAucun = choisir(["cube", "exponentielle", "perturbee"]);
    let valeurs: number[];
    if (famille === "cube") {
      xs = abscisses(choisir([-1, -2]));
      const k = choisir([1, -1]);
      const q = entierAlea(-3, 3);
      const r = entierAlea(-5, 5);
      valeurs = xs.map((x) => k * x ** 3 + q * x + r);
    } else if (famille === "exponentielle") {
      xs = abscisses(0);
      const k = choisir([1, 2, 3]) * choisir([1, -1]);
      const r = entierAlea(-5, 5);
      valeurs = xs.map((x) => k * 2 ** x + r);
    } else {
      const a = choisir([1, -1, 2, -2]);
      const b = entierAlea(-5, 5);
      const c = entierAlea(-9, 9);
      valeurs = xs.map((x) => trinome(a, b, c, x));
      const j = entierAlea(0, 4);
      valeurs[j] = valeurs[j]! + choisir([1, -1, 2, -2]);
    }
    if (!valide(valeurs)) continue;
    return { variante, xs, valeurs, famille, ordreVerdicts };
  }
}

export function construireAvecVariante(id: string): ExerciceDifferences {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDifferences();
  return tirer(id as VarianteDifferences);
}

export function genererExerciceDifferences(): ExerciceDifferences {
  return tirer(choisir(CATALOGUE_VARIANTES).id as VarianteDifferences);
}
