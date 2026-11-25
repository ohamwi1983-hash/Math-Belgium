import type { ContexteNormal, ExerciceLoiNormaleA, ExerciceLoiNormaleB, ExerciceLoiNormaleC, ExerciceLoiNormaleD, ExerciceLoiNormaleE, FormeInverse } from "../../core6e/loiNormale.types";
import { arrondir, choisirEquations, optionsFormes, pDepuisT } from "./calculs";

/**
 * Familles de `6gen51` (audit, lot C).
 * - A : Z ∼ 𝒩(0 ; 1), sens direct : écrire la probabilité avec Φ (choix), puis la calculer.
 * - B : X ∼ 𝒩(μ ; σ) en contexte (tailles, masses, durées… μ > 0, σ plausible) : z, écriture avec Φ,
 *   probabilité, effectif éventuel. Les x sont choisis pour que z tombe pile au centième : une seule
 *   lecture de table.
 * - C : sens inverse sur Z, quatre formes (≤, ≥, centrée, depuis 0), avec les cas de cible NÉGATIVE
 *   (symétrie) : équation de table (choix), puis t.
 * - D : sens inverse sur X en contexte : équation (choix), z, puis la borne a = μ + zσ.
 * - E : règle empirique 68,3 / 95,4 / 99,7 % : nombre d'écarts-types, proportion, effectif éventuel.
 */

function tirerEntier(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function tirerParmi<T>(l: readonly T[]): T {
  return l[Math.floor(Math.random() * l.length)];
}

interface ModeleContexte extends ContexteNormal {
  mus: number[];
  sigmas: number[];
}

export const CONTEXTES: ModeleContexte[] = [
  { id: "tailles", sujet: "la taille (en cm) d'un adulte d'une région, choisi au hasard", unite: "cm", individus: "adultes", mus: [165, 168, 170, 172, 175], sigmas: [4, 5, 8, 10] },
  { id: "cafe", sujet: "la masse (en g) d'un paquet de café rempli par une machine", unite: "g", individus: "paquets", mus: [248, 250, 252, 500], sigmas: [2, 4, 5] },
  { id: "trajet", sujet: "la durée (en min) du trajet domicile-école d'un élève", unite: "min", individus: "élèves", mus: [25, 30, 35, 40], sigmas: [4, 5, 8] },
  { id: "examen", sujet: "la note (sur 100) d'un candidat à un examen", unite: "points", individus: "candidats", mus: [55, 60, 62, 65], sigmas: [8, 10] },
  { id: "ampoules", sujet: "la durée de vie (en h) d'une ampoule d'un modèle donné", unite: "h", individus: "ampoules", mus: [800, 1000, 1200], sigmas: [50, 100, 120] },
  { id: "pommes", sujet: "la masse (en g) d'une pomme d'un verger", unite: "g", individus: "pommes", mus: [150, 160, 180], sigmas: [10, 12, 20] },
];

function contexteSeul(c: ModeleContexte): ContexteNormal {
  return { id: c.id, sujet: c.sujet, unite: c.unite, individus: c.individus };
}

/** Une valeur x = μ + zσ (z au centième, |z| ≤ 2,5, pas trop près de 0) avec au plus une décimale. */
function tirerXZ(mu: number, sigma: number): { x: number; z: number } {
  for (;;) {
    const z = tirerEntier(-250, 250) / 100;
    if (Math.abs(z) < 0.1) continue;
    const x = mu + z * sigma;
    if (Math.abs(x * 10 - Math.round(x * 10)) < 1e-6 && x > 0) return { x: arrondir(x, 1), z };
  }
}

export function construireFamilleA(sousType?: ExerciceLoiNormaleA["sousType"]): ExerciceLoiNormaleA {
  const st = sousType ?? tirerParmi(["inferieur", "superieur", "intervalle"] as const);
  // Signe tiré d'abord (verdict de la forme Φ / 1 − Φ : 50 / 50).
  const tirerZ = () => (tirerEntier(5, 309) / 100) * (Math.random() < 0.5 ? -1 : 1);
  if (st !== "intervalle") return { famille: "A", sousType: st, z1: tirerZ(), z2: null, options: optionsFormes(st) };
  for (;;) {
    let a = tirerZ();
    let b = tirerZ();
    if (Math.abs(a - b) < 0.2) continue;
    if (a > b) [a, b] = [b, a];
    return { famille: "A", sousType: st, z1: a, z2: b, options: optionsFormes(st) };
  }
}

export function construireFamilleB(sousType?: ExerciceLoiNormaleB["sousType"]): ExerciceLoiNormaleB {
  const st = sousType ?? tirerParmi(["inferieur", "superieur", "intervalle"] as const);
  const c = tirerParmi(CONTEXTES);
  const mu = tirerParmi(c.mus);
  const sigma = tirerParmi(c.sigmas);
  const population = Math.random() < 0.5 ? tirerParmi([500, 800, 1000, 2000, 2500, 5000]) : null;
  const a = tirerXZ(mu, sigma);
  if (st !== "intervalle") return { famille: "B", sousType: st, contexte: contexteSeul(c), mu, sigma, x1: a.x, x2: null, population, options: optionsFormes(st) };
  for (;;) {
    const b = tirerXZ(mu, sigma);
    if (Math.abs(a.z - b.z) < 0.2) continue;
    const [x1, x2] = a.x < b.x ? [a.x, b.x] : [b.x, a.x];
    return { famille: "B", sousType: st, contexte: contexteSeul(c), mu, sigma, x1, x2, population, options: optionsFormes(st) };
  }
}

const FORMES_C: FormeInverse[] = ["inferieur", "superieur", "centre", "depuisZero"];

export function construireFamilleC(sousType?: FormeInverse): ExerciceLoiNormaleC {
  const forme = sousType ?? tirerParmi(FORMES_C);
  for (;;) {
    const signe = forme === "inferieur" || forme === "superieur" ? (Math.random() < 0.5 ? -1 : 1) : 1;
    const t = (tirerEntier(forme === "centre" ? 10 : 5, 299) / 100) * signe;
    const p = pDepuisT(forme, t);
    if (p <= 0.0005 || p >= 0.9995 || Math.abs(p - 0.5) < 1e-9) continue;
    const { equations, bonne } = choisirEquations(forme, p);
    return { famille: "C", sousType: forme, p, t, equations, bonne };
  }
}

export function construireFamilleD(sousType?: FormeInverse): ExerciceLoiNormaleD {
  const forme = sousType ?? tirerParmi(FORMES_C);
  const c = tirerParmi(CONTEXTES);
  const mu = tirerParmi(c.mus);
  const sigma = tirerParmi(c.sigmas);
  for (;;) {
    const { z } = tirerXZ(mu, sigma);
    const zz = forme === "centre" || forme === "depuisZero" ? Math.abs(z) : z;
    const p = pDepuisT(forme, zz);
    if (p <= 0.001 || p >= 0.999) continue;
    const { equations, bonne } = choisirEquations(forme, p);
    return { famille: "D", sousType: forme, contexte: contexteSeul(c), mu, sigma, p, z: zz, equations, bonne };
  }
}

export function construireFamilleE(unCote?: boolean): ExerciceLoiNormaleE {
  const c = tirerParmi(CONTEXTES);
  const mu = tirerParmi(c.mus);
  const sigma = tirerParmi(c.sigmas);
  const k = tirerParmi([1, 2, 3] as const);
  const cote = unCote ?? Math.random() < 0.5;
  return {
    famille: "E",
    contexte: contexteSeul(c),
    mu,
    sigma,
    k,
    unCote: cote,
    coteDemande: Math.random() < 0.5 ? "superieur" : "inferieur",
    population: Math.random() < 0.5 ? tirerParmi([500, 1000, 2000, 4000, 10000]) : null,
  };
}
