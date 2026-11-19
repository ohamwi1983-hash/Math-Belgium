import type { CatalogueVarianteEntree } from "../../../export/genererFeuilleExercices";
import type { ExercicePrix, ExerciceProblemesFraction, ExerciceRobinets, ExerciceTrajet, FormeProblemesFraction, VarianteProblemesFraction } from "../../core/problemesFraction.types";
import { choisir, entierAlea, pgcd, type Poly2 } from "../../moteur/algebreTransfertSecondDegre";

/**
 * Générateur de gen119 (« Problèmes avec une fraction »). Les nombres sont choisis pour que les
 * deux racines de l'équation obtenue soient RATIONNELLES (Δ carré parfait par construction) : la
 * racine gardée est un entier « propre » (nombre d'objets, vitesse, durée), l'autre est rejetée par
 * le contexte (négative, ou vitesse au retour négative). La CE n'élimine jamais une racine ici :
 * l'écran « rejeter » le fait constater (les deux valeurs la respectent), puis le contexte tranche.
 * `forme` est tirée AVANT les nombres (50 / 50).
 */

export const CATALOGUE_VARIANTES: CatalogueVarianteEntree[] = [
  { id: "prix", label: "Prix unitaire et quantité" },
  { id: "trajet", label: "Aller-retour à deux vitesses" },
  { id: "robinets", label: "Deux robinets (deux machines)" },
];

export const CONTEXTES_PRIX = [
  { prenom: "Léa", elle: true, pluriel: "livres d'occasion", singulier: "livre", article: "un", fem: false, pronom: "en" },
  { prenom: "Nathan", elle: false, pluriel: "places de concert", singulier: "place", article: "une", fem: true, pronom: "en" },
  { prenom: "Inès", elle: true, pluriel: "plants de tomates", singulier: "plant", article: "un", fem: false, pronom: "en" },
  { prenom: "Hugo", elle: false, pluriel: "cartes de collection", singulier: "carte", article: "une", fem: true, pronom: "en" },
];

export const CONTEXTES_TRAJET = [
  { qui: "Un cycliste", entre: "deux villages distants", cause: "à cause du vent de face", vMin: 12, vMax: 30, wMin: 2, wMax: 6, dMin: 15, dMax: 60 },
  { qui: "Une automobiliste", entre: "deux villes distantes", cause: "à cause des embouteillages", vMin: 50, vMax: 110, wMin: 10, wMax: 30, dMin: 60, dMax: 240 },
  { qui: "Un coureur", entre: "deux bornes d'un parcours, distantes", cause: "à cause de la fatigue", vMin: 8, vMax: 15, wMin: 1, wMax: 3, dMin: 6, dMax: 24 },
];

export const CONTEXTES_ROBINETS = [
  { qui: "Deux robinets", objet: "une cuve", objetDefini: "la cuve", verbe: "remplissent", verbeSeul: "remplir", premier: "le premier robinet", second: "le second robinet" },
  { qui: "Deux imprimantes", objet: "un lot de brochures", objetDefini: "le lot de brochures", verbe: "impriment", verbeSeul: "imprimer", premier: "la première imprimante", second: "la seconde imprimante" },
  { qui: "Deux jardiniers", objet: "une haie", objetDefini: "la haie", verbe: "taillent", verbeSeul: "tailler", premier: "le premier jardinier", second: "le second jardinier" },
];

function racinesRationnelles(p: Poly2): number[] {
  const [a, b, c] = p;
  const d = b * b - 4 * a * c;
  const r = Math.sqrt(d);
  return [(-b - r) / (2 * a), (-b + r) / (2 * a)];
}

/** Trinôme (coefficients entiers, réduits, a > 0) obtenu en multipliant par q·x(x + s). */
export function trinomeObtenu(e: Pick<ExerciceProblemesFraction, "N" | "sigma" | "s" | "p" | "q">): Poly2 {
  const a = e.p;
  const b = e.p * e.s - e.q * e.N * (1 + e.sigma);
  const c = -e.q * e.N * e.s;
  const g = pgcd(pgcd(a, b), c) || 1;
  return [a / g, b / g, c / g];
}

/** Facteur commun retiré du trinôme développé (1 si aucun). */
export function facteurCommun(e: Pick<ExerciceProblemesFraction, "N" | "sigma" | "s" | "p" | "q">): number {
  const a = e.p;
  const b = e.p * e.s - e.q * e.N * (1 + e.sigma);
  const c = -e.q * e.N * e.s;
  return pgcd(pgcd(a, b), c) || 1;
}

function fraction(n: number, d: number): { p: number; q: number } {
  const g = pgcd(n, d) || 1;
  return { p: n / g, q: d / g };
}

function finaliser<T extends ExerciceProblemesFraction>(e: Omit<T, "solution" | "autre">, solution: number): T | null {
  const poly = trinomeObtenu(e);
  const [r1, r2] = racinesRationnelles(poly);
  if (!Number.isFinite(r1!) || !Number.isFinite(r2!)) return null;
  const garde = Math.abs(r1! - solution) < 1e-9 ? r1! : Math.abs(r2! - solution) < 1e-9 ? r2! : null;
  if (garde === null) return null;
  const autre = garde === r1 ? r2! : r1!;
  // L'autre racine doit être rationnelle « lisible » (dénominateur ≤ 12) et distincte.
  const den = [1, 2, 3, 4, 5, 6, 8, 10, 12].find((d) => Math.abs(autre * d - Math.round(autre * d)) < 1e-9);
  if (den === undefined || Math.abs(autre - garde) < 1e-9) return null;
  return { ...(e as object), solution: garde, autre: Math.round(autre * den) / den } as T;
}

function genererPrix(forme: FormeProblemesFraction): ExercicePrix {
  for (let essai = 0; essai < 2000; essai++) {
    const n = entierAlea(4, 20);
    const k = entierAlea(1, 5);
    const d = choisir([0.5, 1, 1, 2, 2, 3, 5]);
    const total = (d * n * (n + k)) / k;
    if (!Number.isInteger(total) || total < 20 || total > 400) continue;
    const prix = total / n;
    if (Math.abs(prix * 100 - Math.round(prix * 100)) > 1e-9) continue;
    if (forme === "deduite" && !Number.isInteger(prix * 2)) continue;
    const r = fraction(d * 2, 2);
    const e = finaliser<ExercicePrix>(
      { variante: "prix", forme, contexte: entierAlea(0, CONTEXTES_PRIX.length - 1), N: total, sigma: -1, s: k, p: r.p, q: r.q, total, baisse: d, enPlus: k },
      n,
    );
    if (e) return e;
  }
  throw new Error("gen119 prix : aucun tirage");
}

function genererTrajet(forme: FormeProblemesFraction): ExerciceTrajet {
  for (let essai = 0; essai < 5000; essai++) {
    const ctx = entierAlea(0, CONTEXTES_TRAJET.length - 1);
    const c = CONTEXTES_TRAJET[ctx]!;
    const v = entierAlea(c.vMin, c.vMax);
    const w = entierAlea(c.wMin, c.wMax);
    if (v - w < c.vMin * 0.6) continue;
    const D = entierAlea(c.dMin, c.dMax);
    // H = D(2v − w) / (v(v − w)) heures ; on veut un nombre entier de minutes, multiple de 5.
    const minutes = (60 * D * (2 * v - w)) / (v * (v - w));
    if (Math.abs(minutes - Math.round(minutes)) > 1e-9 || Math.round(minutes) % 5 !== 0) continue;
    const m = Math.round(minutes);
    if (m < 60 || m > 6 * 60) continue;
    const r = fraction(m, 60);
    const e = finaliser<ExerciceTrajet>({ variante: "trajet", forme, contexte: ctx, N: D, sigma: 1, s: -w, p: r.p, q: r.q, distance: D, ecart: w, dureeMinutes: m }, v);
    if (e && e.autre > 0 && e.autre < w) return e;
  }
  throw new Error("gen119 trajet : aucun tirage");
}

function genererRobinets(forme: FormeProblemesFraction): ExerciceRobinets {
  for (let essai = 0; essai < 5000; essai++) {
    const unite = Math.random() < 0.5 ? "h" : "min";
    const n = unite === "h" ? entierAlea(2, 12) : entierAlea(6, 60);
    const k = unite === "h" ? entierAlea(1, 12) : entierAlea(2, 40);
    // T = n(n + k)/(2n + k) dans l'unité ; en heures : un nombre entier de minutes (multiple de 6) ;
    // en minutes : un nombre entier de minutes.
    const T = (n * (n + k)) / (2 * n + k);
    const minutes = unite === "h" ? T * 60 : T;
    if (Math.abs(minutes - Math.round(minutes)) > 1e-9) continue;
    const m = Math.round(minutes);
    if (unite === "h" && (m % 6 !== 0 || m < 60)) continue;
    if (unite === "min" && (m < 5 || m > 59)) continue;
    // 1/T = (2n + k)/(n(n + k)) dans l'unité.
    const r = fraction(2 * n + k, n * (n + k));
    const e = finaliser<ExerciceRobinets>(
      { variante: "robinets", forme, contexte: entierAlea(0, CONTEXTES_ROBINETS.length - 1), N: 1, sigma: 1, s: k, p: r.p, q: r.q, ecart: k, ensembleMinutes: m, unite },
      n,
    );
    if (e && e.autre < 0) return e;
  }
  throw new Error("gen119 robinets : aucun tirage");
}

export function construireAvecVariante(id: string, forme?: FormeProblemesFraction): ExerciceProblemesFraction {
  const f: FormeProblemesFraction = forme ?? (Math.random() < 0.5 ? "directe" : "deduite");
  const v = id as VarianteProblemesFraction;
  if (v === "prix") return genererPrix(f);
  if (v === "trajet") return genererTrajet(f);
  return genererRobinets(f);
}

export function genererExerciceProblemesFraction(): ExerciceProblemesFraction {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}

/** Grandeur demandée par la question (en unité du contexte). */
export function reponseFinale(e: ExerciceProblemesFraction): number {
  if (e.forme === "directe") return e.solution;
  if (e.variante === "prix") return e.total / e.solution;
  if (e.variante === "trajet") return e.solution - e.ecart;
  return e.solution + e.ecart;
}

/** Valeurs interdites par la CE (dénominateurs nuls). */
export function valeursInterdites(e: ExerciceProblemesFraction): number[] {
  return [0, -e.s];
}
