import { arrangements, coefficientBinomial, factorielle } from "../combinatoire";
import type { ExerciceDenombrementC } from "../../core6e/denombrementFondamental.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Arrangements et combinaisons classiques") de `6gen43`.
 * Première utilisation, dans ce chapitre, des fondations `generateurs6e/combinatoire.ts`
 * (`factorielle`/`coefficientBinomial`/`arrangements`).
 *
 * ============================================================================
 * **Choix concrets de paramétrage** (documentés ici comme demandé par la mission)
 * ============================================================================
 * - "cartesContraintes" : jeu de `n=52` cartes standard. `m`∈{1,2} cartes DÉJÀ fixées :
 *   `varianteCartes="inclues"` → ces `m` cartes font PARTIE de la main, reste à choisir
 *   `C(52-m,k-m)` parmi les `52-m` cartes restantes ; `varianteCartes="exclues"` → ces `m` cartes ne
 *   peuvent JAMAIS être choisies, reste à choisir `C(52-m,k)`. `k`∈{3,4,5} (toujours `k>m`).
 * - "motsLettresDistinctes" : `n`∈{4,...,7} lettres toutes différentes, nombre de mots (= ordres
 *   possibles) = `n!`.
 * - "motsRepetition" : alphabet de `n`∈{2,...,5} lettres, mots de `k`∈{2,...,4} lettres avec
 *   répétition autorisée = `n^k`.
 * - "motsPositionFixee" : mot de `n`∈{5,...,8} lettres toutes différentes, `k`∈{1,2} lettres fixées
 *   à des positions données, arrangements des `n-k` positions restantes = `(n-k)!`.
 */

const LETTRES = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function tirerLettresDistinctes(count: number): string[] {
  const disponibles = [...LETTRES];
  const resultat: string[] = [];
  while (resultat.length < count) {
    const l = tirerParmi(disponibles.filter((x) => !resultat.includes(x)));
    resultat.push(l);
  }
  return resultat;
}

// ============================================================================
// Cartes avec contraintes.
// ============================================================================

const N_CARTES = 52;

export function construireCartesContraintes(): ExerciceDenombrementC {
  const k = tirerEntier(3, 5);
  const m = tirerEntier(1, Math.min(2, k - 1));
  const varianteCartes: "inclues" | "exclues" = tirerParmi(["inclues", "exclues"] as const);
  const resultat = varianteCartes === "inclues" ? coefficientBinomial(N_CARTES - m, k - m) : coefficientBinomial(N_CARTES - m, k);
  return { famille: "C", sousType: "cartesContraintes", formule: "combinaison", resultat, n: N_CARTES, k, m, varianteCartes };
}

// ============================================================================
// Mots, lettres distinctes.
// ============================================================================

export function construireMotsLettresDistinctes(): ExerciceDenombrementC {
  const n = tirerEntier(4, 7);
  return { famille: "C", sousType: "motsLettresDistinctes", formule: "permutation", resultat: factorielle(n), n };
}

// ============================================================================
// Mots, répétition autorisée.
// ============================================================================

export function construireMotsRepetition(): ExerciceDenombrementC {
  const n = tirerEntier(2, 5);
  const k = tirerEntier(2, 4);
  return { famille: "C", sousType: "motsRepetition", formule: "puissance", resultat: n ** k, n, k };
}

// ============================================================================
// Mots, position fixée.
// ============================================================================

export function construireMotsPositionFixee(): ExerciceDenombrementC {
  const n = tirerEntier(5, 8);
  const k = tirerParmi([1, 2] as const);
  const lettres = tirerLettresDistinctes(n);
  const positionsFixees = tirerPositionsDistinctes(k, n);
  const lettresFixees = positionsFixees.map((position, i) => ({ position, lettre: lettres[i] }));
  const resultat = arrangements(n - k, n - k); // = (n-k)! — arrangement de toutes les positions restantes
  return { famille: "C", sousType: "motsPositionFixee", formule: "permutation", resultat, n, k, lettresFixees };
}

function tirerPositionsDistinctes(count: number, n: number): number[] {
  const disponibles = Array.from({ length: n }, (_, i) => i + 1);
  const resultat: number[] = [];
  while (resultat.length < count) {
    const p = tirerParmi(disponibles.filter((x) => !resultat.includes(x)));
    resultat.push(p);
  }
  return resultat.sort((a, b) => a - b);
}

// ============================================================================
// Dispatch.
// ============================================================================

const CONSTRUCTEURS_C: (() => ExerciceDenombrementC)[] = [construireCartesContraintes, construireMotsLettresDistinctes, construireMotsRepetition, construireMotsPositionFixee];

export function construireFamilleC(): ExerciceDenombrementC {
  return tirerParmi(CONSTRUCTEURS_C)();
}
