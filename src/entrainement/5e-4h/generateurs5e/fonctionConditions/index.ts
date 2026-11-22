import type { ExerciceFonctionConditions, NatureConditions, VarianteFonctionConditions } from "../../core5e/fonctionConditions";
import { systemes } from "../../core5e/fonctionConditions";
import { memesSystemes } from "../../ui5e/ecrituresApplicationsDerivees";

/**
 * Couche A — générateur de `5gen69` « Déterminer une fonction par des conditions ».
 * `Math.random()` seul (le `?code=` rejoue le tirage). Le VERDICT (nature du point) est tiré AVANT
 * la boucle de rejet : un tiers max / min / palier (tangente horizontale), moitié pour les deux
 * autres variantes. Rejet : coefficients trop grands, systèmes faux équivalents au bon (ou entre eux).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

function melange(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

function systemesDistincts(e: ExerciceFonctionConditions): boolean {
  const s = systemes(e);
  for (let i = 0; i < s.length; i++) for (let j = i + 1; j < s.length; j++) if (memesSystemes(s[i]!, s[j]!)) return false;
  // Aucun système faux ne doit être vérifié par la vraie solution (il serait « juste par hasard »).
  const vrai = (q: { al: number; be: number; ga: number }) => q.al * e.a + q.be * e.b === q.ga;
  return s.slice(1).every((x) => !(vrai(x[0]) && vrai(x[1])));
}

function tangenteHorizontale(nature: NatureConditions): ExerciceFonctionConditions {
  for (;;) {
    const a = parmi([-2, -1, 1, 2]);
    const x0 = parmi([-2, -1, 1, 2]);
    const autre = nature === "palier" ? x0 : entier(-3, 3);
    if (nature !== "palier" && (autre === 0 || autre === x0)) continue;
    if ((3 * a * (x0 + autre)) % 2 !== 0) continue;
    const b = (-3 * a * (x0 + autre)) / 2;
    const c = 3 * a * x0 * autre;
    const courbure = 3 * a * (x0 - autre);
    const n: NatureConditions = courbure > 0 ? "min" : courbure < 0 ? "max" : "palier";
    if (n !== nature) continue;
    const d = entier(-5, 5);
    const y0 = ((a * x0 + b) * x0 + c) * x0 + d;
    if (Math.abs(b) > 9 || Math.abs(c) > 12 || Math.abs(y0) > 30) continue;
    const e: ExerciceFonctionConditions = { variante: "tangenteHorizontale", a, b, c, d, xs: x0, xp: x0, yp: y0, autre, nature, ordre: melange(4) };
    if (systemesDistincts(e)) return e;
  }
}

function inflexion(nature: NatureConditions): ExerciceFonctionConditions {
  for (;;) {
    const a = parmi([1, 2]) * (nature === "concaveConvexe" ? 1 : -1);
    const x1 = parmi([-2, -1, 1, 2]);
    const b = -3 * a * x1;
    const c = entier(-6, 6);
    const d = entier(-5, 5);
    const x2 = parmi([-3, -2, -1, 1, 2, 3]);
    if (x2 === x1 || x2 === 3 * x1) continue;
    const y2 = ((a * x2 + b) * x2 + c) * x2 + d;
    if (Math.abs(b) > 12 || Math.abs(y2) > 40 || c * x2 + d === 0) continue;
    const e: ExerciceFonctionConditions = { variante: "inflexion", a, b, c, d, xs: x1, xp: x2, yp: y2, autre: x1, nature, ordre: melange(4) };
    if (systemesDistincts(e)) return e;
  }
}

function deuxTangentes(nature: NatureConditions): ExerciceFonctionConditions {
  for (;;) {
    const a = parmi([-2, -1, 1, 2]);
    const x2 = parmi([-3, -2, -1, 1, 2, 3]);
    if ((a * x2) % 2 !== 0) continue;
    // Minimum en x₂ quand f″(x₂) = 3a·x₂ > 0.
    if ((a * x2 > 0 ? "min" : "max") !== nature) continue;
    const b = (-3 * a * x2) / 2;
    const d = entier(-5, 5);
    if (d === 0) continue;
    const y2 = ((a * x2 + b) * x2) * x2 + d;
    if (Math.abs(b) > 9 || Math.abs(y2) > 30) continue;
    const e: ExerciceFonctionConditions = { variante: "deuxTangentes", a, b, c: 0, d, xs: x2, xp: x2, yp: y2, autre: 0, nature, ordre: melange(4) };
    if (systemesDistincts(e)) return e;
  }
}

export function construire(variante: VarianteFonctionConditions): ExerciceFonctionConditions {
  if (variante === "tangenteHorizontale") return tangenteHorizontale(parmi<NatureConditions>(["max", "min", "palier"]));
  if (variante === "inflexion") return inflexion(parmi<NatureConditions>(["concaveConvexe", "convexeConcave"]));
  return deuxTangentes(parmi<NatureConditions>(["max", "min"]));
}

export const CATALOGUE_VARIANTES: { id: VarianteFonctionConditions; label: string }[] = [
  { id: "tangenteHorizontale", label: "Tangente en 0 et tangente horizontale : extremum ?" },
  { id: "inflexion", label: "Tangente en 0, point d'inflexion et un point" },
  { id: "deuxTangentes", label: "Deux tangentes horizontales et deux points" },
];

export function construireAvecVarianteId(id: string): ExerciceFonctionConditions {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceFonctionConditions(): ExerciceFonctionConditions {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
