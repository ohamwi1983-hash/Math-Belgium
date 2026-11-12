import type { CibleFormuleMoivre, ExerciceFormuleMoivre, TermeDeveloppementMoivre } from "../../core6e/formuleMoivre.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { puissanceDeI } from "../nombresComplexes/familleG";

/**
 * Couche A (6e) — point d'entrée `6gen38` ("Formule de Moivre : développer cos(nx) et sin(nx)",
 * chapitre 7). UNE SEULE famille — seul paramètre de génération : `n∈{3,4,5,6}`, équiprobable.
 *
 * Réutilise EXPLICITEMENT `puissanceDeI` (`generateurs6e/nombresComplexes/familleG.ts`, brique de
 * `6gen34`) pour résoudre i^k terme par terme — Couche A ↔ Couche A, réutilisation libre (CLAUDE.md).
 * Les coefficients binomiaux C(n,k), eux, ne réutilisent rien d'externe : technique algébrique déjà
 * maîtrisée, calculée localement par `binomiale` ci-dessous (formule multiplicative, exacte pour les
 * petits n∈{3,4,5,6} concernés ici — pas de risque d'imprécision flottante à ces tailles).
 */

const VALEURS_N = [3, 4, 5, 6] as const;

function binomiale(n: number, k: number): number {
  let resultat = 1;
  for (let i = 0; i < k; i++) resultat = (resultat * (n - i)) / (i + 1);
  return Math.round(resultat);
}

function construireTermes(n: number): TermeDeveloppementMoivre[] {
  const termes: TermeDeveloppementMoivre[] = [];
  for (let k = 0; k <= n; k++) {
    const ik = puissanceDeI(k);
    termes.push({ k, coefBinomial: binomiale(n, k), puissanceCos: n - k, reI: ik.re, imI: ik.im });
  }
  return termes;
}

/** Polynômes de Tchebychev : cos(nx) = Tₙ(cos x), sin(nx)/sin(x) = Uₙ₋₁(cos x) — coefficients
 * entiers, indice = puissance de cos(x) (récurrence P₍ₖ₊₁₎ = 2c·Pₖ − P₍ₖ₋₁₎). */
function tchebychev(premier: number[], second: number[], rang: number): number[] {
  let precedent = premier;
  let courant = second;
  if (rang === 0) return premier;
  for (let k = 1; k < rang; k++) {
    const suivant = new Array(courant.length + 1).fill(0);
    courant.forEach((c, i) => (suivant[i + 1] += 2 * c));
    precedent.forEach((c, i) => (suivant[i] -= c));
    precedent = courant;
    courant = suivant;
  }
  return courant;
}

function polynomeCos(n: number, cible: CibleFormuleMoivre): number[] {
  if (cible === "cosSeul") return tchebychev([1], [0, 1], n);
  if (cible === "sinSurSin") return tchebychev([1], [0, 2], n - 1);
  return [];
}

const CIBLES: CibleFormuleMoivre[] = ["standard", "cosSeul", "sinSurSin"];

/** Construction déterministe (`n` et `cible` fixés) — utilisée par `CATALOGUE_VARIANTES`/
 * `construireAvecVarianteId`. Sans argument : tirage UNIFORME sur les 12 couples (n, cible). */
export function construireExercice(n: 3 | 4 | 5 | 6 = tirerParmi(VALEURS_N), cible: CibleFormuleMoivre = tirerParmi(CIBLES)): ExerciceFormuleMoivre {
  return { n, termes: construireTermes(n), cible, polynomeCos: polynomeCos(n, cible) };
}

export function genererExerciceFormuleMoivre(): ExerciceFormuleMoivre {
  return construireExercice();
}

export type IdVarianteFormuleMoivre = "n3" | "n4" | "n5" | "n6" | "cosSeul" | "sinSurSin";

export const CATALOGUE_VARIANTES: { id: IdVarianteFormuleMoivre; label: string }[] = [
  { id: "n3", label: "n=3 — cos(3x) et sin(3x)" },
  { id: "n4", label: "n=4 — cos(4x) et sin(4x)" },
  { id: "n5", label: "n=5 — cos(5x) et sin(5x)" },
  { id: "n6", label: "n=6 — cos(6x) et sin(6x)" },
  { id: "cosSeul", label: "cos(nx) en fonction de cos x seul" },
  { id: "sinSurSin", label: "sin(nx)/sin x en fonction de cos x seul" },
];

const N_PAR_ID: Record<"n3" | "n4" | "n5" | "n6", 3 | 4 | 5 | 6> = { n3: 3, n4: 4, n5: 5, n6: 6 };

export function construireAvecVarianteId(id: IdVarianteFormuleMoivre): ExerciceFormuleMoivre {
  if (id === "cosSeul" || id === "sinSurSin") return construireExercice(tirerParmi(VALEURS_N), id);
  return construireExercice(N_PAR_ID[id], "standard");
}
