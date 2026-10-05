/**
 * Couche A (5e) — scénario A de 5gen5 : intersection de 2 familles de fonctions f(x)=g(x), extremum
 * de (f+g). 5 COMBOS, tirés 1 parmi 5 puis 1 contexte parmi les 10 associés à CE combo (jamais un
 * bassin partagé entre combos, voir `contextesScenarioA.ts`).
 *
 * Combo de référence (`kInverseXAxCarre`, inchangé) — bidons cylindriques V=πr²h, f=aire latérale
 * (2V/x), g=aire des bases (2πx²) : preuve algébrique (voir CLAUDE.md, section 5gen5) — au rayon qui
 * minimise (f+g)(x), on a toujours h(xOptimal)=2·xOptimal (diamètre=hauteur), quel que soit V. C'est
 * la seule GRANDEUR LIÉE physique de ce générateur (flux à 5 écrans).
 *
 * Les 4 autres combos utilisent un flux réduit à 3 écrans (généralisation → intersection → extremum,
 * jamais de grandeur liée artificielle) — chaque construction ci-dessous choisit d'abord `xIntersection`
 * (entier, garantit f(xIntersection)=g(xIntersection) exactement PAR CONSTRUCTION), puis calcule
 * `xExtremum` par une formule fermée (jamais de recherche numérique, contrairement à scénario C où
 * la forme du second degré n'était pas garantie) ; un tirage est rejeté et retiré s'il viole une
 * contrainte de lisibilité/unicité (mêmes bornes de tolérance qu'ailleurs sur la plateforme).
 */
import type {
  ContexteConteneurA,
  ContexteReduitA,
  ExerciceScenarioA,
  ExerciceScenarioAConteneur,
  ExerciceScenarioADeuxParaboles,
  ExerciceScenarioAIntensiteCable,
  ExerciceScenarioARacineAffine,
  ExerciceScenarioAStockCommande,
  LigneTableauScenarioA,
} from "../../core5e/problemesContexte.types";
import { CONTEXTES_CONTENEUR, CONTEXTES_DEUX_PARABOLES, CONTEXTES_INTENSITE_CABLE, CONTEXTES_RACINE_AFFINE, CONTEXTES_STOCK_COMMANDE } from "./contextesScenarioA";
import { entierAleatoire, tirerElement } from "./utils";

const TENTATIVES_MAX = 500;

// ============================================================================
// Combo 1 (kInverseXAxCarre) — inchangé (bidons cylindriques).
// ============================================================================

const VOLUMES_CM3 = [1000, 1250, 1500, 1750, 2000, 2250, 2500, 2750, 3000];
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

export function construireScenarioAConteneur(contexte: ContexteConteneurA = tirerElement(CONTEXTES_CONTENEUR)): ExerciceScenarioAConteneur {
  const volumeCm3 = VOLUMES_CM3[Math.floor(Math.random() * VOLUMES_CM3.length)];
  const nombreLignes = 2 + Math.floor(Math.random() * 2); // 2 ou 3
  const rayons = tirerRayonsDistincts(nombreLignes);
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
    lignesTableau,
    xEgaliteAires: xEgaliteAires(volumeCm3),
    xOptimal: xOptimalScenarioA(volumeCm3),
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

export function construireScenarioAStockCommande(contexte: ContexteReduitA = tirerElement(CONTEXTES_STOCK_COMMANDE)): ExerciceScenarioAStockCommande {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const a = entierAleatoire(2, 6);
    const b = entierAleatoire(5, 20);
    const x0 = entierAleatoire(3, 10);
    const k = x0 * (a * x0 + b);
    const xExtremum = Math.sqrt(k / a);
    if (Math.abs(xExtremum - x0) < 1) continue; // distinction pédagogique intersection ≠ extremum
    const xMax = Math.max(x0, xExtremum) * 1.8;
    return { scenario: "A", combo: "stockCommande", contexte, a, b, k, xIntersection: x0, xExtremum, xMax };
  }
  throw new Error(`construireScenarioAStockCommande : aucun tirage valide trouvé après ${TENTATIVES_MAX} tentatives.`);
}

// ============================================================================
// Combo 3 (racineAffine) — f(x)=k√x (croissante, concave), g(x)=b-ax (décroissante affine).
// Intersection choisie en premier (x0 entier), k dérivé pour tomber exactement dessus. (f+g) est
// strictement concave (f''<0, g''=0) : UN SEUL maximum, en xExtremum=(k/(2a))². `b/a` (où g s'annule)
// doit rester STRICTEMENT après xExtremum pour que le maximum reste physiquement interprétable
// (quantité g jamais négative avant le sommet de la somme).
// ============================================================================

export function fRacineAffine(k: number, x: number): number {
  return k * Math.sqrt(x);
}
export function gRacineAffine(a: number, b: number, x: number): number {
  return b - a * x;
}

export function construireScenarioARacineAffine(contexte: ContexteReduitA = tirerElement(CONTEXTES_RACINE_AFFINE)): ExerciceScenarioARacineAffine {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const a = entierAleatoire(1, 4);
    const b = entierAleatoire(20, 60);
    const x0 = entierAleatoire(4, 20);
    if (b <= a * x0) continue; // g(x0) doit être strictement positif (=f(x0)>0)
    const k = (b - a * x0) / Math.sqrt(x0);
    const xExtremum = (k / (2 * a)) ** 2;
    const xLimiteG = b / a; // où g s'annule
    if (xExtremum >= xLimiteG * 0.95) continue; // le sommet doit rester nettement avant que g s'annule
    if (Math.abs(xExtremum - x0) < 1) continue; // distinction pédagogique intersection ≠ extremum
    const xMax = Math.min(xLimiteG * 0.98, Math.max(x0, xExtremum) * 1.8);
    return { scenario: "A", combo: "racineAffine", contexte, k, a, b, xIntersection: x0, xExtremum, xMax };
  }
  throw new Error(`construireScenarioARacineAffine : aucun tirage valide trouvé après ${TENTATIVES_MAX} tentatives.`);
}

// ============================================================================
// Combo 4 (intensiteCable) — f(x)=k/x² (décroissante, convexe), g(x)=ax (croissante). Intersection
// choisie en premier (x0 entier), k dérivé pour tomber exactement dessus. (f+g) est strictement
// convexe : UN SEUL minimum, en xExtremum=x0·2^(1/3) (formule fermée, toujours distinct de x0).
// ============================================================================

export function fIntensiteCable(k: number, x: number): number {
  return k / (x * x);
}
export function gIntensiteCable(a: number, x: number): number {
  return a * x;
}

export function construireScenarioAIntensiteCable(contexte: ContexteReduitA = tirerElement(CONTEXTES_INTENSITE_CABLE)): ExerciceScenarioAIntensiteCable {
  const a = entierAleatoire(2, 8);
  const x0 = entierAleatoire(3, 10);
  const k = a * x0 * x0 * x0;
  const xExtremum = x0 * Math.cbrt(2);
  const xMax = xExtremum * 1.6;
  return { scenario: "A", combo: "intensiteCable", contexte, k, a, xIntersection: x0, xExtremum, xMax };
}

// ============================================================================
// Combo 5 (deuxParaboles) — f(x)=a1x²+b1x+c1, g(x)=a2x²+b2x+c2 (a1,a2>0, a1≠a2, coefficients tirés
// LIBREMENT — contrairement aux autres combos, aucune valeur n'est pré-choisie puis l'autre dérivée :
// intersection(s) et sommet de (f+g) sont retrouvés ANALYTIQUEMENT (formule du second degré, jamais
// de recherche numérique) puis le tirage est retiré s'il ne produit pas EXACTEMENT une traversée
// lisible dans la fenêtre affichée). Extremum = sommet de (f+g), x1=-(b1+b2)/(2(a1+a2)) — un vrai
// sommet puisque a1+a2>0. Intersection = plus petite racine positive de f(x)-g(x)=0 ; si une 2de
// racine positive existe, elle doit rester nettement hors de la fenêtre affichée (sinon rejet — 2
// croisements visibles rendraient "l'" intersection ambiguë).
// ============================================================================

export function fParabole(a: number, b: number, c: number, x: number): number {
  return a * x * x + b * x + c;
}

export function construireScenarioADeuxParaboles(contexte: ContexteReduitA = tirerElement(CONTEXTES_DEUX_PARABOLES)): ExerciceScenarioADeuxParaboles {
  for (let tentative = 0; tentative < TENTATIVES_MAX; tentative++) {
    const a1 = entierAleatoire(1, 3);
    let a2 = entierAleatoire(1, 3);
    if (a2 === a1) a2 = a2 === 3 ? 1 : a2 + 1; // garantit a1≠a2 (sinon (f+g) n'a pas de sommet propre)
    const b1 = entierAleatoire(-10, -1);
    const b2 = entierAleatoire(-10, -1);
    const c1 = entierAleatoire(10, 40);
    const c2 = entierAleatoire(10, 40);

    const sommeA = a1 + a2;
    const sommeB = b1 + b2;
    const x1 = -sommeB / (2 * sommeA); // sommet de (f+g)
    if (x1 < 1.5 || x1 > 15) continue;

    const deltaA = a1 - a2;
    const deltaB = b1 - b2;
    const deltaC = c1 - c2;
    const discriminant = deltaB * deltaB - 4 * deltaA * deltaC;
    if (discriminant < 0) continue; // aucune intersection réelle
    const racineDisc = Math.sqrt(discriminant);
    // Seuil quasi nul (1e-6, pas 0.5) : un vrai second croisement proche de zéro doit rester DÉTECTÉ
    // ici pour être rejeté ci-dessous — un seuil trop généreux le laissait passer inaperçu, produisant
    // un tirage avec 2 traversées réellement visibles dans [0,xMax] (bug trouvé par scenarioA.test.ts).
    const racinesPositives = [(-deltaB + racineDisc) / (2 * deltaA), (-deltaB - racineDisc) / (2 * deltaA)].filter((r) => r > 1e-6).sort((p, q) => p - q);
    if (racinesPositives.length === 0) continue;
    const x0 = racinesPositives[0];
    if (Math.abs(x0 - x1) < 1) continue; // distinction pédagogique intersection ≠ extremum

    let xMax: number;
    if (racinesPositives.length === 2) {
      const secondeRacine = racinesPositives[1];
      if (secondeRacine < Math.max(x0, x1) * 1.3) continue; // 2e croisement trop proche, fenêtre ambiguë
      xMax = Math.min(secondeRacine * 0.95, Math.max(x0, x1) * 1.8);
    } else {
      xMax = Math.max(x0, x1) * 1.8;
    }
    if (x0 > xMax - 1 || x0 < xMax * 0.05) continue; // lisibilité (ni collé au bord, ni à l'origine)

    // Lisibilité : f et g restent positives sur toute la fenêtre affichée (grandeurs concrètes).
    let positif = true;
    for (let j = 0; j <= 10; j++) {
      const x = (xMax * j) / 10;
      if (fParabole(a1, b1, c1, x) <= 0 || fParabole(a2, b2, c2, x) <= 0) {
        positif = false;
        break;
      }
    }
    if (!positif) continue;

    return { scenario: "A", combo: "deuxParaboles", contexte, a1, b1, c1, a2, b2, c2, xIntersection: x0, xExtremum: x1, xMax };
  }
  throw new Error(`construireScenarioADeuxParaboles : aucun tirage valide trouvé après ${TENTATIVES_MAX} tentatives.`);
}

// ============================================================================
// Dispatch — 1 combo parmi 5, équiprobable.
// ============================================================================

const CONSTRUCTEURS_COMBO: Record<string, () => ExerciceScenarioA> = {
  kInverseXAxCarre: construireScenarioAConteneur,
  stockCommande: construireScenarioAStockCommande,
  racineAffine: construireScenarioARacineAffine,
  intensiteCable: construireScenarioAIntensiteCable,
  deuxParaboles: construireScenarioADeuxParaboles,
};

export const COMBOS_SCENARIO_A = ["kInverseXAxCarre", "stockCommande", "racineAffine", "intensiteCable", "deuxParaboles"] as const;

export function genererExerciceScenarioA(): ExerciceScenarioA {
  return CONSTRUCTEURS_COMBO[tirerElement([...COMBOS_SCENARIO_A])]();
}
