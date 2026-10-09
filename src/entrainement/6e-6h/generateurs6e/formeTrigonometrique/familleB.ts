import type { ExerciceFormeTrigB, ExerciceFormeTrigB_ProduitQuotient, ExerciceFormeTrigB_Puissance } from "../../core6e/formeTrigonometrique.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { additionnerAngles, multiplierAngleParEntier } from "./angles";
import { tirerZAvecAngleRemarquable } from "./familleA";

/**
 * Couche A (6e) — génération, famille B ("Module et argument via les propriétés") de `6gen37`.
 * `z1`/`z2`/`z` réutilisent `tirerZAvecAngleRemarquable` (`familleA.ts`, Couche A ↔ Couche A libre) —
 * "module/argument propres" garanti par construction. Combinaison via les propriétés EXACTES
 * (`additionnerAngles`/`multiplierAngleParEntier`, `angles.ts`) — jamais de développement algébrique
 * du produit/quotient/puissance complet (ce serait exactement le piège que l'écran 2 fait éviter,
 * voir spec).
 *
 * `rResultat` (quotient) peut être NON ENTIER (r1/r2) — sans conséquence : l'élève tape un nombre
 * réel (évaluateur `moteur6e/expressionExponentielle.ts`, fractions décimales/`num/den` acceptées
 * nativement), jamais une forme a+bi.
 */

const SOUS_TYPES = ["produit", "quotient", "puissance"] as const;
const EXPOSANTS_PUISSANCE = [2, 3, 4] as const;

function memeAngle(a: { p: number; q: number }, b: { p: number; q: number }): boolean {
  return a.p === b.p && a.q === b.q;
}

export function construireFamilleBProduitQuotient(sousType: "produit" | "quotient"): ExerciceFormeTrigB_ProduitQuotient {
  const z1 = tirerZAvecAngleRemarquable();
  let z2 = tirerZAvecAngleRemarquable();
  // Évite un facteur 2 dégénéré (rigoureusement identique à z1, r ET angle) — retirage borné, jamais
  // bloquant (16 angles × 4 modules = 64 combinaisons, collision improbable mais possible).
  let tentatives = 0;
  while (z2.r === z1.r && memeAngle(z2.angle, z1.angle) && tentatives < 20) {
    z2 = tirerZAvecAngleRemarquable();
    tentatives++;
  }
  const rResultat = sousType === "produit" ? z1.r * z2.r : z1.r / z2.r;
  const angleResultat = additionnerAngles(z1.angle, z2.angle, sousType === "produit" ? 1 : -1);
  return { famille: "B", sousType, z1, z2, rResultat, angleResultat };
}

export function construireFamilleBPuissance(): ExerciceFormeTrigB_Puissance {
  const z = tirerZAvecAngleRemarquable();
  const n = tirerParmi(EXPOSANTS_PUISSANCE);
  const rResultat = Math.pow(z.r, n);
  const angleResultat = multiplierAngleParEntier(z.angle, n);
  return { famille: "B", sousType: "puissance", z, n, rResultat, angleResultat };
}

export function construireFamilleB(): ExerciceFormeTrigB {
  const sousType = tirerParmi(SOUS_TYPES);
  if (sousType === "puissance") return construireFamilleBPuissance();
  return construireFamilleBProduitQuotient(sousType);
}
