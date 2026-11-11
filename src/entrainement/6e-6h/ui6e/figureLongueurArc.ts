import type { ExerciceLongueurArc } from "../core6e/longueurArc.types";
import { COULEURS, etiquetteNombre, fenetreY, repereSvg } from "./figureRepereIntegrales";

/**
 * Figure de `6gen28` (audit chapitre 4 de 6e, point 23) : la courbe de f (trait fin, au-delà des
 * bornes) et l'arc mesuré, de x = a à x = b (trait épais), avec ses deux extrémités. Chaîne SVG
 * autonome : écran de validation du dernier écran et `figureHtml` du corrigé papier (phase 2).
 */
export function figureLongueurArcSvg(exercice: ExerciceLongueurArc): string {
  let f: (x: number) => number;
  if (exercice.famille === "A") f = exercice.fReference;
  else if (exercice.famille === "B") {
    const k = exercice.k;
    f = (x) => k * Math.log(x);
  } else {
    const c = exercice.cNum / exercice.cDen;
    f = (x) => c * Math.pow(Math.max(x, 0), 1.5);
  }
  const { a, b } = exercice;
  const largeur = b - a;
  // Le domaine de f est ]0 ; +∞[ (familles A et B) ou [0 ; +∞[ (famille C) : la courbe fine ne
  // déborde jamais à gauche de 0.
  const plancher = exercice.famille === "C" ? 0 : 0.15;
  const xMin = Math.max(plancher, a - largeur * 0.3);
  const xMax = b + largeur * 0.3;
  const { yMin, yMax } = fenetreY([f], xMin, xMax, true);
  const ya = f(a);
  const yb = f(b);
  const etiqA = exercice.famille === "B" ? "a" : etiquetteNombre(a);
  const etiqB = exercice.famille === "B" ? "b" : etiquetteNombre(b);
  return repereSvg({
    xMin: Math.min(0, xMin) - largeur * 0.08,
    xMax,
    yMin,
    yMax,
    graduationsX: [
      { x: a, etiquette: etiqA },
      { x: b, etiquette: etiqB },
    ].filter((g) => Math.abs(g.x) > 1e-9),
    courbes: [
      { fn: f, de: xMin, a: xMax, couleur: COULEURS.pale, epaisseur: 1.4 },
      { fn: f, de: a, a: b, couleur: COULEURS.accent, epaisseur: 3.2, etiquette: "L" },
    ],
    segments: [
      { x1: a, y1: 0, x2: a, y2: ya, couleur: COULEURS.pale, pointilles: true, epaisseur: 1 },
      { x1: b, y1: 0, x2: b, y2: yb, couleur: COULEURS.pale, pointilles: true, epaisseur: 1 },
    ],
    points: [
      { x: a, y: ya, couleur: COULEURS.accent },
      { x: b, y: yb, couleur: COULEURS.accent },
    ],
    libelle: "Arc de la courbe de f entre x = a et x = b, dont on calcule la longueur L",
  });
}
