import type { ExerciceFormuleMoivre, TermeDeveloppementMoivre } from "../../core6e/formuleMoivre.types";
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

/** Construction déterministe (`n` fixé) — utilisée par `CATALOGUE_VARIANTES`/`construireAvecVarianteId`
 * ET comme implémentation par défaut de `genererExerciceFormuleMoivre` (tirage aléatoire de `n` en
 * valeur par défaut, réévalué à CHAQUE appel — pas un tirage figé au chargement du module). */
export function construireExercice(n: 3 | 4 | 5 | 6 = tirerParmi(VALEURS_N)): ExerciceFormuleMoivre {
  return { n, termes: construireTermes(n) };
}

export function genererExerciceFormuleMoivre(): ExerciceFormuleMoivre {
  return construireExercice();
}

export type IdVarianteFormuleMoivre = "n3" | "n4" | "n5" | "n6";

export const CATALOGUE_VARIANTES: { id: IdVarianteFormuleMoivre; label: string }[] = [
  { id: "n3", label: "n=3" },
  { id: "n4", label: "n=4" },
  { id: "n5", label: "n=5" },
  { id: "n6", label: "n=6" },
];

const N_PAR_ID: Record<IdVarianteFormuleMoivre, 3 | 4 | 5 | 6> = { n3: 3, n4: 4, n5: 5, n6: 6 };

export function construireAvecVarianteId(id: IdVarianteFormuleMoivre): ExerciceFormuleMoivre {
  return construireExercice(N_PAR_ID[id]);
}
