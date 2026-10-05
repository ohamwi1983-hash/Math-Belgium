import type { ExerciceInjectiviteFonctions } from "../../../core6e/injectiviteFonctions.types";
import { ensembleReel, ensembleUnMorceau, versLeBasJusque, versLeHautDepuis } from "../../ensembleReel";
import { tirerEntierNonNul } from "../aleatoire";
import { construireOptionsCombobox } from "../distracteurs";
import { formatQuadratiqueLatex } from "../formatFLatex";

/**
 * Famille f) f(x) = ax²+bx+c — JAMAIS injective sur ℝ, symétrique par rapport au pivot
 * x=-b/(2a). Domaine=ℝ. Image=[k;+∞[ (a>0) ou ]-∞;k] (a<0), où k=f(-b/(2a)).
 *
 * Réciproque : complétion du carré, a(x-p)²+k=y avec p=-b/(2a) ⟹ (x-p)²=(y-k)/a ⟹
 * x=p±√((y-k)/a) — le signe dépend de la branche (droite=x≥p ⟹ +, gauche=x≤p ⟹ -).
 */
export function construireQuadratique(): ExerciceInjectiviteFonctions {
  const a = tirerEntierNonNul(-5, 5);
  const b = tirerEntierNonNul(-5, 5);
  const c = tirerEntierNonNul(-5, 5);
  const pivot = -b / (2 * a);
  const k = a * pivot * pivot + b * pivot + c;

  const intervalleGauche = ensembleUnMorceau(versLeBasJusque(pivot, true));
  const intervalleDroite = ensembleUnMorceau(versLeHautDepuis(pivot, true));
  const image = a > 0 ? ensembleUnMorceau(versLeHautDepuis(k, true)) : ensembleUnMorceau(versLeBasJusque(k, true));
  const fReference = (x: number) => a * x * x + b * x + c;
  const fInverseDroite = (y: number) => {
    const u = (y - k) / a;
    if (u < 0) return NaN;
    return pivot + Math.sqrt(u);
  };
  const fInverseGauche = (y: number) => {
    const u = (y - k) / a;
    if (u < 0) return NaN;
    return pivot - Math.sqrt(u);
  };

  return {
    parametres: { famille: "quadratique", a, b, c },
    fLatex: `f(x) = ${formatQuadratiqueLatex(a, b, c)}`,
    domaine: ensembleReel(),
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
