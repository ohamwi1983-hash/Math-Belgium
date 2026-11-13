import type { Morceau } from "../core/inequation.types";
import type { ComparateurGraphique, CourbeGraphique, PointCle } from "../core/graphiqueContexte.types";

/**
 * gen70 — courbe d'un exercice « graphique en contexte » : évaluation et lectures EXACTES.
 *
 * Toutes les lectures demandées tombent sur des nœuds de la grille : par construction (voir
 * `generateurs/graphiqueContexte`), la courbe ne franchit un niveau k qu'en un point-clé, et elle est
 * monotone entre deux points-clés consécutifs (interpolation monotone ou segment). Les réponses se
 * calculent donc sur les points-clés seuls — jamais par échantillonnage de la courbe.
 */

const EPS = 1e-9;

/** Pentes de l'interpolation cubique monotone de Fritsch–Carlson (formule de Fritsch–Butland aux
 * points intérieurs, même traitement des extrémités que la PCHIP usuelle) : pente nulle en chaque
 * sommet/creux, donc extremums exactement aux points-clés et aucun dépassement entre deux points. */
export function pentesPchip(points: PointCle[]): number[] {
  const n = points.length;
  const h: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(points[i + 1]!.x - points[i]!.x);
    d.push((points[i + 1]!.y - points[i]!.y) / h[i]!);
  }
  if (n === 2) return [d[0]!, d[0]!];
  const m: number[] = new Array(n).fill(0);
  for (let k = 1; k < n - 1; k++) {
    const d0 = d[k - 1]!;
    const d1 = d[k]!;
    if (d0 * d1 <= 0) {
      m[k] = 0;
    } else {
      const w1 = 2 * h[k]! + h[k - 1]!;
      const w2 = h[k]! + 2 * h[k - 1]!;
      m[k] = (w1 + w2) / (w1 / d0 + w2 / d1);
    }
  }
  m[0] = penteExtremite(h[0]!, h[1]!, d[0]!, d[1]!);
  m[n - 1] = penteExtremite(h[n - 2]!, h[n - 3]!, d[n - 2]!, d[n - 3]!);
  return m;
}

function penteExtremite(h0: number, h1: number, d0: number, d1: number): number {
  let m = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
  if (Math.sign(m) !== Math.sign(d0)) m = 0;
  else if (Math.sign(d0) !== Math.sign(d1) && Math.abs(m) > Math.abs(3 * d0)) m = 3 * d0;
  return m;
}

export function evaluerCourbe(courbe: CourbeGraphique, x: number): number {
  if (courbe.type === "saturation") return courbe.L + courbe.A * Math.pow(2, -x / courbe.T);
  const p = courbe.points;
  if (x <= p[0]!.x) return p[0]!.y;
  if (x >= p[p.length - 1]!.x) return p[p.length - 1]!.y;
  let i = 0;
  while (i < p.length - 2 && x > p[i + 1]!.x) i++;
  const a = p[i]!;
  const b = p[i + 1]!;
  const h = b.x - a.x;
  const t = (x - a.x) / h;
  if (courbe.type === "lineaire") return a.y + t * (b.y - a.y);
  const ma = courbe.pentes[i]!;
  const mb = courbe.pentes[i + 1]!;
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * a.y + (t3 - 2 * t2 + t) * h * ma + (-2 * t3 + 3 * t2) * b.y + (t3 - t2) * h * mb;
}

function satisfait(y: number, k: number, comparateur: ComparateurGraphique): boolean {
  switch (comparateur) {
    case ">=":
      return y >= k - EPS;
    case ">":
      return y > k + EPS;
    case "<":
      return y < k - EPS;
    case "<=":
      return y <= k + EPS;
  }
}

/** Antécédents de k : abscisses des points-clés d'ordonnée k (la courbe ne franchit jamais k ailleurs,
 * voir en-tête). `null` si un palier est à la hauteur k (une infinité d'antécédents : exclu). */
export function antecedentsSurPoints(points: PointCle[], k: number): number[] | null {
  for (let i = 0; i < points.length - 1; i++) {
    if (Math.abs(points[i]!.y - k) < EPS && Math.abs(points[i + 1]!.y - k) < EPS) return null;
  }
  return points.filter((p) => Math.abs(p.y - k) < EPS).map((p) => p.x);
}

/** Vrai si un segment franchit k STRICTEMENT entre ses deux points-clés (lecture hors grille). */
export function franchitHorsPointCle(points: PointCle[], k: number): boolean {
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]!.y - k;
    const b = points[i + 1]!.y - k;
    if (a * b < -EPS) return true;
  }
  return false;
}

/**
 * Ensemble des x du domaine [x₀ ; xₙ] tels que f(x) ⋚ k, en morceaux d'intervalle (notation
 * francophone). Découpage en « atomes » : chaque point-clé, puis chaque intervalle ouvert entre deux
 * points-clés consécutifs (où f − k garde un signe constant : la courbe y est monotone et ne vaut k
 * qu'aux extrémités) ; les atomes vrais consécutifs se fusionnent. `null` si un morceau se réduit à un
 * point isolé ou si un palier est à la hauteur k (cas exclus par le générateur).
 */
export function solutionInequationSurPoints(points: PointCle[], k: number, comparateur: ComparateurGraphique): Morceau[] | null {
  type Atome = { gauche: number; droite: number; point: boolean; vrai: boolean };
  const atomes: Atome[] = [];
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!;
    atomes.push({ gauche: p.x, droite: p.x, point: true, vrai: satisfait(p.y, k, comparateur) });
    if (i < points.length - 1) {
      const q = points[i + 1]!;
      if (Math.abs(p.y - k) < EPS && Math.abs(q.y - k) < EPS) return null;
      const milieu = (p.y + q.y) / 2;
      atomes.push({ gauche: p.x, droite: q.x, point: false, vrai: satisfait(milieu, k, comparateur) });
    }
  }
  const morceaux: Morceau[] = [];
  let debut: Atome | null = null;
  let fin: Atome | null = null;
  const clore = () => {
    if (!debut || !fin) return;
    morceaux.push({
      crochetGauche: debut.point ? "[" : "]",
      borneGauche: debut.gauche,
      crochetDroit: fin.point ? "]" : "[",
      borneDroite: fin.droite,
    });
  };
  for (const a of atomes) {
    if (a.vrai) {
      if (!debut) debut = a;
      fin = a;
    } else {
      clore();
      debut = null;
      fin = null;
    }
  }
  clore();
  if (morceaux.some((m) => m.borneGauche === m.borneDroite)) return null;
  return morceaux;
}

/** Intervalles (fermés) sur lesquels la courbe monte (`croissante`) ou descend (`decroissante`) —
 * les paliers n'en font jamais partie. */
export function intervallesVariationSurPoints(points: PointCle[], sens: "croissante" | "decroissante"): Morceau[] {
  const morceaux: Morceau[] = [];
  let debut: number | null = null;
  let fin: number | null = null;
  for (let i = 0; i < points.length - 1; i++) {
    const delta = points[i + 1]!.y - points[i]!.y;
    const bon = sens === "croissante" ? delta > EPS : delta < -EPS;
    if (bon) {
      if (debut === null) debut = points[i]!.x;
      fin = points[i + 1]!.x;
    } else if (debut !== null && fin !== null) {
      morceaux.push({ crochetGauche: "[", borneGauche: debut, crochetDroit: "]", borneDroite: fin });
      debut = null;
      fin = null;
    }
  }
  if (debut !== null && fin !== null) morceaux.push({ crochetGauche: "[", borneGauche: debut, crochetDroit: "]", borneDroite: fin });
  return morceaux;
}

/** Point-clé le plus haut (`max`) ou le plus bas (`min`) ; `null` s'il n'est pas unique (ex-aequo ou
 * palier à cette hauteur). */
export function extremumSurPoints(points: PointCle[], nature: "max" | "min"): PointCle | null {
  const valeurs = points.map((p) => p.y);
  const cible = nature === "max" ? Math.max(...valeurs) : Math.min(...valeurs);
  const atteints = points.filter((p) => Math.abs(p.y - cible) < EPS);
  return atteints.length === 1 ? atteints[0]! : null;
}

/** Abscisses des sommets, creux et extrémités de paliers (changements de sens de variation), sans les
 * bornes du domaine — repères tracés par l'aide 2 d'une question de variations. */
export function pointsDeChangement(points: PointCle[]): PointCle[] {
  const signe = (i: number) => Math.sign(Math.round((points[i + 1]!.y - points[i]!.y) * 1e6));
  const resultat: PointCle[] = [];
  for (let i = 1; i < points.length - 1; i++) {
    if (signe(i - 1) !== signe(i)) resultat.push(points[i]!);
  }
  return resultat;
}
