import type { AngleRemarquable } from "../../core6e/formeTrigonometrique.types";
import { pgcd } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — arithmétique EXACTE sur des angles multiples rationnels de π, pour `6gen37`.
 * `pgcd` réutilisé tel quel depuis `generateurs6e/calculPrimitives/aleatoire.ts` (Couche A ↔ Couche
 * A libre — CLAUDE.md).
 *
 * Toute construction d'angle (somme, différence, multiple entier) passe par `angleDepuisFraction`,
 * qui réduit la fraction `p/q` ET ramène l'angle à sa valeur PRINCIPALE dans `(-π;π]` — jamais
 * `[0;2π[` (à la différence de `BANQUE_16_POINTS`, chapitre 1) : ce choix aligne directement la
 * représentation sur ce que produit `Math.atan2` (utilisé par `calculerArgument`,
 * `familleA.ts`) et sur la convention mathématique usuelle d'"argument principal" enseignée pour ce
 * chapitre — jamais de conversion aller-retour entre les deux conventions.
 */

function latexAngle(num: number, den: number): string {
  if (num === 0) return "0";
  const signe = num < 0 ? "-" : "";
  const n = Math.abs(num);
  if (den === 1) return n === 1 ? `${signe}\\pi` : `${signe}${n}\\pi`;
  return n === 1 ? `${signe}\\frac{\\pi}{${den}}` : `${signe}\\frac{${n}\\pi}{${den}}`;
}

/** `p/q` bruts (dénominateur `q` strictement positif, numérateur `p` de signe quelconque, PAS
 * nécessairement déjà réduits) → angle PRINCIPAL réduit dans `(-π;π]`, fraction irréductible. */
export function angleDepuisFraction(pBrut: number, qBrut: number): AngleRemarquable {
  if (qBrut <= 0) throw new Error("angleDepuisFraction : q doit être strictement positif");
  // Ramène p dans [0, 2q) puis dans (-q, q] — l'intervalle "demi-tour" correspondant à (-π;π] une
  // fois multiplié par π/q.
  let p = ((pBrut % (2 * qBrut)) + 2 * qBrut) % (2 * qBrut);
  if (p > qBrut) p -= 2 * qBrut;
  const g = pgcd(Math.abs(p), qBrut); // pgcd(0,q)=q (preuve : boucle d'Euclide standard) → réduit bien p=0 à q=1.
  const pr = p / g;
  const qr = qBrut / g;
  return { p: pr, q: qr, latex: latexAngle(pr, qr), numerique: (pr / qr) * Math.PI };
}

/** Somme (ou différence si `signe=-1`) de 2 angles exacts, réduite à la valeur principale — utilisé
 * par la famille B (produit/quotient de modules-arguments) et la famille E (α±β). */
export function additionnerAngles(a: AngleRemarquable, b: AngleRemarquable, signe: 1 | -1 = 1): AngleRemarquable {
  const num = a.p * b.q + signe * b.p * a.q;
  const den = a.q * b.q;
  return angleDepuisFraction(num, den);
}

/** `n·angle`, réduit à la valeur principale — utilisé par la famille B (puissance) et la famille C
 * (De Moivre, écran 2). */
export function multiplierAngleParEntier(angle: AngleRemarquable, n: number): AngleRemarquable {
  return angleDepuisFraction(angle.p * n, angle.q);
}
