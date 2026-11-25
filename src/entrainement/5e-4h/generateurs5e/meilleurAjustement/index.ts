import type { ExerciceMeilleurAjustement, VarianteMeilleurAjustement } from "../../core5e/meilleurAjustement";
import type { Droite, Point2 } from "../../core5e/statistiqueLotH2";
import { arrondi, decimalesAuPlus, entier, gauss, mayer, melanger, moindresCarres, parmi, resume, sommeCarres } from "../../core5e/statistiqueLotH2";

/**
 * Couche A — générateur de `5gen79` « Quel est le meilleur ajustement ? ». `Math.random()` seul
 * (`?code=`). Verdict tiré EN PREMIER (deuxDroites : la droite gagnante, mayerMoindres : la place de
 * la droite des moindres carrés), puis les nombres, construits pour que le calcul à la main reste
 * court : données entières, coefficients au dixième (deuxDroites : carrés au centième) ou à deux
 * décimales EXACTES (mayerMoindres : moyennes, Mayer et moindres carrés vérifiés exacts). Les sommes
 * des carrés diffèrent assez pour que le verdict ne tienne pas à un arrondi. aberrant : huit relevés
 * réalistes presque alignés (|r| ≥ 0,93 sans le point), un point déplacé dans le sens du contexte
 * (travaux, logement à loyer modéré, élève malade, voiture accidentée), rang tiré uniformément.
 */

const uniforme = (a: number, b: number) => a + Math.random() * (b - a);
const VIDE: [Droite, Droite] = [
  { a: 0, b: 0 },
  { a: 0, b: 0 },
];

interface ParamsDeux {
  debut: number;
  alpha: [number, number];
  beta: [number, number];
}
const PARAMS_DEUX: ParamsDeux[] = [
  { debut: 2, alpha: [-4, -2.5], beta: [28, 34] },
  { debut: 1, alpha: [1, 2], beta: [5, 8] },
  { debut: 1, alpha: [-2.5, -1.2], beta: [16, 22] },
];

function deuxDroites(gagnante: 0 | 1): ExerciceMeilleurAjustement {
  const contexte = entier(0, PARAMS_DEUX.length - 1);
  const p = PARAMS_DEUX[contexte]!;
  for (;;) {
    const alpha = uniforme(...p.alpha);
    const beta = uniforme(...p.beta);
    const points: Point2[] = Array.from({ length: 6 }, (_, i) => {
      const x = p.debut + i;
      return { x, y: Math.round(alpha * x + beta + 1.3 * gauss()) };
    });
    if (points.some((q) => q.y <= 0 || q.y > 40)) continue;
    const s = resume(points);
    if (Math.abs(s.r) < 0.85) continue;
    const ligne = (da: number, db: number): Droite => {
      const a = arrondi(s.a + da, 1);
      return { a, b: arrondi(s.my - a * s.mx + db, 1) };
    };
    const d1 = ligne(uniforme(-0.15, 0.15), uniforme(-0.3, 0.3));
    const d2 = ligne(parmi([-1, 1]) * uniforme(0.2, 0.6), uniforme(-0.8, 0.8));
    if (d1.a === d2.a && d1.b === d2.b) continue;
    if (d1.a === 0 || d2.a === 0) continue;
    const s1 = sommeCarres(points, d1);
    const s2 = sommeCarres(points, d2);
    if (Math.abs(s1 - s2) < Math.max(0.6, 0.08 * Math.min(s1, s2)) || Math.max(s1, s2) > 40) continue;
    const meilleure = s1 < s2 ? d1 : d2;
    const autre = s1 < s2 ? d2 : d1;
    const droites: [Droite, Droite] = gagnante === 0 ? [meilleure, autre] : [autre, meilleure];
    const candidatsEcart = points.map((_, i) => i).filter((i) => Math.abs(points[i]!.y - (droites[0].a * points[i]!.x + droites[0].b)) > 0.05);
    if (candidatsEcart.length === 0) continue;
    return { variante: "deuxDroites", contexte, points, droites, gagnante, indiceEcart: parmi(candidatsEcart), indiceAberrant: -1, candidats: [], x0: 0, decY: 0 };
  }
}

const PARAMS_MAYER: { xmax: number; alpha: [number, number]; beta: [number, number]; bruit: number }[] = [
  { xmax: 10, alpha: [0.8, 1.6], beta: [4, 8], bruit: 1.2 },
  { xmax: 12, alpha: [0.6, 1.5], beta: [1, 5], bruit: 1.2 },
  { xmax: 10, alpha: [1.2, 2.5], beta: [2, 6], bruit: 1.6 },
];

function mayerMoindres(gagnante: 0 | 1): ExerciceMeilleurAjustement {
  const contexte = entier(0, PARAMS_MAYER.length - 1);
  const p = PARAMS_MAYER[contexte]!;
  for (let essai = 0; ; essai++) {
    const xs = melanger(Array.from({ length: p.xmax }, (_, i) => i + 1)).slice(0, 6).sort((u, v) => u - v);
    const alpha = uniforme(...p.alpha);
    const beta = uniforme(...p.beta);
    const points = xs.map((x) => ({ x, y: Math.round(alpha * x + beta + p.bruit * gauss()) }));
    if (points.some((q) => q.y <= 0 || q.y > 30)) continue;
    const s = resume(points);
    if (!decimalesAuPlus(s.mx, 2) || !decimalesAuPlus(s.my, 2) || s.r < 0.75) continue;
    const ls = moindresCarres(points);
    const m = mayer(points).droite;
    if (![ls.a, ls.b, m.a, m.b].every((v) => decimalesAuPlus(v, 2))) continue;
    const sl = sommeCarres(points, ls);
    const sm = sommeCarres(points, m);
    if (sm - sl < 0.1 || sm > 40) continue;
    const exact = (d: Droite): Droite => ({ a: arrondi(d.a, 2), b: arrondi(d.b, 2) });
    const droites: [Droite, Droite] = gagnante === 0 ? [exact(ls), exact(m)] : [exact(m), exact(ls)];
    return { variante: "mayerMoindres", contexte, points, droites, gagnante, indiceEcart: -1, indiceAberrant: -1, candidats: [], x0: 0, decY: 0 };
  }
}

interface ParamsAberrant {
  xs: () => number[];
  alpha: [number, number];
  beta: [number, number];
  bruit: number;
  /** Déplacement du point aberrant, en fraction de l'étendue des y (signe : sens du contexte). */
  sens: 1 | -1;
  decY: number;
  pasY: number;
  x0: (xs: number[]) => number[];
}

const xsDistincts = (min: number, max: number, pas: number, n: number) =>
  melanger(Array.from({ length: Math.floor((max - min) / pas) + 1 }, (_, i) => min + i * pas)).slice(0, n).sort((u, v) => u - v);
const interieurs = (xs: number[], pas: number) => {
  const t: number[] = [];
  for (let v = xs[0]! + pas; v < xs[xs.length - 1]!; v += pas) if (!xs.includes(v)) t.push(v);
  return t;
};

export const PARAMS_ABERRANT: ParamsAberrant[] = [
  { xs: () => xsDistincts(14, 32, 1, 8), alpha: [8, 14], beta: [-90, -40], bruit: 10, sens: -1, decY: 0, pasY: 1, x0: (xs) => interieurs(xs, 1) },
  { xs: () => xsDistincts(35, 120, 5, 8), alpha: [8, 11], beta: [150, 300], bruit: 30, sens: -1, decY: 0, pasY: 5, x0: (xs) => interieurs(xs, 5) },
  { xs: () => xsDistincts(1, 15, 1, 8), alpha: [0.6, 1], beta: [4, 6], bruit: 0.6, sens: -1, decY: 0, pasY: 1, x0: (xs) => interieurs(xs, 1) },
  { xs: () => xsDistincts(20, 160, 10, 8), alpha: [-60, -40], beta: [15000, 19000], bruit: 400, sens: -1, decY: 0, pasY: 100, x0: (xs) => interieurs(xs, 10) },
];

function aberrant(): ExerciceMeilleurAjustement {
  const contexte = entier(0, PARAMS_ABERRANT.length - 1);
  const p = PARAMS_ABERRANT[contexte]!;
  const indiceAberrant = entier(0, 7);
  for (;;) {
    const xs = p.xs();
    const alpha = uniforme(...p.alpha);
    const beta = uniforme(...p.beta);
    const base = xs.map((x) => alpha * x + beta);
    const etendue = Math.abs(base[7]! - base[0]!);
    const points = xs.map((x, i) => {
      let y = alpha * x + beta + p.bruit * gauss();
      if (i === indiceAberrant) y += p.sens * uniforme(0.35, 0.55) * etendue;
      return { x, y: Math.round(y / p.pasY) * p.pasY };
    });
    if (points.some((q) => q.y <= 0) || (contexte === 2 && points.some((q) => q.y > 20))) continue;
    const tous = resume(points);
    const sans = resume(points.filter((_, i) => i !== indiceAberrant));
    if (Math.abs(sans.r) < 0.93 || Math.abs(sans.r) - Math.abs(tous.r) < 0.08) continue;
    // Le point aberrant est vraiment le plus éloigné de la droite tracée sans lui.
    const d = moindresCarres(points.filter((_, i) => i !== indiceAberrant));
    const ecarts = points.map((q) => Math.abs(q.y - (d.a * q.x + d.b)));
    if (ecarts.some((v, i) => i !== indiceAberrant && v > 0.4 * ecarts[indiceAberrant]!)) continue;
    const cands = p.x0(xs);
    if (cands.length === 0) continue;
    const autres = melanger(points.map((_, i) => i).filter((i) => i !== indiceAberrant)).slice(0, 3);
    const candidats = [indiceAberrant, ...autres].sort((u, v) => u - v);
    return { variante: "aberrant", contexte, points, droites: VIDE, gagnante: 0, indiceEcart: -1, indiceAberrant, candidats, x0: parmi(cands), decY: p.decY };
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteMeilleurAjustement; label: string }[] = [
  { id: "deuxDroites", label: "Deux droites proposées : somme des carrés des écarts" },
  { id: "mayerMoindres", label: "Mayer ou moindres carrés ? (droites données sans leur nom)" },
  { id: "aberrant", label: "Retirer un point aberrant et recalculer" },
];

export function construire(v: VarianteMeilleurAjustement): ExerciceMeilleurAjustement {
  if (v === "aberrant") return aberrant();
  const gagnante: 0 | 1 = Math.random() < 0.5 ? 0 : 1;
  return v === "deuxDroites" ? deuxDroites(gagnante) : mayerMoindres(gagnante);
}

export function construireAvecVarianteId(id: string): ExerciceMeilleurAjustement {
  return construire(CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceMeilleurAjustement(): ExerciceMeilleurAjustement {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
