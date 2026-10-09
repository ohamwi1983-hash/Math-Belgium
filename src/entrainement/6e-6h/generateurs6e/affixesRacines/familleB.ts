import type { ExerciceFamilleB } from "../../core6e/affixesRacines.types";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Parallélogramme via affixes") de `6gen35`. Chaque
 * composante de A/B/C est tirée comme un entier DOUBLÉ ∈[-8;8] (voir en-tête
 * `core6e/affixesRacines.types.ts`) — la valeur réelle est donc dans [-4;4] par pas de 0,5,
 * mélangeant naturellement entiers (valeur doublée paire) et demi-entiers (valeur doublée impaire)
 * SANS biais de génération dédié (spec : "coefficients entiers/demi-entiers simples").
 *
 * **Garde-fou dégénérescence** : redessine tant que B=C (donnerait D=A, un parallélogramme aplati
 * où D coïncide avec A) ou A=B (donnerait D=C, même souci) — les 2 seules coïncidences qui rendent
 * la relation D=A+C-B triviale à vérifier sans avoir vraiment appliqué la formule.
 */

const COEFF2_MIN = -8;
const COEFF2_MAX = 8;

function tirerComposante2(): number {
  return tirerEntier(COEFF2_MIN, COEFF2_MAX);
}

export function construireFamilleB(): ExerciceFamilleB {
  let reA2: number, imA2: number, reB2: number, imB2: number, reC2: number, imC2: number;
  do {
    reA2 = tirerComposante2();
    imA2 = tirerComposante2();
    reB2 = tirerComposante2();
    imB2 = tirerComposante2();
    reC2 = tirerComposante2();
    imC2 = tirerComposante2();
  } while ((reB2 === reC2 && imB2 === imC2) || (reA2 === reB2 && imA2 === imB2));

  const reD2 = reA2 + reC2 - reB2;
  const imD2 = imA2 + imC2 - imB2;
  return { famille: "B", reA2, imA2, reB2, imB2, reC2, imC2, reD2, imD2 };
}
