import type { Q } from "../ui5e/nombresTrigo";

/**
 * Couche core — `5gen54` « Choisir φ quand le départ n'est pas un extremum » (5e ch. 2, § 8, second
 * exemple de la grande roue). Modèle f(t) = A sin(ωt + φ) + b, A > 0, ω > 0, φ ∈ ]−π ; π].
 */

export type VariantePhi = "roue" | "extremes";
export type ModePhi = "exact" | "calcul";
export type SensDepart = "monte" | "descend";

export interface ContextePhi {
  id: string;
  variante: VariantePhi;
  /** Unité de la grandeur (« m », « cm », « °C »). */
  unite: string;
  /** Unité de temps, au long (« minutes ») et en abrégé (« min »). */
  tempsLong: string;
  tempsCourt: string;
  /** Nom de la fonction (« h », « T »). */
  nomFonction: string;
  /** Verbes de départ : « monte » / « descend », « augmente » / « diminue ». */
  verbeMonte: string;
  verbeDescend: string;
  /** Sujet du verbe (« la nacelle », « la mer »…). */
  sujet: string;
  /** Question du maximum (« la nacelle est-elle au plus haut »). */
  phraseMax: string;
  /** Même chose, forme affirmative (« la nacelle est au plus haut », « a lieu la pleine mer »). */
  phraseMaxDecl: string;
  /** Décimales de la grandeur. */
  decimales: number;
}

export interface ExercicePhiHorsExtremum {
  variante: VariantePhi;
  mode: ModePhi;
  contexte: ContextePhi;
  /** Rayon et hauteur du centre (variante « roue »). */
  r?: number;
  h?: number;
  max: number;
  min: number;
  /** Période (exacte, rationnelle). */
  T: Q;
  y0: number;
  sens: SensDepart;
  A: number;
  b: number;
  /** ω = (2/T)·π, exact. */
  omegaPi: Q;
  omega: number;
  /** m = sin φ = (y₀ − b)/A, exact. */
  m: Q;
  /** Candidats exacts (mode « exact ») en multiples de π, sinon null. */
  phi1Pi: Q | null;
  phi2Pi: Q | null;
  phi1: number;
  phi2: number;
  /** φ retenu (φ₁ si la grandeur monte, φ₂ sinon : cos φ₁ > 0 > cos φ₂). */
  phi: number;
  phiPi: Q | null;
  /** Premier instant t > 0 du maximum ; exact (multiple rationnel de l'unité de temps) en mode « exact ». */
  tMax: number;
  tMaxQ: Q | null;
  /** Ordre d'affichage des trois options du choix fermé. */
  ordreOptions: ("phi1" | "phi2" | "deux")[];
}

export function f(e: ExercicePhiHorsExtremum, t: number, phi = e.phi): number {
  return e.A * Math.sin(e.omega * t + phi) + e.b;
}
