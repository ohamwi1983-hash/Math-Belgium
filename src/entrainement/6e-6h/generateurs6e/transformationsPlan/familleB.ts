import type { ExerciceTransfoB, SousTypeTransfoB } from "../../core6e/transformationsPlan.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { ajouterAffixe, multiplierAffixe, tirerAffixeEntiereRemarquable } from "./partage";

/**
 * Couche A (6e) — génération, famille B ("Construire un point depuis somme/produit, identifier la
 * transformation") de `6gen40`, chapitre 7 "Nombres complexes".
 *
 * A, B tirés via `tirerAffixeEntiereRemarquable` (`partage.ts`) — affixes ENTIÈRES, module/argument
 * EXACTS connus (`rA`/`angleA`, `rB`/`angleB` — voir en-tête `core6e/transformationsPlan.types.ts`
 * pour la raison de cette construction). `zA≠zB` garanti (redemande `zB` sinon) — sinon
 * `zA+zB=2zA`/`zA·zB=zA²` restent valides mais rendent la "reconnaissance" écran 2 dégénérée/moins
 * instructive (translation par soi-même / similitude appliquée à soi-même).
 */

const SOUS_TYPES: SousTypeTransfoB[] = ["somme", "produit"];

export function construireFamilleB(sousTypeForce?: SousTypeTransfoB): ExerciceTransfoB {
  const sousType = sousTypeForce ?? tirerParmi(SOUS_TYPES);
  const tireA = tirerAffixeEntiereRemarquable();
  let tireB = tirerAffixeEntiereRemarquable();
  while (tireB.a === tireA.a && tireB.b === tireA.b) tireB = tirerAffixeEntiereRemarquable();

  const zA = { a: tireA.a, b: tireA.b };
  const zB = { a: tireB.a, b: tireB.b };
  const zResultat = sousType === "somme" ? ajouterAffixe(zA, zB) : multiplierAffixe(zA, zB);

  return { famille: "B", sousType, zA, rA: tireA.r, angleA: tireA.angle, zB, rB: tireB.r, angleB: tireB.angle, zResultat };
}
