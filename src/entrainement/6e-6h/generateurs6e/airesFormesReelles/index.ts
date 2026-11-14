import type {
  CalculFormesReelles,
  ContexteSection,
  ExerciceAiresFormesReelles,
  ExerciceMurFormesReelles,
  ExerciceParcelleFormesReelles,
  ExerciceSectionFormesReelles,
  ExerciceVitrailFormesReelles,
  ModeleFormesReelles,
  RepereArc,
} from "../../core6e/airesFormesReelles.types";

/**
 * Couche A (6e) — générateur de `6gen81` « Aires de formes réelles ». N'utilise QUE `Math.random()`
 * (le `?code=` rejoue le même tirage, ici comme dans l'adaptateur de feuilles). Chaque situation a
 * deux régimes (`calcul`) :
 * - `exacte` : cotes entières ou demi-entières choisies dans des tables, pour que l'aire et toutes
 *   les réponses du contexte se calculent à la main (aire de l'arc entière, litres décimaux…) ;
 * - `calculatrice` : cotes décimales (ou intersections irrationnelles pour le vitrail).
 * Les tirages refusés (nombre de pots presque entier, berge trop proche de la route…) sont refaits :
 * la boucle est bornée et chaque table contient des combinaisons valides.
 */

function parmi<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const arrondi = (v: number, d = 6) => Math.round(v * 10 ** d) / 10 ** d;

function tirerCalcul(): CalculFormesReelles {
  return Math.random() < 0.5 ? "exacte" : "calculatrice";
}

function tirerRepere(): RepereArc {
  return Math.random() < 0.5 ? "pied" : "milieu";
}

/** Part décimale strictement entre 0,05 et 0,5 : arrondir au plus proche donnerait trop peu de
 * pots (le piège « arrondir vers le bas » se voit). */
function partieDecimaleUtile(v: number): boolean {
  const p = v - Math.floor(v);
  return p > 0.05 && p < 0.5;
}

// ============================================================================
// Mur à fronton arrondi.
// ============================================================================

const MUR_EXACT: [number, number][] = [
  [6, 1],
  [6, 1.5],
  [6, 2],
  [8, 3],
  [9, 2],
  [12, 2],
  [12, 3],
];
const MUR_DONNEE_CALC_A = [-0.15, -0.2, -0.25, -0.3];

function construireMur(modele: ModeleFormesReelles, calcul: CalculFormesReelles = tirerCalcul()): ExerciceMurFormesReelles {
  for (let essai = 0; essai < 200; essai++) {
    let L: number;
    let k: number;
    let h: number;
    let rendement: number;
    let contenance: number;
    let prixPot: number;
    if (calcul === "exacte") {
      [L, k] = parmi(MUR_EXACT);
      h = L >= 12 ? parmi([3, 4]) : parmi([2, 2.5, 3, 3.5]);
      rendement = parmi([8, 10]);
      contenance = parmi([2.5, 5]);
      prixPot = parmi([24, 29, 32, 38, 45]);
    } else {
      L = parmi([4.6, 5.2, 5.6, 6.4, 7.2]);
      if (modele === "donnee") {
        // Fonction donnée : coefficient décimal court, la flèche en découle.
        k = arrondi((-parmi(MUR_DONNEE_CALC_A) * L * L) / 4);
        if (k < 0.8 || k > 2.4) continue;
      } else {
        k = parmi([0.9, 1.1, 1.3, 1.45, 1.6]);
      }
      h = parmi([2.4, 2.6, 2.8, 3.2]);
      rendement = parmi([9, 11, 12, 13]);
      contenance = parmi([2.5, 3, 4]);
      prixPot = parmi([27.9, 34.5, 39.95, 44.9]);
    }
    const surface = L * h + (2 / 3) * L * k;
    const litres = (2 * surface) / rendement;
    if (!partieDecimaleUtile(litres / contenance)) continue;
    return { situation: "mur", modele, calcul, L, h, k, repere: tirerRepere(), rendement, contenance, prixPot };
  }
  // Repli déterministe (jamais atteint en pratique) : 6 × 3, flèche 2 → 26 m², 5,2 L, 3 pots de 2,5 L.
  return { situation: "mur", modele, calcul: "exacte", L: 6, h: 3, k: 2, repere: "pied", rendement: 10, contenance: 2.5, prixPot: 29 };
}

// ============================================================================
// Vitrail : lentille entre deux arcs de parabole.
// ============================================================================

function construireVitrail(calcul: CalculFormesReelles = tirerCalcul()): ExerciceVitrailFormesReelles {
  for (let essai = 0; essai < 400; essai++) {
    let W: number;
    let H: number;
    let s: number;
    let A: number;
    let c: number;
    let d: number;
    let prixColore: number;
    let prixClair: number;
    if (calcul === "exacte") {
      W = parmi([8, 10]);
      H = parmi([10, 12]);
      const delta = parmi([2, 3]);
      s = delta * delta;
      A = delta === 2 ? parmi([3 / 8, 3 / 4]) : parmi([1 / 4, 1 / 3, 1 / 2]);
      c = parmi([0, 1 / 8, 1 / 4]);
      d = parmi([1, 2, 3]);
      prixColore = parmi([80, 120, 150, 200]);
      prixClair = parmi([40, 50, 60]);
    } else {
      W = parmi([8, 9, 10]);
      H = parmi([10, 12]);
      s = parmi([5, 6, 7, 8, 10]);
      A = parmi([0.3, 0.4, 0.5]);
      c = parmi([0, 0.1, 0.15]);
      d = parmi([1.5, 2]);
      prixColore = parmi([85.5, 124.9, 139]);
      prixClair = parmi([42.5, 48.9]);
    }
    if (c >= A) continue;
    const m = W / 2;
    // La lentille tient dans le panneau, avec une marge.
    if (m - Math.sqrt(s) < 0.5) continue;
    if (d + A * s > H - 1) continue;
    if (c * s + d > H - 1) continue;
    return { situation: "vitrail", modele: "donnee", calcul, W, H, m, s, A, c, d, prixColore, prixClair };
  }
  return { situation: "vitrail", modele: "donnee", calcul: "exacte", W: 8, H: 10, m: 4, s: 9, A: 1 / 4, c: 0, d: 2, prixColore: 120, prixClair: 50 };
}

// ============================================================================
// Section d'un canal, d'un tunnel, d'une gouttière.
// ============================================================================

const SECTION_EXACT: Record<ContexteSection, [number, number][]> = {
  canal: [
    [4, 1.5],
    [6, 1.5],
    [6, 2],
    [8, 1.5],
    [9, 2],
    [12, 2],
  ],
  tunnel: [
    [6, 3],
    [6, 4.5],
    [8, 4.5],
    [8, 6],
    [10, 6],
    [12, 6],
  ],
  gouttiere: [
    [9, 6],
    [10, 6],
    [12, 6],
    [15, 6],
    [12, 7.5],
    [15, 7.5],
  ],
};

const SECTION_CALC: Record<ContexteSection, { W: number[]; D: number[]; longueur: number[]; a: number[] }> = {
  canal: { W: [4.4, 5.2, 6.8, 7.5], D: [1.2, 1.35, 1.8, 2.1], longueur: [180, 240, 350, 480, 750, 1200], a: [0.15, 0.2, 0.25, 0.3] },
  tunnel: { W: [7.2, 8.4, 9.6, 10.5], D: [4.8, 5.5, 6.2], longueur: [340, 420, 520, 680, 950, 1250], a: [0.25, 0.3, 0.35, 0.4] },
  gouttiere: { W: [11, 13, 14], D: [6.5, 7, 8.5], longueur: [4.5, 5.5, 6.5, 7.2, 8.4, 9.4], a: [0.15, 0.16, 0.18, 0.2] },
};

const LONGUEURS_EXACTES: Record<ContexteSection, number[]> = {
  canal: [150, 200, 250, 300, 400, 500, 600],
  tunnel: [120, 150, 250, 300, 450, 600, 800],
  gouttiere: [4, 5, 6, 8, 10, 12],
};

function construireSection(modele: ModeleFormesReelles, contexte: ContexteSection = parmi(["canal", "tunnel", "gouttiere"] as const), calcul: CalculFormesReelles = tirerCalcul()): ExerciceSectionFormesReelles {
  for (let essai = 0; essai < 200; essai++) {
    let W: number;
    let D: number;
    let longueur: number;
    if (calcul === "exacte") {
      [W, D] = parmi(SECTION_EXACT[contexte]);
      longueur = parmi(LONGUEURS_EXACTES[contexte]);
    } else {
      const t = SECTION_CALC[contexte];
      W = parmi(t.W);
      longueur = parmi(t.longueur);
      if (modele === "donnee") {
        // Fonction donnée : coefficient décimal court, la profondeur en découle.
        D = arrondi((parmi(t.a) * W * W) / 4);
        const [dMin, dMax] = contexte === "tunnel" ? [3.5, 9] : contexte === "canal" ? [0.8, 3] : [4, 10];
        if (D < dMin || D > dMax) continue;
      } else {
        D = parmi(t.D);
      }
    }
    return { situation: "section", contexte, modele, calcul, W, D, longueur, repere: tirerRepere() };
  }
  return { situation: "section", contexte: "canal", modele, calcul: "exacte", W: 6, D: 2, longueur: 250, repere: "pied" };
}

// ============================================================================
// Parcelle bordée par une rivière.
// ============================================================================

const estEntier = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

function integraleParcelle(alpha: number, m: number, k: number, a: number, b: number): number {
  return (alpha * ((b - m) ** 3 - (a - m) ** 3)) / 3 + k * (b - a);
}

function construireParcelle(modele: ModeleFormesReelles, calcul: CalculFormesReelles = tirerCalcul()): ExerciceParcelleFormesReelles {
  for (let essai = 0; essai < 2000; essai++) {
    let alpha: number;
    let m: number;
    let k: number;
    let a: number;
    let b: number;
    let prix: number;
    if (calcul === "exacte") {
      m = parmi([3, 4, 5]);
      k = parmi([6, 7, 8, 9]);
      if (modele === "retrouver") {
        // Distance au pont lisible en mètres (10·y0 entier), coefficient qui s'en déduit.
        const y0 = parmi([2, 3, 4, 5]);
        alpha = (y0 - k) / (m * m);
      } else {
        alpha = parmi([-1 / 4, -1 / 5, -1 / 8, -1 / 10]);
      }
      a = entier(1, 2);
      b = entier(Math.max(a + 3, m + 1), 2 * m);
      prix = parmi([80, 95, 120, 150]);
      // Aire en m² entière : 100 × intégrale entière.
      if (!estEntier(100 * integraleParcelle(alpha, m, k, a, b))) continue;
      // Coefficients affichables : fraction de petit dénominateur.
      if (!estEntier(alpha * 400)) continue;
    } else {
      m = parmi([3.5, 4.2, 4.8]);
      k = parmi([6.5, 7.2, 8.4]);
      if (modele === "retrouver") {
        const y0 = parmi([3.5, 4.2, 4.6, 5.4]);
        alpha = (y0 - k) / (m * m);
      } else {
        alpha = parmi([-0.12, -0.15, -0.18, -0.22]);
      }
      a = parmi([0.5, 1, 1.5, 2.5]);
      b = parmi([6.5, 7.5, 8, 8.5]);
      prix = parmi([87.5, 112, 134.9]);
    }
    const f = (x: number) => alpha * (x - m) ** 2 + k;
    if (f(0) < 1 || f(a) < 1 || f(b) < 1) continue;
    if (b - a < 3) continue;
    return { situation: "parcelle", modele, calcul, alpha, m, k, a, b, prix };
  }
  return { situation: "parcelle", modele, calcul: "exacte", alpha: -1 / 4, m: 4, k: 7, a: 0, b: 8, prix: 120 };
}

// ============================================================================
// Catalogue, tirage libre.
// ============================================================================

export type IdVarianteAiresFormesReelles = "mur-retrouver" | "mur-donnee" | "vitrail" | "section-retrouver" | "section-donnee" | "parcelle-retrouver" | "parcelle-donnee";

export const CATALOGUE_VARIANTES: { id: IdVarianteAiresFormesReelles; label: string }[] = [
  { id: "mur-retrouver", label: "Mur à fronton arrondi — parabole à retrouver" },
  { id: "mur-donnee", label: "Mur à fronton arrondi — fonction donnée" },
  { id: "vitrail", label: "Vitrail entre deux arcs — intersections à trouver" },
  { id: "section-retrouver", label: "Canal, tunnel, gouttière — parabole à retrouver" },
  { id: "section-donnee", label: "Canal, tunnel, gouttière — fonction donnée" },
  { id: "parcelle-retrouver", label: "Parcelle bordée par une rivière — parabole à retrouver" },
  { id: "parcelle-donnee", label: "Parcelle bordée par une rivière — fonction donnée" },
];

export function construireAvecVarianteId(id: IdVarianteAiresFormesReelles): ExerciceAiresFormesReelles {
  switch (id) {
    case "mur-retrouver":
      return construireMur("retrouver");
    case "mur-donnee":
      return construireMur("donnee");
    case "vitrail":
      return construireVitrail();
    case "section-retrouver":
      return construireSection("retrouver");
    case "section-donnee":
      return construireSection("donnee");
    case "parcelle-retrouver":
      return construireParcelle("retrouver");
    case "parcelle-donnee":
      return construireParcelle("donnee");
  }
}

/** Tirage libre : situation équiprobable, puis « à retrouver » une fois sur deux (le vitrail a
 * toujours ses deux fonctions données). */
export function genererExerciceAiresFormesReelles(): ExerciceAiresFormesReelles {
  const situation = parmi(["mur", "vitrail", "section", "parcelle"] as const);
  const modele: ModeleFormesReelles = Math.random() < 0.5 ? "retrouver" : "donnee";
  if (situation === "mur") return construireMur(modele);
  if (situation === "vitrail") return construireVitrail();
  if (situation === "section") return construireSection(modele);
  return construireParcelle(modele);
}
