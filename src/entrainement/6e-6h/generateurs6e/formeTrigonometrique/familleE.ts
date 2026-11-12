import type { ValeurExacte } from "../../core6e/cyclometrique.types";
import type { AngleRemarquable, ExerciceFormeTrigE, OperationE } from "../../core6e/formeTrigonometrique.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { additionnerAngles, angleDepuisFraction } from "./angles";

/**
 * Couche A (6e) — génération, famille E ("Déduire des valeurs trigonométriques exactes") de
 * `6gen37`.
 *
 * Refonte audit 6e ch. 5 (décision E) : l'ancienne version tirait α et β dans {π/4, 3π/4, …}, si
 * bien que α ± β tombait TOUJOURS sur un axe (cos/sin ∈ {0 ; ±1}) — rien à « déduire ». Désormais
 * un des deux angles vient de la famille de π/4 (±π/4, ±3π/4), l'autre de la famille de π/6 ou de
 * π/3 (±π/6, ±5π/6, ±π/3, ±2π/3) : en douzièmes de π, le premier est 3·(impair), le second
 * 2·(impair) ou 4·(impair), donc α ± β est un multiple IMPAIR de π/12 — jamais remarquable. cos et
 * sin valent alors (u√6 + v√2)/4 avec u, v ∈ {−1 ; 1} : ils se lisent sur le développement
 * (cos α cos β ∓ sin α sin β, …), jamais sur le cercle.
 */

const FAMILLE_QUART: AngleRemarquable[] = [1, 3, -1, -3].map((p) => angleDepuisFraction(p, 4));
const FAMILLE_SIXIEME_TIERS: AngleRemarquable[] = [
  ...[1, 5, -1, -5].map((p) => angleDepuisFraction(p, 6)),
  ...[1, 2, -1, -2].map((p) => angleDepuisFraction(p, 3)),
];

const OPERATIONS: OperationE[] = ["produit", "quotient"];

/** Valeur exacte (u√6 + v√2)/4 identifiée depuis sa valeur numérique (u, v ∈ {−1 ; 1}). */
export function valeurDouzieme(numerique: number): ValeurExacte {
  let meilleur = { u: 1, v: 1, ecart: Infinity };
  for (const u of [1, -1]) {
    for (const v of [1, -1]) {
      const ecart = Math.abs((u * Math.sqrt(6) + v * Math.SQRT2) / 4 - numerique);
      if (ecart < meilleur.ecart) meilleur = { u, v, ecart };
    }
  }
  const { u, v } = meilleur;
  const valeur = (u * Math.sqrt(6) + v * Math.SQRT2) / 4;
  let latex: string;
  if (u === 1 && v === 1) latex = "\\frac{\\sqrt{6}+\\sqrt{2}}{4}";
  else if (u === 1) latex = "\\frac{\\sqrt{6}-\\sqrt{2}}{4}";
  else if (v === 1) latex = "\\frac{\\sqrt{2}-\\sqrt{6}}{4}";
  else latex = "-\\frac{\\sqrt{6}+\\sqrt{2}}{4}";
  return { latex, numerique: valeur };
}

export function construireFamilleE(): ExerciceFormeTrigE {
  const quart = tirerParmi(FAMILLE_QUART);
  const autre = tirerParmi(FAMILLE_SIXIEME_TIERS);
  const quartEnPremier = Math.random() < 0.5;
  const alpha = quartEnPremier ? quart : autre;
  const beta = quartEnPremier ? autre : quart;
  const operation = tirerParmi(OPERATIONS);
  const angleResultat = additionnerAngles(alpha, beta, operation === "produit" ? 1 : -1);
  return {
    famille: "E",
    operation,
    alpha,
    beta,
    angleResultat,
    cosResultat: valeurDouzieme(Math.cos(angleResultat.numerique)),
    sinResultat: valeurDouzieme(Math.sin(angleResultat.numerique)),
  };
}
