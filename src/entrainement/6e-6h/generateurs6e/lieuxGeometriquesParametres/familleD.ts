import { fraction } from "./fraction";
import type { ExerciceLieuxD, ExerciceLieuxD_Fractions, ExerciceLieuxD_Ratio, ExerciceLieuxD_Substitution } from "../../core6e/lieuxGeometriquesParametres.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille D ("Éliminer un paramètre") de `6gen56`. 3 sous-types,
 * chacun choisissant une méthode d'élimination différente (spec) :
 *
 * - "substitution" : x=√t+p (t⩾0), y=qt+r. Isoler t EXIGE d'élever au carré ((x-p)²=t) —
 *   l'ambiguïté de signe est déjà réglée par √t⩾0 dans l'énoncé, mais le carré reste la seule voie
 *   pour éliminer la racine.
 * - "fractions" : x=1/(t+a), y=(t+b)/(t+a). Manipuler la fraction (y=1+(b-a)/(t+a)=1+(b-a)x) évite
 *   d'isoler t explicitement — élimination purement algébrique sur les fractions.
 * - "ratio" : x=a·t³, y=b·t². x^(2)/y^(3) élimine t directement (t⁶ des deux côtés) — bien plus
 *   rapide qu'isoler t=y^(1/2)·(signe) puis substituer dans x=t³ (puissance fractionnaire, signe
 *   ambigu) : c'est LE cas où un rapport bat la substitution directe.
 */

function construireSubstitution(): ExerciceLieuxD_Substitution {
  const p = tirerEntier(-4, 4);
  const q = tirerEntierNonNul(1, 4);
  const r = tirerEntier(-5, 5);
  const coefX = -2 * p;
  const coefConst = p * p;
  const Afinal = q;
  const Bfinal = q * coefX;
  const Cfinal = q * coefConst + r;
  return { famille: "D", sousType: "substitution", p, q, r, coefX, coefConst, Afinal, Bfinal, Cfinal };
}

function construireFractions(): ExerciceLieuxD_Fractions {
  const a = tirerEntier(-4, 4);
  let b = tirerEntier(-4, 4);
  while (b === a) b = tirerEntier(-4, 4);
  return { famille: "D", sousType: "fractions", a, b, pente: b - a };
}

const TRIPLETS_EXPOSANTS: readonly [number, number][] = [
  [2, 3],
  [3, 2],
  [3, 4],
  [4, 3],
];

function construireRatio(): ExerciceLieuxD_Ratio {
  const [expDeT_X, expDeT_Y] = tirerParmi(TRIPLETS_EXPOSANTS);
  const a = tirerEntierNonNul(1, 4);
  const b = tirerEntierNonNul(1, 4);
  // x=a·t^expDeT_X, y=b·t^expDeT_Y. Pour éliminer t (arriver à un même exposant total sur t des 2
  // côtés), on élève x à la puissance expDeT_Y et y à la puissance expDeT_X : t^(expDeT_X*expDeT_Y)
  // des 2 côtés, qui se simplifie.
  const exposantX = expDeT_Y;
  const exposantY = expDeT_X;
  const C = fraction(Math.pow(a, exposantX), Math.pow(b, exposantY));
  return { famille: "D", sousType: "ratio", a, b, exposantX, exposantY, C };
}

export function construireFamilleD(): ExerciceLieuxD {
  return tirerParmi([construireSubstitution, construireFractions, construireRatio] as const)();
}

export { construireFractions, construireRatio, construireSubstitution };
