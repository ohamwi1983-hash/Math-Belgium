import type { Branche } from "../ui5e/figureLimitesLotG";

/**
 * Couche core — `5gen66` « Du tableau de limites au graphique » (5e ch. 4, § 3, processus 1
 * CONNAÎTRE). Un tableau de limites (bornes du domaine ℝ \ {p} ou ℝ \ {p₁ ; p₂}, et ±∞) est donné ;
 * l'élève choisit LE graphique qui lui correspond parmi quatre (A–D), puis écrit les équations des
 * asymptotes. Les trois intrus sont des ERREURS CLASSIQUES appliquées à la situation juste : côté
 * d'approche d'une asymptote verticale inversé, limites à gauche / à droite échangées, asymptote
 * horizontale confondue avec une valeur atteinte (la courbe passe par y = L mais s'approche d'une
 * autre droite), asymptote oblique mal placée (pente ou ordonnée à l'origine), limites en −∞ et +∞
 * échangées, asymptote verticale déplacée. La place du bon graphique (A, B, C ou D) est tirée
 * uniformément : c'est le verdict de l'écran 1 (jamais un cas particulier, jamais dans `forme`).
 */

export type VarianteTableauLimites = "ahAv" | "deuxAh" | "aoAv" | "deuxAv";

export type Bout = { type: "h"; L: number } | { type: "o"; m: number; q: number };

/** Une situation de limites : asymptotes verticales (croissantes), signes des limites infinies de
 * chaque côté ([à gauche, à droite], ±1), comportement en −∞ et en +∞. */
export interface Situation {
  av: number[];
  cotes: [number, number][];
  gauche: Bout;
  droite: Bout;
}

export type TypeIntrus = "coteAV" | "echangeGD" | "ahValeur" | "aoPente" | "aoOrdonnee" | "echangeInfinis" | "avDeplacee";

export interface Intrus {
  type: TypeIntrus;
  sit: Situation;
  /** Indice de l'asymptote verticale touchée et côté (0 gauche, 1 droite), quand il y a lieu. */
  iav?: number;
  cote?: 0 | 1;
}

export interface ExerciceTableauLimites {
  variante: VarianteTableauLimites;
  sit: Situation;
  intrus: Intrus[];
  /** Pour chaque lettre A–D : -1 = le bon graphique, sinon l'indice de l'intrus. */
  ordre: number[];
}

export const LETTRES = ["A", "B", "C", "D"];
export const lettreCorrecte = (e: ExerciceTableauLimites): string => LETTRES[e.ordre.indexOf(-1)]!;
export const positionCorrecte = (e: ExerciceTableauLimites): number => e.ordre.indexOf(-1);

const AMP = 2;

/** Valeur du bout en x (ordonnée de l'asymptote). */
export const boutV = (b: Bout, x: number): number => (b.type === "h" ? b.L : b.m * x + b.q);

/** Branches de courbe représentant une situation (une par intervalle du domaine). */
export function branches(s: Situation): Branche[] {
  if (s.av.length === 1) {
    const p = s.av[0]!;
    const [sg, sd] = s.cotes[0]!;
    return [
      { f: (x) => boutV(s.gauche, x) + (sg * AMP) / (p - x), de: -Infinity, a: p },
      { f: (x) => boutV(s.droite, x) + (sd * AMP) / (x - p), de: p, a: Infinity },
    ];
  }
  const [p1, p2] = s.av as [number, number];
  const [g1, d1] = s.cotes[0]!;
  const [g2, d2] = s.cotes[1]!;
  const milieu = boutV(s.gauche, 0);
  return [
    { f: (x) => boutV(s.gauche, x) + (g1 * AMP) / (p1 - x), de: -Infinity, a: p1 },
    { f: (x) => milieu + (d1 * 1.5) / (x - p1) + (g2 * 1.5) / (p2 - x), de: p1, a: p2 },
    { f: (x) => boutV(s.droite, x) + (d2 * AMP) / (x - p2), de: p2, a: Infinity },
  ];
}

/** Fonction représentante (définie par morceaux). */
export function fonction(s: Situation): (x: number) => number {
  const bs = branches(s);
  return (x) => {
    const b = bs.find((b) => x > b.de && x < b.a);
    return b ? b.f(x) : NaN;
  };
}

export const memeSituation = (a: Situation, b: Situation): boolean => JSON.stringify(a) === JSON.stringify(b);
