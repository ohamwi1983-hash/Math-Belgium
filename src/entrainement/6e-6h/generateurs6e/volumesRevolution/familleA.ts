import type { ExerciceVolumeA, TermeDeveloppe, TypeVolumeA } from "../../core6e/volumesRevolution.types";
import type { TermeA } from "../../core6e/calculPrimitives.types";
import { evaluerTermeA } from "../calculPrimitives/familles/A";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../calculPrimitives/aleatoire";
import { evaluerDeveloppe, primitiverDeveloppe } from "./termeDeveloppe";
import { carreTermes } from "./polynome";

/**
 * Couche A (6e) — génération, famille A ("Volume par rotation d'une courbe seule, bornes
 * données") de `6gen27`. 3 techniques de primitive déjà connues (spec) — f(x) TOUJOURS un vrai
 * BINÔME pour "polynomiale"/"exponentielle" (a·x+b / a·e^x+b, coefficients non nuls) pour forcer un
 * développement de carré authentique (a·u+b)²=a²u²+2ab·u+b² — jamais un simple monôme, qui rendrait
 * "développer" trivial. "trigonometrique" reste un MONÔME PUR (a·cos(x), sans terme constant) : la
 * technique attendue y est l'identité cos²x=(1+cos2x)/2, pas une expansion binomiale — ajouter un
 * terme constant mélangerait les 2 techniques dans un seul écran, hors de la portée de la spec.
 *
 * "polynomiale" réutilise `carreTermes` (élévation au carré générique via convolution polynomiale,
 * `polynome.ts` de CE générateur) — le carré d'un binôme affine reste TOUJOURS `TermeA` pur
 * (puissance/constante), donc `developpe` y est literally un `TermeA[]`, valide comme
 * `TermeDeveloppe[]` (union). "exponentielle"/"trigonometrique" construisent leur développement à
 * la main (2-3 termes, formules fermées immédiates) — voir `termeDeveloppe.ts` pour la
 * justification des 2 formes `expRate2`/`cosRate2`.
 */

function tirerBornesDistinctesOrdonnees(min: number, max: number): [number, number] {
  let a = tirerEntier(min, max);
  let b = tirerEntier(min, max);
  while (b === a) b = tirerEntier(min, max);
  return a < b ? [a, b] : [b, a];
}

function finaliser(type: TypeVolumeA, termes: TermeA[], developpe: TermeDeveloppe[], a: number, b: number): ExerciceVolumeA {
  return {
    famille: "A",
    type,
    termes,
    a,
    b,
    developpe,
    fReference: (x) => termes.reduce((acc, t) => acc + evaluerTermeA(t, x), 0),
    developpeReference: (x) => evaluerDeveloppe(developpe, x),
    primitiveDeveloppeReference: (x) => primitiverDeveloppe(developpe, x),
  };
}

export function construireFamilleVolumeA_Polynomiale(): ExerciceVolumeA {
  const coefA = tirerEntierNonNul(-4, 4);
  const coefB = tirerEntierNonNul(-4, 4);
  const termes: TermeA[] = [
    { type: "puissance", coef: coefA, n: 1 },
    { type: "constante", coef: coefB },
  ];
  const developpe: TermeDeveloppe[] = carreTermes(termes);
  const [a, b] = tirerBornesDistinctesOrdonnees(-3, 3);
  return finaliser("polynomiale", termes, developpe, a, b);
}

export function construireFamilleVolumeA_Exponentielle(): ExerciceVolumeA {
  const coefA = tirerEntierNonNul(-3, 3);
  const coefB = tirerEntierNonNul(-3, 3);
  const termes: TermeA[] = [
    { type: "expX", coef: coefA },
    { type: "constante", coef: coefB },
  ];
  const developpe: TermeDeveloppe[] = [
    { type: "expRate2", coef: coefA * coefA },
    { type: "expX", coef: 2 * coefA * coefB },
    { type: "constante", coef: coefB * coefB },
  ];
  const [a, b] = tirerBornesDistinctesOrdonnees(-2, 2);
  return finaliser("exponentielle", termes, developpe, a, b);
}

export function construireFamilleVolumeA_Trigonometrique(): ExerciceVolumeA {
  const coefA = tirerEntierNonNul(-4, 4);
  const termes: TermeA[] = [{ type: "cosX", coef: coefA }];
  const carre = coefA * coefA;
  const developpe: TermeDeveloppe[] = [
    { type: "constante", coef: carre / 2 },
    { type: "cosRate2", coef: carre / 2 },
  ];
  // Mêmes bornes sûres que 6gen26 famille A "trigonometrique" (⊂ (-π/2,π/2)) — sans intérêt ici
  // (cos(x) est défini partout, aucune contrainte de domaine), reprises par cohérence stylistique.
  const [a, b] = tirerBornesDistinctesOrdonnees(-1, 1);
  return finaliser("trigonometrique", termes, developpe, a, b);
}

/** Tirage équiprobable du type de courbe. */
export function construireFamilleVolumeA(): ExerciceVolumeA {
  const type = tirerParmi(["polynomiale", "exponentielle", "trigonometrique"] as const);
  if (type === "polynomiale") return construireFamilleVolumeA_Polynomiale();
  if (type === "exponentielle") return construireFamilleVolumeA_Exponentielle();
  return construireFamilleVolumeA_Trigonometrique();
}
