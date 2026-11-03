import type { ExerciceDeterminerParametresLogarithme } from "../core6e/determinerParametresLogarithme.types";
import type { PhaseDeterminerParametresLogarithme } from "../moteur6e/typesDeterminerParametresLogarithme";

/**
 * Textes, aides et formatage LaTeX pour `6gen18` (f(x) = a + b·ln(x) depuis un graphique). Les aides
 * suivent la décomposition du générateur (voir `core6e/determinerParametresLogarithme.types.ts`) :
 * niveau 1 = la propriété à mobiliser, niveau 2 = la méthode appliquée au graphique — jamais la
 * valeur finale de a, de b ou de f(x).
 */

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

/** Fragment de consigne mixant prose française et LaTeX inline (`components/RenduFragments.tsx`). */
export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

function texte(valeur: string): FragmentConsigne {
  return { type: "texte", valeur };
}

function latex(valeur: string): FragmentConsigne {
  return { type: "latex", valeur };
}

export const LIBELLE_PHASE: Record<PhaseDeterminerParametresLogarithme, string> = {
  lireA: "Valeur de a",
  equationB: "Équation en b",
  fonction: "Expression de f(x)",
};

// ============================================================================
// Géométrie de la figure (partagée par le graphe interactif et l'export).
// ============================================================================

export function evaluerF(exercice: ExerciceDeterminerParametresLogarithme, x: number): number {
  return exercice.a + exercice.b * Math.log(x);
}

/** Abscisse de la seconde marque : e, e², ou 1 (point de contact de la tangente). */
export function abscisseSecondeMarque(exercice: ExerciceDeterminerParametresLogarithme): number {
  if (exercice.variante === "pointE") return Math.E;
  if (exercice.variante === "pointE2") return Math.E * Math.E;
  return 1;
}

/** Ordonnée lue sur le graphique au point d'abscisse e (resp. e²) : a + b (resp. a + 2b). */
export function ordonneeSecondeMarque(exercice: ExerciceDeterminerParametresLogarithme): number {
  if (exercice.variante === "pointE") return exercice.a + exercice.b;
  if (exercice.variante === "pointE2") return exercice.a + 2 * exercice.b;
  return exercice.a;
}

export interface CadreGraphe {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

/** Cadre ENTIER (quadrillage d'unité 1) contenant les deux marques, la tangente lisible entre x = 0
 * et x = 2, et au moins 2 unités de marge verticale. */
export function cadreGraphe(exercice: ExerciceDeterminerParametresLogarithme): CadreGraphe {
  const xMax = exercice.variante === "pointE2" ? 8 : 4;
  const ordonnees = [0, exercice.a, ordonneeSecondeMarque(exercice), evaluerF(exercice, xMax)];
  if (exercice.variante === "pente") ordonnees.push(exercice.a - exercice.b, exercice.a + exercice.b);
  const yMin = Math.floor(Math.min(...ordonnees)) - 2;
  const yMax = Math.ceil(Math.max(...ordonnees)) + 2;
  return { xMin: -1, xMax, yMin, yMax };
}

/** Segment de tangente affiché (variante `pente`) : de x = 0 à x = 2,5, droite y = a + b(x − 1). */
export function segmentTangente(exercice: ExerciceDeterminerParametresLogarithme): [[number, number], [number, number]] {
  const y = (x: number) => exercice.a + exercice.b * (x - 1);
  return [
    [0, y(0)],
    [2.5, y(2.5)],
  ];
}

// ============================================================================
// Consignes.
// ============================================================================

export const CONSIGNE_GENERALE: FragmentConsigne[] = [
  texte("Le graphique est celui de "),
  latex("f(x) = a + b\\cdot\\ln(x)"),
  texte(", où a et b sont des nombres entiers. Retrouve a et b à partir du graphique."),
];

/** Description de ce que montre le graphique (bloc de données sous la figure ; aussi seule
 * description disponible dans un export Word/PDF, qui ne reçoit pas la figure). */
export function descriptionGraphique(exercice: ExerciceDeterminerParametresLogarithme, avecCoordonnees: boolean): FragmentConsigne[] {
  const p1 = exercice.lettrePoint1;
  const p2 = exercice.lettrePoint2;
  const coord1 = avecCoordonnees ? [texte(" a pour coordonnées "), latex(`(1\\,;\\,${exercice.a})`)] : [texte(" est le point de la courbe d'abscisse 1")];
  if (exercice.variante === "pente") {
    const tangente = avecCoordonnees
      ? [texte(" ; la tangente à la courbe en ce point passe aussi par "), latex(`(2\\,;\\,${exercice.a + exercice.b})`), texte(".")]
      : [texte(" ; la droite tracée en orange est la tangente à la courbe en ce point.")];
    return [texte(`${p1}`), ...coord1, ...tangente];
  }
  const abscisse = exercice.variante === "pointE" ? "e" : "e^2";
  const coord2 = avecCoordonnees
    ? [texte(` ; ${p2} a pour coordonnées `), latex(`(${abscisse}\\,;\\,${ordonneeSecondeMarque(exercice)})`), texte(".")]
    : [texte(` ; ${p2} est le point de la courbe d'abscisse `), latex(abscisse), texte(".")];
  return [texte(`${p1}`), ...coord1, ...coord2];
}

export function consigneEcran(phase: PhaseDeterminerParametresLogarithme, exercice: ExerciceDeterminerParametresLogarithme): FragmentConsigne[] {
  if (phase === "lireA") return [texte("Détermine la valeur de a à l'aide du graphique.")];
  if (phase === "equationB") {
    if (exercice.variante === "pente") return [texte("Traduis l'information donnée par la tangente en une équation d'inconnue b.")];
    return [texte(`Traduis l'information donnée par le point ${exercice.lettrePoint2} en une équation d'inconnue b.`)];
  }
  return [texte("Résous l'équation, puis écris l'expression complète de "), latex("f(x)"), texte(".")];
}

// ============================================================================
// Aides — jamais la valeur finale.
// ============================================================================

export function aideNiveau1(phase: PhaseDeterminerParametresLogarithme, exercice: ExerciceDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "lireA") return { texte: "Cherche la valeur de x pour laquelle le terme b·ln(x) disparaît.", latex: null };
  if (phase === "equationB") {
    if (exercice.variante === "pente") return { texte: "La pente de la tangente au point d'abscisse 1 est le nombre dérivé f′(1). Commence par dériver f :", latex: "f'(x) = \\dfrac{b}{x}" };
    return { texte: `Le point ${exercice.lettrePoint2} est sur la courbe : son ordonnée est l'image de son abscisse par f.`, latex: exercice.variante === "pointE" ? "f(e) = a + b\\cdot\\ln(e)" : "f(e^2) = a + b\\cdot\\ln(e^2)" };
  }
  return { texte: "Isole b dans l'équation de l'étape précédente.", latex: null };
}

export function aideNiveau2(phase: PhaseDeterminerParametresLogarithme, exercice: ExerciceDeterminerParametresLogarithme): AideAvecLatex {
  if (phase === "lireA") {
    return {
      texte: `Comme ln(1) = 0, f(1) = a : lis l'ordonnée du point ${exercice.lettrePoint1}, d'abscisse 1 (repérée en pointillé sur le graphique).`,
      latex: "f(1) = a + b\\cdot\\ln(1) = a",
    };
  }
  if (phase === "equationB") {
    if (exercice.variante === "pente") {
      return {
        texte: "Lis la pente sur le quadrillage : depuis le point de contact, avance d'une unité vers la droite et compte de combien d'unités la tangente monte (ou descend). Cette pente est égale à :",
        latex: "f'(1) = \\dfrac{b}{1}",
      };
    }
    const n = exercice.variante === "pointE" ? "" : "2";
    return {
      texte: `${exercice.variante === "pointE" ? "ln(e) = 1" : "ln(e²) = 2"} : remplace a par sa valeur (étape 1) et f(${exercice.variante === "pointE" ? "e" : "e²"}) par l'ordonnée lue du point ${exercice.lettrePoint2}.`,
      latex: `a + ${n}b = \\text{ordonnée de } ${exercice.lettrePoint2}`,
    };
  }
  return { texte: "Remplace ensuite a et b par leurs valeurs, et vérifie avec les deux informations du graphique :", latex: "f(x) = a + b\\cdot\\ln(x)" };
}

// ============================================================================
// Réponses attendues (révélation, récapitulatif, corrigé).
// ============================================================================

function formatAPlusBLnX(a: number, b: number): string {
  const terme = b === 1 ? "\\ln(x)" : b === -1 ? "-\\ln(x)" : `${b}\\ln(x)`;
  if (a === 0) return terme;
  return b < 0 ? `${a} ${terme}` : `${a} + ${terme}`;
}

export function formatFonctionLatex(exercice: ExerciceDeterminerParametresLogarithme): string {
  return `f(x) = ${formatAPlusBLnX(exercice.a, exercice.b)}`;
}

/** Équation attendue de l'écran 2, avec a remplacé (une des formes acceptées). */
export function formatEquationBLatex(exercice: ExerciceDeterminerParametresLogarithme): string {
  const { a, b } = exercice;
  if (exercice.variante === "pente") return `f'(1) = \\dfrac{b}{1} = ${b} \\iff b = ${b}`;
  const y = ordonneeSecondeMarque(exercice);
  const coef = exercice.variante === "pointE" ? "" : "2";
  const ln = exercice.variante === "pointE" ? "\\ln(e)" : "\\ln(e^2)";
  const gauche = a === 0 ? `${coef}b` : `${a} + ${coef}b`;
  const gaucheComplete = a === 0 ? `b\\cdot${ln}` : `${a} + b\\cdot${ln}`;
  return `${gaucheComplete} = ${y} \\iff ${gauche} = ${y}`;
}

export function formatReponseAttenduePhaseLatex(exercice: ExerciceDeterminerParametresLogarithme, phase: PhaseDeterminerParametresLogarithme): string[] {
  if (phase === "lireA") return [`a = f(1) = ${exercice.a}`];
  if (phase === "equationB") return [formatEquationBLatex(exercice)];
  return [`b = ${exercice.b}`, formatFonctionLatex(exercice)];
}

// ============================================================================
// Placeholders — hors de l'espace des tirages (jamais une réponse acceptée).
// ============================================================================

export const PLACEHOLDERS: Record<PhaseDeterminerParametresLogarithme, string> = {
  lireA: "ex : 7",
  equationB: "ex : 2*b+1=10",
  fonction: "ex : 5+7*ln(x)",
};
