import type { ExerciceModeleSaturation, VarianteModeleSaturation } from "../../core6e/modeleSaturation";
import type { Rat } from "../../ui6e/nombresExpoLotG";
import { rat } from "../../ui6e/nombresExpoLotG";

/**
 * Couche A — générateur de `6gen150` « Modèle L + C·qᵗ ». `Math.random()` seul (`?code=`).
 *
 * r = q^d ∈ {1/2, 2/3, 3/4, 4/5, 3/5} et |C| multiple du carré du dénominateur : les trois mesures
 * L + C, L + C·r, L + C·r² sont ENTIÈRES. Ordres de grandeur :
 * - refroidissement (thé, pièce à 18–22 °C, départ 60–95 °C, mesures toutes les 4, 5 ou 10 min) ;
 * - réchauffement (bouteille sortie du réfrigérateur à 2–8 °C, pièce à 20–24 °C, toutes les 10, 15
 *   ou 20 min) ;
 * - plafonnement (inscrits à une application, en milliers : départ 2–20, plafond 60–150, toutes les
 *   2, 3 ou 4 semaines).
 * Prévision en un instant entier qui n'est pas une date de mesure ; seuil entier strictement entre
 * la mesure initiale et L, atteint entre d/2 et 6d, à au moins 0,2 d'une date de mesure.
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const RAPPORTS: Rat[] = [rat(1, 2), rat(2, 3), rat(3, 4), rat(4, 5), rat(3, 5)];

interface Cadre {
  L: [number, number];
  depart: [number, number];
  pas: number[];
}
const CADRES: Record<VarianteModeleSaturation, Cadre> = {
  refroidissement: { L: [18, 22], depart: [60, 95], pas: [4, 5, 10] },
  rechauffement: { L: [20, 24], depart: [2, 8], pas: [10, 15, 20] },
  plafonnement: { L: [60, 150], depart: [2, 20], pas: [2, 3, 4] },
};

export function construire(variante: VarianteModeleSaturation): ExerciceModeleSaturation {
  const cadre = CADRES[variante];
  for (;;) {
    const r = parmi(RAPPORTS);
    const L = entier(cadre.L[0], cadre.L[1]);
    const d = parmi(cadre.pas);
    const unite = r.den * r.den;
    // C multiple de den² avec un départ dans le cadre.
    const candidats: number[] = [];
    for (let m0 = cadre.depart[0]; m0 <= cadre.depart[1]; m0++) if ((m0 - L) % unite === 0 && m0 !== L) candidats.push(m0 - L);
    if (candidats.length === 0) continue;
    const C = parmi(candidats);
    const rv = r.num / r.den;
    const mesures: [number, number, number] = [L + C, Math.round(L + C * rv), Math.round(L + C * rv * rv)];
    if (Math.abs(mesures[2] - mesures[1]) < 2) continue;
    const q = Math.pow(rv, 1 / d);
    const f = (t: number) => L + C * Math.pow(q, t);
    const instants: number[] = [];
    for (let t = 1; t <= 3 * d; t++) if (t % d !== 0) instants.push(t);
    const tPrev = parmi(instants);
    const seuils: { S: number; t: number }[] = [];
    const [bas, haut] = C > 0 ? [L + 1, mesures[0] - 1] : [mesures[0] + 1, L - 1];
    for (let S = bas; S <= haut; S++) {
      if (mesures.includes(S)) continue;
      const t = Math.log((S - L) / C) / Math.log(q);
      const k = Math.round(t / d);
      if (t > d / 2 && t < 6 * d && Math.abs(t - k * d) > 0.2 * d) seuils.push({ S, t });
    }
    if (seuils.length === 0) continue;
    const s = parmi(seuils);
    return {
      variante,
      L,
      C,
      r,
      d,
      mesures,
      q,
      tPrev,
      prevision: f(tPrev),
      seuil: s.S,
      tSeuil: s.t,
      cleCollecteur: `${variante}/r${r.num}_${r.den}/d${d}`,
    };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteModeleSaturation; label: string }[] = [
  { id: "refroidissement", label: "Refroidissement d'une tasse de thé" },
  { id: "rechauffement", label: "Réchauffement d'une bouteille sortie du réfrigérateur" },
  { id: "plafonnement", label: "Plafonnement des inscrits à une application" },
];

export function construireAvecVarianteId(id: VarianteModeleSaturation): ExerciceModeleSaturation {
  return construire(id);
}

export function genererExerciceModeleSaturation(): ExerciceModeleSaturation {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
