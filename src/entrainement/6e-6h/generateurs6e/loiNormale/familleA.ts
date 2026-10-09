import type { ExerciceLoiNormaleA } from "../../core6e/loiNormale.types";
import { tirerDecimal } from "./aleatoireDecimal";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { Phi } from "./tableNormale";

/**
 * Couche A (6e) — génération + logique pure, famille A ("Centrée réduite, sens direct") de
 * `6gen51`, chapitre "Variables aléatoires et lois de probabilités" (premier générateur du
 * chapitre).
 *
 * ============================================================================
 * **Écran 1 — design "structuré multi-parties" (QCM + numérique), PAS un champ numérique libre**
 * ============================================================================
 * L'écran 1 demande de REFORMULER la lecture nécessaire dans la table — jamais un nombre final.
 * Comme tous les évaluateurs de cette plateforme sont des évaluateurs NUMÉRIQUES (jamais de champ
 * "expression symbolique libre" du type "1-Φ(1.5)"), la reformulation est décomposée en 2 champs
 * (mirroir `EtapeChampsCalculAires.tsx`/6gen26, généralisation "texte"+"choix") :
 *   - un champ `choix` : "lecture directe" (z≥0, aucune symétrie) vs "symétrie" (z<0, on lit
 *     Φ(-z) puis on complète — voir `symetrieNecessaire`) ;
 *   - un champ `texte` : la valeur POSITIVE `t=|z|` à chercher dans la table (voir `valeurATableA`).
 * Pour le sous-type "intervalle" (2 bornes), ces 2 champs sont dupliqués (4 champs au total,
 * mirroir famille B/écran 1 de `6gen37` qui avait déjà 4 champs pour produit/quotient).
 *
 * ============================================================================
 * **Pourquoi le "complément" (1-Φ) n'apparaît PAS à l'écran 1, contrairement à l'intuition**
 * ============================================================================
 * Dérivation : quel que soit le sous-type (≤/≥), la probabilité finale s'exprime TOUJOURS via
 * `Φ(z)` seul (`P(Z≤z)=Φ(z)`, `P(Z≥z)=1-Φ(z)`) — le "complément 1-Φ" éventuel est donc une
 * opération de l'ÉCRAN 2 (dépend du sous-type ≤/≥), jamais de l'écran 1 (qui ne dépend que du SIGNE
 * de z, pour amener la table à une entrée positive directe). Écran 1 : uniquement "faut-il la
 * symétrie Φ(z)=1-Φ(-z) pour amener une entrée positive ?" (dépend du signe de z) — écran 2 :
 * "quelle opération sur Φ(z) donne la probabilité demandée ?" (dépend du sous-type). Cette
 * séparation nette correspond exactement aux 2 écrans du spec ("écran 1 : lecture nécessaire" /
 * "écran 2 : valeur finale — simple lecture, complément, ou différence").
 */

const SOUS_TYPES: ExerciceLoiNormaleA["sousType"][] = ["inferieur", "superieur", "intervalle"];

const Z_MIN = -3.09;
const Z_MAX = 3.09;

function tirerZ(): number {
  return tirerDecimal(Z_MIN, Z_MAX, 2);
}

export function construireFamilleA(): ExerciceLoiNormaleA {
  const sousType = tirerParmi(SOUS_TYPES);
  if (sousType === "intervalle") {
    let z1 = tirerZ();
    let z2 = tirerZ();
    if (z1 === z2) z2 += 0.01;
    if (z1 > z2) [z1, z2] = [z2, z1];
    return { famille: "A", sousType, z1, z2 };
  }
  return { famille: "A", sousType, z: tirerZ() };
}

/** `true` si la symétrie `Φ(z)=1-Φ(-z)` est nécessaire pour amener `z` à une entrée POSITIVE
 * directe de la table (`z<0`) — voir en-tête de fichier. */
export function symetrieNecessaire(z: number): boolean {
  return z < 0;
}

/** La valeur POSITIVE à chercher dans la table pour un `z` donné — toujours `|z|`. */
export function valeurATableA(z: number): number {
  return Math.abs(z);
}

/** La probabilité finale demandée (écran 2) — TOUJOURS calculée directement via `Phi` (jamais par
 * recomposition manuelle "table + complément", cette dernière étant le TRAVAIL de l'élève, pas la
 * vérité de référence de la plateforme — voir en-tête `tableNormale.ts`). */
export function probabiliteFinaleA(e: ExerciceLoiNormaleA): number {
  if (e.sousType === "intervalle") return Phi(e.z2) - Phi(e.z1);
  return e.sousType === "inferieur" ? Phi(e.z) : 1 - Phi(e.z);
}
