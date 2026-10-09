import type { AxeCaracteristique, ExerciceFamilleD } from "../../core6e/equationConiqueCaracteristiques.types";
import type { NatureConique } from "../../core6e/identificationConiques.types";
import { reduireFraction, tirerEntier, tirerParmi, tirerSigne } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille D de `6gen59` : hyperbole depuis UNE asymptote + un autre
 * élément (sommet, foyer, ou distance focale seule).
 *
 * - Sous-type `sommet` : `a` connu DIRECTEMENT, `b` déduit du rapport de pente — aucun triplet
 *   pythagoricien nécessaire (`c` n'intervient jamais dans ce sous-type, voir
 *   `core6e/equationConiqueCaracteristiques.types.ts`).
 * - Sous-types `foyer`/`distanceFocale` : `c` connu, `a` et `b` à séparer via le système
 *   `{rapport connu, c²=a²+b²}` — construits ici depuis un TRIPLET PYTHAGORICIEN PRIMITIF mis à
 *   l'échelle (`a=p·t`, `b=q·t`, `c=r·t`), qui garantit `a`,`b`,`c` ENTIERS EXACTS simultanément
 *   (jamais de racine à afficher) tout en gardant `pente` (rapport `b/a` ou `a/b`) une fraction
 *   réduite EXACTE — propriété clé d'un triplet PRIMITIF : ses 2 pattes sont toujours premières
 *   entre elles, donc `q/p` (ou `p/q`) est déjà sous forme réduite.
 *
 * PIÈGE CENTRAL (mission) : la pente correspond à `b/a` si l'axe transverse est HORIZONTAL
 * (`x²/a²-y²/b²=1`), mais à `a/b` si VERTICAL (`y²/a²-x²/b²=1`) — jamais l'inverse. `pente` est donc
 * calculée ICI selon `axeTransverse`, jamais une constante figée.
 */

const TRIPLETS_PYTHAGORICIENS: [number, number, number][] = [
  [3, 4, 5],
  [5, 12, 13],
  [8, 15, 17],
  [7, 24, 25],
];

export interface OverridesFamilleD {
  sousType?: "sommet" | "foyer" | "distanceFocale";
  axeTransverse?: AxeCaracteristique;
}

export function construireFamilleD(overrides: OverridesFamilleD = {}): ExerciceFamilleD {
  const sousType = overrides.sousType ?? tirerParmi(["sommet", "foyer", "distanceFocale"] as const);
  const axeTransverse = overrides.axeTransverse ?? tirerParmi(["horizontal", "vertical"] as const);
  const signe = tirerSigne();

  let a: number;
  let b: number;
  let c: number;

  if (sousType === "sommet") {
    const [pRatio, qRatio] = tirerParmi([
      [2, 3],
      [3, 4],
      [1, 2],
      [3, 5],
      [4, 5],
    ] as const);
    const t = tirerEntier(2, 4);
    a = pRatio * t;
    b = qRatio * t;
    c = Math.sqrt(a * a + b * b);
  } else {
    const [p, q, r] = tirerParmi(TRIPLETS_PYTHAGORICIENS);
    const t = tirerEntier(1, 2);
    a = p * t;
    b = q * t;
    c = r * t;
  }

  const pente = axeTransverse === "horizontal" ? reduireFraction(b, a) : reduireFraction(a, b);
  const nature: NatureConique = { type: "hyperbole", axe: axeTransverse };

  const base: Pick<ExerciceFamilleD, "famille" | "sousType" | "axeTransverse" | "a" | "b" | "c" | "pente" | "signe" | "nature"> = {
    famille: "D",
    sousType,
    axeTransverse,
    a,
    b,
    c,
    pente,
    signe,
    nature,
  };

  if (sousType === "sommet") {
    const sommet = axeTransverse === "horizontal" ? { x: signe * a, y: 0 } : { x: 0, y: signe * a };
    return { ...base, sommet };
  }
  if (sousType === "foyer") {
    const foyer = axeTransverse === "horizontal" ? { x: signe * c, y: 0 } : { x: 0, y: signe * c };
    return { ...base, foyer };
  }
  return { ...base, distanceFocale: 2 * c };
}
