/**
 * Couche B (5e) — arithmétique EXACTE sur fractions signées (`FractionQ`, `core5e/suitesGeometriques.types.ts`),
 * RÉPLIQUE de `generateurs5e/suitesGeometriques/fraction.ts` (Couche A) — jamais importée depuis
 * là-bas (un dossier moteur n'importe jamais un dossier generateurs, CLAUDE.md), partagée en
 * revanche librement entre fichiers `moteur5e/` (Couche B <-> Couche B, CLAUDE.md). Voir
 * `prompt5gen155gen16arithmetiqueexacte.md` : toute valeur DÉRIVÉE de q reste exacte jusqu'au SEUL
 * point de sortie légitime vers un flottant (`fractionQVersNombre`), réservé à la comparaison
 * tolérante avec la saisie décimale/fractionnaire libre de l'élève.
 */
import type { FractionQ } from "../core5e/suitesGeometriques.types";

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

export function fractionQ(num: number, den: number): FractionQ {
  if (den === 0) throw new Error("fractionQ : dénominateur nul");
  const signe = den < 0 ? -1 : 1;
  const n = signe * num;
  const d = signe * den;
  const g = pgcd(n, d);
  return { num: n / g, den: d / g };
}

export function entierVersFractionQ(n: number): FractionQ {
  return { num: n, den: 1 };
}

export function multiplierFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  return fractionQ(a.num * b.num, a.den * b.den);
}

export function diviserFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  if (b.num === 0) throw new Error("diviserFractionQ : division par zéro");
  return fractionQ(a.num * b.den, a.den * b.num);
}

export function additionnerFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  return fractionQ(a.num * b.den + b.num * a.den, a.den * b.den);
}

export function soustraireFractionQ(a: FractionQ, b: FractionQ): FractionQ {
  return fractionQ(a.num * b.den - b.num * a.den, a.den * b.den);
}

/** `a^exposant`, exposant ENTIER (positif, négatif ou nul) — jamais une racine. */
export function puissanceFractionQ(a: FractionQ, exposant: number): FractionQ {
  if (exposant === 0) return { num: 1, den: 1 };
  if (exposant < 0) return puissanceFractionQ(diviserFractionQ({ num: 1, den: 1 }, a), -exposant);
  let resultat: FractionQ = { num: 1, den: 1 };
  for (let i = 0; i < exposant; i++) resultat = multiplierFractionQ(resultat, a);
  return resultat;
}

/** SEUL point de sortie vers un flottant — voir en-tête de fichier. */
export function fractionQVersNombre(a: FractionQ): number {
  return a.num / a.den;
}

// ============================================================================
// Formules de la suite géométrique un=u1*q^(n-1), version EXACTE — miroir de
// `generateurs5e/suitesGeometriques/parametres.ts` (formule) croisé avec l'arithmétique ci-dessus.
// ============================================================================

export function termeGeometriqueQ(u1: FractionQ, q: FractionQ, n: number): FractionQ {
  return multiplierFractionQ(u1, puissanceFractionQ(q, n - 1));
}

export function sommeGeometriqueFinieQ(u1: FractionQ, q: FractionQ, n: number): FractionQ {
  if (q.num === q.den) return multiplierFractionQ(entierVersFractionQ(n), u1); // q=1
  const unMoinsQn = soustraireFractionQ(entierVersFractionQ(1), puissanceFractionQ(q, n));
  const unMoinsQ = soustraireFractionQ(entierVersFractionQ(1), q);
  return multiplierFractionQ(u1, diviserFractionQ(unMoinsQn, unMoinsQ));
}
