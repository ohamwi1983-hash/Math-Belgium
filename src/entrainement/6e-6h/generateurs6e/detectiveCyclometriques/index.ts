import type { ExerciceDetectiveCyclo, VarianteDetectiveCyclo } from "../../core6e/detectiveCyclometriques.types";
import { LEURRES } from "../../moteur6e/modeleDetectiveCyclometriques";
import { dansImage } from "../../moteur6e/modeleIdentitesCyclometriques";
import { entier, melanger, parmi } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de `6gen152` « Le détective d'erreurs : réciproques et arcfonctions ».
 * `Math.random()` seul (le `?code=` rejoue le tirage, ordre des descriptions compris). La variante
 * fixe le type d'erreur (= la réponse de l'écran 2 : groupe à verdict de l'adaptateur). Nombres tirés
 * pour que toute valeur imprimée soit exacte et lisible (coefficients simplifiés, angles remarquables,
 * racines entières).
 */

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveCyclo; label: string }[] = [
  { id: "inverse", label: "f⁻¹ confondue avec 1/f" },
  { id: "arcsinSin", label: "arcsin(sin θ) = θ hors de l'image" },
  { id: "signeArccos", label: "Signe oublié devant la dérivée de arccos" },
  { id: "uprime", label: "Facteur u′ oublié (arctan u)" },
  { id: "carre", label: "(kx)² écrit kx² (arcsin)" },
  { id: "ce", label: "Candidat hors condition d'existence gardé" },
  { id: "sens", label: "Sens de l'inégalité non inversé (domaine)" },
  { id: "arctan", label: "±π/2 « atteints » par arctan" },
  { id: "injectivite", label: "Injectivité affirmée sur une réunion d'intervalles" },
];

/** Angles en douzièmes de π (multiples de π/6 et π/4) dans [−2π ; 2π], non nuls. */
const ANGLES: number[] = [];
for (let k = -24; k <= 24; k++) if (k !== 0 && (k % 2 === 0 || k % 3 === 0)) ANGLES.push(k);

function donnees(v: VarianteDetectiveCyclo): Record<string, number> {
  for (;;) {
    switch (v) {
      case "inverse": {
        const a = parmi([2, 3, 4, 5, -2, -3]);
        const b = parmi([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]);
        const xs = entier(-4, 4);
        const c = a * xs + b;
        const D = a * c + b;
        if (D === 0 || Math.abs(1 / D - xs) < 1e-9 || Math.abs(c) > 20) continue;
        return { a, b, xs };
      }
      case "arcsinSin": {
        const fn = entier(0, 1);
        const fnL = fn === 0 ? "sin" : "cos";
        const autre = fn === 0 ? "cos" : "sin";
        const k12 = parmi(ANGLES.filter((k) => !dansImage(fnL, k)));
        const k12b = parmi(ANGLES.filter((k) => dansImage(autre, k)));
        return { fn, k12, k12b };
      }
      case "signeArccos":
      case "carre":
      case "uprime":
        return { k: parmi([2, 3, 4, 5]), iu: entier(0, 2) };
      case "ce": {
        const x1 = entier(-3, 3);
        const x2 = entier(-3, 3);
        const m = parmi([1, -1, 2, -2]);
        const n = entier(-2, 2);
        if (x1 === x2) continue;
        if (Math.abs(m * x1 + n) > 1 || Math.abs(m * x2 + n) <= 1) continue;
        const B = m - x1 - x2;
        const C = n + x1 * x2;
        if (Math.abs(B) > 6 || Math.abs(C) > 9) continue;
        return { fn: entier(0, 1), x1, x2, m, n };
      }
      case "sens":
        return { a: entier(-3, 3), k: parmi([2, 3, 4]) };
      case "arctan":
        return { k: parmi([1, 2, 3, 4]), c: parmi([-3, -2, -1, 1, 2, 3]) };
      case "injectivite":
        return { b: parmi([1, 2, 3]), tt: parmi([1, 2, 3]), c: entier(-3, 3) };
    }
  }
}

export function construireAvecVariante(id: string): ExerciceDetectiveCyclo {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "inverse") as VarianteDetectiveCyclo;
  // Position de la ligne fausse (0 à 3 lignes justes avant elle) tirée 1/4 chacune : « quelle ligne ? »
  // est un verdict, sa réponse ne se déduit pas du type d'erreur.
  const av = entier(0, 3);
  return { variante, donnees: { ...donnees(variante), av }, options: melanger([variante as string, ...LEURRES[variante]]) };
}

export function genererExerciceDetectiveCyclo(): ExerciceDetectiveCyclo {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
