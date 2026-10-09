import type { CandidatDeriveeLogA, CandidatDeriveeLogB, CandidatDeriveeLogC, ExerciceGraphiqueDeriveeLogarithme } from "../core6e/graphiqueDeriveeLogarithme.types";
import type { ResultatExerciceGraphiqueDeriveeLogarithme } from "../moteur6e/typesGraphiqueDeriveeLogarithme";
import { assurerAxesVisibles } from "../ui/mafsTransformation";

/**
 * Couche présentation (6e) — formatage LaTeX, évaluation des 4 candidats (pour le rendu Mafs) et
 * textes de consigne/aide pour `6gen20`. Consigne générale et bloc de données (f(x)) redondants
 * sur chaque écran. Chaque aide porteuse de formule utilise le motif `{texte, latex}` — jamais du
 * LaTeX brut mêlé au texte (convention établie ailleurs sur ce chantier, voir CLAUDE.md).
 */
export const CONSIGNE_GENERALE = "Voici l'expression d'une fonction f.";

export interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

// ============================================================================
// Formatage LaTeX de f(x) — jamais de coefficient ±1 littéral affiché.
// ============================================================================

/** `""`/`"-"`/`"2"` — jamais un coefficient `±1` littéral, pour préfixer un corps de formule. */
function formatCoefLatex(k: number): string {
  if (k === 1) return "";
  if (k === -1) return "-";
  return `${k}`;
}

export function formatFonctionLatex(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  switch (exercice.famille) {
    case "A": {
      const logPart = exercice.baseEstE ? "\\ln(x)" : `\\log_{${exercice.base}}(x)`;
      return `f(x) = \\dfrac{${formatCoefLatex(exercice.k)}${logPart}}{x}`;
    }
    case "B":
      return `f(x) = ${formatCoefLatex(exercice.k)}\\,e^{x}\\ln(x)`;
    case "C":
      return `f(x) = ${formatCoefLatex(exercice.k)}\\,x\\ln(x)`;
  }
}

/** Formule CORRECTE de f'(x), utilisée par le récapitulatif final. Reconstruite directement depuis
 * les paramètres BRUTS de l'exercice (`k`/`base`/`baseEstE`) — même principe que
 * `moteur6e/verificationGraphiqueDeriveeLogarithme.ts::referenceXDerivee`, jamais depuis la réponse
 * élève. */
export function formatDeriveeCorrecteLatex(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  switch (exercice.famille) {
    case "A": {
      const numerateur = `${formatCoefLatex(exercice.k)}\\left(1-\\ln(x)\\right)`;
      const denominateur = exercice.baseEstE ? "x^{2}" : `x^{2}\\ln(${exercice.base})`;
      return `f'(x) = \\dfrac{${numerateur}}{${denominateur}}`;
    }
    case "B":
      return `f'(x) = ${formatCoefLatex(exercice.k)}\\,e^{x}\\left(\\ln(x)+\\dfrac{1}{x}\\right)`;
    case "C":
      return `f'(x) = ${formatCoefLatex(exercice.k)}\\left(\\ln(x)+1\\right)`;
  }
}

// ============================================================================
// Évaluation des candidats — utilisée pour le tracé Mafs de chacune des 4 options. Chaque
// distracteur est une VRAIE fonction renvoyable, jamais une astuce de rendu déconnectée des
// données (voir l'en-tête de `core6e/graphiqueDeriveeLogarithme.types.ts` pour le détail de
// construction de chaque distracteur). Réimplémentation INDÉPENDANTE des références de
// `moteur6e/verificationGraphiqueDeriveeLogarithme.ts` (même formule "reel", jamais importée —
// même principe que `6gen8`).
// ============================================================================

export function evaluerCandidatA(c: CandidatDeriveeLogA, x: number): number | null {
  if (x <= 0) return null;
  const div = c.baseEstE ? 1 : Math.log(c.base);
  switch (c.type) {
    case "reel":
      return (c.k * (1 - Math.log(x))) / (x * x * div);
    case "signeInverse":
      return -(c.k * (1 - Math.log(x))) / (x * x * div);
    case "zeroMalPlace":
      return (c.k * (c.constanteNumerateur - Math.log(x))) / (x * x * div);
    case "monotone":
      return (c.k * (Math.log(x) - 1)) / div;
  }
}

export function evaluerCandidatB(c: CandidatDeriveeLogB, x: number): number | null {
  if (x <= 0) return null;
  switch (c.type) {
    case "reel":
      return c.k * Math.exp(x) * (Math.log(x) + 1 / x);
    case "signeInverse":
      return -c.k * Math.exp(x) * (Math.log(x) + 1 / x);
    case "traverseZero":
      return c.k * Math.exp(x) * Math.log(x);
    case "borneMauvaise":
      return c.k * (Math.log(x) + 1 / x);
  }
}

export function evaluerCandidatC(c: CandidatDeriveeLogC, x: number): number | null {
  if (x <= 0) return null;
  switch (c.type) {
    case "reel":
      return c.k * (Math.log(x) + 1);
    case "signeInverse":
      return -c.k * (Math.log(x) + 1);
    case "zeroMalPlace":
      return c.k * (Math.log(x) + c.constanteAdditive);
    case "formeEnPic":
      return (c.k * (1 - Math.log(x))) / (x * x);
  }
}

export function evaluerCandidat(exercice: ExerciceGraphiqueDeriveeLogarithme, index: number, x: number): number | null {
  switch (exercice.famille) {
    case "A":
      return evaluerCandidatA(exercice.candidats[index], x);
    case "B":
      return evaluerCandidatB(exercice.candidats[index], x);
    case "C":
      return evaluerCandidatC(exercice.candidats[index], x);
  }
}

// ============================================================================
// Fenêtre d'affichage commune aux 4 options — MÊME échelle sur les 4 (contrainte impérative,
// jamais dérivée du domaine du seul candidat réel, qui peut différer d'un distracteur à l'autre).
// Domaine mathématique x>0 pour les 3 familles — fenêtre toujours strictement à droite de 0.
// ============================================================================

export interface ViewBoxGraphiqueDeriveeLogarithme {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function fenetreX(exercice: ExerciceGraphiqueDeriveeLogarithme): [number, number] {
  switch (exercice.famille) {
    case "A":
      // Zéro toujours en x=e≈2.72 ; "valeur élevée près de 0" (spec) visible dès 0.2, décroissance
      // franche visible jusqu'à x=7 (~2,6·e).
      return [0.2, 7];
    case "B":
      // ln(x)+1/x minimal en x=1 ; comportement aux 2 bornes (x→0+ ET x→+∞, tous deux vers +∞ en
      // magnitude, spec) visible sur une fenêtre resserrée (croissance/décroissance très rapide).
      return [0.08, 2.3];
    case "C":
      // Zéro toujours en x=1/e≈0.368 ; droite monotone, fenêtre symétrique autour de ce zéro.
      return [0.05, 2.6];
  }
}

/**
 * Plafond de magnitude Y utilisé pour le calcul d'ÉCHELLE, PAR FAMILLE — une valeur qui le dépasse
 * est ignorée du calcul d'étendue Y (elle reste TRACÉE, `Plot.OfX` la porte simplement hors du
 * cadre visible ; seule sa contribution au calcul d'échelle est exclue). Même mécanisme que
 * `formatGraphiquesDeriveeExponentielles.ts` (6gen8) — un plafond sur la VALEUR (jamais sur une
 * distance) s'est révélé le seul mécanisme fiable là-bas pour éviter qu'une poignée de valeurs
 * extrêmes (ici : près de x→0⁺, où 1/x²/1/x divergent) n'écrase visuellement toute la fenêtre.
 */
const PLAFOND_STATS: Record<ExerciceGraphiqueDeriveeLogarithme["famille"], number> = {
  A: 20,
  B: 40,
  C: 10,
};

/** Densité de grille cible, partagée avec `GrapheOptionDeriveeLogarithme.tsx` (`GrilleAdaptative`)
 * — voir `CIBLE_NOMBRE_LIGNES_QCM` de `ui6e/formatGraphiquesCyclometriques.ts` (même rôle, même
 * précaution de synchronisation) pour la justification complète. */
export const CIBLE_NOMBRE_LIGNES_QCM = 6;

/** Composition finale du viewBox — voir `finaliserViewBox` de
 * `ui6e/formatGraphiquesCyclometriques.ts` pour la justification complète (`ratio=1` : conteneur
 * CARRÉ, jamais `RATIO_GRAPHE`). */
function finaliserViewBox(x: [number, number], y: [number, number]): ViewBoxGraphiqueDeriveeLogarithme {
  const { x: xFinal, y: yFinal } = assurerAxesVisibles({ x, y });
  return { xMin: xFinal[0], xMax: xFinal[1], yMin: yFinal[0], yMax: yFinal[1] };
}

/** Calcule la fenêtre d'affichage commune aux 4 candidats d'une instance — même échelle imposée
 * (contrainte de la spec). */
export function calculerViewBoxGraphique(exercice: ExerciceGraphiqueDeriveeLogarithme): ViewBoxGraphiqueDeriveeLogarithme {
  const [xMin, xMax] = fenetreX(exercice);
  const plafond = PLAFOND_STATS[exercice.famille];
  const valeurs: number[] = [];
  for (let index = 0; index < exercice.candidats.length; index++) {
    for (let i = 0; i <= 80; i++) {
      const x = xMin + ((xMax - xMin) * i) / 80;
      const y = evaluerCandidat(exercice, index, x);
      if (y === null || !Number.isFinite(y)) continue;
      if (Math.abs(y) > plafond) continue;
      valeurs.push(y);
    }
  }
  if (valeurs.length === 0) return finaliserViewBox([xMin, xMax], [-1, 1]);
  const yMinBrut = Math.min(...valeurs);
  const yMaxBrut = Math.max(...valeurs);
  const marge = Math.max(0.4, (yMaxBrut - yMinBrut) * 0.15);
  return finaliserViewBox([xMin, xMax], [yMinBrut - marge, yMaxBrut + marge]);
}

// ============================================================================
// Bloc "état actuel" — écran "selection" uniquement (2e et dernier écran, CLAUDE.md : consigne
// générale → bloc données → bloc "état actuel" → bloc de travail). Réutilise TEL QUEL
// `formatDeriveeCorrecteLatex` — dérivé uniquement des paramètres bruts de l'exercice, jamais de
// la saisie élève à l'écran "derivee". `null` sur l'écran "derivee" (1er écran, rien à rappeler).
// Même convention que `etatActuel` de 6gen13/6gen16.
// ============================================================================

export function etatActuelSelection(exercice: ExerciceGraphiqueDeriveeLogarithme): string[] {
  return [formatDeriveeCorrecteLatex(exercice)];
}

// ============================================================================
// Consignes/aides — 2 niveaux par écran, spec explicite pour chaque famille.
// ============================================================================

export function consigneEcranDerivee(): string {
  return "Calcule f'(x).";
}

export function consigneEcranSelection(): string {
  return "Sélectionne le graphique qui représente f'(x).";
}

export function placeholderDerivee(exercice: ExerciceGraphiqueDeriveeLogarithme): string {
  switch (exercice.famille) {
    case "A":
      return exercice.baseEstE ? "ex : 2*(1-ln(x))/x^2" : `ex : 2*(1-ln(x))/(x^2*ln(${exercice.base}))`;
    case "B":
      return "ex : 2*e^x*(ln(x)+1/x)";
    case "C":
      return "ex : 2*(ln(x)+1)";
  }
}

export function aideDeriveeNiveau1(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return {
        texte: "Rappel de la règle du quotient, appliquée à ln(x)/x — pense ensuite à diviser le tout par ln(base) (sauf si base=e) :",
        latex: "\\left(\\dfrac{u}{v}\\right)' = \\dfrac{u'v-uv'}{v^2}, \\quad u=\\ln(x),\\ v=x",
      };
    case "B":
      return {
        texte: "Rappel de la règle du produit, combinée à la dérivée de ln(x) :",
        latex: "(uv)' = u'v+uv', \\quad u=e^{x},\\ v=\\ln(x),\\ v'=\\dfrac{1}{x}",
      };
    case "C":
      return {
        texte: "Rappel de la règle du produit, appliquée à x·ln(x) :",
        latex: "(uv)' = u'v+uv', \\quad u=x,\\ v=\\ln(x)",
      };
  }
}

export function aideDeriveeNiveau2(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return {
        texte: "Numérateur de la règle du quotient, AVANT simplification (u=ln(x), v=x) :",
        latex: "u'v - uv' = \\dfrac{1}{x}\\cdot x - \\ln(x)\\cdot 1",
      };
    case "B":
      return {
        texte: "Les deux termes de la règle du produit, séparément — non encore combinés :",
        latex: "u'v = e^{x}\\ln(x), \\quad uv' = e^{x}\\cdot\\dfrac{1}{x}",
      };
    case "C":
      return {
        texte: "Les deux termes de la règle du produit, affichés — simplification non faite :",
        latex: "u'v = 1\\cdot\\ln(x), \\quad uv' = x\\cdot\\dfrac{1}{x}",
      };
  }
}

export function aideSelectionNiveau1(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A":
      return { texte: "Le zéro de cette dérivée est TOUJOURS en x=e, quels que soient k et la base — et sa courbe n'est PAS monotone (elle forme un pic).", latex: null };
    case "B":
      return { texte: "ln(x)+1/x reste TOUJOURS ≥1 pour x>0 (jamais nul, jamais négatif) — le signe de f' dépend donc uniquement du signe de k.", latex: null };
    case "C":
      return {
        texte: "Le zéro de cette dérivée est TOUJOURS en x=1/e, quel que soit k — et, contrairement à la famille k·log_base(x)/x, cette courbe est monotone (une droite croissante ou décroissante, jamais un pic).",
        latex: null,
      };
  }
}

export function aideSelectionNiveau2(exercice: ExerciceGraphiqueDeriveeLogarithme): AideAvecLatex {
  switch (exercice.famille) {
    case "A": {
      const avant = exercice.k > 0 ? "positif" : "négatif";
      const apres = exercice.k > 0 ? "négatif" : "positif";
      return { texte: `Avant x=e (par exemple en x=1), f' est ${avant} ; après x=e (par exemple en x=e²), f' est ${apres}.`, latex: null };
    }
    case "B":
      return { texte: "La valeur minimale de ln(x)+1/x est exactement 1, atteinte en x=1 :", latex: "\\ln(1)+\\dfrac{1}{1} = 1" };
    case "C": {
      const sens = exercice.k > 0 ? "croissante" : "décroissante";
      return { texte: `f'(x) = k·(ln(x)+1) est croissante si k>0, décroissante si k<0. Ici, f' est ${sens}.`, latex: null };
    }
  }
}

/**
 * Total points du récapitulatif final — complément AJOUTÉ à côté de la liste `LigneRecap` colorée
 * (jamais à sa place). Somme les scores DÉJÀ calculés par `sessionGraphiqueDeriveeLogarithme.ts`
 * (pénalité par tentative + par niveau d'aide déjà appliquée, forcé à 0 sur révélation) — les 3
 * familles traversent TOUJOURS les 2 écrans (contrairement à `6gen8`), `maximum` vaut donc toujours
 * `200`.
 */
export function calculerTotalRecapGraphiqueDeriveeLogarithme(resultat: ResultatExerciceGraphiqueDeriveeLogarithme): { total: number; maximum: number } {
  return { total: resultat.scoreDerivee + resultat.scoreSelection, maximum: 200 };
}
