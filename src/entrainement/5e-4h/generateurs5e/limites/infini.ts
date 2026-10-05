/**
 * Couche A (5e) — famille "limiteInfini" de 5gen20 (x→±∞, comparaison de degrés). Polynômes
 * représentés par leurs coefficients `[c0,c1,...,cDeg]`. `sousCas` choisi EN PREMIER, `degN`/`degD`
 * (et donc TOUTE la nature du résultat) en découlent — jamais un rejet/régénération : le résultat
 * (finie/zéro/infinie, signe) est une conséquence ARITHMÉTIQUE directe de la construction, jamais
 * un tirage séparé susceptible d'être incohérent.
 */
import type { ExerciceLimiteInfini } from "../../core5e/limites.types";
import { entierAleatoire, entierNonNul, reduireFraction } from "./fraction";

function signeDe(n: number): 1 | -1 {
  return n < 0 ? -1 : 1;
}

function tirerSousCas(): "degresEgaux" | "numerateurPlusGrand" | "numerateurPlusPetit" {
  const r = Math.random();
  if (r < 1 / 3) return "degresEgaux";
  if (r < 2 / 3) return "numerateurPlusGrand";
  return "numerateurPlusPetit";
}

/** Coefficients [c0..cDeg], cDeg=coeffDominant (non nul), les autres varient librement (y compris
 * 0, un polynôme réaliste a souvent des termes absents) dans [-5,5]. */
function tirerCoefficients(degre: number, coeffDominant: number): number[] {
  const coeffs = Array.from({ length: degre }, () => entierAleatoire(-5, 5));
  coeffs.push(coeffDominant);
  return coeffs;
}

/** `sousCasForce` — réservé au panneau dev, pour forcer manuellement l'un des 3 sous-cas plutôt que
 * le tirage aléatoire habituel. */
export function genererExerciceLimiteInfini(sousCasForce?: "degresEgaux" | "numerateurPlusGrand" | "numerateurPlusPetit"): ExerciceLimiteInfini {
  const direction: "plus" | "moins" = Math.random() < 0.5 ? "plus" : "moins";
  const degD = entierAleatoire(1, 2);
  const sousCas = sousCasForce ?? tirerSousCas();

  let degN: number;
  if (sousCas === "degresEgaux") degN = degD;
  else if (sousCas === "numerateurPlusGrand") degN = degD + (degD === 2 ? 1 : entierAleatoire(1, 2));
  else degN = degD === 1 ? 0 : entierAleatoire(0, 1);

  const kN = entierNonNul(6);
  const kD = entierNonNul(6);
  const coeffsN = tirerCoefficients(degN, kN);
  const coeffsD = tirerCoefficients(degD, kD);
  const degreResultat = degN - degD;

  const base: Pick<ExerciceLimiteInfini, "famille" | "direction" | "sousCas" | "coeffsN" | "coeffsD" | "degN" | "degD" | "degreResultat" | "ratioCoefficients"> = {
    famille: "limiteInfini",
    direction,
    sousCas,
    coeffsN,
    coeffsD,
    degN,
    degD,
    degreResultat,
    ratioCoefficients: reduireFraction(kN, kD),
  };

  if (sousCas === "degresEgaux") {
    return { ...base, natureLimite: "finie" };
  }
  if (sousCas === "numerateurPlusPetit") {
    return { ...base, natureLimite: "zero" };
  }
  // "numerateurPlusGrand" — signe = signe(kN)·signe(kD), inversé si x→−∞ ET degré résultat impair
  // (piège documenté dans l'aide : le terme dominant en x^impair change de signe avec x, jamais un
  // terme pair).
  const signeBase = (signeDe(kN) * signeDe(kD)) as 1 | -1;
  const inverser = direction === "moins" && degreResultat % 2 === 1;
  return { ...base, natureLimite: "infinie", signeLimiteInfinie: (inverser ? -signeBase : signeBase) as 1 | -1 };
}
