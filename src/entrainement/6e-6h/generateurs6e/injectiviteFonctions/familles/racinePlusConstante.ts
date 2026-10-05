import type { ExerciceInjectiviteFonctions } from "../../../core6e/injectiviteFonctions.types";
import { ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntierNonNul } from "../aleatoire";
import { construireOptionsCombobox } from "../distracteurs";
import { formatRacinePlusConstanteLatex } from "../formatFLatex";

/**
 * Famille d) f(x) = √(ax+b) + c — TOUJOURS injective sur son domaine (racine carrée strictement
 * croissante composée avec une affine). `c` positif ou négatif est une simple sous-variante (ne
 * change que la position de l'image, jamais la structure — spec explicite), pas de branchement
 * séparé nécessaire dans le code.
 *
 * Domaine={x | ax+b≥0} (résolu selon signe de a). Image=[c;+∞[.
 *
 * Réciproque : y=√(ax+b)+c ⟹ √(ax+b)=y-c (nécessite y≥c) ⟹ ax+b=(y-c)² ⟹ x=((y-c)²-b)/a.
 */
export function construireRacinePlusConstante(): ExerciceInjectiviteFonctions {
  const a = tirerEntierNonNul(-5, 5);
  const b = tirerEntierNonNul(-5, 5);
  const c = tirerEntierNonNul(-5, 5);
  const seuil = -b / a;
  const domaine = a > 0 ? ensembleUnMorceau(versLeHautDepuis(seuil, true)) : ensembleUnMorceau(versLeBasJusque(seuil, true));
  const image = ensembleUnMorceau(versLeHautDepuis(c, true));
  const fReference = (x: number) => Math.sqrt(a * x + b) + c;
  const fInverse = (y: number) => (Math.pow(y - c, 2) - b) / a;

  return {
    parametres: { famille: "racinePlusConstante", a, b, c },
    fLatex: `f(x) = ${formatRacinePlusConstanteLatex(a, b, c)}`,
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
