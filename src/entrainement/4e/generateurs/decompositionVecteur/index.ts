import type {
  ExerciceComposantes,
  ExerciceDecompositionVecteur,
  ExerciceGraphique,
  FamilleDecomposition,
  PointNomme,
  SystemeOption,
  Vec2,
} from "../../core/decompositionVecteur.types";
import { SYSTEMES_DISTRACTEURS, det, lignesSysteme, nettoyer, resoudre } from "../../moteur/modeleDecompositionVecteur";

/**
 * Générateur de « Décomposer un vecteur selon deux directions » (gen82). Tout le hasard passe par
 * `Math.random` : `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR
 * code d'une feuille rouvre ainsi le MÊME exercice.
 *
 * Garanties (vérifiées par tirages massifs) :
 * - coefficients entiers ou demi-entiers, jamais tous deux nuls ; le motif de signes (++, +−, −−)
 *   est tiré d'abord, uniformément, puis les valeurs ;
 * - un coefficient nul (vecteur porté par une seule direction) n'est tiré qu'une fois sur huit
 *   environ — c'est le cas particulier des évaluations (`profil.ts`) ;
 * - figures : \vec{v} et \vec{w} jamais perpendiculaires au quadrillage (sinon projeter
 *   perpendiculairement donnerait par hasard la bonne réponse) ; \vec{u} ne recouvre jamais le
 *   segment qui représente \vec{v} ou \vec{w} ; le point M est toujours un point nommé ;
 * - composantes : \vec{v} et \vec{w} non colinéaires, \vec{u} à composantes entières (|·| ≤ 15) ;
 *   variante « possible » : verdict tiré à pile ou face ; impossible = \vec{w} = k·\vec{v} et \vec{u}
 *   non colinéaire à \vec{v}.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const r = [...liste];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

const PROBA_CAS_PARTICULIER = 1 / 8;

export type MotifSignes = "++" | "+-" | "--";

/** Motif de signes cible ; `cas` : un coefficient nul (lequel est tiré ici). */
interface Cible {
  motif: MotifSignes;
  /** null : aucun nul ; "a" ou "b" : ce coefficient vaut 0. */
  nul: "a" | "b" | null;
}

function tirerCible(cas: boolean): Cible {
  return { motif: choisir(["++", "+-", "--"] as const), nul: cas ? choisir(["a", "b"] as const) : null };
}

export function motifDe(a: number, b: number): MotifSignes | "0" {
  if (a === 0 || b === 0) return "0";
  if (a > 0 && b > 0) return "++";
  if (a < 0 && b < 0) return "--";
  return "+-";
}

/** (a ; b) respecte la cible : le motif (sans nul), ou le coefficient nul attendu. */
function respecte(a: number, b: number, c: Cible): boolean {
  if (a === 0 && b === 0) return false;
  // \vec{u} = ±\vec{v} ou ±\vec{w} : rien à décomposer.
  if ((Math.abs(a) === 1 && b === 0) || (a === 0 && Math.abs(b) === 1)) return false;
  if (c.nul === "a") return a === 0;
  if (c.nul === "b") return b === 0;
  return a !== 0 && b !== 0 && motifDe(a, b) === c.motif;
}

/** Valeurs absolues possibles d'un coefficient : entiers, et demi-entiers si `demi`. */
function magnitudes(max: number, demi: boolean): number[] {
  const r: number[] = [];
  for (let k = 1; k <= 2 * max; k++) if (demi || k % 2 === 0) r.push(k / 2);
  return r;
}

/** Tire (a ; b) selon la cible. Un demi-entier n'est possible que si `demiA` / `demiB`. */
function tirerCoefficients(c: Cible, maxA: number, maxB: number, demiA: boolean, demiB: boolean): { a: number; b: number } {
  // Demi-entiers un peu moins fréquents que les entiers (mais présents dès que la figure le permet).
  const tire = (max: number, demi: boolean) => {
    const ent = magnitudes(max, false);
    const dem = demi ? magnitudes(max, true).filter((m) => !Number.isInteger(m)) : [];
    return dem.length > 0 && Math.random() < 0.4 ? choisir(dem) : choisir(ent);
  };
  let a = tire(maxA, demiA);
  let b = tire(maxB, demiB);
  if (c.nul === "a") a = 0;
  if (c.nul === "b") b = 0;
  const sA = c.nul ? choisir([1, -1]) : c.motif === "--" ? -1 : 1;
  const sB = c.nul ? choisir([1, -1]) : c.motif === "++" ? 1 : -1;
  if (c.motif === "+-" && !c.nul && Math.random() < 0.5) return { a: -a, b };
  return { a: nettoyer(sA * a), b: nettoyer(sB * b) };
}

// ---------------------------------------------------------------------------------------------
// Figures en réseau : réseau oblique (directions du réseau), quadrillage (directions obliques)
// ---------------------------------------------------------------------------------------------

const LETTRES_EXTRA = ["A", "B", "C", "D", "E"];

function egal(p: { i: number; j: number }, q: { i: number; j: number }): boolean {
  return p.i === q.i && p.j === q.j;
}

function dansFenetre(p: { i: number; j: number }, iMax: number, jMax: number): boolean {
  return p.i >= 0 && p.i <= iMax && p.j >= 0 && p.j <= jMax;
}

function entierPoint(p: { i: number; j: number }): boolean {
  return Number.isInteger(nettoyer(p.i)) && Number.isInteger(nettoyer(p.j));
}

function plus(p: { i: number; j: number }, v: Vec2, k: number): { i: number; j: number } {
  return { i: nettoyer(p.i + k * v.x), j: nettoyer(p.j + k * v.y) };
}

interface Boite {
  i0: number;
  i1: number;
  j0: number;
  j1: number;
}

function boite(pts: { i: number; j: number }[]): Boite {
  return {
    i0: Math.min(...pts.map((p) => p.i)),
    i1: Math.max(...pts.map((p) => p.i)),
    j0: Math.min(...pts.map((p) => p.j)),
    j1: Math.max(...pts.map((p) => p.j)),
  };
}

function separees(b1: Boite, b2: Boite): boolean {
  return b1.i1 + 1 <= b2.i0 || b2.i1 + 1 <= b1.i0 || b1.j1 + 1 <= b2.j0 || b2.j1 + 1 <= b1.j0;
}

function genererReseau(famille: "reseau" | "quadrillage", c: Cible): ExerciceGraphique | null {
  let e1: Vec2;
  let e2: Vec2;
  let iMax: number;
  let jMax: number;
  let v: Vec2;
  let w: Vec2;
  if (famille === "reseau") {
    e1 = { x: 1, y: 0 };
    e2 = choisir([
      { x: 0.45, y: 0.88 },
      { x: -0.45, y: 0.88 },
      { x: 0.3, y: 0.92 },
      { x: -0.3, y: 0.92 },
    ]);
    iMax = 7;
    jMax = 5;
    const kv = choisir([1, 1, 2]);
    const kw = choisir([1, 1, 2]);
    const sv = choisir([1, -1]);
    const sw = choisir([1, -1]);
    if (Math.random() < 0.5) {
      v = { x: sv * kv, y: 0 };
      w = { x: 0, y: sw * kw };
    } else {
      v = { x: 0, y: sv * kv };
      w = { x: sw * kw, y: 0 };
    }
  } else {
    e1 = { x: 1, y: 0 };
    e2 = { x: 0, y: 1 };
    iMax = 10;
    jMax = 7;
    const comp = () => entier(-3, 3);
    v = { x: comp(), y: comp() };
    w = { x: comp(), y: comp() };
    if ((v.x === 0 && v.y === 0) || (w.x === 0 && w.y === 0)) return null;
    if (det(v, w) === 0) return null;
    // Jamais perpendiculaires : la projection perpendiculaire (erreur classique) donnerait la bonne réponse.
    if (v.x * w.x + v.y * w.y === 0) return null;
    // Au plus une direction parallèle aux lignes du quadrillage (sinon c'est un simple réseau).
    const axe = (p: Vec2) => p.x === 0 || p.y === 0;
    if (axe(v) && axe(w)) return null;
  }
  const pair = (p: Vec2) => p.x % 2 === 0 && p.y % 2 === 0;
  const { a, b } = tirerCoefficients(c, 3, 3, pair(v), pair(w));
  if (!respecte(a, b, c)) return null;
  const P = { i: entier(0, iMax), j: entier(0, jMax) };
  const M = plus(P, v, a);
  const Q = plus(M, w, b);
  const Mp = plus(P, w, b);
  if (![M, Q, Mp].every((p) => entierPoint(p) && dansFenetre(p, iMax, jMax))) return null;
  // Figure lisible : \vec{u} et chaque côté de la construction assez longs (en côtés de case).
  const longueur = (d: Vec2) => Math.hypot(d.x * e1.x + d.y * e2.x, d.x * e1.y + d.y * e2.y);
  const minCote = famille === "quadrillage" ? 2 : 0.99;
  const minU = famille === "quadrillage" ? 3 : 2.2;
  if (a !== 0 && longueur({ x: a * v.x, y: a * v.y }) < minCote) return null;
  if (b !== 0 && longueur({ x: b * w.x, y: b * w.y }) < minCote) return null;
  if (longueur({ x: Q.i - P.i, y: Q.j - P.j }) < minU) return null;
  // Lettres proposées : M (s'il n'est ni P ni Q), l'autre sommet M' (directions inversées), puis
  // les points « à contresens » sur les deux droites issues de P.
  const extras: { i: number; j: number }[] = [];
  const ajouter = (p: { i: number; j: number }) => {
    if (!entierPoint(p) || !dansFenetre(p, iMax, jMax)) return;
    if (egal(p, P) || egal(p, Q) || extras.some((x) => egal(x, p))) return;
    extras.push(p);
  };
  ajouter(M);
  ajouter(Mp);
  if (a !== 0) ajouter(plus(P, v, -a));
  if (b !== 0) ajouter(plus(P, w, -b));
  ajouter(plus(Q, v, -2 * a));
  for (let essai = 0; extras.length < 3 && essai < 40; essai++) {
    const bo = boite([P, Q, M, Mp]);
    ajouter({ i: entier(bo.i0 - 1, bo.i1 + 1), j: entier(bo.j0 - 1, bo.j1 + 1) });
  }
  if (extras.length < 3) return null;
  const choisis = extras.slice(0, 3);
  // Légende : \vec{v} et \vec{w} dessinés depuis un nœud G, hors de la zone de la décomposition.
  const zone = boite([P, Q, M, Mp, ...choisis]);
  const coins = melanger([
    { i: 0, j: 0 },
    { i: iMax, j: 0 },
    { i: 0, j: jMax },
    { i: iMax, j: jMax },
  ]);
  let origineVW: { i: number; j: number } | null = null;
  for (const coin of coins) {
    // Le nœud G est placé pour que G, G + v, G + w restent dans la fenêtre, près du coin.
    const i = coin.i === 0 ? Math.max(0, -v.x, -w.x) : iMax - Math.max(0, v.x, w.x);
    const j = coin.j === 0 ? Math.max(0, -v.y, -w.y) : jMax - Math.max(0, v.y, w.y);
    const G = { i, j };
    const bl = boite([G, plus(G, v, 1), plus(G, w, 1)]);
    if (![G, plus(G, v, 1), plus(G, w, 1)].every((p) => dansFenetre(p, iMax, jMax))) continue;
    if (separees(bl, zone)) {
      origineVW = G;
      break;
    }
  }
  if (!origineVW) return null;
  const lettres = melanger(LETTRES_EXTRA).slice(0, 3);
  const points: PointNomme[] = [
    { nom: "P", i: P.i, j: P.j },
    { nom: "Q", i: Q.i, j: Q.j },
    ...choisis.map((p, k) => ({ nom: lettres[k]!, i: p.i, j: p.j })),
  ];
  const nomM = points.find((p) => egal(p, M))!.nom;
  return {
    type: "graphique",
    famille,
    e1,
    e2,
    iMax,
    jMax,
    points,
    v,
    w,
    origineVW,
    origine: "P",
    extremite: "Q",
    a,
    b,
    pointM: nomM,
    options: [...points.map((p) => p.nom)].sort(),
  };
}

// ---------------------------------------------------------------------------------------------
// Figures à points nommés : parallélogramme découpé, hexagone régulier
// ---------------------------------------------------------------------------------------------

/** Deux segments [p1 ; p2] et [q1 ; q2] portés par la même droite et qui se recouvrent. */
function serecouvrent(p1: PointNomme, p2: PointNomme, q1: PointNomme, q2: PointNomme): boolean {
  const d = { x: p2.i - p1.i, y: p2.j - p1.j };
  const f = { x: q2.i - q1.i, y: q2.j - q1.j };
  if (nettoyer(det(d, f)) !== 0) return false;
  if (nettoyer(det(d, { x: q1.i - p1.i, y: q1.j - p1.j })) !== 0) return false;
  const t = (q: PointNomme) => ((q.i - p1.i) * d.x + (q.j - p1.j) * d.y) / (d.x * d.x + d.y * d.y);
  const [s0, s1] = [t(q1), t(q2)].sort((x, y) => x - y);
  return Math.min(1, s1!) - Math.max(0, s0!) > 1e-9;
}

interface Representant {
  noms: [string, string];
  vec: Vec2;
}

function genererFigureNommee(famille: "parallelogramme" | "hexagone", c: Cible): ExerciceGraphique | null {
  let points: PointNomme[];
  let e1: Vec2;
  let e2: Vec2;
  let reps: Representant[];
  if (famille === "parallelogramme") {
    const pente = choisir([0.42, -0.42, 0.55, -0.55]);
    e1 = { x: 1.15, y: 0 };
    e2 = { x: pente, y: 0.82 };
    points = [
      { nom: "A", i: 0, j: 0 },
      { nom: "I", i: 1, j: 0 },
      { nom: "B", i: 2, j: 0 },
      { nom: "L", i: 0, j: 1 },
      { nom: "O", i: 1, j: 1 },
      { nom: "J", i: 2, j: 1 },
      { nom: "D", i: 0, j: 2 },
      { nom: "K", i: 1, j: 2 },
      { nom: "C", i: 2, j: 2 },
    ];
    // Représentants : côtés (longueur 2) ou demi-côtés (longueur 1), dans les deux directions.
    const tous: Representant[] = [];
    for (const p of points) {
      for (const [di, dj] of [
        [2, 0],
        [0, 2],
        [1, 0],
        [0, 1],
      ] as const) {
        const q = points.find((x) => x.i === p.i + di && x.j === p.j + dj);
        if (q) tous.push({ noms: [p.nom, q.nom], vec: { x: di, y: dj } });
      }
    }
    const longueur = choisir(["cotes", "demi", "mixte"] as const);
    const horizontal = tous.filter((r) => r.vec.y === 0 && (longueur === "demi" ? r.vec.x === 1 : r.vec.x === 2));
    const vertical = tous.filter((r) => r.vec.x === 0 && (longueur === "cotes" ? r.vec.y === 2 : r.vec.y === 1));
    // Les côtés extérieurs sont préférés (lisibles), les demi-côtés pris sur le bord.
    const bord = (r: Representant) => r.noms.every((n) => n !== "O");
    const rH = choisir(horizontal.filter(bord));
    const rV = choisir(vertical.filter(bord));
    reps = Math.random() < 0.5 ? [rH, rV] : [rV, rH];
  } else {
    const rot = choisir([0, Math.PI / 6]);
    const tourne = (p: Vec2): Vec2 => ({ x: p.x * Math.cos(rot) - p.y * Math.sin(rot), y: p.x * Math.sin(rot) + p.y * Math.cos(rot) });
    e1 = tourne({ x: 1, y: 0 });
    e2 = tourne({ x: 0.5, y: Math.sqrt(3) / 2 });
    const sommets = [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [0, -1],
      [1, -1],
    ] as const;
    const decal = entier(0, 5);
    points = [
      ...sommets.map(([i, j], k) => ({ nom: "ABCDEF"[(k - decal + 6) % 6]!, i, j })),
      { nom: "O", i: 0, j: 0 },
    ];
    reps = [];
    const unite = [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [0, -1],
      [1, -1],
    ];
    for (const p of points) {
      for (const q of points) {
        const d = [q.i - p.i, q.j - p.j];
        if (unite.some(([x, y]) => x === d[0] && y === d[1])) reps.push({ noms: [p.nom, q.nom], vec: { x: d[0]!, y: d[1]! } });
      }
    }
    const rv = choisir(reps);
    const rw = choisir(reps.filter((r) => det(r.vec, rv.vec) !== 0));
    reps = [rv, rw];
  }
  const [rv, rw] = reps as [Representant, Representant];
  const pt = (n: string) => points.find((p) => p.nom === n)!;
  const candidats: { X: PointNomme; Y: PointNomme; a: number; b: number; M: PointNomme }[] = [];
  for (const X of points) {
    for (const Y of points) {
      if (X === Y) continue;
      const { a, b } = resoudre({ x: Y.i - X.i, y: Y.j - X.j }, rv.vec, rw.vec);
      if (!respecte(a, b, c)) continue;
      const Mi = nettoyer(X.i + a * rv.vec.x);
      const Mj = nettoyer(X.j + a * rv.vec.y);
      const M = points.find((p) => p.i === Mi && p.j === Mj);
      if (!M) continue;
      if (serecouvrent(X, Y, pt(rv.noms[0]), pt(rv.noms[1])) || serecouvrent(X, Y, pt(rw.noms[0]), pt(rw.noms[1]))) continue;
      // \vec{u} différent de \vec{v} et \vec{w} au signe près (sinon il n'y a rien à décomposer).
      if ((Math.abs(a) === 1 && b === 0) || (a === 0 && Math.abs(b) === 1)) continue;
      candidats.push({ X, Y, a, b, M });
    }
  }
  if (candidats.length === 0) return null;
  const choix = choisir(candidats);
  return {
    type: "graphique",
    famille,
    e1,
    e2,
    iMax: 0,
    jMax: 0,
    points,
    v: rv.vec,
    w: rw.vec,
    nomsV: rv.noms,
    nomsW: rw.noms,
    origine: choix.X.nom,
    extremite: choix.Y.nom,
    a: choix.a,
    b: choix.b,
    pointM: choix.M.nom,
    options: points.map((p) => p.nom).sort(),
  };
}

// ---------------------------------------------------------------------------------------------
// Composantes
// ---------------------------------------------------------------------------------------------

function vecteurAleatoire(max: number): Vec2 {
  return { x: entier(-max, max), y: entier(-max, max) };
}

function genererComposantes(c: Cible): ExerciceComposantes | null {
  const v = vecteurAleatoire(4);
  const w = vecteurAleatoire(4);
  if ((v.x === 0 && v.y === 0) || (w.x === 0 && w.y === 0)) return null;
  const D = det(v, w);
  if (D === 0 || Math.abs(D) > 20) return null;
  // Au plus une composante nulle en tout : le système demande une vraie résolution.
  if ([v.x, v.y, w.x, w.y].filter((x) => x === 0).length > 1) return null;
  const pair = (p: Vec2) => p.x % 2 === 0 && p.y % 2 === 0;
  const { a, b } = tirerCoefficients(c, 3, 3, pair(v), pair(w));
  if (!respecte(a, b, c)) return null;
  // Vérification (écran 3) : jamais a = ±1 et b = ±1 ensemble (il n'y aurait rien à calculer).
  if (Math.abs(a) === 1 && Math.abs(b) === 1) return null;
  const u = { x: nettoyer(a * v.x + b * w.x), y: nettoyer(a * v.y + b * w.y) };
  if (!Number.isInteger(u.x) || !Number.isInteger(u.y) || Math.abs(u.x) > 15 || Math.abs(u.y) > 15) return null;
  if (u.x === 0 && u.y === 0) return null;
  const e: ExerciceComposantes = { type: "composantes", famille: "composantes", u, v, w, possible: true, a, b, k: null, ordreSystemes: [] };
  // Trois systèmes distincts : le bon et deux distracteurs (au rendu près).
  const cle = (o: SystemeOption) => JSON.stringify(lignesSysteme(e, o));
  const options: SystemeOption[] = ["correct"];
  for (const o of melanger(SYSTEMES_DISTRACTEURS)) {
    if (options.length < 3 && !options.some((x) => cle(x) === cle(o))) options.push(o);
  }
  if (options.length < 3) return null;
  e.ordreSystemes = melanger(options);
  return e;
}

function genererPossible(possible: boolean): ExerciceComposantes | null {
  if (possible) {
    const e = genererComposantes(tirerCible(false));
    if (!e) return null;
    return { ...e, famille: "possible", ordreSystemes: [] };
  }
  const v = vecteurAleatoire(4);
  if (v.x === 0 || v.y === 0) return null;
  const k = choisir([-3, -2, -1, 2, 3, 0.5, -0.5, 1.5, -1.5]);
  const w = { x: nettoyer(k * v.x), y: nettoyer(k * v.y) };
  if (!Number.isInteger(w.x) || !Number.isInteger(w.y) || Math.abs(w.x) > 9 || Math.abs(w.y) > 9) return null;
  const u = vecteurAleatoire(8);
  if (det(u, v) === 0) return null;
  return { type: "composantes", famille: "possible", u, v, w, possible: false, a: null, b: null, k, ordreSystemes: [] };
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles)
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: FamilleDecomposition; label: string }[] = [
  { id: "reseau", label: "Réseau de parallélogrammes" },
  { id: "parallelogramme", label: "Parallélogramme découpé" },
  { id: "hexagone", label: "Hexagone régulier" },
  { id: "quadrillage", label: "Quadrillage (directions obliques)" },
  { id: "composantes", label: "En composantes : poser et résoudre le système" },
  { id: "possible", label: "En composantes : la décomposition est-elle possible ?" },
];

export function genererDecomposition(famille: FamilleDecomposition, casParticulier?: boolean): ExerciceDecompositionVecteur {
  if (famille === "possible") {
    // Verdict tiré UNE fois avant les rejets : issues équilibrées (1/2 chacune).
    const possible = Math.random() < 0.5;
    for (;;) {
      const e = genererPossible(possible);
      if (e) return e;
    }
  }
  const cas = casParticulier ?? Math.random() < PROBA_CAS_PARTICULIER;
  const cible = tirerCible(cas);
  for (;;) {
    const e =
      famille === "composantes"
        ? genererComposantes(cible)
        : famille === "reseau" || famille === "quadrillage"
          ? genererReseau(famille, cible)
          : genererFigureNommee(famille, cible);
    if (e) return e;
  }
}

export function construireAvecVariante(id: string): ExerciceDecompositionVecteur {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  if (!v) return genererExerciceDecompositionVecteur();
  return genererDecomposition(v.id);
}

/** Tirage libre : une des six variantes au hasard. */
export function genererExerciceDecompositionVecteur(): ExerciceDecompositionVecteur {
  return genererDecomposition(choisir(CATALOGUE_VARIANTES).id);
}
