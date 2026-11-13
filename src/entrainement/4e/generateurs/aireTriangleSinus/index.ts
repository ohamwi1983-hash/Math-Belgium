import type { ExerciceAireTriangleSinus, FamilleAireTriangle, SommetTriangle, UniteAire } from "../../core/aireTriangleSinus.types";
import {
  aireExacte,
  cosDeg,
  estRemarquable,
  radical,
  sinDeg,
  valeurRadical,
} from "../../moteur/modeleAireTriangleSinus";

/**
 * Générateur de « Aire d'un triangle quelconque » (gen75). Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice.
 *
 * Trois « modes » de tirage pour les familles à angle (aire, angle, côté) :
 * - `droit` (≈ 12 %) : angle de 90° — sin 90° = 1, le calcul se raccourcit (cas particulier des
 *   évaluations ; famille `angle` : une seule amplitude) ;
 * - `exacte` (≈ 38 %) : angle remarquable (30°, 45°, 60°, 120°, 135°, 150° ; 30°/45°/60° pour la
 *   famille `angle`), côtés dont le produit est multiple de 4 : aire exacte de la forme k, k√2 ou k√3
 *   (k entier) — faisable sans calculatrice ;
 * - `calculatrice` (≈ 50 %) : angle entier quelconque (jamais remarquable), aire donnée au dixième.
 *
 * Garanties (vérifiées par tirages massifs) : triangles jamais trop plats (chaque angle ≥ 15°) ;
 * en mode calculatrice, aucune erreur classique (oubli du sinus, calculatrice en radians, cosinus
 * au lieu de sinus, Al-Kashi sans le terme en cosinus ou avec le mauvais signe…) ne tombe par
 * hasard dans la tolérance de vérification (1 %) ; quadrilatère toujours convexe, angles ≥ 20°.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function permutation(n: number): number[] {
  const t = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j]!, t[i]!];
  }
  return t;
}

const UNITES: UniteAire[] = ["cm", "cm", "cm", "m", "dm", "mm"];
const SOMMETS: SommetTriangle[] = ["A", "B", "C"];

function commun(): { unite: UniteAire; ordreOptions: number[] } {
  return { unite: choisir(UNITES), ordreOptions: permutation(4) };
}

function arrondi1(x: number): number {
  return Math.round(x * 10) / 10;
}

/** Tolérance de la vérification (`max(0,05 ; 1 %)`), avec une marge de sécurité ×1,3. */
function proche(valeur: number, attendu: number): boolean {
  return Math.abs(valeur - attendu) <= 1.3 * Math.max(0.05, Math.abs(attendu) * 0.01);
}

/** Les deux autres angles d'un triangle connu par deux côtés et l'angle compris. */
function anglesSAS(c1: number, c2: number, angle: number): number[] {
  const oppose = Math.sqrt(c1 * c1 + c2 * c2 - 2 * c1 * c2 * cosDeg(angle));
  const a1 = (Math.acos((c2 * c2 + oppose * oppose - c1 * c1) / (2 * c2 * oppose)) * 180) / Math.PI;
  return [angle, a1, 180 - angle - a1];
}

function pasTropPlat(c1: number, c2: number, angle: number): boolean {
  return Math.min(...anglesSAS(c1, c2, angle)) >= 15;
}

export type ModeTirage = "droit" | "exacte" | "calculatrice";

function tirerMode(): ModeTirage {
  const r = Math.random();
  return r < 0.12 ? "droit" : r < 0.5 ? "exacte" : "calculatrice";
}

const REMARQUABLES_NON_DROITS = [30, 45, 60, 120, 135, 150];

/** Deux côtés et l'angle compris, selon le mode (familles `aire` et `cote`). */
function tirerAngleCompris(mode: ModeTirage): { c1: number; c2: number; angle: number } {
  for (;;) {
    const c1 = entier(3, 14);
    const c2 = entier(3, 14);
    if (c1 === c2) continue;
    let angle: number;
    if (mode === "droit") {
      angle = 90;
      if ((c1 * c2) % 2 !== 0) continue;
    } else if (mode === "exacte") {
      angle = choisir(REMARQUABLES_NON_DROITS);
      if ((c1 * c2) % 4 !== 0) continue;
    } else {
      angle = entier(20, 160);
      if (estRemarquable(angle) || (angle >= 80 && angle <= 100)) continue;
    }
    if (!pasTropPlat(c1, c2, angle)) continue;
    return { c1, c2, angle };
  }
}

function genererAire(mode: ModeTirage = tirerMode()): ExerciceAireTriangleSinus {
  for (;;) {
    const { c1, c2, angle } = tirerAngleCompris(mode);
    if (mode === "calculatrice") {
      const juste = 0.5 * c1 * c2 * sinDeg(angle);
      const erreurs = [0.5 * c1 * c2, 0.5 * c1 * c2 * Math.sin(angle), 0.5 * c1 * c2 * Math.abs(cosDeg(angle))];
      if (erreurs.some((v) => proche(v, juste))) continue;
    }
    return { famille: "aire", sommet: choisir(SOMMETS), cote1: c1, cote2: c2, angle, ...commun() };
  }
}

function genererCote(mode: ModeTirage = tirerMode()): ExerciceAireTriangleSinus {
  for (;;) {
    const tirage = tirerAngleCompris(mode);
    const { c1, angle } = tirage;
    if (mode === "calculatrice") {
      // Côté cherché décimal (au dixième) : la réponse n'est pas toujours voisine d'un entier.
      const c2 = tirage.c2 + entier(1, 9) / 10;
      if (!pasTropPlat(c1, c2, angle)) continue;
      const valeur = arrondi1(0.5 * c1 * c2 * sinDeg(angle));
      const juste = (2 * valeur) / (c1 * sinDeg(angle));
      const erreurs = [(2 * valeur) / c1, (2 * valeur) / (c1 * Math.abs(Math.sin(angle))), (2 * valeur) / (c1 * Math.abs(cosDeg(angle)))];
      if (erreurs.some((v) => proche(v, juste))) continue;
      return { famille: "cote", sommet: choisir(SOMMETS), cote1: c1, cote2: c2, angle, aire: { valeur, exacte: null }, ...commun() };
    }
    const exacte = aireExacte(c1, tirage.c2, angle)!;
    return { famille: "cote", sommet: choisir(SOMMETS), cote1: c1, cote2: tirage.c2, angle, aire: { valeur: valeurRadical(exacte), exacte }, ...commun() };
  }
}

function genererAngle(mode: ModeTirage = tirerMode()): ExerciceAireTriangleSinus {
  for (;;) {
    const c1 = entier(3, 14);
    const c2 = entier(3, 14);
    if (c1 === c2) continue;
    if (mode === "droit") {
      if ((c1 * c2) % 2 !== 0) continue;
      const exacte = radical(c1 * c2, 2, 1);
      return { famille: "angle", sommet: choisir(SOMMETS), cote1: c1, cote2: c2, angle: 90, aire: { valeur: valeurRadical(exacte), exacte }, ...commun() };
    }
    if (mode === "exacte") {
      if ((c1 * c2) % 4 !== 0) continue;
      const angle = choisir([30, 45, 60]);
      // Les DEUX triangles (X̂ aigu et X̂ obtus) doivent rester lisibles.
      if (!pasTropPlat(c1, c2, angle) || !pasTropPlat(c1, c2, 180 - angle)) continue;
      const exacte = aireExacte(c1, c2, angle)!;
      return { famille: "angle", sommet: choisir(SOMMETS), cote1: c1, cote2: c2, angle, aire: { valeur: valeurRadical(exacte), exacte }, ...commun() };
    }
    const angle = entier(20, 72);
    if (estRemarquable(angle)) continue;
    if (!pasTropPlat(c1, c2, angle) || !pasTropPlat(c1, c2, 180 - angle)) continue;
    const valeur = arrondi1(0.5 * c1 * c2 * sinDeg(angle));
    const s = (2 * valeur) / (c1 * c2);
    if (s >= 0.97 || s <= 0.2) continue;
    return { famille: "angle", sommet: choisir(SOMMETS), cote1: c1, cote2: c2, angle, aire: { valeur, exacte: null }, ...commun() };
  }
}

/** Quadrilatère convexe ABCD : ABC connu par AB, BC et l'angle B ; ACD par CD et l'angle ACD (la
 * diagonale AC est à calculer). `droit` : angle ABC droit (cas particulier). */
function genererQuadrilatere(droit: boolean = Math.random() < 0.12): ExerciceAireTriangleSinus {
  const R2D = 180 / Math.PI;
  for (;;) {
    const AB = entier(4, 12);
    const BC = entier(4, 12);
    if (AB === BC) continue;
    const angleB = droit ? 90 : entier(35, 145);
    if (!droit && angleB >= 80 && angleB <= 100) continue;
    const CD = entier(4, 12);
    const angleACD = entier(30, 120);
    const AC2 = AB * AB + BC * BC - 2 * AB * BC * cosDeg(angleB);
    const AC = Math.sqrt(AC2);
    // Erreurs classiques d'Al-Kashi : jamais dans la tolérance.
    const erreursAC = [Math.sqrt(AB * AB + BC * BC), Math.sqrt(Math.max(0, AB * AB + BC * BC + 2 * AB * BC * cosDeg(angleB))), Math.sqrt(Math.max(0, AB * AB + BC * BC - 2 * AB * BC * Math.cos(angleB))), AC2];
    if (!droit && erreursAC.some((v) => proche(v, AC))) continue;
    const BAC = Math.acos((AB * AB + AC2 - BC * BC) / (2 * AB * AC)) * R2D;
    const BCA = 180 - angleB - BAC;
    const AD = Math.sqrt(AC2 + CD * CD - 2 * AC * CD * cosDeg(angleACD));
    const CAD = Math.acos((AC2 + AD * AD - CD * CD) / (2 * AC * AD)) * R2D;
    const angleD = 180 - angleACD - CAD;
    const angles = [BAC + CAD, angleB, BCA + angleACD, angleD];
    if (angles.some((a) => a < 20 || a > 160)) continue;
    if (Math.min(BAC, BCA, CAD) < 12) continue;
    // Aire totale : l'aire de ACD seule ne doit pas passer pour la bonne réponse.
    const aABC = 0.5 * AB * BC * sinDeg(angleB);
    const aACD = 0.5 * AC * CD * sinDeg(angleACD);
    if (proche(aACD, aABC + aACD) || proche(aABC, aABC + aACD)) continue;
    return { famille: "quadrilatere", AB, BC, angleB, CD, angleACD, ...commun() };
  }
}

/** Triangles à côtés entiers ≤ 20, d'aire entière (demi-périmètre entier, produit de Héron carré
 * parfait), non rectangles et pas trop plats : version « sans calculatrice » de la famille Héron. */
function estHeronien(a: number, b: number, c: number): boolean {
  if ((a + b + c) % 2 !== 0) return false;
  const p = (a + b + c) / 2;
  const produit = p * (p - a) * (p - b) * (p - c);
  const r = Math.round(Math.sqrt(produit));
  return produit > 0 && r * r === produit;
}

function estRectangle(a: number, b: number, c: number): boolean {
  const [x, y, z] = [a, b, c].sort((u, v) => u - v) as [number, number, number];
  return x * x + y * y === z * z;
}

function anglesSSS(a: number, b: number, c: number): number[] {
  const A = (Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180) / Math.PI;
  const B = (Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180) / Math.PI;
  return [A, B, 180 - A - B];
}

const HERONIENS: [number, number, number][] = (() => {
  const liste: [number, number, number][] = [];
  for (let a = 4; a <= 20; a++)
    for (let b = a; b <= 20; b++)
      for (let c = b; c <= 20; c++) {
        if (a + b <= c) continue;
        if (!estHeronien(a, b, c) || estRectangle(a, b, c)) continue;
        const p = (a + b + c) / 2;
        // Produit raisonnable pour un calcul sans calculatrice.
        if (p * (p - a) * (p - b) * (p - c) > 8100) continue;
        if (Math.min(...anglesSSS(a, b, c)) < 15) continue;
        liste.push([a, b, c]);
      }
  return liste;
})();

function genererHeron(exacte: boolean = Math.random() < 0.4): ExerciceAireTriangleSinus {
  if (exacte) {
    const triplet = choisir(HERONIENS);
    const ordre = permutation(3);
    const [a, b, c] = ordre.map((i) => triplet[i]!) as [number, number, number];
    return { famille: "heron", a, b, c, ...commun() };
  }
  for (;;) {
    const a = entier(4, 15);
    const b = entier(4, 15);
    const c = entier(4, 15);
    if (a + 2 > b + c || b + 2 > a + c || c + 2 > a + b) continue;
    if (estHeronien(a, b, c)) continue;
    if (Math.min(...anglesSSS(a, b, c)) < 15) continue;
    return { famille: "heron", a, b, c, ...commun() };
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: FamilleAireTriangle; label: string }[] = [
  { id: "aire", label: "Aire : deux côtés et l'angle compris" },
  { id: "angle", label: "Angle à partir de l'aire (deux amplitudes)" },
  { id: "cote", label: "Côté à partir de l'aire" },
  { id: "quadrilatere", label: "Quadrilatère découpé par une diagonale" },
  { id: "heron", label: "Formule de Héron (pour aller plus loin)" },
];

export function construireAvecVariante(id: string): ExerciceAireTriangleSinus {
  switch (id) {
    case "aire":
      return genererAire();
    case "angle":
      return genererAngle();
    case "cote":
      return genererCote();
    case "quadrilatere":
      return genererQuadrilatere();
    case "heron":
      return genererHeron();
    default:
      return genererExerciceAireTriangleSinus();
  }
}

/** Tirage libre : les cinq familles, Héron (« pour aller plus loin ») un peu moins souvent. */
export function genererExerciceAireTriangleSinus(): ExerciceAireTriangleSinus {
  const r = Math.random();
  if (r < 0.25) return genererAire();
  if (r < 0.45) return genererAngle();
  if (r < 0.65) return genererCote();
  if (r < 0.85) return genererQuadrilatere();
  return genererHeron();
}
