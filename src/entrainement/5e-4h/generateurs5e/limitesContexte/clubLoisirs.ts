/**
 * Couche A (5e) — famille "Club de loisirs" (5gen23). f(x)=ax+b−c/(x+d), a>0 IMPOSÉ : f'(x)=
 * a+c/(x+d)²>0 partout, f strictement croissante sur x≥0 (voir `core5e/limitesContexte.types.ts`
 * pour la justification complète). N'importe jamais rien de `moteur5e/`.
 */
import type { ExerciceClubLoisirs } from "../../core5e/limitesContexte.types";
import { CONTEXTES_CLUB_LOISIRS } from "./contextesClubLoisirs";
import { entierAleatoire, tirerElement } from "./utils";

/** Résout f(x)=k0 ⟺ (a·x+b−k0)·(x+d)=c pour la branche x>−d (seule pertinente, x≥0 ⊂ ]−d;+∞[).
 * f est une bijection ℝ→ℝ sur CHAQUE branche (x<−d et x>−d) — le discriminant est donc toujours
 * positif par construction, exactement une racine du couple satisfait x>−d. */
function resoudreCritique(a: number, b: number, c: number, d: number, k0: number): number {
  const A = a;
  const B = a * d + b - k0;
  const C = (b - k0) * d - c;
  const disc = Math.max(B * B - 4 * A * C, 0);
  const racine = Math.sqrt(disc);
  const x1 = (-B + racine) / (2 * A);
  const x2 = (-B - racine) / (2 * A);
  return x1 > -d ? x1 : x2;
}

export function genererExerciceClubLoisirs(): ExerciceClubLoisirs {
  const contexte = tirerElement(CONTEXTES_CLUB_LOISIRS);
  for (let tentative = 0; tentative < 30; tentative++) {
    const a = entierAleatoire(2, 6);
    const c = entierAleatoire(5, 20);
    const d = entierAleatoire(2, 8);
    // f strictement croissante sur x≥0 (a>0 imposé) : le minimum de f sur TOUT le domaine réaliste
    // est donc f(0)=b−c/d, jamais un point intérieur — fixer d'abord ce minimum (≥1) et en déduire
    // le plancher de b, plutôt que tirer b puis rejeter les tirages où f(0)<1 (même motif
    // "construction à l'envers" que le garde-fou 5gen3, jamais de rejet non borné coûteux).
    const bMin = Math.ceil(1 + c / d);
    const b = bMin + entierAleatoire(0, 5);
    const facteur = Math.random() < 0.5 ? 10 : 100;
    const xEval = entierAleatoire(3, 12);
    // Seuil natif choisi près de f(xProbe), xProbe réel — garantit une racine réelle plausible sans
    // avoir à la choisir a priori (construction "à l'envers" : le seuil est choisi, la racine EXACTE
    // en est dérivée par résolution du polynôme, jamais une valeur approchée après coup).
    const xProbe = 2 + Math.random() * 13;
    const k0Reel = a * xProbe + b - c / (xProbe + d);
    const k0 = Math.round(k0Reel);
    const xCritique = resoudreCritique(a, b, c, d, k0);
    const moisAttendu = Math.ceil(xCritique);
    const distanceEntier = Math.abs(xCritique - Math.round(xCritique));
    // Rejet BORNÉ (jamais illimité) des tirages où l'arrondi serait ambigu (racine trop proche d'un
    // entier) ou hors d'une plage réaliste.
    if (xCritique > 0.5 && xCritique < 40 && distanceEntier > 0.05) {
      return { famille: "clubLoisirs", a, b, c, d, facteur, xEval, k0, moisAttendu, contexte };
    }
  }
  const repli = { a: 3, b: 5, c: 10, d: 4, facteur: 100, xEval: 6, k0: 20 };
  return { famille: "clubLoisirs", ...repli, moisAttendu: Math.ceil(resoudreCritique(repli.a, repli.b, repli.c, repli.d, repli.k0)), contexte };
}
