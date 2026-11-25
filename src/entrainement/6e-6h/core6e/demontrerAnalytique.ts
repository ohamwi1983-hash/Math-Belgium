/**
 * Couche A — modèle de `6gen123` « Démontrer par la géométrie analytique » (6e ch. 9, § 3, Transférer).
 * Cinq propriétés classiques (support = variante) : diagonales d'un parallélogramme, médianes d'un
 * triangle, théorème de Varignon, médiane relative à l'hypoténuse, diagonales d'un losange. Quatre
 * écrans, comme la méthode du cours : choisir un repère qui ne perd pas la généralité (choix fermé : le
 * bon, un repère trop particulier, un exemple numérique — ordre propre à l'instance), coordonnées des
 * points construits EN LETTRES, égalité à établir (choix fermé), calcul de cette égalité (expressions en
 * lettres, vérifiées en plusieurs jeux de valeurs). Noms des sommets tirés (ABCD, EFGH, PQRS, RSTU — jamais M, réservé au milieu).
 */

export type Support123 = "parallelogramme" | "medianes" | "varignon" | "rectangleMediane" | "losange";
export type Phase123 = "repere" | "coordonnees" | "egalite" | "calcul";
export const PHASES_123: Phase123[] = ["repere", "coordonnees", "egalite", "calcul"];

export type V = Record<string, number>;
export type F = (v: V) => number;

/** Un champ du calcul ou des coordonnées : un point (deux coordonnées) ou une expression. */
export type Champ123 =
  | { type: "point"; nom: string; label: string; x: F; y: F; xL: string; yL: string }
  | { type: "expr"; nom: string; label: string; f: F; fL: string };

export interface Exercice123 {
  support: Support123;
  noms: [string, string, string, string];
  /** Ordre d'affichage des trois repères (0 = le bon). */
  ordreRepere: number[];
  /** Ordre d'affichage des quatre égalités (0 = la bonne). */
  ordreEgalite: number[];
  /** Exemple numérique proposé (piège « prouver sur un exemple »). */
  exemple: number;
}

export const LETTRES_123: Record<Support123, string[]> = {
  parallelogramme: ["a", "b", "c"],
  medianes: ["a", "b", "c"],
  varignon: ["a", "b", "c", "d", "e"],
  rectangleMediane: ["a", "b"],
  losange: ["a", "b", "c"],
};

const NOMS: [string, string, string, string][] = [
  ["A", "B", "C", "D"],
  ["E", "F", "G", "H"],
  ["P", "Q", "R", "S"],
  ["R", "S", "T", "U"],
];

const melanger = <T,>(t: T[]): T[] => {
  const c = [...t];
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [c[i], c[j]] = [c[j]!, c[i]!];
  }
  return c;
};

export function tirer123(support: Support123): Exercice123 {
  return {
    support,
    noms: NOMS[Math.floor(Math.random() * NOMS.length)]!,
    ordreRepere: melanger([0, 1, 2]),
    ordreEgalite: melanger([0, 1, 2, 3]),
    exemple: Math.floor(Math.random() * 3),
  };
}

/** Champs de l'écran « coordonnées » (points construits). */
export function champsCoordonnees(e: Exercice123): Champ123[] {
  const [A, B, C, D] = e.noms;
  switch (e.support) {
    case "parallelogramme":
      return [{ type: "point", nom: C, label: `Coordonnées de ${C}`, x: (v) => 2 * v.a! + 2 * v.b!, y: (v) => 2 * v.c!, xL: "2a+2b", yL: "2c" }];
    case "medianes":
      return [
        { type: "point", nom: `${A}'`, label: `Milieu ${A}' de [${B}${C}]`, x: (v) => v.a! + v.b!, y: (v) => v.c!, xL: "a+b", yL: "c" },
        { type: "point", nom: `${B}'`, label: `Milieu ${B}' de [${A}${C}]`, x: (v) => v.b!, y: (v) => v.c!, xL: "b", yL: "c" },
      ];
    case "varignon":
      return [
        { type: "point", nom: "I", label: `Milieu I de [${A}${B}]`, x: (v) => v.a!, y: () => 0, xL: "a", yL: "0" },
        { type: "point", nom: "J", label: `Milieu J de [${B}${C}]`, x: (v) => v.a! + v.b!, y: (v) => v.c!, xL: "a+b", yL: "c" },
        { type: "point", nom: "K", label: `Milieu K de [${C}${D}]`, x: (v) => v.b! + v.d!, y: (v) => v.c! + v.e!, xL: "b+d", yL: "c+e" },
        { type: "point", nom: "L", label: `Milieu L de [${D}${A}]`, x: (v) => v.d!, y: (v) => v.e!, xL: "d", yL: "e" },
      ];
    case "rectangleMediane":
      return [{ type: "point", nom: "M", label: `Milieu M de [${B}${C}]`, x: (v) => v.a!, y: (v) => v.b!, xL: "a", yL: "b" }];
    case "losange":
      return [{ type: "point", nom: C, label: `Coordonnées de ${C}`, x: (v) => v.a! + v.b!, y: (v) => v.c!, xL: "a+b", yL: "c" }];
  }
}

/** Champs de l'écran « calcul ». */
export function champsCalcul(e: Exercice123): Champ123[] {
  const [A, B, C, D] = e.noms;
  switch (e.support) {
    case "parallelogramme":
      return [
        { type: "point", nom: `milieu [${A}${C}]`, label: `Milieu de [${A}${C}]`, x: (v) => v.a! + v.b!, y: (v) => v.c!, xL: "a+b", yL: "c" },
        { type: "point", nom: `milieu [${B}${D}]`, label: `Milieu de [${B}${D}]`, x: (v) => v.a! + v.b!, y: (v) => v.c!, xL: "a+b", yL: "c" },
      ];
    case "medianes":
      return [
        { type: "point", nom: `G_${A}`, label: `Point aux deux tiers de [${A}${A}'] depuis ${A}`, x: (v) => (2 * v.a! + 2 * v.b!) / 3, y: (v) => (2 * v.c!) / 3, xL: "\\dfrac{2a+2b}{3}", yL: "\\dfrac{2c}{3}" },
        { type: "point", nom: `G_${B}`, label: `Point aux deux tiers de [${B}${B}'] depuis ${B}`, x: (v) => (2 * v.a! + 2 * v.b!) / 3, y: (v) => (2 * v.c!) / 3, xL: "\\dfrac{2a+2b}{3}", yL: "\\dfrac{2c}{3}" },
      ];
    case "varignon":
      return [
        { type: "point", nom: "\\vec{IJ}", label: "Composantes de IJ (vecteur)", x: (v) => v.b!, y: (v) => v.c!, xL: "b", yL: "c" },
        { type: "point", nom: "\\vec{LK}", label: "Composantes de LK (vecteur)", x: (v) => v.b!, y: (v) => v.c!, xL: "b", yL: "c" },
      ];
    case "rectangleMediane":
      return [
        { type: "expr", nom: `${A}M^2`, label: `${A}M²`, f: (v) => v.a! ** 2 + v.b! ** 2, fL: "a^2+b^2" },
        { type: "expr", nom: `${B}${C}^2`, label: `${B}${C}²`, f: (v) => 4 * v.a! ** 2 + 4 * v.b! ** 2, fL: "4a^2+4b^2" },
      ];
    case "losange":
      return [
        {
          type: "expr",
          nom: `x_{\\vec{${A}${C}}}\\,x_{\\vec{${B}${D}}}+y_{\\vec{${A}${C}}}\\,y_{\\vec{${B}${D}}}`,
          label: `Somme des produits des composantes de ${A}${C} et ${B}${D}`,
          f: (v) => (v.a! + v.b!) * (v.b! - v.a!) + v.c! * v.c!,
          fL: "b^2+c^2-a^2",
        },
      ];
  }
}
