import type { EquationG, ExerciceVecteursDirecteurs, OptionVecteur, Pt, VarianteVecteursDirecteurs } from "../../core/vecteursDirecteurs.types";
import { choisir, entier, melanger, nonNul, pgcd } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen129 « Vecteurs directeurs d'une droite ». Tout le hasard passe par `Math.random`
 * (`genererAvecCode` : le QR code rouvre le MÊME exercice).
 *
 * - Les points lus sont des NŒUDS du quadrillage, dans [−5 ; 5] (fenêtre [−6 ; 6]), à au moins
 *   2 unités de chaque axe (leur nom ne chevauche aucune graduation) ; deux points
 *   lus sont à au moins 2 unités l'un de l'autre ; une droite oblique n'a jamais une pente ±1 (les
 *   composantes échangées seraient alors encore un vecteur directeur).
 * - Écran (b) : le NOMBRE de vecteurs directeurs parmi les cinq (2 ou 3) est tiré à pile ou face
 *   AVANT tout le reste (c'est la réponse : jamais dans `forme`). L'opposé est toujours proposé (il
 *   est directeur) ; les leurres sont TOUJOURS les composantes échangées et un vecteur
 *   perpendiculaire, plus un signe changé quand il en faut trois. Aucun leurre n'est colinéaire à u.
 * - Écran (c) : coefficient m entier (|m| ≥ 2) ou fractionnaire (dénominateur 2 à 5, irréductible),
 *   à pile ou face (`forme`) ; p ≠ 0 et p ≠ m (le piège « (1 ; p) » reste distinct). Variante
 *   horizontale-verticale : g est verticale (x = k) si d est horizontale, et inversement.
 */

const colineaires = (u: Pt, v: Pt) => Math.abs(u.x * v.y - u.y * v.x) < 1e-9;
const egaux = (u: Pt, v: Pt) => Math.abs(u.x - v.x) < 1e-9 && Math.abs(u.y - v.y) < 1e-9;
const dans = (p: Pt) => Math.abs(p.x) <= 5 && Math.abs(p.y) <= 5;
const nul = (u: Pt) => Math.abs(u.x) < 1e-12 && Math.abs(u.y) < 1e-12;

/** Composantes d'une droite oblique : pas de pente ±1, longueur ≥ 2. */
function directionOblique(): Pt {
  for (;;) {
    const u = { x: nonNul(-5, 5), y: nonNul(-5, 5) };
    if (Math.abs(u.x) === Math.abs(u.y)) continue;
    if (u.x * u.x + u.y * u.y < 5) continue;
    return u;
  }
}

/** Deux nœuds P1, P2 = P1 + u dans [−5 ; 5]². */
function pointsAvec(u: Pt): [Pt, Pt] {
  for (;;) {
    const P1 = { x: entier(-5, 5), y: entier(-5, 5) };
    const P2 = { x: P1.x + u.x, y: P1.y + u.y };
    if (dans(P2)) return [P1, P2];
  }
}

/** Les cinq vecteurs de l'écran (b) : `nJustes` vecteurs directeurs (l'opposé toujours) + leurres. */
export function optionsPour(u: Pt, nJustes: 2 | 3): OptionVecteur[] {
  const horizontaleOuVerticale = u.x === 0 || u.y === 0;
  const g = pgcd(Math.abs(u.x), Math.abs(u.y));
  const justes: OptionVecteur[] = [{ v: { x: -u.x, y: -u.y }, nature: "oppose", juste: true }];
  const candidats: OptionVecteur[] = [];
  const k = choisir([2, 3, -2, -3]);
  candidats.push({ v: { x: k * u.x, y: k * u.y }, nature: "multiple", juste: true });
  if (g > 1) candidats.push({ v: { x: u.x / g, y: u.y / g }, nature: "reduit", juste: true });
  else if (!horizontaleOuVerticale && Math.abs(u.x) >= 2) candidats.push({ v: { x: 1, y: u.y / u.x }, nature: "fraction", juste: true });
  else if (!horizontaleOuVerticale && Math.abs(u.y) >= 2) candidats.push({ v: { x: u.x / u.y, y: 1 }, nature: "fraction", juste: true });
  else candidats.push({ v: { x: -k * u.x, y: -k * u.y }, nature: "multiple", juste: true });
  for (const c of melanger(candidats)) {
    if (justes.length >= nJustes) break;
    if (!egaux(c.v, u) && !justes.some((j) => egaux(j.v, c.v))) justes.push(c);
  }
  while (justes.length < nJustes) {
    const m = choisir([4, -4, 5, -5]);
    const v = { x: m * u.x, y: m * u.y };
    if (!justes.some((j) => egaux(j.v, v))) justes.push({ v, nature: "multiple", juste: true });
  }
  const leurresPossibles: OptionVecteur[] = horizontaleOuVerticale
    ? [
        { v: { x: u.y, y: u.x }, nature: "echangees", juste: false },
        u.y === 0 ? { v: { x: u.x, y: u.x }, nature: "decale", juste: false } : { v: { x: u.y, y: u.y }, nature: "decale", juste: false },
        u.y === 0 ? { v: { x: u.x, y: choisir([1, -1]) }, nature: "signe", juste: false } : { v: { x: choisir([1, -1]), y: u.y }, nature: "signe", juste: false },
      ]
    : [
        { v: { x: u.y, y: u.x }, nature: "echangees", juste: false },
        { v: { x: -u.y, y: u.x }, nature: "normal", juste: false },
        { v: { x: u.x, y: -u.y }, nature: "signe", juste: false },
      ];
  const leurres = leurresPossibles.slice(0, 5 - nJustes).filter((o) => !nul(o.v) && !colineaires(o.v, u));
  // Garde-fou (jamais atteint : |u.x| ≠ |u.y|, composantes non nulles) — un leurre décalé.
  while (justes.length + leurres.length < 5) leurres.push({ v: { x: u.x + 1, y: u.y + 2 }, nature: "decale", juste: false });
  return melanger([...justes, ...leurres]);
}

function equationG(variante: VarianteVecteursDirecteurs, u: Pt, typeM: "entier" | "fraction"): EquationG {
  const k = nonNul(-6, 6);
  if (variante === "horizontale-verticale") return u.y === 0 ? { type: "verticale", k } : { type: "horizontale", k };
  for (;;) {
    if (typeM === "entier") {
      const m = nonNul(-5, 5);
      if (Math.abs(m) === 1) continue;
      const p = nonNul(-6, 6);
      if (p === m) continue;
      return { type: "affine", num: m, den: 1, p };
    }
    const den = choisir([2, 3, 4, 5]);
    const num = nonNul(-7, 7);
    if (pgcd(Math.abs(num), den) !== 1) continue;
    return { type: "affine", num, den, p: nonNul(-5, 5) };
  }
}

export function genererVecteursDirecteurs(variante: VarianteVecteursDirecteurs, nJustes?: 2 | 3): ExerciceVecteursDirecteurs {
  // Réponse de l'écran (b) tirée en premier, à parts égales.
  const n = nJustes ?? (Math.random() < 0.5 ? 2 : 3);
  const typeM: "entier" | "fraction" = Math.random() < 0.5 ? "entier" : "fraction";
  let u: Pt;
  let P1: Pt;
  let P2: Pt;
  let C: Pt | null = null;
  if (variante === "horizontale-verticale") {
    const longueur = entier(2, 7) * choisir([1, -1]);
    const horizontale = Math.random() < 0.5;
    for (;;) {
      u = horizontale ? { x: longueur, y: 0 } : { x: 0, y: longueur };
      [P1, P2] = pointsAvec(u);
      // Pas sur un axe (la droite serait confondue avec l'axe) ; aucun point lu sur l'autre axe
      // (son nom chevaucherait les graduations).
      const loin = (v: number) => Math.abs(v) >= 2;
      if (horizontale ? loin(P1.y) && loin(P1.x) && loin(P2.x) : loin(P1.x) && loin(P1.y) && loin(P2.y)) break;
    }
  } else {
    u = directionOblique();
    // Aucun point lu sur un axe ni à une unité d'un axe : son nom chevaucherait les graduations.
    const surAxe = (p: Pt) => Math.abs(p.x) < 2 || Math.abs(p.y) < 2;
    for (;;) {
      [P1, P2] = pointsAvec(u);
      if (surAxe(P1) || surAxe(P2)) continue;
      if (variante === "deux-points") break;
      // Parallèle : C hors de (EF), à au moins 1,5 unité de (EF), loin des coins (étiquette de d).
      const c = { x: entier(-4, 4), y: entier(-4, 4) };
      if (surAxe(c)) continue;
      const distance = Math.abs(u.x * (c.y - P1.y) - u.y * (c.x - P1.x)) / Math.hypot(u.x, u.y);
      if (distance < 1.5) continue;
      C = c;
      break;
    }
  }
  return {
    variante,
    P1: P1!,
    P2: P2!,
    noms: variante === "parallele" ? ["E", "F"] : ["A", "B"],
    C,
    u: u!,
    options: optionsPour(u!, n),
    g: equationG(variante, u!, typeM),
  };
}

export const CATALOGUE_VARIANTES: { id: VarianteVecteursDirecteurs; label: string }[] = [
  { id: "deux-points", label: "Droite par deux points du quadrillage" },
  { id: "horizontale-verticale", label: "Droite horizontale ou verticale" },
  { id: "parallele", label: "Droite parallèle à une droite (EF)" },
];

export function construireAvecVariante(id: string): ExerciceVecteursDirecteurs {
  if (id === "deux-points" || id === "horizontale-verticale" || id === "parallele") return genererVecteursDirecteurs(id);
  return genererExerciceVecteursDirecteurs();
}

export function genererExerciceVecteursDirecteurs(): ExerciceVecteursDirecteurs {
  return genererVecteursDirecteurs(choisir(["deux-points", "horizontale-verticale", "parallele"] as const));
}
