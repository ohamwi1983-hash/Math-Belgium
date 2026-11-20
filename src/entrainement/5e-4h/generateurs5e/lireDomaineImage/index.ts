import type { Extremite, ExerciceLireDomaine, LieuA, Morceau, VarianteLireDomaine } from "../../core5e/lireDomaineImage";
import { domaine, image, valeur } from "../../core5e/lireDomaineImage";
import { contient } from "../../moteur5e/ensemblesReels";

/**
 * Couche A — générateur de `5gen59` « Lire domaine et image sur un graphique ». `Math.random()` seul
 * (le `?code=` rejoue le tirage). Sommets entiers, ordonnées de −5 à 5, deux sommets voisins jamais
 * à la même hauteur (sauf une demi-droite horizontale, 20 % des flèches) ; fenêtre aux bornes
 * entières qui contient les axes, une unité de marge (deux du côté d'une flèche).
 * - complet : une ligne brisée de 3 à 5 sommets, extrémités pleines ou creuses ;
 * - deuxMorceaux : deux lignes brisées séparées par un écart (60 %) ou par un saut à la même
 *   abscisse (40 %, un bout creux et un bout plein) ;
 * - prolongee : flèche d'un côté (60 %) ou des deux (40 %) ;
 * - pointExclu : un sommet intérieur remplacé par un point creux ; la valeur est déplacée (point
 *   plein isolé à la même abscisse, dans la plage des ordonnées) une fois sur deux.
 * Écran 3 : le VERDICT « f(a) existe » est tiré 50/50 AVANT a ; a est pris de préférence en un
 * endroit délicat (extrémité creuse ou pleine, trou, écart, saut, hors du graphe complet).
 */

function parmi<T>(t: readonly T[]): T {
  return t[Math.floor(Math.random() * t.length)]!;
}
const entier = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const extremite = (): Extremite => (Math.random() < 0.5 ? "plein" : "creux");

/** Ligne brisée de n sommets à partir de x0, pas de 1 à 3, ordonnées voisines distinctes. */
function ligne(n: number, x0: number, pasMax = 3): [number, number][] {
  const pts: [number, number][] = [];
  let x = x0;
  let y = entier(-4, 4);
  for (let i = 0; i < n; i++) {
    pts.push([x, y]);
    x += entier(1, pasMax);
    let y2 = y;
    while (y2 === y) y2 = entier(-5, 5);
    y = y2;
  }
  return pts;
}

function fenetre(morceaux: Morceau[], deplace: { y: number } | null) {
  const xs = morceaux.flatMap((m) => m.pts.map((p) => p[0]));
  const ys = morceaux.flatMap((m) => m.pts.map((p) => p[1])).concat(deplace ? [deplace.y] : []);
  const gF = morceaux[0]!.g === "fleche";
  const dF = morceaux[morceaux.length - 1]!.d === "fleche";
  return {
    xMin: Math.min(-1, Math.min(...xs) - (gF ? 2 : 1)),
    xMax: Math.max(1, Math.max(...xs) + (dF ? 2 : 1)),
    yMin: Math.min(-1, Math.min(...ys) - 1),
    yMax: Math.max(1, Math.max(...ys) + 1),
  };
}

function morceauxVariante(v: VarianteLireDomaine): { morceaux: Morceau[]; trouIndex: number | null; deplacer: boolean } {
  if (v === "complet") return { morceaux: [{ pts: ligne(entier(3, 5), entier(-6, -2)), g: extremite(), d: extremite() }], trouIndex: null, deplacer: false };
  if (v === "deuxMorceaux") {
    const a = ligne(entier(2, 3), entier(-7, -4), 2);
    const fin = a[a.length - 1]![0];
    const saut = Math.random() < 0.4;
    const b = ligne(entier(2, 3), saut ? fin : fin + entier(1, 3), 2);
    if (saut) while (b[0]![1] === a[a.length - 1]![1]) b[0]![1] = entier(-5, 5);
    const dA = saut ? extremite() : extremite();
    const gB: Extremite = saut ? (dA === "plein" ? "creux" : "plein") : extremite();
    return { morceaux: [{ pts: a, g: extremite(), d: dA }, { pts: b, g: gB, d: extremite() }], trouIndex: null, deplacer: false };
  }
  if (v === "prolongee") {
    const pts = ligne(entier(3, 4), entier(-4, -1), 2);
    const cote = Math.random() < 0.4 ? "deux" : Math.random() < 0.5 ? "g" : "d";
    const m: Morceau = { pts, g: cote === "d" ? extremite() : "fleche", d: cote === "g" ? extremite() : "fleche" };
    // Demi-droite horizontale (image bornée de ce côté) : 20 % des flèches.
    if (m.g === "fleche" && Math.random() < 0.2) pts[0]![1] = pts[1]![1];
    if (m.d === "fleche" && Math.random() < 0.2) pts[pts.length - 1]![1] = pts[pts.length - 2]![1];
    return { morceaux: [m], trouIndex: null, deplacer: false };
  }
  const pts = ligne(entier(4, 5), entier(-6, -3), 3);
  return { morceaux: [{ pts, g: extremite(), d: extremite() }], trouIndex: entier(1, pts.length - 2), deplacer: Math.random() < 0.5 };
}

/** Abscisses entières de la fenêtre classées par lieu (pour l'écran 3). */
function lieux(e: Omit<ExerciceLireDomaine, "a" | "existe" | "lieu">): { x: number; lieu: LieuA }[] {
  const ex = e as ExerciceLireDomaine;
  const dom = domaine(ex);
  const out: { x: number; lieu: LieuA }[] = [];
  // Extrémités : pleine, creuse, ou « saut » (un bout creux et un bout plein à la même abscisse).
  const bouts = new Map<number, LieuA>();
  const poser = (x: number, t: Extremite) => {
    if (t === "fleche") return;
    const lieu: LieuA = t === "plein" ? "plein" : "creux";
    bouts.set(x, bouts.has(x) && bouts.get(x) !== lieu ? "saut" : lieu);
  };
  for (const m of e.morceaux) {
    poser(m.pts[0]![0], m.g);
    poser(m.pts[m.pts.length - 1]![0], m.d);
  }
  const sommets = new Set(e.morceaux.flatMap((m) => m.pts.slice(1, -1).map((p) => p[0])));
  for (let x = e.fenetre.xMin + 1; x <= e.fenetre.xMax - 1; x++) {
    const dans = contient(dom, x);
    let lieu: LieuA;
    if (e.deplace && e.deplace.x === x) lieu = "deplace";
    else if (e.trou && e.trou.x === x) lieu = "trou";
    else if (bouts.has(x)) lieu = bouts.get(x)!;
    else if (sommets.has(x)) lieu = "sommet";
    else if (dans) lieu = "interieur";
    else {
      const xs = e.morceaux.flatMap((m) => m.pts.map((p) => p[0]));
      lieu = x > Math.min(...xs) && x < Math.max(...xs) ? "ecart" : "dehors";
    }
    out.push({ x, lieu });
  }
  return out;
}

const DELICATS_OUI: LieuA[] = ["plein", "deplace", "saut"];
const DELICATS_NON: LieuA[] = ["creux", "trou", "ecart"];

export function construire(variante: VarianteLireDomaine, existeForce?: boolean): ExerciceLireDomaine {
  const existe = existeForce ?? Math.random() < 0.5;
  for (;;) {
    const { morceaux, trouIndex, deplacer } = morceauxVariante(variante);
    let trou: ExerciceLireDomaine["trou"] = null;
    let deplace: ExerciceLireDomaine["deplace"] = null;
    if (trouIndex !== null) {
      const p = morceaux[0]!.pts[trouIndex]!;
      trou = { x: p[0], y: p[1] };
      if (deplacer) {
        const ys = morceaux[0]!.pts.map((q) => q[1]);
        const lo = Math.min(...ys);
        const hi = Math.max(...ys);
        let y = p[1];
        while (y === p[1]) y = entier(lo, hi);
        deplace = { x: p[0], y };
      }
    }
    const f = fenetre(morceaux, deplace);
    if (f.xMax - f.xMin > 16 || f.yMax - f.yMin > 13) continue;
    const base = { variante, morceaux, trou, deplace, fenetre: f };
    const L = lieux(base).filter((l) => (l.lieu === "deplace" || l.lieu === "saut" || l.lieu === "plein" || l.lieu === "sommet" || l.lieu === "interieur") === existe && (!existe || Number.isInteger(valeur({ ...base, a: l.x, existe, lieu: l.lieu }, l.x))));
    if (L.length === 0) continue;
    const delicats = L.filter((l) => (existe ? DELICATS_OUI : DELICATS_NON).includes(l.lieu));
    const choix = delicats.length > 0 && Math.random() < (existe ? 0.6 : 0.8) ? parmi(delicats) : parmi(L);
    const e: ExerciceLireDomaine = { ...base, a: choix.x, existe, lieu: choix.lieu };
    // Contrôles : le verdict lu sur le graphe correspond ; l'image n'est jamais un seul point.
    if ((valeur(e, e.a) !== null) !== existe) continue;
    if (image(e).some((i) => i.g === i.d)) continue;
    return e;
  }
}

export const CATALOGUE_VARIANTES: { id: VarianteLireDomaine; label: string }[] = [
  { id: "complet", label: "Une courbe d'un seul tenant, graphique complet" },
  { id: "deuxMorceaux", label: "Deux morceaux (écart ou saut)" },
  { id: "prolongee", label: "Courbe prolongée par des flèches" },
  { id: "pointExclu", label: "Un point creux à l'intérieur de la courbe" },
];

export function construireAvecVarianteId(id: string): ExerciceLireDomaine {
  const v = CATALOGUE_VARIANTES.find((x) => x.id === id);
  return construire(v ? v.id : parmi(CATALOGUE_VARIANTES).id);
}

export function genererExerciceLireDomaine(): ExerciceLireDomaine {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
