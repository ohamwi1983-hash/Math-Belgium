import type { ExerciceComplexesC } from "../../core6e/complexesAvances.types";
import { tirerEntier } from "../calculPrimitives/aleatoire";

/**
 * Couche A (6e) — génération, famille C ("Préservation du cercle unité par une similitude de
 * Blaschke") de `6gen42`, chapitre 7 "Nombres complexes" (générateur de clôture).
 *
 * ============================================================================
 * **Transformation choisie — `z'=(z-p)/(1-p̄z)`, `p=a+bi` (a,b réels, ici petits entiers) : preuve
 * complète, DEMANDÉE explicitement avant tout code (mission 6gen42)**
 * ============================================================================
 * Il s'agit de l'automorphisme de Blaschke classique du disque unité — choisi (parmi les formes
 * candidates envisagées, voir ci-dessous) car c'est la SEULE qui se prouve proprement avec
 * UNIQUEMENT les 2 identités données par la spec (`zz̄=|z|²`, `z-z̄=2i·Im(z)`), sans jamais poser
 * `z=x+yi`.
 *
 * **Forme candidate écartée** : `z'=(z+a)/(1+aiz)` avec `a` réel UNIQUE partagé aux 2 emplacements —
 * calcul mené (voir prompt de mission) : `|z+a|²=1+a(z+z̄)+a²` mais `|1+aiz|²=1-2a·Im(z)+a²` —
 * égaux SEULEMENT si `Re(z)=-Im(z)` (pas vrai en général sur tout le cercle) → REJETÉE.
 *
 * **Preuve de la forme retenue** (`p=a+bi`, `p̄=a-bi`, `|p|²=a²+b²`) :
 * ```
 * |z-p|² = (z-p)(z̄-p̄) = zz̄ - p̄z - pz̄ + pp̄ = 1 - p̄z - pz̄ + |p|²        [zz̄=1, donné]
 * |1-p̄z|² = (1-p̄z)(1-p̄z)‾ = (1-p̄z)(1-pz̄) = 1 - pz̄ - p̄z + p̄p·zz̄ = 1 - p̄z - pz̄ + |p|²   [zz̄=1]
 * ```
 * Les deux expressions développées sont EXACTEMENT IDENTIQUES (`1 - p̄z - pz̄ + |p|²`) — CQFD,
 * `|z-p|²=|1-p̄z|²` dès que `zz̄=1`, donc `|z'|=|z-p|/|1-p̄z|=1`. Remarque : cette preuve n'a même pas
 * eu besoin de `z-z̄=2i·Im(z)` (les deux membres restent symboliques en `z,z̄` de bout en bout) — cette
 * seconde identité reste néanmoins RAPPELÉE dans les aides de l'écran 1 (utile si l'élève choisit de
 * développer `p̄z+pz̄` en `2a·Re(z)+2b·Im(z)`, une variante de présentation tout aussi valide, acceptée
 * par la vérification par échantillonnage — voir `moteur6e/verificationComplexesAvances.ts`).
 *
 * **Réciproque** (écran 3) : VRAIE, par symétrie de la transformation — `z=(z'+p)/(1+p̄z')` (résoudre
 * `z'=(z-p)/(1-p̄z)` pour `z` redonne EXACTEMENT la même forme avec `p` remplacé par `-p` — Blaschke
 * est une involution à un changement de signe de paramètre près), donc le MÊME argument s'applique
 * telle quelle à `z'` pour conclure `|z|=1`.
 *
 * ============================================================================
 * **Vérification numérique exhaustive AVANT tout code élève** (`familleC.test.ts`)
 * ============================================================================
 * `|f(z)|=1` pour de nombreux `φ` (`z=cos φ+i sin φ`) ET de nombreux `(a,b)` — confirme la preuve
 * algébrique ci-dessus par échantillonnage indépendant.
 *
 * `a,b` : petits entiers NON NULS (évite `p=0`, transformation identité, sans intérêt pédagogique).
 */

const BORNE = 3;

export function transformeeBlaschke(zRe: number, zIm: number, a: number, b: number): { re: number; im: number } {
  // Numérateur z-p.
  const numRe = zRe - a;
  const numIm = zIm - b;
  // Dénominateur 1 - p̄z = 1 - (a-bi)(zRe+zIm i) = 1 - [a*zRe + b*zIm] - i[a*zIm - b*zRe].
  const denRe = 1 - (a * zRe + b * zIm);
  const denIm = -(a * zIm - b * zRe);
  const denomNorme = denRe * denRe + denIm * denIm;
  return {
    re: (numRe * denRe + numIm * denIm) / denomNorme,
    im: (numIm * denRe - numRe * denIm) / denomNorme,
  };
}

/** `conjugueForce` absent : vraie transformation (le cercle unité est préservé) ou contre-exemple
 * z'=(z−p)/(1−pz), une chance sur deux (audit 6e ch. 5 : verdict de l'écran 3 jamais constant).
 * |p|² ≥ 2 (jamais |p|=1, qui annulerait le dénominateur sur le cercle) ; contre-exemple : p non
 * réel (b≠0), sinon les deux transformations coïncident. */
export function construireFamilleC(conjugueForce?: boolean): ExerciceComplexesC {
  const conjugue = conjugueForce ?? Math.random() < 0.5;
  let a = 0;
  let b = 0;
  do {
    a = tirerEntier(-BORNE, BORNE);
    b = tirerEntier(-BORNE, BORNE);
  } while (a * a + b * b < 2 || (!conjugue && b === 0));
  return { famille: "C", a, b, conjugue };
}
