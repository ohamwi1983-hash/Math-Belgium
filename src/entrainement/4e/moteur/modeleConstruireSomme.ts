import type { Composantes, EcranConstruireSomme, EcranConstruction, ExerciceConstruireSomme, Point } from "../core/construireSomme.types";
import { calculerViewBoxVecteurs, type ViewBoxTransformation } from "../ui/vecteurGraph";

/**
 * Modèle de gen83 : points remarquables, écrans successifs et fenêtre du quadrillage. Une seule
 * source pour l'appli, les aides, la vérification et l'adaptateur de feuilles.
 */

export function plus(p: Point, w: Composantes, k = 1): Point {
  return { x: net(p.x + k * w.x), y: net(p.y + k * w.y) };
}

export function moins(a: Point, b: Point): Composantes {
  return { x: net(a.x - b.x), y: net(a.y - b.y) };
}

export function memePoint(a: Point, b: Point): boolean {
  return Math.abs(a.x - b.x) < 1e-9 && Math.abs(a.y - b.y) < 1e-9;
}

/** −0 → 0 (jamais « −0 » affiché). */
export function net(n: number): number {
  return n === 0 ? 0 : n;
}

/** Coefficients RÉELS appliqués à u et v pour obtenir le vecteur final (point MA : opposés). */
export function coefficientsEffectifs(e: ExerciceConstruireSomme): { k: number; l: number } {
  return e.methode === "MA" ? { k: net(-e.k), l: net(-e.l) } : { k: e.k, l: e.l };
}

/** Vecteur final (k·u + l·v, coefficients effectifs). */
export function vecteurFinal(e: ExerciceConstruireSomme): Composantes {
  const { k, l } = coefficientsEffectifs(e);
  return { x: net(k * e.u.x + l * e.v.x), y: net(k * e.u.y + l * e.v.y) };
}

/** Extrémité attendue de la construction finale (M pour la variante point). */
export function pointFinal(e: ExerciceConstruireSomme): Point {
  return plus(e.O, vecteurFinal(e));
}

/** Points B et C de la variante point (AB = u, AC = v). */
export function pointsABC(e: ExerciceConstruireSomme): { A: Point; B: Point; C: Point } {
  return { A: e.O, B: plus(e.O, e.u), C: plus(e.O, e.v) };
}

/** « 2\vec{u} », « -\vec{v} », « \dfrac{1}{2}\vec{u} », « -\dfrac{3}{2}\vec{AB} ». */
export function termeLatex(k: number, nom: string): string {
  const signe = k < 0 ? "-" : "";
  const a = Math.abs(k);
  if (a === 1) return `${signe}${nom}`;
  if (Number.isInteger(a)) return `${signe}${a}${nom}`;
  return `${signe}\\frac{${Math.round(a * 2)}}{2}${nom}`;
}

/** « 2\vec{u} - \vec{v} » (le second terme porte son signe). */
export function combinaisonLatex(k: number, nomU: string, l: number, nomV: string): string {
  const premier = termeLatex(k, nomU);
  const second = termeLatex(Math.abs(l), nomV);
  return `${premier} ${l < 0 ? "-" : "+"} ${second}`;
}

export const VEC_U = "\\vec{u}";
export const VEC_V = "\\vec{v}";
export const VEC_AB = "\\vec{AB}";
export const VEC_AC = "\\vec{AC}";

/** Vecteur demandé, tel que l'énoncé le nomme (somme : « \vec{u}+\vec{v} »…). */
export function vecteurDemandeLatex(e: ExerciceConstruireSomme): string {
  if (e.variante === "point") return combinaisonLatex(e.k, VEC_AB, e.l, VEC_AC);
  return combinaisonLatex(e.k, VEC_U, e.l, VEC_V);
}

/** Les écrans de l'exercice, dans l'ordre. */
export function ecrans(e: ExerciceConstruireSomme): EcranConstruireSomme[] {
  const U = plus(e.O, e.u);
  const V = plus(e.O, e.v);
  const final = pointFinal(e);
  const resultat: EcranConstruction = { type: "construction", origine: e.O, attendu: final, role: "resultat", vecteurLatex: vecteurDemandeLatex(e) };
  switch (e.methode) {
    case "triangle":
    case "parallelogramme":
      return [{ type: "construction", origine: U, attendu: final, role: "reporter", vecteurLatex: VEC_V }, resultat];
    case "oppose":
      return [{ type: "construction", origine: U, attendu: final, role: "oppose", vecteurLatex: `-${VEC_V}` }, resultat];
    case "origineCommune":
      return [
        { type: "construction", origine: V, attendu: U, role: "differenceCommune", vecteurLatex: vecteurDemandeLatex(e) },
        { ...resultat, role: "reporter" },
      ];
    case "chaine": {
      const P = plus(e.O, e.u, e.k);
      return [
        { type: "construction", origine: e.O, attendu: P, role: Math.abs(e.k) === 1 ? (e.k < 0 ? "oppose" : "reporter") : "multiple", vecteurLatex: termeLatex(e.k, VEC_U) },
        { type: "construction", origine: P, attendu: final, role: Math.abs(e.l) === 1 ? (e.l < 0 ? "oppose" : "reporter") : "multiple", vecteurLatex: termeLatex(e.l, VEC_V) },
        resultat,
      ];
    }
    case "AM":
    case "MA": {
      const { k, l } = coefficientsEffectifs(e);
      const P = plus(e.O, e.u, k);
      const etapes: EcranConstruireSomme[] = [
        { type: "construction", origine: e.O, attendu: P, role: Math.abs(k) === 1 ? (k < 0 ? "oppose" : "reporter") : "multiple", vecteurLatex: termeLatex(k, VEC_AB) },
        { type: "construction", origine: P, attendu: final, role: "placerPoint", vecteurLatex: termeLatex(l, VEC_AC) },
      ];
      if (e.methode === "AM") return etapes;
      return [{ type: "choix", options: optionsRetournement(e), correct: 0 }, ...etapes];
    }
    case "lecture":
      return [{ type: "lecture" }];
  }
}

/** Options du retournement (point MA), la bonne en premier (l'écran les mélange par graine). */
export function optionsRetournement(e: ExerciceConstruireSomme): string[] {
  const { k, l } = { k: e.k, l: e.l };
  return [
    combinaisonLatex(net(-k), VEC_AB, net(-l), VEC_AC),
    combinaisonLatex(k, VEC_AB, l, VEC_AC),
    combinaisonLatex(net(-k), VEC_AB, l, VEC_AC),
    combinaisonLatex(k, VEC_AB, net(-l), VEC_AC),
  ];
}

/** Ordre d'affichage des options du retournement : déterministe (tiré des données), jamais la bonne
 * toujours en premier. */
export function ordreOptions(e: ExerciceConstruireSomme): number[] {
  const graine = Math.abs(e.u.x * 7 + e.u.y * 13 + e.v.x * 17 + e.v.y * 19 + e.O.x * 3 + e.O.y * 5);
  const permutations = [
    [0, 1, 2, 3],
    [1, 0, 3, 2],
    [2, 3, 0, 1],
    [3, 2, 1, 0],
    [1, 2, 0, 3],
    [2, 0, 3, 1],
  ];
  return permutations[graine % permutations.length]!;
}

/** Extrémités attendues de toutes les constructions (pour la fenêtre et le corrigé). */
export function pointsConstruits(e: ExerciceConstruireSomme): Point[] {
  return ecrans(e).flatMap((ec) => (ec.type === "construction" ? [ec.origine, ec.attendu] : []));
}

/** Vecteurs dessinés dans les DONNÉES (u et v, ou AB et AC pour la variante point). */
export function vecteursDonnes(e: ExerciceConstruireSomme): { nom: string; origine: Point; composantes: Composantes }[] {
  if (e.variante === "point") return [];
  return [
    { nom: "u", origine: e.origineU, composantes: e.u },
    { nom: "v", origine: e.origineV, composantes: e.v },
  ];
}

/** Points nommés des données. */
export function pointsDonnes(e: ExerciceConstruireSomme): { nom: string; point: Point }[] {
  if (e.variante === "lecture") return [];
  if (e.variante === "point") {
    const { A, B, C } = pointsABC(e);
    return [
      { nom: "A", point: A },
      { nom: "B", point: B },
      { nom: "C", point: C },
    ];
  }
  return [{ nom: "O", point: e.O }];
}

/** Décalages proposés pour la poignée au début d'un écran (jamais sur la réponse). */
const DECALAGES_INITIAUX: Composantes[] = [
  { x: 2, y: 0 },
  { x: 0, y: 2 },
  { x: -2, y: 0 },
  { x: 0, y: -2 },
  { x: 1, y: 1 },
];

export function poigneeInitiale(ec: EcranConstruction, interdits: Point[] = []): Point {
  for (const d of DECALAGES_INITIAUX) {
    const p = plus(ec.origine, d);
    if (!memePoint(p, ec.attendu) && !interdits.some((q) => memePoint(p, q))) return p;
  }
  return plus(ec.origine, { x: 1, y: -1 });
}

/** Tous les points qui doivent être visibles sur le quadrillage (données, constructions, poignées). */
export function pointsAVoir(e: ExerciceConstruireSomme): Point[] {
  const donnees = [
    ...pointsDonnes(e).map((p) => p.point),
    ...vecteursDonnes(e).flatMap((v) => [v.origine, plus(v.origine, v.composantes)]),
  ];
  const constructions = ecrans(e).flatMap((ec) => (ec.type === "construction" ? [ec.origine, ec.attendu, poigneeInitiale(ec)] : []));
  return [...donnees, ...constructions];
}

/** Fenêtre FIXE du quadrillage (même principe que gen23 : elle ne suit jamais la poignée). */
export function fenetre(e: ExerciceConstruireSomme): ViewBoxTransformation {
  // Un peu de place autour des points nommés : leur lettre, décalée, ne sort jamais du cadre.
  const nommes = [...pointsDonnes(e).map((p) => p.point), ...(e.variante === "point" ? pointsConstruits(e) : [])];
  const marges = nommes.flatMap((p) => [plus(p, { x: 1.2, y: 1.2 }), plus(p, { x: -1.2, y: -1.2 })]);
  return calculerViewBoxVecteurs([...pointsAVoir(e), ...marges].map((point) => ({ point, label: "" })));
}

/** Étendue (largeur, hauteur) des points à voir, en unités du quadrillage. */
export function etendue(points: Point[]): { largeur: number; hauteur: number; minX: number; minY: number } {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  return { largeur: Math.max(...xs) - Math.min(...xs), hauteur: Math.max(...ys) - Math.min(...ys), minX: Math.min(...xs), minY: Math.min(...ys) };
}

/** Distance d'un point au segment [P ; P + w]. */
export function distanceSegment(q: Point, p: Point, w: Composantes): number {
  const l2 = w.x * w.x + w.y * w.y;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((q.x - p.x) * w.x + (q.y - p.y) * w.y) / l2));
  return Math.hypot(q.x - (p.x + t * w.x), q.y - (p.y + t * w.y));
}

/** Tous les segments de la figure complète (données + toutes les constructions). */
export function segmentsFigure(e: ExerciceConstruireSomme): { origine: Point; w: Composantes }[] {
  const donnees = vecteursDonnes(e).map((v) => ({ origine: v.origine, w: v.composantes }));
  const ab = e.variante === "point" ? [{ origine: e.O, w: e.u }, { origine: e.O, w: e.v }] : [];
  const constructions = ecrans(e).flatMap((ec) => (ec.type === "construction" ? [{ origine: ec.origine, w: moins(ec.attendu, ec.origine) }] : []));
  return [...donnees, ...ab, ...constructions];
}

/**
 * Centre de l'étiquette d'un point : parmi huit positions autour du point (à 0,95 carreau), celle
 * qui s'éloigne le plus des flèches et des autres points de la figure COMPLÈTE (elle ne saute pas
 * d'un écran à l'autre). Même règle à l'écran et sur papier.
 */
export function centreEtiquettePoint(e: ExerciceConstruireSomme, p: Point, autresPoints: Point[]): Point {
  const segments = segmentsFigure(e);
  const directions = [
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: -1, y: 1 },
    { x: 1, y: 1 },
    { x: 0, y: -1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
  ];
  let meilleur = { x: p.x - 0.53, y: p.y - 0.53 };
  let score = -Infinity;
  for (const d of directions) {
    const L = Math.hypot(d.x, d.y);
    const c = { x: p.x + (0.95 * d.x) / L, y: p.y + (0.95 * d.y) / L };
    const s = Math.min(...segments.map((sg) => distanceSegment(c, sg.origine, sg.w)), ...autresPoints.filter((q) => !memePoint(q, p)).map((q) => Math.hypot(q.x - c.x, q.y - c.y)));
    if (s > score + 1e-9) {
      score = s;
      meilleur = c;
    }
  }
  return meilleur;
}

/**
 * Centre de l'étiquette (« u », « v ») d'un vecteur donné : au milieu de la flèche, décalé
 * perpendiculairement du côté le plus éloigné des AUTRES flèches de la figure complète (les
 * constructions comprises) ; à égalité, au-dessus. Même règle à l'écran et sur papier.
 */
export function centreEtiquetteVecteur(e: ExerciceConstruireSomme, origine: Point, w: Composantes): Point {
  const autres = segmentsFigure(e).filter((s) => !(memePoint(s.origine, origine) && s.w.x === w.x && s.w.y === w.y));
  const L = Math.hypot(w.x, w.y) || 1;
  let perp = { x: -w.y / L, y: w.x / L };
  if (perp.y < 0 || (perp.y === 0 && perp.x > 0)) perp = { x: -perp.x, y: -perp.y };
  const milieu = { x: origine.x + w.x / 2, y: origine.y + w.y / 2 };
  const d = Math.abs(perp.y) < 0.5 ? 0.9 : 0.75;
  const candidats = [1, -1].map((s) => ({ x: milieu.x + s * perp.x * d, y: milieu.y + s * perp.y * d }));
  const score = (c: Point) => Math.min(Infinity, ...autres.map((sg) => distanceSegment(c, sg.origine, sg.w)));
  return score(candidats[1]!) > score(candidats[0]!) + 0.3 ? candidats[1]! : candidats[0]!;
}
