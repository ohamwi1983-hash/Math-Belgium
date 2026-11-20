import type { ExerciceDeriveeReciproque, FamilleReciproque } from "../../core6e/deriveeReciproquePoint.types";
import { CONFIGS_ARCTAN, CONFIGS_TRIG, X0_ARCTAN, X0_POLY, X0_TRIG, modele, y0V } from "../../moteur6e/modeleDeriveeReciproquePoint";
import { entier, parmi } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de `6gen155` « Dérivée d'une réciproque en un point ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Le verdict de l'écran 3 (f′(x₀) ≠ 0 ou = 0) est tiré 50/50 AVANT les
 * paramètres, dans chaque famille : aucun nom de variante ne le donne. y₀ ≠ x₀ (sinon recopier y₀
 * donnerait x₀).
 */

export const CATALOGUE_VARIANTES: { id: FamilleReciproque; label: string }[] = [
  { id: "poly", label: "Polynôme du troisième degré" },
  { id: "exp", label: "Exponentielle eˣ + kx + c" },
  { id: "ln", label: "Logarithme (ln x + kx, x − ln x)" },
  { id: "trig", label: "Trigonométrique (kx ± sin x, kx ± cos x)" },
  { id: "arctan", label: "Arctangente (kx ± arctan x)" },
];

function tirage(variante: FamilleReciproque, oui: boolean): ExerciceDeriveeReciproque {
  const c = entier(-3, 3);
  switch (variante) {
    case "poly": {
      const h = parmi([-1, 0, 1]);
      if (!oui) return { variante, p: { h, pp: 0, c }, ix0: X0_POLY.indexOf(h) };
      return { variante, p: { h, pp: parmi([0, 1, 2, 3]), c }, ix0: entier(0, X0_POLY.length - 1) };
    }
    case "exp": {
      if (!oui) return { variante, p: { k: -1, c }, ix0: 0 };
      const k = parmi([-1, 1, 2, 3]);
      return { variante, p: { k, c }, ix0: k === -1 ? 1 : entier(0, 1) };
    }
    case "ln": {
      if (!oui) return { variante, p: { type: 1, k: 1, c }, ix0: 0 };
      const type = Math.random() < 0.7 ? 0 : 1;
      return { variante, p: { type, k: parmi([1, 2, 3]), c }, ix0: type === 1 ? 1 : entier(0, 1) };
    }
    case "trig": {
      if (!oui) {
        const cfg = entier(0, 3);
        // zéro de f′ : x + sin x en π, x − sin x en 0, x + cos x en π/2, x − cos x en −π/2
        const k4 = [4, 0, 2, -2][cfg];
        return { variante, p: { cfg, c }, ix0: X0_TRIG.indexOf(k4) };
      }
      return { variante, p: { cfg: entier(0, CONFIGS_TRIG.length - 1), c }, ix0: entier(0, X0_TRIG.length - 1) };
    }
    case "arctan": {
      if (!oui) return { variante, p: { cfg: 1, c }, ix0: X0_ARCTAN.indexOf(0) };
      return { variante, p: { cfg: entier(0, CONFIGS_ARCTAN.length - 1), c }, ix0: entier(0, X0_ARCTAN.length - 1) };
    }
  }
}

export function construireAvecVariante(id: string): ExerciceDeriveeReciproque {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "poly") as FamilleReciproque;
  const oui = Math.random() < 0.5;
  for (;;) {
    const e = tirage(variante, oui);
    const m = modele(e);
    const fp = m.point.fpV;
    if (oui === (Math.abs(fp) < 1e-12)) continue;
    if (Math.abs(y0V(e) - m.point.x0V) < 1e-9) continue;
    return e;
  }
}

export function genererExerciceReciproque(): ExerciceDeriveeReciproque {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
