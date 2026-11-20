import type { ExerciceRelevesSinusoide, LigneReleve, VarianteReleves } from "../../core5e/relevesSinusoide";
import { heureMinutesT } from "../../ui5e/nombresTrigo";

export type IdVarianteReleves = VarianteReleves;

/**
 * Couche A — générateur de `5gen57` « Modéliser des relevés réels par une sinusoïde ». `Math.random()`
 * seul (`?code=`). Ordres de grandeur réels (sources non citées, valeurs arrondies) :
 * - marée semi-diurne : 12 h 24 min entre deux pleines mers ; mer du Nord (pleine mer 4,2–5 m,
 *   basse mer 0,3–1 m), côte bretonne (pleine mer 10,5–12,5 m, basse mer 1–2,5 m) ;
 * - durée du jour aux solstices (heures décimales) : Bruxelles 8,13 / 16,37, Oslo 5,88 / 18,83,
 *   Stockholm 6,12 / 18,62, Madrid 9,28 / 15,05, Rome 9,10 / 15,23, Montréal 8,70 / 15,68 ;
 *   maximum le 21 juin (jour 171 depuis le 1er janvier), période 365 jours ;
 * - températures moyennes mensuelles (janvier / juillet, ± 0,4 °C d'une année à l'autre) : Bruxelles
 *   3,4 / 18,4, Marseille 7,5 / 24,8, Madrid 6,3 / 25,6, Oslo −2,9 / 17,3, Montréal −9,7 / 21,2 ;
 *   minimum mi-janvier, maximum mi-juillet, période 12 mois.
 * Les relevés du tableau sont les valeurs de la sinusoïde arrondies à la précision affichée : les
 * extrêmes du tableau sont ceux du modèle, qui suit donc les relevés.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
const arr = (x: number, d: number) => Math.round(x * 10 ** d) / 10 ** d;

interface Base {
  lieu: string;
  unite: string;
  uniteTemps: string;
  decimales: number;
  max: number;
  min: number;
  T: number;
  tDonnee: boolean;
  tMax: number;
  instants: { libelle: string; t: number; heure?: string }[];
  previsions: { libelle: string; t: number }[];
  seuils: number[];
  decimalesDuree: number;
}

function baseMaree(): Base {
  const bretagne = Math.random() < 0.4;
  const H = bretagne ? entier(105, 125) / 10 : entier(42, 50) / 10;
  const L = bretagne ? entier(10, 25) / 10 : entier(3, 10) / 10;
  const t1 = entier(10, 50) / 10;
  const T = 12.4;
  const A = (H - L) / 2;
  const b = (H + L) / 2;
  const previsions: { libelle: string; t: number }[] = [];
  for (let h = Math.ceil(t1 + 0.6); h <= t1 + T - 0.6; h++) if (Math.abs(h - (t1 + T / 2)) > 0.6 && h < 24) previsions.push({ libelle: `à ${h} h`, t: h });
  const seuils: number[] = [];
  for (let s = Math.ceil((b - 0.75 * A) * 10); s <= Math.floor((b + 0.75 * A) * 10); s++) if (Math.abs((s / 10 - b) / A) >= 0.1) seuils.push(s / 10);
  return {
    lieu: bretagne ? "un port de la côte bretonne" : "un port de la mer du Nord",
    unite: "m",
    uniteTemps: "h",
    decimales: 1,
    max: H,
    min: L,
    T,
    tDonnee: false,
    tMax: t1,
    instants: [
      { libelle: "pleine mer", t: t1, heure: heureMinutesT(t1) },
      { libelle: "basse mer", t: arr(t1 + T / 2, 4), heure: heureMinutesT(t1 + T / 2) },
      { libelle: "pleine mer", t: arr(t1 + T, 4), heure: heureMinutesT(t1 + T) },
    ],
    previsions,
    seuils,
    decimalesDuree: 2,
  };
}

const VILLES_JOUR: [string, number, number][] = [
  ["Bruxelles", 8.13, 16.37],
  ["Oslo", 5.88, 18.83],
  ["Stockholm", 6.12, 18.62],
  ["Madrid", 9.28, 15.05],
  ["Rome", 9.1, 15.23],
  ["Montréal", 8.7, 15.68],
];

function baseJour(): Base {
  const [lieu, min, max] = parmi(VILLES_JOUR);
  const seuils: number[] = [];
  const A = (max - min) / 2;
  const b = (max + min) / 2;
  for (let s = Math.ceil(min + 1); s <= Math.floor(max - 1); s++) if (Math.abs((s - b) / A) <= 0.8 && Math.abs((s - b) / A) >= 0.1) seuils.push(s);
  return {
    lieu,
    unite: "h",
    uniteTemps: "jours",
    decimales: 2,
    max,
    min,
    T: 365,
    tDonnee: true,
    tMax: 171,
    instants: [
      { libelle: "21 janvier", t: 20 },
      { libelle: "21 mars", t: 79 },
      { libelle: "21 avril", t: 110 },
      { libelle: "21 juin", t: 171 },
      { libelle: "21 août", t: 232 },
      { libelle: "21 octobre", t: 293 },
      { libelle: "21 décembre", t: 354 },
    ],
    previsions: [
      { libelle: "le 1er février", t: 31 },
      { libelle: "le 1er mai", t: 120 },
      { libelle: "le 15 juillet", t: 195 },
      { libelle: "le 1er septembre", t: 243 },
      { libelle: "le 15 novembre", t: 318 },
    ],
    seuils,
    decimalesDuree: 0,
  };
}

const VILLES_TEMP: [string, number, number][] = [
  ["Bruxelles", 3.4, 18.4],
  ["Marseille", 7.5, 24.8],
  ["Madrid", 6.3, 25.6],
  ["Oslo", -2.9, 17.3],
  ["Montréal", -9.7, 21.2],
];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function baseTemperature(): Base {
  const [lieu, jan, jul] = parmi(VILLES_TEMP);
  const min = arr(jan + entier(-4, 4) / 10, 1);
  const max = arr(jul + entier(-4, 4) / 10, 1);
  const A = (max - min) / 2;
  const b = (max + min) / 2;
  const seuils: number[] = [];
  for (let s = Math.ceil(b - 0.75 * A); s <= Math.floor(b + 0.75 * A); s++) if (Math.abs((s - b) / A) >= 0.1) seuils.push(s);
  return {
    lieu,
    unite: "°C",
    uniteTemps: "mois",
    decimales: 1,
    max,
    min,
    T: 12,
    tDonnee: true,
    tMax: 6.5,
    instants: MOIS.map((m, i) => ({ libelle: m, t: i + 0.5 })),
    previsions: [2, 3, 4, 5, 8, 9, 10].map((t) => ({ libelle: `le 1er ${MOIS[t]}`, t })),
    seuils,
    decimalesDuree: 1,
  };
}

function construire(variante: VarianteReleves): ExerciceRelevesSinusoide {
  for (;;) {
    const base = variante === "maree" ? baseMaree() : variante === "jour" ? baseJour() : baseTemperature();
    if (base.previsions.length === 0 || base.seuils.length === 0) continue;
    const A = arr((base.max - base.min) / 2, 4);
    const b = arr((base.max + base.min) / 2, 4);
    const omega = (2 * Math.PI) / base.T;
    const phi = Math.PI / 2 - omega * base.tMax;
    const f = (t: number) => A * Math.sin(omega * t + phi) + b;
    const releves: LigneReleve[] = base.instants.map((x) => ({ ...x, valeur: arr(f(x.t), base.decimales) }));
    // Honnêteté : les extrêmes du tableau sont exactement max et min.
    if (Math.max(...releves.map((r) => r.valeur)) !== base.max || Math.min(...releves.map((r) => r.valeur)) !== base.min) continue;
    const prev = parmi(base.previsions);
    const seuil = parmi(base.seuils);
    const m = (seuil - b) / A;
    const a1 = Math.asin(m);
    return {
      variante,
      lieu: base.lieu,
      unite: base.unite,
      uniteTemps: base.uniteTemps,
      decimales: base.decimales,
      releves,
      max: base.max,
      min: base.min,
      T: base.T,
      tDonnee: base.tDonnee,
      tMax: base.tMax,
      tMin: arr(base.tMax + base.T / 2, 4),
      A,
      b,
      omega,
      phi,
      tPrev: prev.t,
      libellePrev: prev.libelle,
      prevision: f(prev.t),
      seuil,
      mSeuil: m,
      uSeuil: [a1, Math.PI - a1],
      duree: (Math.PI - 2 * a1) / omega,
      decimalesDuree: base.decimalesDuree,
      cleCollecteur: `${variante}/${base.lieu}`,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVarianteReleves; label: string }[] = [
  { id: "maree", label: "Marée : heures et hauteurs des pleines et basses mers" },
  { id: "jour", label: "Durée du jour au fil de l'année (selon la ville)" },
  { id: "temperature", label: "Températures moyennes mensuelles" },
];

export function construireAvecVarianteId(id: IdVarianteReleves): ExerciceRelevesSinusoide {
  return construire(id);
}

export function genererExerciceRelevesSinusoide(): ExerciceRelevesSinusoide {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
