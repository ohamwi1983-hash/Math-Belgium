import type { AxeCaracteristique, ExerciceFamilleB } from "../../core6e/equationConiqueCaracteristiques.types";
import { tirerEntier, tirerParmi } from "./aleatoire";

/**
 * Couche A (6e) — génération, famille B de `6gen59` : parabole `(y-k)²=4p(x-h)` (axe horizontal) ou
 * `(x-h)²=4p(y-k)` (axe vertical), depuis un sommet `(h,k)` (à l'origine ou décentré) et SOIT le
 * foyer directement, SOIT un point de passage — combinaisons librement croisées.
 *
 * `p` toujours tiré SIGNÉ en premier (jamais supposé positif) — PIÈGE CENTRAL de cette famille
 * (mission) : le signe de `p` détermine le sens d'ouverture, et pour le sous-type "point de
 * passage", le point est construit À L'ENVERS depuis `p` déjà connu (`x0=h+p·m²` — voir plus bas)
 * pour garantir qu'il vérifie EXACTEMENT l'équation, jamais approximé.
 */

export interface OverridesFamilleB {
  axe?: AxeCaracteristique;
  donneeType?: "foyer" | "point";
  centree?: boolean;
}

export function construireFamilleB(overrides: OverridesFamilleB = {}): ExerciceFamilleB {
  const axe = overrides.axe ?? tirerParmi(["horizontal", "vertical"] as const);
  const donneeType = overrides.donneeType ?? tirerParmi(["foyer", "point"] as const);
  const centree = overrides.centree ?? tirerParmi([true, false] as const);
  const h = centree ? 0 : tirerEntier(-4, 4);
  const k = centree ? 0 : tirerEntier(-4, 4);
  const pAbs = tirerEntier(1, 4);
  const p = pAbs * tirerParmi([1, -1] as const);

  if (donneeType === "foyer") {
    const foyer = axe === "horizontal" ? { x: h + p, y: k } : { x: h, y: k + p };
    return { famille: "B", axe, h, k, donneeType, foyer, p };
  }

  // Point de passage construit À L'ENVERS depuis p : m·(2|p|) est le décalage sur la variable NON
  // isolée, dont le carré divisé par 4p redonne un décalage ENTIER exact sur l'autre variable
  // (jamais un point approché — voir en-tête de fichier).
  const m = tirerParmi([1, -1, 2, -2] as const);
  const decalageCarre = 2 * pAbs * m;
  const decalageAutre = p * m * m;
  const point = axe === "horizontal" ? { x: h + decalageAutre, y: k + decalageCarre } : { x: h + decalageCarre, y: k + decalageAutre };
  return { famille: "B", axe, h, k, donneeType, point, p };
}
