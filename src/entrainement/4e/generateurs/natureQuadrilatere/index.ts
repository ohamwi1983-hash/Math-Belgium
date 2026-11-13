import type {
  AffirmationQuadrilatere,
  ExerciceNatureQuadrilatere,
  NatureQuadrilatere,
  VarianteNatureQuadrilatere,
} from "../../core/natureQuadrilatere.types";
import type { Composantes, Point } from "../../core/vecteur.types";
import { cotes, critere, determinant, estConvexe, natureDe, normeCarree } from "../../moteur/modeleNatureQuadrilatere";

/**
 * Générateur de « Nature d'un quadrilatère » (gen84). Tout le hasard passe par `Math.random` :
 * `genererAvecCode` (`export/codeExercice.ts`) le remplace par une graine, et le QR code d'une
 * feuille rouvre ainsi le MÊME exercice.
 *
 * La NATURE est un verdict : tirée uniformément parmi les issues possibles de la variante
 * (« nature » : 5 issues ; « quatrième sommet » : parallélogramme / losange / rectangle / carré ;
 * « montrer » : l'affirmation ou le carré), puis la figure est construite pour l'avoir. Garanties
 * (vérifiées par tirages massifs) :
 * - coordonnées entières dans [−6 ; 6] (le repère tient dans 14 carreaux, origine comprise) ;
 * - ABCD convexe (jamais croisé ni aplati), aire du parallélogramme AB, BC ≥ 3 carreaux ;
 * - AUCUN côté horizontal ni vertical (aucune composante nulle) : un carré ou un rectangle n'est
 *   jamais posé « droit » sur le quadrillage, la figure ne crie pas la réponse ;
 * - un quadrilatère quelconque est presque toujours un PIÈGE : angle droit en B, côtés AB et BC
 *   égaux (ou les deux), trapèze (AB et DC parallèles mais de longueurs différentes), ou
 *   « presque parallélogramme » (D décalé d'un ou deux carreaux) — les écrans 2 et 3 donnent alors
 *   des résultats qui, sans le test du parallélogramme, feraient conclure à tort.
 */

function entier(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choisir<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

const BORNE = 6;
const COMPOSANTE_MAX = 6;

function nonNul(max: number): number {
  const v = entier(1, max);
  return Math.random() < 0.5 ? v : -v;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

function composantesValides(v: Composantes): boolean {
  return v.x !== 0 && v.y !== 0 && Math.abs(v.x) <= COMPOSANTE_MAX && Math.abs(v.y) <= COMPOSANTE_MAX;
}

/** Côtés AB = u et BC = v d'un parallélogramme de la nature voulue (`null` si le tirage échoue). */
function cotesParallelogramme(nature: Exclude<NatureQuadrilatere, "quelconque">): { u: Composantes; v: Composantes } | null {
  const u = { x: nonNul(5), y: nonNul(5) };
  const signe = Math.random() < 0.5 ? 1 : -1;
  let v: Composantes;
  switch (nature) {
    case "carre":
      v = { x: -signe * u.y, y: signe * u.x };
      break;
    case "rectangle": {
      const g = pgcd(u.x, u.y);
      const m = entier(1, 4);
      if (m === g) return null;
      v = { x: (-signe * m * u.y) / g, y: (signe * m * u.x) / g };
      break;
    }
    case "losange": {
      const n2 = normeCarree(u);
      const candidats: Composantes[] = [];
      for (let x = -COMPOSANTE_MAX; x <= COMPOSANTE_MAX; x++) {
        for (let y = -COMPOSANTE_MAX; y <= COMPOSANTE_MAX; y++) {
          const w = { x, y };
          if (x === 0 || y === 0 || normeCarree(w) !== n2 || critere(u, w) === 0 || determinant(u, w) === 0) continue;
          candidats.push(w);
        }
      }
      if (candidats.length === 0) return null;
      v = choisir(candidats);
      break;
    }
    case "parallelogramme":
      v = { x: nonNul(5), y: nonNul(5) };
      if (normeCarree(v) === normeCarree(u) || critere(u, v) === 0) return null;
      break;
  }
  if (!composantesValides(v) || Math.abs(determinant(u, v)) < 3) return null;
  return { u, v };
}

type PiegeQuelconque = "angleDroit" | "cotesEgaux" | "carre" | "trapeze" | "presque";
const PIEGES: PiegeQuelconque[] = ["angleDroit", "cotesEgaux", "carre", "trapeze", "presque"];

/** A, B, C et le vecteur DC d'un quadrilatère quelconque (pas un parallélogramme). */
function cotesQuelconque(piege: PiegeQuelconque): { u: Composantes; v: Composantes; dc: Composantes } | null {
  const base =
    piege === "angleDroit"
      ? cotesParallelogramme("rectangle")
      : piege === "cotesEgaux"
        ? cotesParallelogramme("losange")
        : piege === "carre"
          ? cotesParallelogramme("carre")
          : cotesParallelogramme("parallelogramme");
  if (!base) return null;
  const { u, v } = base;
  let dc: Composantes;
  if (piege === "trapeze") {
    // DC parallèle à AB, de même sens, mais de longueur différente.
    const g = pgcd(u.x, u.y);
    const p = { x: u.x / g, y: u.y / g };
    const m = entier(1, 6);
    if (m === g) return null;
    dc = { x: m * p.x, y: m * p.y };
  } else {
    // D décalé d'un ou deux carreaux par rapport au sommet qui ferait un parallélogramme.
    const delta = { x: entier(-2, 2), y: entier(-2, 2) };
    if (delta.x === 0 && delta.y === 0) return null;
    dc = { x: u.x + delta.x, y: u.y + delta.y };
  }
  return { u, v, dc };
}

function dansLeCadre(p: Point): boolean {
  return Math.abs(p.x) <= BORNE && Math.abs(p.y) <= BORNE;
}

function placer(u: Composantes, v: Composantes, dc: Composantes): { A: Point; B: Point; C: Point; D: Point } | null {
  for (let essai = 0; essai < 40; essai++) {
    const A = { x: entier(-BORNE, BORNE), y: entier(-BORNE, BORNE) };
    const B = { x: A.x + u.x, y: A.y + u.y };
    const C = { x: B.x + v.x, y: B.y + v.y };
    const D = { x: C.x - dc.x, y: C.y - dc.y };
    if ([A, B, C, D].every(dansLeCadre)) return { A, B, C, D };
  }
  return null;
}

export function genererNatureQuadrilatere(
  variante: VarianteNatureQuadrilatere,
  nature: NatureQuadrilatere,
  affirmation: AffirmationQuadrilatere | null = null,
): ExerciceNatureQuadrilatere {
  // Le piège d'un quadrilatère quelconque est tiré UNE fois, avant les essais : sinon les pièges
  // dont la construction échoue plus souvent seraient sous-représentés.
  const piege = choisir(PIEGES);
  for (;;) {
    let cotesTires: { u: Composantes; v: Composantes; dc: Composantes } | null;
    if (nature === "quelconque") cotesTires = cotesQuelconque(piege);
    else {
      const p = cotesParallelogramme(nature);
      cotesTires = p ? { ...p, dc: p.u } : null;
    }
    if (!cotesTires) continue;
    const points = placer(cotesTires.u, cotesTires.v, cotesTires.dc);
    if (!points) continue;
    const e: ExerciceNatureQuadrilatere = { variante, ...points, affirmation };
    if (!estConvexe(e) || natureDe(e) !== nature) continue;
    if (!cotes(e).every((c) => c.x !== 0 && c.y !== 0)) continue;
    return e;
  }
}

// ---------------------------------------------------------------------------------------------
// Catalogue de variantes (SelecteurVarianteDev, `?code=`, adaptateur de feuilles). Jamais une
// variante par nature : la nature est le verdict, toujours tirée au hasard.
// ---------------------------------------------------------------------------------------------

export const CATALOGUE_VARIANTES: { id: string; label: string }[] = [
  { id: "nature", label: "Quelle est la nature de ABCD ?" },
  { id: "quatrieme", label: "Trouver D pour que ABCD soit un parallélogramme, puis sa nature" },
  { id: "montrer-rectangle", label: "Montrer que ABCD est un rectangle (est-ce un carré ?)" },
  { id: "montrer-losange", label: "Montrer que ABCD est un losange (est-ce un carré ?)" },
];

const NATURES: NatureQuadrilatere[] = ["quelconque", "parallelogramme", "losange", "rectangle", "carre"];
const NATURES_PARALLELOGRAMME: NatureQuadrilatere[] = ["parallelogramme", "losange", "rectangle", "carre"];

export function construireAvecVariante(id: string): ExerciceNatureQuadrilatere {
  switch (id) {
    case "nature":
      return genererNatureQuadrilatere("nature", choisir(NATURES));
    case "quatrieme":
      return genererNatureQuadrilatere("quatrieme", choisir(NATURES_PARALLELOGRAMME));
    case "montrer-rectangle":
      return genererNatureQuadrilatere("montrer", choisir(["rectangle", "carre"] as const), "rectangle");
    case "montrer-losange":
      return genererNatureQuadrilatere("montrer", choisir(["losange", "carre"] as const), "losange");
    default:
      return genererExerciceNatureQuadrilatere();
  }
}

/** Tirage libre : « nature » une fois sur deux, sinon une des trois autres variantes. */
export function genererExerciceNatureQuadrilatere(): ExerciceNatureQuadrilatere {
  const r = Math.random();
  if (r < 0.5) return construireAvecVariante("nature");
  if (r < 0.75) return construireAvecVariante("quatrieme");
  return construireAvecVariante(Math.random() < 0.5 ? "montrer-rectangle" : "montrer-losange");
}
