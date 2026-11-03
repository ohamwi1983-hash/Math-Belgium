import type { CandidatEtudeLog, FamilleEtudeFonctionLogarithme } from "../../core6e/etudeFonctionLogarithme.types";

/**
 * Couche A (6e) — évaluation et cadrage des courbes du QCM graphique de `6gen21`, partagés par le
 * générateur (contrôle de discernabilité des distracteurs) et par la présentation (tracé Mafs,
 * export SVG) — une seule formule par famille, jamais réécrite côté ui.
 */

export interface ViewBoxEtudeFonctionLog {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Magnitude au-delà de laquelle un point est traité comme hors rendu (`null`) — évite qu'une
 * explosion locale (0⁺, racine du trinôme) n'alimente un chemin SVG illisible. */
const PLAFOND_RENDU = 1e6;

function formuleFamille(famille: FamilleEtudeFonctionLogarithme, p: Record<string, number>, x: number, domaineRestreint: boolean): number | null {
  switch (famille) {
    case "A":
      if (x <= 0) return null;
      return (p.k * (Math.log(x) + p.c)) / x;
    case "B": {
      if (x <= 0) return null;
      const puissance = Math.pow((p.bNum / p.bDen) * x, p.a * x);
      return p.c + 1 + p.s * (puissance - 1);
    }
    case "C": {
      const u = (x - p.p) * (x - p.p) - p.q * p.q;
      if (u === 0) return null;
      if (domaineRestreint && u < 0) return null;
      return p.m * Math.log(Math.abs(u));
    }
    case "D":
      return p.m * Math.log((x - p.p) * (x - p.p) + p.a * p.a);
    case "E":
      if (x <= 0) return null;
      return p.m * (Math.log(x) + p.s * (p.c / x));
  }
}

export function evaluerCandidatFamille(famille: FamilleEtudeFonctionLogarithme, candidat: CandidatEtudeLog, x: number): number | null {
  const v = formuleFamille(famille, candidat.params, x - candidat.decalageX, candidat.domaineRestreint);
  if (v === null || !Number.isFinite(v)) return null;
  const y = v + candidat.decalageY;
  if (Math.abs(y) > PLAFOND_RENDU) return null;
  return y;
}

/** Fenêtre X propre à chaque exercice (jamais recalculée au fil de la session) — englobe
 * l'extremum, les inflexions et les asymptotes de la VRAIE fonction. */
export function fenetreX(famille: FamilleEtudeFonctionLogarithme, reel: CandidatEtudeLog): [number, number] {
  const p = reel.params;
  switch (famille) {
    case "A":
      return [0.02, Math.max(3.5, 1.5 * Math.exp(1.5 - p.c))];
    case "B": {
      const b = p.bNum / p.bDen;
      const xMinimum = 1 / (b * Math.E);
      let x = xMinimum;
      while (x < 50 && Math.abs(Math.pow(b * x, p.a * x) - 1) < 5) x += 0.01;
      return [0.005, Math.max(x, 2.5 * xMinimum)];
    }
    case "C":
      return [p.p - p.q - 3, p.p + p.q + 3];
    case "D":
      return [p.p - 3 * p.a - 2, p.p + 3 * p.a + 2];
    case "E":
      return [0.02, Math.max(6, 3.2 * p.c)];
  }
}

function quantile(tries: number[], q: number): number {
  const i = Math.min(tries.length - 1, Math.max(0, Math.floor(q * (tries.length - 1))));
  return tries[i];
}

/** Cadrage Y d'un exercice : union des plages 2 %–98 % de CHAQUE candidat (hors voisinage des singularités) (la vraie fonction et
 * ses 3 distracteurs restent tous lisibles dans le même cadre) plus les valeurs remarquables
 * (asymptote horizontale, limite finie, extremum). Fenêtre X toujours celle de la vraie fonction. */
export function calculerViewBoxCandidats(famille: FamilleEtudeFonctionLogarithme, candidats: CandidatEtudeLog[], reel: CandidatEtudeLog, valeursRemarquables: number[]): ViewBoxEtudeFonctionLog {
  const [xMin, xMax] = fenetreX(famille, reel);
  const exclues = singularites(famille, reel);
  const plageReel = plageQuantiles(famille, reel, xMin, xMax, exclues) ?? [-1, 1];
  let yMin = plageReel[0];
  let yMax = plageReel[1];
  for (const v of valeursRemarquables) {
    yMin = Math.min(yMin, v);
    yMax = Math.max(yMax, v);
  }
  // Chaque distracteur élargit le cadre, mais au plus de 2 hauteurs de la vraie courbe de chaque
  // côté : un distracteur qui explose ne doit jamais aplatir la vraie fonction. Seul le symétrique
  // (« typeInverse », même amplitude que la vraie courbe) est toujours entièrement cadré.
  const etendue = Math.max(1, yMax - yMin);
  const borneBasse = yMin - 2 * etendue;
  const borneHaute = yMax + 2 * etendue;
  for (const c of candidats) {
    if (c === reel) continue;
    const plage = plageQuantiles(famille, c, xMin, xMax, exclues);
    if (plage === null) continue;
    const libre = c.type === "typeInverse";
    yMin = Math.min(yMin, libre ? plage[0] : Math.max(plage[0], borneBasse));
    yMax = Math.max(yMax, libre ? plage[1] : Math.min(plage[1], borneHaute));
  }
  const marge = Math.max(0.5, (yMax - yMin) * 0.12);
  return { xMin, xMax, yMin: yMin - marge, yMax: yMax + marge };
}

/** Abscisses où la vraie fonction (ou ses distracteurs) explose — exclues du calcul de cadrage
 * (une explosion locale ne doit pas écraser le reste de la courbe ; l'asymptote reste visible,
 * simplement coupée par le cadre). */
function singularites(famille: FamilleEtudeFonctionLogarithme, reel: CandidatEtudeLog): number[] {
  const p = reel.params;
  if (famille === "A" || famille === "E") return [0];
  if (famille === "C") return [p.p - p.q, p.p + p.q];
  return [];
}

function plageQuantiles(famille: FamilleEtudeFonctionLogarithme, c: CandidatEtudeLog, xMin: number, xMax: number, exclues: number[]): [number, number] | null {
  const valeurs: number[] = [];
  const N = 400;
  const rayon = 0.06 * (xMax - xMin);
  for (let i = 0; i <= N; i++) {
    const x = xMin + ((xMax - xMin) * i) / N;
    if (exclues.some((s) => Math.abs(x - s) < rayon)) continue;
    const y = evaluerCandidatFamille(famille, c, x);
    if (y !== null) valeurs.push(y);
  }
  if (valeurs.length === 0) return null;
  valeurs.sort((u, v) => u - v);
  return [quantile(valeurs, 0.02), quantile(valeurs, 0.98)];
}

/** Cadrage Y de la seule vraie fonction (même principe) — sert d'échelle pour régler l'amplitude
 * d'un distracteur avant de connaître le cadre final. */
export function calculerViewBoxReel(famille: FamilleEtudeFonctionLogarithme, reel: CandidatEtudeLog, valeursRemarquables: number[]): ViewBoxEtudeFonctionLog {
  const [xMin, xMax] = fenetreX(famille, reel);
  const plage = plageQuantiles(famille, reel, xMin, xMax, singularites(famille, reel)) ?? [-1, 1];
  let yMin = plage[0];
  let yMax = plage[1];
  for (const v of valeursRemarquables) {
    yMin = Math.min(yMin, v);
    yMax = Math.max(yMax, v);
  }
  const marge = Math.max(0.5, (yMax - yMin) * 0.2);
  return { xMin, xMax, yMin: yMin - marge, yMax: yMax + marge };
}

const N_DISCERNABILITE = 240;

/** Deux candidats sont DISCERNABLES si, sur au moins 10 % de la fenêtre, leurs tracés visibles
 * diffèrent d'au moins 8 % de la hauteur du cadre (ou si l'un est tracé là où l'autre n'existe
 * pas / sort du cadre). Chaque candidat doit en outre rester visible sur au moins 25 % de la
 * fenêtre — jamais une courbe entièrement hors cadre. */
export function candidatsDiscernables(famille: FamilleEtudeFonctionLogarithme, candidats: CandidatEtudeLog[], vb: ViewBoxEtudeFonctionLog): boolean {
  const hauteur = vb.yMax - vb.yMin;
  const visible = (y: number | null) => y !== null && y >= vb.yMin && y <= vb.yMax;
  const echantillons = candidats.map((c) => {
    const ys: (number | null)[] = [];
    for (let i = 0; i <= N_DISCERNABILITE; i++) {
      const x = vb.xMin + ((vb.xMax - vb.xMin) * i) / N_DISCERNABILITE;
      ys.push(evaluerCandidatFamille(famille, c, x));
    }
    return ys;
  });
  for (const ys of echantillons) {
    if (ys.filter(visible).length < 0.25 * ys.length) return false;
  }
  for (let i = 0; i < candidats.length; i++) {
    for (let j = i + 1; j < candidats.length; j++) {
      let differents = 0;
      for (let n = 0; n <= N_DISCERNABILITE; n++) {
        const a = echantillons[i][n];
        const b = echantillons[j][n];
        const va = visible(a);
        const vb2 = visible(b);
        if (!va && !vb2) continue;
        if (va !== vb2) differents++;
        else if (Math.abs((a as number) - (b as number)) >= 0.08 * hauteur) differents++;
      }
      if (differents < 0.1 * (N_DISCERNABILITE + 1)) return false;
    }
  }
  return true;
}

export function candidat(type: string, params: Record<string, number>, options: Partial<Pick<CandidatEtudeLog, "domaineRestreint" | "decalageX" | "decalageY">> = {}): CandidatEtudeLog {
  return { type, params, domaineRestreint: options.domaineRestreint ?? false, decalageX: options.decalageX ?? 0, decalageY: options.decalageY ?? 0 };
}
