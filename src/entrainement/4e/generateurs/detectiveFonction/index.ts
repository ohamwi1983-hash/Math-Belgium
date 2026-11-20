import type { ExerciceDetectiveFonction, IdDescriptionFonction, TypeErreurFonction, VarianteDetectiveFonction } from "../../core/detectiveFonction.types";

/**
 * Générateur de gen127 « Détective d'erreurs : fonction du second degré ». Tout le hasard passe par
 * `Math.random` : `genererAvecCode` le remplace par une graine (le QR code rouvre le MÊME exercice,
 * ordre des descriptions compris).
 *
 * Variante = exercice support. Le TYPE D'ERREUR (donc la ligne fausse) est tiré uniformément AVANT
 * les nombres ; les contraintes sur les nombres sont les mêmes pour les deux types d'une variante :
 * - sommet : b < 0 (le signe de b compte), x_S et y_S entiers non nuls ;
 * - canonique : a ∈ {−3, −2, 2, 3} (le nombre sorti du crochet change si on oublie a) ;
 * - image : x_S ≠ y_S (sinon l'image avec x_S serait juste) ;
 * - optimum : sommet HORS de [m ; M], à 1 à 3 unités de la borne la plus proche (dans les deux types).
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
function choisir<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
function melanger<T>(t: T[]): T[] {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
}

export const TYPES_PAR_VARIANTE: Record<VarianteDetectiveFonction, readonly TypeErreurFonction[]> = {
  sommet: ["bSansSigne", "signeXS"],
  canonique: ["nonMultiplieParA", "signeSommet"],
  image: ["allureInversee", "imageAvecXS"],
  optimum: ["sommetHorsDomaine", "variationInversee"],
};

/** Descriptions de l'écran 2 : la bonne + 3 leurres (toujours FAUX pour la copie de ce type). */
export const LEURRES: Record<TypeErreurFonction, IdDescriptionFonction[]> = {
  bSansSigne: ["signeXS", "leurreCarreNegatif", "leurreCoordInversees"],
  signeXS: ["bSansSigne", "leurreCarreNegatif", "leurreCoordInversees"],
  nonMultiplieParA: ["signeSommet", "leurreEvidence", "leurreCompletion"],
  signeSommet: ["nonMultiplieParA", "leurreEvidence", "leurreCompletion"],
  allureInversee: ["imageAvecXS", "signeXS", "leurreCarreNegatif"],
  imageAvecXS: ["allureInversee", "signeXS", "leurreCarreNegatif"],
  sommetHorsDomaine: ["variationInversee", "signeXS", "leurreAllure"],
  variationInversee: ["sommetHorsDomaine", "signeXS", "leurreCarreNegatif"],
};

export const CATALOGUE_VARIANTES: { id: VarianteDetectiveFonction; label: string }[] = [
  { id: "sommet", label: "Sommet par la formule (coefficients lus, abscisse du sommet)" },
  { id: "canonique", label: "Forme canonique (compléter le carré, a ≠ 1)" },
  { id: "image", label: "Image d'une fonction du second degré" },
  { id: "optimum", label: "Maximum ou minimum sur un intervalle" },
];

function tirer(variante: VarianteDetectiveFonction, type: TypeErreurFonction): ExerciceDetectiveFonction {
  for (;;) {
    let a: number, h: number, k: number;
    let m: number | null = null;
    let M: number | null = null;
    if (variante === "sommet") {
      a = choisir([-3, -2, -1, 1, 2, 3]);
      h = Math.sign(a) * entier(1, 5);
      k = nonNul(-12, 12);
    } else if (variante === "canonique") {
      a = choisir([-3, -2, 2, 3]);
      h = nonNul(-5, 5);
      k = nonNul(-12, 12);
    } else if (variante === "image") {
      a = choisir([-3, -2, -1, 1, 2, 3]);
      h = nonNul(-5, 5);
      k = nonNul(-12, 12);
      if (k === h) continue;
    } else {
      a = choisir([-2, -1, 1, 2]);
      h = nonNul(-5, 6);
      k = entier(-10, 20);
      const longueur = entier(2, 5);
      const ecart = entier(1, 3);
      if (Math.random() < 0.5) {
        M = h - ecart;
        m = M - longueur;
      } else {
        m = h + ecart;
        M = m + longueur;
      }
      const f = (x: number) => a * (x - h) * (x - h) + k;
      if (Math.abs(f(m)) > 60 || Math.abs(f(M)) > 60) continue;
    }
    const b = -2 * a * h;
    const c = a * h * h + k;
    if (Math.abs(c) > 40 || b === 0) continue;
    return { variante, type, a, b, c, h, k, m, M, options: [] };
  }
}

export function genererDetectiveFonction(variante: VarianteDetectiveFonction): ExerciceDetectiveFonction {
  const type = choisir(TYPES_PAR_VARIANTE[variante]);
  const e = tirer(variante, type);
  return { ...e, options: melanger([type, ...LEURRES[type]]) };
}

export function construireAvecVariante(id: string): ExerciceDetectiveFonction {
  if (!CATALOGUE_VARIANTES.some((v) => v.id === id)) return genererExerciceDetectiveFonction();
  return genererDetectiveFonction(id as VarianteDetectiveFonction);
}

export function genererExerciceDetectiveFonction(): ExerciceDetectiveFonction {
  return genererDetectiveFonction(choisir(CATALOGUE_VARIANTES).id);
}
