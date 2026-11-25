import type { Conique, Nature } from "./coniquesLotH1";
import { choisir, entier } from "../ui6e/outilsLieuxLotH1";

/**
 * Couche A — modèle de `6gen132` « Lire une conique sur sa figure ou son équation réduite » (6e ch. 10,
 * § 1–2 et § 6, Connaître). Trois variantes ; la NATURE (ellipse, hyperbole, parabole) est le verdict
 * du premier écran, tirée au tiers AVANT les nombres, jamais dans la variante :
 * - `equation` : équation réduite (centre ou sommet à l'origine, axe focal Ox ou Oy) → nature, axe
 *   focal ou sens d'ouverture, sommets, foyers, puis excentricité (ellipse), asymptotes (hyperbole) ou
 *   directrice (parabole) — cinq écrans pour les trois natures ;
 * - `figure` : la courbe dans un repère quadrillé (asymptotes et rectangle (±a ; ±b) pour l'hyperbole,
 *   foyer et directrice pour la parabole) → nature, axe, sommets lus, équation réduite ;
 * - `optique` : une situation (antenne, phare, lithotriteur, galerie à écho, Cassegrain…) → quelle
 *   conique, puis quelle propriété optique (§ 6).
 */

export type Variante132 = "equation" | "figure" | "optique";
export type Phase132 = "nature" | "axe" | "sommets" | "foyers" | "excentricite" | "asymptotes" | "directrice" | "equation" | "naturePropriete" | "propriete";

export interface Exercice132 {
  variante: Variante132;
  C: Conique;
  /** Situation de la variante `optique` (indice dans la banque de sa nature). */
  situation?: number;
}

export const NATURES: Nature[] = ["ellipse", "hyperbole", "parabole"];

export function phases132(e: Exercice132): Phase132[] {
  if (e.variante === "optique") return ["naturePropriete", "propriete"];
  if (e.variante === "figure") return ["nature", "axe", "sommets", "equation"];
  const dernier: Phase132 = e.C.nature === "ellipse" ? "excentricite" : e.C.nature === "hyperbole" ? "asymptotes" : "directrice";
  return ["nature", "axe", "sommets", "foyers", dernier];
}

/** Situations de la variante `optique` (banque par nature, texte de l'énoncé). */
export const SITUATIONS: Record<Nature, string[]> = {
  parabole: [
    "Une antenne de télévision par satellite reçoit des ondes qui arrivent toutes parallèles entre elles ; son réflecteur doit les concentrer toutes sur le récepteur.",
    "Le réflecteur d'un phare doit renvoyer la lumière d'une ampoule, placée en un point bien choisi, en un faisceau de rayons parallèles.",
    "Un four solaire concentre la lumière du Soleil, dont les rayons arrivent parallèles, en un seul point où l'on pose la casserole.",
  ],
  ellipse: [
    "Un lithotriteur émet des ondes de choc depuis un point ; après réflexion sur la paroi, elles doivent toutes se concentrer sur le calcul rénal, placé en un autre point.",
    "Dans une « galerie à écho », une personne qui murmure en un point précis est entendue distinctement en un autre point précis de la salle, loin d'elle.",
  ],
  hyperbole: [
    "Dans un télescope de Cassegrain, un petit miroir convexe intercepte les rayons qui convergent vers un point et les renvoie vers un autre point, situé derrière le miroir principal percé.",
    "Une lampe éclaire un miroir convexe ; les rayons réfléchis semblent tous provenir d'un même point, situé derrière le miroir.",
  ],
};

function tirerConique(nature: Nature, variante: Variante132): Conique {
  const axe = Math.random() < 0.5 ? "x" : "y";
  const base = { nature, h: 0, k: 0, axe, a2: 0, b2: 0, p: 0, sens: 1 } as Conique;
  if (nature === "parabole") {
    const p = variante === "figure" ? choisir([2, 4, 6]) : entier(1, 8);
    return { ...base, p, sens: Math.random() < 0.5 ? 1 : -1 };
  }
  if (nature === "ellipse") {
    const a = entier(3, variante === "figure" ? 6 : 7);
    const b = entier(1, a - 1);
    return { ...base, a2: a * a, b2: b * b };
  }
  const a = entier(1, 5);
  const b = entier(1, 5);
  return { ...base, a2: a * a, b2: b * b };
}

export function tirer132(variante: Variante132): Exercice132 {
  const nature = choisir(NATURES);
  const C = tirerConique(nature, variante);
  if (variante === "optique") return { variante, C, situation: entier(0, SITUATIONS[nature].length - 1) };
  return { variante, C };
}
