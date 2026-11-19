import type { ExerciceSigneRacines, VarianteSigneRacines, VerdictSignes } from "../../core/signeRacines.types";
import { verdictCalcule } from "../../moteur/modeleSigneRacines";

/**
 * Générateur de gen114 « Signe des racines sans les calculer ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le même exercice). Le VERDICT est tiré
 * uniformément AVANT les coefficients (signes : 4 issues ; racine évidente : opposés, positives,
 * négatives), puis les coefficients sont tirés jusqu'à l'obtenir. Coefficients entiers premiers entre
 * eux, b ≠ 0, c ≠ 0, Δ ≠ 0.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entier(min, max);
    if (v !== 0) return v;
  }
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

function pgcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : pgcd(b, a % b);
}

export const VERDICTS_PAR_VARIANTE: Record<VarianteSigneRacines, readonly VerdictSignes[]> = {
  signes: ["opposes", "positives", "negatives", "aucune"],
  racineEvidente: ["opposes", "positives", "negatives"],
};

function tirer(variante: VarianteSigneRacines, verdict: VerdictSignes): ExerciceSigneRacines {
  for (;;) {
    let a: number;
    let b: number;
    let c: number;
    if (variante === "signes") {
      a = nonNul(-4, 4);
      b = nonNul(-12, 12);
      c = nonNul(-15, 15);
    } else {
      a = nonNul(-5, 5);
      c = nonNul(-12, 12);
      if (c === a || c === -a) continue;
      b = Math.random() < 0.5 ? -(a + c) : a + c;
    }
    if (pgcd(pgcd(a, b), c) !== 1 || b * b - 4 * a * c === 0) continue;
    const e: ExerciceSigneRacines = { variante, verdict, a, b, c, options: [] };
    if (verdictCalcule(e) !== verdict) continue;
    // Variante « signes » : pas de racine évidente (elle serait un raccourci hors sujet ici).
    if (variante === "signes" && (a + b + c === 0 || a - b + c === 0)) continue;
    return { ...e, options: melanger<VerdictSignes>(["opposes", "positives", "negatives", "aucune"]) };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteSigneRacines; label: string }[] = [
  { id: "signes", label: "Signe des racines par P, Δ et S" },
  { id: "racineEvidente", label: "Racine évidente, puis l'autre par le produit" },
];

export function genererSigneRacines(variante: VarianteSigneRacines): ExerciceSigneRacines {
  return tirer(variante, choisir(VERDICTS_PAR_VARIANTE[variante]));
}

export function construireAvecVariante(id: string): ExerciceSigneRacines {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceSigneRacines();
  return genererSigneRacines(id as VarianteSigneRacines);
}

export function genererExerciceSigneRacines(): ExerciceSigneRacines {
  return genererSigneRacines(choisir(CATALOGUE_VARIANTES).id);
}
