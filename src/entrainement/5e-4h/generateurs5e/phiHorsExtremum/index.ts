import type { ContextePhi, ExercicePhiHorsExtremum, ModePhi, SensDepart, VariantePhi } from "../../core5e/phiHorsExtremum";
import { q, qAdd, qDiv, qMul, qSub, qVal, reduirePi, reduireAngle } from "../../ui5e/nombresTrigo";
import type { Q } from "../../ui5e/nombresTrigo";

export type IdVariantePhi = VariantePhi;

/**
 * Couche A — générateur de `5gen54` « Choisir φ quand le départ n'est pas un extremum ». N'utilise
 * que `Math.random()` (le `?code=` rejoue le même tirage, appli et feuilles).
 *
 * Ordre du tirage : 1) le SENS au départ (monte / descend, 50/50) — c'est le verdict du choix fermé,
 * jamais une variante ni un cas particulier ; 2) le MODE (exact : sin φ ∈ {−1/2 ; 0 ; 1/2}, φ
 * remarquable ; calcul : sin φ quelconque, touche sin⁻¹), 50/50, indépendant du sens ; 3) le
 * contexte de la variante et les nombres.
 *
 * Données réalistes : grande roue (rayon 8–40 m, tour en 6 à 30 min), roue à aubes (rayon 2–4 m,
 * axe 0,5–1,5 m au-dessus de l'eau : une pale passe sous l'eau, hauteurs négatives), pédalier
 * (manivelle 16–18 cm, axe à 28–32 cm du sol, un tour en 1 à 2 s) ; marée (basse mer 0,2–1,4 m,
 * pleine mer 3,6–5,4 m, 12 h entre deux pleines mers, ordre de grandeur de la mer du Nord), ressort
 * (oscillation de quelques centimètres en 1 à 4 s), eau d'un lac sur l'année (≈ 4 °C l'hiver,
 * ≈ 20–24 °C l'été).
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}
function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)];
}
function melanger<T>(t: T[]): T[] {
  const r = [...t];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}
const arrondi = (x: number, dec: number) => Math.round(x * 10 ** dec) / 10 ** dec;

const CTX = {
  grandeRoue: { id: "grandeRoue", variante: "roue", unite: "m", tempsLong: "minutes", tempsCourt: "min", nomFonction: "h", verbeMonte: "monte", verbeDescend: "descend", sujet: "la nacelle", phraseMax: "la nacelle est-elle au plus haut", phraseMaxDecl: "la nacelle est au plus haut", decimales: 1 },
  roueAubes: { id: "roueAubes", variante: "roue", unite: "m", tempsLong: "secondes", tempsCourt: "s", nomFonction: "h", verbeMonte: "monte", verbeDescend: "descend", sujet: "l'extrémité de la pale", phraseMax: "l'extrémité de la pale est-elle au plus haut", phraseMaxDecl: "l'extrémité de la pale est au plus haut", decimales: 2 },
  pedale: { id: "pedale", variante: "roue", unite: "cm", tempsLong: "secondes", tempsCourt: "s", nomFonction: "h", verbeMonte: "monte", verbeDescend: "descend", sujet: "la pédale", phraseMax: "la pédale est-elle au plus haut", phraseMaxDecl: "la pédale est au plus haut", decimales: 1 },
  maree: { id: "maree", variante: "extremes", unite: "m", tempsLong: "heures", tempsCourt: "h", nomFonction: "h", verbeMonte: "monte", verbeDescend: "descend", sujet: "la mer", phraseMax: "la pleine mer a-t-elle lieu", phraseMaxDecl: "a lieu la pleine mer", decimales: 2 },
  ressort: { id: "ressort", variante: "extremes", unite: "cm", tempsLong: "secondes", tempsCourt: "s", nomFonction: "h", verbeMonte: "monte", verbeDescend: "descend", sujet: "la masse", phraseMax: "la masse est-elle au plus haut", phraseMaxDecl: "la masse est au plus haut", decimales: 1 },
  lac: { id: "lac", variante: "extremes", unite: "°C", tempsLong: "mois", tempsCourt: "mois", nomFonction: "\\theta", verbeMonte: "augmente", verbeDescend: "diminue", sujet: "la température de l'eau", phraseMax: "l'eau est-elle la plus chaude", phraseMaxDecl: "l'eau est la plus chaude", decimales: 2 },
} satisfies Record<string, ContextePhi & { variante: VariantePhi }>;

interface Tirage {
  contexte: ContextePhi;
  r?: number;
  h?: number;
  A: number;
  b: number;
  T: Q;
  /** Pas de la valeur de départ en mode « calcul ». */
  pas: number;
}

function tirerRoue(): Tirage {
  const c = parmi(["grandeRoue", "roueAubes", "pedale"] as const);
  if (c === "grandeRoue") {
    const r = entier(8, 40);
    const h = r + entier(1, 3);
    return { contexte: CTX.grandeRoue, r, h, A: r, b: h, T: q(parmi([6, 8, 10, 12, 15, 20, 24, 30])), pas: 0.5 };
  }
  if (c === "roueAubes") {
    const r = parmi([2, 2.5, 3, 3.5, 4]);
    const h = parmi([0.5, 1, 1.5]);
    return { contexte: CTX.roueAubes, r, h, A: r, b: h, T: q(parmi([8, 10, 12, 15, 20])), pas: 0.1 };
  }
  const r = entier(16, 18);
  const h = entier(28, 32);
  return { contexte: CTX.pedale, r, h, A: r, b: h, T: parmi([q(1), q(3, 2), q(2)]), pas: 1 };
}

function tirerExtremes(): Tirage {
  const c = parmi(["maree", "ressort", "lac"] as const);
  if (c === "maree") {
    // A en dixièmes PAIRS : max, min, A/2 au dixième.
    const A = entier(8, 12) / 5;
    const b = entier(20, 30) / 10;
    return { contexte: CTX.maree, A, b, T: q(12), pas: 0.1 };
  }
  if (c === "ressort") {
    const A = parmi([4, 6, 8, 10]);
    const b = entier(20, 40);
    return { contexte: CTX.ressort, A, b, T: parmi([q(1), q(2), q(4)]), pas: 1 };
  }
  const A = parmi([7, 8, 9, 10]);
  const b = parmi([12, 13, 14]);
  return { contexte: CTX.lac, A, b, T: q(12), pas: 1 };
}

/** m = (y₀ − b)/A en rationnel exact (données à 2 décimales au plus). */
function mExact(y0: number, b: number, A: number): Q {
  return q(Math.round((y0 - b) * 100), Math.round(A * 100));
}

function construire(variante: VariantePhi, mode: ModePhi, sens: SensDepart): ExercicePhiHorsExtremum {
  for (;;) {
    const ti = variante === "roue" ? tirerRoue() : tirerExtremes();
    const { A, b } = ti;
    let y0: number;
    let m: Q;
    let phi1Pi: Q | null = null;
    let phi2Pi: Q | null = null;
    if (mode === "exact") {
      const choix = parmi([q(1, 2), q(1, 2), q(0), q(-1, 2), q(-1, 2)]);
      y0 = arrondi(b + A * qVal(choix), 4);
      m = choix;
      phi1Pi = m.n === 0 ? q(0) : q(m.n, 6); // arcsin(±1/2) = ±π/6
      phi2Pi = reduirePi(qSub(q(1), phi1Pi));
    } else {
      const nbPas = Math.round((2 * A) / ti.pas);
      y0 = arrondi(b - A + entier(1, nbPas - 1) * ti.pas, 4);
      m = mExact(y0, b, A);
      const mv = qVal(m);
      if (Math.abs(mv) < 0.12 || Math.abs(mv) > 0.92 || Math.abs(Math.abs(mv) - 0.5) < 0.06) continue;
    }
    const mv = qVal(m);
    const phi1 = Math.asin(mv);
    const phi2 = reduireAngle(Math.PI - phi1);
    const phi = sens === "monte" ? phi1 : phi2;
    const phiPi = mode === "exact" ? (sens === "monte" ? phi1Pi : phi2Pi) : null;
    const omegaPi = qDiv(q(2), ti.T);
    const omega = qVal(omegaPi) * Math.PI;
    // Premier maximum : ωt + φ = π/2 + 2kπ, t > 0.
    let tMaxQ: Q | null = null;
    let tMax: number;
    if (phiPi) {
      let x = qSub(q(1, 2), phiPi);
      while (qVal(x) <= 0) x = qAdd(x, q(2));
      while (qVal(x) > 2) x = qSub(x, q(2));
      tMaxQ = qMul(x, qDiv(ti.T, q(2)));
      tMax = qVal(tMaxQ);
    } else {
      let x = Math.PI / 2 - phi;
      while (x <= 1e-9) x += 2 * Math.PI;
      tMax = x / omega;
    }
    return {
      variante,
      mode,
      contexte: ti.contexte,
      r: ti.r,
      h: ti.h,
      max: arrondi(b + A, 4),
      min: arrondi(b - A, 4),
      T: ti.T,
      y0,
      sens,
      A,
      b,
      omegaPi,
      omega,
      m,
      phi1Pi,
      phi2Pi,
      phi1,
      phi2,
      phi,
      phiPi,
      tMax,
      tMaxQ,
      ordreOptions: melanger(["phi1", "phi2", "deux"]),
    };
  }
}

export const CATALOGUE_VARIANTES: { id: IdVariantePhi; label: string }[] = [
  { id: "roue", label: "Roue : rayon, hauteur de l'axe, durée d'un tour" },
  { id: "extremes", label: "Valeurs extrêmes et période données (marée, ressort, lac)" },
];

export function construireAvecVarianteId(id: IdVariantePhi): ExercicePhiHorsExtremum {
  const sens: SensDepart = Math.random() < 0.5 ? "monte" : "descend";
  const mode: ModePhi = Math.random() < 0.5 ? "exact" : "calcul";
  return construire(id, mode, sens);
}

export function genererExercicePhiHorsExtremum(): ExercicePhiHorsExtremum {
  return construireAvecVarianteId(parmi(CATALOGUE_VARIANTES).id);
}
