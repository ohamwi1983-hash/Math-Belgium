import type { ContexteReflexion, ExerciceProjeteSymetrique, VarianteProjeteSymetrique } from "../../core/projeteSymetrique.types";
import { choisir, entier, fenetreAutour, type P } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen96 « Projeté orthogonal, symétrique et réflexion ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` le remplace par une graine (le QR code rouvre le MÊME exercice).
 *
 * Construction À REBOURS (valeurs « propres ») : une direction u⃗ de d à composantes non nulles
 * (|·| ≤ 3, premières entre elles — jamais une droite horizontale ou verticale, où tout se lit), le
 * vecteur normal n⃗ = (a ; b), le projeté H entier, A = H + k·n⃗ et A′ = H − k·n⃗ (k = ±1, ±2) : t = −k
 * dans le calcul du pied, H et A′ entiers.
 * Réflexion : I = H + j·u⃗ sur d (j ≠ 0 : I n'est jamais le projeté de A), B = I + s·(I − A′) avec
 * s ∈ {1/2, 1, 3/2, 2} et B entier : B est du même côté de d que A, et A′, I, B sont alignés
 * (I entre A′ et B). Fenêtre de la figure ≤ 17 unités dans chaque sens.
 */

const DIRECTIONS: P[] = [
  { x: 1, y: 1 },
  { x: 1, y: -1 },
  { x: 1, y: 2 },
  { x: 2, y: 1 },
  { x: 1, y: -2 },
  { x: 2, y: -1 },
  { x: 1, y: 3 },
  { x: 3, y: 1 },
  { x: 1, y: -3 },
  { x: 3, y: -1 },
  { x: 2, y: 3 },
  { x: 3, y: 2 },
  { x: 2, y: -3 },
  { x: 3, y: -2 },
];

export const CONTEXTES: ContexteReflexion[] = ["billard", "miroir", "mur"];

function directionEtNormale(): { u: P; nrm: P } {
  let u = choisir(DIRECTIONS);
  // a = y_u > 0 (forme normalisée de d).
  if (u.y < 0) u = { x: -u.x, y: -u.y };
  return { u, nrm: { x: u.y, y: -u.x } };
}

const dansBornes = (pts: P[], M: number) => pts.every((p) => Math.abs(p.x) <= M && Math.abs(p.y) <= M);

export function genererProjeteSymetrique(variante: VarianteProjeteSymetrique, contexte?: ContexteReflexion): ExerciceProjeteSymetrique {
  const ctx = variante === "reflexion" ? (contexte ?? choisir(CONTEXTES)) : null;
  for (;;) {
    const { u, nrm } = directionEtNormale();
    const k = choisir([-2, -1, 1, 2]);
    const H = { x: entier(-4, 4), y: entier(-4, 4) };
    const A = { x: H.x + k * nrm.x, y: H.y + k * nrm.y };
    const Ap = { x: H.x - k * nrm.x, y: H.y - k * nrm.y };
    const a = nrm.x;
    const b = nrm.y;
    const d = { a, b, c: -(a * H.x + b * H.y) };
    if (A.x === 0 || A.y === 0) continue;
    if (variante === "symetrique") {
      if (!dansBornes([A, Ap], 9)) continue;
      return { variante, contexte: null, d, u, nrm, A, k, H, Ap, B: null, I: null };
    }
    const j = choisir([-3, -2, -1, 1, 2, 3]);
    const s = choisir([0.5, 1, 1.5, 2]);
    const I = { x: H.x + j * u.x, y: H.y + j * u.y };
    const B = { x: I.x + s * (I.x - Ap.x), y: I.y + s * (I.y - Ap.y) };
    if (!Number.isInteger(B.x) || !Number.isInteger(B.y)) continue;
    if (!dansBornes([A, Ap, B, I], 10)) continue;
    if ((A.x - B.x) ** 2 + (A.y - B.y) ** 2 < 8) continue;
    const f = fenetreAutour([A, Ap, B, I, H, { x: 0, y: 0 }]);
    if (f.xMax - f.xMin > 17 || f.yMax - f.yMin > 17) continue;
    return { variante, contexte: ctx, d, u, nrm, A, k, H, Ap, B, I };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteProjeteSymetrique; label: string }[] = [
  { id: "symetrique", label: "Projeté orthogonal et symétrique d'un point par rapport à une droite" },
  { id: "reflexion", label: "Réflexion : où viser ? (billard, miroir, mur)" },
];

export function construireAvecVariante(id: string): ExerciceProjeteSymetrique {
  if (id === "symetrique" || id === "reflexion") return genererProjeteSymetrique(id);
  return genererExerciceProjeteSymetrique();
}

export function genererExerciceProjeteSymetrique(): ExerciceProjeteSymetrique {
  return genererProjeteSymetrique(Math.random() < 0.5 ? "symetrique" : "reflexion");
}
