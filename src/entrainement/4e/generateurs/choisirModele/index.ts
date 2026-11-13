import type { ContexteModele, ExerciceChoisirModele, OptionSens, ParametreModele, PointMarqueModele, QuestionUtilisation } from "./types";
import { evaluerModele, INFOS_CONTEXTE } from "./modele";
import { PARAMETRES_CONTEXTE, t, textesOptions5 } from "./textes";

/**
 * Tirage de gen69 — 7 situations, une par variante (`CATALOGUE_VARIANTES`, données seulement pour
 * `SelecteurVarianteDev`), toutes écrites y = a·g(variable − TH) + TV avec des valeurs lisibles
 * sur la figure (points clés à coordonnées entières ou décimales simples).
 *
 * Les valeurs qui rendraient un leurre de l'écran 5 vrai par coïncidence sont exclues : pont
 * k ≠ c (hauteur minimale ≠ distance du point le plus bas), jet a ≠ p₀, toboggan k ≠ c.
 */

export const CATALOGUE_VARIANTES: { id: ContexteModele; label: string }[] = [
  { id: "pont", label: "Carré — câble de pont suspendu" },
  { id: "jet", label: "Racine carrée — lance à incendie" },
  { id: "glacon", label: "Racine cubique — boîte à glaçon" },
  { id: "gaz", label: "Inverse — gaz comprimé" },
  { id: "velo", label: "Inverse — sortie à vélo avec pauses" },
  { id: "chauffage", label: "Valeur absolue — dépense d'énergie" },
  { id: "toboggan", label: "Cube — toboggan avec replat" },
];

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)];
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

/** Pas de graduation « rond » (au plus 10 graduations) et maximum arrondi à un multiple du pas. */
function graduer(max: number): { max: number; pas: number } {
  const pas = (max < 4 ? [0.5, 1] : [1, 2, 5, 10, 20]).find((p) => max / p <= 10) ?? 20;
  return { max: Math.ceil(max / pas - 1e-9) * pas, pas };
}

interface Base {
  th: number;
  tv: number;
  a: number;
  xMax: number;
  yMax: number;
  domaine: [number, number];
  points: PointMarqueModele[];
  indexLecture: number;
  asymptoteH: number | null;
  question4: QuestionUtilisation;
}

function pont(): Base {
  const [a, c] = choisir([
    [0.25, 4],
    [0.25, 6],
    [0.25, 8],
    [0.5, 4],
    [0.5, 6],
  ] as const);
  const k = choisir([2, 3, 4, 5].filter((v) => v !== c));
  const h0 = k + a * c * c;
  const d = choisir([1, 3, 4, 5, 6, 7].filter((v) => v < c));
  const y = k + a * d * d;
  return {
    th: c,
    tv: k,
    a,
    xMax: 2 * c,
    yMax: h0 + 1,
    domaine: [0, 2 * c],
    points: [
      { x: 0, y: h0, position: "droite" },
      { x: c, y: k, position: "bas" },
      { x: c + 2, y: k + 4 * a, position: "bas-droite" },
      { x: 2 * c, y: h0, position: "gauche" },
    ],
    indexLecture: 2,
    asymptoteH: null,
    question4: Math.random() < 0.5 ? { type: "predire", x: c + choisir([-1, 1]) * d, y } : { type: "resoudre", y, solutions: [c - d, c + d] },
  };
}

function jet(): Base {
  const p0 = choisir([1, 2, 3]);
  const a = choisir([2, 3, 4].filter((v) => v !== p0));
  const mm = choisir([4, 5]);
  return {
    th: p0,
    tv: 0,
    a,
    xMax: p0 + 10,
    yMax: 3 * a + 1,
    domaine: [p0, p0 + 30],
    points: [
      { x: p0, y: 0, position: "haut-droite" },
      { x: p0 + 1, y: a, position: "haut-gauche" },
      { x: p0 + 4, y: 2 * a, position: "haut-gauche" },
      { x: p0 + 9, y: 3 * a, position: "bas-droite" },
    ],
    indexLecture: 1,
    asymptoteH: null,
    question4: Math.random() < 0.5 ? { type: "predire", x: p0 + mm * mm, y: a * mm } : { type: "resoudre", y: a * mm, solutions: [p0 + mm * mm] },
  };
}

function glacon(): Base {
  const b = choisir([1, 2, 3]);
  const nn = choisir([4, 5, 6]);
  return {
    th: 0,
    tv: b,
    a: 1,
    xMax: 30,
    yMax: 3 + b + 1,
    domaine: [0, 130],
    points: [
      { x: 0, y: b, position: "bas-droite" },
      { x: 8, y: 2 + b, position: "bas-droite" },
      { x: 27, y: 3 + b, position: "bas-gauche" },
    ],
    indexLecture: 1,
    asymptoteH: null,
    question4: Math.random() < 0.5 ? { type: "predire", x: nn ** 3, y: nn + b } : { type: "resoudre", y: nn + b, solutions: [nn ** 3] },
  };
}

function gaz(): Base {
  const k = choisir([6, 12, 18, 24]);
  // Réponse à deux décimales au plus (6/16 ou 18/16 exclus).
  const v = choisir([8, 12, 16, 24].filter((w) => Number.isInteger((100 * k) / w)));
  return {
    th: 0,
    tv: 0,
    a: k,
    xMax: 10,
    yMax: k / 1.5,
    domaine: [1, 30],
    points: [
      { x: 2, y: k / 2, position: "haut-droite" },
      { x: 4, y: k / 4, position: "haut-droite" },
      { x: 6, y: k / 6, position: "haut-droite" },
    ],
    indexLecture: 0,
    asymptoteH: null,
    question4: Math.random() < 0.5 ? { type: "predire", x: v, y: k / v } : { type: "resoudre", y: k / v, solutions: [v] },
  };
}

function velo(): Base {
  const distance = choisir([60, 90, 120]);
  const pauses = choisir([1, 2]);
  const v = choisir([12, 15, 24, 40]);
  return {
    th: 0,
    tv: pauses,
    a: distance,
    xMax: 70,
    yMax: pauses + distance / 15,
    domaine: [5, 100],
    points: [
      { x: 20, y: pauses + distance / 20, position: "haut-droite" },
      { x: 30, y: pauses + distance / 30, position: "haut-droite" },
      { x: 60, y: pauses + distance / 60, position: "haut" },
    ],
    indexLecture: 0,
    asymptoteH: pauses,
    question4: Math.random() < 0.5 ? { type: "predire", x: v, y: pauses + distance / v } : { type: "resoudre", y: pauses + distance / v, solutions: [v] },
  };
}

function chauffage(): Base {
  const c = choisir([18, 20]);
  const a = choisir([2, 3]);
  const b = choisir([4, 6, 10]);
  const d = choisir([4, 6, 8, 10]);
  const y = b + a * d;
  return {
    th: c,
    tv: b,
    a,
    xMax: 2 * c,
    yMax: b + a * c,
    domaine: [0, 2 * c],
    points: [
      { x: c, y: b, position: "bas" },
      { x: c - 5, y: b + 5 * a, position: "bas-gauche" },
      { x: c + 5, y: b + 5 * a, position: "bas-droite" },
    ],
    indexLecture: 2,
    asymptoteH: null,
    question4: Math.random() < 0.5 ? { type: "predire", x: c + choisir([-1, 1]) * d, y } : { type: "resoudre", y, solutions: [c - d, c + d] },
  };
}

function toboggan(): Base {
  const a = choisir([0.25, 0.5]);
  const c = choisir([3, 4]);
  const k = choisir([4, 5, 6].filter((v) => v !== c && v >= 8 * a));
  const s = choisir([-1, 1]);
  return {
    th: c,
    tv: k,
    a: -a,
    xMax: c + 3,
    yMax: k + 8 * a + 1,
    domaine: [c - 2, c + 2],
    points: [
      { x: c - 2, y: k + 8 * a, position: "gauche" },
      { x: c, y: k, position: "haut-droite" },
      { x: c + 2, y: k - 8 * a, position: "droite" },
    ],
    indexLecture: 2,
    asymptoteH: null,
    question4: { type: "predire", x: c + s, y: k - s * a },
  };
}

const TIRAGES: Record<ContexteModele, () => Base> = { pont, jet, glacon, gaz, velo, chauffage, toboggan };

function optionsSens(e: ExerciceChoisirModele): OptionSens[] {
  const textes = textesOptions5(e);
  return melanger(textes.map((texte, i) => ({ id: `o${i}`, correcte: i === 0, fragments: [t(texte)] })));
}

export function construireAvecVariante(id: string): ExerciceChoisirModele {
  const contexte = id as ContexteModele;
  const tirage = TIRAGES[contexte];
  if (!tirage) throw new Error(`Variante inconnue : ${id}`);
  const base = tirage();
  const gx = graduer(base.xMax);
  const gy = graduer(base.yMax);
  const parametre5: ParametreModele = choisir(PARAMETRES_CONTEXTE[contexte]);
  const exercice: ExerciceChoisirModele = {
    contexte,
    famille: INFOS_CONTEXTE[contexte].famille,
    th: base.th,
    tv: base.tv,
    a: base.a,
    fenetre: { xMax: gx.max, yMax: gy.max, pasX: gx.pas, pasY: gy.pas },
    domaine: base.domaine,
    points: base.points,
    indexLecture: base.indexLecture,
    asymptoteH: base.asymptoteH,
    question4: base.question4,
    parametre5,
    options5: [],
  };
  exercice.options5 = optionsSens(exercice);
  // Garde-fou : les points marqués et la réponse de l'écran 4 sont bien sur le modèle.
  for (const p of exercice.points) {
    if (Math.abs(evaluerModele(exercice, p.x) - p.y) > 1e-9) throw new Error("Point marqué hors du modèle");
  }
  const q = exercice.question4;
  const ok = q.type === "predire" ? Math.abs(evaluerModele(exercice, q.x) - q.y) < 1e-9 : q.solutions.every((x) => Math.abs(evaluerModele(exercice, x) - q.y) < 1e-9);
  if (!ok) throw new Error("Réponse de l'écran 4 hors du modèle");
  return exercice;
}

export function genererExerciceChoisirModele(): ExerciceChoisirModele {
  return construireAvecVariante(choisir(CATALOGUE_VARIANTES).id);
}
