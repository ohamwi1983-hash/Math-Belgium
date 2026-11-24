import type { ExerciceProbaGeo, TypeSegment, VarianteProbaGeo } from "../../core6e/probabilitesGeometriques";

/**
 * Couche A — générateur de `6gen162` « Probabilités géométriques ». `Math.random()` seul (le
 * `?code=` rejoue le tirage). Nombres entiers choisis pour des réponses exactes lisibles ; le cas
 * particulier de la cible (disque central, une seule aire) est tiré AVANT les nombres (25 %).
 */

const parmi = <T,>(t: readonly T[]): T => t[Math.floor(Math.random() * t.length)]!;
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
export const PROBA_DISQUE_CENTRAL = 0.25;

const NOMS: [string, string][] = [
  ["Anna", "Bilal"],
  ["Chloé", "Diego"],
  ["Emma", "Farid"],
  ["Inès", "Jonas"],
  ["Léa", "Malik"],
];

function cible(): ExerciceProbaGeo {
  const centre = Math.random() < PROBA_DISQUE_CENTRAL;
  for (;;) {
    const R = entier(4, 12);
    if (centre) {
      const r = entier(1, R - 1);
      return { variante: "cible", R, r1: 0, r2: r };
    }
    const r1 = entier(1, R - 2);
    const r2 = entier(r1 + 1, R);
    // r1 + r2 = R : le rapport des longueurs (r2 − r1)/R donnerait la bonne réponse par hasard.
    if (r1 + r2 === R) continue;
    return { variante: "cible", R, r1, r2 };
  }
}

const FRACTIONS_INVERSE: [number, number][] = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
];

function cibleInverse(): ExerciceProbaGeo {
  const [k, m] = parmi(FRACTIONS_INVERSE);
  const R = m * parmi(m === 5 ? [2, 3, 4] : m === 4 ? [2, 3, 4, 5] : [3, 4, 5, 6]);
  return { variante: "cibleInverse", R, r: (R * k) / m };
}

function carreDisque(): ExerciceProbaGeo {
  return { variante: "carreDisque", c: parmi([4, 6, 8, 10, 12, 14, 16, 20]), hors: Math.random() < 0.5 };
}

function rectangleQuart(): ExerciceProbaGeo {
  const hors = Math.random() < 0.5;
  const l = entier(4, 10);
  const L = entier(l + 2, 14);
  const r = entier(2, l);
  return { variante: "rectangleQuart", L, l, r, hors };
}

function segment(): ExerciceProbaGeo {
  const type: TypeSegment = parmi(["entre", "loin", "grandMorceau"] as const);
  for (;;) {
    const L = parmi([6, 8, 10, 12, 15, 16, 20, 24, 30]);
    if (type === "entre") {
      const a = entier(1, L - 2);
      const b = entier(a + 1, L - 1);
      return { variante: "segment", L, type, a, b };
    }
    if (type === "loin") {
      const d = entier(1, Math.ceil(L / 2) - 1);
      if (2 * d >= L) continue;
      return { variante: "segment", L, type, a: d, b: 0 };
    }
    const m = entier(Math.floor(L / 2) + 1, L - 1);
    return { variante: "segment", L, type, a: m, b: 0 };
  }
}

const ATTENTES: Record<number, number[]> = { 30: [5, 10, 15], 40: [5, 10, 20], 60: [5, 10, 12, 15, 20, 30] };

function rendezVous(): ExerciceProbaGeo {
  const rencontre = Math.random() < 0.5;
  const T = parmi([30, 40, 60]);
  return { variante: "rendezVous", T, t: parmi(ATTENTES[T]!), rencontre, noms: parmi(NOMS), heure: parmi([12, 14, 16, 18]) };
}

export const CATALOGUE_VARIANTES: { id: VarianteProbaGeo; label: string }[] = [
  { id: "cible", label: "Cible : couronne (ou disque central)" },
  { id: "cibleInverse", label: "Cible : rayon du disque central à trouver" },
  { id: "carreDisque", label: "Carré et disque inscrit" },
  { id: "rectangleQuart", label: "Rectangle et quart de disque" },
  { id: "segment", label: "Point au hasard sur un segment" },
  { id: "rendezVous", label: "Rendez-vous (carré et bande)" },
];

export function construire(v: VarianteProbaGeo): ExerciceProbaGeo {
  switch (v) {
    case "cible":
      return cible();
    case "cibleInverse":
      return cibleInverse();
    case "carreDisque":
      return carreDisque();
    case "rectangleQuart":
      return rectangleQuart();
    case "segment":
      return segment();
    case "rendezVous":
      return rendezVous();
  }
}

export function construireAvecVariante(id: string): ExerciceProbaGeo {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceProbaGeo(): ExerciceProbaGeo {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
