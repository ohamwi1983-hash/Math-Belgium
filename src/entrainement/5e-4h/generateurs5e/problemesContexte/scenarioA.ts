/**
 * Couche A (5e) — scénario A de 5gen5 : intersection de 2 familles de fonctions f(x)=g(x), extremum
 * de (f+g). 2 COMBOS (audit 5e ch. 1 : k√x/b−ax, k/x²/ax et « deux paraboles » retirés — leurs
 * contextes additionnaient des grandeurs de nature différente), tirés 1 parmi 2 puis 1 contexte
 * parmi les 10 associés à CE combo (voir `contextesScenarioA.ts`).
 *
 * Combo de référence (`kInverseXAxCarre`, inchangé) — bidons cylindriques V=πr²h, f=aire latérale
 * (2V/x), g=aire des bases (2πx²) : preuve algébrique (voir CLAUDE.md, section 5gen5) — au rayon qui
 * minimise (f+g)(x), on a toujours h(xOptimal)=2·xOptimal (diamètre=hauteur), quel que soit V. C'est
 * la seule GRANDEUR LIÉE physique de ce générateur (flux à 5 écrans).
 *
 * Le combo `stockCommande` utilise un flux réduit à 3 écrans (généralisation → intersection →
 * extremum) — la construction choisit d'abord `xIntersection` (entier, garantit
 * f(xIntersection)=g(xIntersection) exactement PAR CONSTRUCTION), puis calcule `xExtremum` par une
 * formule fermée ; 2 relevés chiffrés (x, f(x), g(x)), à x diviseurs de k, permettent d'écrire f et g.
 */
import type { ContexteConteneurA, ContexteReduitA, ExerciceScenarioA, ExerciceScenarioAConteneur, ExerciceScenarioAStockCommande, LigneTableauScenarioA } from "../../core5e/problemesContexte.types";
import { CONTEXTES_CONTENEUR, CONTEXTES_STOCK_COMMANDE } from "./contextesScenarioA";
import { entierAleatoire, tirerElement } from "./utils";

const TENTATIVES_MAX = 500;

// ============================================================================
// Combo 1 (kInverseXAxCarre) — inchangé (bidons cylindriques).
// ============================================================================

const RAYON_MIN = 3;
const RAYON_MAX = 12;

export function hauteurCylindre(volumeCm3: number, r: number): number {
  return volumeCm3 / (Math.PI * r * r);
}

export function aireBasesCylindre(r: number): number {
  return 2 * Math.PI * r * r;
}

/** = 2·π·r·h(r), simplifiée directement en 2V/r (jamais recalculée via h, pour rester fidèle à
 * f(x)=2V/x tel qu'affiché à l'élève à l'écran 2). */
export function aireLateraleCylindre(volumeCm3: number, r: number): number {
  return (2 * volumeCm3) / r;
}

/** x tel que f(x)=g(x), i.e. 2V/x = 2πx² ⟺ x³ = V/π. */
export function xEgaliteAires(volumeCm3: number): number {
  return Math.cbrt(volumeCm3 / Math.PI);
}

/** x qui minimise (f+g)(x) — dérivée nulle : x³ = V/(2π). Jamais exigé de l'élève. */
export function xOptimalScenarioA(volumeCm3: number): number {
  return Math.cbrt(volumeCm3 / (2 * Math.PI));
}

function tirerRayonsDistincts(nombre: number): number[] {
  const rayons = new Set<number>();
  while (rayons.size < nombre) {
    rayons.add(RAYON_MIN + Math.floor(Math.random() * (RAYON_MAX - RAYON_MIN + 1)));
  }
  return [...rayons].sort((a, b) => a - b);
}

/** Audit 5e ch. 1 (G2, décision 5) : V = 2πn³ avec n entier, écrit « kπ cm³ » (k = 2n³) — le
 * rayon optimal vaut EXACTEMENT n (minimum lu sur une ligne de la grille) et h(n) = 2n : le constat
 * « hauteur = diamètre » est exact (il était faux de 2 à 3 cm dans 46 % des tirages, rayon arrondi). */
export function construireScenarioAConteneur(contexte: ContexteConteneurA = tirerElement(CONTEXTES_CONTENEUR)): ExerciceScenarioAConteneur {
  const n = tirerElement(contexte.rayons);
  const volumeKPi = 2 * n * n * n;
  const volumeCm3 = Math.PI * volumeKPi;
  const nombreLignes = 2 + Math.floor(Math.random() * 2); // 2 ou 3
  // Rayons du tableau différents du rayon optimal (l'écran « graphique » le fait LIRE).
  let rayons = tirerRayonsDistincts(nombreLignes);
  while (rayons.includes(n)) rayons = tirerRayonsDistincts(nombreLignes);
  const lignesTableau: LigneTableauScenarioA[] = rayons.map((r) => ({
    r,
    hAttendu: hauteurCylindre(volumeCm3, r),
    aireBasesAttendue: aireBasesCylindre(r),
    aireLateraleAttendue: aireLateraleCylindre(volumeCm3, r),
  }));

  return {
    scenario: "A",
    combo: "kInverseXAxCarre",
    contexte,
    volumeCm3,
    volumeKPi,
    rayonOptimal: n,
    lignesTableau,
    xEgaliteAires: xEgaliteAires(volumeCm3),
    xOptimal: n,
  };
}

// ============================================================================
// Combo 2 (stockCommande) — f(x)=ax+b (coût de stockage, croissant), g(x)=k/x (coût de commande,
// décroissant). Intersection choisie en premier (x0 entier), k dérivé pour tomber exactement dessus.
// (f+g) est strictement convexe (f affine, g convexe) : UN SEUL minimum, en xExtremum=√(k/a).
// ============================================================================

export function fStockCommande(a: number, b: number, x: number): number {
  return a * x + b;
}
export function gStockCommande(k: number, x: number): number {
  return k / x;
}

/** Audit 5e ch. 1 (G12, décision 5) : le minimum de f + g, en √(k/a), est construit ENTIER
 * (k = a·m²) pour tomber sur une ligne de la grille, ET l'intersection x₀ reste entière
 * (k = x₀(a·x₀ + b), d'où b = a(m² − x₀²)/x₀ entier). */
export function construireScenarioAStockCommande(contexte: ContexteReduitA = tirerElement(CONTEXTES_STOCK_COMMANDE)): ExerciceScenarioAStockCommande {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const a = entierAleatoire(2, 6);
    const x0 = entierAleatoire(3, 10);
    const m = entierAleatoire(x0 + 1, 2 * x0);
    const numerateurB = a * (m * m - x0 * x0);
    if (numerateurB % x0 !== 0) continue;
    const b = numerateurB / x0;
    if (b < 4 || b > 40) continue;
    const k = a * m * m;
    const xExtremum = m;
    if (Math.abs(xExtremum - x0) < 1) continue; // distinction pédagogique intersection ≠ extremum
    const xMax = Math.max(x0, xExtremum) * 1.8;
    // 2 relevés à x DIVISEURS de k (g(x)=k/x entier), différents de x0 (le relevé donnerait sinon
    // f(x0)=g(x0), c'est-à-dire la réponse de l'écran « intersection »), dans la fenêtre affichée.
    const diviseurs: number[] = [];
    for (let d = 1; d <= Math.floor(xMax); d++) if (k % d === 0 && d !== x0) diviseurs.push(d);
    if (diviseurs.length < 2) continue;
    const i = Math.floor(Math.random() * diviseurs.length);
    let j = Math.floor(Math.random() * diviseurs.length);
    while (j === i) j = Math.floor(Math.random() * diviseurs.length);
    const releves = [diviseurs[i], diviseurs[j]].sort((p, q) => p - q).map((x) => ({ x, f: a * x + b, g: k / x }));
    return { scenario: "A", combo: "stockCommande", contexte, a, b, k, releves, xIntersection: x0, xExtremum, xMax };
  }
  throw new Error(`construireScenarioAStockCommande : aucun tirage valide trouvé après ${TENTATIVES_MAX} tentatives.`);
}

// ============================================================================
// Dispatch — 1 combo parmi 2, équiprobable.
// ============================================================================

const CONSTRUCTEURS_COMBO: Record<string, () => ExerciceScenarioA> = {
  kInverseXAxCarre: construireScenarioAConteneur,
  stockCommande: construireScenarioAStockCommande,
};

export const COMBOS_SCENARIO_A = ["kInverseXAxCarre", "stockCommande"] as const;

export function genererExerciceScenarioA(): ExerciceScenarioA {
  return CONSTRUCTEURS_COMBO[tirerElement([...COMBOS_SCENARIO_A])]();
}
