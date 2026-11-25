import type { Pt } from "../ui6e/outilsLieuxLotH2";

/**
 * Couche core — `6gen129` « Courbe paramétrée : élimination et restriction » (6e ch. 9, § 6, processus 2
 * APPLIQUER). Un point M(x ; y) est donné par une représentation paramétrique x = f(t), y = g(t), t dans
 * un intervalle. Quatre écrans : la technique d'élimination (choix fermé : cos² t + sin² t = 1,
 * cos 2t = 2cos² t − 1, isoler t ou t², ou le leurre tan t = sin t / cos t), l'équation cartésienne
 * (champ), la PARTIE de la courbe réellement décrite (courbe entière, moitié, arc : VERDICT tiré en
 * premier, à parts égales), puis la condition qui décrit cette partie (choix fermé, absent pour la courbe
 * entière : quatre puces dans tous les cas).
 *
 * Supports (variantes) : cercle (a + r cos t ; b + r sin t), astroïde (A cos³ t ; A sin³ t), parabole
 * (p + t ; q + kt²), (p + st² ; q + kt⁴), (p + cos t ; q + k cos 2t), droite (p + at ; q + bt),
 * (p + at² ; q + bt²), (p + a cos² t ; q + b sin² t).
 */

export type VarianteCP = "cercle" | "astroide" | "parabole" | "droite";
export type PartieCP = "entiere" | "moitie" | "arc";
export type IdentiteCP = "pythagore" | "duplication" | "isoler" | "tangente";
export type PhaseCP = "identite" | "equation" | "partie" | "condition";

export interface ExerciceCP {
  variante: VarianteCP;
  partie: PartieCP;
  /** Cercle : centre (a ; b), rayon r ; astroïde : A = r (centre O). */
  a: number;
  b: number;
  r: number;
  /** Indice du demi-tour (0 : [0 ; π], 1 : [π/2 ; 3π/2], 2 : [π ; 2π], 3 : [−π/2 ; π/2]) ou du
   * quart de tour (i : [iπ/2 ; (i + 1)π/2]). */
  indice: number;
  /** Parabole et droite : point de départ (p ; q), coefficient k (parabole), direction (u ; v) (droite),
   * signe s de la demi-parabole. */
  p: number;
  q: number;
  k: number;
  u: number;
  v: number;
  s: 1 | -1;
  /** Ordre d'affichage des quatre conditions de l'écran 4. */
  ordre: number[];
}

export const phases = (e: ExerciceCP): PhaseCP[] => (e.partie === "entiere" ? ["identite", "equation", "partie"] : ["identite", "equation", "partie", "condition"]);

export function identite(e: ExerciceCP): IdentiteCP {
  if (e.variante === "cercle" || e.variante === "astroide") return "pythagore";
  if (e.variante === "parabole") return e.partie === "arc" ? "duplication" : "isoler";
  return e.partie === "arc" ? "pythagore" : "isoler";
}

/** Bornes de t (radians) de la partie décrite ; `null` : t ∈ ℝ. */
export function intervalleT(e: ExerciceCP): [number, number] | null {
  if (e.variante === "parabole" || e.variante === "droite") return null;
  if (e.partie === "entiere") return [0, 2 * Math.PI];
  if (e.partie === "moitie") {
    const debut = [0, Math.PI / 2, Math.PI, -Math.PI / 2][e.indice]!;
    return [debut, debut + Math.PI];
  }
  return [(e.indice * Math.PI) / 2, ((e.indice + 1) * Math.PI) / 2];
}

/** Point de paramètre t. */
export function point(e: ExerciceCP, t: number): Pt {
  switch (e.variante) {
    case "cercle":
      return { x: e.a + e.r * Math.cos(t), y: e.b + e.r * Math.sin(t) };
    case "astroide":
      return { x: e.r * Math.cos(t) ** 3, y: e.r * Math.sin(t) ** 3 };
    case "parabole":
      if (e.partie === "entiere") return { x: e.p + t, y: e.q + e.k * t * t };
      if (e.partie === "moitie") return { x: e.p + e.s * t * t, y: e.q + e.k * t ** 4 };
      return { x: e.p + Math.cos(t), y: e.q + e.k * Math.cos(2 * t) };
    case "droite":
      if (e.partie === "entiere") return { x: e.p + e.u * t, y: e.q + e.v * t };
      if (e.partie === "moitie") return { x: e.p + e.u * t * t, y: e.q + e.v * t * t };
      return { x: e.p + e.u * Math.cos(t) ** 2, y: e.q + e.v * Math.sin(t) ** 2 };
  }
}

/** Équation cartésienne attendue, comme fonction F(x, y) = 0 (astroïde : quart x, y ≥ 0). */
export function equationF(e: ExerciceCP): (p: Pt) => number {
  switch (e.variante) {
    case "cercle":
      return (m) => (m.x - e.a) ** 2 + (m.y - e.b) ** 2 - e.r * e.r;
    case "astroide": {
      const c = Math.round(Math.cbrt(e.r) ** 2);
      return (m) => Math.cbrt(m.x * m.x) + Math.cbrt(m.y * m.y) - c;
    }
    case "parabole":
      return e.partie === "arc" ? (m) => 2 * e.k * (m.x - e.p) ** 2 + e.q - e.k - m.y : (m) => e.k * (m.x - e.p) ** 2 + e.q - m.y;
    case "droite":
      return e.partie === "arc" ? (m) => e.v * (m.x - e.p) + e.u * (m.y - e.q) - e.u * e.v : (m) => e.v * (m.x - e.p) - e.u * (m.y - e.q);
  }
}

/** Points de la courbe COMPLÈTE (contrôle « même ensemble » ; astroïde : premier quadrant). */
export function pointsCourbe(e: ExerciceCP): Pt[] {
  const res: Pt[] = [];
  if (e.variante === "cercle") for (let i = 0; i < 11; i++) res.push({ x: e.a + e.r * Math.cos(0.3 + i * 0.57), y: e.b + e.r * Math.sin(0.3 + i * 0.57) });
  else if (e.variante === "astroide") for (let i = 1; i < 10; i++) res.push(point({ ...e }, (i * Math.PI) / 20));
  else if (e.variante === "parabole") {
    const k2 = e.partie === "arc" ? 2 * e.k : e.k;
    const c = e.partie === "arc" ? e.q - e.k : e.q;
    for (const dx of [-2.7, -1.3, -0.4, 0.6, 1.9, 3.1]) res.push({ x: e.p + dx, y: k2 * dx * dx + c });
  } else {
    for (const s of [-2.3, -0.7, 0.4, 1.6, 3.2]) {
      if (e.partie === "arc") res.push({ x: e.p + s * e.u, y: e.q + e.v - s * e.v });
      else res.push({ x: e.p + s * e.u, y: e.q + s * e.v });
    }
  }
  return res;
}

/** Points du plan hors de la courbe (premier quadrant pour l'astroïde). */
export function pointsHorsCourbe(e: ExerciceCP): Pt[] {
  if (e.variante === "astroide") {
    const r = e.r;
    return [
      { x: 0.11 * r, y: 0.13 * r },
      { x: 0.83 * r, y: 0.71 * r },
      { x: 0.37 * r, y: 0.09 * r },
      { x: 0.21 * r, y: 0.94 * r },
      { x: 1.3 * r, y: 0.4 * r },
    ];
  }
  return [
    { x: 0.37, y: 2.91 },
    { x: -1.73, y: 0.58 },
    { x: 2.46, y: -1.19 },
    { x: -3.11, y: -2.47 },
    { x: 4.27, y: 3.63 },
    { x: 1.13, y: -3.82 },
  ];
}

/** Extrémités de la partie décrite (aucune pour la courbe entière). */
export function extremites(e: ExerciceCP): Pt[] {
  if (e.partie === "entiere") return [];
  if (e.variante === "parabole") return e.partie === "moitie" ? [{ x: e.p, y: e.q }] : [{ x: e.p - 1, y: e.q + e.k }, { x: e.p + 1, y: e.q + e.k }];
  if (e.variante === "droite") return e.partie === "moitie" ? [{ x: e.p, y: e.q }] : [{ x: e.p + e.u, y: e.q }, { x: e.p, y: e.q + e.v }];
  const [t0, t1] = intervalleT(e)!;
  const arr = (m: Pt) => ({ x: Math.round(m.x * 1e9) / 1e9, y: Math.round(m.y * 1e9) / 1e9 });
  return [arr(point(e, t0)), arr(point(e, t1))];
}

// ---------------------------------------------------------------------------------------------
// Conditions de l'écran 4 (quatre par support, une seule juste ; jamais deux équivalentes)
// ---------------------------------------------------------------------------------------------

export interface ConditionCP {
  id: string;
  latex: string;
}

export const TOUS_LES_INDICES = [0, 1, 2, 3];
