import { phiExact } from "./tablePhi";

/**
 * Couche core — `6gen117` « Courbe de Gauss : aires et règle empirique » (6e ch. 8, § 6, processus 1
 * CONNAÎTRE). Quatre variantes, deux écrans chacune :
 * - `aire` : une aire colorée sous la cloche de 𝒩(0 ; 1) → quelle probabilité (choix), puis son
 *   écriture avec Φ en des nombres positifs (choix) ;
 * - `figure` : une probabilité écrite → laquelle des quatre figures A–D (choix), puis l'écriture avec Φ ;
 * - `regleEntre` : X ∼ 𝒩(μ ; σ) en contexte, intervalle [μ − kσ ; μ + kσ] (dedans ou dehors) → k, puis
 *   le pourcentage (règle empirique 68,3 / 95,4 / 99,7 %) ;
 * - `regleUnCote` : une seule borne (au-delà, en deçà, entre μ et une borne, en dessous) → k, puis le
 *   pourcentage (« un seul côté » : partage par symétrie).
 * Le TYPE d'aire (gauche, droite, entre, deux queues) est un verdict tiré au quart AVANT les nombres
 * (jamais dans `forme`).
 */

export type VarianteCG = "aire" | "figure" | "regleEntre" | "regleUnCote";
export type PhaseCG = "aire" | "figure" | "phi" | "k" | "pourcent";
export type TypeAire = "gauche" | "droite" | "entre" | "queues";
export type QuestionRegle = "entre" | "hors" | "auDela" | "enDeca" | "moitieHaut" | "moitieBas" | "sous" | "dessus";

export const VARIANTES_CG: VarianteCG[] = ["aire", "figure", "regleEntre", "regleUnCote"];
export const TYPES_AIRE: TypeAire[] = ["gauche", "droite", "entre", "queues"];

/** Une aire candidate (bornes en z, une décimale). */
export interface AireCG {
  type: TypeAire;
  a: number;
  b: number;
}

export interface ExerciceCG {
  variante: VarianteCG;
  /** Aire juste (aire, figure). */
  aire: AireCG;
  /** Ordre d'affichage des quatre candidates (options de l'écran 1, lettres A–D). */
  ordre: number[];
  /** Ordre d'affichage des écritures avec Φ (écran 2). */
  ordrePhi: string[];
  /** Règle empirique : contexte, μ, σ, k, question. */
  ctx: number;
  mu: number;
  sigma: number;
  k: 1 | 2 | 3;
  question: QuestionRegle;
}

export function phases(e: ExerciceCG): PhaseCG[] {
  if (e.variante === "aire") return ["aire", "phi"];
  if (e.variante === "figure") return ["figure", "phi"];
  return ["k", "pourcent"];
}

/** Les quatre aires candidates : une borne t → à gauche, à droite, entre −|t| et |t|, les deux queues ;
 * deux bornes a < b → entre, deux queues, à gauche de b, à droite de a. La juste est la 1ʳᵉ ou la 2ᵉ. */
export function candidates(x: AireCG): AireCG[] {
  if (x.type === "gauche" || x.type === "droite") {
    const t = x.a;
    const u = Math.abs(t);
    return [
      { type: "gauche", a: t, b: 0 },
      { type: "droite", a: t, b: 0 },
      { type: "entre", a: -u, b: u },
      { type: "queues", a: -u, b: u },
    ];
  }
  return [
    { type: "entre", a: x.a, b: x.b },
    { type: "queues", a: x.a, b: x.b },
    { type: "gauche", a: x.b, b: 0 },
    { type: "droite", a: x.a, b: 0 },
  ];
}

export const indexJuste = (e: ExerciceCG): number => (e.aire.type === "droite" || e.aire.type === "queues" ? 1 : 0);
export const memeAire = (x: AireCG, y: AireCG) => x.type === y.type && Math.abs(x.a - y.a) < 1e-9 && Math.abs(x.b - y.b) < 1e-9;

/** Écritures avec Φ (ids) d'une aire, et la juste. Une borne : Φ(u), 1 − Φ(u), Φ(u) − 0,5, 2Φ(u) − 1 ;
 * deux bornes (u = |a|) : Φ(b) − Φ(u), Φ(b) + Φ(u) − 1, 2 − Φ(b) − Φ(u), 1 − Φ(b) + Φ(u). */
export const IDS_PHI_UNE = ["phi", "unMoins", "moinsDemi", "deuxPhiMoinsUn"];
export const IDS_PHI_DEUX = ["diff", "sommeMoinsUn", "deuxMoins", "unMoinsDiff"];

export function phiJuste(x: AireCG): string {
  switch (x.type) {
    case "gauche":
      return x.a > 0 ? "phi" : "unMoins";
    case "droite":
      return x.a > 0 ? "unMoins" : "phi";
    case "entre":
      return x.a >= 0 ? "diff" : "sommeMoinsUn";
    case "queues":
      return x.a >= 0 ? "unMoinsDiff" : "deuxMoins";
  }
}

/** Valeur exacte d'une aire (corrigé : ordre de grandeur, vérification). */
export function valeurAire(x: AireCG): number {
  switch (x.type) {
    case "gauche":
      return phiExact(x.a);
    case "droite":
      return 1 - phiExact(x.a);
    case "entre":
      return phiExact(x.b) - phiExact(x.a);
    case "queues":
      return 1 - (phiExact(x.b) - phiExact(x.a));
  }
}

/** Règle empirique (cours, § 6) : pourcentages dans [μ − kσ ; μ + kσ], et valeurs exactes. */
export const REGLE: Record<1 | 2 | 3, number> = { 1: 68.3, 2: 95.4, 3: 99.7 };
export const regleExacte = (k: number): number => (2 * phiExact(k) - 1) * 100;

/** Pourcentage demandé, calculé depuis un pourcentage « dedans » p. */
export function pourcentDepuis(q: QuestionRegle, p: number): number {
  switch (q) {
    case "entre":
      return p;
    case "hors":
      return 100 - p;
    case "auDela":
    case "enDeca":
      return (100 - p) / 2;
    case "moitieHaut":
    case "moitieBas":
      return p / 2;
    case "sous":
    case "dessus":
      return 50 + p / 2;
  }
}

export const pourcentRegle = (e: ExerciceCG): number => Math.round(pourcentDepuis(e.question, REGLE[e.k]) * 1000) / 1000;
export const pourcentExact = (e: ExerciceCG): number => pourcentDepuis(e.question, regleExacte(e.k));
export const borneBasse = (e: ExerciceCG) => e.mu - e.k * e.sigma;
export const borneHaute = (e: ExerciceCG) => e.mu + e.k * e.sigma;
