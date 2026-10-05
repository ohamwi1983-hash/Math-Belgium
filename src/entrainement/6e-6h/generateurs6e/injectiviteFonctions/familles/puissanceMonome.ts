import type { ExerciceInjectiviteFonctions } from "../../../core6e/injectiviteFonctions.types";
import { ensemblePrivePoints, ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntierNonNul, tirerParmi } from "../aleatoire";
import { construireOptionsCombobox } from "../distracteurs";
import { formatPuissanceMonomeLatex } from "../formatFLatex";
import { racineReelle } from "../racineReelle";

/**
 * Famille c) f(x) = a·x^n + b — pivot TOUJOURS x=0 (symétrie évidente d'un monôme pair).
 *
 * - n impair : TOUJOURS injective. n>0 : domaine=ℝ, image=ℝ. n<0 : domaine=ℝ\{0}, image=ℝ\{b}.
 * - n pair : JAMAIS injective. n>0 : domaine=ℝ, image=[b;+∞[ (a>0) ou ]-∞;b] (a<0). n<0 :
 *   domaine=ℝ\{0}, image=]b;+∞[ (a>0) ou ]-∞;b[ (a<0).
 *
 * Réciproque (n pair) : y=a·x^n+b ⟹ x^n=(y-b)/a=:u ⟹ x=±u^(1/n) — contrairement à la famille a) le
 * signe de branche ne dépend PAS de a (pivot=0, symétrie directe x↔-x), seulement de la branche
 * choisie (droite=x≥0 ⟹ +u^(1/n), gauche=x≤0 ⟹ -u^(1/n)).
 */
const CANDIDATS_N = [-4, -3, -2, 2, 3, 4] as const;

export function construirePuissanceMonome(): ExerciceInjectiviteFonctions {
  const a = tirerEntierNonNul(-5, 5);
  const b = tirerEntierNonNul(-5, 5);
  const n = tirerParmi(CANDIDATS_N);
  const impair = n % 2 !== 0;
  const parametres = { famille: "puissanceMonome" as const, a, b, n };
  const fLatex = `f(x) = ${formatPuissanceMonomeLatex(a, b, n)}`;
  const fReference = (x: number) => a * Math.pow(x, n) + b;

  if (impair) {
    const domaine = n > 0 ? ensembleReel() : ensemblePrivePoints([0]);
    const image = n > 0 ? ensembleReel() : ensemblePrivePoints([b]);
    const fInverse = (y: number) => racineReelle((y - b) / a, n);
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

  // n pair : jamais injective, pivot=0.
  const domaine = n > 0 ? ensembleReel() : ensemblePrivePoints([0]);
  const inclus = n > 0;
  const intervalleGauche = ensembleUnMorceau(versLeBasJusque(0, inclus));
  const intervalleDroite = ensembleUnMorceau(versLeHautDepuis(0, inclus));
  const image =
    n > 0
      ? a > 0
        ? ensembleUnMorceau(versLeHautDepuis(b, true))
        : ensembleUnMorceau(versLeBasJusque(b, true))
      : a > 0
        ? ensembleUnMorceau(versLeHautDepuis(b, false))
        : ensembleUnMorceau(versLeBasJusque(b, false));
  const fInverseDroite = (y: number) => {
    const u = (y - b) / a;
    if (u < 0) return NaN;
    return Math.pow(u, 1 / n);
  };
  const fInverseGauche = (y: number) => {
    const u = (y - b) / a;
    if (u < 0) return NaN;
    return -Math.pow(u, 1 / n);
  };

  return {
    parametres,
    fLatex,
    domaine,
    injective: false,
    pivot: 0,
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
