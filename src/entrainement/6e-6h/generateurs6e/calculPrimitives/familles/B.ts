import type { ExerciceFamilleB, TypeGFamilleB, TypeUFamilleB } from "../../../core6e/calculPrimitives.types";
import { tirerEntier, tirerEntierNonNul, tirerParmi } from "../aleatoire";

/**
 * Couche A (6e) — génération, famille B ("Fonctions composées, ajustement de coefficient") de
 * `6gen23`. Réexporté pour réutilisation en aval : `construireFamilleB`.
 *
 * **Représentation unifiée de u'(x)** : `u'(x) = mCoef · x^expPart`, valable pour les 2 formes de
 * u prévues par la spec —
 * - u affine (mx+n) : u'=m, une CONSTANTE ⇒ mCoef=m, expPart=0 (x^0=1).
 * - u puissance (x^p+c) : u'=p·x^(p-1) ⇒ mCoef=p, expPart=p-1.
 * L'expression affichée est TOUJOURS `k·x^expPart·g(u(x))` — l'ajustement demandé à l'écran 2
 * compare le coefficient affiché `k` à `mCoef` (jamais à l'expression complète u'(x), qui n'est pas
 * toujours une constante) : `facteurAjustement = k/mCoef`, EXACT (potentiellement non entier).
 *
 * **Restriction de génération documentée** : les 2 formes g nécessitant un domaine restreint
 * (`invU`→ln|u|, `invSqrtU`→arcsin(u)) ne sont JAMAIS combinées avec u de type "puissance" — calculer
 * un domaine sûr d'échantillonnage pour u=x^p+c serait significativement plus complexe (racines
 * d'un polynôme de degré p) sans bénéfice pédagogique supplémentaire ; ces 2 formes de g sont donc
 * toujours pairées avec u affine (domaine trivial à calculer algébriquement, voir
 * `moteur6e/verificationCalculPrimitives.ts`).
 */

const TOUS_TYPES_G: TypeGFamilleB[] = ["puissance", "invU", "expU", "cosU", "sinU", "invUsq", "invSqrtU"];
const TYPES_G_DOMAINE_RESTREINT: TypeGFamilleB[] = ["invU", "invSqrtU"];

export function primitiveGB(typeG: TypeGFamilleB, u: number, nG?: number): number {
  switch (typeG) {
    case "puissance":
      return Math.pow(u, (nG as number) + 1) / ((nG as number) + 1);
    case "invU":
      return Math.log(Math.abs(u));
    case "expU":
      return Math.exp(u);
    case "cosU":
      return Math.sin(u);
    case "sinU":
      return -Math.cos(u);
    case "invUsq":
      return Math.atan(u);
    case "invSqrtU":
      return Math.asin(u);
  }
}

export function gB(typeG: TypeGFamilleB, u: number, nG?: number): number {
  switch (typeG) {
    case "puissance":
      return Math.pow(u, nG as number);
    case "invU":
      return 1 / u;
    case "expU":
      return Math.exp(u);
    case "cosU":
      return Math.cos(u);
    case "sinU":
      return Math.sin(u);
    case "invUsq":
      return 1 / (1 + u * u);
    case "invSqrtU":
      return 1 / Math.sqrt(1 - u * u);
  }
}

export function construireFamilleB(): ExerciceFamilleB {
  const typeG = tirerParmi(TOUS_TYPES_G);
  const domaineRestreint = TYPES_G_DOMAINE_RESTREINT.includes(typeG);
  const typeU: TypeUFamilleB = domaineRestreint ? "affine" : tirerParmi(["affine", "puissance"] as const);
  const nG = typeG === "puissance" ? tirerParmi([2, 3, 4] as const) : undefined;

  let mAffine: number | undefined;
  let nAffine: number | undefined;
  let pPuissance: number | undefined;
  let cPuissance: number | undefined;
  let mCoef: number;
  let expPart: number;
  let uReference: (x: number) => number;
  let uPrimeReference: (x: number) => number;

  if (typeU === "affine") {
    mAffine = tirerEntierNonNul(2, 5) * tirerParmi([1, -1] as const);
    nAffine = tirerEntier(-3, 3);
    mCoef = mAffine;
    expPart = 0;
    uReference = (x) => (mAffine as number) * x + (nAffine as number);
    uPrimeReference = () => mAffine as number;
  } else {
    pPuissance = tirerParmi([2, 3] as const);
    cPuissance = tirerEntierNonNul(-2, 2);
    mCoef = pPuissance;
    expPart = pPuissance - 1;
    uReference = (x) => Math.pow(x, pPuissance as number) + (cPuissance as number);
    uPrimeReference = (x) => (pPuissance as number) * Math.pow(x, (pPuissance as number) - 1);
  }

  const exact = Math.random() < 0.5;
  let k: number;
  if (exact) {
    k = mCoef;
  } else {
    let delta = 0;
    do {
      delta = tirerEntierNonNul(-4, 4);
    } while (mCoef + delta === 0 || mCoef + delta === mCoef);
    k = mCoef + delta;
  }
  const facteurAjustement = k / mCoef;

  const integrandeReference = (x: number) => k * Math.pow(x, expPart) * gB(typeG, uReference(x), nG);
  const primitiveReference = (x: number) => facteurAjustement * primitiveGB(typeG, uReference(x), nG);

  return {
    famille: "B",
    sousType: "unique",
    typeG,
    nG,
    typeU,
    mAffine,
    nAffine,
    pPuissance,
    cPuissance,
    k,
    mCoef,
    expPart,
    facteurAjustement,
    uReference,
    uPrimeReference,
    primitiveReference,
    integrandeReference,
  };
}
