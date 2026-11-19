import type { ExerciceLectureInequation, FenetreGraphique, IdLecture, SymboleLecture, VarianteLectureInequation } from "../../core/lectureInequationGraphique.types";
import { abscisses, coefficientsF, f } from "../../moteur/modeleLectureInequationGraphique";

/**
 * Générateur de gen117 « Lire une inéquation sur un graphique ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le même graphique).
 *
 * Issues tirées AVANT les nombres : nombre de points d'intersection (2 : 60 %, contact : 20 %,
 * aucun : 20 %) et symbole (équiprobable) — verdicts de la lecture, jamais fixés par `forme`.
 * f − g = α·(x − x₁)(x − x₂) (ou α(x − x₁)², ou α((x − x₁)² + d)), α ∈ {±1 ; ±1/2}, x₁, x₂ entiers,
 * droite à coefficients entiers : chaque point d'intersection tombe sur un nœud de la grille d'une
 * unité. Fenêtre de 10 unités de large, bornes entières, hauteur au plus 14 unités, axe des x visible.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function nonNul(min: number, max: number): number {
  for (;;) {
    const v = entier(min, max);
    if (v !== 0) return v;
  }
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const LARGEUR = 10;
const HAUTEUR_MAX = 14;

function fenetre(e: Omit<ExerciceLectureInequation, "fenetre" | "lectures">): FenetreGraphique | null {
  const xs = abscisses(e as ExerciceLectureInequation);
  const [A, B] = coefficientsF(e as ExerciceLectureInequation);
  const xv = -B / (2 * A);
  const centre = xs.length ? (xs[0]! + xs[xs.length - 1]!) / 2 : xv;
  const xMin = Math.round(centre - LARGEUR / 2);
  const xMax = xMin + LARGEUR;
  if (xs.some((x) => x < xMin + 1 || x > xMax - 1)) return null;
  const ys = [0, ...xs.map((x) => f(e as ExerciceLectureInequation, x))];
  if (xv > xMin && xv < xMax) ys.push(f(e as ExerciceLectureInequation, xv));
  const yMin = Math.floor(Math.min(...ys)) - 1;
  const yMax = Math.ceil(Math.max(...ys)) + 1;
  if (yMax - yMin > HAUTEUR_MAX) return null;
  // Hauteur au moins 8 unités : la parabole a de la place pour s'ouvrir.
  const manque = Math.max(0, 8 - (yMax - yMin));
  const versHaut = A > 0 ? Math.ceil(manque) : 0;
  return { xMin, xMax, yMin: yMin - (manque - versHaut), yMax: yMax + versHaut };
}

function tirer(variante: VarianteLectureInequation, issue: 0 | 1 | 2, symbole: SymboleLecture): ExerciceLectureInequation {
  for (;;) {
    const alpha = choisir([1, -1, 0.5, -0.5]);
    let x1: number;
    let x2: number;
    let d = 0;
    if (issue === 2) {
      x1 = entier(-5, 4);
      x2 = x1 + entier(2, 6);
      if (x2 > 6) continue;
    } else {
      x1 = entier(-4, 4);
      x2 = x1;
      if (issue === 0) d = entier(1, 3);
    }
    const m = variante === "oblique" ? choisir([-2, -1, 1, 2]) : 0;
    const p = variante === "axe" ? 0 : variante === "horizontale" ? nonNul(-4, 4) : entier(-3, 3);
    const base = { variante, symbole, issue, alpha, x1, x2, d, m, p };
    const fen = fenetre(base);
    if (!fen) continue;
    return { ...base, fenetre: fen, lectures: melanger<IdLecture>(["dessusEntre", "dessusExterieur", "dessousEntre", "dessousExterieur"]) };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteLectureInequation; label: string }[] = [
  { id: "axe", label: "Parabole et axe des x : f(x) ◇ 0" },
  { id: "horizontale", label: "Parabole et droite horizontale : f(x) ◇ k" },
  { id: "oblique", label: "Parabole et droite oblique : f(x) ◇ g(x)" },
];

export function genererLectureInequation(variante: VarianteLectureInequation): ExerciceLectureInequation {
  const r = Math.random();
  const issue: 0 | 1 | 2 = r < 0.6 ? 2 : r < 0.8 ? 1 : 0;
  const symbole = choisir(["<", ">", "≤", "≥"] as const);
  return tirer(variante, issue, symbole);
}

export function construireAvecVariante(id: string): ExerciceLectureInequation {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceLectureInequation();
  return genererLectureInequation(id as VarianteLectureInequation);
}

export function genererExerciceLectureInequation(): ExerciceLectureInequation {
  return genererLectureInequation(choisir(CATALOGUE_VARIANTES).id);
}
