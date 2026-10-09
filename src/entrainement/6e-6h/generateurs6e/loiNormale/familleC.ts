import type { ExerciceLoiNormaleC } from "../../core6e/loiNormale.types";
import { arrondi, tirerDecimal } from "./aleatoireDecimal";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { Phi, PhiInverse } from "./tableNormale";

/**
 * Couche A (6e) — génération + logique pure, famille C ("Centrée réduite, sens inverse") de
 * `6gen51`.
 *
 * ============================================================================
 * **Génération de `p`** — TOUJOURS dérivée d'un `Phi(zCible)` interne (jamais un `p` choisi au
 * hasard indépendamment), pour garantir un `t` de réponse plausible et surtout un `p` STRICTEMENT
 * dans `]0;1[`, quel que soit le sous-type — voir chaque fonction `tirer*` ci-dessous.
 *
 * ============================================================================
 * **Écran 1 — design "structuré" (QCM + numérique)**, mirroir famille A/écran 1 : un champ `choix`
 * (identifie LA transformation parmi les 3 sous-types possibles — "cumulee"/"symetrique"/
 * "encadree", les 3 options sont TOUJOURS proposées, indépendamment du sous-type réel de
 * l'exercice — piège central : lire directement `p` sans l'adapter d'abord) + un champ `texte` (la
 * valeur cible `Φ(t)=...` obtenue après transformation, voir `valeurCibleTableC`).
 *
 * ============================================================================
 * **`k` (sous-type "encadree") — `Φ(k)` toujours RECALCULÉE, jamais stockée** (voir en-tête
 * `core6e/loiNormale.types.ts`) : `Φ(k)` est présentée à l'élève comme une DONNÉE du problème
 * (`ui6e/formatLoiNormale.ts` l'affiche dans le bloc données), calculée à la volée via `Phi(e.k)`.
 */

const SOUS_TYPES: ExerciceLoiNormaleC["sousType"][] = ["cumulee", "symetrique", "encadree"];

function tirerPCumulee(): number {
  const zCible = tirerDecimal(-3, 3, 2);
  return arrondi(Phi(zCible), 4);
}

function tirerPSymetrique(): number {
  const zCible = tirerDecimal(0.1, 3, 2);
  return arrondi(Phi(zCible) - 0.5, 4);
}

function tirerEncadree(): { p: number; k: number } {
  const k = tirerDecimal(0.5, 2.5, 2);
  const ecart = tirerDecimal(0.2, 3, 2);
  const zCible = Math.max(-3, k - ecart);
  const p = arrondi(Phi(k) - Phi(zCible), 4);
  return { p, k };
}

export function construireFamilleC(): ExerciceLoiNormaleC {
  const sousType = tirerParmi(SOUS_TYPES);
  if (sousType === "cumulee") return { famille: "C", sousType, p: tirerPCumulee() };
  if (sousType === "symetrique") return { famille: "C", sousType, p: tirerPSymetrique() };
  const { p, k } = tirerEncadree();
  return { famille: "C", sousType, p, k };
}

/** La valeur cible `Φ(t)=...` à chercher dans la table, après reformulation — écran 1. */
export function valeurCibleTableC(e: ExerciceLoiNormaleC): number {
  if (e.sousType === "cumulee") return e.p;
  if (e.sousType === "symetrique") return e.p + 0.5;
  return Phi(e.k) - e.p;
}

/** `t` tel que `Φ(t)` égale la cible correcte de l'écran 1 — écran 2, lecture inversée de la
 * table (`PhiInverse`, voir en-tête `tableNormale.ts`). */
export function valeurTC(e: ExerciceLoiNormaleC): number {
  return PhiInverse(valeurCibleTableC(e));
}
