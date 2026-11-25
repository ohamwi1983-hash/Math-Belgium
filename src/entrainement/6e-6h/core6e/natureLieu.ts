import type { D, P } from "../ui6e/outilsLieuxLotH1";
import { choisir, droiteEntiere, droiteNormale, entier, milieu, vec } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen127` « Quelle est la nature du lieu ? » (6e ch. 9, § 4, Connaître). Une
 * condition (distances à deux points, valeurs absolues, distances à des droites, distances aux côtés
 * d'un carré) ; la NATURE du lieu est le verdict, tirée à parts égales parmi les onze natures (ou parmi
 * celles de la famille choisie) AVANT la condition et ses nombres. Écran 1 : la nature (choix fermé,
 * cinq options propres à la FAMILLE, jamais à la nature) ; écran 2 : les éléments caractéristiques
 * (rien si le lieu est vide — deux puces fixes). Pièges du cours : seuils (AB²/2, 4c, 4c², écart des
 * parallèles), somme contre différence, k = 1 pour Apollonius, sommets du losange.
 */

export type Famille127 = "deuxPoints" | "valeursAbsolues" | "distancesDroites" | "carre";
export type Nature127 = "vide" | "point" | "droite" | "droitesSecantes" | "droitesParalleles" | "cercle" | "bande" | "losange" | "carrePlein" | "octogone" | "demiDroites";
export type Phase127 = "nature" | "elements";

export const OPTIONS_127: Record<Famille127, Nature127[]> = {
  deuxPoints: ["vide", "point", "droite", "droitesSecantes", "cercle"],
  valeursAbsolues: ["losange", "demiDroites", "droitesSecantes", "droitesParalleles", "bande"],
  distancesDroites: ["vide", "droite", "droitesParalleles", "droitesSecantes", "bande"],
  carre: ["vide", "point", "cercle", "carrePlein", "octogone"],
};

/** Natures que chaque famille peut produire (le reste des options sert de leurres). */
export const NATURES_FAMILLE: Record<Famille127, Nature127[]> = {
  deuxPoints: ["vide", "point", "droite", "cercle"],
  valeursAbsolues: ["losange", "demiDroites", "droitesSecantes", "droitesParalleles", "bande"],
  distancesDroites: ["vide", "droite", "droitesParalleles", "droitesSecantes", "bande"],
  carre: ["vide", "point", "cercle", "carrePlein", "octogone"],
};

export const TOUTES_NATURES: Nature127[] = ["vide", "point", "droite", "droitesSecantes", "droitesParalleles", "cercle", "bande", "losange", "carrePlein", "octogone", "demiDroites"];

export type Condition127 =
  | { type: "sommeCarres"; A: P; B: P; k: number }
  | { type: "differenceCarres"; A: P; B: P; k: number }
  | { type: "rapport"; A: P; B: P; kn: number; kd: number }
  | { type: "absSomme"; p: number; q: number; k: number }
  | { type: "absDifference"; p: number; q: number; k: number }
  | { type: "absUne"; variable: "x" | "y"; a: number; b: number; k: number; inegalite: boolean }
  | { type: "distanceDroite"; d: D; norme: number; k: number; inegalite: boolean }
  | { type: "equidistantSecantes"; d1: D; d2: D }
  | { type: "equidistantParalleles"; d1: D; d2: D }
  | { type: "sommeParalleles"; variable: "x" | "y"; u: number; v: number; k: number }
  | { type: "carreSomme"; O: P; c: number; k: number }
  | { type: "carreCarres"; O: P; c: number; k: number };

export interface Exercice127 {
  famille: Famille127;
  nature: Nature127;
  condition: Condition127;
}

export const phases127 = (e: Exercice127): Phase127[] => (e.nature === "vide" ? ["nature"] : ["nature", "elements"]);

const sgn = () => (Math.random() < 0.5 ? 1 : -1);
const pointAuHasard = (m = 4): P => ({ x: entier(-m, m), y: entier(-m, m) });

// ---------------------------------------------------------------------------------------------
// Tirage : nature d'abord, puis la famille, puis une condition qui la produit
// ---------------------------------------------------------------------------------------------

function sommeCarres(nature: "vide" | "point" | "cercle"): Condition127 {
  for (;;) {
    const A = pointAuHasard();
    const B = pointAuHasard();
    const ab2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
    if (ab2 < 8 || ab2 % 2 !== 0 || ab2 > 72) continue;
    const seuil = ab2 / 2;
    const k = nature === "point" ? seuil : nature === "cercle" ? seuil + 2 * entier(1, 9) : entier(Math.max(1, Math.ceil(seuil / 3)), seuil - 1);
    return { type: "sommeCarres", A, B, k };
  }
}

function differenceCarres(): Condition127 {
  for (;;) {
    const A = pointAuHasard();
    const B = pointAuHasard();
    if (A.x === B.x && A.y === B.y) continue;
    const k = sgn() * entier(1, 20);
    return { type: "differenceCarres", A, B, k };
  }
}

function rapport(egalUn: boolean): Condition127 {
  for (;;) {
    const A = pointAuHasard(5);
    if (egalUn) {
      const B = pointAuHasard(5);
      if ((B.x - A.x) ** 2 + (B.y - A.y) ** 2 < 4) continue;
      return { type: "rapport", A, B, kn: 1, kd: 1 };
    }
    const [kn, kd] = choisir([
      [2, 1],
      [3, 1],
      [1, 2],
      [1, 3],
    ] as const);
    const w = choisir([
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 1 },
      { x: 1, y: -1 },
      { x: -1, y: 1 },
    ]);
    const facteur = kn === 3 || kd === 3 ? 8 : 3;
    const B = { x: A.x + facteur * w.x, y: A.y + facteur * w.y };
    if (Math.abs(B.x) > 9 || Math.abs(B.y) > 9) continue;
    return { type: "rapport", A, B, kn, kd };
  }
}

function tirerCondition(famille: Famille127, nature: Nature127): Condition127 {
  switch (famille) {
    case "deuxPoints":
      if (nature === "vide" || nature === "point") return sommeCarres(nature);
      if (nature === "droite") return Math.random() < 0.5 ? differenceCarres() : rapport(true);
      return Math.random() < 0.5 ? sommeCarres("cercle") : rapport(false);
    case "valeursAbsolues": {
      const p = entier(-4, 4);
      const q = entier(-4, 4);
      if (nature === "losange") return { type: "absSomme", p, q, k: entier(1, 5) };
      if (nature === "demiDroites") return { type: "absDifference", p, q, k: sgn() * entier(1, 4) };
      if (nature === "droitesSecantes") return { type: "absDifference", p, q, k: 0 };
      // |a·x − b| = k (ou ≤ k), racines entières.
      const a = choisir([1, 1, 2, 3]);
      const x1 = entier(-5, 3);
      let x2 = x1 + entier(1, 6);
      if ((a * (x2 - x1)) % 2 !== 0) x2 += 1;
      return { type: "absUne", variable: Math.random() < 0.6 ? "x" : "y", a, b: (a * (x1 + x2)) / 2, k: (a * (x2 - x1)) / 2, inegalite: nature === "bande" };
    }
    case "distancesDroites": {
      const normal = choisir([
        { n: { x: 3, y: 4 }, N: 5 },
        { n: { x: 4, y: -3 }, N: 5 },
        { n: { x: 3, y: -4 }, N: 5 },
        { n: { x: 1, y: 0 }, N: 1 },
        { n: { x: 0, y: 1 }, N: 1 },
      ]);
      const ligneAuHasard = (): D => ({ a: normal.n.x, b: normal.n.y, c: entier(-12, 12) });
      if (nature === "droitesSecantes") {
        const type = choisir(["axes", "perp", "symetrique"] as const);
        if (type === "axes") return { type: "equidistantSecantes", d1: { a: 1, b: 0, c: -entier(-4, 4) }, d2: { a: 0, b: 1, c: -entier(-4, 4) } };
        if (type === "perp") return { type: "equidistantSecantes", d1: { a: 3, b: 4, c: entier(-10, 10) }, d2: { a: 4, b: -3, c: entier(-10, 10) } };
        return { type: "equidistantSecantes", d1: { a: 3, b: 4, c: entier(-10, 10) }, d2: { a: 3, b: -4, c: entier(-10, 10) } };
      }
      if (nature === "droite") {
        const d1 = ligneAuHasard();
        let c2 = d1.c + 2 * entier(1, 4) * sgn();
        if (c2 === d1.c) c2 += 2;
        return { type: "equidistantParalleles", d1, d2: { ...d1, c: c2 } };
      }
      // Somme des distances à deux parallèles (un tirage sur deux pour « vide », toujours pour lui).
      const parSomme = nature === "vide" || Math.random() < 0.5;
      if (parSomme) {
        const u = entier(-5, 2);
        const e = entier(2, 6);
        const k = nature === "vide" ? entier(1, e - 1) : nature === "bande" ? e : e + 2 * entier(1, 3);
        return { type: "sommeParalleles", variable: Math.random() < 0.6 ? "x" : "y", u, v: u + e, k };
      }
      return { type: "distanceDroite", d: ligneAuHasard(), norme: normal.N, k: entier(1, 4), inegalite: nature === "bande" };
    }
    case "carre": {
      const O = pointAuHasard(3);
      const c = choisir([2, 3]);
      if (nature === "carrePlein") return { type: "carreSomme", O, c, k: 4 * c };
      if (nature === "octogone") return { type: "carreSomme", O, c, k: 4 * c + 2 * entier(1, 3) };
      if (nature === "point") return { type: "carreCarres", O, c, k: 4 * c * c };
      if (nature === "cercle") return { type: "carreCarres", O, c, k: 4 * c * c + 2 * entier(1, 9) };
      // Vide : somme des distances < 4c, ou somme des carrés < 4c² (souvent entre 4c et 4c² : piège).
      return Math.random() < 0.5 ? { type: "carreSomme", O, c, k: entier(c + 1, 4 * c - 1) } : { type: "carreCarres", O, c, k: entier(4 * c, 4 * c * c - 1) };
    }
  }
}

export function tirer127(famille?: Famille127): Exercice127 {
  const nature = famille ? choisir(NATURES_FAMILLE[famille]) : choisir(TOUTES_NATURES);
  const fam = famille ?? choisir((Object.keys(NATURES_FAMILLE) as Famille127[]).filter((f) => NATURES_FAMILLE[f].includes(nature)));
  return { famille: fam, nature, condition: tirerCondition(fam, nature) };
}

// ---------------------------------------------------------------------------------------------
// Éléments caractéristiques exacts
// ---------------------------------------------------------------------------------------------

export interface Elements127 {
  point?: P;
  centre?: P;
  rayon2?: number;
  droites?: D[];
  sommets?: P[];
}

const ligneX = (x: number): D => ({ a: 1, b: 0, c: -x });
const ligneY = (y: number): D => ({ a: 0, b: 1, c: -y });
const ligneVar = (variable: "x" | "y", v: number) => (variable === "x" ? ligneX(v) : ligneY(v));

/** Centre et rayon² du cercle d'Apollonius PA = (kn/kd)·PB. */
export function apollonius(A: P, B: P, kn: number, kd: number): { centre: P; rayon2: number } {
  const k2 = (kn * kn) / (kd * kd);
  const centre = { x: (A.x - k2 * B.x) / (1 - k2), y: (A.y - k2 * B.y) / (1 - k2) };
  const ab2 = (B.x - A.x) ** 2 + (B.y - A.y) ** 2;
  return { centre, rayon2: (k2 * ab2) / (1 - k2) ** 2 };
}

export function elements127(e: Exercice127): Elements127 {
  const c = e.condition;
  switch (c.type) {
    case "sommeCarres": {
      const M = milieu(c.A, c.B);
      const seuil = ((c.B.x - c.A.x) ** 2 + (c.B.y - c.A.y) ** 2) / 2;
      return c.k === seuil ? { point: M } : c.k > seuil ? { centre: M, rayon2: (c.k - seuil) / 2 } : {};
    }
    case "differenceCarres": {
      const u = vec(c.A, c.B);
      return { droites: [droiteEntiere({ a: 2 * u.x, b: 2 * u.y, c: c.A.x ** 2 + c.A.y ** 2 - c.B.x ** 2 - c.B.y ** 2 - c.k })] };
    }
    case "rapport":
      if (c.kn === c.kd) return { droites: [droiteEntiere(droiteNormale(milieu(c.A, c.B), vec(c.A, c.B)))] };
      return apollonius(c.A, c.B, c.kn, c.kd);
    case "absSomme":
      return {
        sommets: [
          { x: c.p + c.k, y: c.q },
          { x: c.p, y: c.q + c.k },
          { x: c.p - c.k, y: c.q },
          { x: c.p, y: c.q - c.k },
        ],
      };
    case "absDifference":
      if (c.k === 0) return { droites: [droiteEntiere({ a: 1, b: -1, c: c.q - c.p }), droiteEntiere({ a: 1, b: 1, c: -c.p - c.q })] };
      return {
        sommets:
          c.k > 0
            ? [
                { x: c.p + c.k, y: c.q },
                { x: c.p - c.k, y: c.q },
              ]
            : [
                { x: c.p, y: c.q - c.k },
                { x: c.p, y: c.q + c.k },
              ],
      };
    case "absUne":
      return { droites: [ligneVar(c.variable, (c.b - c.k) / c.a), ligneVar(c.variable, (c.b + c.k) / c.a)] };
    case "distanceDroite":
      return {
        droites: [droiteEntiere({ ...c.d, c: c.d.c - c.k * c.norme }), droiteEntiere({ ...c.d, c: c.d.c + c.k * c.norme })],
      };
    case "equidistantSecantes":
      return {
        droites: [
          droiteEntiere({ a: c.d1.a - c.d2.a, b: c.d1.b - c.d2.b, c: c.d1.c - c.d2.c }),
          droiteEntiere({ a: c.d1.a + c.d2.a, b: c.d1.b + c.d2.b, c: c.d1.c + c.d2.c }),
        ],
      };
    case "equidistantParalleles":
      return { droites: [droiteEntiere({ a: 2 * c.d1.a, b: 2 * c.d1.b, c: c.d1.c + c.d2.c })] };
    case "sommeParalleles": {
      const e0 = c.v - c.u;
      if (c.k < e0) return {};
      if (c.k === e0) return { droites: [ligneVar(c.variable, c.u), ligneVar(c.variable, c.v)] };
      return { droites: [ligneVar(c.variable, (c.u + c.v - c.k) / 2), ligneVar(c.variable, (c.u + c.v + c.k) / 2)] };
    }
    case "carreSomme": {
      if (c.k < 4 * c.c) return {};
      if (c.k === 4 * c.c)
        return {
          sommets: [
            { x: c.O.x + c.c, y: c.O.y + c.c },
            { x: c.O.x - c.c, y: c.O.y + c.c },
            { x: c.O.x - c.c, y: c.O.y - c.c },
            { x: c.O.x + c.c, y: c.O.y - c.c },
          ],
        };
      const X = (c.k - 2 * c.c) / 2;
      return { droites: [ligneX(c.O.x - X), ligneX(c.O.x + X)] };
    }
    case "carreCarres": {
      const r2 = (c.k - 4 * c.c * c.c) / 2;
      return r2 < 0 ? {} : r2 === 0 ? { point: c.O } : { centre: c.O, rayon2: r2 };
    }
  }
}

/** Seuil de la condition (s'il y en a un), pour le corrigé et les messages. */
export function seuil127(e: Exercice127): number | null {
  const c = e.condition;
  if (c.type === "sommeCarres") return ((c.B.x - c.A.x) ** 2 + (c.B.y - c.A.y) ** 2) / 2;
  if (c.type === "sommeParalleles") return c.v - c.u;
  if (c.type === "carreSomme") return 4 * c.c;
  if (c.type === "carreCarres") return 4 * c.c * c.c;
  return null;
}

/** Octogone : sommets (pour la figure du corrigé). */
export function sommetsOctogone(O: P, c: number, k: number): P[] {
  const X = (k - 2 * c) / 2;
  // Côtés verticaux |X'| = X (pour |Y'| ≤ c), horizontaux |Y'| = X (pour |X'| ≤ c), coins |X'| + |Y'| = k/2.
  return [
    { x: X, y: -c },
    { x: X, y: c },
    { x: c, y: X },
    { x: -c, y: X },
    { x: -X, y: c },
    { x: -X, y: -c },
    { x: -c, y: -X },
    { x: c, y: -X },
  ].map((p) => ({ x: O.x + p.x, y: O.y + p.y }));
}
