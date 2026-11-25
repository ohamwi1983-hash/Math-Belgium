import type { Conique, Nature } from "./coniquesLotH1";
import { centre, foyers, sommets, valP } from "./coniquesLotH1";
import type { P } from "../ui6e/outilsLieuxLotH1";
import { choisir, entier } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen133` « Représenter une conique » (6e ch. 10, § 1–2, Connaître). Équation
 * réduite (centre ou sommet translaté) → l'élève PLACE des points sur un repère quadrillé, quatre écrans
 * pour chaque nature (la nature se lit sur l'équation : ce n'est pas un verdict) :
 * - ellipse : centre, sommets du grand axe, sommets du petit axe, foyers ;
 * - hyperbole : centre, sommets, foyers, sommets du rectangle (±a ; ±b) dont les diagonales sont les
 *   asymptotes ;
 * - parabole : sommet, foyer, point où la directrice coupe l'axe focal, puis les deux points de la
 *   parabole situés sur la perpendiculaire à l'axe passant par le foyer (à la distance p du foyer).
 * Tous les points tombent sur des nœuds du quadrillage : triplets pythagoriciens (c entier) pour les
 * coniques centrées, p pair pour la parabole.
 */

export type Variante133 = Nature;
export type Phase133 = "centre" | "sommetsFocaux" | "sommetsNonFocaux" | "foyers" | "rectangle" | "sommet" | "foyer" | "piedDirectrice" | "cordeFocale";

export interface Exercice133 {
  variante: Variante133;
  C: Conique;
  /** Fenêtre entière du repère (identique à l'écran et au corrigé). */
  fenetre: { xMin: number; xMax: number; yMin: number; yMax: number };
}

export function phases133(e: Exercice133): Phase133[] {
  if (e.C.nature === "ellipse") return ["centre", "sommetsFocaux", "sommetsNonFocaux", "foyers"];
  if (e.C.nature === "hyperbole") return ["centre", "sommetsFocaux", "foyers", "rectangle"];
  return ["sommet", "foyer", "piedDirectrice", "cordeFocale"];
}

/** Points attendus à l'écran (ordre indifférent). */
export function pointsAttendus133(e: Exercice133, p: Phase133): P[] {
  const C = e.C;
  const a = Math.sqrt(C.a2);
  const b = Math.sqrt(C.b2);
  const pt = (s: number, t: number): P => (C.axe === "x" ? { x: C.h + s, y: C.k + t } : { x: C.h + t, y: C.k + s });
  switch (p) {
    case "centre":
    case "sommet":
      return [valP(centre(C))];
    case "sommetsFocaux":
      return sommets(C).slice(0, 2).map(valP);
    case "sommetsNonFocaux":
      return sommets(C).slice(2).map(valP);
    case "foyers":
    case "foyer":
      return foyers(C).map(valP);
    case "rectangle":
      return [pt(a, b), pt(a, -b), pt(-a, b), pt(-a, -b)];
    case "piedDirectrice":
      return [pt((-C.sens * C.p) / 2, 0)];
    case "cordeFocale":
      return [pt((C.sens * C.p) / 2, C.p), pt((C.sens * C.p) / 2, -C.p)];
  }
}

const TRIPLETS_ELLIPSE: [number, number][] = [
  [5, 4],
  [5, 3],
];
const TRIPLETS_HYPERBOLE: [number, number][] = [
  [3, 4],
  [4, 3],
];

function tirerConique(nature: Nature): Conique {
  const axe = Math.random() < 0.5 ? "x" : "y";
  if (nature === "parabole") {
    const p = choisir([2, 4, 6]);
    return { nature, h: entier(-3, 3), k: entier(-3, 3), axe, a2: 0, b2: 0, p, sens: Math.random() < 0.5 ? 1 : -1 };
  }
  const [a, b] = choisir(nature === "ellipse" ? TRIPLETS_ELLIPSE : TRIPLETS_HYPERBOLE);
  return { nature, h: entier(-3, 3), k: entier(-3, 3), axe, a2: a * a, b2: b * b, p: 0, sens: 1 };
}

/** Fenêtre carrée-ish couvrant tous les points de tous les écrans, origine comprise. */
function fenetre133(e: Omit<Exercice133, "fenetre">): Exercice133["fenetre"] {
  const tous = phases133(e as Exercice133).flatMap((p) => pointsAttendus133(e as Exercice133, p));
  const xs = [...tous.map((q) => q.x), 0];
  const ys = [...tous.map((q) => q.y), 0];
  return { xMin: Math.min(...xs) - 1, xMax: Math.max(...xs) + 1, yMin: Math.min(...ys) - 1, yMax: Math.max(...ys) + 1 };
}

export function tirer133(variante: Variante133): Exercice133 {
  for (;;) {
    const C = tirerConique(variante);
    const base = { variante, C };
    const f = fenetre133(base as Exercice133);
    // Repère lisible au doigt : au plus 16 unités par axe.
    if (f.xMax - f.xMin > 16 || f.yMax - f.yMin > 16) continue;
    // Centre (ou sommet) jamais à l'origine : le placer serait sans objet.
    if (C.h === 0 && C.k === 0) continue;
    return { ...base, fenetre: f };
  }
}
