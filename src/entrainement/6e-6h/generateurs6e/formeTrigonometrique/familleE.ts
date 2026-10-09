import type { ExerciceFormeTrigE, OperationE } from "../../core6e/formeTrigonometrique.types";
import { tirerParmi } from "../calculPrimitives/aleatoire";
import { additionnerAngles } from "./angles";
import { POINTS_REMARQUABLES } from "./familleA";

/**
 * Couche A (6e) — génération, famille E ("Déduire des valeurs trigonométriques exactes") de
 * `6gen37`.
 *
 * ============================================================================
 * **`α,β` toujours tirés du "quart de famille" `{π/4,3π/4,5π/4,7π/4}` — jamais un autre sous-ensemble
 * d'angles remarquables**
 * ============================================================================
 * `z1=e^{iα}`, `z2=e^{iβ}` sont de MODULE 1 FIXE (aucun `r` disponible pour "absorber" un radical,
 * à la différence de la famille C) — l'écran 2 (forme a+bi développée) doit donc TOMBER PILE sur
 * `cos(résultat)+i·sin(résultat)` avec `cos`/`sin` ∈ `{0,±1}` (type AXE), jamais `±√2/2` (type
 * quart), pour rester TYPABLE (`moteur6e/expressionComplexe.ts` n'a aucune fonction `sqrt`, voir son
 * en-tête). En écrivant `α=p_α·π/4`, `β=p_β·π/4` avec `p_α,p_β` IMPAIRS (c'est la définition même du
 * "quart de famille", par opposition à `0,π/2,π,3π/2` qui sont pairs) : `p_α+p_β` et `p_α−p_β` sont
 * TOUJOURS pairs (impair±impair=pair) ⟹ `α+β` (produit) ET `α−β` (quotient) sont TOUJOURS des
 * multiples PAIRS de `π/4`, donc de type AXE — vrai pour LES DEUX opérations, sans avoir besoin de
 * choisir l'opération en fonction de la paire `(α,β)` tirée (contrairement à un tirage qui
 * mélangerait axe et quart). Démontré par test (`familleE.test.ts`, tous les cas `(α,β,opération)`
 * couverts par tirage massif).
 */

const ANGLES_QUART = POINTS_REMARQUABLES.filter((pt) => pt.angle.q === 4).map((pt) => pt.angle);

const OPERATIONS: OperationE[] = ["produit", "quotient"];

export function construireFamilleE(): ExerciceFormeTrigE {
  const alpha = tirerParmi(ANGLES_QUART);
  let beta = tirerParmi(ANGLES_QUART);
  while (beta.p === alpha.p) {
    beta = tirerParmi(ANGLES_QUART);
  }
  const operation = tirerParmi(OPERATIONS);
  const angleResultat = additionnerAngles(alpha, beta, operation === "produit" ? 1 : -1);
  // Type AXE garanti (voir en-tête) : cos/sin ∈ {0,1,-1} exactement, arrondi sûr (erreur flottante
  // négligeable, jamais assez grande pour franchir 0.5).
  const aFinal = Math.round(Math.cos(angleResultat.numerique));
  const bFinal = Math.round(Math.sin(angleResultat.numerique));
  return { famille: "E", operation, alpha, beta, angleResultat, aFinal, bFinal };
}
