import type { ExerciceInjectiviteFonctions } from "../../../core6e/injectiviteFonctions.types";
import { ensemblePrivePoints } from "../../ensembleReel";
import { tirerEntierNonNul } from "../aleatoire";
import { construireOptionsCombobox } from "../distracteurs";
import { formatHomographiqueLatex } from "../formatFLatex";

/**
 * Famille e) f(x) = (ax+b)/(cx+d) — TOUJOURS injective sur son domaine (fonction homographique
 * standard, non dégénérée puisque ad≠bc — voir la boucle de tirage ci-dessous, qui redemande tant
 * que ce n'est pas le cas : une homographique dégénérée (ad=bc) serait CONSTANTE, jamais injective).
 *
 * Domaine=ℝ\{-d/c}. Image=ℝ\{a/c}.
 *
 * Réciproque : y=(ax+b)/(cx+d) ⟹ y(cx+d)=ax+b ⟹ x(yc-a)=b-yd ⟹ x=(b-yd)/(yc-a).
 */
export function construireHomographique(): ExerciceInjectiviteFonctions {
  let a: number, b: number, c: number, d: number;
  do {
    a = tirerEntierNonNul(-5, 5);
    b = tirerEntierNonNul(-5, 5);
    c = tirerEntierNonNul(-5, 5);
    d = tirerEntierNonNul(-5, 5);
  } while (a * d === b * c);

  const pole = -d / c;
  const poleImage = a / c;
  const domaine = ensemblePrivePoints([pole]);
  const image = ensemblePrivePoints([poleImage]);
  const fReference = (x: number) => (a * x + b) / (c * x + d);
  const fInverse = (y: number) => (b - y * d) / (y * c - a);

  return {
    parametres: { famille: "homographique", a, b, c, d },
    fLatex: `f(x) = ${formatHomographiqueLatex(a, b, c, d)}`,
    domaine,
    injective: true,
    pivot: null,
    intervalleGauche: domaine,
    intervalleDroite: domaine,
    image,
    fReference,
    fInverseGauche: fInverse,
    fInverseDroite: fInverse,
    optionsX: construireOptionsCombobox([domaine]),
    optionsY: construireOptionsCombobox([image]),
  };
}
