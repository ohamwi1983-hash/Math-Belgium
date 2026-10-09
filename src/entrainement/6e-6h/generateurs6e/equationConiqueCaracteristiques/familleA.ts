import type { AxeCaracteristique, ExerciceFamilleA, ExerciceFamilleA_AxesPerpendiculaires, ExerciceFamilleA_DeuxSommets, ExerciceFamilleA_MemeAxe } from "../../core6e/equationConiqueCaracteristiques.types";
import type { NatureConique } from "../../core6e/identificationConiques.types";
import { tirerEntier, tirerParmi, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille A de `6gen59` : ellipse/hyperbole CENTRÉE À L'ORIGINE, 3
 * sous-types équiprobables (mirroir du patron `identificationConiques/familleA.ts`, 6gen58 : tirage
 * de sous-type À L'INTÉRIEUR de `construireFamilleA`).
 *
 * Toutes les coniques ici sont construites à l'ENDROIT (depuis des caractéristiques a/b/c déjà
 * entières et cohérentes) plutôt que classifiées après-coup — jamais besoin de
 * `classifierConiqueCentree`/`elementsConiqueCentree` (6gen58) : ces fonctions partent d'une
 * ÉQUATION déjà posée, alors qu'ici l'équation est le point d'ARRIVÉE. Le type `NatureConique` et
 * son discriminant `axe` (`core6e/identificationConiques.types.ts`) sont en revanche réutilisés TELS
 * QUELS pour représenter le résultat structuré (voir `nature` de chaque sous-type ci-dessous) — la
 * "réutilisation de la fondation" pour cette famille porte donc sur le TYPE partagé, pas sur les
 * fonctions de classification elles-mêmes (inapplicables dans ce sens de construction).
 */

// ============================================================================
// Sous-type "même axe" — sommet S et foyer F sur le MÊME axe.
// ============================================================================

export interface OverridesMemeAxe {
  natureCible?: "ellipse" | "hyperbole";
  axe?: AxeCaracteristique;
}

export function construireMemeAxe(overrides: OverridesMemeAxe = {}): ExerciceFamilleA_MemeAxe {
  const natureCible = overrides.natureCible ?? tirerParmi(["ellipse", "hyperbole"] as const);
  const axe = overrides.axe ?? tirerParmi(["horizontal", "vertical"] as const);
  const signeS = tirerSigne();
  const signeF = tirerSigne();

  let a: number;
  let c: number;
  if (natureCible === "ellipse") {
    a = tirerEntier(4, 9);
    c = tirerEntier(1, a - 1);
  } else {
    a = tirerEntier(2, 6);
    c = tirerEntier(a + 1, a + 5);
  }
  const bCarre = natureCible === "ellipse" ? a * a - c * c : c * c - a * a;
  const nature: NatureConique = { type: natureCible, axe };

  return { famille: "A", sousType: "memeAxe", axe, natureCible, a, c, signeS, signeF, bCarre, nature };
}

// ============================================================================
// Sous-type "axes perpendiculaires" (ellipse uniquement) — PIÈGE CENTRAL : l'axe du foyer est
// TOUJOURS l'axe principal, le sommet donné est donc le sommet SECONDAIRE (b=|S|).
// ============================================================================

export interface OverridesAxesPerpendiculaires {
  axePrincipal?: AxeCaracteristique;
}

export function construireAxesPerpendiculaires(overrides: OverridesAxesPerpendiculaires = {}): ExerciceFamilleA_AxesPerpendiculaires {
  const axePrincipal = overrides.axePrincipal ?? tirerParmi(["horizontal", "vertical"] as const);
  const signeS = tirerSigne();
  const signeF = tirerSigne();
  const b = tirerEntier(2, 7);
  const c = tirerEntier(1, 6);
  const bCarre = b * b;
  const aCarre = bCarre + c * c;
  const nature: NatureConique = { type: "ellipse", axe: axePrincipal };

  return { famille: "A", sousType: "axesPerpendiculaires", axePrincipal, b, signeS, c, signeF, bCarre, aCarre, nature };
}

// ============================================================================
// Sous-type "2 sommets" (ellipse) — lecture directe, aucun piège de principal/secondaire (aucun
// foyer en jeu).
// ============================================================================

export function construireDeuxSommets(): ExerciceFamilleA_DeuxSommets {
  const signeSommetX = tirerSigne();
  const signeSommetY = tirerSigne();
  let sommetX = tirerEntier(3, 9);
  let sommetY = tirerEntier(3, 9);
  // Jamais égaux (sinon cercle, hors du champ "ellipse" de ce sous-type).
  while (sommetY === sommetX) sommetY = tirerEntier(3, 9);
  const nature: NatureConique = { type: "ellipse", axe: sommetX > sommetY ? "horizontal" : "vertical" };

  return { famille: "A", sousType: "deuxSommets", sommetX, sommetY, signeSommetX, signeSommetY, nature };
}

const CONSTRUCTEURS_A: (() => ExerciceFamilleA)[] = [construireMemeAxe, construireAxesPerpendiculaires, construireDeuxSommets];

export function construireFamilleA(): ExerciceFamilleA {
  return tirerParmi(CONSTRUCTEURS_A)();
}
