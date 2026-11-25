import type { Conique } from "./coniquesLotH1";
import type { Ex } from "./coniquesLotH1";
import { ex, racineEx } from "./coniquesLotH1";
import type { P } from "../ui6e/outilsLieuxLotH1";
import { choisir, entier } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen136` « Rayons focaux et triangle focal » (6e ch. 10, § 3, Appliquer).
 * Ellipse x²/a² + y²/b² = 1 à c entier (triplets), foyers F(c ; 0) et F′(−c ; 0) :
 * - `rayons` : point P(x_P ; y_P) de l'ellipse → e = c/a, |PF| = a − e·x_P, |PF′| = a + e·x_P ;
 * - `aire` : angle θ = FPF′ donné (60°, 90° ou 120°). L'EXISTENCE du point P est le verdict, tirée à
 *   parts égales AVANT l'ellipse : l'angle FPF′ est maximal au sommet B(0 ; b) du petit axe, où
 *   cos(FBF′) = (b² − c²)/a² ; P existe si et seulement si cos θ ≥ (b² − c²)/a². Écrans : cos(FBF′),
 *   existence (choix fermé), puis — seulement si P existe — aire = b²·tan(θ/2).
 */

export type Variante136 = "rayons" | "aire";
export type Phase136 = "excentricite" | "rayonF" | "rayonFp" | "cosMax" | "existence" | "aire";

export interface Exercice136 {
  variante: Variante136;
  a: number;
  b: number;
  c: number;
  /** rayons : point P (x entier, y exact). */
  xP?: number;
  yP?: Ex;
  /** aire : angle en degrés et verdict. */
  theta?: 60 | 90 | 120;
  existe?: boolean;
}

export const TRIPLETS: [number, number, number][] = [
  [5, 4, 3],
  [5, 3, 4],
  [10, 8, 6],
  [10, 6, 8],
  [13, 12, 5],
  [13, 5, 12],
  [15, 12, 9],
  [15, 9, 12],
  [17, 15, 8],
  [17, 8, 15],
];

export function phases136(e: Exercice136): Phase136[] {
  if (e.variante === "rayons") return ["excentricite", "rayonF", "rayonFp"];
  return e.existe ? ["cosMax", "existence", "aire"] : ["cosMax", "existence"];
}

export const conique136 = (e: Exercice136): Conique => ({ nature: "ellipse", h: 0, k: 0, axe: "x", a2: e.a * e.a, b2: e.b * e.b, p: 0, sens: 1 });
export const cosTheta = (theta: number) => (theta === 60 ? 0.5 : theta === 90 ? 0 : -0.5);
export const cosMax136 = (e: Exercice136) => (e.b * e.b - e.c * e.c) / (e.a * e.a);
export const rayonF136 = (e: Exercice136) => e.a - (e.c / e.a) * e.xP!;
export const rayonFp136 = (e: Exercice136) => e.a + (e.c / e.a) * e.xP!;
/** tan(θ/2) exact : √3/3, 1, √3. */
export const tanDemi = (theta: number): Ex => (theta === 60 ? ex(0, 1 / 3, 3) : theta === 90 ? ex(1) : ex(0, 1, 3));
export const aire136 = (e: Exercice136): Ex => {
  const t = tanDemi(e.theta!);
  return ex(t.q * e.b * e.b, t.r * e.b * e.b, t.n);
};

export function tirer136(variante: Variante136): Exercice136 {
  if (variante === "rayons") {
    const [a, b, c] = choisir(TRIPLETS.slice(0, 6));
    let xP = 0;
    while (xP === 0) xP = entier(-(a - 1), a - 1);
    // y_P = (b/a)·√(a² − x²), signe au hasard.
    const r = racineEx(a * a - xP * xP);
    const s = Math.random() < 0.5 ? 1 : -1;
    const yP = ex((s * b * r.q) / a, (s * b * r.r) / a, r.n);
    return { variante, a, b, c, xP, yP };
  }
  const existe = Math.random() < 0.5;
  for (;;) {
    const [a, b, c] = choisir(TRIPLETS);
    const theta = choisir<60 | 90 | 120>([60, 90, 120]);
    const ok = cosTheta(theta) >= (b * b - c * c) / (a * a) - 1e-12;
    // Jamais le cas limite P = B (égalité) : le verdict serait ambigu à l'œil.
    if (Math.abs(cosTheta(theta) - (b * b - c * c) / (a * a)) < 1e-9) continue;
    if (ok === existe) return { variante, a, b, c, theta, existe };
  }
}

export const P136 = (e: Exercice136): P => ({ x: e.xP!, y: e.yP!.q + e.yP!.r * Math.sqrt(e.yP!.n) });
