/**
 * Couche A (5e) — tirage des 4 paramètres fondamentaux (A, T, φ, b) d'une fonction sinusoïdale
 * f(x) = A·sin((2π/T)(x-φ)) + b. Module PARTAGÉ entre 5gen8 et 5gen9 (import générateur→générateur
 * depuis `generateurs5e/parametresSinusoideGraphique/`, explicitement autorisé par l'architecture)
 * — les deux exercices tirent leurs 4 paramètres exactement de la même façon ("mêmes gammes de
 * valeurs", spec 5gen9).
 */
import type { AmplitudeSinusoide, ParametresSinusoideBase } from "../../core5e/parametresSinusoide.types";
import type { RationnelPi } from "./rationnelPi";
import { reduireRationnelPi } from "./rationnelPi";

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function choix<T>(options: readonly T[]): T {
  return options[Math.floor(Math.random() * options.length)];
}

/** Radicandes sans facteur carré (jamais 4, 8, 9... qui se simplifieraient). */
const RADICANDES_SANS_FACTEUR_CARRE = [2, 3, 5, 6, 7, 10];

export function tirerAmplitude(): AmplitudeSinusoide {
  const signe: 1 | -1 = Math.random() < 0.5 ? 1 : -1;
  if (Math.random() < 0.15) {
    return { signe, rationnelle: null, radicande: choix(RADICANDES_SANS_FACTEUR_CARRE) };
  }
  // 70% entier simple 1..5, 30% décimal simple (dénominateur 2, ex. 1.5/2.5/3.5/4.5) — numérateur
  // toujours IMPAIR pour garantir une vraie décimale (jamais 4/2=2, un entier déguisé).
  if (Math.random() < 0.3) {
    const numerateur = choix([3, 5, 7, 9]);
    return { signe, rationnelle: reduireRationnelPi({ numerateur, denominateur: 2, degrePi: 0 }), radicande: null };
  }
  return { signe, rationnelle: { numerateur: entier(1, 5), denominateur: 1 }, radicande: null };
}

/** T = kπ (k entier simple) 50% du temps, T entier simple sinon — voir l'en-tête de `rationnelPi.ts`
 * pour la raison pour laquelle T n'a jamais de degré -1. */
export function tirerT(): RationnelPi {
  const uniteEnPi = Math.random() < 0.5;
  if (uniteEnPi) {
    return { numerateur: choix([1, 2, 3, 4, 6, 8]), denominateur: 1, degrePi: 1 };
  }
  return { numerateur: choix([2, 3, 4, 5, 6, 8, 10, 12]), denominateur: 1, degrePi: 0 };
}

/** φ partage TOUJOURS le degré de T (fraction de π si T est en π, valeur plate sinon) — "φ : entier,
 * décimal, ou fraction de π SELON T" (spec). 20% de chance φ=0 (aucun déphasage), quel que soit T. */
export function tirerPhi(T: RationnelPi): RationnelPi {
  if (Math.random() < 0.2) return { numerateur: 0, denominateur: 1, degrePi: T.degrePi };
  if (T.degrePi === 1) {
    // Angle remarquable simple : m/n × π, n parmi les dénominateurs usuels.
    const denominateur = choix([1, 2, 3, 4, 6]);
    let numerateur = 0;
    while (numerateur === 0) numerateur = entier(-6, 6);
    return reduireRationnelPi({ numerateur, denominateur, degrePi: 1 });
  }
  // T plat : φ entier ou demi-entier (dénominateur 1 ou 2).
  const denominateur = choix([1, 1, 2]);
  let numerateur = 0;
  while (numerateur === 0) numerateur = entier(-6, 6);
  return reduireRationnelPi({ numerateur, denominateur, degrePi: 0 });
}

export function tirerDecalageVertical(): number {
  if (Math.random() < 0.25) return 0;
  const magnitude = entier(1, 6);
  return Math.random() < 0.5 ? magnitude : -magnitude;
}

export function tirerParametresBase(): ParametresSinusoideBase {
  const T = tirerT();
  return { A: tirerAmplitude(), T, phi: tirerPhi(T), b: tirerDecalageVertical() };
}
