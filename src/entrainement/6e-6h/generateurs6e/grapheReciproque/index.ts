import type { CandidatReciproque, ExerciceGrapheReciproque, VarianteGrapheReciproque } from "../../core6e/grapheReciproque.types";
import { FENETRE, noeudTangente, pointsCandidat } from "../../moteur6e/modeleGrapheReciproque";
import { entier, melanger, parmi } from "../../ui6e/nombresExp";

/**
 * Couche A — générateur de `6gen154` « Graphe de la réciproque ». `Math.random()` seul (le `?code=`
 * rejoue le tirage). Trois nœuds entiers dans [−5 ; 5]², pente p/q en A (jamais 1), arcs monotones
 * (contrainte de Fritsch–Carlson α² + β² ≤ 9), A hors de la droite y = x, tangente lisible (second
 * nœud dans la fenêtre), quatre graphes candidats nettement distincts.
 */

export const CATALOGUE_VARIANTES: { id: VarianteGrapheReciproque; label: string }[] = [
  { id: "croissante", label: "f strictement croissante" },
  { id: "decroissante", label: "f strictement décroissante" },
];

const PENTES: [number, number][] = [
  [1, 3],
  [1, 2],
  [2, 3],
  [3, 2],
  [2, 1],
  [3, 1],
];
const CANDIDATS: CandidatReciproque[] = ["reciproque", "antidiagonale", "axeX", "axeY"];

/** Distance moyenne entre deux courbes échantillonnées (point le plus proche). */
function ecart(a: [number, number][], b: [number, number][]): number {
  let s = 0;
  for (const p of a) {
    let m = Infinity;
    for (const r of b) m = Math.min(m, Math.hypot(p[0] - r[0], p[1] - r[1]));
    s += m;
  }
  return s / a.length;
}

export function construireAvecVariante(id: string): ExerciceGrapheReciproque {
  const variante = (CATALOGUE_VARIANTES.some((v) => v.id === id) ? id : "croissante") as VarianteGrapheReciproque;
  const sg = variante === "croissante" ? 1 : -1;
  for (;;) {
    const x0 = entier(-5, -1);
    const xA = entier(x0 + 2, 3);
    const x2 = entier(xA + 2, 5);
    if (x2 > 5) continue;
    const ys = [entier(-5, 5), entier(-5, 5), entier(-5, 5)].sort((u, v) => u - v);
    if (ys[1] - ys[0] < 1 || ys[2] - ys[1] < 1 || ys[2] - ys[0] < 4) continue;
    const [y0, yA, y2] = sg > 0 ? ys : [ys[2], ys[1], ys[0]];
    if (yA === xA) continue;
    // domaine et image différents (sinon les échanger ne se verrait pas)
    if (ys[0] === x0 && ys[2] === x2) continue;
    const [pp, q] = parmi(PENTES);
    const p = sg * pp;
    const d1 = (yA - y0) / (xA - x0);
    const d2 = (y2 - yA) / (x2 - xA);
    const m = p / q;
    // Fritsch–Carlson sur chaque arc (pentes de bord = sécantes, α = 1)
    if ((m / d1) ** 2 + 1 > 9 || (m / d2) ** 2 + 1 > 9) continue;
    // une vraie courbure : la tangente se distingue de la courbe
    if (Math.abs(d1 - m) < 0.25 && Math.abs(d2 - m) < 0.25) continue;
    const e: ExerciceGrapheReciproque = {
      variante,
      noeuds: [
        [x0, y0],
        [xA, yA],
        [x2, y2],
      ],
      p,
      q,
      pentesBords: [d1, d2],
      ouvert: [Math.random() < 0.3, Math.random() < 0.3],
      candidats: melanger(CANDIDATS),
    };
    const N = noeudTangente(e);
    if (Math.abs(N[0]) > FENETRE - 1 || Math.abs(N[1]) > FENETRE - 1) continue;
    // courbe de f dans la fenêtre (la spline ne déborde pas)
    const pts = pointsCandidat(e, "f");
    if (pts.some(([, y]) => Math.abs(y) > FENETRE - 0.3)) continue;
    // candidats deux à deux distincts, et f⁻¹ distincte de f
    const courbes = CANDIDATS.map((c) => pointsCandidat(e, c));
    let distincts = ecart(courbes[0], pts) > 0.6;
    for (let i = 0; i < 4 && distincts; i++) for (let j = i + 1; j < 4; j++) if (ecart(courbes[i], courbes[j]) < 0.6) distincts = false;
    if (!distincts) continue;
    return e;
  }
}

export function genererExerciceGrapheReciproque(): ExerciceGrapheReciproque {
  return construireAvecVariante(parmi(CATALOGUE_VARIANTES).id);
}
