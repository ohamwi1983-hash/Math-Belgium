import type { ExerciceInjectiviteFonctions } from "../../../core6e/injectiviteFonctions.types";
import { ensemblePrivePoints, ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { construireOptionsCombobox } from "../distracteurs";
import { formatPuissanceAffineLatex } from "../formatFLatex";
import { racineReelle } from "../racineReelle";

/**
 * Famille a) f(x) = (ax+b)^n — voir en-tête de `core6e/injectiviteFonctions.types.ts` pour le rôle
 * du pivot/des 2 branches.
 *
 * - n impair (positif ou négatif) : TOUJOURS injective.
 *   - n>0 : domaine=ℝ, image=ℝ.
 *   - n<0 : domaine=ℝ\{pivot} (pôle), image=ℝ\{0}.
 * - n pair (positif ou négatif) : JAMAIS injective, symétrique par rapport au pivot x=-b/a.
 *   - n>0 : domaine=ℝ, image=[0;+∞[.
 *   - n<0 : domaine=ℝ\{pivot}, image=]0;+∞[.
 *
 * Réciproque (n pair) : y=(ax+b)^n ⟹ ax+b = ±y^(1/n) ⟹ x=(±y^(1/n)-b)/a. Le signe du bon côté du
 * pivot dépend du signe de a — voir le calcul de `s` ci-dessous : sur la branche `droite` (x≥pivot),
 * ax+b = a(x-pivot) est du signe de a ; sur la branche `gauche`, il est du signe opposé.
 */
const CANDIDATS_N = [-4, -3, -2, 2, 3, 4] as const;

export function construirePuissanceAffine(): ExerciceInjectiviteFonctions {
  const a = tirerEntierNonNul(-5, 5);
  const b = tirerEntierNonNul(-5, 5);
  const n = tirerParmi(CANDIDATS_N);
  const pivot = -b / a;
  const impair = n % 2 !== 0;
  const parametres = { famille: "puissanceAffine" as const, a, b, n };
  const fLatex = `f(x) = ${formatPuissanceAffineLatex(a, b, n)}`;
  const fReference = (x: number) => Math.pow(a * x + b, n);

  if (impair) {
    const domaine = n > 0 ? ensembleReel() : ensemblePrivePoints([pivot]);
    const image = n > 0 ? ensembleReel() : ensemblePrivePoints([0]);
    const fInverse = (y: number) => (racineReelle(y, n) - b) / a;
    return {
      parametres,
      fLatex,
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

  // n pair : jamais injective, symétrique en x=pivot.
  const domaine = n > 0 ? ensembleReel() : ensemblePrivePoints([pivot]);
  const inclus = n > 0; // n<0 : le pôle (pivot) est exclu, bornes ouvertes des 2 côtés.
  const intervalleGauche = ensembleUnMorceau(versLeBasJusque(pivot, inclus));
  const intervalleDroite = ensembleUnMorceau(versLeHautDepuis(pivot, inclus));
  const image = n > 0 ? ensembleUnMorceau(versLeHautDepuis(0, true)) : ensembleUnMorceau(versLeHautDepuis(0, false));
  const s = Math.sign(a);
  const fInverseDroite = (y: number) => {
    if (y < 0) return NaN;
    return (s * Math.pow(y, 1 / n) - b) / a;
  };
  const fInverseGauche = (y: number) => {
    if (y < 0) return NaN;
    return (-s * Math.pow(y, 1 / n) - b) / a;
  };

  return {
    parametres,
    fLatex,
    domaine,
    injective: false,
    pivot,
    intervalleGauche,
    intervalleDroite,
    image,
    fReference,
    fInverseGauche,
    fInverseDroite,
    optionsX: construireOptionsCombobox([intervalleGauche, intervalleDroite]),
    optionsY: construireOptionsCombobox([image]),
  };
}
