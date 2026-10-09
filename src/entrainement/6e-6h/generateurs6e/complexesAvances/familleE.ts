import type { AffixeSimple, ExerciceComplexesE, StatutRelationE } from "../../core6e/complexesAvances.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille E ("Parallélisme et perpendicularité via l'argument d'un
 * rapport") de `6gen42`, chapitre 7 "Nombres complexes" (générateur de clôture) — la famille la plus
 * directe : réutilise TEL QUEL `calculerModule`/`calculerArgument` (`formeTrigonometrique/
 * familleA.ts`, 6gen37) sur le rapport `(zD-zC)/(zB-zA)`.
 *
 * ============================================================================
 * **Construction "depuis la cible" — les 3 statuts, TOUJOURS atteignables**
 * ============================================================================
 * `(zB-zA)=(p,q)` (vecteur directeur, entier non nul). Construction de `(zD-zC)` selon le statut
 * VOULU :
 * - `paralleles` : `zD-zC=t·(p,q)`, `t` entier non nul — le rapport vaut EXACTEMENT `t` (réel).
 * - `perpendiculaires` : `zD-zC=t·(-q,p)` (rotation de 90°) — le rapport vaut EXACTEMENT `t·i`
 *   (imaginaire pur).
 * - `aucun` : `zD-zC` un vecteur entier arbitraire, retiré s'il tombe accidentellement dans un des 2
 *   cas ci-dessus (rapport ni réel ni imaginaire pur, VÉRIFIÉ après coup, jamais supposé).
 * Le rapport `(zD-zC)/(zB-zA)` (division de 2 entiers de Gauss) est TOUJOURS rationnel — jamais de
 * `sqrt` nécessaire pour l'écran 1 (`moteur6e/expressionComplexe.ts` n'en a aucun). Son ARGUMENT
 * (écran 2), lui, n'est un angle remarquable EXACT que pour `paralleles`/`perpendiculaires` (0/π ou
 * ±π/2) — pour `aucun`, l'argument générique n'est PAS un multiple rationnel de π ; `calculerArgument`
 * (6gen37) retombe alors sur son fallback DÉCIMAL documenté (`angleDecimalFallback`, jusqu'ici jamais
 * atteint en production par les 5 familles de 6gen37 — la spec E marque le PREMIER générateur qui
 * l'exerce réellement). Écran 2 reste vérifiable : `diagnostiquerValeur` compare une valeur NUMÉRIQUE
 * (tolérance `0,01`), acceptant aussi bien une expression `atan(...)` exacte qu'une valeur décimale.
 *
 * ============================================================================
 * **Couverture des 3 statuts — testée exhaustivement** (voir `familleE.test.ts`, "couvre les 3
 * statuts")
 * ============================================================================
 */

const STATUTS: StatutRelationE[] = ["paralleles", "perpendiculaires", "aucun"];

function tirerVecteurNonNul(min: number, max: number): [number, number] {
  let p = 0;
  let q = 0;
  do {
    p = tirerEntier(min, max);
    q = tirerEntier(min, max);
  } while (p === 0 && q === 0);
  return [p, q];
}

function ajouter(z: AffixeSimple, p: number, q: number): AffixeSimple {
  return { a: z.a + p, b: z.b + q };
}

export function construireFamilleE(statutForce?: StatutRelationE): ExerciceComplexesE {
  const statut = statutForce ?? tirerParmi(STATUTS);

  const zA: AffixeSimple = { a: tirerEntier(-4, 4), b: tirerEntier(-4, 4) };
  const [p, q] = tirerVecteurNonNul(-4, 4);
  const zB = ajouter(zA, p, q);

  const zC: AffixeSimple = { a: tirerEntier(-4, 4), b: tirerEntier(-4, 4) };
  let zD: AffixeSimple;

  if (statut === "paralleles") {
    const t = tirerEntierNonNul(-3, 3);
    zD = ajouter(zC, t * p, t * q);
  } else if (statut === "perpendiculaires") {
    const t = tirerEntierNonNul(-3, 3);
    zD = ajouter(zC, -t * q, t * p);
  } else {
    // "aucun" — vecteur arbitraire, retiré s'il tombe accidentellement parallèle ou perpendiculaire.
    let dp = 0;
    let dq = 0;
    let ok = false;
    do {
      [dp, dq] = tirerVecteurNonNul(-4, 4);
      // Parallèle ⟺ déterminant nul. Perpendiculaire ⟺ produit scalaire nul.
      const determinant = dp * q - dq * p;
      const produitScalaire = dp * p + dq * q;
      ok = determinant !== 0 && produitScalaire !== 0;
    } while (!ok);
    zD = ajouter(zC, dp, dq);
  }

  return { famille: "E", zA, zB, zC, zD, statut };
}
