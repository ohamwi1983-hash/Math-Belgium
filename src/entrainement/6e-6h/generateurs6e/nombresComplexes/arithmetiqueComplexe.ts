import type { ValeurComplexe } from "../../core6e/nombresComplexes.types";

/**
 * Couche A (6e) — arithmétique complexe pure pour la GÉNÉRATION de `6gen34` (entiers exacts,
 * jamais de flottant hors division — voir `fractionComplexe.ts` pour la division exacte). Duplique
 * DÉLIBÉRÉMENT les mêmes opérations que `moteur6e/expressionComplexe.ts` (`ajouterComplexe` etc.) —
 * jamais importées depuis là (CLAUDE.md, règle non négociable : le dossier `moteur6e` et le dossier
 * `generateurs6e` ne s'importent jamais l'un l'autre) — même duplication assumée déjà documentée sur la
 * plateforme pour ce genre de petit module (voir en-tête `moteur6e/expressionExponentielle.ts`).
 */

/** Neutralise `-0` (produit ex. par une somme de 2 termes qui s'annulent avec des signes opposés
 * dans `multiplierC`, comme `0*(-1) + (-1)*0`) en `0` — mirroir `normaliserZero`/`normaliser` de
 * `moteur6e/expressionComplexe.ts` : sans ça, `resultat.im` peut valoir `-0` (visible en
 * `console.log`/JSON, bien qu'inoffensif pour l'affichage `${...}` et la comparaison numérique —
 * confirmé lors de la vérification Playwright de ce générateur, où `{re:-1,im:-0}` est apparu sur un
 * tirage réel de la famille F). Appliqué au plus près de la source, systématiquement. */
function normaliserZero(v: number): number {
  return v === 0 ? 0 : v;
}
function normaliserC(v: ValeurComplexe): ValeurComplexe {
  return { re: normaliserZero(v.re), im: normaliserZero(v.im) };
}

export function ajouterC(a: ValeurComplexe, b: ValeurComplexe): ValeurComplexe {
  return normaliserC({ re: a.re + b.re, im: a.im + b.im });
}
export function soustraireC(a: ValeurComplexe, b: ValeurComplexe): ValeurComplexe {
  return normaliserC({ re: a.re - b.re, im: a.im - b.im });
}
export function multiplierC(a: ValeurComplexe, b: ValeurComplexe): ValeurComplexe {
  return normaliserC({ re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re });
}
export function opposeC(a: ValeurComplexe): ValeurComplexe {
  return normaliserC({ re: -a.re, im: -a.im });
}
export function puissanceEntiereC(base: ValeurComplexe, n: number): ValeurComplexe {
  let resultat: ValeurComplexe = { re: 1, im: 0 };
  for (let i = 0; i < n; i++) resultat = multiplierC(resultat, base);
  return resultat;
}
