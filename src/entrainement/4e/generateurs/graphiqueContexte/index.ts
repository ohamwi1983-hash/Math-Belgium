import type {
  AxeGraphique,
  ComparateurGraphique,
  CourbeGraphique,
  ExerciceGraphiqueContexte,
  IdContexteGraphique,
  PointCle,
  QuestionGraphique,
  TypeQuestionGraphique,
} from "../../core/graphiqueContexte.types";
import type { Morceau } from "../../core/inequation.types";
import {
  antecedentsSurPoints,
  extremumSurPoints,
  franchitHorsPointCle,
  intervallesVariationSurPoints,
  pentesPchip,
  solutionInequationSurPoints,
} from "../../moteur/courbeGraphiqueContexte";
import { TEXTES_CONTEXTES } from "./contextes";

/**
 * gen70 — Lire un graphique en contexte (4e, chapitre 3, processus TRANSFÉRER).
 *
 * Construction d'une courbe dont TOUTES les lectures demandées tombent sur la grille :
 * 1. une « forme » propre à la situation : points extrêmes (départ, sommets, creux, paliers, arrivée)
 *    sur des nœuds de la grille ;
 * 2. les niveaux k des questions d'antécédent et d'inéquation sont tirés parmi les graduations
 *    strictement comprises entre le minimum et le maximum, jamais à la hauteur d'un point extrême
 *    (pas de point isolé, pas de palier à la hauteur k, pas de tangence) ;
 * 3. sur chaque montée/descente qui passe par k, un point-clé est inséré EXACTEMENT à la hauteur k,
 *    sur une verticale de la grille : la courbe (monotone entre deux points-clés) ne franchit donc k
 *    qu'en des points de la grille — antécédents et bornes d'inéquation se lisent exactement ;
 * 4. l'image est demandée en un point-clé intérieur, les extremums sont des points-clés uniques.
 * Situations à tendance (café, bouquetins) : y = L + A·2^(−x/T), lectures aux multiples de T.
 *
 * Toujours 4 questions de types deux à deux distincts, dans un ordre tiré au hasard (l'écran
 * « quelle caractéristique ? » ne doit jamais être devinable à partir du rang de la question).
 */

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function choix<T>(liste: readonly T[]): T {
  return liste[Math.floor(Math.random() * liste.length)]!;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j]!, copie[i]!];
  }
  return copie;
}

const COMPARATEURS: ComparateurGraphique[] = [">=", ">", "<", "<="];

export const CATALOGUE_VARIANTES: { id: IdContexteGraphique; label: string }[] = (
  ["temperature", "piscine", "randonnee", "reservoir", "cycliste", "cafe", "population"] as IdContexteGraphique[]
).map((id) => ({ id, label: TEXTES_CONTEXTES[id].label }));

// ============================================================================
// Formes des situations « par points » (interpolation monotone ou segments)
// ============================================================================

interface FormeParPoints {
  courbe: "pchip" | "lineaire";
  extremes: PointCle[];
  axeX: AxeGraphique;
  axeY: AxeGraphique;
  naturesExtremum: ("max" | "min")[];
}

function axe(min: number, max: number, pas: number, pasEtiquette: number, nom: string, unite: string): AxeGraphique {
  return { min, max, pas, pasEtiquette, nom, unite };
}

function bornesAxeY(valeurs: number[], pasEtiquette: number, marge: number, plancher: number | null): { min: number; max: number } {
  const bas = Math.min(...valeurs) - marge;
  const haut = Math.max(...valeurs) + marge;
  const min = Math.floor(bas / pasEtiquette) * pasEtiquette;
  return { min: plancher === null ? min : Math.max(plancher, min), max: Math.ceil(haut / pasEtiquette) * pasEtiquette };
}

function formeTemperature(): FormeParPoints {
  const ete = Math.random() < 0.6;
  const ym = ete ? randInt(11, 16) : randInt(-6, -2);
  const yM = ym + randInt(8, 12);
  const y0 = ym + randInt(2, 4);
  let ye = ym + randInt(3, 6);
  if (ye === y0) ye += 1;
  const extremes = [
    { x: 0, y: y0 },
    { x: randInt(4, 6), y: ym },
    { x: randInt(13, 16), y: yM },
    { x: 24, y: ye },
  ];
  const { min, max } = bornesAxeY([ym, yM], 2, 2, null);
  return { courbe: "pchip", extremes, axeX: axe(0, 24, 1, 2, "heure", "h"), axeY: axe(min, max, 1, 2, "température", "°C"), naturesExtremum: ["max", "min"] };
}

function formePiscine(): FormeParPoints {
  const y0 = 20 * randInt(1, 3);
  let ye = 20 * randInt(1, 3);
  if (ye === y0) ye = y0 === 60 ? 20 : y0 + 20;
  const yM1 = 20 * randInt(8, 12);
  const ym = yM1 - 20 * randInt(3, 5);
  let yM2 = yM1 + 20 * choix([-3, -2, 2, 3]);
  if (yM2 > 280) yM2 = yM1 - 40;
  if (yM2 < ym + 40) yM2 = yM1 + 40;
  const extremes = [
    { x: 8, y: y0 },
    { x: randInt(10, 11), y: yM1 },
    { x: randInt(13, 14), y: ym },
    { x: randInt(16, 17), y: yM2 },
    { x: 20, y: ye },
  ];
  const { max } = bornesAxeY(extremes.map((p) => p.y), 40, 20, 0);
  return {
    courbe: "pchip",
    extremes,
    axeX: axe(8, 20, 1, 2, "heure", "h"),
    axeY: axe(0, max, 20, 40, "personnes", ""),
    naturesExtremum: ["max", "min"],
  };
}

function formeRandonnee(): FormeParPoints {
  const y0 = 50 * randInt(12, 18);
  const s1 = y0 + 50 * randInt(6, 10);
  const c = s1 - 50 * randInt(3, 5);
  let s2 = s1 + 50 * choix([-3, -2, 2, 3]);
  if (s2 < c + 100) s2 = s1 + 100;
  const ye = y0 + 50 * choix([-2, -1, 1, 2]);
  const extremes = [
    { x: 0, y: y0 },
    { x: randInt(4, 6), y: s1 },
    { x: randInt(8, 9), y: c },
    { x: randInt(11, 13), y: s2 },
    { x: 16, y: ye },
  ];
  const { min, max } = bornesAxeY(extremes.map((p) => p.y), 100, 50, 0);
  return { courbe: "pchip", extremes, axeX: axe(0, 16, 1, 2, "distance", "km"), axeY: axe(min, max, 50, 100, "altitude", "m"), naturesExtremum: ["max", "min"] };
}

function formeReservoir(): FormeParPoints {
  const yMax = 10 * randInt(15, 19);
  const y0 = yMax - 10 * randInt(4, 7);
  const yMin = 10 * randInt(3, 6);
  const ecart = (yMax - yMin) / 10;
  const yP = yMin + 10 * randInt(3, ecart - 3);
  let yQ = yMin + 10 * randInt(2, ecart - 2);
  if (yQ === yP) yQ = yP + 10 < yMax ? yP + 10 : yP - 10;
  const x1 = randInt(5, 6);
  const x2 = randInt(9, 10);
  const x3 = randInt(12, 13);
  const x4 = randInt(16, 17);
  const x5 = randInt(20, 21);
  const extremes = [
    { x: 0, y: y0 },
    { x: x1, y: yMax },
    { x: x2, y: yP },
    { x: x3, y: yP },
    { x: x4, y: yMin },
    { x: x5, y: yQ },
    { x: 24, y: yQ },
  ];
  const { max } = bornesAxeY([yMax], 20, 20, 0);
  return { courbe: "lineaire", extremes, axeX: axe(0, 24, 1, 2, "heure", "h"), axeY: axe(0, max, 10, 20, "volume", "m³"), naturesExtremum: ["max", "min"] };
}

function formeCycliste(): FormeParPoints {
  const v1 = 2 * randInt(10, 13);
  const vL = 2 * randInt(4, 7);
  const vMax = 2 * randInt(15, 18);
  const x1 = choix([15, 20]);
  const x2 = choix([30, 35]);
  const x3 = choix([45, 50]);
  const x4 = x3 + 10;
  const x5 = choix([70, 75]);
  const extremes = [
    { x: 0, y: 0 },
    { x: x1, y: v1 },
    { x: x2, y: v1 },
    { x: x3, y: vL },
    { x: x4, y: vL },
    { x: x5, y: vMax },
    { x: 90, y: 0 },
  ];
  return { courbe: "lineaire", extremes, axeX: axe(0, 90, 5, 10, "temps", "min"), axeY: axe(0, 40, 2, 4, "vitesse", "km/h"), naturesExtremum: ["max"] };
}

const FORMES_PAR_POINTS: Partial<Record<IdContexteGraphique, () => FormeParPoints>> = {
  temperature: formeTemperature,
  piscine: formePiscine,
  randonnee: formeRandonnee,
  reservoir: formeReservoir,
  cycliste: formeCycliste,
};

/**
 * Insère, sur chaque montée/descente stricte entre deux points extrêmes, un point-clé à chaque
 * hauteur requise qui s'y trouve strictement (+ parfois une graduation supplémentaire, pour varier
 * les points d'image), sur la verticale de grille la plus proche de la forme de référence (`abscisseReference`) — `null` s'il
 * n'y a pas assez de verticales libres.
 */
/**
 * Abscisse où une montée/descente de référence entre deux points extrêmes a et b atteint la hauteur v :
 * droite pour une courbe en segments ; demi-cosinus (départ et arrivée à plat, comme la pente nulle de
 * l'interpolation monotone en un sommet ou un creux) pour une courbe lisse. Les points-clés insérés
 * sont placés sur la verticale de grille la plus proche de cette abscisse : la courbe suit alors la
 * forme de référence au lieu de présenter des épaulements.
 */
function abscisseReference(a: PointCle, b: PointCle, v: number, lisse: boolean): number {
  const u = (v - a.y) / (b.y - a.y);
  const t = lisse ? Math.acos(1 - 2 * u) / Math.PI : u;
  return a.x + t * (b.x - a.x);
}

/** Écart (en pas de grille) entre cette abscisse et la verticale de grille la plus proche. */
function ecartReference(a: PointCle, b: PointCle, v: number, pasX: number, lisse: boolean): number {
  const x = abscisseReference(a, b, v, lisse);
  return Math.abs(x / pasX - Math.round(x / pasX));
}

/** Somme des écarts sur toutes les montées/descentes qui franchissent k — plus elle est petite, moins
 * les points-clés insérés déforment la courbe. */
function deformation(extremes: PointCle[], k: number, pasX: number, lisse: boolean): number {
  let total = 0;
  for (let i = 0; i < extremes.length - 1; i++) {
    const a = extremes[i]!;
    const b = extremes[i + 1]!;
    if ((a.y - k) * (b.y - k) < 0) total += ecartReference(a, b, k, pasX, lisse);
  }
  return total;
}

/** Tirage parmi les niveaux les moins déformants (le tiers le meilleur, au moins un). */
function choixPeuDeformant(niveaux: number[], extremes: PointCle[], pasX: number, lisse: boolean): number {
  const d = (k: number) => deformation(extremes, k, pasX, lisse);
  const tries = [...niveaux].sort((u, v) => d(u) - d(v));
  const seuil = d(tries[Math.max(0, Math.ceil(tries.length / 3) - 1)]!);
  return choix(tries.filter((k) => d(k) <= seuil + 1e-9));
}

function insererPointsCles(
  extremes: PointCle[],
  requises: number[],
  pasX: number,
  pasY: number,
  probaSupplementaire: number,
  lisse: boolean,
): PointCle[] | null {
  const resultat: PointCle[] = [extremes[0]!];
  for (let i = 0; i < extremes.length - 1; i++) {
    const a = extremes[i]!;
    const b = extremes[i + 1]!;
    if (a.y !== b.y) {
      const bas = Math.min(a.y, b.y);
      const haut = Math.max(a.y, b.y);
      const valeurs = requises.filter((v) => v > bas && v < haut);
      if (Math.random() < probaSupplementaire) {
        const candidates: number[] = [];
        for (let v = bas + pasY; v < haut; v += pasY) {
          if (valeurs.includes(v) || requises.includes(v)) continue;
          // Un point supplémentaire seulement s'il tombe (presque) sur la forme de référence : aucune
          // cassure gratuite sur une courbe en segments, aucun épaulement sur une courbe lisse.
          if (ecartReference(a, b, v, pasX, lisse) > (lisse ? 0.2 : 1e-9)) continue;
          candidates.push(v);
        }
        if (candidates.length > 0) valeurs.push(choix(candidates));
      }
      valeurs.sort((u, v) => (b.y > a.y ? u - v : v - u));
      const premier = a.x + pasX;
      const dernier = b.x - pasX;
      const positions = valeurs.map((v) => Math.round(abscisseReference(a, b, v, lisse) / pasX) * pasX);
      for (let j = 0; j < positions.length; j++) positions[j] = Math.max(positions[j]!, j === 0 ? premier : positions[j - 1]! + pasX);
      for (let j = positions.length - 1; j >= 0; j--) positions[j] = Math.min(positions[j]!, j === positions.length - 1 ? dernier : positions[j + 1]! - pasX);
      for (let j = 0; j < positions.length; j++) {
        const x = positions[j]!;
        if (x < premier || x > dernier || (j > 0 && x <= positions[j - 1]!)) return null;
        // Point repoussé loin de la forme de référence (verticales trop peu nombreuses) : la courbe
        // présenterait une cassure ou un épaulement visible — on retire une autre forme.
        if (Math.abs(x - abscisseReference(a, b, valeurs[j]!, lisse)) > (lisse ? 0.4 : 0.5) * pasX) return null;
        resultat.push({ x, y: valeurs[j]! });
      }
    }
    resultat.push(b);
  }
  return resultat;
}

const TYPES_PAR_POINTS: TypeQuestionGraphique[] = ["image", "antecedent", "inequation", "extremum", "variation"];

/** `types` est tiré UNE fois par exercice, avant les essais : un rejet (verticales insuffisantes…)
 * retire une nouvelle forme, jamais un nouveau jeu de questions — sinon les types les plus exigeants
 * seraient sous-représentés. */
function construireParPoints(contexte: IdContexteGraphique, forme: FormeParPoints, types: TypeQuestionGraphique[]): ExerciceGraphiqueContexte | null {
  const { extremes, axeX, axeY } = forme;

  const valeursExtremes = new Set(extremes.map((p) => p.y));
  const yMin = Math.min(...valeursExtremes);
  const yMax = Math.max(...valeursExtremes);
  const candidats: number[] = [];
  for (let v = yMin + axeY.pas; v < yMax; v += axeY.pas) if (!valeursExtremes.has(v)) candidats.push(v);
  if (candidats.length < 2) return null;

  const nbFranchissements = (k: number) => extremes.slice(0, -1).filter((a, i) => (a.y - k) * (extremes[i + 1]!.y - k) < 0).length;
  let kA: number | null = null;
  if (types.includes("antecedent")) {
    const multiples = candidats.filter((k) => nbFranchissements(k) >= 2);
    kA = choixPeuDeformant(multiples.length > 0 && Math.random() < 0.75 ? multiples : candidats, extremes, axeX.pas, forme.courbe === "pchip");
  }
  let kI: number | null = null;
  if (types.includes("inequation")) {
    const restants = candidats.filter((k) => k !== kA && Math.abs(k - (kA ?? Infinity)) >= 2 * axeY.pas);
    if (restants.length === 0) return null;
    kI = choixPeuDeformant(restants, extremes, axeX.pas, forme.courbe === "pchip");
  }
  const requises = [kA, kI].filter((k): k is number => k !== null);
  const points = insererPointsCles(extremes, requises, axeX.pas, axeY.pas, forme.courbe === "pchip" ? 0.6 : 0.5, forme.courbe === "pchip");
  if (!points) return null;
  if (requises.some((k) => franchitHorsPointCle(points, k))) return null;

  const courbe: CourbeGraphique = forme.courbe === "pchip" ? { type: "pchip", points, pentes: pentesPchip(points) } : { type: "lineaire", points };

  const questions: QuestionGraphique[] = [];
  let extremumPoint: PointCle | null = null;
  let antecedents: number[] = [];
  for (const type of types) {
    if (type === "antecedent") {
      const solutions = antecedentsSurPoints(points, kA!);
      // Jamais d'antécédent numériquement égal à k : la confusion image/antécédent doit rester visible.
      if (!solutions || solutions.length === 0 || solutions.includes(kA!)) return null;
      antecedents = solutions;
      questions.push({ type, k: kA!, solutions });
    } else if (type === "inequation") {
      const comparateur = choix(COMPARATEURS);
      const solution = solutionInequationSurPoints(points, kI!, comparateur);
      if (!solution || solution.length === 0) return null;
      questions.push({ type, k: kI!, comparateur, solution });
    } else if (type === "extremum") {
      const nature = choix(forme.naturesExtremum);
      const p = extremumSurPoints(points, nature);
      if (!p) return null;
      extremumPoint = p;
      questions.push({ type, nature, x: p.x, y: p.y });
    } else if (type === "variation") {
      const sens = Math.random() < 0.5 ? "croissante" : "decroissante";
      const intervalles = intervallesVariationSurPoints(points, sens);
      if (intervalles.length === 0) return null;
      questions.push({ type, sens, intervalles });
    }
  }
  if (types.includes("image")) {
    const interieurs = points.slice(1, -1).filter(
      (p) =>
        p.x !== extremumPoint?.x &&
        p.y !== p.x &&
        !antecedents.includes(p.x) &&
        p.y !== kA &&
        p.y !== kI &&
        p.y !== extremumPoint?.y &&
        !questions.some((q) => q.type === "inequation" && q.solution.some((m) => m.borneGauche === p.x || m.borneDroite === p.x)),
    );
    if (interieurs.length === 0) return null;
    const p = choix(interieurs);
    questions.push({ type: "image", x: p.x, y: p.y });
  }
  return { contexte, courbe, axeX, axeY, questions: melanger(questions) };
}

// ============================================================================
// Situations à tendance : y = L + A·2^(−x/T)
// ============================================================================

function construireSaturation(contexte: "cafe" | "population"): ExerciceGraphiqueContexte {
  const cafe = contexte === "cafe";
  const T = cafe ? choix([4, 5, 6]) : choix([2, 3]);
  const L = cafe ? choix([16, 20, 24]) : choix([180, 200, 220]);
  const A = cafe ? 64 : -160;
  /** Niveaux lisibles exactement (sur la grille) : x = jT, j = 0…4 (café) ou 0…3 (bouquetins). */
  const jMax = cafe ? 4 : 3;
  const points: PointCle[] = [];
  for (let j = 0; j <= jMax; j++) points.push({ x: j * T, y: L + A / 2 ** j });
  const xMax = 8 * T;
  const axeX = axe(0, xMax, T, T, "temps", cafe ? "min" : "ans");
  const axeY = cafe
    ? axe(0, Math.ceil((L + 68) / 8) * 8, 4, 8, "température", "°C")
    : axe(0, Math.ceil((L + 20) / 40) * 40, 20, 40, "bouquetins", "");
  const courbe: CourbeGraphique = { type: "saturation", L, A, T, points };

  const autres: TypeQuestionGraphique[] = ["image", "antecedent", "inequation", "extremum"];
  const exclu = choix(autres);
  const types: TypeQuestionGraphique[] = [...autres.filter((t) => t !== exclu), "tendance"];
  const niveaux = melanger(Array.from({ length: jMax }, (_, i) => i + 1));
  const questions: QuestionGraphique[] = [];
  for (const type of types) {
    if (type === "image") {
      const j = niveaux.pop()!;
      questions.push({ type, x: j * T, y: L + A / 2 ** j });
    } else if (type === "antecedent") {
      const j = niveaux.pop()!;
      questions.push({ type, k: L + A / 2 ** j, solutions: [j * T] });
    } else if (type === "inequation") {
      const j = niveaux.pop()!;
      const comparateur = choix(COMPARATEURS);
      const xk = j * T;
      // café : décroissante ; bouquetins : croissante.
      const auDessusAvant = cafe;
      const veutAuDessus = comparateur === ">=" || comparateur === ">";
      const large = comparateur === ">=" || comparateur === "<=";
      const avant = auDessusAvant === veutAuDessus;
      const solution: Morceau[] = avant
        ? [{ crochetGauche: "[", borneGauche: 0, crochetDroit: large ? "]" : "[", borneDroite: xk }]
        : [{ crochetGauche: large ? "[" : "]", borneGauche: xk, crochetDroit: "]", borneDroite: xMax }];
      questions.push({ type, k: L + A / 2 ** j, comparateur, solution });
    } else if (type === "extremum") {
      questions.push({ type, nature: cafe ? "max" : "min", x: 0, y: L + A });
    } else if (type === "tendance") {
      questions.push({ type, L });
    }
  }
  return { contexte, courbe, axeX, axeY, questions: melanger(questions) };
}

// ============================================================================
// Points d'entrée
// ============================================================================

export function construireAvecVarianteId(id: IdContexteGraphique): ExerciceGraphiqueContexte {
  if (id === "cafe" || id === "population") {
    // Même règle que pour les situations par points : jamais une image égale à son abscisse ni un
    // antécédent égal à son niveau (la confusion image/antécédent doit rester visible).
    for (;;) {
      const exercice = construireSaturation(id);
      const ambigu = exercice.questions.some((q) => (q.type === "image" && q.x === q.y) || (q.type === "antecedent" && q.solutions.includes(q.k)));
      if (!ambigu) return exercice;
    }
  }
  const forme = FORMES_PAR_POINTS[id]!;
  const exclu = choix(TYPES_PAR_POINTS);
  const types = TYPES_PAR_POINTS.filter((t) => t !== exclu);
  for (let essai = 0; essai < 500; essai++) {
    const exercice = construireParPoints(id, forme(), types);
    if (exercice) return exercice;
  }
  throw new Error(`gen70 : aucune instance trouvée pour ${id}`);
}

export function genererExerciceGraphiqueContexte(): ExerciceGraphiqueContexte {
  return construireAvecVarianteId(choix(CATALOGUE_VARIANTES).id);
}
