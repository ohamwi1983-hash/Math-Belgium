import type { ExerciceTraduireLieu, Pt, VarianteTraduireLieu } from "../../core/traduireLieu.types";
import { choisir, entier, melanger, nonNul, pgcd } from "../../ui/outilsAnalytiqueLotG";

/**
 * Générateur de gen131 « Traduire un lieu géométrique en équation ». Tout le hasard passe par
 * `Math.random` (`genererAvecCode` : le QR code rouvre le MÊME exercice, mêmes options mélangées).
 *
 * - médiatrice : A et B à coordonnées entières dans [−5 ; 5], [AB] jamais parallèle à un axe ;
 * - distance-droite : droite oblique de vecteur normal 3-4-5 (deux fois sur trois) — r = 10 ou 15 (multiple de la
 *   norme 5, sans être 5 : il faut vraiment ramener n à la norme r), pour que les points B = A ± (r/5)·n
 *   restent entiers —, sinon horizontale ou verticale (raccourci
 *   du § 6 : cas particulier) ;
 * - deux-paralleles : vecteur normal (a ; b) primitif, d₂ écrite multipliée par k ∈ {2, −1, 3} une fois
 *   sur deux (le piège « c moyen sans ramener les coefficients ») ; une fois sur quatre, des droites
 *   horizontales ou verticales (cas particulier) ;
 * - parabole : p ∈ {±2, ±4, ±6} (sommet entier), axe vertical ou horizontal à pile ou face ;
 * - cercle : centre à coordonnées entières non nulles, rayon de 2 à 6.
 */

export const CATALOGUE_VARIANTES: { id: VarianteTraduireLieu; label: string }[] = [
  { id: "mediatrice", label: "Équidistant de deux points : la médiatrice" },
  { id: "distance-droite", label: "À une distance donnée d'une droite : deux parallèles" },
  { id: "deux-paralleles", label: "Équidistant de deux droites parallèles : la parallèle médiane" },
  { id: "parabole", label: "Équidistant d'un point et d'une droite : la parabole" },
  { id: "cercle", label: "À une distance donnée d'un point : le cercle" },
];

const ordre4 = () => melanger([0, 1, 2, 3]);

function mediatrice(): ExerciceTraduireLieu {
  for (;;) {
    const A: Pt = { x: entier(-5, 5), y: entier(-5, 5) };
    const B: Pt = { x: entier(-5, 5), y: entier(-5, 5) };
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    if (dx === 0 || dy === 0 || Math.abs(dx) > 6 || Math.abs(dy) > 6) continue;
    return { variante: "mediatrice", A, B, ordreTraduction: ordre4(), ordreNature: ordre4() };
  }
}

const NORMAUX: Pt[] = [
  { x: 3, y: 4 },
  { x: 4, y: 3 },
  { x: 3, y: -4 },
  { x: 4, y: -3 },
];

function distanceDroite(type?: "horizontale" | "verticale" | "oblique"): ExerciceTraduireLieu {
  const t = type ?? (Math.random() < 2 / 3 ? "oblique" : Math.random() < 0.5 ? "horizontale" : "verticale");
  if (t === "oblique") {
    const n = choisir(NORMAUX);
    const r = choisir([10, 15]);
    const A: Pt = { x: entier(-3, 3), y: entier(-3, 3) };
    return { variante: "distance-droite", type: t, d: { a: n.x, b: n.y, c: -(n.x * A.x + n.y * A.y) }, r, A, n, ordreNature: ordre4() };
  }
  const k = nonNul(-4, 4);
  // r ≠ |k| : aucune droite du lieu n'est confondue avec un axe.
  const r = choisir([2, 3, 4, 5].filter((x) => x !== Math.abs(k)));
  if (t === "horizontale") return { variante: "distance-droite", type: t, d: { a: 0, b: 1, c: -k }, r, A: { x: 0, y: k }, n: { x: 0, y: 1 }, ordreNature: ordre4() };
  return { variante: "distance-droite", type: t, d: { a: 1, b: 0, c: -k }, r, A: { x: k, y: 0 }, n: { x: 1, y: 0 }, ordreNature: ordre4() };
}

function deuxParalleles(axe?: boolean): ExerciceTraduireLieu {
  const parallelesAxe = axe ?? Math.random() < 0.25;
  let a: number;
  let b: number;
  if (parallelesAxe) [a, b] = Math.random() < 0.5 ? [1, 0] : [0, 1];
  else {
    for (;;) {
      a = entier(1, 4);
      b = nonNul(-4, 4);
      if (pgcd(a, b) === 1) break;
    }
  }
  const multiplie = Math.random() < 0.5;
  const k = multiplie ? choisir([2, -1, 3]) : 1;
  for (;;) {
    const c1 = entier(-9, 9);
    const c2 = entier(-9, 9);
    if (Math.abs(c1 - c2) < 2) continue;
    // Écriture de d₂ : |k·c₂| reste lisible.
    if (Math.abs(k * c2) > 18) continue;
    return { variante: "deux-paralleles", a: a!, b: b!, c1, c2, k, ordreNature: ordre4() };
  }
}

function parabole(axe?: "vertical" | "horizontal"): ExerciceTraduireLieu {
  const sens = axe ?? (Math.random() < 0.5 ? "vertical" : "horizontal");
  const p = choisir([2, 4, 6]) * (Math.random() < 0.5 ? 1 : -1);
  const F: Pt = { x: entier(-3, 3), y: entier(-3, 3) };
  const k = sens === "vertical" ? F.y - p : F.x - p;
  return { variante: "parabole", F, axe: sens, k, ordreNature: ordre4() };
}

function cercle(): ExerciceTraduireLieu {
  return { variante: "cercle", C: { x: nonNul(-5, 5), y: nonNul(-5, 5) }, r: entier(2, 6), ordreNature: ordre4() };
}

export function genererTraduireLieu(variante: VarianteTraduireLieu): ExerciceTraduireLieu {
  switch (variante) {
    case "mediatrice":
      return mediatrice();
    case "distance-droite":
      return distanceDroite();
    case "deux-paralleles":
      return deuxParalleles();
    case "parabole":
      return parabole();
    case "cercle":
      return cercle();
  }
}

export function construireAvecVariante(id: string): ExerciceTraduireLieu {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id);
  return v ? genererTraduireLieu(v.id) : genererExerciceTraduireLieu();
}

export function genererExerciceTraduireLieu(): ExerciceTraduireLieu {
  return genererTraduireLieu(choisir(CATALOGUE_VARIANTES.map((c) => c.id)));
}
